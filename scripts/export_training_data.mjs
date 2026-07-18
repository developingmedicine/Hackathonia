// Export Beacon's screening data as a fine-tuning dataset (data/training/
// train.jsonl). Every sample is generated from the same sources the app runs
// on — data/patients.json, data/criteria.json, data/clinician_knowledge.json,
// data/transcripts/ — with per-sample provenance in metadata.label_source.
// Synthetic data only (PRD hard rule); no PHI.
//
// Usage:  node scripts/export_training_data.mjs

import fs from "node:fs";
import path from "node:path";
import {
  ROOT,
  PATIENTS,
  CRITERIA,
  CRITERIA_FILE,
  KNOWLEDGE,
  deterministicGroundTruth,
  knowledgeFlags,
  recordForInput,
} from "./beacon_ground_truth.mjs";

const OUT_DIR = path.join(ROOT, "data", "training");
fs.mkdirSync(OUT_DIR, { recursive: true });

const criterionById = Object.fromEntries(CRITERIA.map((c) => [c.criterion_id, c]));

const SCREEN_SYSTEM =
  `You are a clinical-trial screening assistant for trial ${CRITERIA_FILE.trial_id} ` +
  `(${CRITERIA_FILE.trial_title}). Given a synthetic patient record and one eligibility ` +
  `criterion, return JSON {"criterion_id", "status", "evidence"} where status is one of ` +
  `"met" (the criterion statement holds), "not_met" (violated), "needs_review" ` +
  `(clinician judgement required), "missing_data" (required data absent). Evidence must ` +
  `quote the record verbatim. This is decision support: never diagnose or exclude autonomously.`;

const samples = [];

// 1. Per-criterion samples — labels computed by the deterministic screener
for (const p of PATIENTS) {
  const record = recordForInput(p);
  for (const gt of deterministicGroundTruth(p)) {
    const c = criterionById[gt.criterion_id];
    samples.push({
      messages: [
        { role: "system", content: SCREEN_SYSTEM },
        {
          role: "user",
          content:
            `Criterion [${c.criterion_id}] (${c.criterion_type}): ${c.normalized_text}\n\n` +
            `Patient record:\n${JSON.stringify(record, null, 2)}`,
        },
        { role: "assistant", content: JSON.stringify(gt) },
      ],
      metadata: {
        patient_id: p.patient_id,
        criterion_id: gt.criterion_id,
        label_source: "deterministic_screener",
      },
    });
  }
}

// 2. Whole-patient outcome samples — labels from Jae's clinician ground truth
const criteriaList = CRITERIA.map(
  (c) => `- [${c.criterion_id}] (${c.criterion_type}) ${c.normalized_text}`,
).join("\n");
for (const p of PATIENTS) {
  samples.push({
    messages: [
      { role: "system", content: SCREEN_SYSTEM },
      {
        role: "user",
        content:
          `Screen this patient against all trial criteria and return JSON ` +
          `{"expected_outcome", "notes"}.\n\nCriteria:\n${criteriaList}\n\n` +
          `Patient record:\n${JSON.stringify(recordForInput(p), null, 2)}`,
      },
      {
        role: "assistant",
        content: JSON.stringify({
          expected_outcome: p.scenario_metadata.expected_outcome,
          notes: p.scenario_metadata.ground_truth_notes,
        }),
      },
    ],
    metadata: { patient_id: p.patient_id, label_source: "clinician_ground_truth" },
  });
}

// 3. Clinician-knowledge flag samples — labels from executing the data-driven
// rules in clinician_knowledge.json against each record (flag-only, never
// auto-exclude)
for (const p of PATIENTS) {
  const flags = knowledgeFlags(p);
  if (!flags.length) continue;
  samples.push({
    messages: [
      { role: "system", content: SCREEN_SYSTEM },
      {
        role: "user",
        content:
          `Apply this clinician-authored screening rule and return JSON with any flags ` +
          `raised (or an empty list). Rule:\n${JSON.stringify(KNOWLEDGE[0].trigger)}\n` +
          `Effect: ${JSON.stringify(KNOWLEDGE[0].effect)}\n\n` +
          `Patient record:\n${JSON.stringify(recordForInput(p), null, 2)}`,
      },
      { role: "assistant", content: JSON.stringify({ flags }) },
    ],
    metadata: { patient_id: p.patient_id, label_source: "clinician_knowledge_rule" },
  });
}

// 4. Voice-transcript samples — Jae's real recordings paired with the
// structured outputs delivered alongside them
const transcript = (f) =>
  fs
    .readFileSync(path.join(ROOT, "data", "transcripts", f), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !/^(PAGE|Recorded)/.test(l))
    .join("\n")
    .trim();

samples.push({
  messages: [
    {
      role: "system",
      content:
        "Convert a clinician's spoken screening guidance into a structured, data-driven " +
        "screening rule (trigger + effect). Flag-for-review only; never auto-exclude.",
    },
    { role: "user", content: transcript("clinician_intake.txt") },
    {
      role: "assistant",
      content: JSON.stringify({ trigger: KNOWLEDGE[0].trigger, effect: KNOWLEDGE[0].effect }),
    },
  ],
  metadata: { label_source: "recorded_transcript", transcript: "clinician_intake" },
});

const pt011 = PATIENTS.find((p) => p.patient_id === "pt_011");
samples.push({
  messages: [
    {
      role: "system",
      content:
        "Extract adverse events from a trial participant's follow-up transcript as JSON. " +
        "Decision support only — escalation decisions belong to the clinician.",
    },
    { role: "user", content: transcript("patient_follow_up.txt") },
    {
      role: "assistant",
      content: JSON.stringify({
        adverse_events: pt011.adverse_events.map(({ event, severity, onset, notes }) => ({
          event,
          severity,
          onset,
          notes,
        })),
      }),
    },
  ],
  metadata: {
    patient_id: "pt_011",
    label_source: "recorded_transcript",
    transcript: "patient_follow_up",
  },
});

// Write outputs
const jsonlPath = path.join(OUT_DIR, "train.jsonl");
fs.writeFileSync(jsonlPath, samples.map((s) => JSON.stringify(s)).join("\n") + "\n");

const counts = {};
for (const s of samples) counts[s.metadata.label_source] = (counts[s.metadata.label_source] ?? 0) + 1;

fs.writeFileSync(
  path.join(OUT_DIR, "README.md"),
  `# Beacon training dataset

\`train.jsonl\` — one fine-tuning sample per line, in messages format
(system / user / assistant). Generated by \`scripts/export_training_data.mjs\`
from the same files the demo runs on. **Synthetic data only, no PHI.**

| label_source | samples | label comes from |
|---|---|---|
| deterministic_screener | ${counts.deterministic_screener} | programmatic screener over data/patients.json (patient × deterministic criterion) |
| clinician_ground_truth | ${counts.clinician_ground_truth} | Jae's scenario_metadata (whole-patient expected outcome) |
| clinician_knowledge_rule | ${counts.clinician_knowledge_rule} | executing data/clinician_knowledge.json triggers |
| recorded_transcript | ${counts.recorded_transcript} | Jae's real voice recordings + delivered structured outputs |

Inputs never contain \`scenario_metadata\`, \`trial_status\`, or
\`adverse_events\` (except as labels), so ground truth cannot leak into the
prompt side of a sample.

**The flywheel:** in production, every clinician Confirm/Override of an AI
flag appends one more expert-labeled sample here (label_source:
\`clinician_review\`) — annotation as a free by-product of the clinical
workflow.
`,
);

console.log(`Wrote ${samples.length} samples → ${path.relative(ROOT, jsonlPath)}`);
for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`);
