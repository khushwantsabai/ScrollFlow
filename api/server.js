import { createRequestHandler } from "@react-router/node";
import { stat, readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CLIENT_DIR = join(__dirname, "..", "build", "client");

// Inline mime map — no external dependency needed
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

const rrHandler = createRequestHandler({
  build: () => import("../build/server/index.js"),
});

export default async function handler(req, res) {
  // Serve static build assets (JS, CSS, fonts, images) directly
  // This mirrors what react-router-serve does via express.static("build/client")
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
        // Vite hashes asset filenames — safe to cache forever
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.end(content);
        return;
      }
    }
  } catch {
    // Not a static file — fall through to React Router handler
  }

  return rrHandler(req, res);
}
