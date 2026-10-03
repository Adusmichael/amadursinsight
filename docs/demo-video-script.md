# AmadursInsight — Demo Video Script

**Length:** ~3 min 30 s · **Format:** screen recording of the live app + voiceover (face-cam optional in the opening and close)
**URL on screen throughout:** community.adusmichael.com
**Track:** Business Analysis — Tasks A + C shown live, B + D referenced

---

## Before you record

- Open **community.adusmichael.com** in a clean browser window, zoom to 110–125% so text is readable on video.
- Hard-refresh (Ctrl+F5) so you're on the latest build.
- Have this backlog line ready to paste (it creates the conflict judges should see):
  > `TCK-101 — Cache patient referral records locally on the device so coordinators can keep working offline.`
- **Do one full generation before recording** so you know what the output looks like. Generation takes up to about a minute — in the edit, cut the wait or speed it up with a "≈45 seconds later" caption. Never fake the output.
- Pick one Functional requirement in that rehearsal output to edit later (ideally the under-16 → paediatric triage rule).

---

## 1 · Hook — the risk (0:00 – 0:25)

**ON SCREEN:** You on camera, or a title card: *"AI can draft a BRD in seconds. Who's accountable for it?"*

**VOICEOVER:**
> "Writing requirements eats 60 to 70 percent of a junior BA's week — turning messy meeting notes into BRDs and user stories.
> Generative AI can now do that draft in seconds. But unvetted AI output is a business risk: hallucinated edge cases, missed non-functional requirements, and stakeholder conflicts nobody notices until development.
> I built AmadursInsight to close that gap — AI does the first draft, a human stays accountable for every line."

---

## 2 · Input — real, messy notes (0:25 – 0:50)

**ON SCREEN:** The app's home page. Click **Load a sample…** → choose **Healthcare — Patient Referral Intake**. Scroll the notes slowly. Paste the TCK-101 line into **Existing backlog / tickets (optional)**.

**VOICEOVER:**
> "Here's a real-shaped input: workshop notes from a patient-referral meeting. Four stakeholders, half-finished sentences, decisions that were parked.
> I'll also paste one existing backlog ticket — because in real life, new requirements collide with old tickets.
> There are eight sample scenarios across healthcare, retail, fintech and more — or paste your own transcript."

**ACTION:** Click **Generate requirements**.

---

## 3 · Output — one paste, a governed first draft (0:50 – 1:35)

**ON SCREEN:** "Generating…" → *(cut)* → the full document. Scroll section by section, pausing on each heading.

**VOICEOVER:**
> "Under a minute later, a structured first-draft BRD.
> **Business goals** — only what stakeholders actually stated, nothing invented.
> **Requirements**, classified as functional, non-functional, business rule or constraint. Notice it caught the non-functional ones — 200 concurrent users, a three-second submit — the kind humans miss.
> **User stories** with MoSCoW tags, each with **Given / When / Then acceptance criteria**.
> And **Risks**, **Assumptions** and **Open questions**. The notes said the mandatory-field list was 'not settled today' — so it's an open question, not a guess. Gaps stay gaps."

**ON SCREEN (optional caption):** *Every story traces to a requirement. Every criterion traces to a story.*

---

## 4 · The conflict — caught, not resolved (1:35 – 2:05)

**ON SCREEN:** Scroll to **Conflicts**. Hover/zoom on the conflict card: *"contradiction — not auto-resolved"* and the **Resolve by:** line.

**VOICEOVER:**
> "This is the part I care about most. Marcus from IT said 'we are NOT building another patient database.' Ticket TCK-101 asks to store patient records offline on the device. Those contradict each other.
> The AI doesn't pick a winner. It names both sides, labels it *not auto-resolved*, and tells the BA exactly who to ask. A human makes the call."

---

## 5 · Human edits — and change impact (2:05 – 2:40)

**ON SCREEN:** In **Acceptance criteria**, set one criterion's **Test status** to **Passed**. Then edit its parent requirement (click Edit, add a line, Save). Scroll down: the dependent story and criteria light up — the passed one shows **"was passing · retest"** in amber.

**VOICEOVER:**
> "Now the BA does the job only a human can: judging and refining.
> I'll mark this acceptance criterion as Passed — then change the requirement it depends on.
> Instantly, every downstream story and criterion is flagged for review — and the one we'd already tested says 'was passing, retest.' That's deterministic code, not AI. A human's edit can never be silently overwritten, and nothing tested slips through after a change."

---

## 6 · Safeguards & the redesigned workflow (2:40 – 3:10)

**ON SCREEN:** Click **Copy Markdown** (show "Copied"). Then cut to the TO-BE process map slide (AI lane + Human checkpoint lane) and the Safeguard Protocol title.

**VOICEOVER:**
> "Nothing leaves this tool on its own. It's labelled a first draft, and it exits only when a human copies or downloads it — there's no auto-publish to Jira.
> Under the hood: the model is forced into a strict schema, so it can't return free text outside those eight sections, and the app re-checks every link in the document before showing it.
> That's our redesigned workflow — an AI lane that drafts, and a human checkpoint lane that reviews, resolves conflicts and signs off. The full safeguard protocol and process maps are in our submission."

---

## 7 · Close — the BA role evolves (3:10 – 3:30)

**ON SCREEN:** You on camera, or the closing slide: *"AI redefines the BA profession. It doesn't remove it."* + **community.adusmichael.com**

**VOICEOVER:**
> "So the BA isn't replaced. The documenter becomes an **AI Requirements Architect**. The story writer becomes a **Strategic Facilitator**. The format checker becomes a **Quality Governor**.
> First drafts in under a minute instead of hours. Zero silent conflict resolution. One hundred percent human sign-off before anything ships.
> Everything you just saw is live, right now, at community.adusmichael.com. Please — try it yourself."

---

## Judging checklist — what this video proves

| Brief requirement | Where in the video |
|---|---|
| Task A: transcript in → Draft BRD (goals, FRs, assumptions) | §2–3 |
| Task A: 5+ Given/When/Then stories with MoSCoW | §3 |
| Task C: conflict detection from logs | §4 |
| Task C: explicit safeguard — no unverified output to dev | §5–6 |
| Task B: AI lane + human checkpoint lane | §6 |
| Task D: BA skill evolution | §7 |
| "AI redefines, not eliminates, the BA" | §1, §7 |

## Recording tips

- Speak slower than feels natural; leave half a second of silence before each section for clean cuts.
- Move the mouse deliberately and point at what you're talking about.
- If a live generation produces slightly different wording than your rehearsal, adjust the voiceover to match the screen — judges notice mismatches.
- Keep it under 4 minutes. If you're over, trim §3 first.
