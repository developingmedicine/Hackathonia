// Status badge using the fixed vocabulary + color mapping (PRD §16).
// Wrap in a hoverable tooltip (v1.1) when tooltip content is provided.

import type { EnrollmentStatus, TooltipContent } from "@/types";
import { ENROLLMENT_META } from "@/lib/status";
import StatusTooltip from "./StatusTooltip";

export default function StatusBadge({
  status,
  sub,
  tooltip,
}: {
  status: EnrollmentStatus;
  sub?: string;
  tooltip?: TooltipContent;
}) {
  const meta = ENROLLMENT_META[status];
  return (
    <span className="group relative inline-flex flex-col items-end">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
      {sub && <span className="mt-0.5 text-[11px] text-slate-500">{sub}</span>}
      {tooltip && <StatusTooltip content={tooltip} />}
    </span>
  );
}
