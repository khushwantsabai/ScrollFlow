// api/server.js — Vercel serverless handler for React Router v7 (ESM)
// Uses dynamic import() for @react-router/node (pure ESM package — require() won't work).
import { join, extname } from "node:path";
import { pathToFileURL } from "node:url";
import { stat, readFile } from "node:fs/promises";

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

let _handler;
async function getHandler() {
  if (!_handler) {
    // ESM dynamic import — works correctly with pure-ESM packages like @react-router/node
    const { createRequestHandler } = await import("@react-router/node");

    if (typeof createRequestHandler !== "function") {
      const mod = await import("@react-router/node");
      const keys = Object.keys(mod).join(", ");
      throw new Error(
        `createRequestHandler is not a function. Available exports: ${keys}`
      );
    }

    // Dynamic import of the React Router server bundle via absolute file URL
    // so Vercel's bundler doesn't re-bundle the Vite-generated output
    const buildPath = pathToFileURL(
      join(process.cwd(), "build", "server", "index.js")
    ).href;
    const build = await import(buildPath);

    _handler = createRequestHandler({ build });
  }
  return _handler;
}

const CLIENT_DIR = join(process.cwd(), "build", "client");

export default async function handler(req, res) {
  // Serve hashed static assets directly from build/client
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
    // Not a static asset — fall through to React Router handler
  }

  try {
    const h = await getHandler();
    return h(req, res);
  } catch (err) {
    console.error("[ScrollFlow] Handler error:", err);
    res.statusCode = 500;
    res.end(`Server Error: ${err.message}\n\nStack: ${err.stack}`);
  }
}
