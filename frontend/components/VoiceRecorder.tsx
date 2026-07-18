"use client";

// Mock voice capture with the mandatory demo fallback (PRD §25, §38).
// Brand-red circular mic, Abridge-style.

export default function VoiceRecorder({
  stage,
  demoLabel,
  onStart,
}: {
  stage: "idle" | "transcribing" | "ready" | "applied";
  demoLabel: string;
  onStart: () => void;
}) {
  const busy = stage === "transcribing";
  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={onStart}
        disabled={busy}
        className="inline-flex items-center gap-2.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
      >
        <span
          className={`h-2 w-2 rounded-full bg-white ${busy ? "animate-pulse" : ""}`}
        />
        {busy ? "Listening…" : "Start Recording"}
      </button>
      <button
        onClick={onStart}
        disabled={busy}
        className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-inkmid shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep disabled:opacity-60"
      >
        {demoLabel}
      </button>
    </div>
  );
}
