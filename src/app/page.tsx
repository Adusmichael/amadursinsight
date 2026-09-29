"use client";

import { useEffect, useRef, useState } from "react";
import { editRequirementText, markReviewed, reviewCount } from "@/lib/graph";
import { normalizeModelDoc } from "@/lib/normalize";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft-store";
import type { RequirementsDoc } from "@/lib/types";
import { DocView, type DocHandlers } from "@/components/workspace/doc-view";
import { ExportBar } from "@/components/workspace/export-bar";
import { ImpactPanel } from "@/components/workspace/impact-panel";
import { InputPanel, type GeneratePayload } from "@/components/workspace/input-panel";
import { Btn } from "@/components/workspace/primitives";

// The PHP proxy that holds the API key. Override at build time with
// NEXT_PUBLIC_GENERATE_ENDPOINT if the app is served from a subfolder.
const GENERATE_ENDPOINT =
  process.env.NEXT_PUBLIC_GENERATE_ENDPOINT || "/api/generate.php";

export default function Workspace() {
  const [doc, setDoc] = useState<RequirementsDoc | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const hydrated = useRef(false);

  // Restore the last draft from this browser (once, on mount). localStorage is
  // read here rather than in a useState initializer so it never runs during the
  // static prerender and never causes a hydration mismatch.
  useEffect(() => {
    const saved = loadDraft();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDoc(saved);
      setRestored(true);
    }
    hydrated.current = true;
  }, []);

  // Autosave the current draft as it changes. Never clears here — only
  // "Start over" clears, so a reload can't silently drop work.
  useEffect(() => {
    if (!hydrated.current || !doc) return;
    saveDraft(doc);
  }, [doc]);

  async function generate(payload: GeneratePayload) {
    setBusy(true);
    setError(null);
    setRestored(false);
    try {
      const res = await fetch(GENERATE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: payload.notes, backlog: payload.backlog }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data !== "object") {
        const message =
          data && typeof data === "object" && typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Generation failed. Try again.";
        setError(message);
        return;
      }
      // The proxy returns the raw model output; the trace graph is repaired here.
      const next = normalizeModelDoc((data as { model?: unknown }).model, {
        projectName: payload.projectName,
        stakeholders: payload.stakeholders,
        meetingDate: payload.meetingDate,
      });
      if (next.requirements.length === 0) {
        setError(
          "No requirements could be extracted. Add more about what the system should actually do.",
        );
        return;
      }
      setDoc(next);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    clearDraft();
    setRestored(false);
    setDoc(null);
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
    editConflict: (id, patch) =>
      setDoc((d) =>
        d ? { ...d, conflicts: d.conflicts.map((c) => (c.id === id ? { ...c, ...patch } : c)) } : d,
      ),
    markReviewed: (kind, id) => setDoc((d) => (d ? markReviewed(d, kind, id) : d)),
    setCriterionTestStatus: (id, testStatus) =>
      setDoc((d) =>
        d
          ? {
              ...d,
              acceptanceCriteria: d.acceptanceCriteria.map((a) =>
                a.id === id ? { ...a, testStatus } : a,
              ),
            }
          : d,
      ),
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
    <div className="space-y-6 pb-44 sm:pb-28">
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
          <Btn variant="ghost" onClick={startOver}>
            Start over
          </Btn>
        </div>
      </div>

      {restored && (
        <p className="font-mono text-[0.7rem] text-ink-faint">
          Restored the draft saved in this browser. &ldquo;Start over&rdquo; clears it.
        </p>
      )}

      <p className="rounded-md border border-accent/25 bg-accent-wash px-3 py-2 text-[0.82rem] leading-relaxed text-ink-soft">
        A first draft to refine, not a finished specification. Edit any requirement to see which
        stories and criteria it affects.
      </p>

      <DocView doc={doc} handlers={handlers} />
      <ImpactPanel doc={doc} onReviewed={handlers.markReviewed} />
    </div>
  );
}
