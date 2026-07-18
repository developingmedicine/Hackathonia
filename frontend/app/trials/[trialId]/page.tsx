"use client";

// PAGE 2 — Trial Intelligence & Clinician Knowledge Intake (v1.1 layout):
// LEFT = existing criteria (read-only) + Extracted Guidance beneath them;
// RIGHT = voice capture → editable transcript → Apply to Screening Logic.
// The clinician annotates existing criteria — never creates new ones.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CLINICIAN_TRANSCRIPT, CRITERIA, GUIDANCE, TRIALS } from "@/lib/mock";
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
      <Link href="/trials" className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to Trials
      </Link>
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5">
        <h1 className="font-semibold text-slate-900">{trial.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {trial.id} · {trial.status} · {trial.conditions.join(", ")} ·{" "}
          {trial.phase} · {trial.location}
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* LEFT: existing criteria + extracted guidance (v1.1) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Parsed Eligibility Criteria
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Existing protocol criteria — read-only
          </p>
          <div className="mt-4">
            <CriteriaList criteria={CRITERIA} />
          </div>
          {stage === "applied" && (
            <div className="mt-5">
              <GuidancePanel guidance={GUIDANCE} />
            </div>
          )}
        </div>

        {/* RIGHT: clinician knowledge intake */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Clinician Knowledge Layer
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Add context &amp; insight to the existing criteria — captured once,
            applied to all patients.
          </p>
          <div className="mt-4">
            <VoiceRecorder
              stage={stage}
              demoLabel="Use Demo Audio"
              onStart={() => {
                setTranscript("");
                setStage("transcribing");
              }}
            />
          </div>
          <div className="mt-4">
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
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-40"
          >
            {stage === "applied"
              ? "Applied to screening logic ✓"
              : "Apply to Screening Logic"}
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-400">
          {stage === "applied"
            ? "Clinician guidance is active — screening will include the pancreatitis-risk flags."
            : "You can screen with protocol criteria only, or add clinician guidance first."}
        </p>
        <Link
          href="/patients"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Screen Patient Cohort →
        </Link>
      </div>
    </div>
  );
}
