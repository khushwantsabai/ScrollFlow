import pkg from "@react-router/node";
import { stat, readFile } from "node:fs/promises";
import { join, extname } from "node:path";

const { createRequestHandler } = pkg;

// Inline mime map — no external dependency
const MIME = {
  ".js":    "text/javascript; charset=utf-8",
  ".css":   "text/css; charset=utf-8",
  ".html":  "text/html; charset=utf-8",
  ".json":  "application/json",
  ".map":   "application/json",
  ".png":   "image/png",
  ".jpg":   "image/jpeg",
  ".jpeg":  "image/jpeg",
  ".gif":   "image/gif",
  ".svg":   "image/svg+xml",
  ".ico":   "image/x-icon",
  ".woff":  "font/woff",
  ".woff2": "font/woff2",
  ".ttf":   "font/ttf",
};

// Dynamic import — NOT resolved at Vercel CLI validation time (pre-build),
// so the "functions" key validation passes even though build/server doesn't
// exist yet. The includeFiles config in vercel.json copies build/** into
// the function bundle at deploy time so it's available here at runtime.
let _handler;
async function getHandler() {
  if (!_handler) {
    const build = await import("../build/server/index.js");
    _handler = createRequestHandler({ build });
  }
  return _handler;
}

const CLIENT_DIR = join(process.cwd(), "build", "client");

export default async function handler(req, res) {
  // Serve static assets (JS/CSS/fonts) directly from build/client
  // These are copied into the function bundle via includeFiles:build/**
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.startsWith("/assets/") || pathname === "/favicon.ico") {
      const filePath = join(CLIENT_DIR, pathname);
      const fileStats = await stat(filePath);
      if (fileStats.isFile()) {
        const content = await readFile(filePath);
        const mime = MIME[extname(filePath)] || "application/octet-stream";
        res.setHeader("Content-Type", mime);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.end(content);
        return;
      }
    }
  } catch {
    // Not a static asset — fall through to React Router
  }

  const h = await getHandler();
  return h(req, res);
}
