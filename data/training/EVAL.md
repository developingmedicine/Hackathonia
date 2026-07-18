# Beacon screening benchmark — live eval results

Run: 2026-07-18T19:35:39.616Z · trial NCT07589608 · 12 synthetic patients
Scores computed by `scripts/eval_models.mjs` against programmatic ground truth
(deterministic criteria only; note-interpretation criteria are unscored by design).
**Genuinely computed — nothing seeded.**

| Metric | Haiku 4.5 | Opus 4.8 |
|---|---|---|
| Deterministic criteria accuracy | 54/60 (90%) | 60/60 (100%) |
| Evidence groundedness (quoted codes/values found in record) | 59/60 (98%) | 42/42 (100%) |

## Per-criterion accuracy

| Criterion | Haiku 4.5 | Opus 4.8 |
|---|---|---|
| inc_001 — BMI must be ≥30 kg/m² OR (≥27 kg/m² AND ≥1 weigh | 12/12 | 12/12 |
| inc_002 — Weight change ≤5% over prior 3 months | 0/0 | 0/0 |
| exc_001 — No Type 1 or Type 2 diabetes | 11/12 | 12/12 |
| exc_004 — No acute MI, stroke, unstable angina, or CHF hos | 9/12 | 12/12 |
| exc_006 — No history of acute or chronic pancreatitis | 10/12 | 12/12 |
| exc_007 — Resting pulse 60–100 bpm | 12/12 | 12/12 |

## Mismatches

### Haiku 4.5
- pt_002 · exc_004: expected **met**, got **missing_data** (evidence: "")
- pt_002 · exc_006: expected **met**, got **missing_data** (evidence: "")
- pt_004 · exc_004: expected **met**, got **missing_data** (evidence: "")
- pt_011 · exc_001: expected **met**, got **missing_data** (evidence: "")
- pt_011 · exc_004: expected **met**, got **missing_data** (evidence: "")
- pt_011 · exc_006: expected **met**, got **missing_data** (evidence: "")

### Opus 4.8
None — perfect score on deterministic criteria.

## Why this matters

This cohort + criteria set is a reusable benchmark: it quantifies how precisely
a model performs clinical-trial screening, per criterion type. Clinician
Confirm/Override events extend the same dataset (see `train.jsonl`) — today
decision support, tomorrow eval + fine-tuning data.
