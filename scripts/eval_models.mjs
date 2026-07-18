// Beacon screening benchmark — runs Claude models over the full synthetic
// cohort and scores them against programmatic ground truth. Results are
// genuinely computed (PRD hard rule: never rig a demo); each run overwrites
// data/training/eval_results.json and data/training/EVAL.md.
//
// Usage:  node scripts/eval_models.mjs
// Needs ANTHROPIC_API_KEY (env or frontend/.env.local). ~24 API calls.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import {
  ROOT,
  PATIENTS,
  CRITERIA,
  CRITERIA_FILE,
  DETERMINISTIC_IDS,
  deterministicGroundTruth,
  recordForInput,
} from "./beacon_ground_truth.mjs";

// Reuse the frontend's installed @anthropic-ai/sdk
const require = createRequire(path.join(ROOT, "frontend", "package.json"));
const Anthropic = require("@anthropic-ai/sdk").default;

// API key: env var, else frontend/.env.local
if (!process.env.ANTHROPIC_API_KEY) {
  try {
    const env = fs.readFileSync(path.join(ROOT, "frontend", ".env.local"), "utf8");
    const m = env.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (m) process.env.ANTHROPIC_API_KEY = m[1].trim();
  } catch {}
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("No ANTHROPIC_API_KEY found (env or frontend/.env.local). Aborting.");
  process.exit(1);
}

const client = new Anthropic({ maxRetries: 3 });

// Haiku 4.5 does not support adaptive thinking or output_config.effort —
// omit both there; Opus 4.8 uses the same config as the live demo routes.
const MODELS = [
  { id: "claude-haiku-4-5", label: "Haiku 4.5", extra: {} },
  {
    id: "claude-opus-4-8",
    label: "Opus 4.8",
    extra: { thinking: { type: "adaptive" }, output_config: { effort: "low" } },
  },
];

const STATUSES = ["met", "not_met", "needs_review", "missing_data"];

const SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          criterion_id: { type: "string" },
          status: { type: "string", enum: STATUSES },
          evidence: { type: "string" },
        },
        required: ["criterion_id", "status", "evidence"],
        additionalProperties: false,
      },
    },
  },
  required: ["results"],
  additionalProperties: false,
};

const criteriaSpec = CRITERIA.map((c) => {
  const parts = [`[${c.criterion_id}] (${c.criterion_type}, ${c.evaluation_mode}) ${c.normalized_text}`];
  if (c.icd10_codes) parts.push(`  ICD-10 category prefixes: ${c.icd10_codes.join(", ")}`);
  if (c.threshold != null) parts.push(`  Threshold: ${c.operator} ${c.threshold} ${c.unit}`);
  if (c.min_threshold != null) parts.push(`  Range: ${c.min_threshold}–${c.max_threshold} ${c.unit}`);
  return parts.join("\n");
}).join("\n");

const SYSTEM = `You are the screening service for Beacon, a clinical-trial enrollment copilot running on synthetic data only. Evaluate a patient record against every eligibility criterion of trial ${CRITERIA_FILE.trial_id} and return one result per criterion.

Status semantics — each criterion's text is a statement about the patient:
- "met": the statement holds (patient passes this criterion)
- "not_met": the statement is violated (e.g. an exclusion condition IS present, or an inclusion threshold fails)
- "needs_review": the record is suggestive but a clinician must judge (use for judgement-mode criteria without clear evidence either way, and for BMI 27–29.9 without a coded weight-related comorbidity such as E78.x, I10, G47.33 or K76.0)
- "missing_data": the data the criterion requires is absent from the record (e.g. no resting heart-rate observation)

Rules:
- ICD-10 code lists match by category prefix ("K81" matches "K81.9").
- "evidence" must quote the record verbatim (a condition name + code, an observation value, or a note excerpt); use "" only when status is missing_data or nothing in the record is relevant.
- Return a result for every criterion listed. This is clinician-reviewed decision support — never invent data.

Trial criteria:
${criteriaSpec}`;

async function screenPatient(model, patient) {
  const response = await client.messages.create(
    {
      model: model.id,
      max_tokens: 8000,
      ...model.extra,
      output_config: {
        ...(model.extra.output_config ?? {}),
        format: { type: "json_schema", schema: SCHEMA },
      },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Patient record:\n${JSON.stringify(recordForInput(patient), null, 2)}`,
        },
      ],
    },
    { timeout: 120_000 },
  );
  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  return { results: JSON.parse(text).results, usage: response.usage };
}

// Evidence groundedness (hallucination check): every code/number token quoted
// in the evidence must appear in the patient record OR in the trial-criteria
// spec itself (thresholds and ICD lists like "No E10/E11 codes present" are
// legitimate references to the criteria, not invented patient data).
const CRITERIA_STR = JSON.stringify(CRITERIA);
function evidenceGrounded(evidence, patient) {
  const tokens = evidence.match(/[A-Z]\d+(?:\.\d+)?|\d+(?:\.\d+)?/g);
  if (!tokens || !tokens.length) return null; // nothing checkable
  const recordStr = JSON.stringify(recordForInput(patient));
  return tokens.every((t) => recordStr.includes(t) || CRITERIA_STR.includes(t));
}

async function evalModel(model) {
  console.log(`\n=== ${model.label} (${model.id}) ===`);
  const perPatient = [];
  const BATCH = 4;
  for (let i = 0; i < PATIENTS.length; i += BATCH) {
    const batch = PATIENTS.slice(i, i + BATCH);
    const settled = await Promise.allSettled(batch.map((p) => screenPatient(model, p)));
    settled.forEach((r, j) => {
      const p = batch[j];
      if (r.status === "rejected") {
        console.error(`  ${p.patient_id}: FAILED — ${r.reason?.message ?? r.reason}`);
        perPatient.push({ patient_id: p.patient_id, error: String(r.reason?.message ?? r.reason) });
        return;
      }
      console.log(`  ${p.patient_id}: ok`);
      perPatient.push({ patient_id: p.patient_id, results: r.value.results });
    });
  }

  // Score deterministic criteria
  const perCriterion = {};
  let correct = 0, total = 0, groundedYes = 0, groundedTotal = 0;
  const mismatches = [];
  for (const pp of perPatient) {
    if (pp.error) continue;
    const patient = PATIENTS.find((p) => p.patient_id === pp.patient_id);
    const gts = deterministicGroundTruth(patient);
    for (const gt of gts) {
      const pred = pp.results.find((r) => r.criterion_id === gt.criterion_id);
      const ok = pred?.status === gt.status;
      total++;
      if (ok) correct++;
      const pc = (perCriterion[gt.criterion_id] ??= { correct: 0, total: 0 });
      pc.total++;
      if (ok) pc.correct++;
      if (!ok) {
        mismatches.push({
          patient_id: pp.patient_id,
          criterion_id: gt.criterion_id,
          expected: gt.status,
          predicted: pred?.status ?? "(no result)",
          model_evidence: pred?.evidence ?? "",
        });
      }
    }
    // Groundedness over ALL returned results, not just scored ones
    for (const r of pp.results) {
      const g = evidenceGrounded(r.evidence ?? "", patient);
      if (g !== null) {
        groundedTotal++;
        if (g) groundedYes++;
      }
    }
  }

  return {
    model: model.id,
    label: model.label,
    deterministic_accuracy: { correct, total },
    per_criterion: perCriterion,
    evidence_groundedness: { grounded: groundedYes, checkable: groundedTotal },
    mismatches,
    per_patient: perPatient,
  };
}

const startedAt = new Date().toISOString();
const results = [];
for (const model of MODELS) results.push(await evalModel(model));

const OUT_DIR = path.join(ROOT, "data", "training");
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(
  path.join(OUT_DIR, "eval_results.json"),
  JSON.stringify({ started_at: startedAt, trial: CRITERIA_FILE.trial_id, results }, null, 2),
);

// Markdown report
const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(0)}%` : "—");
const critRows = DETERMINISTIC_IDS.map((cid) => {
  const c = CRITERIA.find((x) => x.criterion_id === cid);
  const cells = results
    .map((r) => {
      const pc = r.per_criterion[cid] ?? { correct: 0, total: 0 };
      return `${pc.correct}/${pc.total}`;
    })
    .join(" | ");
  return `| ${cid} — ${c.normalized_text.slice(0, 48)} | ${cells} |`;
}).join("\n");

const md = `# Beacon screening benchmark — live eval results

Run: ${startedAt} · trial ${CRITERIA_FILE.trial_id} · ${PATIENTS.length} synthetic patients
Scores computed by \`scripts/eval_models.mjs\` against programmatic ground truth
(deterministic criteria only; note-interpretation criteria are unscored by design).
**Genuinely computed — nothing seeded.**

| Metric | ${results.map((r) => r.label).join(" | ")} |
|---|${results.map(() => "---|").join("")}
| Deterministic criteria accuracy | ${results.map((r) => `${r.deterministic_accuracy.correct}/${r.deterministic_accuracy.total} (${pct(r.deterministic_accuracy.correct, r.deterministic_accuracy.total)})`).join(" | ")} |
| Evidence groundedness (quoted codes/values found in record) | ${results.map((r) => `${r.evidence_groundedness.grounded}/${r.evidence_groundedness.checkable} (${pct(r.evidence_groundedness.grounded, r.evidence_groundedness.checkable)})`).join(" | ")} |

## Per-criterion accuracy

| Criterion | ${results.map((r) => r.label).join(" | ")} |
|---|${results.map(() => "---|").join("")}
${critRows}

## Mismatches

${results
  .map(
    (r) =>
      `### ${r.label}\n` +
      (r.mismatches.length
        ? r.mismatches
            .map(
              (m) =>
                `- ${m.patient_id} · ${m.criterion_id}: expected **${m.expected}**, got **${m.predicted}** (evidence: "${m.model_evidence}")`,
            )
            .join("\n")
        : "None — perfect score on deterministic criteria."),
  )
  .join("\n\n")}

## Why this matters

This cohort + criteria set is a reusable benchmark: it quantifies how precisely
a model performs clinical-trial screening, per criterion type. Clinician
Confirm/Override events extend the same dataset (see \`train.jsonl\`) — today
decision support, tomorrow eval + fine-tuning data.
`;
fs.writeFileSync(path.join(OUT_DIR, "EVAL.md"), md);

console.log(`\nWrote data/training/eval_results.json and data/training/EVAL.md`);
for (const r of results) {
  const a = r.deterministic_accuracy;
  const g = r.evidence_groundedness;
  console.log(
    `${r.label}: accuracy ${a.correct}/${a.total} (${pct(a.correct, a.total)}) · groundedness ${g.grounded}/${g.checkable} (${pct(g.grounded, g.checkable)})`,
  );
}
