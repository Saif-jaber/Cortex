import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2.js";
import File from "../models/File.js";
import FileChunk from "../models/FileChunk.js";
import Folder from "../models/Folder.js";
import Chat from "../models/Chat.js";
import { streamChatCompletion, completeOnce, resolveEmbedder } from "../config/aiProviders.js";
import { getUserAiConfig } from "./aiController.js";
import { canExtract, extractText } from "../utils/textExtractor.js";

const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;
const TOP_K = 8;
const MAX_HISTORY = 10;

function chunkText(text) {
  const chunks = [];
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return chunks;
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + CHUNK_SIZE, cleaned.length);
    chunks.push(cleaned.slice(start, end));
    if (end >= cleaned.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

// Fallback retrieval when no embedding source is available (e.g. the user
// connected Anthropic or Groq and has no local Ollama running): score chunks
// by term overlap with the question.
function keywordScore(question, chunks) {
  const terms = [
    ...new Set(
      question
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 2)
    ),
  ];
  return chunks
    .map((chunk) => {
      const text = chunk.text.toLowerCase();
      let score = 0;
      for (const term of terms) {
        const matches = text.split(term).length - 1;
        if (matches > 0) score += 1 + Math.log(matches);
      }
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);
}

async function getObjectBuffer(fileKey) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
  });
  const response = await r2.send(command);
  return response.Body.transformToByteArray();
}

async function ensureIndexed(file, sendEvent, embedFn, embedSig) {
  const existing = await FileChunk.countDocuments({ file: file._id, owner: file.owner });
  if (existing > 0) return;
  if (!canExtract(file.fileType)) return;

  sendEvent({ type: "status", message: `Indexing ${file.fileName}...` });
  const buffer = await getObjectBuffer(file.fileKey);
  const text = await extractText(buffer, file.fileType);
  if (!text.trim()) return;

  const chunks = chunkText(text);
  for (let i = 0; i < chunks.length; i++) {
    const embedding = embedFn ? await embedFn(chunks[i]) : [];
    await FileChunk.create({
      file: file._id,
      owner: file.owner,
      fileName: file.fileName,
      index: i,
      text: chunks[i],
      embedding,
      embeddingModel: embedSig || "keyword",
    });
  }
}

function sourceType(fileType) {
  if (!fileType || fileType.includes("pdf")) return "pdf";
  return "word";
}

export async function listChats(req, res) {
  try {
    const chats = await Chat.find({ owner: req.user.id })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getChat(req, res) {
  try {
    const chatDoc = await Chat.findOne({ _id: req.params.id, owner: req.user.id });
    if (!chatDoc) return res.status(404).json({ error: "Chat not found" });
    res.json(chatDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createChat(req, res) {
  try {
    const chatDoc = await Chat.create({
      owner: req.user.id,
      title: req.body.title || "New chat",
      messages: [],
    });
    res.status(201).json(chatDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteChat(req, res) {
  try {
    const chatDoc = await Chat.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!chatDoc) return res.status(404).json({ error: "Chat not found" });
    res.json({ message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function chat(req, res) {
  const { question, chatId } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: "question is required" });
  }

  // Chat only works with a verified provider: an API key or a local model URL.
  const aiConfig = getUserAiConfig(req.user);
  if (!aiConfig) {
    return res.status(403).json({
      error: "No AI model connected. Open Settings → AI Model and connect an API key or local model first.",
    });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (payload) => {
    if (res.writableEnded) return;
    try {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      /* client disconnected */
    }
  };

  const controller = new AbortController();
  req.on("close", () => controller.abort());

  let answer = "";
  let savedSources = [];
  let chatIdToSend = null;
  let chatDoc = null;

  try {
    const files = await File.find({ owner: req.user.id }).sort({ createdAt: -1 });
    if (files.length === 0) {
      sendEvent({ type: "error", message: "No files in your knowledge base yet. Upload a file first." });
      return res.end();
    }

    const folders = await Folder.find({ owner: req.user.id });
    const folderNameById = new Map(folders.map((f) => [f._id.toString(), f.folderName]));

    // Pick the embedding source for this user's provider. When it differs
    // from what existing chunks were embedded with, wipe them so affected
    // files get re-indexed under the new model below.
    const embedder = await resolveEmbedder(aiConfig);
    const embedSig = embedder ? embedder.sig : "keyword";
    if (embedSig !== "keyword") {
      const staleQuery = { owner: req.user.id, $or: [{ embeddingModel: { $ne: embedSig } }, { embeddingModel: { $exists: false } }] };
      const staleCount = await FileChunk.countDocuments(staleQuery);
      if (staleCount > 0) {
        sendEvent({ type: "status", message: "Embedding model changed. Refreshing your knowledge base..." });
        await FileChunk.deleteMany(staleQuery);
      }
    }

    const unindexed = [];
    for (const file of files) {
      const existing = await FileChunk.countDocuments({ file: file._id, owner: file.owner });
      if (existing === 0 && canExtract(file.fileType)) unindexed.push(file);
    }

    for (let i = 0; i < unindexed.length; i++) {
      await ensureIndexed(unindexed[i], sendEvent, embedder?.embed, embedSig);
    }

    sendEvent({ type: "status", message: "Searching knowledge base..." });

    let scored;
    if (embedder) {
      const queryEmbedding = await embedder.embed(question);
      const chunks = await FileChunk.find({ owner: req.user.id });
      scored = chunks
        .map((c) => ({ chunk: c, score: cosineSimilarity(c.embedding, queryEmbedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_K);
    } else {
      const chunks = await FileChunk.find({ owner: req.user.id });
      scored = keywordScore(question, chunks);
    }

    const typeByName = new Map(files.map((f) => [f.fileName, f.fileType]));
    const folderByFileId = new Map(files.map((f) => [f._id.toString(), f.folder ? folderNameById.get(f.folder.toString()) : null]));

    function fileLabel(f) {
      const folder = f.folder ? folderNameById.get(f.folder.toString()) : null;
      return folder ? `${f.fileName} (in "${folder}")` : f.fileName;
    }

    const context = scored
      .map(({ chunk }) => {
        const folder = folderByFileId.get(chunk.file.toString());
        const loc = folder ? ` [${folder}]` : "";
        return `[Document: ${chunk.fileName}${loc}]\n${chunk.text}`;
      })
      .join("\n\n");

    const fileManifest = files.map((f, i) => `${i + 1}. ${fileLabel(f)}`).join("\n");

    if (chatId) {
      chatDoc = await Chat.findOne({ _id: chatId, owner: req.user.id });
      if (!chatDoc) {
        sendEvent({ type: "error", message: "Chat not found." });
        return res.end();
      }
    } else {
      chatDoc = await Chat.create({ owner: req.user.id, title: question.slice(0, 80), messages: [] });
      chatIdToSend = chatDoc._id.toString();
      sendEvent({ type: "chatId", chatId: chatIdToSend });
    }

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatDoc._id },
      {
        $push: { messages: { role: "user", content: question } },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    const history = updatedChat.messages.slice(-MAX_HISTORY).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const systemPrompt =
      "You are Cortex AI, a helpful and friendly assistant for a personal knowledge base.\n\n" +
      "HOW TO RESPOND:\n" +
      "- For greetings (hello, hi, hey, good morning, etc.), respond warmly and naturally. Introduce yourself briefly and ask how you can help. Do NOT mention files or the knowledge base.\n" +
      "- For casual conversation, small talk, or general questions not related to the documents, respond naturally and conversationally. Do NOT reference the file manifest or document excerpts.\n" +
      "- For questions about the user's documents, files, or knowledge base, use the document excerpts provided below to answer accurately.\n\n" +
      "KNOWLEDGE BASE RULES (only when answering document-related questions):\n" +
      "- Answer using the document excerpts provided below.\n" +
      "- The file manifest lists every file in the knowledge base, with folder locations in parentheses.\n" +
      "- When referencing a file, use its exact name from the manifest.\n" +
      "- If asked about files in a specific folder, filter the manifest by the folder name shown in parentheses.\n" +
      "- If the excerpts do not contain enough information, say so honestly. Do not guess or hallucinate.\n" +
      "- If asked to summarize or count files, work only from the manifest below, not from memory or assumptions.\n\n" +
      "FORMATTING:\n" +
      "- Use markdown headings (##, ###) to organize sections when the answer has multiple parts.\n" +
      "- Use **bold** for key terms, file names, or important values.\n" +
      "- Write short paragraphs for explanations, not just bullet lists.\n" +
      "- Use bullet points only for actual lists of items.\n" +
      "- Use numbered steps (1. 2. 3.) for sequential instructions or ordered information.\n" +
      "- Use > blockquotes for definitions, tips, or important callouts.\n" +
      "- Use `inline code` for file names, commands, or technical terms.\n" +
      "- Separate sections with a blank line for readability.";

    const contextBlock = context
      ? `\n\nFile manifest (${files.length} files):\n${fileManifest}\n\nDocument excerpts:\n${context}`
      : "";

    const messages = [
      { role: "system", content: systemPrompt + contextBlock },
      ...history,
      { role: "user", content: question },
    ];

    await streamChatCompletion(aiConfig, messages, controller.signal, (text) => {
      answer += text;
      sendEvent({ type: "delta", text });
    });

    const answerLower = answer.toLowerCase();
    const seen = new Set();
    for (const { chunk } of scored) {
      if (seen.has(chunk.fileName)) continue;
      const baseName = chunk.fileName.replace(/\.[^.]+$/, "").toLowerCase();
      if (answerLower.includes(chunk.fileName.toLowerCase()) || answerLower.includes(baseName)) {
        seen.add(chunk.fileName);
        savedSources.push({ name: chunk.fileName, type: sourceType(typeByName.get(chunk.fileName)) });
      }
    }
  } catch (err) {
    console.error("Chat error:", err);
    if (!answer) {
      answer = "Something went wrong while generating a response. Please try again.";
      sendEvent({ type: "error", message: err.message });
    }
  }

  if (chatDoc) {
    try {
      await Chat.updateOne(
        { _id: chatDoc._id },
        {
          $push: {
            messages: { role: "assistant", content: answer || "No response generated.", sources: savedSources },
          },
          $set: { updatedAt: new Date() },
        }
      );
    } catch (saveErr) {
      console.error("Failed to save assistant message:", saveErr);
    }
  }

  sendEvent({ type: "sources", sources: savedSources });
  sendEvent({ type: "done" });
  res.end();

  if (chatDoc && chatIdToSend) {
    completeOnce(aiConfig, [
      { role: "system", content: "Generate a short chat title (max 6 words) summarizing the user's question. Reply with ONLY the title, no quotes, no punctuation." },
      { role: "user", content: question },
    ])
      .then((title) => {
        const clean = title?.replace(/^["'#\s]+|["'\s]+$/g, "").slice(0, 80);
        if (clean) Chat.updateOne({ _id: chatDoc._id }, { $set: { title: clean } }).catch(() => {});
      })
      .catch(() => {});
  }
}
