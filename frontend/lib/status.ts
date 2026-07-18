// Single source of truth for status vocabulary + UI color mapping (PRD §16).
// Borderless tinted pills, Abridge-style.

import type { CriterionStatus, EnrollmentStatus } from "@/types";

export const ENROLLMENT_META: Record<
  EnrollmentStatus,
  { label: string; badge: string; dot: string }
> = {
  not_screened: {
    label: "Not Screened",
    badge: "bg-creamdeep text-inkmid",
    dot: "bg-inksoft",
  },
  potential_match: {
    label: "Match",
    badge: "bg-emerald-100 text-emerald-900",
    dot: "bg-emerald-600",
  },
  missing_actionable_data: {
    label: "Missing Data",
    badge: "bg-amber-100 text-amber-900",
    dot: "bg-amber-500",
  },
  needs_review: {
    label: "Review",
    badge: "bg-amber-100 text-amber-900",
    dot: "bg-amber-500",
  },
  confirmed_exclusion: {
    label: "Excluded",
    badge: "bg-red-100 text-red-900",
    dot: "bg-brand",
  },
  enrollment_ready: {
    label: "Ready",
    badge: "bg-emerald-100 text-emerald-900",
    dot: "bg-emerald-600",
  },
  actively_enrolled: {
    label: "Enrolled",
    badge: "bg-lav text-lavdeep",
    dot: "bg-lavdeep",
  },
  withdrawn: {
    label: "Withdrawn",
    badge: "bg-creamdeep text-inksoft",
    dot: "bg-inksoft",
  },
};

export const CRITERION_META: Record<
  CriterionStatus,
  { label: string; icon: string; cls: string }
> = {
  met: { label: "MET", icon: "✓", cls: "text-emerald-700" },
  likely_met: { label: "LIKELY MET", icon: "✓", cls: "text-emerald-600" },
  not_met: { label: "NOT MET", icon: "✕", cls: "text-brand" },
  missing_data: {
    label: "MISSING ACTIONABLE DATA",
    icon: "?",
    cls: "text-amber-600",
  },
  needs_review: {
    label: "NEEDS CLINICIAN REVIEW",
    icon: "⚠",
    cls: "text-amber-700",
  },
  not_applicable: { label: "N/A", icon: "–", cls: "text-inksoft" },
};

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
