export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
export const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "qwen3-coder:30b";
export const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

export async function embedText(text) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, input: text }),
  });
  if (!res.ok) {
    throw new Error(`Ollama embed failed with status ${res.status}`);
  }
  const data = await res.json();
  const embedding = data.embeddings?.[0];
  if (!embedding) {
    throw new Error("Ollama returned no embedding");
  }
  return embedding;
}
