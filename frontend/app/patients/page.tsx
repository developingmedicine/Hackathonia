"use client";

// PAGE 3 — Patient Screening Queue (v1.1): greeting headline, airy list,
// tooltips with provenance, enrolled patients inline in lavender.

import { useEffect, useState } from "react";
import { PATIENTS, PRIMARY_TRIAL, queuePatients } from "@/lib/data";
import { getOverrides, isGuidanceApplied } from "@/lib/demo";
import CohortQueryBar from "@/components/CohortQueryBar";
import PatientQueueTable from "@/components/PatientQueueTable";
import type { QueuePatient } from "@/types";

export default function PatientQueuePage() {
  const [patients, setPatients] = useState<QueuePatient[]>(PATIENTS);

  useEffect(() => {
    const ov = getOverrides();
    setPatients(
      queuePatients(isGuidanceApplied()).map((p) =>
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
    <div className="pt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Today&apos;s patients.
          </h1>
          <p className="mt-2 text-sm text-inkmid">
            {PRIMARY_TRIAL.title} · {PRIMARY_TRIAL.id}
          </p>
        </div>
        <span className="rounded-full bg-creamdeep px-4 py-2 text-xs font-semibold text-inkmid">
          {screened} screened · {matches} matches · {review} for review
        </span>
      </div>
      <div className="mt-6">
        <CohortQueryBar />
      </div>
      <div className="mt-6">
        <PatientQueueTable patients={patients} />
      </div>
    </div>
  );
}
