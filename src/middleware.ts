// Next.js requires the middleware file to be named exactly "middleware.ts".
// All middleware logic lives in proxy.ts — this file just re-exports it.
export { default, config } from "./proxy";
