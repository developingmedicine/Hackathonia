"use client";

// PAGE 1 — Trial Explorer (PRD §13): search + recruiting trial cards,
// primary demo trial highlighted.

import { useState } from "react";
import { TRIALS } from "@/lib/mock";
import TrialCard from "@/components/TrialCard";

export default function TrialExplorerPage() {
  const [q, setQ] = useState("");
  const list = TRIALS.filter((t) =>
    `${t.title} ${t.conditions.join(" ")} ${t.id}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">
        Find a recruiting trial
      </h1>
      <div className="mt-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="obesity, psoriasis, GLP-1…"
          className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
        <button className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-100">
          Filters
        </button>
      </div>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Recruiting Trials
      </h2>
      <div className="mt-3 space-y-3">
        {list.map((t) => (
          <TrialCard key={t.id} trial={t} />
        ))}
        {list.length === 0 && (
          <p className="text-sm text-slate-400">No trials match “{q}”.</p>
        )}
      </div>
      <p className="mt-6 text-xs text-slate-400">
        Trial data: ClinicalTrials.gov API v2 (cached for demo reliability).
      </p>
    </div>
  );
}
