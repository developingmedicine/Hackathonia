"use client";

// PAGE 6 — Follow-up Visit, AE Extraction & Disqualification Surveillance.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FOLLOWUPS } from "@/lib/mock";
import { setOverride } from "@/lib/demo";
import { initialsOf } from "@/lib/status";
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
      <p className="text-sm text-inkmid">
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
        className="text-sm font-medium text-inksoft transition hover:text-ink"
      >
        ← Patient Queue
      </Link>

      <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lav text-[15px] font-bold text-lavdeep">
              {initialsOf(scenario.patientName)}
            </span>
            <div>
              <h1 className="text-xl font-bold text-ink">
                {scenario.patientName} · Week {scenario.week} Follow-up
              </h1>
              <p className="mt-0.5 text-xs text-inksoft">
                Visit conversation — all findings require clinician review
              </p>
            </div>
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
        <div className="mt-5">
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
            <p className="mt-4 text-sm">
              <Link
                href="/patients"
                className="font-semibold text-ink underline"
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
