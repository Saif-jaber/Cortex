import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2.js";
import File from "../models/File.js";
import FileChunk from "../models/FileChunk.js";
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

export async function chat(req, res) {
  const { question } = req.body;
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

  try {
    const files = await File.find({ owner: req.user.id }).sort({ createdAt: -1 });
    if (files.length === 0) {
      sendEvent({ type: "error", message: "No files in your knowledge base yet. Upload a file first." });
      return res.end();
    }

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

    const context = scored
      .map(({ chunk }) => `[Document: ${chunk.fileName}]\n${chunk.text}`)
      .join("\n\n");

    const chatDoc = await Chat.findOneAndUpdate(
      { owner: req.user.id },
      { $setOnInsert: { owner: req.user.id, messages: [] } },
      { new: true, upsert: true }
    );

    const history = chatDoc.messages.slice(-MAX_HISTORY).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const systemPrompt =
      "You are Cortex AI, an assistant for a personal knowledge base. " +
      "Answer the user's question using ONLY the document excerpts provided below. " +
      "If the answer is not in the excerpts, say you don't know based on the files. " +
      "Mention the source filename when you reference a document. Be concise.";

    const messages = [
      { role: "system", content: systemPrompt + (context ? `\n\nDocuments:\n${context}` : "") },
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
    let answer = "";

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
    const sources = [];
    for (const { chunk } of scored) {
      if (seen.has(chunk.fileName)) continue;
      seen.add(chunk.fileName);
      sources.push({ name: chunk.fileName, type: sourceType(typeByName.get(chunk.fileName)) });
    }

    await Chat.updateOne(
      { owner: req.user.id },
      {
        $push: {
          messages: [
            { role: "user", content: question },
            { role: "assistant", content: answer || "No response generated.", sources },
          ],
        },
      }
    );

    sendEvent({ type: "sources", sources });
    sendEvent({ type: "done" });
    res.end();
  } catch (err) {
    sendEvent({ type: "error", message: err.message });
    res.end();
  }
}
