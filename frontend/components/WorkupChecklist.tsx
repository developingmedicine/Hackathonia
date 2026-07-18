"use client";

// Work-up checklist generated from unresolved criteria (PRD §22).
// v1.1: rendered high on Page 4, right under the summary.

import { useState } from "react";

export default function WorkupChecklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  if (items.length === 0) return null;
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-inksoft">
        Work-up Checklist
      </h4>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item, i) => (
          <label
            key={item}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-inkmid"
          >
            <input
              type="checkbox"
              checked={done.has(i)}
              onChange={() => {
                const next = new Set(done);
                if (next.has(i)) next.delete(i);
                else next.add(i);
                setDone(next);
              }}
              className="h-4 w-4 rounded accent-ink"
            />
            <span className={done.has(i) ? "text-inksoft line-through" : ""}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
