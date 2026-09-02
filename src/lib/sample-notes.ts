/**
 * Raw, deliberately messy workshop notes for the "Load sample notes" button
 * (spec section 4.7). Once the model route is wired, generating from this text
 * should reproduce something close to SAMPLE_DOC.
 */
export const SAMPLE_NOTES = `Referral intake workshop - 28 Aug
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
- pre-fill from NHS number would cut the typing right down`;
