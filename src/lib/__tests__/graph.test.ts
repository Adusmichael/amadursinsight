import { describe, expect, it } from "vitest";
import {
  editRequirementText,
  markReviewed,
  requirementDescendants,
  reviewCount,
  reviewQueue,
} from "../graph";
import { SAMPLE_DOC } from "../sample";

describe("traceability graph", () => {
  it("resolves a requirement's descendant stories and criteria", () => {
    const { storyIds, criterionIds } = requirementDescendants(SAMPLE_DOC, "R1");
    expect([...storyIds].sort()).toEqual(["US1", "US3"]);
    expect([...criterionIds].sort()).toEqual(["AC1.1", "AC1.2", "AC3.1"]);
  });

  it("returns no descendants for a requirement with no stories", () => {
    const { storyIds, criterionIds } = requirementDescendants(SAMPLE_DOC, "R5");
    expect(storyIds.size).toBe(0);
    expect(criterionIds.size).toBe(0);
  });
});

describe("editRequirementText", () => {
  it("flags descendants review-needed and marks the requirement edited", () => {
    const next = editRequirementText(SAMPLE_DOC, "R2", "Submission must be blocked when any mandatory field is empty.");

    expect(next.requirements.find((r) => r.id === "R2")?.status).toBe("edited");
    expect(next.userStories.find((s) => s.id === "US2")?.status).toBe("review-needed");
    expect(next.acceptanceCriteria.find((a) => a.id === "AC2.1")?.status).toBe("review-needed");

    // untouched branches stay ok
    expect(next.userStories.find((s) => s.id === "US1")?.status).toBe("ok");
    expect(next.acceptanceCriteria.find((a) => a.id === "AC1.1")?.status).toBe("ok");
  });

  it("is a no-op when the text is unchanged", () => {
    const same = editRequirementText(SAMPLE_DOC, "R2", SAMPLE_DOC.requirements[1].text);
    expect(same).toBe(SAMPLE_DOC);
  });

  it("does not mutate the input document", () => {
    const before = structuredClone(SAMPLE_DOC);
    editRequirementText(SAMPLE_DOC, "R1", "changed text");
    expect(SAMPLE_DOC).toEqual(before);
  });
});

describe("review queue", () => {
  it("lists every flagged item with the requirement that triggered it", () => {
    const edited = editRequirementText(SAMPLE_DOC, "R1", "One combined intake form, revised.");
    const queue = reviewQueue(edited);

    expect(reviewCount(edited)).toBe(queue.length);
    expect(queue.filter((i) => i.kind === "story").map((i) => i.id).sort()).toEqual(["US1", "US3"]);
    expect(queue.every((i) => i.from === "R1")).toBe(true);
  });

  it("markReviewed clears a single item", () => {
    const edited = editRequirementText(SAMPLE_DOC, "R1", "One combined intake form, revised.");
    const cleared = markReviewed(edited, "story", "US1");

    expect(cleared.userStories.find((s) => s.id === "US1")?.status).toBe("ok");
    expect(cleared.userStories.find((s) => s.id === "US3")?.status).toBe("review-needed");
  });
});
