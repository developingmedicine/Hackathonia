"use client";

// Real mic capture shared by Pages 2 & 6: MediaRecorder → POST /api/transcribe
// (OpenAI Whisper) → transcript text. The seeded demo-audio path never touches
// this — it remains the mandatory offline fallback (PRD §38).

import { useEffect, useRef, useState } from "react";

export type CaptureState = "idle" | "recording" | "uploading" | "error";

export function useVoiceCapture(onTranscript: (text: string) => void) {
  const [state, setState] = useState<CaptureState>("idle");
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startingRef = useRef(false);
  // Bumped by reset/unmount so in-flight recordings and uploads are discarded.
  const genRef = useRef(0);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  // Release recorder + mic without delivering a result or touching React state.
  function teardown() {
    genRef.current++;
    startingRef.current = false;
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.onstop = null;
      rec.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    recorderRef.current = null;
    streamRef.current = null;
    chunksRef.current = [];
  }

  // Navigating away mid-recording must release the mic.
  useEffect(() => teardown, []);

  async function transcribe(blob: Blob) {
    const gen = genRef.current;
    try {
      const form = new FormData();
      const ext = blob.type.includes("ogg")
        ? "ogg"
        : blob.type.includes("wav")
          ? "wav"
          : blob.type.includes("mp4")
            ? "mp4"
            : "webm";
      form.append("audio", blob, `recording.${ext}`);
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (gen !== genRef.current) return; // reset/unmount while uploading
      if (!res.ok || typeof data.text !== "string") {
        throw new Error(
          data.error ??
            `Transcription failed (HTTP ${res.status}) — try again or use the demo audio.`,
        );
      }
      if (!data.text.trim()) {
        setError(
          "No speech detected — try again closer to the mic, or use the demo audio.",
        );
        setState("error");
        return;
      }
      setState("idle");
      onTranscriptRef.current(data.text);
    } catch (err) {
      if (gen !== genRef.current) return;
      console.error("transcription failed:", err);
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Transcription failed — try again or use the demo audio.",
      );
      setState("error");
    }
  }

  async function start() {
    if (startingRef.current || recorderRef.current) return; // already active
    startingRef.current = true;
    setError(null);
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!startingRef.current) {
        // reset/unmount happened while the permission prompt was open
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const mimeType = ["audio/webm", "audio/mp4"].find((t) =>
        MediaRecorder.isTypeSupported(t),
      );
      const rec = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      const gen = genRef.current;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        chunksRef.current = [];
        stream?.getTracks().forEach((t) => t.stop());
        recorderRef.current = null;
        streamRef.current = null;
        if (gen !== genRef.current) return;
        void transcribe(blob);
      };
      recorderRef.current = rec;
      streamRef.current = stream;
      rec.start();
      setState("recording");
    } catch (err) {
      stream?.getTracks().forEach((t) => t.stop());
      console.error("mic unavailable:", err);
      setError(
        "Microphone unavailable — check browser permissions, or use the demo audio.",
      );
      setState("error");
    } finally {
      startingRef.current = false;
    }
  }

  function stop() {
    if (recorderRef.current?.state === "recording") {
      setState("uploading");
      recorderRef.current.stop(); // onstop → transcribe
    }
  }

  // Abort any in-flight recording/upload and clear the error banner — called
  // when the presenter falls back to the seeded demo path (PRD §38).
  function reset() {
    teardown();
    setError(null);
    setState("idle");
  }

  return { state, error, start, stop, reset };
}
