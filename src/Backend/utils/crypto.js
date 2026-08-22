import crypto from "crypto";

// Encrypts provider API keys at rest. Derived key comes from AI_KEY_SECRET
// (falling back to JWT_SECRET) so no extra setup is required.
const SECRET = process.env.AI_KEY_SECRET || process.env.JWT_SECRET || "cortex-dev-secret";
const KEY = crypto.scryptSync(SECRET, "cortex-ai-key-salt", 32);

export function encryptSecret(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(payload) {
  if (!payload) return null;
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) return null;
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export function maskSecret(plain) {
  if (!plain) return null;
  const tail = plain.slice(-4);
  return `••••••••${tail}`;
}
