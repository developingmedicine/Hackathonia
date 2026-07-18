"use client";

// PAGE 6 — Follow-up Visit, AE Extraction & Disqualification Surveillance.
// After the transcript lands it is POSTed to /api/follow-up where Claude
// extracts events live and re-screens against the trial's exclusion
// criteria; on any failure the seeded scenario result renders instead
// (PRD §38). The transcript stays editable — edit and re-extract to show
// the analysis is real.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FOLLOWUPS } from "@/lib/data";
import { setOverride } from "@/lib/demo";
import { initialsOf } from "@/lib/status";
import type { FollowUpExtraction } from "@/types";
import AEExtractionPanel from "@/components/AEExtractionPanel";
import TranscriptPanel from "@/components/TranscriptPanel";
import VoiceRecorder from "@/components/VoiceRecorder";

type Stage = "idle" | "transcribing" | "done";

export default function FollowUpPage() {
  const params = useParams<{ patientId: string }>();
  const scenario = FOLLOWUPS[params.patientId];

  const [stage, setStage] = useState<Stage>("idle");
  const [transcript, setTranscript] = useState("");
  const [extraction, setExtraction] = useState<FollowUpExtraction | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [dqConfirmed, setDqConfirmed] = useState(false);

  async function runExtraction(text: string) {
    setExtracting(true);
    setDqConfirmed(false);
    try {
      const res = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: params.patientId, transcript: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setExtraction((await res.json()) as FollowUpExtraction);
    } catch {
      setExtraction({
        events: scenario?.events ?? [],
        footnotes: scenario?.footnotes ?? [],
        escalation: scenario?.escalation ?? null,
        disqualification: scenario?.disqualification ?? null,
        source: "seeded",
      });
    }
    setExtracting(false);
  }

  useEffect(() => {
    if (stage !== "transcribing" || !scenario) return;
    let i = 0;
    const timer = setInterval(() => {
      i += 4;
      setTranscript(scenario.transcript.slice(0, i));
      if (i >= scenario.transcript.length) {
        clearInterval(timer);
        setStage("done");
        void runExtraction(scenario.transcript);
      }
    }, 24);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            audioSrc={scenario.audioSrc}
            onStart={() => {
              setTranscript("");
              setExtraction(null);
              setDqConfirmed(false);
              setStage("transcribing");
            }}
          />
        </div>
        <div className="mt-5">
          <TranscriptPanel
            value={transcript}
            typing={stage === "transcribing"}
            editable={stage === "done"}
            onChange={setTranscript}
          />
        </div>
        {stage === "done" && (
          <button
            onClick={() => void runExtraction(transcript)}
            disabled={extracting}
            className="mt-4 rounded-full bg-lav px-5 py-2.5 text-sm font-semibold text-lavdeep transition hover:bg-lav/70 disabled:opacity-50"
          >
            {extracting ? "Extracting…" : "Re-extract with Claude"}
          </button>
        )}
      </div>

      {extracting && !extraction && (
        <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <p className="animate-pulse text-sm text-inkmid">
            Claude is reading the transcript and checking it against the
            trial&apos;s exclusion criteria…
          </p>
        </div>
      )}

      {extraction && !extracting && (
        <div className="mt-4">
          <AEExtractionPanel
            data={extraction}
            dqConfirmed={dqConfirmed}
            onConfirmDq={() => {
              setOverride(scenario.patientId, {
                status: "confirmed_exclusion",
                reason: "Disqualified — exclusion via follow-up",
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
