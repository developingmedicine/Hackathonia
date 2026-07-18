# Holly — Frontend Handoff from Jae

## ✅ Done (thanks!)
- Repoint to `data/clinician_knowledge.json` + screener executing triggers from file.

## ⏳ Still open
- [frontend/lib/data.ts:591](frontend/lib/data.ts#L591) — `patientName: "Margaret Davis"`
  should be **"Mark Davis"** (pt_011 is male to match Jae's voice recording; the
  data is already correct).

---

# Answers to your 5 questions

### 1. `priority_adjustment: -15` → apply it as a **real score delta**
Subtract 15 from the base match score when the trigger fires (David Lee **68 → 53,
NEEDS REVIEW**). This is deterministic, so §38 demo stability holds.
**Important:** seed the ground-truth score as the *base/clean* clinical score —
the screener applies −15 **on top**. Don't pre-bake the penalty into the seed or
it double-counts. Ideal UI: "base 68 · clinician flag −15 → 53".

### 2. ICD-10 matching → **prefix-aware is correct, keep it**
Confirmed necessary: pt_007's chart code is `K81.9` and must match `K81`. I've now
made the contract explicit in the data — each `conditions.code` group carries
`"match": "prefix"`. Please read that field rather than hardcoding prefix behavior.

### 3. AUD codes → expanded to **F10.1, F10.2, F10.9**
Added F10.9 (unspecified use disorder — common coding for "AUD"). Excludes F10.0
(acute intoxication — single episode, not chronic pancreatitis signal). Prefix
matching covers all subcodes. `drinks_per_week ≥ 5` remains the catch-all.

### 4. `effect.action` → `flag_for_review` is the **only** action
That's the whole clinician instruction: no auto-exclusion, review required. Your
rendering (NEEDS REVIEW + `requires_human_confirmation` → "do not auto-exclude")
is exactly right. No other actions for this trial.

### 5. More rules → **none planned for the demo**
This pancreatitis-risk rule is the clinician-knowledge showcase. Your array-loop
handles it. No new trigger fields/operators beyond `>=` and prefix-aware `in`.

---

# ⚠️ Data changed — re-pull `data/clinician_knowledge.json`

I fixed a coding bug and broadened the biliary set (Jae's clinical review):
- **Cholangitis was mis-coded** `K83.1` (bile-duct obstruction) → now `K83`
  (covers cholangitis K83.0, obstruction K83.1, biliary dilatation K83.8).
- Biliary set broadened to prefix categories: **K80** (gallstones,
  choledocholithiasis, biliary colic), **K81** (cholecystitis), **K83** (duct
  disease). K82 excluded by design (gallbladder-wall pathology, not a
  pancreatitis mechanism).
- Each `conditions.code` group now has `"match": "prefix"`.

Simulated against the cohort: flags exactly **pt_006** (alcohol 8/wk) and
**pt_007** (K81.9 via K81 prefix) — no false positives.
