import pkg from "@react-router/node";
import { stat, readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { pathToFileURL } from "node:url";

const { createRequestHandler } = pkg;

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

// Use process.cwd() (= /var/task in Vercel Lambda) to build an absolute path.
// Relative paths like "../build/server/index.js" shift after Vercel bundles the
// function file, but process.cwd() always points to the Lambda task root where
// includeFiles places the build/** files.
let _handler;
async function getHandler() {
  if (!_handler) {
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
  // Serve hashed static assets directly (JS/CSS/fonts/images)
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
    // Not a static asset — pass to React Router
  }

  try {
    const h = await getHandler();
    return h(req, res);
  } catch (err) {
    console.error("[ScrollFlow] Handler error:", err);
    res.statusCode = 500;
    res.end(`Server Error: ${err.message}`);
  }
}
