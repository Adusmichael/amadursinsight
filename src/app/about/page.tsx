import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design decisions — AmadursInsight",
  description: "Why this tool is scoped the way it is: what it does, what it deliberately leaves out, and what would come next.",
};

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-9 mb-2 font-display text-lg font-semibold tracking-tight text-ink">
      {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <article className="max-w-2xl">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
        Portfolio project &middot; design decisions
      </p>
      <h1 className="mt-2 font-display text-[1.7rem] font-bold leading-tight tracking-tight text-ink">
        Why this tool is small on purpose
      </h1>

      <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
        Business Analysts spend hours turning raw meeting notes into structured documentation. It is
        slow, inconsistent between people, and easy to get wrong. AmadursInsight does one step of
        that job: notes in, a linked first-draft requirements document out.
      </p>

      <H>What it produces</H>
      <p className="text-[0.92rem] leading-relaxed text-ink-soft">
        Six artifact types, because together they cover the &ldquo;what and how do we prove it&rdquo;
        of early analysis: <strong className="text-ink">requirements</strong> (classified as
        functional, non-functional, business rule, or constraint),{" "}
        <strong className="text-ink">user stories</strong> for each functional requirement,{" "}
        <strong className="text-ink">acceptance criteria</strong> in Given/When/Then form, and{" "}
        <strong className="text-ink">risks, assumptions, and open questions</strong> so the gaps in
        the notes are named rather than filled in.
      </p>

      <H>What the app does, and what the model does</H>
      <p className="text-[0.92rem] leading-relaxed text-ink-soft">
        A language model does the extraction &mdash; pattern-matching cannot pull requirements out of
        messy prose. The app&rsquo;s contribution is the structure it imposes: the artifact types,
        the required formats, and the instruction to surface gaps instead of inventing detail.
        The <strong className="text-ink">change-impact</strong> step is the opposite &mdash; fully
        deterministic. Links between requirement, story, and criterion are captured at generation;
        editing a requirement walks that graph and flags every affected item for review. No model
        call is involved.
      </p>

      <H>What it deliberately leaves out</H>
      <ul className="mt-1 space-y-1.5 pl-4 text-[0.92rem] leading-relaxed text-ink-soft">
        <li>Accounts, login, and any stored data &mdash; one session, nothing persisted.</li>
        <li>Multi-user collaboration, comments, approvals.</li>
        <li>PDF and Word export &mdash; Markdown only, copied or downloaded.</li>
        <li>Diagram generation, a multi-project dashboard, version history.</li>
      </ul>
      <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">
        Each of those is a project in its own right. Naming the boundary is part of the point:
        the skill on show is scoping a real problem down to something shippable.
      </p>

      <H>What would come next</H>
      <p className="text-[0.92rem] leading-relaxed text-ink-soft">
        A stakeholder-analysis / RACI step from the same notes; requirement versioning with a diff
        view; and traceability extended down to test cases &mdash; the part existing tools handle
        worst.
      </p>

      <p className="mt-10 border-t border-rule pt-4 font-mono text-[0.75rem] text-ink-faint">
        <Link href="/" className="text-accent-ink no-underline hover:underline">
          &larr; back to the tool
        </Link>
      </p>
    </article>
  );
}
