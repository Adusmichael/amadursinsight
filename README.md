# AmadursInsight

Paste raw stakeholder meeting notes, get back a structured **first-draft
requirements document** — requirements (classified), user stories, acceptance
criteria, risks, assumptions, open questions — with each item linked to its
parent. Edit a requirement and the app flags every downstream story and
criterion that now needs review.

A single-feature portfolio project. See **Design decisions** (`/about`) for what
it deliberately leaves out and why.

## Run it

```bash
npm install
cp .env.example .env.local     # then paste your Anthropic API key
npm run dev                     # http://localhost:3000
```

`ANTHROPIC_API_KEY` is required for generation. Without it the app loads and the
"Load sample notes" button still works, but **Generate** returns a clear error.
Set `ANTHROPIC_MODEL=claude-sonnet-5` in `.env.local` for a faster, cheaper run.

```bash
npm test        # graph + normalize logic (Vitest)
npm run lint
npm run build
```

## How it works

- **Extraction** — `POST /api/generate` sends the notes to Claude with a forced,
  strict-schema tool call. The system prompt supplies the BA framing (artifact
  types, INVEST stories, Given/When/Then, "surface gaps, don't invent").
- **Normalisation** — `src/lib/normalize.ts` does not trust the model output: it
  regenerates all IDs in order, drops any story that doesn't trace to a
  functional requirement and any criterion that doesn't trace to a story, and
  strips blank items. The trace graph is always fully connected.
- **Change impact** — `src/lib/graph.ts` is pure and deterministic (no model
  call). Editing a requirement walks `derivedFrom` / `storyId` back-references
  and marks descendants `review-needed`.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · `@anthropic-ai/sdk`. No
database, no accounts — the document lives in the browser tab for one session.
Notes are sent to Anthropic for extraction and are not stored.

## Deploy

Push to a Git host and import into Vercel. Set `ANTHROPIC_API_KEY` (and
optionally `ANTHROPIC_MODEL`) as a project environment variable.

---

*"I noticed BAs waste hours turning messy meeting notes into structured
documents. I analysed the workflow, wrote the spec, and built a working app. I
kept it to one transformation and left out accounts and collaboration to stay
focused. Here's the live demo — try it."*
