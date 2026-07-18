// Parsed criteria for Page 2 left column (read-only, v1.1). PRD §20.

import type { ParsedCriterion } from "@/types";

const MODE_CLS: Record<ParsedCriterion["mode"], string> = {
  Rule: "bg-creamdeep text-inkmid",
  Judgement: "bg-sage text-sagedeep",
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
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-inksoft">
        {title}
      </h4>
      <ul className="mt-2.5 space-y-2">
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-2.5 text-sm">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${MODE_CLS[c.mode]}`}
            >
              {c.mode}
            </span>
            <span className="text-inkmid">{c.text}</span>
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
    <div className="space-y-6">
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
