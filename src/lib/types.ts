/**
 * The document schema. The model returns this shape (Part B, section B4 of the
 * spec); the app validates it, then renders and edits it entirely in memory.
 */

export type RequirementKind =
  | "functional"
  | "non-functional"
  | "business-rule"
  | "constraint";

export const REQUIREMENT_KINDS: RequirementKind[] = [
  "functional",
  "non-functional",
  "business-rule",
  "constraint",
];

export const REQUIREMENT_KIND_LABEL: Record<RequirementKind, string> = {
  functional: "Functional",
  "non-functional": "Non-functional",
  "business-rule": "Business rule",
  constraint: "Constraint",
};

export type Priority = "unset" | "must" | "should" | "could" | "wont";

export const PRIORITIES: Priority[] = ["unset", "must", "should", "could", "wont"];

export const PRIORITY_LABEL: Record<Priority, string> = {
  unset: "Priority not set",
  must: "Must",
  should: "Should",
  could: "Could",
  wont: "Won't",
};

/** Requirements are the editable source of truth; an edit marks them "edited". */
export type RequirementStatus = "ok" | "edited";

/** Downstream items are flagged "review-needed" when their parent changes. */
export type DownstreamStatus = "ok" | "review-needed";

export interface DocMeta {
  projectName: string | null;
  stakeholders: string[];
  meetingDate: string | null;
  generatedAt: string;
}

export interface Requirement {
  id: string;
  kind: RequirementKind;
  text: string;
  status: RequirementStatus;
}

export interface UserStory {
  id: string;
  /** id of the functional requirement this story derives from */
  derivedFrom: string;
  asA: string;
  iWant: string;
  soThat: string;
  priority: Priority;
  status: DownstreamStatus;
}

export interface AcceptanceCriterion {
  id: string;
  storyId: string;
  given: string;
  when: string;
  then: string;
  status: DownstreamStatus;
}

export interface LabeledItem {
  id: string;
  text: string;
}

/** A contradiction the model found - between notes, backlog tickets, or both. */
export interface Conflict {
  id: string;
  description: string;
  involves: string[];
  recommendation: string;
}

export interface RequirementsDoc {
  meta: DocMeta;
  businessGoals: LabeledItem[];
  requirements: Requirement[];
  conflicts: Conflict[];
  userStories: UserStory[];
  acceptanceCriteria: AcceptanceCriterion[];
  risks: LabeledItem[];
  assumptions: LabeledItem[];
  openQuestions: LabeledItem[];
}

export function storyStatement(story: UserStory): string {
  return `As ${story.asA}, I want ${story.iWant}, so that ${story.soThat}.`;
}

export function criterionStatement(ac: AcceptanceCriterion): string {
  return `Given ${ac.given}, when ${ac.when}, then ${ac.then}.`;
}
