"use client";

// PAGE 3 — Patient Screening Queue (v1.1): tooltips with provenance, purple
// enrolled rows inline, filterable. Demo overrides (e.g. Maya disqualified)
// are merged from local demo state.

import { useEffect, useState } from "react";
import { PATIENTS, PRIMARY_TRIAL } from "@/lib/mock";
import { getOverrides } from "@/lib/demo";
import PatientQueueTable from "@/components/PatientQueueTable";
import type { QueuePatient } from "@/types";

export default function PatientQueuePage() {
  const [patients, setPatients] = useState<QueuePatient[]>(PATIENTS);

  useEffect(() => {
    const ov = getOverrides();
    if (Object.keys(ov).length === 0) return;
    setPatients(
      PATIENTS.map((p) =>
        ov[p.id]
          ? {
              ...p,
              status: ov[p.id].status,
              topReason: ov[p.id].reason ?? p.topReason,
            }
          : p,
      ),
    );
  }, []);

  const screened = patients.filter((p) => p.status !== "not_screened").length;
  const matches = patients.filter(
    (p) => p.status === "potential_match" || p.status === "enrollment_ready",
  ).length;
  const review = patients.filter((p) => p.status === "needs_review").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Today&apos;s Patient Queue
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Trial: {PRIMARY_TRIAL.title} · {PRIMARY_TRIAL.id}
          </p>
        </div>
        <p className="text-xs text-slate-400">
          {screened} screened · {matches} matches · {review} for review
        </p>
      </div>
      <div className="mt-5">
        <PatientQueueTable patients={patients} />
      </div>
    </div>
  );
}
