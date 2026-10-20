import { createRequestHandler } from "@react-router/node";
import * as build from "../build/server/index.js";

// Static import lets Vercel's bundler trace and bundle build/server/index.js
// automatically — no need for the 'functions.includeFiles' config.
//
// Static assets (JS, CSS, fonts) are served directly by Vercel CDN
// from outputDirectory (build/client) before this handler is ever reached.
export default createRequestHandler({ build });
