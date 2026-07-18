// Single source of truth for status vocabulary + UI color mapping (PRD §16).

import type { CriterionStatus, EnrollmentStatus } from "@/types";

export const ENROLLMENT_META: Record<
  EnrollmentStatus,
  { label: string; badge: string; dot: string }
> = {
  not_screened: {
    label: "Not Screened",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  potential_match: {
    label: "Match",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  missing_actionable_data: {
    label: "Missing Data",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  needs_review: {
    label: "Review",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  confirmed_exclusion: {
    label: "Excluded",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  enrollment_ready: {
    label: "Ready",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  actively_enrolled: {
    label: "Enrolled",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
  },
  withdrawn: {
    label: "Withdrawn",
    badge: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
  },
};

export const CRITERION_META: Record<
  CriterionStatus,
  { label: string; icon: string; cls: string }
> = {
  met: { label: "MET", icon: "✓", cls: "text-emerald-700" },
  likely_met: { label: "LIKELY MET", icon: "✓", cls: "text-emerald-600" },
  not_met: { label: "NOT MET", icon: "✕", cls: "text-rose-700" },
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
  not_applicable: { label: "N/A", icon: "–", cls: "text-slate-400" },
};
