"use client";

// Page 3 queue (v1.1), Abridge-style: airy borderless rows with initial
// avatars, hover-white rounded rows, status tooltips with provenance,
// lavender rows for enrolled patients. Candidate row → Page 4; enrolled
// row → follow-up view (Page 6).

import { useState } from "react";
import Link from "next/link";
import type { QueuePatient } from "@/types";
import { initialsOf } from "@/lib/status";
import StatusBadge from "./StatusBadge";

const TABS = [
  { key: "all", label: "All" },
  { key: "match", label: "Match" },
  { key: "missing", label: "Missing Data" },
  { key: "review", label: "Needs Review" },
  { key: "excluded", label: "Excluded" },
  { key: "enrolled", label: "Enrolled" },
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
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              tab === t.key
                ? "bg-ink text-white"
                : "bg-creamdeep text-inkmid hover:bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Column headers — match score (PRD §22), not "confidence" */}
      <div className="mt-5 grid grid-cols-[44px_1fr_56px_84px_144px] gap-4 px-4">
        <span />
        <span />
        <span className="text-right text-[11px] font-bold uppercase tracking-wider text-inksoft">
          Match
        </span>
        <span className="text-right text-[11px] font-bold uppercase tracking-wider text-inksoft">
          Enriched
        </span>
        <span />
      </div>

      <div className="mt-2 space-y-1">
        {list.map((p) => {
          const enrolled = p.status === "actively_enrolled";
          return (
            <Link
              key={p.id}
              href={
                enrolled ? `/patients/${p.id}/follow-up` : `/patients/${p.id}`
              }
              className={`grid grid-cols-[44px_1fr_56px_84px_144px] items-center gap-4 rounded-2xl px-4 py-3.5 transition ${
                enrolled
                  ? "bg-lav/40 hover:bg-lav/60"
                  : "hover:bg-white hover:shadow-sm"
              }`}
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${
                  enrolled ? "bg-lav text-lavdeep" : "bg-sage text-sagedeep"
                }`}
              >
                {initialsOf(p.name)}
              </span>
              <span>
                <span className="block text-[15px] font-bold text-ink">
                  {p.name}
                  <span className="ml-2 text-sm font-normal text-inksoft">
                    Age {p.age}
                  </span>
                </span>
                <span className="mt-0.5 block text-sm text-inkmid">
                  {p.condition} — {p.topReason}
                </span>
              </span>
              {/* Match (protocol-only) — fades when clinician knowledge shifts the row */}
              <span
                className={`self-start pt-[3px] text-right text-sm tabular-nums ${
                  p.knowledgeDelta != null
                    ? "font-normal text-inksoft/70"
                    : "font-semibold text-inkmid"
                }`}
              >
                {(p.baseScore ?? p.score) == null
                  ? "—"
                  : `${p.baseScore ?? p.score}%`}
              </span>
              {/* Enriched (+ clinician knowledge) — em-dash until a rule shifts the row */}
              <span className="self-start pt-[3px] text-right text-sm tabular-nums">
                {p.knowledgeDelta != null && p.score != null ? (
                  <>
                    <span className="font-bold text-ink">{p.score}%</span>
                    <span className="ml-1 text-[11px] font-semibold text-amber-700">
                      {p.knowledgeDelta < 0
                        ? `▼${-p.knowledgeDelta}`
                        : `▲${p.knowledgeDelta}`}
                    </span>
                  </>
                ) : (
                  <span className="text-inksoft">—</span>
                )}
              </span>
              <span className="self-start">
                <StatusBadge
                  status={p.status}
                  sub={p.time}
                  tooltip={p.tooltip}
                  fixedWidth
                />
              </span>
            </Link>
          );
        })}
        {list.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-inksoft">
            No patients in this filter.
          </p>
        )}
      </div>
      <p className="mt-4 px-4 text-xs text-inksoft">
        Hover a status for summary + provenance · click a candidate to review ·
        click an enrolled patient to open their follow-up visit
      </p>
    </div>
  );
}
