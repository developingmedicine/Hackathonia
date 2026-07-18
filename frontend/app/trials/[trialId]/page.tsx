/**
 * PAGE 2 — Trial Intelligence & Clinician Knowledge Intake.
 * Clinician is NOT the trial designer: they annotate EXISTING criteria, never
 * create new ones (v1.1).
 * LEFT column: parsed inclusion/exclusion criteria (preserved, visually first)
 *   + Extracted Guidance directly beneath them (v1.1 move) → iterable unit.
 * RIGHT column: voice recording → editable transcript → "Apply to Screening Logic".
 * Footer: "Screen Patient Cohort →".
 * Data: GET /api/trials/{id}, POST /parse, POST /knowledge, POST /screen-cohort.
 * PRD: §13 Page 2 (v1.1 block), §24.2–24.4, §24.9, §25.1.
 */
