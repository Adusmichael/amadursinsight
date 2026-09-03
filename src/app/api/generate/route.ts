import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { EXTRACTION_TOOL_NAME, extractionInputSchema } from "@/lib/schema";
import { normalizeModelDoc } from "@/lib/normalize";

export const runtime = "nodejs";
export const maxDuration = 60;

const MIN_CHARS = 40;
const MAX_CHARS = 15000;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

const SYSTEM = `You are a senior business analyst. Turn the raw meeting notes into a FIRST-DRAFT requirements document by calling the ${EXTRACTION_TOOL_NAME} tool exactly once.

Rules:
- Requirements: one clear, testable statement each. Classify every requirement as functional, non-functional, business-rule, or constraint. Capture each distinct need ONCE - do not restate a functional requirement as a separate business rule. Plain language. Do not invent detail the notes do not support.
- User stories: write one for EACH functional requirement, and none for the other kinds. Give asA / iWant / soThat as three separate parts, each phrased to slot into "As {asA}, I want {iWant}, so that {soThat}" - so asA starts with an article ("a referral coordinator", "an admin"), and none of the three parts repeats its leading words. Keep them INVEST-shaped. Set priority only when the notes make it clear; otherwise "unset".
- Acceptance criteria: at least two per story, in Given / When / Then form, each one verifying its story.
- Risks, assumptions, open questions: capture what the notes leave uncertain. Prefer raising a gap as an open question over guessing.
- Give every item a short id (R1, US1, AC1.1, RSK1, ASM1, OQ1). Each story's derivedFrom must be a functional requirement id; each criterion's storyId must be a user story id.
- If the notes are too thin to extract real requirements, return empty arrays rather than padding.`;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (notes.length < MIN_CHARS) {
    return NextResponse.json(
      { error: "Add more detail to the notes before generating." },
      { status: 400 },
    );
  }
  if (notes.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `Notes exceed the ${MAX_CHARS.toLocaleString()}-character limit.` },
      { status: 400 },
    );
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "The server has no ANTHROPIC_API_KEY set. Add it to .env.local and restart the dev server." },
      { status: 500 },
    );
  }

  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
  const client = new Anthropic(
    workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {},
  );

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: SYSTEM,
      tools: [
        {
          name: EXTRACTION_TOOL_NAME,
          description: "Record the structured requirements draft extracted from the meeting notes.",
          strict: true,
          input_schema: extractionInputSchema as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: EXTRACTION_TOOL_NAME },
      messages: [{ role: "user", content: `Meeting notes:\n\n${notes}` }],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "The model declined to process these notes. Try rewording them." },
        { status: 422 },
      );
    }

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    if (!toolUse) {
      return NextResponse.json(
        { error: "The model did not return a structured result. Try again." },
        { status: 502 },
      );
    }

    const doc = normalizeModelDoc(toolUse.input, {
      projectName: typeof body.projectName === "string" ? body.projectName : "",
      stakeholders: typeof body.stakeholders === "string" ? body.stakeholders : "",
      meetingDate: typeof body.meetingDate === "string" ? body.meetingDate : "",
    });

    if (doc.requirements.length === 0) {
      return NextResponse.json(
        {
          error:
            "No requirements could be extracted. Add more about what the system should actually do.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json(doc);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "The ANTHROPIC_API_KEY was rejected." }, { status: 500 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited by the model API. Wait a moment and try again." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      console.error("[generate] API error", error.status, error.message);
      // Surface 400 validation detail — it's an Anthropic config message, not a secret.
      const detail = error.status === 400 ? ` — ${error.message}` : "";
      return NextResponse.json(
        { error: `The model API rejected the request${detail}` },
        { status: 502 },
      );
    }
    console.error("[generate] unexpected", error);
    return NextResponse.json({ error: "Something went wrong generating the draft." }, { status: 500 });
  }
}
