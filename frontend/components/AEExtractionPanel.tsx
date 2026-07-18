"use client";

// Page 6 extracted events + (v1.1) disqualification surveillance. PRD §23.

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
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h3 className="text-[15px] font-bold text-ink">AI-Extracted Events</h3>
      <div className="mt-4 space-y-4">
        {scenario.events.map((e) => (
          <div
            key={e.event}
            className="flex items-baseline justify-between gap-4 border-t border-cream pt-4 first:border-t-0 first:pt-0"
          >
            <div>
              <p className="text-[15px] font-semibold text-ink">{e.event}</p>
              <p className="mt-0.5 text-sm text-inkmid">{e.detail}</p>
            </div>
            <span className="text-xs tabular-nums text-inksoft">
              Confidence: {e.confidence}%
            </span>
          </div>
        ))}
      </div>
      <ul className="mt-5 space-y-1 border-t border-cream pt-4">
        {scenario.footnotes.map((f) => (
          <li key={f} className="text-xs text-inksoft">
            {f}
          </li>
        ))}
      </ul>

      {scenario.escalation && (
        <div className="mt-5 rounded-2xl bg-amber-100/70 p-5">
          <p className="text-sm font-bold text-amber-900">
            ⚠ Escalation required
          </p>
          <p className="mt-1.5 text-sm text-inkmid">{scenario.escalation}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-inkmid">
              Notify Trial Physician
            </button>
            <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-inkmid shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep">
              Schedule Same-day Visit
            </button>
          </div>
        </div>
      )}

      {scenario.disqualification && (
        <div className="mt-5 rounded-2xl bg-brand/8 p-5">
          <p className="text-sm font-bold text-brand">
            ⛔ Trial disqualification detected
            <span className="ml-2 font-normal text-brand/70">
              (auto re-screen on transcript update)
            </span>
          </p>
          <p className="mt-2 text-sm text-inkmid">
            Matches exclusion criterion:{" "}
            <span className="font-semibold text-ink">
              “{scenario.disqualification.criterion}”
            </span>
          </p>
          <p className="mt-1 text-sm text-inkmid">
            Evidence: {scenario.disqualification.evidence}
            <span className="ml-1 text-xs text-inksoft">
              · {scenario.disqualification.source}
            </span>
          </p>
          {dqConfirmed ? (
            <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brand">
              Status updated: Actively Enrolled → Disqualified. The patient
              queue has been updated automatically.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={onConfirmDq}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                Confirm Disqualification
              </button>
              <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-inkmid shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep">
                Dispute with Evidence
              </button>
            </div>
          )}
          <p className="mt-2.5 text-[11px] text-inksoft">
            Status change requires clinician confirmation — the system never
            disqualifies autonomously.
          </p>
        </div>
      )}

      {!scenario.disqualification && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-cream pt-5">
          <button className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-inkmid">
            Confirm Findings
          </button>
          <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-inkmid shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep">
            Edit
          </button>
          <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-inkmid shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep">
            Save to Participant Record
          </button>
        </div>
      )}
    </div>
  );
}
