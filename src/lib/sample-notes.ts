/**
 * Domain-neutral demo scenarios for the "Load a sample" picker (spec 4.7).
 * Every scenario is deliberately messy, workshop-note style, and carries at
 * least one internal contradiction so the Conflicts section demonstrates
 * itself without needing a pasted backlog too.
 */

export interface SampleScenario {
  id: string;
  label: string;
  notes: string;
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: "healthcare",
    label: "Healthcare — Patient Referral Intake",
    notes: `Referral intake workshop - 28 Aug
Present: Jo (referral coord lead), Priya (triage nurse), Dr Adeyemi (clinical lead), Marcus (IT)

- coords currently rekey everything from emailed letters + faxes into 3 places, takes ages, lots of typos
- want ONE form: referrer details, patient demographics, reason for referral
- Priya: half the referrals that reach triage are missing key clinical info (meds, obs, presenting complaint). huge time sink chasing it. should be stopped at source
  -> system should not let them submit if mandatory clinical fields blank, and TELL them which ones
- what counts as "mandatory clinical info"? Dr A to confirm the list - not settled today
- under-16s keep getting stuck in the general queue for days. rule: if patient under 16 (at referral date) it must go straight to paediatric triage queue
- Marcus: we are NOT building another patient database. must use the Spine lookup that's already there. enter NHS number, pull name/DOB/address
  - assumes coords are already logged in via smartcard - they are
- if NHS number gives no hit on Spine... unclear. reject? or let them type it manually with a flag? PARKED
- performance: needs to feel instant. maybe 200 coords on at once at peak. target ~3s to submit
  - risk: Spine can be slow, if it times out we still need a way through -> manual entry fallback
- draft save would be nice - coord gets interrupted mid-referral all the time
- who can edit a referral once it's submitted? and until when? not decided
- pre-fill from NHS number would cut the typing right down`,
  },
  {
    id: "retail",
    label: "Retail — Returns & Refunds",
    notes: `Returns process workshop - customer ops team
Present: Dana (returns lead), Kwame (warehouse ops), Priti (finance), Sam (eng)

- customers currently email support to start a return, support manually creates a ticket and a shipping label - takes 2-3 days before customer even gets the label
- want a self-service return: customer enters order number + reason, system decides eligible or not
- Dana: return window is 30 days from delivery, except final-sale items which are never returnable - system must enforce this automatically
- Kwame: warehouse needs to know WHY something was returned (wrong size, damaged, changed mind) to catch quality issues early - currently that info gets lost in email threads
- Priti: refund should only be issued after warehouse scans the item back in, not on request - too many refunds issued for items that never came back
- what counts as "damaged"? photos required? not decided today
- Sam: we already have a shipping label API (ShipEasy) - reuse it, don't build our own label generator
- some customers try to return gift orders without the original purchaser - Dana wants a way to flag these but isn't sure what should happen to them yet
- target: cut return processing time from 3 days to same-day label issue
- Kwame also wants a report of return reasons by product, weekly, to feed back to buying team`,
  },
  {
    id: "fintech",
    label: "Fintech — SME Loan Application",
    notes: `SME loan intake redesign - product & risk sync
Attendees: Grace (product), Femi (credit risk), Ola (compliance), Deji (eng lead)

- applicants currently fill a PDF, email it in, ops re-keys everything into the core banking system - huge source of typos, delays approval by a week
- want an online application: business details, requested amount, purpose, 12 months of bank statements upload
- Femi: any application over $50k must go to manual underwriting review - system should never auto-approve above that threshold
- Ola: we are legally required to run a sanctions/KYC check before ANY funds are released, no exceptions, and it must be logged with a timestamp
- Femi also said: applications under $10k for existing customers (12+ months history) can be auto-approved same day - conflicts a bit with what Ola just said about KYC always running, need to clarify if KYC still runs on the fast-track ones
- Deji: statement upload should accept PDF and CSV, max 20MB per file
- Grace wants a live status tracker for the applicant ("submitted / under review / approved / funded") - visible to applicant, not just internal ops
- unclear: what happens if bank statements look inconsistent with the stated revenue - does it auto-reject, flag for review, or ask applicant to resubmit? not settled
- target metric discussed: reduce time-to-decision from 10 business days to 2, but Femi wasn't sure that's realistic for manual-review cases specifically`,
  },
  {
    id: "edtech",
    label: "EdTech — Course Enrollment",
    notes: `Course enrollment system - academic ops
Present: Ijeoma (registrar), Tom (faculty rep), Beatrice (student services), Wale (dev)

- enrollment currently happens through a shared spreadsheet emailed around each term - multiple people editing it at once, seats get double-booked constantly
- want: students self-enroll online, system enforces seat caps per course
- Tom: prerequisite courses must be checked automatically before allowing enrollment - right now it's the professor's job to notice and it gets missed
- Ijeoma: when a course is full, student should be added to a waitlist automatically, and offered the seat (with a deadline to confirm) if someone drops
- Beatrice: financial holds (unpaid fees) should block enrollment completely - no exceptions per finance policy
- Tom separately said popular courses should let students enroll even with a hold "as long as they promise to pay" - this seems to directly contradict what Beatrice said about no exceptions, wasn't resolved in the room
- Wale: need to integrate with the existing student records system (StudentHub) for prerequisite and hold data, not build a separate database
- what happens if a waitlisted student doesn't respond to the offer in time - do they lose the spot immediately or get a grace period? undecided
- target: reduce double-booking incidents to zero, currently averaging 15+ per term`,
  },
  {
    id: "hr",
    label: "HR — Employee Leave Requests",
    notes: `Leave management workshop - People Ops
Attendees: Ngozi (HR lead), Brian (eng manager), Chidi (payroll), Aisha (HRIS admin)

- leave requests currently go through Slack DMs to managers, no central record, payroll finds out about unpaid leave after the fact and has to correct pay retroactively
- want: employee submits leave request in-app, manager approves/rejects, payroll notified automatically
- Chidi: unpaid leave and paid leave must be tracked as different types from the start - they affect payroll differently and currently get mixed up
- Ngozi: employees should see their remaining leave balance before requesting, calculated automatically, not asked to check with HR
- Brian: needs to see his whole team's leave calendar in one view so two people don't book the same critical week off
- Chidi also wants manager approval to be required for ALL leave types, but Ngozi says sick leave shouldn't need approval, just notification - conflicting requirement, not resolved
- Aisha: this must sync with the existing HRIS (WorkFabric) for balances - do not store leave balances in a second place
- what's the cutoff for "advance notice" required for non-sick leave? mentioned "a few days" but no number agreed
- target: eliminate retroactive payroll corrections caused by unpaid leave, currently happening most pay cycles`,
  },
  {
    id: "logistics",
    label: "Logistics — Delivery Exceptions",
    notes: `Delivery exceptions workshop - fleet ops
Present: Tunde (dispatch lead), Grace (customer care), Femi (driver ops), Chinwe (eng)

- when a delivery fails (no answer, wrong address, damaged package) drivers currently just text dispatch, dispatch decides ad-hoc what happens - no consistent process, customers get different treatment for the same issue
- want: driver logs the exception type in the app at point of failure, system decides next step based on rules
- Tunde: "no answer" should auto-schedule a second attempt next business day, no human needed
- Grace: damaged package should NEVER be re-attempted automatically - must go to customer care for a decision (refund vs replacement) every time
- Femi: wrong address should notify the customer immediately to confirm correct address before any re-attempt is scheduled
- Tunde separately mentioned wanting "damaged package" to also auto-reschedule like no-answer, to save time - this conflicts with what Grace said about it always needing customer care review, unresolved
- Chinwe: must integrate with existing route planning system (RouteWise), not duplicate scheduling logic
- how many failed attempts before an order is cancelled and refunded automatically? discussed 3 but not confirmed as policy
- target: cut customer complaint calls about delivery failures by half within a quarter`,
  },
  {
    id: "saas",
    label: "SaaS — Customer Onboarding",
    notes: `Onboarding workflow redesign - customer success
Attendees: Priya (CS lead), Marcus (sales), Tobi (support), Dan (eng)

- new customers currently get a welcome email and then it's up to the assigned CSM to remember every setup step manually - steps get missed, especially for smaller accounts with less CSM attention
- want: an automated onboarding checklist per customer, tracks what's done, nudges the customer and the CSM on what's next
- Priya: enterprise accounts (annual contract value over $20k) must get a dedicated onboarding call scheduled automatically within 3 business days of signing
- Tobi: smaller accounts should get self-serve onboarding only, no forced calls - support just answers questions if asked
- Marcus wants ALL accounts, including small ones, to get an onboarding call "because it helps retention" - conflicts with what Tobi said about self-serve-only for small accounts, not resolved in the meeting
- Dan: must pull contract value and signing date from the existing CRM (SalesHub), do not re-enter this manually
- Priya: if a customer hasn't completed key setup steps within 14 days, CSM should get an alert - what counts as "key steps" wasn't defined today
- target discussed: increase 90-day product activation rate, no specific number agreed on yet`,
  },
  {
    id: "hospitality",
    label: "Hospitality — Table Reservations",
    notes: `Reservations system workshop - operations
Present: Adaeze (ops manager), Leo (front of house), Grace (marketing), Sam (dev)

- reservations currently taken by phone and written in a paper book at each location, double bookings happen weekly, no visibility across locations for the same customer
- want: online booking, staff can see and manage bookings across all locations in one place
- Leo: table capacity rules differ by time slot (weekday lunch vs weekend dinner) - system must enforce this so we don't overbook the room
- Adaeze: large party bookings (8+ people) should require manager approval before confirming, not go through automatically
- Grace wants a way to flag VIP/repeat customers automatically so front of house knows to give them extra attention - not sure yet what makes someone a "VIP" by definition
- Leo also said large parties under 10 people should be allowed to book automatically without approval "to reduce friction" - this contradicts what Adaeze said about 8+ needing approval, wasn't settled
- Sam: needs to integrate with the existing POS system (DineFlow) for table status, not maintain a separate table map
- what should happen to a no-show - is there a policy (deposit, blacklist, nothing)? mentioned but not decided
- target: eliminate double-bookings entirely, currently around 4-5 per week across locations`,
  },
];
