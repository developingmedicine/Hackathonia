"use client";

// PAGE 1 — Trial Explorer (PRD §13): friendly greeting headline, pill
// search, recruiting trial cards on the cream canvas. The search box also
// queries the live ClinicalTrials.gov API v2 (debounced), so any condition
// — cancer, psoriasis, … — surfaces real recruiting trials beyond the
// seeded demo set.

import { useEffect, useState } from "react";
import { TRIALS } from "@/lib/data";
import type { Trial } from "@/types";
import TrialCard from "@/components/TrialCard";

const SEEDED_IDS = new Set(TRIALS.map((t) => t.id));

export default function TrialExplorerPage() {
  const [q, setQ] = useState("");
  const [liveTrials, setLiveTrials] = useState<Trial[]>([]);
  const [searching, setSearching] = useState(false);
  const [liveError, setLiveError] = useState(false);

  const query = q.trim();
  const list = TRIALS.filter((t) =>
    `${t.title} ${t.conditions.join(" ")} ${t.id}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  useEffect(() => {
    if (query.length < 3) {
      setLiveTrials([]);
      setSearching(false);
      setLiveError(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/trials?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          trials: Trial[];
          source: "live" | "error";
        };
        setLiveTrials(data.trials.filter((t) => !SEEDED_IDS.has(t.id)));
        setLiveError(data.source === "error");
      } catch {
        setLiveTrials([]);
        setLiveError(true);
      }
      setSearching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="pt-4">
      <h1 className="text-4xl font-bold tracking-tight text-ink">
        Find a recruiting trial.
      </h1>
      <div className="mt-6 flex max-w-xl gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="obesity, lung cancer, psoriasis…"
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
        {list.length === 0 && query.length < 3 && (
          <p className="text-sm text-inksoft">No trials match “{q}”.</p>
        )}
      </div>

      {query.length >= 3 && (
        <>
          <h2 className="mt-10 text-[11px] font-bold uppercase tracking-widest text-inksoft">
            Live from ClinicalTrials.gov
          </h2>
          <div className="mt-4 space-y-4">
            {searching && (
              <p className="animate-pulse text-sm text-inkmid">
                Searching ClinicalTrials.gov for “{query}”…
              </p>
            )}
            {!searching &&
              liveTrials.map((t) => <TrialCard key={t.id} trial={t} />)}
            {!searching && !liveError && liveTrials.length === 0 && (
              <p className="text-sm text-inksoft">
                No recruiting trials found for “{query}”.
              </p>
            )}
            {!searching && liveError && (
              <p className="text-sm text-inksoft">
                ClinicalTrials.gov is unreachable right now — showing seeded
                trials only.
              </p>
            )}
          </div>
        </>
      )}

      <p className="mt-8 text-xs text-inksoft">
        Seeded demo trials + live search via the ClinicalTrials.gov API v2.
      </p>
    </div>
  );
}
