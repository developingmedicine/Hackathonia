"use client";

// PAGE 4 — Patient Eligibility Review (v1.1 layout): summary at TOP,
// work-up checklist high, then the two-column criterion/evidence table.

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { detailFor, PATIENTS } from "@/lib/mock";
import { setOverride } from "@/lib/demo";
import CriterionResultCard from "@/components/CriterionResultCard";
import WorkupChecklist from "@/components/WorkupChecklist";

export default function PatientReviewPage() {
  const params = useParams<{ patientId: string }>();
  const router = useRouter();
  const patient = PATIENTS.find((p) => p.id === params.patientId);
  const [banner, setBanner] = useState<string | null>(null);

  if (!patient) {
    return (
      <p className="text-sm text-slate-500">
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
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Patient Queue
      </Link>

      {/* Summary — v1.1: at the top */}
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5">
        <h1 className="text-lg font-semibold text-slate-900">{detail.name}</h1>
        <p className="mt-0.5 text-sm text-slate-500">{detail.headline}</p>
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
          <span className="font-medium">Summary:</span> {detail.summary}
        </p>
      </div>

      {/* Work-up — v1.1: moved up */}
      <div className="mt-4">
        <WorkupChecklist items={detail.workup} />
      </div>

      {/* Two-column eligibility table — v1.1 */}
      {detail.results.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-6 border-b border-slate-200 pb-2 md:grid-cols-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Criterion + Status
            </p>
            <p className="hidden text-xs font-semibold uppercase tracking-wide text-slate-400 md:block md:pl-6">
              Evidence (citations)
            </p>
          </div>
          {detail.results.map((r) => (
            <CriterionResultCard key={r.id} result={r} />
          ))}
        </div>
      )}

      {banner && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          {banner}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => act("Marked Enrollment Ready")}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Mark Enrollment Ready
        </button>
        <button
          onClick={() => act("Marked Excluded")}
          className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          Exclude
        </button>
        <button
          onClick={() => act("Kept Under Review")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
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
          className="rounded-lg border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50"
        >
          Mark Actively Enrolled (demo)
        </button>
      </div>
    </div>
  );
}
