import type { RequirementsDoc } from "./types";

/**
 * The pre-verified demo document (spec section 4.7). Everything renders and
 * edits against this until the model route is wired in (build step 4).
 *
 * Domain: a patient-referral intake system workshop. Chosen because it is
 * specific enough to show BA judgement and safe enough to demo.
 */
export const SAMPLE_DOC: RequirementsDoc = {
  meta: {
    projectName: "Patient Referral Intake",
    stakeholders: ["Referral coordinator lead", "Triage nurse", "Clinical lead", "IT integration"],
    meetingDate: "2026-08-28",
    generatedAt: "2026-09-03T09:00:00.000Z",
  },
  requirements: [
    {
      id: "R1",
      kind: "functional",
      text: "The system must let a referral coordinator record a new referral with referrer details, patient demographics, and reason for referral in a single form.",
      status: "ok",
    },
    {
      id: "R2",
      kind: "functional",
      text: "The system must block submission of a referral that is missing mandatory clinical information and list the missing fields to the coordinator.",
      status: "ok",
    },
    {
      id: "R3",
      kind: "non-functional",
      text: "Referral submission must complete within 3 seconds for up to 200 concurrent coordinators.",
      status: "ok",
    },
    {
      id: "R4",
      kind: "business-rule",
      text: "Referrals for patients under 16 at the date of referral must route to the paediatric triage queue.",
      status: "ok",
    },
    {
      id: "R5",
      kind: "constraint",
      text: "Patient identity must be resolved through the existing NHS Spine lookup; the system must not create a new patient identity store.",
      status: "ok",
    },
  ],
  userStories: [
    {
      id: "US1",
      derivedFrom: "R1",
      asA: "a referral coordinator",
      iWant: "to record a referral in one form",
      soThat: "I do not re-key data from emails and letters",
      priority: "must",
      status: "ok",
    },
    {
      id: "US2",
      derivedFrom: "R2",
      asA: "a referral coordinator",
      iWant: "missing mandatory fields highlighted before I submit",
      soThat: "incomplete referrals do not reach triage",
      priority: "must",
      status: "ok",
    },
    {
      id: "US3",
      derivedFrom: "R1",
      asA: "a referral coordinator",
      iWant: "patient demographics pre-filled from the NHS number",
      soThat: "I spend less time typing and make fewer transcription errors",
      priority: "should",
      status: "ok",
    },
  ],
  acceptanceCriteria: [
    {
      id: "AC1.1",
      storyId: "US1",
      given: "a referral with every mandatory field completed",
      when: "the coordinator submits the form",
      then: "the referral is created and given a unique reference number",
      status: "ok",
    },
    {
      id: "AC1.2",
      storyId: "US1",
      given: "a referral in progress",
      when: "the coordinator saves it as a draft",
      then: "it is retained for at least 30 days and can be reopened by the same coordinator",
      status: "ok",
    },
    {
      id: "AC2.1",
      storyId: "US2",
      given: "a referral missing a mandatory clinical field",
      when: "the coordinator attempts to submit",
      then: "submission is blocked and each missing field is named",
      status: "ok",
    },
    {
      id: "AC3.1",
      storyId: "US3",
      given: "a valid NHS number entered in the referral form",
      when: "the coordinator moves focus off the field",
      then: "name, date of birth, and address are pre-filled from the Spine lookup",
      status: "ok",
    },
  ],
  risks: [
    {
      id: "RSK1",
      text: "NHS Spine lookup latency could push submission past the 3-second target; needs a timeout and a manual-entry fallback.",
    },
    {
      id: "RSK2",
      text: "\"Mandatory clinical information\" was not fully defined in the workshop; the field list needs sign-off from the clinical lead.",
    },
  ],
  assumptions: [
    {
      id: "ASM1",
      text: "Coordinators already have authenticated NHS Spine access through their existing smartcard login.",
    },
    {
      id: "ASM2",
      text: "The paediatric cut-off is measured at the date of referral, not the date of the eventual appointment.",
    },
  ],
  openQuestions: [
    {
      id: "OQ1",
      text: "If the Spine lookup returns no match, is the referral rejected or allowed with a manual-entry flag?",
    },
    {
      id: "OQ2",
      text: "Who can edit a referral after submission, and up to what point in the triage process?",
    },
  ],
};
