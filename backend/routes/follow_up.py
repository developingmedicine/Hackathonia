"""
POST /api/patients/{patient_id}/follow-up — submit visit transcript, return
detected adverse events + recommended action (§24.11).
v1.1: response additionally includes eligibility_impact — the transcript is
auto re-screened against the enrolled trial's exclusion criteria; if violated,
the patient's trial status flips to disqualified (with transcript evidence)
and the Page 3 queue reflects it. Real-time surveillance, no manual step.
"""
