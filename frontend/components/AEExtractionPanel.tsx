"use client";

// Page 6 extracted events + (v1.1) disqualification surveillance: when an
// extracted event matches a trial exclusion criterion, surface a
// disqualification alert with verbatim transcript evidence. PRD §23.

import type { FollowUpScenario } from "@/types";

export default function AEExtractionPanel({
  scenario,
  dqConfirmed,
  onConfirmDq,
}: {
  scenario: FollowUpScenario;
  dqConfirmed?: boolean;
  onConfirmDq?: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">
        AI-Extracted Events
      </h3>
      <div className="mt-3 space-y-3">
        {scenario.events.map((e) => (
          <div
            key={e.event}
            className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-3 first:border-t-0 first:pt-0"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{e.event}</p>
              <p className="text-xs text-slate-500">{e.detail}</p>
            </div>
            <span className="text-xs tabular-nums text-slate-400">
              Confidence: {e.confidence}%
            </span>
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-1 border-t border-slate-100 pt-3">
        {scenario.footnotes.map((f) => (
          <li key={f} className="text-xs text-slate-500">
            {f}
          </li>
        ))}
      </ul>

      {scenario.disqualification && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-700">
            ⛔ Trial disqualification detected
            <span className="ml-2 font-normal text-rose-500">
              (auto re-screen on transcript update)
            </span>
          </p>
          <p className="mt-1.5 text-sm text-slate-700">
            Matches exclusion criterion:{" "}
            <span className="font-medium">
              “{scenario.disqualification.criterion}”
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-700">
            Evidence: {scenario.disqualification.evidence}
            <span className="ml-1 text-xs text-slate-400">
              · {scenario.disqualification.source}
            </span>
          </p>
          {dqConfirmed ? (
            <p className="mt-3 rounded-md bg-white px-3 py-2 text-sm font-medium text-rose-700">
              Status updated: Actively Enrolled → Disqualified. The patient
              queue has been updated automatically.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={onConfirmDq}
                className="rounded-lg bg-rose-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-rose-500"
              >
                Confirm Disqualification
              </button>
              <button className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Dispute with Evidence
              </button>
            </div>
          )}
          <p className="mt-2 text-[11px] text-slate-400">
            Status change requires clinician confirmation — the system never
            disqualifies autonomously.
          </p>
        </div>
      )}

      {!scenario.disqualification && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <button className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Confirm Findings
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Edit
          </button>
          <button className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Save to Participant Record
          </button>
        </div>
      )}
    </div>
  );
}
