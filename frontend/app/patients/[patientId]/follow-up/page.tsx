/**
 * PAGE 6 — Follow-up Visit, AE Extraction & Disqualification Surveillance.
 * Entered by clicking a purple (enrolled) patient in the Page 3 queue (v1.1).
 * Scenario 1 — Nathan (with audio): extract AEs (symptom, timing, frequency,
 *   severity, confidence) → Confirm / Edit / Save.
 * Scenario 2 — Maya (no audio, v1.1): transcript reveals pancreatitis
 *   hospitalization + prohibited med → system auto re-screens against the
 *   trial exclusion criteria → shows AE + DISQUALIFIED status with verbatim
 *   transcript quotes as evidence; her Page 3 row flips automatically.
 * Data: POST /api/patients/{id}/follow-up. PRD: §13 Page 6 (v1.1), §23, §24.11, §25.2.
 */
