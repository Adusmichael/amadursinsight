"use client";

import { useState } from "react";
import { SAMPLE_NOTES } from "@/lib/sample-notes";
import { Btn, FieldLabel } from "./primitives";
import { GenerationProgress } from "./generation-progress";

const MIN_CHARS = 40;
const MAX_CHARS = 15000;

export interface GeneratePayload {
  notes: string;
  projectName: string;
  stakeholders: string;
  meetingDate: string;
}

const fieldClass =
  "h-9 w-full rounded-md border border-rule-strong bg-paper px-2 font-sans text-[0.85rem] text-ink focus:border-accent focus:outline-none";

export function InputPanel({
  busy,
  error,
  onGenerate,
}: {
  busy: boolean;
  error?: string | null;
  onGenerate: (payload: GeneratePayload) => void;
}) {
  const [notes, setNotes] = useState("");
  const [projectName, setProjectName] = useState("");
  const [stakeholders, setStakeholders] = useState("");
  const [meetingDate, setMeetingDate] = useState("");

  const count = notes.length;
  const tooLong = count > MAX_CHARS;
  const canGenerate = count >= MIN_CHARS && !tooLong && !busy;

  let counter: React.ReactNode;
  if (tooLong) {
    counter = (
      <span className="text-flag">
        {count.toLocaleString()} / {MAX_CHARS.toLocaleString()} &mdash; trim to generate
      </span>
    );
  } else if (count < MIN_CHARS) {
    counter = <span>Add a little more detail &mdash; {count}/{MIN_CHARS} characters</span>;
  } else {
    counter = <span>{count.toLocaleString()} characters</span>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[1.4rem] font-bold leading-tight tracking-tight text-ink sm:text-[1.7rem]">
          Meeting notes to requirements
        </h1>
        <p className="mt-1.5 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
          Paste raw notes from a stakeholder meeting. You get back a structured first draft &mdash;
          requirements, user stories, acceptance criteria, risks, assumptions, open questions &mdash;
          with each item linked to its parent.
        </p>
      </div>

      <div className="rounded-lg border border-rule bg-surface p-4">
        <div className="mb-2 flex items-center justify-between">
          <FieldLabel>Meeting notes</FieldLabel>
          <button
            type="button"
            onClick={() => setNotes(SAMPLE_NOTES)}
            className="font-mono text-[0.7rem] text-accent-ink underline-offset-2 hover:underline"
          >
            Load sample notes
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={12}
          placeholder="Paste your meeting notes here&hellip;"
          className="w-full resize-y rounded-md border border-rule-strong bg-paper p-3 font-sans text-[0.9rem] leading-relaxed text-ink focus:border-accent focus:outline-none"
        />
        <div className="mt-1.5 font-mono text-[0.68rem] text-ink-faint">{counter}</div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <FieldLabel>Project (optional)</FieldLabel>
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <FieldLabel>Stakeholders (optional)</FieldLabel>
            <input
              value={stakeholders}
              onChange={(event) => setStakeholders(event.target.value)}
              placeholder="comma separated"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <FieldLabel>Meeting date (optional)</FieldLabel>
            <input
              type="date"
              value={meetingDate}
              onChange={(event) => setMeetingDate(event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-flag/40 bg-flag-wash px-3 py-2 text-[0.82rem] text-flag">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Btn
            variant="solid"
            disabled={!canGenerate}
            className="h-9 px-4"
            onClick={() => onGenerate({ notes, projectName, stakeholders, meetingDate })}
          >
            {busy ? "Generating…" : "Generate requirements"}
          </Btn>
          {!busy && (
            <span className="max-w-sm font-mono text-[0.64rem] leading-relaxed text-ink-faint">
              Notes are sent to an AI model for extraction and are not stored. Don&rsquo;t paste
              anything confidential.
            </span>
          )}
        </div>

        {busy && <GenerationProgress />}
      </div>
    </div>
  );
}
