"use client";

// Page 3 queue table (v1.1): filter tabs, status tooltips with provenance,
// purple rows for enrolled patients. Candidate row → Page 4; purple row →
// follow-up view (Page 6).

import { useState } from "react";
import Link from "next/link";
import type { QueuePatient } from "@/types";
import StatusBadge from "./StatusBadge";

const TABS = [
  { key: "all", label: "All" },
  { key: "match", label: "Match" },
  { key: "missing", label: "Missing Data" },
  { key: "review", label: "Needs Review" },
  { key: "excluded", label: "Excluded" },
  { key: "enrolled", label: "🟣 Enrolled" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function tabOf(p: QueuePatient): TabKey {
  switch (p.status) {
    case "potential_match":
    case "enrollment_ready":
      return "match";
    case "missing_actionable_data":
      return "missing";
    case "needs_review":
      return "review";
    case "confirmed_exclusion":
      return "excluded";
    case "actively_enrolled":
      return "enrolled";
    default:
      return "all";
  }
}

export default function PatientQueueTable({
  patients,
}: {
  patients: QueuePatient[];
}) {
  const [tab, setTab] = useState<TabKey>("all");
  const list = patients.filter((p) => tab === "all" || tabOf(p) === tab);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              tab === t.key
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white">
        {list.map((p) => {
          const enrolled = p.status === "actively_enrolled";
          return (
            <Link
              key={p.id}
              href={enrolled ? `/patients/${p.id}/follow-up` : `/patients/${p.id}`}
              className={`grid grid-cols-[56px_1.5fr_1fr_64px_auto] items-center gap-4 border-t border-slate-100 px-5 py-3.5 first:border-t-0 first:rounded-t-xl last:rounded-b-xl transition hover:bg-slate-50 ${
                enrolled ? "bg-violet-50/50 hover:bg-violet-50" : ""
              }`}
            >
              <span className="text-sm tabular-nums text-slate-400">
                {p.time}
              </span>
              <span>
                <span className="block text-sm font-medium text-slate-900">
                  {p.name}
                </span>
                <span className="block text-xs text-slate-500">
                  Age {p.age}
                </span>
              </span>
              <span className="text-sm text-slate-600">{p.condition}</span>
              <span className="text-sm font-semibold tabular-nums text-slate-700">
                {p.score == null ? "—" : `${p.score}%`}
              </span>
              <StatusBadge
                status={p.status}
                sub={p.topReason}
                tooltip={p.tooltip}
              />
            </Link>
          );
        })}
        {list.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            No patients in this filter.
          </p>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Hover a status for summary + provenance · click a candidate to review ·
        click a 🟣 enrolled patient to open their follow-up visit
      </p>
    </div>
  );
}
