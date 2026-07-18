"use client";

// Page 3 — "Ask Beacon": natural-language surveillance questions across
// the whole queue, typed or spoken (Whisper via useVoiceCapture). Answered
// live by Claude with verbatim per-patient evidence (/api/cohort); the
// matched count is derived from the validated matches array, never from
// model prose. Lavender = AI content, per the design system.

import { Fragment, useState } from "react";
import Link from "next/link";
import { COHORT_EXAMPLES, PATIENTS } from "@/lib/data";
import { getOverrides } from "@/lib/demo";
import { useVoiceCapture } from "@/lib/useVoiceCapture";
import type { CohortQueryResult } from "@/types";

export default function CohortQueryBar() {
  const [query, setQuery] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CohortQueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  const capture = useVoiceCapture((text) => {
    setQuery(text);
    void run(text);
  });

  async function run(q: string) {
    const question = q.trim();
    if (!question || running) return;
    if (capture.state === "error") capture.reset(); // clear stale mic banner
    setRunning(true);
    setResult(null);
    setQueryError(null);
    try {
      const res = await fetch("/api/cohort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Session status overrides (e.g. a confirmed disqualification) ride
        // along so the answer can't contradict the queue on screen.
        body: JSON.stringify({ question, overrides: getOverrides() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult((await res.json()) as CohortQueryResult);
    } catch {
      // A transport failure is an error, not a seeded fallback — never
      // label it "Seeded result" (CLAUDE.md truthful-labels rule).
      setQueryError("Cohort query failed — check the connection and try again.");
    }
    setRunning(false);
  }

  const recording = capture.state === "recording";
  const transcribing = capture.state === "uploading";
  const busy = running || recording || transcribing;
  const placeholder = recording
    ? "Listening…"
    : transcribing
      ? "Transcribing…"
      : "e.g. Which patients have reported GI symptoms?";

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-bold text-ink">Ask Beacon</h2>
        <p className="text-xs text-inksoft">
          Population-level surveillance — every answer cites each patient&apos;s
          record
        </p>
      </div>

      <form
        className="mt-4 flex items-center gap-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          void run(query);
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={recording || transcribing}
          className="min-w-0 flex-1 rounded-full bg-cream px-5 py-2.5 text-sm text-ink placeholder:text-inksoft focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:opacity-70"
        />
        <button
          type="button"
          onClick={() => (recording ? capture.stop() : void capture.start())}
          disabled={transcribing || running}
          title={recording ? "Stop & transcribe" : "Ask by voice"}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition disabled:opacity-60 ${
            recording ? "bg-brand animate-pulse" : "bg-brand hover:bg-brand/90"
          }`}
        >
          {recording ? (
            <span className="h-3 w-3 rounded-[3px] bg-white" />
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" />
              <path d="M18 11a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.94V21h2v-2.06A8 8 0 0 0 20 11h-2Z" />
            </svg>
          )}
        </button>
        <button
          type="submit"
          disabled={busy || !query.trim()}
          className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-inkmid disabled:opacity-40"
        >
          {running ? "Asking…" : "Ask"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {COHORT_EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setQuery(ex);
              void run(ex);
            }}
            disabled={busy}
            className="rounded-full bg-creamdeep px-3.5 py-1.5 text-xs font-medium text-inkmid transition hover:bg-cream disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      {(capture.error || queryError) && (
        <p className="mt-3 text-xs text-brand">{capture.error ?? queryError}</p>
      )}

      {running && (
        <p className="mt-4 animate-pulse text-sm text-inkmid">
          Claude is reading all {PATIENTS.length} patient records…
        </p>
      )}

      {result && !running && (
        <div className="mt-4 rounded-2xl bg-lav/40 p-5">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              result.source === "live"
                ? "bg-lav text-lavdeep"
                : "bg-creamdeep text-inkmid"
            }`}
          >
            {result.source === "live"
              ? "Live Claude cohort query"
              : "Seeded result (offline fallback)"}
          </span>
          <p className="mt-3 text-sm leading-relaxed text-ink">
            {result.answer}
          </p>
          {result.matches.length > 0 && (
            <div className="mt-3 grid grid-cols-[max-content_1fr] items-start gap-x-3 gap-y-2.5">
              {result.matches.map((m) => (
                <Fragment key={m.patient_id}>
                  <Link
                    href={`/patients/${m.patient_id}`}
                    className="justify-self-start rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep"
                  >
                    {m.name}
                  </Link>
                  <span className="pt-1 text-xs leading-relaxed text-inkmid">
                    {m.evidence}
                  </span>
                </Fragment>
              ))}
            </div>
          )}
          <p className="mt-3 text-[11px] text-inksoft">
            {result.matches.length > 0
              ? `${result.matches.length} of ${PATIENTS.length} patients matched · `
              : ""}
            decision support only — clinician review required
            {result.caveats?.length ? ` · ${result.caveats.join(" ")}` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
