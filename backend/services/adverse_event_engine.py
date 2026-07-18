"""
Adverse-event extractor: follow-up transcript → §23 events (symptom, timing,
frequency, severity, confidence, verbatim supporting_text), escalation flag.
v1.1: after extraction, hand events to screening_engine to check them against
the enrolled trial's exclusion criteria → disqualification finding with
transcript quotes as chain of evidence (Maya scenario). Everything still
requires clinician confirmation.
"""
