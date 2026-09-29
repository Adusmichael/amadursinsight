"use client";

import { useState } from "react";
import type { Conflict } from "@/lib/types";
import { Btn, IdTag, MetaTag, editorFieldClass } from "./primitives";

export interface ConflictPatch {
  description: string;
  recommendation: string;
}

export function ConflictItem({
  conflict,
  onEdit,
}: {
  conflict: Conflict;
  onEdit: (id: string, patch: ConflictPatch) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ConflictPatch>({
    description: conflict.description,
    recommendation: conflict.recommendation,
  });

  function open() {
    setDraft({ description: conflict.description, recommendation: conflict.recommendation });
    setEditing(true);
  }
  function save() {
    onEdit(conflict.id, draft);
    setEditing(false);
  }

  return (
    <li
      id={conflict.id}
      className="scroll-mt-24 rounded-md border border-flag/40 bg-flag-wash p-4"
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <IdTag>{conflict.id}</IdTag>
        <MetaTag>contradiction &mdash; not auto-resolved</MetaTag>
        <span className="flex-1" />
        {!editing && (
          <Btn variant="ghost" onClick={open}>
            Edit
          </Btn>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block font-mono text-[0.64rem] uppercase tracking-[0.1em] text-ink-faint">
              What conflicts
            </label>
            <textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className={editorFieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[0.64rem] uppercase tracking-[0.1em] text-ink-faint">
              Recommended resolution
            </label>
            <textarea
              rows={2}
              value={draft.recommendation}
              onChange={(e) => setDraft({ ...draft, recommendation: e.target.value })}
              className={editorFieldClass}
            />
          </div>
          <div className="flex gap-2">
            <Btn variant="solid" onClick={save}>
              Save
            </Btn>
            <Btn variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Btn>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[0.92rem] leading-relaxed text-ink">{conflict.description}</p>
          {conflict.involves.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {conflict.involves.map((item, i) => (
                <li
                  key={i}
                  className="rounded-sm border border-rule-strong bg-surface px-1.5 py-0.5 font-mono text-[0.68rem] text-ink-soft"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[0.85rem] leading-relaxed text-ink-soft">
            <span className="font-medium text-ink">Resolve by:</span> {conflict.recommendation}
          </p>
        </>
      )}
    </li>
  );
}
