// v1.1: hover tooltip on any status chip — summary + provenance so the
// clinician can decide whether to double-click. PRD §13 Page 3 v1.1 block.

import type { TooltipContent } from "@/types";

export default function StatusTooltip({ content }: { content: TooltipContent }) {
  return (
    <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 hidden w-80 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-xl group-hover:block">
      <span className="block text-xs font-semibold text-slate-900">
        {content.headline}
      </span>
      {content.lines.map((line) => (
        <span
          key={line}
          className="mt-1 block text-xs leading-relaxed text-slate-600"
        >
          {line}
        </span>
      ))}
      {content.source && (
        <span className="mt-2 block border-t border-slate-100 pt-1.5 text-[11px] text-slate-400">
          Source: {content.source}
        </span>
      )}
    </span>
  );
}
