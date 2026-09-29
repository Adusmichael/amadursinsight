import {
  REQUIREMENT_KIND_LABEL,
  PRIORITY_LABEL,
  criterionStatement,
  storyStatement,
  type RequirementsDoc,
} from "./types";

/** Serialise the document to Markdown for copy / download (spec FR9). */
export function docToMarkdown(doc: RequirementsDoc): string {
  const lines: string[] = [];
  const { meta } = doc;

  lines.push(`# ${meta.projectName || "Requirements draft"}`);
  lines.push("");
  const facts: string[] = [];
  if (meta.meetingDate) facts.push(`**Meeting date:** ${meta.meetingDate}`);
  if (meta.stakeholders.length) facts.push(`**Stakeholders:** ${meta.stakeholders.join(", ")}`);
  facts.push(`**Generated:** ${meta.generatedAt.slice(0, 10)} · draft for review`);
  lines.push(facts.join("  \n"));
  lines.push("");

  lines.push("## Business goals");
  lines.push("");
  if (doc.businessGoals.length === 0) {
    lines.push("_None stated in the notes._");
  } else {
    for (const g of doc.businessGoals) lines.push(`- **${g.id}** ${g.text}`);
  }
  lines.push("");

  lines.push("## Requirements");
  lines.push("");
  for (const r of doc.requirements) {
    const flag = r.status === "edited" ? " _(edited)_" : "";
    lines.push(`- **${r.id}** (${REQUIREMENT_KIND_LABEL[r.kind]}) ${r.text}${flag}`);
  }
  lines.push("");

  lines.push("## Conflicts");
  lines.push("");
  if (doc.conflicts.length === 0) {
    lines.push("_None found between the notes and any backlog provided._");
  } else {
    for (const c of doc.conflicts) {
      lines.push(`- **${c.id}** ${c.description}`);
      if (c.involves.length) lines.push(`  - Involves: ${c.involves.join(" · ")}`);
      lines.push(`  - Resolve by: ${c.recommendation}`);
    }
  }
  lines.push("");

  lines.push("## User stories");
  lines.push("");
  for (const s of doc.userStories) {
    const flag = s.status === "review-needed" ? " _(review needed)_" : "";
    const priority = s.priority === "unset" ? "" : ` · ${PRIORITY_LABEL[s.priority]}`;
    lines.push(`- **${s.id}** (from ${s.derivedFrom}${priority}) ${storyStatement(s)}${flag}`);
  }
  lines.push("");

  lines.push("## Acceptance criteria");
  lines.push("");
  for (const a of doc.acceptanceCriteria) {
    const flag = a.status === "review-needed" ? " _(review needed)_" : "";
    lines.push(`- **${a.id}** (${a.storyId}) ${criterionStatement(a)}${flag}`);
  }
  lines.push("");

  for (const [heading, items] of [
    ["Risks", doc.risks],
    ["Assumptions", doc.assumptions],
    ["Open questions", doc.openQuestions],
  ] as const) {
    lines.push(`## ${heading}`);
    lines.push("");
    if (items.length === 0) {
      lines.push("_None recorded._");
    } else {
      for (const item of items) lines.push(`- **${item.id}** ${item.text}`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}
