"use client";

// Page 6 extracted events + (v1.1) disqualification surveillance. PRD §23.
// Renders a FollowUpExtraction — either a live Claude result or the seeded
// fallback (§38); the source badge says which honestly.
// Layout per Jae's round-2 demo review (HOLLY_TODO.md): escalation leads
// (bottom-line-up-front), findings render as a two-column finding/evidence
// table with confidence chips, events are inline-editable, "Acknowledge &
// Escalate" both attests (clinician + timestamp) and escalates, and the
// escalation card carries a signable anti-emetic order plus simulated
// same-day scheduling.

import { useState } from "react";
import type { FollowUpEvent, FollowUpExtraction } from "@/types";

const ORDER_TEXT = "ondansetron 4 mg ODT q8h PRN nausea/vomiting";

function timeNow(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Simulated next available same-day slot: ~90 min out, rounded to :00/:15/:30/:45.
function nextSlot(): string {
  const t = new Date(Date.now() + 90 * 60 * 1000);
  t.setMinutes(Math.ceil(t.getMinutes() / 15) * 15, 0, 0);
  return t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AEExtractionPanel({
  data,
  clinician = "Dr. Jae",
  dqConfirmed,
  onConfirmDq,
  onUpdateEvents,
}: {
  data: FollowUpExtraction;
  clinician?: string;
  dqConfirmed?: boolean;
  onConfirmDq?: () => void;
  onUpdateEvents?: (events: FollowUpEvent[]) => void;
}) {
  const [attested, setAttested] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FollowUpEvent[]>([]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSigned, setOrderSigned] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [slotConfirmed, setSlotConfirmed] = useState(false);

  const startEditing = () => {
    setDraft(data.events.map((e) => ({ ...e })));
    setEditing(true);
  };
  const finishEditing = () => {
    onUpdateEvents?.(draft);
    setEditing(false);
  };
  const events = editing ? draft : data.events;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-ink">AI-Extracted Events</h3>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            data.source === "live"
              ? "bg-lav text-lavdeep"
              : "bg-creamdeep text-inkmid"
          }`}
        >
          {data.source === "live"
            ? "Live Claude extraction"
            : "Seeded result (offline fallback)"}
        </span>
      </div>

      {/* Escalation — bottom-line-up-front, leads the panel */}
      {data.escalation && (
        <div className="mt-4 rounded-2xl bg-amber-100/70 p-5">
          <p className="text-sm font-bold text-amber-900">
            ⚠ Escalation required
          </p>
          <p className="mt-1.5 text-sm text-inkmid">{data.escalation}</p>

          {attested && (
            <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-amber-900">
              ✓ Findings clinician-reviewed &amp; escalated — {clinician} ·{" "}
              {attested}
            </p>
          )}
          {/* Each action renders on its OWN completion flag (Jae's bug
              report): a button persists until that action itself is done. */}
          {(!attested || (!orderSigned && !orderOpen) || !slot) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {!attested && (
                <button
                  onClick={() => setAttested(timeNow())}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-inkmid"
                >
                  Acknowledge &amp; Escalate
                </button>
              )}
              {!orderSigned && !orderOpen && (
                <button
                  onClick={() => setOrderOpen(true)}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-inkmid shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep"
                >
                  Initiate standing order for anti-emetic
                </button>
              )}
              {!slot && (
                <button
                  onClick={() => setSlot(nextSlot())}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-inkmid shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep"
                >
                  Schedule Same-day Visit
                </button>
              )}
            </div>
          )}

          {/* Signable anti-emetic order (demo state, no real order system) */}
          {orderOpen && !orderSigned && (
            <div className="mt-3 rounded-xl bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-inksoft">
                Standing order — review &amp; sign
              </p>
              <p className="mt-1.5 font-mono text-sm text-ink">{ORDER_TEXT}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setOrderSigned(timeNow())}
                  className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-inkmid"
                >
                  Sign Order
                </button>
                <button
                  onClick={() => setOrderOpen(false)}
                  className="rounded-full bg-creamdeep px-4 py-2 text-xs font-semibold text-inkmid transition hover:bg-cream"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {orderSigned && (
            <p className="mt-3 rounded-xl bg-white px-4 py-3 text-sm text-inkmid">
              ✓ Order signed — <span className="font-mono">{ORDER_TEXT}</span>{" "}
              <span className="font-semibold">
                · {clinician} · {orderSigned}
              </span>{" "}
              <span className="text-xs text-inksoft">(demo state)</span>
            </p>
          )}

          {/* Simulated same-day scheduling */}
          {slot && !slotConfirmed && (
            <div className="mt-3 rounded-xl bg-white p-4">
              <p className="text-sm text-inkmid">
                Next available slot today:{" "}
                <span className="font-semibold text-ink">{slot}</span>{" "}
                <span className="text-xs text-inksoft">
                  (simulated for demo)
                </span>
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setSlotConfirmed(true)}
                  className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-inkmid"
                >
                  Approve
                </button>
                <button
                  onClick={() => setSlot(null)}
                  className="rounded-full bg-creamdeep px-4 py-2 text-xs font-semibold text-inkmid transition hover:bg-cream"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {slot && slotConfirmed && (
            <p className="mt-3 rounded-xl bg-white px-4 py-3 text-sm text-inkmid">
              ✓ Same-day visit booked for{" "}
              <span className="font-semibold text-ink">{slot}</span>. Your
              medical assistant has been notified for direct outreach.{" "}
              <span className="text-xs text-inksoft">(demo state)</span>
            </p>
          )}
        </div>
      )}

      {/* Findings — two-column: finding left, chain of evidence right */}
      {(events.length > 0 || (data.insights?.length ?? 0) > 0) && (
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-x-8 border-b border-cream pb-2 md:grid-cols-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-inksoft">
              Finding
            </p>
            <p className="hidden text-[11px] font-bold uppercase tracking-wider text-inksoft md:block">
              Evidence — patient&apos;s words
            </p>
          </div>
          {events.map((e, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1 border-b border-cream py-3 md:grid-cols-2"
            >
              <div>
                {editing ? (
                  <>
                    <input
                      value={e.event}
                      onChange={(ev) =>
                        setDraft((d) =>
                          d.map((x, i) =>
                            i === idx ? { ...x, event: ev.target.value } : x,
                          ),
                        )
                      }
                      className="w-full rounded-lg bg-cream px-2 py-1 text-[15px] font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
                    />
                    <input
                      value={e.detail}
                      onChange={(ev) =>
                        setDraft((d) =>
                          d.map((x, i) =>
                            i === idx ? { ...x, detail: ev.target.value } : x,
                          ),
                        )
                      }
                      className="mt-1 w-full rounded-lg bg-cream px-2 py-1 text-sm text-inkmid focus:outline-none focus:ring-2 focus:ring-ink/20"
                    />
                  </>
                ) : (
                  <p className="text-[15px] font-semibold text-ink">
                    {e.event}
                    <span className="ml-2 rounded-full bg-creamdeep px-2 py-0.5 align-middle text-[11px] font-semibold tabular-nums text-inkmid">
                      {e.confidence}%
                    </span>
                  </p>
                )}
                {!editing && (
                  <p className="mt-0.5 text-sm text-inkmid">{e.detail}</p>
                )}
              </div>
              <p className="text-sm italic text-inksoft">
                {e.quote ? `“${e.quote}”` : "—"}
              </p>
            </div>
          ))}
          {(data.insights ?? []).map((i) => (
            <div
              key={i.signal}
              className="grid grid-cols-1 items-baseline gap-x-8 gap-y-1 border-b border-cream py-3 md:grid-cols-2"
            >
              <div>
                <p className="text-[15px] font-bold text-ink">{i.signal}</p>
                <p className="mt-0.5 text-sm text-inkmid">{i.detail}</p>
              </div>
              <p className="text-sm italic text-inksoft">
                {i.quote ? `“${i.quote}”` : "—"}
              </p>
            </div>
          ))}
        </div>
      )}
      {events.length === 0 && (data.insights?.length ?? 0) === 0 && (
        <p className="mt-4 text-sm italic text-inksoft">
          No adverse events detected in this transcript.
        </p>
      )}

      {data.footnotes.length > 0 && (
        <ul className="mt-4 space-y-1">
          {data.footnotes.map((f) => (
            <li key={f} className="text-xs text-inksoft">
              {f}
            </li>
          ))}
        </ul>
      )}

      {data.disqualification && (
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
              “{data.disqualification.criterion}”
            </span>
          </p>
          <p className="mt-1 text-sm text-inkmid">
            Evidence: {data.disqualification.evidence}
            {data.disqualification.source && (
              <span className="ml-1 text-xs text-inksoft">
                · {data.disqualification.source}
              </span>
            )}
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

      {!data.disqualification && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-cream pt-5">
          {editing ? (
            <button
              onClick={finishEditing}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-inkmid"
            >
              Done Editing
            </button>
          ) : (
            <button
              onClick={startEditing}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-inkmid shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep"
            >
              Edit
            </button>
          )}
          <span className="ml-1 text-xs text-inksoft">
            ✓ Auto-saved to the participant record
          </span>
        </div>
      )}
    </div>
  );
}
