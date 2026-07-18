// v1.1: hover tooltip on any status chip — summary + provenance so the
// clinician can decide whether to double-click. PRD §13 Page 3 v1.1 block.

import type { TooltipContent } from "@/types";

export default function StatusTooltip({ content }: { content: TooltipContent }) {
  return (
    <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden w-80 rounded-2xl bg-white p-4 text-left shadow-xl ring-1 ring-black/5 group-hover:block">
      <span className="block text-[13px] font-semibold text-ink">
        {content.headline}
      </span>
      {content.lines.map((line) => (
        <span
          key={line}
          className="mt-1 block text-xs leading-relaxed text-inkmid"
        >
          {line}
        </span>
      ))}
      {content.source && (
        <span className="mt-2.5 block text-[11px] text-inksoft">
          Source: {content.source}
        </span>
      )}
    </span>
  );
}
