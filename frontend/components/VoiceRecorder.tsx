"use client";

// Voice capture: real mic recording → Whisper transcription (useVoiceCapture),
// plus the mandatory seeded demo-audio fallback (PRD §25, §38). The demo
// button stays enabled while recording/uploading so the presenter can always
// bail out of a stalling live path. Brand-red circular mic, Abridge-style.

import { useRef } from "react";
import type { CaptureState } from "@/lib/useVoiceCapture";

export default function VoiceRecorder({
  busy,
  capture,
  error,
  demoLabel,
  onRecordStart,
  onRecordStop,
  onDemo,
  audioSrc,
}: {
  busy: boolean; // seeded demo transcript is typing out
  capture: CaptureState;
  error?: string | null;
  demoLabel: string;
  onRecordStart: () => void;
  onRecordStop: () => void;
  onDemo: (audio: HTMLAudioElement | null) => void;
  audioSrc?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recording = capture === "recording";
  const uploading = capture === "uploading";
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={recording ? onRecordStop : onRecordStart}
          disabled={busy || uploading}
          className="inline-flex items-center gap-2.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
        >
          <span
            className={`h-2 w-2 rounded-full bg-white ${busy || recording ? "animate-pulse" : ""}`}
          />
          {uploading
            ? "Transcribing…"
            : recording
              ? "Stop & Transcribe"
              : busy
                ? "Listening…"
                : "Start Recording"}
        </button>
        <button
          onClick={() => {
            let audio: HTMLAudioElement | null = null;
            if (audioSrc) {
              audioRef.current ??= new Audio(audioSrc);
              audio = audioRef.current;
              audio.currentTime = 0;
              audio.play().catch(() => {});
            }
            onDemo(audio); // pages sync the typing animation to this element
          }}
          disabled={busy}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-inkmid shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep disabled:opacity-60"
        >
          {demoLabel}
        </button>
      </div>
      {error && <p className="mt-2.5 text-xs text-brand">{error}</p>}
    </div>
  );
}
