"use client";

// PAGE 2 — Trial Intelligence & Clinician Knowledge Intake (v1.1 layout):
// LEFT = existing criteria (read-only) + Extracted Guidance beneath them;
// RIGHT = voice capture → editable transcript → Apply to Screening Logic.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CLINICIAN_TRANSCRIPT, CRITERIA, GUIDANCE, TRIALS } from "@/lib/data";
import CriteriaList from "@/components/CriteriaList";
import GuidancePanel from "@/components/GuidancePanel";
import TranscriptPanel from "@/components/TranscriptPanel";
import VoiceRecorder from "@/components/VoiceRecorder";

type Stage = "idle" | "transcribing" | "ready" | "applied";

export default function TrialIntelligencePage() {
  const params = useParams<{ trialId: string }>();
  const trial = TRIALS.find((t) => t.id === params.trialId) ?? TRIALS[0];

  const [stage, setStage] = useState<Stage>("idle");
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (stage !== "transcribing") return;
    let i = 0;
    const timer = setInterval(() => {
      i += 4;
      setTranscript(CLINICIAN_TRANSCRIPT.slice(0, i));
      if (i >= CLINICIAN_TRANSCRIPT.length) {
        clearInterval(timer);
        setStage("ready");
      }
    }, 24);
    return () => clearInterval(timer);
  }, [stage]);

  return (
    <div>
      <Link
        href="/trials"
        className="text-sm font-medium text-inksoft transition hover:text-ink"
      >
        ← Back to Trials
      </Link>
      <div className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {trial.title}
        </h1>
        <p className="mt-1.5 text-sm text-inkmid">
          {trial.id} · {trial.status} · {trial.conditions.join(", ")} ·{" "}
          {trial.phase} · {trial.location}
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* LEFT: existing criteria + extracted guidance (v1.1) */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="text-[15px] font-bold text-ink">
            Parsed Eligibility Criteria
          </h2>
          <p className="mt-0.5 text-xs text-inksoft">
            Existing protocol criteria — read-only
          </p>
          <div className="mt-5">
            <CriteriaList criteria={CRITERIA} />
          </div>
          {stage === "applied" && (
            <div className="mt-6">
              <GuidancePanel guidance={GUIDANCE} />
            </div>
          )}
        </div>

        {/* RIGHT: clinician knowledge intake */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="text-[15px] font-bold text-ink">
            Clinician Knowledge Layer
          </h2>
          <p className="mt-0.5 text-xs text-inksoft">
            Add context &amp; insight to the existing criteria — captured once,
            applied to all patients.
          </p>
          <div className="mt-5">
            <VoiceRecorder
              stage={stage}
              demoLabel="Use Demo Audio"
              audioSrc="/audio/clinician-context.m4a"
              onStart={() => {
                setTranscript("");
                setStage("transcribing");
              }}
            />
          </div>
          <div className="mt-5">
            <TranscriptPanel
              value={transcript}
              typing={stage === "transcribing"}
              editable={stage === "ready"}
              onChange={setTranscript}
            />
          </div>
          <button
            onClick={() => setStage("applied")}
            disabled={stage !== "ready"}
            className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-inkmid disabled:opacity-40"
          >
            {stage === "applied"
              ? "Applied to screening logic ✓"
              : "Apply to Screening Logic"}
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-xs text-inksoft">
          {stage === "applied"
            ? "Clinician guidance is active — screening will include the pancreatitis-risk flags."
            : "You can screen with protocol criteria only, or add clinician guidance first."}
        </p>
        <Link
          href="/patients"
          className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-inkmid"
        >
          Screen Patient Cohort →
        </Link>
      </div>
    </div>
  );
}
