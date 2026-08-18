import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2.js";
import File from "../models/File.js";
import FileChunk from "../models/FileChunk.js";
import Folder from "../models/Folder.js";
import Chat from "../models/Chat.js";
import { OLLAMA_BASE_URL, OLLAMA_CHAT_MODEL, embedText } from "../config/ollama.js";
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

async function getObjectBuffer(fileKey) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
  });
  const response = await r2.send(command);
  return response.Body.transformToByteArray();
}

async function ensureIndexed(file, sendEvent) {
  const existing = await FileChunk.countDocuments({ file: file._id, owner: file.owner });
  if (existing > 0) return;
  if (!canExtract(file.fileType)) return;

  sendEvent({ type: "status", message: `Indexing ${file.fileName}...` });
  const buffer = await getObjectBuffer(file.fileKey);
  const text = await extractText(buffer, file.fileType);
  if (!text.trim()) return;

  const chunks = chunkText(text);
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]);
    await FileChunk.create({
      file: file._id,
      owner: file.owner,
      fileName: file.fileName,
      index: i,
      text: chunks[i],
      embedding,
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

    for (const file of files) {
      await ensureIndexed(file, sendEvent);
    }

    const queryEmbedding = await embedText(question);

    const chunks = await FileChunk.find({ owner: req.user.id });
    const scored = chunks
      .map((c) => ({ chunk: c, score: cosineSimilarity(c.embedding, queryEmbedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K);

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
      "You are Cortex AI, an assistant for a personal knowledge base.\n\n" +
      "RULES:\n" +
      "- Answer using ONLY the document excerpts provided below.\n" +
      "- The file manifest lists every file relevant to this question, with folder locations in parentheses.\n" +
      "- When referencing a file, use its exact name from the manifest.\n" +
      "- If asked about files in a specific folder, filter the manifest by the folder name shown in parentheses.\n" +
      "- If the excerpts do not contain enough information, say so honestly. Do not guess or hallucinate.\n" +
      "- If asked to summarize or count files, work only from the manifest below — not from memory or assumptions.\n\n" +
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

    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_CHAT_MODEL,
        messages,
        stream: true,
        think: false,
      }),
    });
    if (!ollamaRes.ok || !ollamaRes.body) {
      throw new Error(`Ollama chat failed with status ${ollamaRes.status}`);
    }

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line) continue;
        let parsed;
        try {
          parsed = JSON.parse(line);
        } catch {
          continue;
        }
        const content = parsed.message?.content;
        if (content) {
          answer += content;
          sendEvent({ type: "delta", text: content });
        }
      }
    }

    const seen = new Set();
    for (const { chunk } of scored) {
      if (seen.has(chunk.fileName)) continue;
      seen.add(chunk.fileName);
      savedSources.push({ name: chunk.fileName, type: sourceType(typeByName.get(chunk.fileName)) });
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

  if (chatDoc && chatIdToSend) {
    try {
      const titleRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: OLLAMA_CHAT_MODEL,
          messages: [
            { role: "system", content: "Generate a short chat title (max 6 words) summarizing the user's question. Reply with ONLY the title, no quotes, no punctuation." },
            { role: "user", content: question },
          ],
          stream: false,
          think: false,
        }),
      });
      if (titleRes.ok) {
        const titleData = await titleRes.json();
        const title = titleData.message?.content?.trim().slice(0, 80);
        if (title) {
          await Chat.updateOne({ _id: chatDoc._id }, { $set: { title } });
          sendEvent({ type: "title", title });
        }
      }
    } catch {
      /* title generation is non-critical */
    }
  }

  sendEvent({ type: "sources", sources: savedSources });
  sendEvent({ type: "done" });
  res.end();
}
