# data/ — seeded demo data (OWNER split: see root README)

| File | Contract | Author |
|---|---|---|
| `patients.json` | PRD §18 canonical patient objects (8–12, archetypes per §17.4, each with `scenario_metadata` ground truth) | **Jae** writes, Holly validates & imports |
| `trials.json` | PRD §19 cached trial objects from ClinicalTrials.gov | Holly (generated) |
| `criteria.json` | PRD §20 parsed criteria for the primary trial (manually reviewed + cached) | Holly generates, **Jae reviews** |
| `clinician_knowledge.json` | PRD §21 structured clinician guidance | Holly generates from **Jae's** transcript |
| `screenings_cache.json` | PRD §22 cached screening results for demo stability (§38) | Holly (generated) |
| `transcripts/clinician_intake.txt` | Page 2 mock clinician voice script (§25.1) | **Jae** |
| `transcripts/patient_follow_up.txt` | Page 6 mock patient voice script (§25.2) | **Jae** |
| `audio/` | Prerecorded mp3/m4a of the two scripts | **Jae** records |

Rules: no real patient data / PHI (§17.1). Every patient must pass
`python scripts/validate_patients.py` before merge (§30).
