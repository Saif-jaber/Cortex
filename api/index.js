// Lazy-import so a startup failure is reported as JSON (visible in the
// browser) instead of an opaque FUNCTION_INVOCATION_FAILED crash page.
let app;

// pdfjs-dist (via pdf-parse) references browser-only globals at import time.
// Text extraction never renders, so minimal stubs are sufficient in Node.
globalThis.DOMMatrix ??= class DOMMatrix {};
globalThis.ImageData ??= class ImageData {};
globalThis.Path2D ??= class Path2D {};

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
