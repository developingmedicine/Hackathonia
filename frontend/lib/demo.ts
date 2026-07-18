// Demo reliability helpers (PRD §38): local status overrides that survive
// navigation (e.g. Maya auto-disqualification updating the queue) + reset.

import type { EnrollmentStatus } from "@/types";

const KEY = "beacon-demo-overrides";
const GUIDANCE_KEY = "beacon-demo-guidance";

export interface Override {
  status: EnrollmentStatus;
  reason?: string;
}

export function getOverrides(): Record<string, Override> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function setOverride(patientId: string, override: Override) {
  const all = getOverrides();
  all[patientId] = override;
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

// Whether the clinician's guidance has been applied on Page 2 — the
// knowledge rules (kn_001 flag + score delta) only affect screening after
// "Apply to Screening Logic" is clicked (Jae's demo narrative).
export function isGuidanceApplied(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(GUIDANCE_KEY) === "1";
}

export function setGuidanceApplied() {
  window.localStorage.setItem(GUIDANCE_KEY, "1");
}

export function resetDemo() {
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(GUIDANCE_KEY);
}
