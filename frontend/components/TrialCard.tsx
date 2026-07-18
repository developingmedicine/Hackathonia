// Trial card for Page 1: white rounded card on the cream canvas, no hard
// borders. Primary demo trial gets a brand-red chip.

import Link from "next/link";
import type { Trial } from "@/types";

export default function TrialCard({ trial }: { trial: Trial }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-bold text-ink">{trial.title}</h3>
            {trial.primary && (
              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                Primary demo trial
              </span>
            )}
            {trial.live && (
              <span className="rounded-full bg-creamdeep px-2.5 py-0.5 text-[11px] font-semibold text-inkmid">
                Live · ClinicalTrials.gov
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-inkmid">
            {trial.id} · {trial.status} · {trial.location}
          </p>
          <p className="mt-0.5 text-sm text-inksoft">
            {trial.conditions.join(", ")} · {trial.phase} · {trial.enrollment}
          </p>
          <p className="mt-2 text-xs text-inksoft">Sponsor: {trial.sponsor}</p>
        </div>
        <Link
          href={`/trials/${trial.id}`}
          className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-inkmid"
        >
          Open Trial →
        </Link>
      </div>
    </div>
  );
}
