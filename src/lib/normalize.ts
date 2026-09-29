/**
 * Turn the model's raw tool output into a clean RequirementsDoc.
 *
 * The model is asked for well-formed data, but this layer does not trust it:
 * IDs are regenerated in order (R1..Rn, US1..USm, AC{n}.{k}, RSK/ASM/OQ),
 * every `derivedFrom` must resolve to a functional requirement or the story is
 * dropped, every `storyId` must resolve or the criterion is dropped, and blank
 * items are removed. The result always has a fully connected trace graph.
 */

import {
  PRIORITIES,
  REQUIREMENT_KINDS,
  type AcceptanceCriterion,
  type Conflict,
  type DocMeta,
  type LabeledItem,
  type Priority,
  type Requirement,
  type RequirementKind,
  type RequirementsDoc,
  type UserStory,
} from "./types";

export interface MetaInput {
  projectName: string;
  stakeholders: string;
  meetingDate: string;
}

type Bag = Record<string, unknown>;

const arr = (value: unknown): Bag[] =>
  Array.isArray(value) ? value.filter((v): v is Bag => !!v && typeof v === "object") : [];

const str = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

const kindOf = (value: unknown): RequirementKind =>
  REQUIREMENT_KINDS.includes(value as RequirementKind)
    ? (value as RequirementKind)
    : "functional";

const priorityOf = (value: unknown): Priority =>
  PRIORITIES.includes(value as Priority) ? (value as Priority) : "unset";

export function normalizeModelDoc(raw: unknown, meta: MetaInput): RequirementsDoc {
  const bag = (raw && typeof raw === "object" ? raw : {}) as Bag;

  // --- requirements: regenerate ids, remember old -> new ---
  const reqIdByOld = new Map<string, string>();
  const requirements: Requirement[] = arr(bag.requirements)
    .map((r) => ({ text: str(r.text), kind: kindOf(r.kind), oldId: str(r.id) }))
    .filter((r) => r.text.length > 0)
    .map((r, index) => {
      const id = `R${index + 1}`;
      if (r.oldId) reqIdByOld.set(r.oldId, id);
      return { id, kind: r.kind, text: r.text, status: "ok" as const };
    });

  const functionalIds = new Set(
    requirements.filter((r) => r.kind === "functional").map((r) => r.id),
  );

  // --- user stories: keep only those tracing to a functional requirement ---
  const storyIdByOld = new Map<string, string>();
  const userStories: UserStory[] = [];
  for (const s of arr(bag.userStories)) {
    const parent = reqIdByOld.get(str(s.derivedFrom));
    if (!parent || !functionalIds.has(parent)) continue;
    const asA = str(s.asA);
    const iWant = str(s.iWant);
    const soThat = str(s.soThat);
    if (!asA || !iWant || !soThat) continue;

    const id = `US${userStories.length + 1}`;
    const oldId = str(s.id);
    if (oldId) storyIdByOld.set(oldId, id);
    userStories.push({
      id,
      derivedFrom: parent,
      asA,
      iWant,
      soThat,
      priority: priorityOf(s.priority),
      status: "ok",
    });
  }

  const storyIndexById = new Map(userStories.map((s, i) => [s.id, i + 1]));

  // --- acceptance criteria: keep only those tracing to a kept story ---
  const perStory = new Map<string, number>();
  const acceptanceCriteria: AcceptanceCriterion[] = [];
  for (const c of arr(bag.acceptanceCriteria)) {
    const storyId = storyIdByOld.get(str(c.storyId));
    if (!storyId) continue;
    const given = str(c.given);
    const when = str(c.when);
    const then = str(c.then);
    if (!given || !when || !then) continue;

    const n = (perStory.get(storyId) ?? 0) + 1;
    perStory.set(storyId, n);
    acceptanceCriteria.push({
      id: `AC${storyIndexById.get(storyId)}.${n}`,
      storyId,
      given,
      when,
      then,
      status: "ok",
      // Always fresh, regardless of raw input - the model never sets this.
      testStatus: "untested",
    });
  }

  const labeled = (value: unknown, prefix: string): LabeledItem[] =>
    arr(value)
      .map((x) => str(x.text))
      .filter(Boolean)
      .map((text, index) => ({ id: `${prefix}${index + 1}`, text }));

  // --- conflicts: distinct requirement/ticket contradictions, never auto-resolved ---
  const conflicts: Conflict[] = arr(bag.conflicts)
    .map((c) => ({
      description: str(c.description),
      recommendation: str(c.recommendation),
      involves: Array.isArray(c.involves)
        ? c.involves.map((v) => str(v)).filter(Boolean)
        : [],
    }))
    .filter((c) => c.description.length > 0 && c.recommendation.length > 0)
    .map((c, index) => ({ id: `CFL${index + 1}`, ...c }));

  const docMeta: DocMeta = {
    projectName: meta.projectName.trim() || null,
    stakeholders: meta.stakeholders
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
    meetingDate: meta.meetingDate.trim() || null,
    generatedAt: new Date().toISOString(),
  };

  return {
    meta: docMeta,
    businessGoals: labeled(bag.businessGoals, "BG"),
    requirements,
    conflicts,
    userStories,
    acceptanceCriteria,
    risks: labeled(bag.risks, "RSK"),
    assumptions: labeled(bag.assumptions, "ASM"),
    openQuestions: labeled(bag.openQuestions, "OQ"),
  };
}
