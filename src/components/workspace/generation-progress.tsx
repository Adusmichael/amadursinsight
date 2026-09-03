"use client";

import { useEffect, useState } from "react";

const STAGES = [
  "Reading the notes",
  "Drafting requirements",
  "Writing user stories",
  "Adding acceptance criteria",
  "Checking for gaps and risks",
];

export function GenerationProgress() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-4 space-y-2" role="status" aria-live="polite">
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-rule">
        <div className="ai-progress h-full w-2/5 rounded-full bg-accent" />
      </div>
      <p className="font-mono text-[0.68rem] text-ink-faint">
        {STAGES[stage]}&hellip; <span className="text-ink-faint/70">usually 10&ndash;30 seconds</span>
      </p>
      <style>{`
        @keyframes ai-progress-slide {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(260%); }
        }
        .ai-progress { animation: ai-progress-slide 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ai-progress { animation: none; width: 100%; opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
