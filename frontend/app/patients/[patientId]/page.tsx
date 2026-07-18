"use client";

// PAGE 4 — Patient Eligibility Review (v1.1 layout): summary at TOP,
// work-up checklist high, then the two-column criterion/evidence table.

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { detailFor, PATIENTS } from "@/lib/data";
import { setOverride } from "@/lib/demo";
import { initialsOf } from "@/lib/status";
import CriterionResultCard from "@/components/CriterionResultCard";
import WorkupChecklist from "@/components/WorkupChecklist";

export default function PatientReviewPage() {
  const params = useParams<{ patientId: string }>();
  const router = useRouter();
  const patient = PATIENTS.find((p) => p.id === params.patientId);
  const [banner, setBanner] = useState<string | null>(null);

  if (!patient) {
    return (
      <p className="text-sm text-inkmid">
        Patient not found.{" "}
        <Link href="/patients" className="underline">
          Back to queue
        </Link>
      </p>
    );
  }
  const detail = detailFor(patient);

  const act = (label: string) => setBanner(`${label} — recorded (demo state)`);

  return (
    <div>
      <Link
        href="/patients"
        className="text-sm font-medium text-inksoft transition hover:text-ink"
      >
        ← Patient Queue
      </Link>

      {/* Summary — v1.1: at the top */}
      <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage text-[15px] font-bold text-sagedeep">
            {initialsOf(detail.name)}
          </span>
          <div>
            <h1 className="text-xl font-bold text-ink">{detail.name}</h1>
            <p className="mt-0.5 text-sm text-inkmid">{detail.headline}</p>
          </div>
        </div>
        <p className="mt-4 rounded-2xl bg-cream p-4 text-sm leading-relaxed text-inkmid">
          <span className="font-semibold text-ink">Summary:</span>{" "}
          {detail.summary}
        </p>
      </div>

      {/* Work-up — v1.1: moved up */}
      <div className="mt-4">
        <WorkupChecklist items={detail.workup} />
      </div>

      {/* Two-column eligibility table — v1.1 */}
      {detail.results.length > 0 && (
        <div className="mt-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="grid grid-cols-1 gap-8 border-b border-cream pb-3 md:grid-cols-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-inksoft">
              Criterion + Status
            </p>
            <p className="hidden text-[11px] font-bold uppercase tracking-widest text-inksoft md:block md:pl-8">
              Evidence (citations)
            </p>
          </div>
          {detail.results.map((r) => (
            <CriterionResultCard key={r.id} result={r} />
          ))}
        </div>
      )}

      {banner && (
        <p className="mt-4 rounded-2xl bg-sage px-5 py-3 text-sm font-medium text-sagedeep">
          {banner}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => act("Marked Enrollment Ready")}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-inkmid"
        >
          Mark Enrollment Ready
        </button>
        <button
          onClick={() => act("Marked Excluded")}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep"
        >
          Exclude
        </button>
        <button
          onClick={() => act("Kept Under Review")}
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-inkmid shadow-sm ring-1 ring-black/5 transition hover:bg-creamdeep"
        >
          Keep Under Review
        </button>
        <button
          onClick={() => {
            setOverride(patient.id, {
              status: "actively_enrolled",
              reason: "Week 1",
            });
            router.push("/patients");
          }}
          className="rounded-full bg-lav px-5 py-2.5 text-sm font-semibold text-lavdeep transition hover:bg-lav/70"
        >
          Mark Actively Enrolled (demo)
        </button>
      </div>
    </div>
  );
}
