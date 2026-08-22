import { OLLAMA_BASE_URL, embedText as ollamaEmbedText } from "./ollama.js";

// Registry of AI providers the user can connect to. `adapter` picks the wire
// protocol: "openai" covers every OpenAI-compatible API (including Ollama,
// LM Studio, vLLM, Groq, OpenRouter), "anthropic" and "gemini" have their own.
export const PROVIDERS = {
  openai: {
    label: "OpenAI",
    kind: "cloud",
    adapter: "openai",
    description: "GPT-4o, GPT-4.1 and friends",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    suggestedModels: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"],
    embedModel: "text-embedding-3-small",
    requiresKey: true,
    keyUrl: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    label: "Anthropic",
    kind: "cloud",
    adapter: "anthropic",
    description: "Claude Sonnet, Opus & Haiku",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-sonnet-4-20250514",
    suggestedModels: ["claude-sonnet-4-20250514", "claude-3-5-haiku-latest"],
    requiresKey: true,
    keyUrl: "https://console.anthropic.com/settings/keys",
  },
  google: {
    label: "Google Gemini",
    kind: "cloud",
    adapter: "gemini",
    description: "Gemini Flash & Pro models",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-2.0-flash",
    suggestedModels: ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro"],
    embedModel: "text-embedding-004",
    requiresKey: true,
    keyUrl: "https://aistudio.google.com/app/apikey",
  },
  groq: {
    label: "Groq",
    kind: "cloud",
    adapter: "openai",
    description: "Blazing-fast open models (Llama, Mixtral)",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    suggestedModels: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    requiresKey: true,
    keyUrl: "https://console.groq.com/keys",
  },
  openrouter: {
    label: "OpenRouter",
    kind: "cloud",
    adapter: "openai",
    description: "One key, access to hundreds of models",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    suggestedModels: ["openai/gpt-4o-mini", "anthropic/claude-3.5-sonnet", "meta-llama/llama-3.3-70b-instruct", "google/gemini-2.0-flash-001"],
    requiresKey: true,
    keyUrl: "https://openrouter.ai/settings/keys",
  },
  ollama: {
    label: "Ollama",
    kind: "local",
    adapter: "openai",
    description: "Run models privately on your own machine",
    defaultBaseUrl: "http://localhost:11434/v1",
    defaultModel: "",
    suggestedModels: ["llama3.2", "qwen2.5", "mistral", "phi4"],
    requiresKey: false,
    keyUrl: "https://ollama.com/download",
  },
  custom: {
    label: "Custom endpoint",
    kind: "custom",
    adapter: "openai",
    description: "Any OpenAI-compatible URL (LM Studio, vLLM…)",
    defaultBaseUrl: "",
    defaultModel: "",
    suggestedModels: [],
    requiresKey: false,
    keyUrl: null,
  },
};

export const PROVIDER_LIST = Object.entries(PROVIDERS).map(([id, def]) => ({
  id,
  label: def.label,
  kind: def.kind,
  adapter: def.adapter,
  description: def.description,
  requiresKey: def.requiresKey,
  defaultBaseUrl: def.defaultBaseUrl || "",
  defaultModel: def.defaultModel || "",
  suggestedModels: def.suggestedModels || [],
  keyUrl: def.keyUrl || null,
}));

// Builds the runtime config used by every adapter call. Fills in defaults,
// trims stray slashes and normalizes local/custom URLs to the /v1 root that
// OpenAI-compatible servers expose.
export function normalizeConfig({ provider, apiKey = "", baseUrl = "", model = "" }) {
  const def = PROVIDERS[provider];
  if (!def) return null;
  let url = (baseUrl || def.defaultBaseUrl || "").trim().replace(/\/+$/, "");
  if ((provider === "ollama" || provider === "custom") && url && !/\/v\d+$/.test(url)) {
    url = `${url}/v1`;
  }
  return {
    provider,
    label: def.label,
    kind: def.kind,
    adapter: def.adapter,
    requiresKey: !!def.requiresKey,
    apiKey: (apiKey || "").trim(),
    baseUrl: url,
    model: (model || "").trim() || def.defaultModel || "",
    embedModel: def.embedModel || null,
  };
}

function authHeadersFor(cfg, withAttribution = false) {
  const headers = { "Content-Type": "application/json" };
  if (cfg.adapter === "anthropic") {
    if (cfg.apiKey) headers["x-api-key"] = cfg.apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else if (cfg.adapter === "gemini") {
    if (cfg.apiKey) headers["x-goog-api-key"] = cfg.apiKey;
  } else if (cfg.apiKey) {
    headers.Authorization = `Bearer ${cfg.apiKey}`;
  }
  if (withAttribution) {
    headers["HTTP-Referer"] = "https://cortex.local";
    headers["X-Title"] = "Cortex";
  }
  return headers;
}

function reachabilityError(cfg) {
  let host = cfg.baseUrl;
  try {
    host = new URL(cfg.baseUrl).host;
  } catch {
    /* keep raw */
  }
  const hint =
    cfg.kind === "local"
      ? "Make sure your local model server is running and the URL is correct."
      : "Check the URL and your internet connection.";
  return new Error(`Couldn't reach ${host}. ${hint}`);
}

async function parseErrorDetail(res) {
  try {
    const data = await res.json();
    return data?.error?.message || data?.message || "";
  } catch {
    return "";
  }
}

async function assertOk(res, cfg) {
  if (res.ok) return;
  const detail = await parseErrorDetail(res);
  const suffix = detail ? ` ${detail}` : "";
  if (res.status === 401 || res.status === 403) {
    throw new Error(`${cfg.label} rejected this API key (${res.status}).${suffix}`);
  }
  if (res.status === 404) {
    throw new Error(`Model "${cfg.model}" was not found on ${cfg.label}.${suffix}`);
  }
  if (res.status === 429) {
    throw new Error(`${cfg.label} rate limit or quota exceeded.${suffix}`);
  }
  throw new Error(`${cfg.label} request failed (${res.status}).${suffix}`);
}

function extractModelIds(adapter, data) {
  if (!data) return [];
  if (adapter === "gemini") {
    return (data.models || []).map((m) => String(m.name || "").replace(/^models\//, "")).filter(Boolean);
  }
  return (data.data || data.models || []).map((m) => m.id || m.name).filter(Boolean);
}

async function probeOllamaNativeTags(baseUrl) {
  try {
    const origin = new URL(baseUrl).origin;
    const res = await fetch(`${origin}/api/tags`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.models || []).map((m) => m.name).filter(Boolean);
  } catch {
    return null;
  }
}

// Real credential check against the provider. Throws descriptive errors for
// bad keys, unreachable servers, etc. Returns the ids of models the account
// can access when the provider exposes them.
export async function verifyProviderConnection(providerId, { apiKey = "", baseUrl = "", model = "" } = {}) {
  const cfg = normalizeConfig({ provider: providerId, apiKey, baseUrl, model });
  if (!cfg) throw new Error("Unknown provider");
  if (cfg.adapter === "openai" && !cfg.baseUrl) {
    throw new Error("A server URL is required.");
  }

  let res;
  const url = cfg.adapter === "gemini" ? `${cfg.baseUrl}/models?pageSize=200` : `${cfg.baseUrl}/models`;
  try {
    res = await fetch(url, { headers: authHeadersFor(cfg), signal: AbortSignal.timeout(12000) });
  } catch {
    throw reachabilityError(cfg);
  }

  if (!res.ok && cfg.kind !== "cloud" && (res.status === 404 || res.status === 405)) {
    const nativeModels = await probeOllamaNativeTags(cfg.baseUrl);
    if (nativeModels) {
      return { ok: true, models: nativeModels, config: cfg };
    }
  }

  await assertOk(res, cfg);
  const data = await res.json().catch(() => null);
  return { ok: true, models: extractModelIds(cfg.adapter, data), config: cfg };
}

function buildChatRequest(cfg, messages, stream) {
  if (cfg.adapter === "anthropic") {
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const msgs = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map(({ role, content }) => ({ role, content }));
    return {
      url: `${cfg.baseUrl}/messages`,
      headers: authHeadersFor(cfg),
      body: { model: cfg.model, max_tokens: 4096, stream, ...(system ? { system } : {}), messages: msgs },
    };
  }
  if (cfg.adapter === "gemini") {
    const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const contents = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
    const action = stream ? "streamGenerateContent?alt=sse" : "generateContent";
    return {
      url: `${cfg.baseUrl}/models/${encodeURIComponent(cfg.model)}:${action}`,
      headers: authHeadersFor(cfg),
      body: { contents, ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}) },
    };
  }
  return {
    url: `${cfg.baseUrl}/chat/completions`,
    headers: authHeadersFor(cfg, cfg.provider === "openrouter"),
    body: { model: cfg.model, messages, stream },
  };
}

async function readSSE(body, handleData) {
  const reader = body.getReader();
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
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        handleData(JSON.parse(payload));
      } catch {
        /* skip malformed frames */
      }
    }
  }
}

const DELTA_EXTRACTORS = {
  openai: (obj) => obj.choices?.[0]?.delta?.content ?? obj.choices?.[0]?.text ?? "",
  anthropic: (obj) => (obj.type === "content_block_delta" ? obj.delta?.text ?? "" : ""),
  gemini: (obj) => (obj.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join(""),
};

const ONCE_EXTRACTORS = {
  openai: (data) => data?.choices?.[0]?.message?.content || "",
  anthropic: (data) => (data?.content || []).filter((b) => b.type === "text").map((b) => b.text).join(""),
  gemini: (data) => (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join(""),
};

// Streams a chat completion from whatever provider the user connected,
// calling onDelta(text) for each chunk as it arrives.
export async function streamChatCompletion(cfg, messages, signal, onDelta) {
  const req = buildChatRequest(cfg, messages, true);
  let res;
  try {
    res = await fetch(req.url, {
      method: "POST",
      headers: req.headers,
      signal,
      body: JSON.stringify(req.body),
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw reachabilityError(cfg);
  }
  await assertOk(res, cfg);
  if (!res.body) throw new Error(`${cfg.label} returned an empty stream.`);
  const extract = DELTA_EXTRACTORS[cfg.adapter] || DELTA_EXTRACTORS.openai;
  await readSSE(res.body, (obj) => {
    const text = extract(obj);
    if (text) onDelta(text);
  });
}

// Single-shot (non-streaming) completion, used for chat titles.
export async function completeOnce(cfg, messages) {
  const req = buildChatRequest(cfg, messages, false);
  let res;
  try {
    res = await fetch(req.url, {
      method: "POST",
      headers: req.headers,
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify(req.body),
    });
  } catch {
    throw reachabilityError(cfg);
  }
  await assertOk(res, cfg);
  const data = await res.json();
  return (ONCE_EXTRACTORS[cfg.adapter] || ONCE_EXTRACTORS.openai)(data).trim();
}

function providerEmbedder(cfg) {
  if (!cfg.embedModel) return null;
  if (cfg.adapter === "openai") {
    return {
      sig: `${cfg.provider}:${cfg.embedModel}`,
      model: cfg.embedModel,
      async embed(text) {
        const res = await fetch(`${cfg.baseUrl}/embeddings`, {
          method: "POST",
          headers: authHeadersFor(cfg),
          signal: AbortSignal.timeout(30000),
          body: JSON.stringify({ model: cfg.embedModel, input: text }),
        });
        await assertOk(res, cfg);
        const data = await res.json();
        const embedding = data?.data?.[0]?.embedding;
        if (!embedding) throw new Error(`${cfg.label} returned no embedding.`);
        return embedding;
      },
    };
  }
  if (cfg.adapter === "gemini") {
    return {
      sig: `${cfg.provider}:${cfg.embedModel}`,
      model: cfg.embedModel,
      async embed(text) {
        const res = await fetch(`${cfg.baseUrl}/models/${cfg.embedModel}:embedContent`, {
          method: "POST",
          headers: authHeadersFor(cfg),
          signal: AbortSignal.timeout(30000),
          body: JSON.stringify({ content: { parts: [{ text }] } }),
        });
        await assertOk(res, cfg);
        const data = await res.json();
        const embedding = data?.embedding?.values;
        if (!embedding) throw new Error(`${cfg.label} returned no embedding.`);
        return embedding;
      },
    };
  }
  return null;
}

async function ollamaReachable() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

// Picks the best embedding source for retrieval: the connected provider when
// it offers embeddings, otherwise a local Ollama install, otherwise null
// (the caller falls back to keyword search over indexed chunks).
export async function resolveEmbedder(cfg) {
  const native = providerEmbedder(cfg);
  if (native) return native;
  if (await ollamaReachable()) {
    return {
      sig: "ollama:nomic-embed-text",
      model: "nomic-embed-text",
      embed: (text) => ollamaEmbedText(text),
    };
  }
  return null;
}
