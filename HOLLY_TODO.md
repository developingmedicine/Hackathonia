# Holly — Frontend Handoff from Jae

## ✅ Done (thanks!)
- Repoint to `data/clinician_knowledge.json` + screener executing triggers from file.

## 💬 Answer to your chips question
> "Was your feedback #2 (fixed), or did you also want the chips in #1 hidden/renamed?"

**Keep the chips visible pre-Apply — following your recommendation.** Agreed they're
properties of the parsed protocol, not the clinician layer, so they belong on screen
before Apply. No hide/rename needed; #2 was the only fix.

## ⏳ Still open
- [frontend/lib/data.ts:591](frontend/lib/data.ts#L591) — `patientName: "Margaret Davis"`
  should be **"Mark Davis"** (pt_011 is male to match Jae's voice recording; the
  data is already correct).
- **Sync pt_009 (Elizabeth Garcia) follow-up transcript to Jae's canonical version.**
  Jae recorded a new two-turn dialogue — canonical script now lives at
  `data/transcripts/garcia_pancreatitis_follow_up.txt` (audio recording pending;
  Holly voicing Garcia). Replace the current `FOLLOWUPS.pt_009.transcript` in
  [data.ts:752](frontend/lib/data.ts#L752) with it verbatim:
  > CLINICIAN: Hi Mrs. Garcia, how are you feeling? I know you're here for follow
  > up after you were hospitalized last week.
  > PATIENT: Yeah, so doc my cousin was celebrating her 50th birthday and I guess
  > we just went a little too hard on the wine, I ended up in the hospital with
  > pancreatitis.

  Notes: drop the "new medication started in hospital" thread (not in Jae's
  script); the **alcohol/binge cause is new** — worth surfacing in events/insights
  (ties to the clinician-knowledge pancreatitis-risk rule). The **exc_006
  disqualification beat still holds** ("...with pancreatitis"), so the existing
  human-in-the-loop disqualification flow works unchanged.

---

# 🐛 Bug: "Mark Enrollment Ready" doesn't persist to the queue

Jae: clicking **Mark Enrollment Ready** (and presumably Exclude / Keep Under
Review) on the patient detail page shows a confirmation, but going back to the
patient list still shows the **old** status flag.

**Root cause (found, not fixed — leaving to you):**
[frontend/app/patients/[patientId]/page.tsx:39](frontend/app/patients/[patientId]/page.tsx#L39)
— `act()` only calls `setBanner("… — recorded (demo state)")`. It sets a local
banner string and never updates the patient's actual status, so the queue reads
the unchanged flag on return. The three action buttons (Mark Ready / Exclude /
Keep Under Review, lines ~97/103/109) all route through this no-op `act()`.

**Fix direction:** persist the status change to shared state so the queue
reflects it — e.g. lift status into a shared store/context, or write it through
the same data source the queue reads. Should survive navigating detail → list.

---

# 🎯 Patient Queue — split match score into Match vs Enriched (Jae's demo review)

The queue's score column is currently unlabeled and single-value. Make the
clinician-knowledge effect visible at a glance across the whole queue.

### 1. Label it & fix terminology
Give the column(s) a header. **It's a match score (PRD §22 `match_score`), NOT
"confidence"** — don't reuse the AE-panel "Confidence" wording here; different
concept. Header the two columns **"Match"** and **"Enriched"**.

### 2. Two columns: Match (protocol-only) vs Enriched (+ clinician knowledge)
- **Match** = base score from the parsed protocol alone.
- **Enriched** = score after clinician-knowledge adjustments (e.g. the −15
  pancreatitis-risk penalty). Data already exists — base = ground-truth seed,
  −15 lives in `data/clinician_knowledge.json`; no data change needed.
- **Empty state:** before any knowledge is added, show an em-dash `—` in the
  Enriched column (keeps the grid aligned; reads better than fully blank).

### 3. Per-row emphasis — NOT global
Only rows whose score actually shifts get the visual treatment: fade the **Match**
value to lighter gray (less important) and emphasize **Enriched**. Rows untouched
by clinician knowledge keep a single clear score — don't fade all 12 just because
knowledge exists. Currently only **pt_006 David Lee** (68→53) and **pt_007
Patricia Johnson** are affected, so only those two should light up.

### 4. Show the delta
Pair the enriched value with a small signed delta (e.g. `53 ▼15`) so the magnitude
of the clinician's impact reads instantly — and so meaning isn't carried by color
alone (accessibility).

---

# 🎯 AE Follow-Up Screen — round 2 (Jae's demo review)

Round 1 looks great. Next pass:

### 1. Move "Escalation required" to the very top
It's the most important section — lead with it (bottom-line-up-front). Extracted
events + insights go below it.

### 2. Merge "Confirm Findings" into "Acknowledge & Escalate"
Findings already auto-save, so a separate Confirm is redundant. **One button
both attests (clinician name + timestamp → elevates AI draft to clinician-
reviewed) and escalates.** Drop the standalone "Confirm Findings."

### 3. Edit button — wire it up (don't remove)
Currently a no-op. Implement inline editing of the extracted events before the
clinician acts. Keep the affordance; make it functional.

### 4. Top rows → two-column table
Actionable insight on the **left**, chain of evidence (the patient quote) on the
**right** — simpler to scan. Render **Confidence** as a small chip next to each
insight so it survives the layout change.

### 5. Cut the duplicative summary
Remove: *"Onset over ~3 weeks of persistent daily nausea…"* and *"Functional
impact on work and sleep suggests severity beyond mild…"* — restates the events
and insights already shown above.

### 6. Automation — signable anti-emetic order
Add an **"Initiate standing order for anti-emetic"** action that lets the
clinician **sign an order** inline. Order text (clinically precise):
**ondansetron 4 mg ODT q8h PRN nausea/vomiting** — note: **ODT** (orally
disintegrating), NOT "SL"; ondansetron has no true sublingual form, and ODT is
the right route for a vomiting patient.

### 7. Automation — smarter same-day scheduling
"Schedule Same-day Visit" should auto-propose the **next available calendar
slot** (simulated for the demo). On user approval, confirm with copy like
*"Your medical assistant has been notified for direct outreach."*

---

# 🎯 AE Follow-Up Screen — round 1 polish (Jae's demo review)

Feedback on the **AI-Extracted Events** panel (Page 6, Mark Davis follow-up).
Goal: maximize clinician flow — fewer clicks, higher signal density, no filler.

### 1. Drop the redundant "notify the physician" framing
On this screen **the logged-in user IS the trial physician** — a "Notify Trial
Physician" button is moot (they're already looking at it). Rework the escalation
CTA so it fits a physician acting on their own patient, e.g. **"Acknowledge &
Escalate"** or route straight to **"Schedule Same-day Visit"** as the primary
action. Don't ask them to notify themselves.

### 2. Cut the low-value insight entirely
Remove: *"Nausea and vomiting are consistent with common GI side effects of
GLP-1-class study medication; relationship to study drug should be confirmed by
clinician."* It's obvious to any clinician and adds no decision value.

### 3. Elevate the two *actionable* insights — more prominent, denser
These are the parts a clinician actually acts on. Give them visual weight
(promote out of the grey footnote text into the main panel, bold the signal):
- **Oral intake maintained** — "can drink water" / "can eat a little bit" →
  dehydration risk lower, but monitor.
- **Dropout / tolerance risk** — functional decline + patient's own uncertainty
  about continuing → flag for clinician review.

Compress the wording; lead with the clinical signal, keep the patient quote as
supporting evidence.

### 4. Auto-save to the participant record (remove the extra click)
Extracted findings should **save to the patient record automatically** for an
auditable trail — don't gate it behind a separate "Save to Participant Record"
click. Fewer clicks = better agent flow. Keep an **Edit** affordance for
corrections, but the default path should persist without manual save.

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
