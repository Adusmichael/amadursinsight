// Assembles ./out into an upload-ready bundle for shared hosting.
// Run automatically by `npm run build:static` after `next build`.
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const out = resolve(root, "out");

if (!existsSync(out)) {
  console.error("out/ not found — run `next build` first.");
  process.exit(1);
}

mkdirSync(resolve(out, "api"), { recursive: true });

const copies = [
  ["deploy/generate.php", "out/api/generate.php"],
  ["src/lib/extraction-schema.json", "out/api/extraction-schema.json"],
  ["src/lib/system-prompt.txt", "out/api/system-prompt.txt"],
  ["deploy/amadursinsight-secrets.example.php", "out/amadursinsight-secrets.example.php"],
  ["deploy/htaccess.txt", "out/.htaccess"],
];

for (const [from, to] of copies) {
  copyFileSync(resolve(root, from), resolve(root, to));
  console.log(`  + ${to}`);
}

console.log(`
Static bundle ready in ./out

Upload:
  1. Everything inside ./out/  ->  public_html/   (keep the folder structure)
  2. Rename out/amadursinsight-secrets.example.php -> amadursinsight-secrets.php,
     fill in your key, and move it ONE LEVEL ABOVE public_html.
  3. Rename out/.htaccess is already named correctly; leave it at the web root.

Then open your domain. The form posts to /api/generate.php.
`);
