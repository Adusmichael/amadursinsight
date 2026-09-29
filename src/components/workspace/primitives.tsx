import * as React from "react";
import { cn } from "@/lib/utils";

export function IdTag({
  children,
  tone = "accent",
}: {
  children: React.ReactNode;
  tone?: "accent" | "muted";
}) {
  return (
    <span
      className={cn(
        "font-mono text-[0.72rem]",
        tone === "accent" ? "text-accent-ink" : "text-ink-faint",
      )}
    >
      {children}
    </span>
  );
}

export function MetaTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-faint">
      {children}
    </span>
  );
}

export function ReviewPill() {
  return (
    <span className="inline-flex items-center rounded-sm border border-flag/40 bg-flag-wash px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.09em] text-flag">
      review needed
    </span>
  );
}

export function EditedPill() {
  return (
    <span className="inline-flex items-center rounded-sm border border-rule-strong px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.09em] text-ink-faint">
      edited
    </span>
  );
}

/** A criterion that was verified, then got flagged review-needed by an upstream edit. */
export function StalePassPill() {
  return (
    <span className="inline-flex items-center rounded-sm border border-flag/40 bg-flag-wash px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.09em] text-flag">
      was passing &middot; retest
    </span>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
};

export function Btn({ variant = "ghost", className, type = "button", ...props }: BtnProps) {
  const variants: Record<string, string> = {
    solid: "bg-accent text-surface hover:bg-accent-ink",
    outline: "border border-rule-strong text-ink-soft hover:bg-code-bg hover:text-ink",
    ghost: "text-ink-soft hover:bg-code-bg hover:text-ink",
  };
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 font-sans text-[0.8rem] font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block font-mono text-[0.64rem] uppercase tracking-[0.1em] text-ink-faint">
      {children}
    </span>
  );
}

export const editorFieldClass =
  "w-full resize-y rounded-md border border-rule-strong bg-paper p-2.5 font-sans text-[0.9rem] leading-relaxed text-ink focus:border-accent focus:outline-none";
