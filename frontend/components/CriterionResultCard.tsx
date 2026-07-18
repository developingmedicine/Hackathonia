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
    <div className="grid grid-cols-1 gap-3 border-t border-cream py-5 first:border-t-0 md:grid-cols-2 md:gap-8">
      <div>
        <p className={`text-xs font-bold tracking-wide ${meta.cls}`}>
          {meta.icon} {meta.label}
        </p>
        <p className="mt-1 text-[15px] font-semibold text-ink">
          {result.criterion}
        </p>
        {result.note && (
          <p className="mt-1 text-xs text-inksoft">{result.note}</p>
        )}
      </div>
      <div className="space-y-2.5 md:border-l md:border-cream md:pl-8">
        {result.evidence.length > 0 ? (
          result.evidence.map((e) => <EvidenceSnippet key={e.text} item={e} />)
        ) : (
          <p className="text-sm italic text-inksoft">
            No structured or note evidence found
          </p>
        )}
      </div>
    </div>
  );
}
