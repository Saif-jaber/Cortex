// Lazy-import so a startup failure is reported as JSON (visible in the
// browser) instead of an opaque FUNCTION_INVOCATION_FAILED crash page.
let app;

export default async function handler(req, res) {
  try {
    if (!app) {
      const mod = await import("../src/Backend/server.js");
      app = mod.default;
    }
    return app(req, res);
  } catch (err) {
    console.error("Function failed:", err);
    res.status(500).json({
      error: err.message,
      stack: String(err.stack || "").split("\n").slice(0, 8),
    });
  }
}
