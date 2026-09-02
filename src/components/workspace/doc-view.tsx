"use client";

import type { LabeledItem, RequirementsDoc } from "@/lib/types";
import { RequirementItem } from "./requirement-item";
import { StoryItem, type StoryPatch } from "./story-item";
import { CriterionItem, type CriterionPatch } from "./criterion-item";
import { LabeledItemRow } from "./labeled-item";

export type LabeledSection = "risks" | "assumptions" | "openQuestions";

export interface DocHandlers {
  editRequirement: (id: string, text: string) => void;
  editStory: (id: string, patch: StoryPatch) => void;
  editCriterion: (id: string, patch: CriterionPatch) => void;
  markReviewed: (kind: "story" | "criterion", id: string) => void;
  editLabeled: (section: LabeledSection, id: string, text: string) => void;
}

function Section({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-rule pt-7 first:border-t-0 first:pt-0">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[0.72rem] text-ink-faint">{index}</span>
        <h2 className="font-display text-lg font-semibold tracking-tight text-ink">{title}</h2>
        {note && <span className="font-mono text-[0.68rem] text-ink-faint">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function LabeledList({
  items,
  section,
  emptyLabel,
  onEdit,
}: {
  items: LabeledItem[];
  section: LabeledSection;
  emptyLabel: string;
  onEdit: DocHandlers["editLabeled"];
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-rule-strong px-3 py-2.5 text-[0.82rem] text-ink-faint">
        {emptyLabel}
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <LabeledItemRow
          key={item.id}
          item={item}
          onEdit={(id, text) => onEdit(section, id, text)}
        />
      ))}
    </ul>
  );
}

export function DocView({ doc, handlers }: { doc: RequirementsDoc; handlers: DocHandlers }) {
  return (
    <div className="space-y-8">
      <Section
        index="01"
        title="Requirements"
        note={`${doc.requirements.length} items · editable source of truth`}
      >
        <ul className="space-y-2">
          {doc.requirements.map((requirement) => (
            <RequirementItem
              key={requirement.id}
              requirement={requirement}
              onEdit={handlers.editRequirement}
            />
          ))}
        </ul>
      </Section>

      <Section
        index="02"
        title="User stories"
        note={`${doc.userStories.length} · one per functional requirement`}
      >
        <ul className="space-y-2">
          {doc.userStories.map((story) => (
            <StoryItem
              key={story.id}
              story={story}
              onEdit={handlers.editStory}
              onReviewed={(id) => handlers.markReviewed("story", id)}
            />
          ))}
        </ul>
      </Section>

      <Section index="03" title="Acceptance criteria" note={`${doc.acceptanceCriteria.length} · Given / When / Then`}>
        <ul className="space-y-2">
          {doc.acceptanceCriteria.map((criterion) => (
            <CriterionItem
              key={criterion.id}
              criterion={criterion}
              onEdit={handlers.editCriterion}
              onReviewed={(id) => handlers.markReviewed("criterion", id)}
            />
          ))}
        </ul>
      </Section>

      <Section index="04" title="Risks">
        <LabeledList
          items={doc.risks}
          section="risks"
          emptyLabel="No risks were surfaced from the notes."
          onEdit={handlers.editLabeled}
        />
      </Section>

      <Section index="05" title="Assumptions">
        <LabeledList
          items={doc.assumptions}
          section="assumptions"
          emptyLabel="No assumptions were recorded."
          onEdit={handlers.editLabeled}
        />
      </Section>

      <Section index="06" title="Open questions">
        <LabeledList
          items={doc.openQuestions}
          section="openQuestions"
          emptyLabel="No open questions — unusual for a first draft; check the notes had enough detail."
          onEdit={handlers.editLabeled}
        />
      </Section>
    </div>
  );
}
