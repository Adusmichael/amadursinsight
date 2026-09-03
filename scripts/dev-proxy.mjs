// Local stand-in for deploy/generate.php so you can test generation with
// `npm run dev` (which no longer has a Next API route).
//
//   node --env-file=.env.local scripts/dev-proxy.mjs
//   # then in another terminal:
//   NEXT_PUBLIC_GENERATE_ENDPOINT=http://localhost:8787/generate npm run dev
//
// Reads ANTHROPIC_API_KEY / ANTHROPIC_WORKSPACE_ID / ANTHROPIC_MODEL from the
// environment (use --env-file). Not used in production — the PHP proxy is.

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PORT = 8787;
const root = resolve(import.meta.dirname, "..");
const schema = JSON.parse(readFileSync(resolve(root, "src/lib/extraction-schema.json"), "utf8"));
const system = readFileSync(resolve(root, "src/lib/system-prompt.txt"), "utf8");

const apiKey = process.env.ANTHROPIC_API_KEY;
const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

if (!apiKey) {
  console.error("ANTHROPIC_API_KEY is not set. Run with:  node --env-file=.env.local scripts/dev-proxy.mjs");
  process.exit(1);
}

const send = (res, status, obj) => {
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "POST, OPTIONS",
  });
  res.end(JSON.stringify(obj));
};

createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.method !== "POST") return send(res, 405, { error: "Use POST." });

  let body = "";
  for await (const chunk of req) body += chunk;
  let notes = "";
  try {
    notes = String(JSON.parse(body).notes ?? "").trim();
  } catch {
    return send(res, 400, { error: "Invalid request body." });
  }
  if (notes.length < 40) return send(res, 400, { error: "Add more detail to the notes before generating." });
  if (notes.length > 15000) return send(res, 400, { error: "Notes exceed the 15,000-character limit." });

  const headers = {
    "content-type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };
  if (workspaceId) headers["anthropic-workspace-id"] = workspaceId;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        output_config: { effort: "low" },
        system,
        tools: [
          {
            name: "record_requirements",
            description: "Record the structured requirements draft extracted from the meeting notes.",
            strict: true,
            input_schema: schema,
          },
        ],
        tool_choice: { type: "tool", name: "record_requirements" },
        messages: [{ role: "user", content: `Meeting notes:\n\n${notes}` }],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      return send(res, 502, {
        error: `The model API rejected the request${data?.error?.message ? ` — ${data.error.message}` : "."}`,
      });
    }
    if (data.stop_reason === "refusal") {
      return send(res, 422, { error: "The model declined to process these notes. Try rewording them." });
    }
    const toolUse = (data.content ?? []).find((b) => b.type === "tool_use");
    if (!toolUse) return send(res, 502, { error: "The model did not return a structured result. Try again." });
    return send(res, 200, { model: toolUse.input });
  } catch (err) {
    return send(res, 502, { error: `Could not reach the model API. ${err instanceof Error ? err.message : ""}` });
  }
}).listen(PORT, () => console.log(`dev proxy on http://localhost:${PORT}/generate  (model: ${model})`));
