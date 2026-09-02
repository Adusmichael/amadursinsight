"use client";

import { useState } from "react";
import type { LabeledItem } from "@/lib/types";
import { Btn, IdTag, editorFieldClass } from "./primitives";

export function LabeledItemRow({
  item,
  onEdit,
}: {
  item: LabeledItem;
  onEdit: (id: string, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);

  function save() {
    onEdit(item.id, draft);
    setEditing(false);
  }

  return (
    <li id={item.id} className="scroll-mt-24 rounded-md border border-rule bg-surface p-4">
      <div className="mb-1.5 flex items-center gap-2">
        <IdTag>{item.id}</IdTag>
        <span className="flex-1" />
        {!editing && (
          <Btn
            variant="ghost"
            onClick={() => {
              setDraft(item.text);
              setEditing(true);
            }}
          >
            Edit
          </Btn>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={editorFieldClass}
          />
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
        <p className="text-[0.92rem] leading-relaxed text-ink">{item.text}</p>
      )}
    </li>
  );
}
