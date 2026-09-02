"use client";

import { useState } from "react";
import { editRequirementText, markReviewed, reviewCount } from "@/lib/graph";
import { SAMPLE_DOC } from "@/lib/sample";
import type { RequirementsDoc } from "@/lib/types";
import { DocView, type DocHandlers } from "@/components/workspace/doc-view";
import { ExportBar } from "@/components/workspace/export-bar";
import { ImpactPanel } from "@/components/workspace/impact-panel";
import { InputPanel, type GeneratePayload } from "@/components/workspace/input-panel";
import { Btn } from "@/components/workspace/primitives";

export default function Workspace() {
  const [doc, setDoc] = useState<RequirementsDoc | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(payload: GeneratePayload) {
    setBusy(true);
    setError(null);

    // BUILD STEP 4 replaces this block with a call to POST /api/generate.
    // Until then, every generate returns the pre-verified sample document so
    // the rendering, editing, and impact logic can be built and demoed first.
    await new Promise((resolve) => setTimeout(resolve, 350));

    const next = structuredClone(SAMPLE_DOC);
    next.meta = {
      projectName: payload.projectName.trim() || next.meta.projectName,
      stakeholders: payload.stakeholders.trim()
        ? payload.stakeholders.split(",").map((s) => s.trim()).filter(Boolean)
        : next.meta.stakeholders,
      meetingDate: payload.meetingDate || next.meta.meetingDate,
      generatedAt: new Date().toISOString(),
    };

    setDoc(next);
    setBusy(false);
  }

  const handlers: DocHandlers = {
    editRequirement: (id, text) => setDoc((d) => (d ? editRequirementText(d, id, text) : d)),
    editStory: (id, patch) =>
      setDoc((d) =>
        d
          ? { ...d, userStories: d.userStories.map((s) => (s.id === id ? { ...s, ...patch } : s)) }
          : d,
      ),
    editCriterion: (id, patch) =>
      setDoc((d) =>
        d
          ? {
              ...d,
              acceptanceCriteria: d.acceptanceCriteria.map((a) =>
                a.id === id ? { ...a, ...patch } : a,
              ),
            }
          : d,
      ),
    markReviewed: (kind, id) => setDoc((d) => (d ? markReviewed(d, kind, id) : d)),
    editLabeled: (section, id, text) =>
      setDoc((d) =>
        d
          ? { ...d, [section]: d[section].map((i) => (i.id === id ? { ...i, text: text.trim() } : i)) }
          : d,
      ),
  };

  if (!doc) {
    return <InputPanel busy={busy} error={error} onGenerate={generate} />;
  }

  const flagged = reviewCount(doc);
  const meta = doc.meta;

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-4">
        <div>
          <h1 className="font-display text-[1.5rem] font-bold tracking-tight text-ink">
            {meta.projectName || "Requirements draft"}
          </h1>
          <p className="mt-0.5 font-mono text-[0.7rem] text-ink-faint">
            {meta.meetingDate ? `${meta.meetingDate} · ` : ""}
            draft for review · {doc.requirements.length} requirements · {doc.userStories.length}{" "}
            stories · {doc.acceptanceCriteria.length} criteria
            {flagged > 0 ? ` · ${flagged} need review` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportBar doc={doc} />
          <Btn variant="ghost" onClick={() => setDoc(null)}>
            Start over
          </Btn>
        </div>
      </div>

      <p className="rounded-md border border-accent/25 bg-accent-wash px-3 py-2 text-[0.82rem] leading-relaxed text-ink-soft">
        A first draft to refine, not a finished specification. Edit any requirement to see which
        stories and criteria it affects.
      </p>

      <DocView doc={doc} handlers={handlers} />
      <ImpactPanel doc={doc} onReviewed={handlers.markReviewed} />
    </div>
  );
}
