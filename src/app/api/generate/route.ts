import { NextResponse } from "next/server";

/**
 * Build step 4 wires this route to Anthropic: it will take { notes, projectName,
 * stakeholders, meetingDate }, call the model in structured-output mode, validate
 * the returned JSON against the document schema, and return a RequirementsDoc.
 *
 * Until then the client generates from the sample document directly, and this
 * endpoint is intentionally not live.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Generation is not wired to the model yet (build step 4)." },
    { status: 501 },
  );
}
