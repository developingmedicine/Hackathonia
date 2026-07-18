# Jae — Your To-Do List

Everything you own lives in the **`data/`** folder. Four deliverables, one review.

**Status:** Phase 1 (Patient Cohort + Mock Voice) ✅ **COMPLETE** (Jul 18, 2026)

---

## 1. `data/patients.json` — ⭐ your main task

✅ **COMPLETE** (Jul 18, 2026)

**Deliverable:** 12 synthetic patients, all archetypes covered, validated against trial criteria

- ✅ **Clear match:** Nathan Chen (BMI 32.4, no exclusions, enrollment-ready)
- ✅ **Clear exclusion:** Michael Torres (Type 2 diabetes)
- ✅ **Missing smoking history:** Sarah Williams (status unknown, cardiovascular risk)
- ✅ **Expired/missing lab:** James Patterson (liver function tests 6+ months old)
- ✅ **Borderline numeric:** Jennifer Martinez (BMI 27.2 with comorbidity qualification)
- ✅ **Subjective disease severity:** William Anderson (dyslipidemia + obesity)
- ✅ **Pancreatitis risk (alcohol):** David Lee (8 drinks/week, triggers clinician knowledge)
- ✅ **Gallbladder disease risk:** Patricia Johnson (prior cholecystitis, triggers clinician knowledge)
- ✅ **High dropout concern:** Robert Brown (bradycardia, HR 52 bpm, confirmed exclusion)
- ✅ **Already-enrolled participant:** Elizabeth Garcia (week 2, active)
- ✅ **Mild adverse event:** Christopher Rodriguez (nausea, week 3, managed)
- ✅ **Escalation adverse event:** Mark Davis (severe nausea/vomiting/dehydration, week 4)

**Validation:** All 12 patients pass schema, scenario_metadata, and trial criteria checks. Cohort is demo-ready.

---

## 2. `data/transcripts/clinician_intake.txt` — Page 2 clinician voice script

✅ **COMPLETE** (Jul 18, 2026)

**Script:** "Flag heavy drinkers—more than 5 drinks weekly or alcohol-use disorder codes—and active biliary disease: cholecystitis, choledocholithiasis, cholangitis. Don't auto-exclude them. Review required, lower priority."

**Validation checklist:**
- ✅ Protocol-related risk factor (pancreatitis risk from alcohol/biliary disease)
- ✅ Instruction not to auto-exclude (explicit: "Don't auto-exclude them")
- ✅ Instruction to flag for physician review ("Review required")
- ✅ Priority adjustment ("lower priority")

**Recorded:** Jul 18, 2026 | Audio: `data/audio/Added Context.m4a`

---

## 3. `data/transcripts/patient_follow_up.txt` — Page 6 patient voice script

✅ **COMPLETE** (Jul 18, 2026)

**Script:** "I've been on the study drug for three weeks now. Yeah, lots of nausea—worst in the mornings, pretty much every day. Actually threw up a couple times this week. I can drink water, eat a bit, but it's really affecting my work. Not sure how much longer I can keep going like this."

**Validation checklist:**
- ✅ Medication timing ("three weeks now," "most mornings," "twice this week")
- ✅ Nausea ("lots of nausea," "worst in the mornings")
- ✅ Vomiting ("threw up a couple times this week")
- ✅ Frequency ("pretty much every day," "couple times this week")
- ✅ Hydration/oral intake ("drink water," "eat a bit")
- ✅ Impact on daily activity ("affecting my work," severity escalation hint)

**Recorded:** Jul 18, 2026 | Audio: `data/audio/Adverse effect.m4a` | Patient: Mark Davis (pt_011)

---

## 4. `data/audio/` — both scripts recorded

✅ **COMPLETE** (Jul 18, 2026)

- ✅ `data/audio/Added Context.m4a` — Page 2 clinician voice
- ✅ `data/audio/Adverse effect.m4a` — Page 6 patient voice (Mark Davis scenario)

**Note:** ElevenLabs accelerated playback applied for information density within 3-minute demo arc.

---

## Review Phase (Coming Next)

### Pending: `data/criteria.json` clinical review

Once Holly generates the parsed eligibility criteria from NCT07589608, review for clinical accuracy:
- [ ] Inclusion criteria parsing (BMI thresholds, weight stability)
- [ ] Exclusion criteria parsing (diabetes codes, CV event windows, GB disease timing)
- [ ] Clinician knowledge trigger mapping (alcohol ≥5 drinks/week, biliary disease codes)
- [ ] Priority adjustments align with GLP-1 risk profile

---

## Handoff to Holly

**Jae deliverables ready:**
1. ✅ `data/patients.json` — 12 clinically validated patients
2. ✅ `data/transcripts/clinician_intake.txt` — Page 2 script
3. ✅ `data/transcripts/patient_follow_up.txt` — Page 6 script
4. ✅ `data/audio/Added Context.m4a` — Clinician voice recording
5. ✅ `data/audio/Adverse effect.m4a` — Patient voice recording
6. ✅ `data/criteria.json` — Trial criteria + clinician knowledge rules

**Everything else** (`frontend/`, `backend/`, `scripts/`, API contracts, parsing engine) is on Holly. Full spec: [PRD.md](PRD.md).
