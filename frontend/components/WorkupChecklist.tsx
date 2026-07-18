"use client";

// Work-up checklist generated from unresolved criteria (PRD §22).
// v1.1: rendered high on Page 4, right under the summary.

import { useState } from "react";

export default function WorkupChecklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Work-up Checklist
      </h4>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {items.map((item, i) => (
          <label
            key={item}
            className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
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
              className="h-4 w-4 rounded border-slate-300 accent-slate-900"
            />
            <span className={done.has(i) ? "text-slate-400 line-through" : ""}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
