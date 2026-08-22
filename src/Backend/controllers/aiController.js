import { PROVIDER_LIST, normalizeConfig, verifyProviderConnection } from "../config/aiProviders.js";
import { encryptSecret, decryptSecret, maskSecret } from "../utils/crypto.js";

// Rebuilds a runtime provider config from the user's saved (encrypted) one.
// Returns null when the user has no verified connection, so chat stays locked
// until they connect a real key or local model.
export function getUserAiConfig(userDoc) {
  const ai = userDoc?.ai;
  if (!ai || !ai.provider || !ai.verifiedAt) return null;
  const apiKey = decryptSecret(ai.apiKeyEnc) || "";
  const cfg = normalizeConfig({
    provider: ai.provider,
    apiKey,
    baseUrl: ai.baseUrl || "",
    model: ai.model || "",
  });
  if (!cfg || !cfg.baseUrl || !cfg.model) return null;
  return cfg;
}

function publicConfig(userDoc) {
  const ai = userDoc?.ai;
  if (!ai || !ai.provider || !ai.verifiedAt) {
    return {
      configured: false,
      provider: null,
      label: null,
      model: null,
      baseUrl: null,
      apiKeyHint: null,
      verifiedAt: null,
    };
  }
  return {
    configured: true,
    provider: ai.provider,
    label: PROVIDER_LIST.find((p) => p.id === ai.provider)?.label || ai.provider,
    model: ai.model || "",
    baseUrl: ai.baseUrl || "",
    apiKeyHint: ai.apiKeyHint || "",
    verifiedAt: ai.verifiedAt,
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
    const { provider, apiKey = "", baseUrl = "", model = "" } = req.body || {};
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
