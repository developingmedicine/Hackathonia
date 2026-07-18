// GET /api/trials?q=<condition> — live recruiting-trial search proxied from
// the ClinicalTrials.gov API v2 (public, no key). Any failure returns
// { trials: [], source: "error" } and the explorer degrades to the seeded
// demo list (PRD §38).

import { NextResponse } from "next/server";
import type { Trial } from "@/types";
import { CTGOV_BASE, SEARCH_FIELDS, mapStudy, type CtgovStudy } from "@/lib/ctgov";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ trials: [], source: "live" });
  try {
    const url =
      `${CTGOV_BASE}?query.cond=${encodeURIComponent(q)}` +
      "&filter.overallStatus=RECRUITING" +
      `&pageSize=6&fields=${SEARCH_FIELDS}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`ClinicalTrials.gov HTTP ${res.status}`);
    const data = (await res.json()) as { studies?: CtgovStudy[] };
    const trials = (data.studies ?? [])
      .map(mapStudy)
      .filter((t): t is Trial => t !== null);
    return NextResponse.json({ trials, source: "live" });
  } catch (err) {
    console.error("ClinicalTrials.gov search failed:", err);
    return NextResponse.json({ trials: [], source: "error" });
  }
}
