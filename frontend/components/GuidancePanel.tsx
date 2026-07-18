// Extracted clinician guidance. v1.1: rendered in the LEFT column of Page 2,
// directly under the criteria it annotates, with visible attribution. PRD §21.

import type { ExtractedGuidance } from "@/types";

export default function GuidancePanel({
  guidance,
}: {
  guidance: ExtractedGuidance;
}) {
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-700">
        Extracted Guidance
      </h4>
      <p className="mt-1 text-xs text-slate-500">
        ↳ annotates: <span className="font-medium">{guidance.annotates}</span>
      </p>
      <ul className="mt-2 space-y-1">
        {guidance.bullets.map((b) => (
          <li key={b} className="flex gap-2 text-sm text-slate-700">
            <span className="text-sky-600">•</span>
            {b}
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-sky-100 pt-2 text-[11px] text-slate-400">
        Source: trial clinician voice input · applied to all patients in this
        trial&apos;s screening logic
      </p>
    </div>
  );
}
