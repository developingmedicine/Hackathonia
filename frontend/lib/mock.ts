// Seeded demo data (PRD §38): trials, parsed criteria, patient queue,
// eligibility details, and follow-up scenarios. Will be replaced by
// backend API calls (lib/api.ts) once the FastAPI service is up.

import type {
  CriterionResult,
  ExtractedGuidance,
  FollowUpScenario,
  ParsedCriterion,
  PatientDetail,
  QueuePatient,
  Trial,
} from "@/types";

export const TRIALS: Trial[] = [
  {
    id: "NCT06000001",
    title: "GLP-1 Agonist for Obesity with Comorbid Plaque Psoriasis",
    sponsor: "Eli Lilly and Company",
    status: "Recruiting",
    phase: "Phase 2",
    location: "San Francisco Bay Area",
    enrollment: "Est. 240 participants",
    conditions: ["Obesity", "Plaque Psoriasis"],
    primary: true,
  },
  {
    id: "NCT06000002",
    title: "Master Protocol: Incretin Combinations for Weight Management",
    sponsor: "Eli Lilly and Company",
    status: "Recruiting",
    phase: "Phase 2/3",
    location: "Multi-site, US",
    enrollment: "Est. 1,100 participants",
    conditions: ["Obesity", "Type 2 Diabetes"],
  },
  {
    id: "NCT06000003",
    title: "Long-term Cardiovascular Outcomes with GLP-1 Therapy",
    sponsor: "Eli Lilly and Company",
    status: "Recruiting",
    phase: "Phase 3",
    location: "Multi-site, US",
    enrollment: "Est. 3,000 participants",
    conditions: ["Obesity", "Cardiovascular Disease"],
  },
];

export const PRIMARY_TRIAL = TRIALS[0];

export const CRITERIA: ParsedCriterion[] = [
  { id: "inc-1", type: "inclusion", mode: "Rule", text: "Age 18–75" },
  { id: "inc-2", type: "inclusion", mode: "Rule", text: "BMI ≥ 30 kg/m²" },
  {
    id: "inc-3",
    type: "inclusion",
    mode: "Judgement",
    text: "Moderate-to-severe plaque psoriasis",
  },
  {
    id: "exc-1",
    type: "exclusion",
    mode: "Rule",
    text: "History of pancreatitis",
  },
  {
    id: "exc-2",
    type: "exclusion",
    mode: "Rule",
    text: "Prohibited concomitant medication",
  },
  {
    id: "exc-3",
    type: "exclusion",
    mode: "Judgement",
    text: "Investigator concern for adherence or safety",
  },
];

export const CLINICIAN_TRANSCRIPT =
  "For the pancreatitis exclusion, I also want the system to flag patients " +
  "with significant alcohol use or gallbladder disease. These patients should " +
  "not be automatically excluded, but they may have elevated risk, so lower " +
  "their screening priority and require physician review.";

export const GUIDANCE: ExtractedGuidance = {
  annotates: "History of pancreatitis (exclusion)",
  bullets: [
    "Flag significant alcohol-use history as elevated pancreatitis risk",
    "Flag gallbladder disease as elevated pancreatitis risk",
    "Do NOT auto-exclude — require physician review",
    "Lower screening priority for flagged patients (−10)",
  ],
};

export const PATIENTS: QueuePatient[] = [
  {
    id: "pt-001",
    name: "Nathan Chen",
    age: 48,
    time: "9:00",
    condition: "Plaque psoriasis",
    status: "potential_match",
    score: 92,
    topReason: "1 open item",
    tooltip: {
      headline: "🟢 Potential Match — Nathan Chen",
      lines: [
        "Meets BMI + disease criteria (dermatology note, 12% BSA)",
        "Open: smoking history missing (ask at visit)",
        "Flag: moderate alcohol use → pancreatitis risk review",
      ],
      source: "Obs 2026-07-10 · Derm note 2026-06-22",
    },
  },
  {
    id: "pt-002",
    name: "Sarah Williams",
    age: 56,
    time: "9:30",
    condition: "Obesity",
    status: "needs_review",
    score: 78,
    topReason: "Grey zone",
    tooltip: {
      headline: "🟡 Needs Review — Sarah Williams",
      lines: [
        "Open: smoking history missing (no record found)",
        "Flag: moderate alcohol use → pancreatitis risk",
        "Guidance source: trial clinician voice input",
      ],
      source: "PCP note · 2026-06-30",
    },
  },
  {
    id: "pt-003",
    name: "Michael Lee",
    age: 43,
    time: "10:00",
    condition: "Obesity",
    status: "confirmed_exclusion",
    score: 24,
    topReason: "Prior event",
    tooltip: {
      headline: "🔴 Excluded — Michael Lee",
      lines: [
        "Exclusion met: hospitalized for acute pancreatitis",
        "Discharge summary, 2024-03-02",
        "Believe this is wrong? Open the row to correct with evidence.",
      ],
      source: "Hospital discharge summary · 2024-03-02",
    },
  },
  {
    id: "pt-004",
    name: "Maya Patel",
    age: 52,
    time: "10:30",
    condition: "Obesity",
    status: "actively_enrolled",
    score: null,
    topReason: "Week 6",
    studyWeek: 6,
    tooltip: {
      headline: "🟣 Actively Enrolled — Maya Patel",
      lines: [
        "Study week 6 · next visit today",
        "Current alerts: mild nausea reported at week 4",
        "Click to open the follow-up visit view.",
      ],
      source: "Trial record · enrolled 2026-06-06",
    },
  },
  {
    id: "pt-005",
    name: "Elena Rodriguez",
    age: 61,
    time: "11:00",
    condition: "Obesity",
    status: "missing_actionable_data",
    score: 71,
    topReason: "Expired lab",
    tooltip: {
      headline: "🟡 Missing Data — Elena Rodriguez",
      lines: [
        "Liver panel expired (last drawn 14 months ago)",
        "Next action: reorder LFTs — a $10 test away from eligible",
      ],
      source: "Lab archive · 2025-05-02",
    },
  },
  {
    id: "pt-006",
    name: "David Kim",
    age: 38,
    time: "11:30",
    condition: "Plaque psoriasis",
    status: "potential_match",
    score: 88,
    topReason: "Borderline BMI",
    tooltip: {
      headline: "🟢 Potential Match — David Kim",
      lines: [
        "BMI 30.1 — meets threshold but borderline; confirm at visit",
        "Disease severity documented by dermatology",
      ],
      source: "Obs 2026-07-01 · Derm note 2026-05-18",
    },
  },
  {
    id: "pt-007",
    name: "Grace Thompson",
    age: 66,
    time: "1:00",
    condition: "Obesity",
    status: "needs_review",
    score: 64,
    topReason: "Gallbladder hx",
    tooltip: {
      headline: "🟡 Needs Review — Grace Thompson",
      lines: [
        "Flag: cholelithiasis history → pancreatitis risk",
        "Not auto-excluded per clinician guidance — physician review",
      ],
      source: "Problem list · 2023-11-12",
    },
  },
  {
    id: "pt-008",
    name: "Robert Okafor",
    age: 55,
    time: "1:30",
    condition: "Obesity",
    status: "confirmed_exclusion",
    score: 18,
    topReason: "Prohibited med",
    tooltip: {
      headline: "🔴 Excluded — Robert Okafor",
      lines: [
        "Exclusion met: active prohibited medication (insulin glargine)",
        "Medication list, verified 2026-07-02",
      ],
      source: "Medication list · 2026-07-02",
    },
  },
  {
    id: "pt-009",
    name: "Amy Nguyen",
    age: 44,
    time: "2:00",
    condition: "Obesity",
    status: "enrollment_ready",
    score: 95,
    topReason: "All resolved",
    tooltip: {
      headline: "🟢 Enrollment Ready — Amy Nguyen",
      lines: [
        "All required criteria resolved with evidence",
        "No open work-up items — ready for consent discussion",
      ],
      source: "Screening completed 2026-07-16",
    },
  },
];

const NATHAN_DETAIL: PatientDetail = {
  id: "pt-001",
  name: "Nathan Chen",
  headline: "Potential Match · 92% · Age 48 · BMI 33.4 · Plaque psoriasis",
  summary:
    "Meets core demographic and disease criteria; smoking history is missing; " +
    "alcohol use may raise pancreatitis risk — clinician review recommended " +
    "before enrollment.",
  workup: [
    "Confirm smoking history",
    "Review alcohol-use history",
    "Repeat liver panel if required by screening window",
  ],
  results: [
    {
      id: "r1",
      criterion: "BMI ≥ 30",
      type: "inclusion",
      status: "met",
      evidence: [
        { text: "BMI 33.4 kg/m²", source: "Observation", date: "2026-07-10" },
      ],
    },
    {
      id: "r2",
      criterion: "Moderate-to-severe plaque psoriasis",
      type: "inclusion",
      status: "likely_met",
      evidence: [
        {
          text: "“…approximately 12% body surface area involvement.”",
          source: "Dermatology note",
          date: "2026-06-22",
        },
      ],
    },
    {
      id: "r3",
      criterion: "Smoking history",
      type: "inclusion",
      status: "missing_data",
      note: "Next: ask patient about current and historical tobacco use",
      evidence: [],
    },
    {
      id: "r4",
      criterion: "Potential pancreatitis risk",
      type: "exclusion",
      status: "needs_review",
      note: "From trial clinician voice input — do not auto-exclude",
      evidence: [
        {
          text: "“Moderate alcohol use documented”",
          source: "Social history",
          date: "2026-06-30",
        },
      ],
    },
  ],
};

const SARAH_DETAIL: PatientDetail = {
  id: "pt-002",
  name: "Sarah Williams",
  headline: "Needs Clinician Review · 78% · Age 56 · BMI 36.2 · Obesity",
  summary:
    "Grey-zone case: core criteria met, but moderate alcohol use triggers the " +
    "clinician-authored pancreatitis-risk flag and smoking history is missing. " +
    "Escalated for physician review rather than auto-resolved.",
  workup: [
    "Physician review of alcohol-use history",
    "Confirm smoking history",
  ],
  results: [
    {
      id: "r1",
      criterion: "BMI ≥ 30",
      type: "inclusion",
      status: "met",
      evidence: [
        { text: "BMI 36.2 kg/m²", source: "Observation", date: "2026-07-08" },
      ],
    },
    {
      id: "r2",
      criterion: "Smoking history",
      type: "inclusion",
      status: "missing_data",
      note: "Next: ask patient about tobacco use",
      evidence: [],
    },
    {
      id: "r3",
      criterion: "Potential pancreatitis risk",
      type: "exclusion",
      status: "needs_review",
      note: "From trial clinician voice input",
      evidence: [
        {
          text: "“Reports 12 drinks per week”",
          source: "PCP note",
          date: "2026-06-30",
        },
      ],
    },
  ],
};

const MICHAEL_DETAIL: PatientDetail = {
  id: "pt-003",
  name: "Michael Lee",
  headline: "Confirmed Exclusion · 24% · Age 43 · BMI 34.8 · Obesity",
  summary:
    "Confirmed exclusion: documented episode of acute pancreatitis. Chain of " +
    "evidence shown below — if this is wrong, correct it with evidence and " +
    "the patient will be re-screened.",
  workup: [],
  results: [
    {
      id: "r1",
      criterion: "BMI ≥ 30",
      type: "inclusion",
      status: "met",
      evidence: [
        { text: "BMI 34.8 kg/m²", source: "Observation", date: "2026-07-05" },
      ],
    },
    {
      id: "r2",
      criterion: "History of pancreatitis (exclusion)",
      type: "exclusion",
      status: "not_met",
      note: "Exclusion criterion met — patient excluded",
      evidence: [
        {
          text: "“Admitted for acute pancreatitis, managed conservatively.”",
          source: "Hospital discharge summary",
          date: "2024-03-02",
        },
      ],
    },
  ],
};

export const DETAILS: Record<string, PatientDetail> = {
  "pt-001": NATHAN_DETAIL,
  "pt-002": SARAH_DETAIL,
  "pt-003": MICHAEL_DETAIL,
};

export function detailFor(p: QueuePatient): PatientDetail {
  return (
    DETAILS[p.id] ?? {
      id: p.id,
      name: p.name,
      headline: `${p.topReason} · Age ${p.age} · ${p.condition}`,
      summary:
        "Full criterion-level screening detail is seeded for the primary demo " +
        "patients (Nathan Chen, Sarah Williams, Michael Lee). This patient is " +
        "part of the cohort background.",
      workup: [],
      results: [],
    }
  );
}

export const FOLLOWUPS: Record<string, FollowUpScenario> = {
  "pt-001": {
    patientId: "pt-001",
    patientName: "Nathan Chen",
    week: 3,
    hasAudio: true,
    transcript:
      "I started the study medication three weeks ago. I have felt nauseous " +
      "most mornings and vomited twice this week. I can still drink water and " +
      "eat small meals, but it is making it harder to get through the workday.",
    events: [
      { event: "Nausea", detail: "Most mornings", confidence: 96 },
      { event: "Vomiting", detail: "Twice this week", confidence: 94 },
    ],
    footnotes: [
      "Possible relationship: after study medication initiation",
      "Hydration concern: not currently reported (tolerating fluids)",
      "Escalation: clinician review recommended",
    ],
  },
  "pt-004": {
    patientId: "pt-004",
    patientName: "Maya Patel",
    week: 6,
    hasAudio: false,
    transcript:
      "I was in the hospital last week — they told me I have pancreatitis and " +
      "started me on a new medication.",
    events: [
      {
        event: "Pancreatitis (hospitalization)",
        detail: "Last week",
        confidence: 97,
      },
      {
        event: "New medication initiated",
        detail: "During admission",
        confidence: 91,
      },
    ],
    footnotes: ["Escalation: immediate clinician review required"],
    disqualification: {
      criterion: "History of pancreatitis",
      evidence: "“they told me I have pancreatitis”",
      source: "Follow-up transcript · 2026-08-08",
    },
  },
};
