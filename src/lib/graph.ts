/**
 * Traceability graph and change-impact logic (spec Part B, section B5).
 *
 * This is the deterministic core of the app: no model call anywhere in here.
 * It is a plain walk over the parent references the document already carries
 * (`userStory.derivedFrom` -> requirement, `acceptanceCriterion.storyId` -> story).
 *
 * Every function returns a new document; nothing is mutated in place.
 */

import type {
  AcceptanceCriterion,
  RequirementsDoc,
  UserStory,
} from "./types";

export interface DocIndex {
  /** requirement id -> ids of stories derived from it */
  storiesByRequirement: Map<string, string[]>;
  /** story id -> ids of its acceptance criteria */
  criteriaByStory: Map<string, string[]>;
}

export function buildIndex(doc: RequirementsDoc): DocIndex {
  const storiesByRequirement = new Map<string, string[]>();
  for (const story of doc.userStories) {
    const list = storiesByRequirement.get(story.derivedFrom) ?? [];
    list.push(story.id);
    storiesByRequirement.set(story.derivedFrom, list);
  }

  const criteriaByStory = new Map<string, string[]>();
  for (const ac of doc.acceptanceCriteria) {
    const list = criteriaByStory.get(ac.storyId) ?? [];
    list.push(ac.id);
    criteriaByStory.set(ac.storyId, list);
  }

  return { storiesByRequirement, criteriaByStory };
}

export interface Descendants {
  storyIds: Set<string>;
  criterionIds: Set<string>;
}

/** Stories derived from a requirement, plus every criterion under those stories. */
export function requirementDescendants(
  doc: RequirementsDoc,
  requirementId: string,
  index: DocIndex = buildIndex(doc),
): Descendants {
  const storyIds = new Set(index.storiesByRequirement.get(requirementId) ?? []);
  const criterionIds = new Set<string>();
  for (const storyId of storyIds) {
    for (const acId of index.criteriaByStory.get(storyId) ?? []) {
      criterionIds.add(acId);
    }
  }
  return { storyIds, criterionIds };
}

/**
 * Apply an edit to a requirement's text. If the text actually changed, the
 * requirement is marked "edited" and all descendant stories and criteria are
 * marked "review-needed".
 */
export function editRequirementText(
  doc: RequirementsDoc,
  requirementId: string,
  nextText: string,
): RequirementsDoc {
  const requirement = doc.requirements.find((r) => r.id === requirementId);
  const trimmed = nextText.trim();
  if (!requirement || trimmed === requirement.text) return doc;

  const { storyIds, criterionIds } = requirementDescendants(doc, requirementId);

  return {
    ...doc,
    requirements: doc.requirements.map((r) =>
      r.id === requirementId ? { ...r, text: trimmed, status: "edited" } : r,
    ),
    userStories: doc.userStories.map((s) =>
      storyIds.has(s.id) ? { ...s, status: "review-needed" } : s,
    ),
    acceptanceCriteria: doc.acceptanceCriteria.map((a) =>
      criterionIds.has(a.id) ? { ...a, status: "review-needed" } : a,
    ),
  };
}

export type DownstreamKind = "story" | "criterion";

/** Clear the review flag on a single downstream item. */
export function markReviewed(
  doc: RequirementsDoc,
  kind: DownstreamKind,
  id: string,
): RequirementsDoc {
  if (kind === "story") {
    return {
      ...doc,
      userStories: doc.userStories.map((s) =>
        s.id === id ? { ...s, status: "ok" } : s,
      ),
    };
  }
  return {
    ...doc,
    acceptanceCriteria: doc.acceptanceCriteria.map((a) =>
      a.id === id ? { ...a, status: "ok" } : a,
    ),
  };
}

export interface ImpactItem {
  kind: DownstreamKind;
  id: string;
  /** id of the requirement whose edit put this item under review */
  from: string | null;
}

/** Every downstream item currently flagged for review, with its trigger. */
export function reviewQueue(doc: RequirementsDoc): ImpactItem[] {
  const index = buildIndex(doc);

  const editedRequirementByStory = new Map<string, string>();
  for (const requirement of doc.requirements) {
    if (requirement.status !== "edited") continue;
    for (const storyId of index.storiesByRequirement.get(requirement.id) ?? []) {
      editedRequirementByStory.set(storyId, requirement.id);
    }
  }

  const storyParent = new Map(doc.userStories.map((s) => [s.id, s.derivedFrom]));

  const items: ImpactItem[] = [];
  for (const story of doc.userStories) {
    if (story.status === "review-needed") {
      items.push({
        kind: "story",
        id: story.id,
        from: editedRequirementByStory.get(story.id) ?? null,
      });
    }
  }
  for (const ac of doc.acceptanceCriteria) {
    if (ac.status === "review-needed") {
      const parentRequirement =
        editedRequirementByStory.get(ac.storyId) ??
        storyParent.get(ac.storyId) ??
        null;
      items.push({ kind: "criterion", id: ac.id, from: parentRequirement });
    }
  }
  return items;
}

export function reviewCount(doc: RequirementsDoc): number {
  return (
    doc.userStories.filter((s) => s.status === "review-needed").length +
    doc.acceptanceCriteria.filter((a) => a.status === "review-needed").length
  );
}

/** Convenience for the impact panel: resolve queued ids back to their objects. */
export function resolveImpact(doc: RequirementsDoc): {
  stories: UserStory[];
  criteria: AcceptanceCriterion[];
} {
  return {
    stories: doc.userStories.filter((s) => s.status === "review-needed"),
    criteria: doc.acceptanceCriteria.filter((a) => a.status === "review-needed"),
  };
}
