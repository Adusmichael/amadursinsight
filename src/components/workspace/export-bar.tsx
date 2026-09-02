"use client";

import { useState } from "react";
import { docToMarkdown } from "@/lib/markdown";
import type { RequirementsDoc } from "@/lib/types";
import { Btn } from "./primitives";

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "requirements"
  );
}

export function ExportBar({ doc }: { doc: RequirementsDoc }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(docToMarkdown(doc));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the download button still works */
    }
  }

  function download() {
    const blob = new Blob([docToMarkdown(doc)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slugify(doc.meta.projectName ?? "requirements")}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <Btn variant="outline" onClick={copy}>
        {copied ? "Copied" : "Copy Markdown"}
      </Btn>
      <Btn variant="outline" onClick={download}>
        Download .md
      </Btn>
    </div>
  );
}
