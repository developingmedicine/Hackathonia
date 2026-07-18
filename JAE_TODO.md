# Jae — Your To-Do List

Everything you own lives in the **`data/`** folder. Four deliverables, one review.

---

## 1. `data/patients.json` — ⭐ your main task

Author **8–12 synthetic patients** (no real patient info, no PHI). Follow the
canonical patient JSON template in **[PRD.md §18](PRD.md)** — it contains a
complete example patient (Nathan Chen) you can copy as a starting point.

The cohort needs to cover these archetypes (PRD §17.4):

1. Clear match
2. Clear exclusion
3. Missing smoking history
4. Expired/missing lab result
5. Borderline numeric criterion (e.g., BMI right at the cutoff)
6. Subjective disease-severity note
7. Pancreatitis risk from alcohol-use history
8. Gallbladder disease risk
9. High dropout/tolerance concern
10. Already-enrolled participant
11. Mild adverse-event scenario
12. Escalation-worthy adverse-event scenario

Each patient must include `scenario_metadata` (archetype, expected outcome,
ground-truth notes) — that's how we verify the engine gets the right answer
during the demo.

**Before handing off, run:**

```bash
python scripts/validate_patients.py
```

(Holly will have this built — it checks schema, duplicate IDs, missing ground
truth, accidental PHI, etc.)

---

## 2. `data/transcripts/clinician_intake.txt` — Page 2 clinician voice script

A draft is already in the file. Revise freely, but keep four elements:

- [ ] a protocol-related risk factor
- [ ] an instruction **not** to auto-exclude
- [ ] an instruction to flag for physician review
- [ ] a priority adjustment

(PRD §25.1)

---

## 3. `data/transcripts/patient_follow_up.txt` — Page 6 patient voice script

Draft also in the file. Must mention:

- [ ] medication timing
- [ ] nausea
- [ ] vomiting
- [ ] frequency
- [ ] hydration / oral intake
- [ ] impact on daily activity

(PRD §25.2)

---

## 4. `data/audio/` — record both scripts

Record yourself reading the two finalized scripts (mp3 or m4a), drop them in
this folder as:

- `clinician_intake.mp3`
- `patient_follow_up.mp3`

Don't stress about quality — the app has a "Use Demo Transcript" fallback, so
the demo works even without audio.

---

## Review-only (no writing needed)

- `data/criteria.json` — once Holly generates the parsed eligibility criteria,
  sanity-check them for clinical accuracy.

---

Everything else (`frontend/`, `backend/`, `scripts/`, the other JSONs) is on
Holly. Full spec: [PRD.md](PRD.md) — **§17–18** are the sections most relevant
to you.
