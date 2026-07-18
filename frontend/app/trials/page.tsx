"use client";

// PAGE 1 — Trial Explorer (PRD §13): friendly greeting headline, pill
// search, recruiting trial cards on the cream canvas.

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
    <div className="pt-4">
      <h1 className="text-4xl font-bold tracking-tight text-ink">
        Find a recruiting trial.
      </h1>
      <div className="mt-6 flex max-w-xl gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="obesity, psoriasis, GLP-1…"
          className="w-full rounded-full bg-white px-5 py-3 text-sm shadow-sm ring-1 ring-black/5 placeholder:text-inksoft focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
        <button className="rounded-full bg-creamdeep px-5 py-3 text-sm font-semibold text-inkmid transition hover:bg-white">
          Filters
        </button>
      </div>

      <h2 className="mt-10 text-[11px] font-bold uppercase tracking-widest text-inksoft">
        Recruiting Trials
      </h2>
      <div className="mt-4 space-y-4">
        {list.map((t) => (
          <TrialCard key={t.id} trial={t} />
        ))}
        {list.length === 0 && (
          <p className="text-sm text-inksoft">No trials match “{q}”.</p>
        )}
      </div>
      <p className="mt-8 text-xs text-inksoft">
        Trial data: ClinicalTrials.gov API v2 (cached for demo reliability).
      </p>
    </div>
  );
}
