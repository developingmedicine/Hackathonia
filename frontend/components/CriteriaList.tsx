// Parsed criteria for Page 2 left column: inclusion/exclusion sections with
// evaluation-mode badges. Existing criteria are read-only (v1.1). PRD §20.

import type { ParsedCriterion } from "@/types";

const MODE_CLS: Record<ParsedCriterion["mode"], string> = {
  Rule: "bg-slate-100 text-slate-600",
  Judgement: "bg-sky-50 text-sky-700",
};

function Section({
  title,
  items,
}: {
  title: string;
  items: ParsedCriterion[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h4>
      <ul className="mt-2 space-y-1.5">
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-2 text-sm">
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${MODE_CLS[c.mode]}`}
            >
              {c.mode}
            </span>
            <span className="text-slate-700">{c.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CriteriaList({
  criteria,
}: {
  criteria: ParsedCriterion[];
}) {
  return (
    <div className="space-y-5">
      <Section
        title="Inclusion"
        items={criteria.filter((c) => c.type === "inclusion")}
      />
      <Section
        title="Exclusion"
        items={criteria.filter((c) => c.type === "exclusion")}
      />
    </div>
  );
}
