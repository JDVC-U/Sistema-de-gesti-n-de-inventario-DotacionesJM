import * as kv from "./kv_store.tsx";

const HEALTH_PATH = "/make-server-97cc3f14/health";

function createCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Expose-Headers": "Content-Length",
    "Access-Control-Max-Age": "600",
  };
}

async function handler(req: Request): Promise<Response> {
  // Basic request logging
  console.log(`${req.method} ${req.url}`);

  const url = new URL(req.url);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: createCorsHeaders() });
  }

  // Health check endpoint
  if (url.pathname === HEALTH_PATH && req.method === "GET") {
    const headers = new Headers(createCorsHeaders());
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ status: "ok" }), { status: 200, headers });
  }

  // Default 404
  const headers = new Headers(createCorsHeaders());
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers });
}

// If running on Deno, start the server; otherwise export the handler for other runtimes
if (typeof (globalThis as any).Deno !== "undefined" && typeof (globalThis as any).Deno.serve === "function") {
  (globalThis as any).Deno.serve(handler);
}

export default handler;