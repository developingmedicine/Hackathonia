// One row of the v1.1 two-column eligibility table:
// LEFT = criterion + status, RIGHT = evidence citations. PRD §22.

import type { CriterionResult } from "@/types";
import { CRITERION_META } from "@/lib/status";
import EvidenceSnippet from "./EvidenceSnippet";

export default function CriterionResultCard({
  result,
}: {
  result: CriterionResult;
}) {
  const meta = CRITERION_META[result.status];
  return (
    <div className="grid grid-cols-1 gap-3 border-t border-slate-100 py-4 first:border-t-0 md:grid-cols-2 md:gap-6">
      <div>
        <p className={`text-xs font-semibold ${meta.cls}`}>
          {meta.icon} {meta.label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-slate-900">
          {result.criterion}
        </p>
        {result.note && (
          <p className="mt-1 text-xs text-slate-500">{result.note}</p>
        )}
      </div>
      <div className="space-y-2 md:border-l md:border-slate-100 md:pl-6">
        {result.evidence.length > 0 ? (
          result.evidence.map((e) => <EvidenceSnippet key={e.text} item={e} />)
        ) : (
          <p className="text-sm italic text-slate-400">
            No structured or note evidence found
          </p>
        )}
      </div>
    </div>
  );
}
