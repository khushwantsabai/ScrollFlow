// @react-router/node is a CommonJS module — must import as default and destructure
import pkg from "@react-router/node";
import * as build from "../build/server/index.js";

const { createRequestHandler } = pkg;

export default createRequestHandler({ build });
