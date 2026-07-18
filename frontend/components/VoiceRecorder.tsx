"use client";

// Mock voice capture with the mandatory demo fallback — the demo must never
// depend on microphone permissions (PRD §25, §38). Both buttons drive the
// same simulated transcription flow.

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
    <div className="flex items-center gap-2">
      <button
        onClick={onStart}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50"
      >
        <span
          className={`h-2 w-2 rounded-full bg-white ${busy ? "animate-pulse" : ""}`}
        />
        {busy ? "Listening…" : "Start Recording"}
      </button>
      <button
        onClick={onStart}
        disabled={busy}
        className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
      >
        {demoLabel}
      </button>
    </div>
  );
}
