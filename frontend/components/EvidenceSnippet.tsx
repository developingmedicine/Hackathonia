// Exact evidence text with source and date — verbatim, never paraphrased
// (PRD §15.5, §31). Rendered as a citation in the right column (v1.1).

import type { EvidenceItem } from "@/types";

export default function EvidenceSnippet({ item }: { item: EvidenceItem }) {
  return (
    <div className="text-sm">
      <p className="text-slate-700">{item.text}</p>
      <p className="mt-0.5 text-xs text-slate-400">
        {item.source}
        {item.date ? ` · ${item.date}` : ""}
      </p>
    </div>
  );
}
