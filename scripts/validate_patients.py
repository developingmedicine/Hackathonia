"""
Patient validation gate (PRD §30) — run before every merge of patients.json:
schema check, unique patient_id, known status values only, scenario_metadata
required, evidence present for intended outcomes, explicit nulls, date/unit
sanity, contradiction check (intentional ones must be marked grey-zone),
no real names/PHI. OWNER: Holly builds, Jae runs on his data.
"""
