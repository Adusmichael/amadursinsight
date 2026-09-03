# AmadursInsight

Paste raw stakeholder meeting notes, get back a structured **first-draft
requirements document** — requirements (classified), user stories, acceptance
criteria, risks, assumptions, open questions — with each item linked to its
parent. Edit a requirement and the app flags every downstream story and
criterion that now needs review.

A single-feature portfolio project. See **Design decisions** (`/about`) for what
it deliberately leaves out and why.

## Architecture

A static frontend (Next.js static export) plus a small **PHP proxy** that holds
the Anthropic API key server-side. The key is never in the browser. The proxy
just forwards the notes to the model with a forced strict-schema tool call and
returns the raw result; the browser repairs the ID/trace graph (`normalize`),
which involves no secret.

```
public_html/
  index.html, about/, _next/…      ← static export (npm run build:static → ./out)
  api/generate.php                 ← proxy (reads the key, calls Anthropic)
  api/extraction-schema.json       ← shared tool schema
  api/system-prompt.txt            ← the BA framing
  .htaccess                        ← force HTTPS, no dir listing
~/amadursinsight-secrets.php       ← ONE LEVEL ABOVE public_html: your key
```

## Develop

```bash
npm install
npm run dev            # http://localhost:3000 — UI, editing, impact, export

# to test generation locally (no PHP needed):
node --env-file=.env.local scripts/dev-proxy.mjs        # terminal 1
NEXT_PUBLIC_GENERATE_ENDPOINT=http://localhost:8787/generate npm run dev   # terminal 2
```

`.env.local` (git-ignored):

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_WORKSPACE_ID=wrkspc_...   # only if your key is identity-linked
ANTHROPIC_MODEL=claude-sonnet-5      # or claude-opus-5 (slower, ~2.5× cost)
```

```bash
npm test        # graph + normalize logic (Vitest)
npm run lint
```

## Deploy to shared hosting (Namecheap / cPanel)

1. **Build:** `npm run build:static` → produces `./out/` with the PHP files
   already in place.
2. **Upload** everything inside `./out/` into `public_html/` at the **domain
   root** (asset paths are absolute, so a subfolder needs `basePath` config).
   Use cPanel File Manager or FTP.
3. **Secrets:** rename `out/amadursinsight-secrets.example.php` →
   `amadursinsight-secrets.php`, fill in your key, and put it **one level above
   `public_html`** (your cPanel home directory). If your host won't allow that,
   leave it in `public_html/api/` — `generate.php` checks there last — and the
   bundled `.htaccess` blocks direct web access to it.
4. Open your domain. The form posts to `/api/generate.php`.

Requires PHP with either the cURL extension or `allow_url_fopen` (both standard
on Namecheap). No Node runtime on the host.

You pay Anthropic per generation (cents per click, only when someone hits
Generate). Set a spend cap in the Anthropic console.

## How it works

- **Extraction** — `deploy/generate.php` sends the notes to Claude with a
  forced, strict-schema `record_requirements` tool call.
- **Normalisation** — `src/lib/normalize.ts` (runs in the browser) does not
  trust the model output: it regenerates all IDs in order, drops any story that
  doesn't trace to a functional requirement and any criterion that doesn't
  trace to a story, and strips blanks. The trace graph is always connected.
- **Change impact** — `src/lib/graph.ts` is pure and deterministic. Editing a
  requirement walks `derivedFrom` / `storyId` back-references and marks
  descendants `review-needed`.

## Stack

Next.js (App Router, static export) · TypeScript · Tailwind CSS v4 · a PHP
proxy. No database, no accounts — the document lives in the browser tab for one
session. Notes are sent to Anthropic for extraction and are not stored.

---

*"I noticed BAs waste hours turning messy meeting notes into structured
documents. I analysed the workflow, wrote the spec, and built a working app. I
kept it to one transformation and left out accounts and collaboration to stay
focused. Here's the live demo — try it."*
