"use client";

import { useState } from "react";
import { criterionStatement, type AcceptanceCriterion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Btn, FieldLabel, IdTag, MetaTag, ReviewPill, editorFieldClass } from "./primitives";

export interface CriterionPatch {
  given: string;
  when: string;
  then: string;
}

export function CriterionItem({
  criterion,
  onEdit,
  onReviewed,
}: {
  criterion: AcceptanceCriterion;
  onEdit: (id: string, patch: CriterionPatch) => void;
  onReviewed: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CriterionPatch>({
    given: criterion.given,
    when: criterion.when,
    then: criterion.then,
  });

  const needsReview = criterion.status === "review-needed";

  function open() {
    setDraft({ given: criterion.given, when: criterion.when, then: criterion.then });
    setEditing(true);
  }
  function save() {
    onEdit(criterion.id, draft);
    setEditing(false);
  }

  return (
    <li
      id={criterion.id}
      className={cn(
        "scroll-mt-24 rounded-md border bg-surface p-4",
        needsReview ? "border-flag/40" : "border-rule",
      )}
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <IdTag>{criterion.id}</IdTag>
        <MetaTag>{criterion.storyId}</MetaTag>
        {needsReview && <ReviewPill />}
        <span className="flex-1" />
        {needsReview && (
          <Btn variant="outline" onClick={() => onReviewed(criterion.id)}>
            Mark reviewed
          </Btn>
        )}
        {!editing && (
          <Btn variant="ghost" onClick={open}>
            Edit
          </Btn>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {(["given", "when", "then"] as const).map((key) => (
              <label key={key} className="block">
                <FieldLabel>{key}&hellip;</FieldLabel>
                <textarea
                  rows={2}
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className={editorFieldClass}
                />
              </label>
            ))}
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
        <p className="text-[0.92rem] leading-relaxed text-ink">{criterionStatement(criterion)}</p>
      )}
    </li>
  );
}
