"use client";

import { useState } from "react";
import { REQUIREMENT_KIND_LABEL, type Requirement } from "@/lib/types";
import { Btn, EditedPill, IdTag, MetaTag, editorFieldClass } from "./primitives";

export function RequirementItem({
  requirement,
  onEdit,
}: {
  requirement: Requirement;
  onEdit: (id: string, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(requirement.text);

  function open() {
    setDraft(requirement.text);
    setEditing(true);
  }
  function save() {
    onEdit(requirement.id, draft);
    setEditing(false);
  }
  function cancel() {
    setDraft(requirement.text);
    setEditing(false);
  }

  return (
    <li id={requirement.id} className="scroll-mt-24 rounded-md border border-rule bg-surface p-4">
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <IdTag>{requirement.id}</IdTag>
        <MetaTag>{REQUIREMENT_KIND_LABEL[requirement.kind]}</MetaTag>
        {requirement.status === "edited" && <EditedPill />}
        <span className="flex-1" />
        {!editing && (
          <Btn variant="ghost" onClick={open}>
            Edit
          </Btn>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            autoFocus
            className={editorFieldClass}
          />
          <div className="flex gap-2">
            <Btn variant="solid" onClick={save}>
              Save
            </Btn>
            <Btn variant="outline" onClick={cancel}>
              Cancel
            </Btn>
          </div>
          <p className="font-mono text-[0.68rem] leading-relaxed text-ink-faint">
            Saving a changed requirement flags its user stories and acceptance criteria for review.
          </p>
        </div>
      ) : (
        <p className="text-[0.92rem] leading-relaxed text-ink">{requirement.text}</p>
      )}
    </li>
  );
}
