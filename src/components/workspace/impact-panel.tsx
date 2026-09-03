"use client";

import { resolveImpact } from "@/lib/graph";
import type { RequirementsDoc } from "@/lib/types";

export function ImpactPanel({
  doc,
  onReviewed,
}: {
  doc: RequirementsDoc;
  onReviewed: (kind: "story" | "criterion", id: string) => void;
}) {
  const { stories, criteria } = resolveImpact(doc);
  const total = stories.length + criteria.length;
  if (total === 0) return null;

  const rows = [
    ...stories.map((s) => ({ kind: "story" as const, id: s.id, label: "user story" })),
    ...criteria.map((c) => ({ kind: "criterion" as const, id: c.id, label: `criterion · ${c.storyId}` })),
  ];

  return (
    <aside className="fixed inset-x-3 bottom-3 z-40 overflow-hidden rounded-lg border border-flag/40 bg-surface shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[19rem]">
      <div className="border-b border-rule px-3 py-2">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-flag">
          {total} item{total === 1 ? "" : "s"} need review
        </span>
      </div>
      <ul className="max-h-60 overflow-y-auto p-1.5">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-2 rounded px-1.5 py-1 hover:bg-code-bg">
            <a
              href={`#${row.id}`}
              className="font-mono text-[0.72rem] text-accent-ink no-underline hover:underline"
            >
              {row.id}
            </a>
            <span className="flex-1 truncate font-mono text-[0.68rem] text-ink-faint">{row.label}</span>
            <button
              type="button"
              onClick={() => onReviewed(row.kind, row.id)}
              className="font-mono text-[0.68rem] text-ink-faint hover:text-ink"
            >
              clear
            </button>
          </li>
        ))}
      </ul>
      <p className="border-t border-rule px-3 py-2 font-mono text-[0.62rem] leading-relaxed text-ink-faint">
        Flagged by a requirement edit. Deterministic &mdash; no model call.
      </p>
    </aside>
  );
}
