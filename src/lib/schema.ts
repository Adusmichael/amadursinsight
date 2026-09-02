import type { Priority, RequirementKind } from "./types";

/**
 * The tool the model is forced to call. `strict: true` + this schema make the
 * returned `input` conform exactly; the semantic repair (ID regeneration,
 * orphan pruning) happens afterwards in normalize.ts.
 */
export const EXTRACTION_TOOL_NAME = "record_requirements";

const labeledArray = (idHint: string) => ({
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["id", "text"],
    properties: {
      id: { type: "string", description: idHint },
      text: { type: "string" },
    },
  },
});

export const extractionInputSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "requirements",
    "userStories",
    "acceptanceCriteria",
    "risks",
    "assumptions",
    "openQuestions",
  ],
  properties: {
    requirements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "kind", "text"],
        properties: {
          id: { type: "string", description: "short id, e.g. R1" },
          kind: {
            type: "string",
            enum: ["functional", "non-functional", "business-rule", "constraint"],
          },
          text: { type: "string", description: "one clear, testable statement" },
        },
      },
    },
    userStories: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "derivedFrom", "asA", "iWant", "soThat", "priority"],
        properties: {
          id: { type: "string", description: "short id, e.g. US1" },
          derivedFrom: {
            type: "string",
            description: "id of the functional requirement this story implements",
          },
          asA: { type: "string", description: "the role, without the leading 'As a'" },
          iWant: { type: "string", description: "the goal, without the leading 'I want'" },
          soThat: { type: "string", description: "the benefit, without the leading 'so that'" },
          priority: {
            type: "string",
            enum: ["unset", "must", "should", "could", "wont"],
          },
        },
      },
    },
    acceptanceCriteria: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "storyId", "given", "when", "then"],
        properties: {
          id: { type: "string", description: "short id, e.g. AC1.1" },
          storyId: { type: "string", description: "id of the user story this verifies" },
          given: { type: "string" },
          when: { type: "string" },
          then: { type: "string" },
        },
      },
    },
    risks: labeledArray("short id, e.g. RSK1"),
    assumptions: labeledArray("short id, e.g. ASM1"),
    openQuestions: labeledArray("short id, e.g. OQ1"),
  },
};

export interface RawRequirement {
  id: string;
  kind: RequirementKind;
  text: string;
}
export interface RawStory {
  id: string;
  derivedFrom: string;
  asA: string;
  iWant: string;
  soThat: string;
  priority: Priority;
}
export interface RawCriterion {
  id: string;
  storyId: string;
  given: string;
  when: string;
  then: string;
}
export interface RawLabeled {
  id: string;
  text: string;
}
export interface RawModelDoc {
  requirements: RawRequirement[];
  userStories: RawStory[];
  acceptanceCriteria: RawCriterion[];
  risks: RawLabeled[];
  assumptions: RawLabeled[];
  openQuestions: RawLabeled[];
}
