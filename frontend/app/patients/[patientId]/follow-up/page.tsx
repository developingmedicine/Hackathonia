"use client";

// PAGE 6 — Follow-up Visit, AE Extraction & Disqualification Surveillance.
// Nathan: audio-driven AE extraction. Maya (v1.1): transcript triggers auto
// re-screen against exclusion criteria → disqualification with evidence;
// confirming updates the Page 3 queue via the demo override store.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FOLLOWUPS } from "@/lib/mock";
import { setOverride } from "@/lib/demo";
import AEExtractionPanel from "@/components/AEExtractionPanel";
import TranscriptPanel from "@/components/TranscriptPanel";
import VoiceRecorder from "@/components/VoiceRecorder";

type Stage = "idle" | "transcribing" | "done";

export default function FollowUpPage() {
  const params = useParams<{ patientId: string }>();
  const scenario = FOLLOWUPS[params.patientId];

  const [stage, setStage] = useState<Stage>("idle");
  const [transcript, setTranscript] = useState("");
  const [dqConfirmed, setDqConfirmed] = useState(false);

  useEffect(() => {
    if (stage !== "transcribing" || !scenario) return;
    let i = 0;
    const timer = setInterval(() => {
      i += 4;
      setTranscript(scenario.transcript.slice(0, i));
      if (i >= scenario.transcript.length) {
        clearInterval(timer);
        setStage("done");
      }
    }, 24);
    return () => clearInterval(timer);
  }, [stage, scenario]);

  if (!scenario) {
    return (
      <p className="text-sm text-slate-500">
        No follow-up scenario seeded for this patient.{" "}
        <Link href="/patients" className="underline">
          Back to queue
        </Link>
      </p>
    );
  }

  return (
    <div>
      <Link
        href="/patients"
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Patient Queue (🟣 row)
      </Link>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {scenario.patientName} · Week {scenario.week} Follow-up
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Visit conversation — all findings require clinician review
            </p>
          </div>
          <VoiceRecorder
            stage={stage === "done" ? "ready" : stage}
            demoLabel={
              scenario.hasAudio ? "Use Demo Audio" : "Use Demo Transcript"
            }
            onStart={() => {
              setTranscript("");
              setDqConfirmed(false);
              setStage("transcribing");
            }}
          />
        </div>
        <div className="mt-4">
          <TranscriptPanel
            value={transcript}
            typing={stage === "transcribing"}
          />
        </div>
      </div>

      {stage === "done" && (
        <div className="mt-4">
          <AEExtractionPanel
            scenario={scenario}
            dqConfirmed={dqConfirmed}
            onConfirmDq={() => {
              setOverride(scenario.patientId, {
                status: "confirmed_exclusion",
                reason: "Disqualified — pancreatitis dx (follow-up)",
              });
              setDqConfirmed(true);
            }}
          />
          {dqConfirmed && (
            <p className="mt-3 text-sm">
              <Link
                href="/patients"
                className="font-medium text-slate-900 underline"
              >
                View updated queue →
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
