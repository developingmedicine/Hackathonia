// Extracted clinician guidance. v1.1: rendered in the LEFT column of Page 2,
// directly under the criteria it annotates, with visible attribution. PRD §21.
// Lavender = AI-derived content, Abridge-style.

import type { ExtractedGuidance } from "@/types";

export default function GuidancePanel({
  guidance,
}: {
  guidance: ExtractedGuidance;
}) {
  return (
    <div className="rounded-2xl bg-lav/50 p-5">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-lavdeep">
        Extracted Guidance
      </h4>
      <p className="mt-1.5 text-xs text-inkmid">
        ↳ annotates: <span className="font-semibold">{guidance.annotates}</span>
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {guidance.bullets.map((b) => (
          <li key={b} className="flex gap-2 text-sm text-ink">
            <span className="text-lavdeep">•</span>
            {b}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-inksoft">
        Source: trial clinician voice input · applied to all patients in this
        trial&apos;s screening logic
      </p>
    </div>
  );
}
