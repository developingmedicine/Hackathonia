// Live data adapter: loads Jae's delivered files (data/patients.json,
// data/criteria.json, data/clinician_knowledge.json — PRD §18/§20/§21
// contracts) and maps them into the
// frontend types. Criterion-level results come from a small deterministic
// screener over the real patient records (evidence quoted verbatim);
// overall queue status is seeded from Jae's clinician ground truth
// (scenario_metadata) for demo stability per PRD §38. Note-interpretation
// criteria surface as NEEDS REVIEW until the Claude-backed backend lands.

import rawPatientsJson from "../../data/patients.json";
import rawCriteriaJson from "../../data/criteria.json";
import rawKnowledgeJson from "../../data/clinician_knowledge.json";
import type {
  CriterionResult,
  EnrollmentStatus,
  EvidenceItem,
  ExtractedGuidance,
  FollowUpScenario,
  ParsedCriterion,
  PatientDetail,
  QueuePatient,
  Trial,
} from "@/types";

interface RawObs {
  type: string;
  value: number | string;
  unit?: string | null;
  collected_at: string;
}
interface RawCond {
  code: string;
  name: string;
  diagnosed_date?: string;
}
interface RawMed {
  name: string;
  dose?: string;
}
interface RawNote {
  note_type: string;
  author_role?: string;
  date: string;
  text: string;
}
interface RawPatient {
  patient_id: string;
  name: { display: string };
  demographics: { age: number };
  visit: { appointment_time: string };
  conditions: RawCond[];
  medications: RawMed[];
  observations: RawObs[];
  social_history: {
    smoking_status?: string;
    alcohol_use?: { drinks_per_week?: number | null };
  };
  clinical_notes: RawNote[];
  trial_status: { status: string; study_week?: number | null };
  scenario_metadata: {
    archetype: string;
    expected_outcome: string;
    ground_truth_notes: string[];
  };
}
interface RawCriterion {
  criterion_id: string;
  criterion_type: "inclusion" | "exclusion";
  normalized_text: string;
  evaluation_mode: string;
}
interface RawCriteriaFile {
  trial_id: string;
  trial_title: string;
  base_criteria: RawCriterion[];
}
interface RawTriggerCondition {
  field: string;
  operator: string;
  match?: string; // "prefix" → ICD-10 category prefix matching
  value: number | string | string[];
}
interface RawKnowledge {
  knowledge_id: string;
  source_transcript: string;
  trigger?: { any: RawTriggerCondition[] };
  effect: {
    action?: string;
    label: string;
    explanation: string;
    priority_adjustment: number;
  };
  requires_human_confirmation?: boolean;
}

const rawPatients = rawPatientsJson as unknown as RawPatient[];
const rawCriteria = rawCriteriaJson as unknown as RawCriteriaFile;
const KNOWLEDGE = rawKnowledgeJson as unknown as RawKnowledge[];
const km = KNOWLEDGE[0];

// ---------------------------------------------------------------- trial(s)

export const PRIMARY_TRIAL: Trial = {
  id: rawCriteria.trial_id,
  title: rawCriteria.trial_title,
  sponsor: "Eli Lilly and Company",
  status: "Recruiting",
  phase: "Phase 2",
  location: "Multi-site, US",
  enrollment: "Master protocol + sub-studies",
  conditions: ["Obesity", "Overweight"],
  primary: true,
};

export const TRIALS: Trial[] = [
  PRIMARY_TRIAL,
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

// ------------------------------------------------------- criteria / voice

export const CRITERIA: ParsedCriterion[] = rawCriteria.base_criteria.map(
  (c) => ({
    id: c.criterion_id,
    type: c.criterion_type,
    mode: c.evaluation_mode === "deterministic" ? "Rule" : "Judgement",
    text: c.normalized_text,
  }),
);

// Verbatim transcript of Jae's real Page 2 recording
// (data/transcripts/clinician_intake.txt · public/audio/clinician-context.m4a).
// km.source_transcript in clinician_knowledge.json is the polished record of
// the same guidance; the UI types out what the audio actually says.
export const CLINICIAN_TRANSCRIPT =
  "Flag 2 categories for review. So heavy drinkers with more than 5 drinks " +
  "weekly or alcohol use disorder codes. And biliary disease such as " +
  "cholecystitis, choledocholithiasis, or cholangitis. No auto exclusion, " +
  "but I want them to have review required";

export const GUIDANCE: ExtractedGuidance = {
  annotates: "No history of acute or chronic pancreatitis (exc_006)",
  bullets: [
    "Flag ≥5 drinks/week or alcohol-use disorder codes (F10.x)",
    "Flag active biliary disease: cholecystitis, choledocholithiasis, cholangitis",
    km.effect.explanation,
    `Do not auto-exclude — flag for review · priority ${km.effect.priority_adjustment}`,
  ],
};

// ------------------------------------------------- deterministic screener

function condEv(c: RawCond): EvidenceItem {
  return {
    text: `${c.name} (${c.code})`,
    source: "Problem list",
    date: c.diagnosed_date ?? null,
  };
}
function obsEv(o: RawObs): EvidenceItem {
  return {
    text: `${o.type} ${o.value}${o.unit ? ` ${o.unit}` : ""}`,
    source: "Observation",
    date: o.collected_at,
  };
}
function noteEv(n: RawNote): EvidenceItem {
  const t = n.text.length > 110 ? `${n.text.slice(0, 110)}…` : n.text;
  return {
    text: `“${t}”`,
    source: `${n.author_role ?? "clinician"} note`,
    date: n.date,
  };
}

// Evaluates one knowledge-rule trigger condition (PRD §21 schema) against a
// patient record, returning verbatim evidence for each hit. `in` over
// conditions.code honors the data's "match" field: "prefix" → ICD-10
// category matching ("K81" matches "K81.9"), otherwise exact.
function evalTriggerCondition(
  p: RawPatient,
  t: RawTriggerCondition,
): EvidenceItem[] {
  if (t.field === "social_history.alcohol_use.drinks_per_week") {
    const drinks = p.social_history.alcohol_use?.drinks_per_week;
    if (
      typeof drinks === "number" &&
      typeof t.value === "number" &&
      ((t.operator === ">=" && drinks >= t.value) ||
        (t.operator === ">" && drinks > t.value))
    ) {
      return [
        {
          text: `${drinks} drinks per week documented`,
          source: "Social history",
          date: null,
        },
      ];
    }
    return [];
  }
  if (t.field === "conditions.code" && t.operator === "in") {
    const codes = t.value as string[];
    const prefix = t.match === "prefix";
    return p.conditions
      .filter((c) =>
        codes.some((x) =>
          prefix ? c.code === x || c.code.startsWith(x) : c.code === x,
        ),
      )
      .map(condEv);
  }
  return [];
}

// Summed priority_adjustment across all knowledge rules whose trigger fires
// for this patient. Per Jae's contract (HOLLY_TODO.md): seeded ground-truth
// scores are the clean base — the screener applies the delta on top.
function knowledgeDelta(p: RawPatient): number {
  return KNOWLEDGE.reduce((sum, rule) => {
    const fired = (rule.trigger?.any ?? []).some(
      (t) => evalTriggerCondition(p, t).length > 0,
    );
    return fired ? sum + rule.effect.priority_adjustment : sum;
  }, 0);
}

// guidanceActive: whether the clinician's Page 2 guidance has been applied —
// knowledge rules only participate in screening after that (demo narrative:
// "screen with protocol criteria only, or add clinician guidance first").
function evalPatient(p: RawPatient, guidanceActive: boolean): CriterionResult[] {
  const res: CriterionResult[] = [];
  const bmiObs = p.observations.find((o) => o.type === "BMI");
  const bmi = typeof bmiObs?.value === "number" ? bmiObs.value : null;
  const has = (prefixes: string[]) =>
    p.conditions.find((c) => prefixes.some((x) => c.code.startsWith(x)));
  const noteMatch = (re: RegExp) =>
    p.clinical_notes.find((n) => re.test(n.text));

  // inc_001 — BMI (deterministic, incl. the ≥27 + comorbidity branch)
  if (bmi != null && bmiObs) {
    if (bmi >= 30) {
      res.push({
        id: "inc_001",
        criterion: "BMI ≥ 30 kg/m²",
        type: "inclusion",
        status: "met",
        evidence: [obsEv(bmiObs)],
      });
    } else if (bmi >= 27) {
      const comorbid = has(["E78", "I10", "G47.33", "K76.0"]);
      const msNote = noteMatch(/metabolic syndrome/i);
      res.push(
        comorbid
          ? {
              id: "inc_001",
              criterion: "BMI ≥ 27 kg/m² + weight-related comorbidity",
              type: "inclusion",
              status: "met",
              note: "Met via the ≥27 + comorbidity branch",
              evidence: [obsEv(bmiObs), condEv(comorbid)],
            }
          : {
              id: "inc_001",
              criterion: "BMI ≥ 27 kg/m² + weight-related comorbidity",
              type: "inclusion",
              status: "needs_review",
              note: "Next: confirm and code a weight-related comorbidity",
              evidence: msNote
                ? [obsEv(bmiObs), noteEv(msNote)]
                : [obsEv(bmiObs)],
            },
      );
    } else {
      res.push({
        id: "inc_001",
        criterion: "BMI ≥ 30 kg/m² (or ≥27 + comorbidity)",
        type: "inclusion",
        status: "not_met",
        evidence: [obsEv(bmiObs)],
      });
    }
  }

  // inc_002 — stable weight (note interpretation → heuristic until backend)
  const stableNote = noteMatch(/stable/i);
  res.push(
    stableNote
      ? {
          id: "inc_002",
          criterion: "Stable body weight over prior 3 months (<5% change)",
          type: "inclusion",
          status: "likely_met",
          evidence: [noteEv(stableNote)],
        }
      : {
          id: "inc_002",
          criterion: "Stable body weight over prior 3 months (<5% change)",
          type: "inclusion",
          status: "needs_review",
          note: "Next: verify weight trajectory at visit",
          evidence: [],
        },
  );

  // exc_001 — diabetes (deterministic, ICD-10 E10/E11)
  const dm = has(["E10", "E11"]);
  res.push(
    dm
      ? {
          id: "exc_001",
          criterion: "No Type 1 or Type 2 diabetes",
          type: "exclusion",
          status: "not_met",
          note: "Exclusion criterion met — patient excluded",
          evidence: [condEv(dm)],
        }
      : {
          id: "exc_001",
          criterion: "No Type 1 or Type 2 diabetes",
          type: "exclusion",
          status: "met",
          evidence: [
            {
              text: "No diabetes diagnosis on problem list",
              source: "Problem list",
              date: null,
            },
          ],
        },
  );

  // exc_002 — hypertension control (note interpretation)
  const htn = has(["I10"]);
  if (htn) {
    const med = p.medications.find((m) =>
      /amlodipine|metoprolol|lisinopril|losartan|hydrochlorothiazide/i.test(
        m.name,
      ),
    );
    res.push({
      id: "exc_002",
      criterion: "No poorly controlled hypertension",
      type: "exclusion",
      status: "needs_review",
      note: "On treatment — confirm control at visit",
      evidence: med
        ? [
            condEv(htn),
            {
              text: `${med.name}${med.dose ? ` ${med.dose}` : ""}`,
              source: "Medication list",
              date: null,
            },
          ]
        : [condEv(htn)],
    });
  } else {
    res.push({
      id: "exc_002",
      criterion: "No poorly controlled hypertension",
      type: "exclusion",
      status: "met",
      evidence: [
        {
          text: "No hypertension diagnosis on problem list",
          source: "Problem list",
          date: null,
        },
      ],
    });
  }

  // exc_003 — liver disease; stale LFTs surface as missing actionable data
  const lft = p.observations.find((o) => /liver|\bALT\b|\bAST\b/i.test(o.type));
  if (lft && lft.collected_at < "2026-04-18") {
    res.push({
      id: "exc_003",
      criterion: "No liver disease other than NAFLD",
      type: "exclusion",
      status: "missing_data",
      note: "Next: reorder liver panel — last result outside the screening window",
      evidence: [obsEv(lft)],
    });
  } else {
    res.push({
      id: "exc_003",
      criterion: "No liver disease other than NAFLD",
      type: "exclusion",
      status: "met",
      evidence: lft
        ? [obsEv(lft)]
        : [
            {
              text: "No liver disease evidence in record",
              source: "Chart review",
              date: null,
            },
          ],
    });
  }

  // exc_004 — recent CV events (deterministic, ICD-10)
  const cv = has(["I21", "I63", "I20.0", "I50"]);
  res.push(
    cv
      ? {
          id: "exc_004",
          criterion: "No acute MI, stroke, unstable angina, or CHF (3 months)",
          type: "exclusion",
          status: "not_met",
          note: "Exclusion criterion met — patient excluded",
          evidence: [condEv(cv)],
        }
      : {
          id: "exc_004",
          criterion: "No acute MI, stroke, unstable angina, or CHF (3 months)",
          type: "exclusion",
          status: "met",
          evidence: [
            {
              text: "No qualifying cardiovascular events on record",
              source: "Problem list",
              date: null,
            },
          ],
        },
  );

  // exc_005 — symptomatic gallbladder disease (2-year window, human review)
  const gb = has(["K80", "K81", "K82"]);
  if (gb) {
    const gbNote = noteMatch(/cholecyst/i);
    res.push({
      id: "exc_005",
      criterion: "No symptomatic gallbladder disease within 2 years",
      type: "exclusion",
      status: "needs_review",
      note: "Within the 2-year window — physician review required",
      evidence: gbNote ? [condEv(gb), noteEv(gbNote)] : [condEv(gb)],
    });
  }

  // exc_006 — pancreatitis (deterministic, ICD-10 K85/K86)
  const panc = has(["K85", "K86"]);
  res.push(
    panc
      ? {
          id: "exc_006",
          criterion: "No history of acute or chronic pancreatitis",
          type: "exclusion",
          status: "not_met",
          note: "Exclusion criterion met — patient excluded",
          evidence: [condEv(panc)],
        }
      : {
          id: "exc_006",
          criterion: "No history of acute or chronic pancreatitis",
          type: "exclusion",
          status: "met",
          evidence: [
            {
              text: "No pancreatitis history on record",
              source: "Problem list",
              date: null,
            },
          ],
        },
  );

  // exc_007 — resting pulse 60–100 (deterministic when a reading exists)
  const hr = p.observations.find((o) => /heart rate|pulse/i.test(o.type));
  if (hr && typeof hr.value === "number") {
    const out = hr.value < 60 || hr.value > 100;
    const hrNote = noteMatch(/bradycardia|beta-blocker|bpm/i);
    res.push({
      id: "exc_007",
      criterion: "Resting pulse 60–100 bpm",
      type: "exclusion",
      status: out ? "not_met" : "met",
      note: out ? "Exclusion criterion met — patient excluded" : undefined,
      evidence:
        out && hrNote ? [obsEv(hr), noteEv(hrNote)] : [obsEv(hr)],
    });
  }

  // clinician knowledge rules — data-driven from data/clinician_knowledge.json
  // (trigger.any is OR semantics; effect.action flag_for_review never excludes)
  for (const rule of guidanceActive ? KNOWLEDGE : []) {
    const ev = (rule.trigger?.any ?? []).flatMap((t) =>
      evalTriggerCondition(p, t),
    );
    if (!ev.length) continue;
    const alcNote =
      ev.some((e) => e.source === "Social history") && noteMatch(/alcohol/i);
    if (alcNote) ev.push(noteEv(alcNote));
    res.push({
      id: rule.knowledge_id.replace(/^knowledge_/, "kn_"),
      criterion: rule.effect.label,
      type: "exclusion",
      status: "needs_review",
      note: rule.requires_human_confirmation
        ? `From trial clinician voice input — do not auto-exclude · priority ${rule.effect.priority_adjustment}`
        : `From trial clinician voice input · priority ${rule.effect.priority_adjustment}`,
      evidence: ev,
    });
  }

  // baseline data gap — smoking history
  if (p.social_history.smoking_status === "unknown") {
    res.push({
      id: "base_smoking",
      criterion: "Smoking history (baseline CV risk)",
      type: "inclusion",
      status: "missing_data",
      note: "Next: ask patient — needed for CV risk assessment with GLP-1 therapy",
      evidence: [],
    });
  }

  return res;
}

// ------------------------------------------------------------ queue view

const ARCHETYPE_META: Record<string, { reason: string; score: number | null }> =
  {
    clear_match: { reason: "All criteria met", score: 96 },
    subjective_disease_severity: { reason: "All criteria met", score: 93 },
    borderline_numeric_criterion: { reason: "Borderline BMI", score: 84 },
    missing_smoking_history: { reason: "Smoking hx missing", score: 74 },
    expired_missing_lab_result: { reason: "LFTs expired", score: 71 },
    pancreatitis_risk_alcohol: { reason: "Alcohol-use flag", score: 68 },
    gallbladder_disease_risk: { reason: "Gallbladder hx flag", score: 64 },
    clear_exclusion: { reason: "T2DM exclusion", score: 22 },
    high_dropout_tolerance_concern: { reason: "HR 52 — exclusion", score: 18 },
    already_enrolled_participant: { reason: "Week 2", score: null },
    mild_adverse_event: { reason: "Week 3 · mild nausea", score: null },
    escalation_adverse_event: { reason: "Week 4 · severe GI", score: null },
  };

export function queuePatients(guidanceActive: boolean): QueuePatient[] {
  return rawPatients.map((p) => {
    const meta = ARCHETYPE_META[p.scenario_metadata.archetype] ?? {
      reason: p.scenario_metadata.archetype,
      score: null,
    };
    const firstNote = p.clinical_notes[0];
    const delta =
      guidanceActive && meta.score != null ? knowledgeDelta(p) : 0;
    return {
      id: p.patient_id,
      name: p.name.display,
      age: p.demographics.age,
      time: p.visit.appointment_time,
      condition: p.conditions[0]?.name.replace(/, unspecified/i, "") ?? "—",
      status: p.scenario_metadata.expected_outcome as EnrollmentStatus,
      score: meta.score != null ? meta.score + delta : null,
      baseScore: delta !== 0 ? (meta.score ?? undefined) : undefined,
      knowledgeDelta: delta !== 0 ? delta : undefined,
      topReason: meta.reason,
      studyWeek: p.trial_status.study_week ?? undefined,
      tooltip: {
        headline: p.name.display,
        lines: p.scenario_metadata.ground_truth_notes.slice(0, 3),
        source: firstNote
          ? `${firstNote.note_type} · ${firstNote.date}`
          : "Seeded screening result",
      },
    };
  });
}

// Fresh-demo default: protocol criteria only, before Apply on Page 2.
export const PATIENTS: QueuePatient[] = queuePatients(false);

// ----------------------------------------------------------- detail view

const STATUS_LABEL: Record<string, string> = {
  enrollment_ready: "Enrollment Ready",
  potential_match: "Potential Match",
  missing_actionable_data: "Missing Actionable Data",
  needs_review: "Needs Clinician Review",
  confirmed_exclusion: "Confirmed Exclusion",
  actively_enrolled: "Actively Enrolled",
};

export function detailFor(
  q: QueuePatient,
  guidanceActive: boolean,
): PatientDetail {
  const p = rawPatients.find((x) => x.patient_id === q.id);
  if (!p) {
    return {
      id: q.id,
      name: q.name,
      headline: `Age ${q.age} · ${q.condition}`,
      summary: "Patient record not found in the seeded cohort.",
      workup: [],
      results: [],
    };
  }
  const results = evalPatient(p, guidanceActive);
  const bmiObs = p.observations.find((o) => o.type === "BMI");
  const workup = [
    ...results
      .filter((r) => r.status === "missing_data" && r.note)
      .map((r) => r.note!.replace(/^Next: /, "")),
    ...results
      .filter((r) => r.status === "needs_review")
      .map((r) => `Physician review: ${r.criterion}`),
  ].slice(0, 4);
  return {
    id: q.id,
    name: q.name,
    headline: `${STATUS_LABEL[q.status] ?? q.status} · ${
      q.score != null
        ? q.knowledgeDelta != null && q.baseScore != null
          ? `base ${q.baseScore} · clinician flag ${q.knowledgeDelta} → ${q.score}% · `
          : `${q.score}% · `
        : ""
    }Age ${q.age} · BMI ${bmiObs?.value ?? "?"} · ${q.condition}`,
    summary: `${p.scenario_metadata.ground_truth_notes.join("; ")}.`,
    workup,
    results,
  };
}

// ---------------------------------------------------- follow-up scenarios

// Transcripts are demo scripts consistent with the adverse_events records in
// Jae's patient file. Elizabeth's disqualification beat is the v1.1 PRD
// Page 6 Scenario 2 (new information arriving via follow-up conversation).
export const FOLLOWUPS: Record<string, FollowUpScenario> = {
  pt_010: {
    patientId: "pt_010",
    patientName: "Christopher Rodriguez",
    week: 3,
    hasAudio: false,
    transcript:
      "I started the study medication about three weeks ago. I feel nauseous " +
      "most mornings, but it usually passes by the afternoon. I can still eat " +
      "and drink fine, and it hasn't really gotten in the way of my day.",
    events: [
      {
        event: "Nausea",
        detail: "Mild · most mornings, resolves by afternoon",
        confidence: 94,
      },
    ],
    footnotes: [
      "Possible relationship: after study medication initiation",
      "Severity: mild — typical GLP-1 side effect",
      "Hydration and oral intake: not impaired",
      "Escalation: not required — monitor at next visit",
    ],
  },
  // pt_011 transcript is Jae's recorded Page 6 script verbatim
  // (data/transcripts/patient_follow_up.txt · Adverse effect.m4a)
  pt_011: {
    patientId: "pt_011",
    patientName: "Mark Davis",
    week: 4,
    hasAudio: true,
    audioSrc: "/audio/adverse-effect.m4a",
    transcript:
      "Yeah I'm having lots of nausea pretty much every single day. Um. I " +
      "actually threw up a couple times this week. I, you know, can drink " +
      "water, uh I can eat a little bit, but really messing with my overall " +
      "kind of work and sleep and I just don't know how much longer I can " +
      "keep going with this, it's been 3 weeks",
    events: [
      {
        event: "Nausea",
        detail: "Daily · “pretty much every single day”",
        confidence: 96,
      },
      {
        event: "Vomiting",
        detail: "“Threw up a couple times this week”",
        confidence: 93,
      },
      {
        event: "Functional impact / tolerance concern",
        detail: "“Really messing with my work and sleep … don't know how much longer”",
        confidence: 89,
      },
    ],
    footnotes: [
      "Possible relationship: after study medication initiation (~3 weeks)",
      "Hydration and oral intake: partially preserved (water, eats a little)",
    ],
    escalation:
      "Poor medication tolerance with daily symptoms, functional impact on " +
      "work and sleep, and dropout risk — notify the trial physician for " +
      "antiemetic therapy and possible dose adjustment.",
  },
  pt_009: {
    patientId: "pt_009",
    patientName: "Elizabeth Garcia",
    week: 2,
    hasAudio: false,
    transcript:
      "Before we start — I was in the hospital last week. They told me I had " +
      "acute pancreatitis, and I was started on a new medication there.",
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
      criterion: "No history of acute or chronic pancreatitis (exc_006)",
      evidence: "“They told me I had acute pancreatitis”",
      source: "Follow-up transcript · 2026-07-18",
    },
  },
};
