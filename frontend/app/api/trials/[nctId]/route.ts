// GET /api/trials/<nctId> — single-study detail from the ClinicalTrials.gov
// API v2: mapped Trial summary + unparsed eligibility-criteria text + brief
// summary, for external trials the seeded demo doesn't cover.

import { NextResponse } from "next/server";
import { CTGOV_BASE, mapStudy, type CtgovStudy } from "@/lib/ctgov";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ nctId: string }> },
) {
  const { nctId } = await params;
  if (!/^NCT\d{8}$/i.test(nctId)) {
    return NextResponse.json({ error: "Invalid NCT ID" }, { status: 400 });
  }
  try {
    const res = await fetch(`${CTGOV_BASE}/${nctId.toUpperCase()}`, {
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`ClinicalTrials.gov HTTP ${res.status}`);
    const study = (await res.json()) as CtgovStudy;
    const trial = mapStudy(study);
    if (!trial) throw new Error("Study missing identification data");
    return NextResponse.json({
      trial,
      summary: study.protocolSection?.descriptionModule?.briefSummary ?? "",
      eligibility:
        study.protocolSection?.eligibilityModule?.eligibilityCriteria ??
        "No eligibility criteria published for this study.",
    });
  } catch (err) {
    console.error(`ClinicalTrials.gov detail failed for ${nctId}:`, err);
    return NextResponse.json(
      { error: "Could not load this trial from ClinicalTrials.gov" },
      { status: 502 },
    );
  }
}
