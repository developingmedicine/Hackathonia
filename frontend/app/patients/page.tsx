/**
 * PAGE 3 — Patient Screening Queue (now also hosts enrolled patients — v1.1).
 * Prioritized queue of 8–12 synthetic patients: time, name, age, condition,
 * match score, status badge, top reason, alert count. Filter by status.
 * v1.1 (Jae review):
 *  - every status chip gets a hover TOOLTIP: summary + provenance (what is open,
 *    why excluded, source + date) — enough to decide whether to double-click;
 *  - clinician can correct/override a status with evidence (trust building);
 *  - actively-enrolled patients render inline in PURPLE (former Page 5 removed);
 *  - click candidate row → Page 4; click purple row → follow-up view (Page 6).
 * Data: GET /api/patients. PRD: §13 Page 3 (v1.1 block), §16, §24.5.
 */
