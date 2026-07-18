"use client";

// PAGE 2 — Trial Intelligence & Clinician Knowledge Intake (v1.1 layout):
// LEFT = existing criteria (read-only) + Extracted Guidance beneath them;
// RIGHT = voice capture → editable transcript → Apply to Screening Logic.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CLINICIAN_TRANSCRIPT, CRITERIA, GUIDANCE, TRIALS } from "@/lib/data";
import { setGuidanceApplied } from "@/lib/demo";
import type { GuidanceExtraction, LiveTrialDetail } from "@/types";
import CriteriaList from "@/components/CriteriaList";
import GuidancePanel from "@/components/GuidancePanel";
import TranscriptPanel from "@/components/TranscriptPanel";
import VoiceRecorder from "@/components/VoiceRecorder";

type Stage = "idle" | "transcribing" | "ready" | "applied";

export default function TrialIntelligencePage() {
  const params = useParams<{ trialId: string }>();
  const seeded = TRIALS.find((t) => t.id === params.trialId);

  const [stage, setStage] = useState<Stage>("idle");
  const [transcript, setTranscript] = useState("");
  const [guidance, setGuidance] = useState<GuidanceExtraction | null>(null);
  const [applying, setApplying] = useState(false);
  const [liveDetail, setLiveDetail] = useState<LiveTrialDetail | null>(null);
  const [liveState, setLiveState] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  // External trial (not in the seeded set) → load it live from CT.gov.
  useEffect(() => {
    if (seeded) return;
    let cancelled = false;
    setLiveState("loading");
    fetch(`/api/trials/${params.trialId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const detail = (await res.json()) as LiveTrialDetail;
        if (!cancelled) {
          setLiveDetail(detail);
          setLiveState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setLiveState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [seeded, params.trialId]);

  const trial = seeded ?? liveDetail?.trial ?? null;

  async function applyGuidance() {
    setApplying(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setGuidance((await res.json()) as GuidanceExtraction);
    } catch {
      setGuidance({ ...GUIDANCE, source: "seeded" });
    }
    setGuidanceApplied(); // knowledge rules now participate in screening
    setApplying(false);
    setStage("applied");
  }

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

  // External trial view: real data from ClinicalTrials.gov, criteria shown
  // unparsed — structured screening is configured for the primary demo trial.
  if (!seeded) {
    return (
      <div>
        <Link
          href="/trials"
          className="text-sm font-medium text-inksoft transition hover:text-ink"
        >
          ← Back to Trials
        </Link>
        {liveState === "loading" && (
          <p className="mt-6 animate-pulse text-sm text-inkmid">
            Loading {params.trialId} from ClinicalTrials.gov…
          </p>
        )}
        {liveState === "error" && (
          <p className="mt-6 text-sm text-inksoft">
            Could not load {params.trialId} from ClinicalTrials.gov — check the
            NCT ID or try again.
          </p>
        )}
        {liveState === "ready" && liveDetail && trial && (
          <>
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-ink">
                  {trial.title}
                </h1>
                <span className="rounded-full bg-creamdeep px-2.5 py-0.5 text-[11px] font-semibold text-inkmid">
                  Live · ClinicalTrials.gov
                </span>
              </div>
              <p className="mt-1.5 text-sm text-inkmid">
                {trial.id} · {trial.status} · {trial.conditions.join(", ")} ·{" "}
                {trial.phase} · {trial.location} · Sponsor: {trial.sponsor}
              </p>
            </div>

            {liveDetail.summary && (
              <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h2 className="text-[15px] font-bold text-ink">Study Summary</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-inkmid">
                  {liveDetail.summary}
                </p>
              </div>
            )}

            <div className="mt-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-[15px] font-bold text-ink">
                Eligibility Criteria
              </h2>
              <p className="mt-0.5 text-xs text-inksoft">
                As published on ClinicalTrials.gov — not yet parsed into
                structured screening rules
              </p>
              <pre className="mt-4 max-h-[28rem] overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-inkmid">
                {liveDetail.eligibility}
              </pre>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <p className="text-xs text-inksoft">
                Structured screening, the clinician knowledge layer, and the
                patient cohort are configured for the primary demo trial
                (NCT07589608). Beacon&apos;s workflow extends to any trial here
                by parsing these criteria the same way.
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

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
          {seeded.title}
        </h1>
        <p className="mt-1.5 text-sm text-inkmid">
          {seeded.id} · {seeded.status} · {seeded.conditions.join(", ")} ·{" "}
          {seeded.phase} · {seeded.location}
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
          {applying && (
            <p className="mt-6 animate-pulse text-sm text-inkmid">
              Claude is converting the clinician&apos;s guidance into
              structured screening rules…
            </p>
          )}
          {stage === "applied" && guidance && (
            <div className="mt-6">
              <GuidancePanel guidance={guidance} />
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
            onClick={() => void applyGuidance()}
            disabled={stage !== "ready" || applying}
            className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-inkmid disabled:opacity-40"
          >
            {applying
              ? "Extracting…"
              : stage === "applied"
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
