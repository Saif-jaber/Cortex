import { PROVIDER_LIST, normalizeConfig, verifyProviderConnection } from "../config/aiProviders.js";
import { encryptSecret, decryptSecret, maskSecret } from "../utils/crypto.js";

// Rebuilds a runtime provider config from the user's saved (encrypted) one.
// Falls back to a server-side free model if configured via environment variables.
export function getUserAiConfig(userDoc) {
  const ai = userDoc?.ai;
  if (ai?.provider && ai?.verifiedAt) {
    const apiKey = decryptSecret(ai.apiKeyEnc) || "";
    const cfg = normalizeConfig({
      provider: ai.provider,
      apiKey,
      baseUrl: ai.baseUrl || "",
      model: ai.model || "",
    });
    if (cfg && cfg.baseUrl && cfg.model) {
      return { ...cfg, source: "user" };
    }
  }

  // Server-side free/default model fallback (never exposed to client)
  if (process.env.FREE_AI_ENABLED === "true") {
    const provider = process.env.FREE_AI_PROVIDER || "custom";
    const apiKey = process.env.FREE_AI_KEY || "";
    let baseUrl = process.env.FREE_AI_BASE_URL || "";
    let model = process.env.FREE_AI_MODEL || "";
    if (provider === "cortex-free") {
      provider = process.env.FREE_AI_PROVIDER || "custom";
      baseUrl = process.env.FREE_AI_BASE_URL || "";
      model = process.env.FREE_AI_MODEL || "";
    }
    const cfg = normalizeConfig({ provider, apiKey, baseUrl, model });
    if (cfg && cfg.baseUrl && cfg.model) {
      return { ...cfg, apiKey, source: "system" };
    }
  }

  return null;
}

function publicConfig(userDoc) {
  const ai = userDoc?.ai;
  if (ai?.provider && ai?.verifiedAt) {
    return {
      configured: true,
      source: "user",
      provider: ai.provider,
      label: PROVIDER_LIST.find((p) => p.id === ai.provider)?.label || ai.provider,
      model: ai.model || "",
      baseUrl: ai.baseUrl || "",
      apiKeyHint: ai.apiKeyHint || "",
      verifiedAt: ai.verifiedAt,
    };
  }

  if (process.env.FREE_AI_ENABLED === "true") {
    const provider = process.env.FREE_AI_PROVIDER || "custom";
    const model = process.env.FREE_AI_MODEL || "";
    if (model) {
      const def = PROVIDER_LIST.find((p) => p.id === provider);
      return {
        configured: true,
        source: "system",
        provider: "cortex-free",
        label: "Cortex Free",
        model,
        baseUrl: process.env.FREE_AI_BASE_URL || "",
        apiKeyHint: null,
        verifiedAt: null,
        isFree: true,
      };
    }
  }

  return {
    configured: false,
    source: null,
    provider: null,
    label: null,
    model: null,
    baseUrl: null,
    apiKeyHint: null,
    verifiedAt: null,
    isFree: false,
  };
}

export async function listProviders(_req, res) {
  res.json(PROVIDER_LIST);
}

export async function getAiConfig(req, res) {
  try {
    res.json(publicConfig(req.user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function saveAiConfig(req, res) {
  try {
    let { provider, apiKey = "", baseUrl = "", model = "" } = req.body || {};

    if (provider === "cortex-free") {
      if (process.env.FREE_AI_ENABLED !== "true" || !process.env.FREE_AI_MODEL) {
        return res.status(400).json({ error: "Free model is not configured on this server." });
      }
      req.user.ai = {
        provider: "cortex-free",
        apiKeyEnc: "",
        apiKeyHint: "",
        baseUrl: process.env.FREE_AI_BASE_URL || "",
        model: process.env.FREE_AI_MODEL || "",
        verifiedAt: new Date(),
      };
      await req.user.save();
      return res.json(publicConfig(req.user));
    }

    const def = PROVIDER_LIST.find((p) => p.id === provider);
    if (!def) return res.status(400).json({ error: "Unknown AI provider" });

    const trimmedKey = String(apiKey).trim();
    const trimmedUrl = String(baseUrl).trim();
    const trimmedModel = String(model).trim();

    if (def.requiresKey && !trimmedKey) {
      return res.status(400).json({ error: `${def.label} requires an API key` });
    }
    if (provider === "custom" && !trimmedUrl) {
      return res.status(400).json({ error: "A server URL is required for a custom endpoint" });
    }

    // Verify against the live provider BEFORE saving anything.
    let result;
    try {
      result = await verifyProviderConnection(provider, {
        apiKey: trimmedKey,
        baseUrl: trimmedUrl,
        model: trimmedModel,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!trimmedModel && (provider === "ollama" || provider === "custom")) {
      const available = result.models?.slice(0, 8).join(", ");
      return res.status(400).json({
        error: available
          ? `Enter the model to use. Available on your server: ${available}`
          : `Enter the model name served by your ${def.label} instance`,
      });
    }

    req.user.ai = {
      provider,
      apiKeyEnc: trimmedKey ? encryptSecret(trimmedKey) : "",
      apiKeyHint: maskSecret(trimmedKey) || "",
      baseUrl: result.config.baseUrl,
      model: result.config.model,
      verifiedAt: new Date(),
    };
    await req.user.save();

    res.json({ ...publicConfig(req.user), models: result.models || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteAiConfig(req, res) {
  try {
    req.user.ai = {
      provider: "",
      apiKeyEnc: "",
      apiKeyHint: "",
      baseUrl: "",
      model: "",
      verifiedAt: null,
    };
    await req.user.save();
    res.json(publicConfig(req.user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
