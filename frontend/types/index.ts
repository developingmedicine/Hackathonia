// Data types mirroring PRD §16 / §28. Merge rule §34: keep in sync with
// backend models, validate script, and sample JSON.

export type EnrollmentStatus =
  | "not_screened"
  | "potential_match"
  | "missing_actionable_data"
  | "needs_review"
  | "confirmed_exclusion"
  | "enrollment_ready"
  | "actively_enrolled"
  | "withdrawn";

export type CriterionStatus =
  | "met"
  | "likely_met"
  | "not_met"
  | "missing_data"
  | "needs_review"
  | "not_applicable";

export interface EvidenceItem {
  text: string;
  source: string;
  date: string | null;
}

export interface CriterionResult {
  id: string;
  criterion: string;
  type: "inclusion" | "exclusion";
  status: CriterionStatus;
  note?: string;
  evidence: EvidenceItem[];
}

export interface TooltipContent {
  headline: string;
  lines: string[];
  source?: string;
}

export interface QueuePatient {
  id: string;
  name: string;
  age: number;
  time: string;
  condition: string;
  status: EnrollmentStatus;
  score: number | null;
  topReason: string;
  studyWeek?: number;
  tooltip: TooltipContent;
}

export interface Trial {
  id: string;
  title: string;
  sponsor: string;
  status: string;
  phase: string;
  location: string;
  enrollment: string;
  conditions: string[];
  primary?: boolean;
}

export interface ParsedCriterion {
  id: string;
  type: "inclusion" | "exclusion";
  mode: "Rule" | "Judgement";
  text: string;
}

export interface ExtractedGuidance {
  annotates: string;
  bullets: string[];
}

export interface PatientDetail {
  id: string;
  name: string;
  headline: string;
  summary: string;
  workup: string[];
  results: CriterionResult[];
}

export interface FollowUpEvent {
  event: string;
  detail: string;
  confidence: number;
}

export interface FollowUpScenario {
  patientId: string;
  patientName: string;
  week: number;
  hasAudio: boolean;
  audioSrc?: string;
  transcript: string;
  events: FollowUpEvent[];
  footnotes: string[];
  escalation?: string;
  disqualification?: {
    criterion: string;
    evidence: string;
    source: string;
  };
}
