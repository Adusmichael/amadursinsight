import { describe, expect, it } from "vitest";
import { normalizeModelDoc } from "../normalize";
import { buildIndex } from "../graph";

const META = { projectName: "", stakeholders: "", meetingDate: "" };

describe("normalizeModelDoc", () => {
  it("regenerates ids in order and keeps the trace graph connected", () => {
    const raw = {
      requirements: [
        { id: "REQ-A", kind: "functional", text: "Record a referral in one form." },
        { id: "REQ-B", kind: "constraint", text: "Use the existing identity service." },
        { id: "REQ-C", kind: "functional", text: "Block submission when clinical fields are missing." },
      ],
      userStories: [
        { id: "S1", derivedFrom: "REQ-A", asA: "a coordinator", iWant: "one form", soThat: "no re-keying", priority: "must" },
        { id: "S2", derivedFrom: "REQ-C", asA: "a coordinator", iWant: "missing fields flagged", soThat: "triage gets complete data", priority: "should" },
      ],
      acceptanceCriteria: [
        { id: "X", storyId: "S1", given: "a complete referral", when: "submitted", then: "a reference number is issued" },
        { id: "Y", storyId: "S1", given: "a draft", when: "saved", then: "it can be reopened" },
        { id: "Z", storyId: "S2", given: "a missing field", when: "submit is pressed", then: "submission is blocked" },
      ],
      risks: [{ id: "r", text: "Identity service latency." }],
      assumptions: [{ id: "a", text: "Coordinators are already authenticated." }],
      openQuestions: [{ id: "q", text: "What happens on no identity match?" }],
    };

    const doc = normalizeModelDoc(raw, META);

    expect(doc.requirements.map((r) => r.id)).toEqual(["R1", "R2", "R3"]);
    expect(doc.userStories.map((s) => s.id)).toEqual(["US1", "US2"]);
    expect(doc.userStories.map((s) => s.derivedFrom)).toEqual(["R1", "R3"]);
    expect(doc.acceptanceCriteria.map((c) => c.id)).toEqual(["AC1.1", "AC1.2", "AC2.1"]);
    expect(doc.acceptanceCriteria.map((c) => c.storyId)).toEqual(["US1", "US1", "US2"]);
    expect(doc.risks[0].id).toBe("RSK1");
    expect(doc.assumptions[0].id).toBe("ASM1");
    expect(doc.openQuestions[0].id).toBe("OQ1");

    // graph resolves with no dangling references
    const index = buildIndex(doc);
    for (const story of doc.userStories) {
      expect(doc.requirements.some((r) => r.id === story.derivedFrom)).toBe(true);
    }
    expect(index.storiesByRequirement.get("R1")).toEqual(["US1"]);
  });

  it("drops stories that trace to a non-functional requirement or an unknown id", () => {
    const raw = {
      requirements: [
        { id: "A", kind: "functional", text: "Do the thing." },
        { id: "B", kind: "non-functional", text: "Do it within 2 seconds." },
      ],
      userStories: [
        { id: "s1", derivedFrom: "A", asA: "a user", iWant: "the thing", soThat: "value", priority: "unset" },
        { id: "s2", derivedFrom: "B", asA: "a user", iWant: "speed", soThat: "value", priority: "unset" },
        { id: "s3", derivedFrom: "GHOST", asA: "a user", iWant: "x", soThat: "y", priority: "unset" },
      ],
      acceptanceCriteria: [
        { id: "c1", storyId: "s2", given: "g", when: "w", then: "t" },
        { id: "c2", storyId: "s1", given: "g", when: "w", then: "t" },
      ],
      risks: [],
      assumptions: [],
      openQuestions: [],
    };

    const doc = normalizeModelDoc(raw, META);

    expect(doc.userStories.map((s) => s.id)).toEqual(["US1"]);
    expect(doc.userStories[0].derivedFrom).toBe("R1");
    // only the criterion under the surviving story is kept
    expect(doc.acceptanceCriteria.map((c) => c.id)).toEqual(["AC1.1"]);
  });

  it("removes blank items and applies request metadata", () => {
    const raw = {
      requirements: [
        { id: "A", kind: "functional", text: "  " },
        { id: "B", kind: "functional", text: "A real requirement." },
      ],
      userStories: [],
      acceptanceCriteria: [],
      risks: [{ id: "r1", text: "" }, { id: "r2", text: "A real risk." }],
      assumptions: [],
      openQuestions: [],
    };

    const doc = normalizeModelDoc(raw, {
      projectName: "  Referral Intake  ",
      stakeholders: "Jo, Priya , , Marcus",
      meetingDate: "2026-08-28",
    });

    expect(doc.requirements.map((r) => r.id)).toEqual(["R1"]);
    expect(doc.requirements[0].text).toBe("A real requirement.");
    expect(doc.risks.map((r) => r.text)).toEqual(["A real risk."]);
    expect(doc.meta.projectName).toBe("Referral Intake");
    expect(doc.meta.stakeholders).toEqual(["Jo", "Priya", "Marcus"]);
    expect(doc.meta.meetingDate).toBe("2026-08-28");
  });

  it("tolerates a malformed payload without throwing", () => {
    expect(() => normalizeModelDoc(null, META)).not.toThrow();
    expect(() => normalizeModelDoc({ requirements: "nope" }, META)).not.toThrow();
    expect(normalizeModelDoc({}, META).requirements).toEqual([]);
  });
});
