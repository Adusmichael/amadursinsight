"use client";

import { useState } from "react";
import {
  TEST_STATUSES,
  TEST_STATUS_LABEL,
  criterionStatement,
  type AcceptanceCriterion,
  type TestStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Btn,
  FieldLabel,
  IdTag,
  MetaTag,
  ReviewPill,
  StalePassPill,
  editorFieldClass,
} from "./primitives";

export interface CriterionPatch {
  given: string;
  when: string;
  then: string;
}

const TEST_STATUS_CLASS: Record<TestStatus, string> = {
  untested: "border-rule-strong text-ink-faint hover:bg-code-bg",
  passed: "border-good/50 bg-good-wash text-good",
  failed: "border-bad/50 bg-bad-wash text-bad",
};

function TestStatusControl({
  value,
  onChange,
}: {
  value: TestStatus;
  onChange: (next: TestStatus) => void;
}) {
  return (
    <div className="flex gap-1" role="group" aria-label="Test status">
      {TEST_STATUSES.map((status) => (
        <button
          key={status}
          type="button"
          aria-pressed={value === status}
          onClick={() => onChange(status)}
          className={cn(
            "rounded-sm border px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.06em] transition-colors",
            value === status ? TEST_STATUS_CLASS[status] : "border-rule text-ink-faint hover:bg-code-bg",
          )}
        >
          {TEST_STATUS_LABEL[status]}
        </button>
      ))}
    </div>
  );
}

export function CriterionItem({
  criterion,
  onEdit,
  onReviewed,
  onSetTestStatus,
}: {
  criterion: AcceptanceCriterion;
  onEdit: (id: string, patch: CriterionPatch) => void;
  onReviewed: (id: string) => void;
  onSetTestStatus: (id: string, status: TestStatus) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CriterionPatch>({
    given: criterion.given,
    when: criterion.when,
    then: criterion.then,
  });

  const needsReview = criterion.status === "review-needed";
  const stalePass = needsReview && criterion.testStatus === "passed";

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
        {stalePass ? <StalePassPill /> : needsReview && <ReviewPill />}
        <span className="flex-1" />
        <TestStatusControl
          value={criterion.testStatus}
          onChange={(status) => onSetTestStatus(criterion.id, status)}
        />
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
