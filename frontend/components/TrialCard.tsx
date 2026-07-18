// Trial card for Page 1. Primary demo trial gets a highlighted variant.

import Link from "next/link";
import type { Trial } from "@/types";

export default function TrialCard({ trial }: { trial: Trial }) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 transition hover:shadow-md ${
        trial.primary
          ? "border-slate-900 ring-1 ring-slate-900"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{trial.title}</h3>
            {trial.primary && (
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white">
                Primary demo trial
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {trial.id} · {trial.status} · {trial.location}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {trial.conditions.join(", ")} · {trial.phase} · {trial.enrollment}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Sponsor: {trial.sponsor}
          </p>
        </div>
        <Link
          href={`/trials/${trial.id}`}
          className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Open Trial →
        </Link>
      </div>
    </div>
  );
}
