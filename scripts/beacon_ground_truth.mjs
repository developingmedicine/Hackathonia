// Shared ground-truth module for the training-data export and model eval
// scripts. Mirrors the deterministic mini-screener in frontend/lib/data.ts
// (PRD §38): labels here are genuinely computed from the patient records in
// data/patients.json — never hand-seeded per patient.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

export const PATIENTS = read("data/patients.json");
export const CRITERIA_FILE = read("data/criteria.json");
export const CRITERIA = CRITERIA_FILE.base_criteria;
export const KNOWLEDGE = read("data/clinician_knowledge.json");

// Criteria whose ground truth is programmatically computable (evaluation_mode
// "deterministic" in data/criteria.json). Note-interpretation criteria have no
// automatic ground truth and are reported, not scored.
export const DETERMINISTIC_IDS = CRITERIA.filter(
  (c) => c.evaluation_mode === "deterministic",
).map((c) => c.criterion_id);

const hasPrefix = (patient, prefixes) =>
  patient.conditions.find((c) => prefixes.some((x) => c.code.startsWith(x)));

const condEv = (c) => `${c.name} (${c.code})`;

// Status vocabulary (same as frontend/lib/data.ts): each criterion's
// normalized_text is a statement about the patient; "met" = statement holds,
// "not_met" = statement violated, "needs_review" = clinician judgement needed,
// "missing_data" = required data absent from the record.
export function deterministicGroundTruth(patient) {
  const out = [];
  const bmiObs = patient.observations.find((o) => o.type === "BMI");
  const bmi = typeof bmiObs?.value === "number" ? bmiObs.value : null;

  // inc_001 — BMI ≥30, or ≥27 with a weight-related comorbidity
  if (bmi == null) {
    out.push({ criterion_id: "inc_001", status: "missing_data", evidence: [] });
  } else if (bmi >= 30) {
    out.push({ criterion_id: "inc_001", status: "met", evidence: [`BMI ${bmi}`] });
  } else if (bmi >= 27) {
    const comorbid = hasPrefix(patient, ["E78", "I10", "G47.33", "K76.0"]);
    out.push(
      comorbid
        ? { criterion_id: "inc_001", status: "met", evidence: [`BMI ${bmi}`, condEv(comorbid)] }
        : { criterion_id: "inc_001", status: "needs_review", evidence: [`BMI ${bmi}`] },
    );
  } else {
    out.push({ criterion_id: "inc_001", status: "not_met", evidence: [`BMI ${bmi}`] });
  }

  // exc_001 — no T1/T2 diabetes (ICD-10 E10/E11)
  const dm = hasPrefix(patient, ["E10", "E11"]);
  out.push({
    criterion_id: "exc_001",
    status: dm ? "not_met" : "met",
    evidence: dm ? [condEv(dm)] : [],
  });

  // exc_004 — no recent MI / stroke / unstable angina / CHF
  const cv = hasPrefix(patient, ["I21", "I63", "I20.0", "I50"]);
  out.push({
    criterion_id: "exc_004",
    status: cv ? "not_met" : "met",
    evidence: cv ? [condEv(cv)] : [],
  });

  // exc_006 — no pancreatitis history (ICD-10 K85/K86)
  const panc = hasPrefix(patient, ["K85", "K86"]);
  out.push({
    criterion_id: "exc_006",
    status: panc ? "not_met" : "met",
    evidence: panc ? [condEv(panc)] : [],
  });

  // exc_007 — resting pulse 60–100 bpm
  const hr = patient.observations.find((o) => /heart rate|pulse/i.test(o.type));
  if (hr && typeof hr.value === "number") {
    const outOfRange = hr.value < 60 || hr.value > 100;
    out.push({
      criterion_id: "exc_007",
      status: outOfRange ? "not_met" : "met",
      evidence: [`${hr.type} ${hr.value} bpm`],
    });
  } else {
    out.push({ criterion_id: "exc_007", status: "missing_data", evidence: [] });
  }

  return out;
}

// Data-driven clinician knowledge rule evaluation (same trigger semantics as
// frontend/lib/data.ts: OR over trigger.any; "in" with match:"prefix" is
// ICD-10-prefix-aware).
export function knowledgeFlags(patient) {
  const flags = [];
  for (const rule of KNOWLEDGE) {
    const evidence = [];
    for (const t of rule.trigger?.any ?? []) {
      if (t.field === "social_history.alcohol_use.drinks_per_week") {
        const drinks = patient.social_history?.alcohol_use?.drinks_per_week;
        if (
          typeof drinks === "number" &&
          ((t.operator === ">=" && drinks >= t.value) ||
            (t.operator === ">" && drinks > t.value))
        ) {
          evidence.push(`${drinks} drinks per week documented`);
        }
      } else if (t.field === "conditions.code" && t.operator === "in") {
        const prefix = t.match === "prefix";
        for (const c of patient.conditions) {
          if (t.value.some((x) => (prefix ? c.code === x || c.code.startsWith(x) : c.code === x))) {
            evidence.push(condEv(c));
          }
        }
      }
    }
    if (evidence.length) {
      flags.push({
        knowledge_id: rule.knowledge_id,
        action: rule.effect.action,
        label: rule.effect.label,
        explanation: rule.effect.explanation,
        priority_adjustment: rule.effect.priority_adjustment,
        evidence,
      });
    }
  }
  return flags;
}

// Patient record as shown to a model or a training sample: ground truth and
// demo-state fields stripped so labels can never leak into the input.
export function recordForInput(patient) {
  const { scenario_metadata, trial_status, adverse_events, ...rest } = patient;
  return rest;
}

