// Demo reliability helpers (PRD §38): local status overrides that survive
// navigation (e.g. Maya auto-disqualification updating the queue) + reset.

import type { EnrollmentStatus } from "@/types";

const KEY = "beacon-demo-overrides";

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

export function resetDemo() {
  window.localStorage.removeItem(KEY);
}
