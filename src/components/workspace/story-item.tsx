"use client";

import { useState } from "react";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  storyStatement,
  type Priority,
  type UserStory,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Btn, FieldLabel, IdTag, MetaTag, ReviewPill, editorFieldClass } from "./primitives";

export interface StoryPatch {
  asA: string;
  iWant: string;
  soThat: string;
  priority: Priority;
}

export function StoryItem({
  story,
  onEdit,
  onReviewed,
}: {
  story: UserStory;
  onEdit: (id: string, patch: StoryPatch) => void;
  onReviewed: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StoryPatch>({
    asA: story.asA,
    iWant: story.iWant,
    soThat: story.soThat,
    priority: story.priority,
  });

  const needsReview = story.status === "review-needed";

  function open() {
    setDraft({ asA: story.asA, iWant: story.iWant, soThat: story.soThat, priority: story.priority });
    setEditing(true);
  }
  function save() {
    onEdit(story.id, draft);
    setEditing(false);
  }

  return (
    <li
      id={story.id}
      className={cn(
        "scroll-mt-24 rounded-md border bg-surface p-4",
        needsReview ? "border-flag/40" : "border-rule",
      )}
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <IdTag>{story.id}</IdTag>
        <MetaTag>from {story.derivedFrom}</MetaTag>
        {story.priority !== "unset" && <MetaTag>{PRIORITY_LABEL[story.priority]}</MetaTag>}
        {needsReview && <ReviewPill />}
        <span className="flex-1" />
        {needsReview && (
          <Btn variant="outline" onClick={() => onReviewed(story.id)}>
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
            <label className="block">
              <FieldLabel>As&hellip;</FieldLabel>
              <textarea
                rows={2}
                value={draft.asA}
                onChange={(e) => setDraft({ ...draft, asA: e.target.value })}
                className={editorFieldClass}
              />
            </label>
            <label className="block">
              <FieldLabel>I want&hellip;</FieldLabel>
              <textarea
                rows={2}
                value={draft.iWant}
                onChange={(e) => setDraft({ ...draft, iWant: e.target.value })}
                className={editorFieldClass}
              />
            </label>
            <label className="block">
              <FieldLabel>So that&hellip;</FieldLabel>
              <textarea
                rows={2}
                value={draft.soThat}
                onChange={(e) => setDraft({ ...draft, soThat: e.target.value })}
                className={editorFieldClass}
              />
            </label>
          </div>
          <label className="block">
            <FieldLabel>Priority (you set this)</FieldLabel>
            <select
              value={draft.priority}
              onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
              className="h-9 rounded-md border border-rule-strong bg-paper px-2 font-sans text-[0.85rem] text-ink focus:border-accent focus:outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </label>
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
        <p className="text-[0.92rem] leading-relaxed text-ink">{storyStatement(story)}</p>
      )}
    </li>
  );
}
