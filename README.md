# Beacon — Clinical Trial Enrollment Copilot

**Anthropic Hackathon build · Jul 18, 2026**

> A clinician-guided enrollment copilot that turns protocol criteria, clinician
> expertise, and patient evidence into a **reusable screening workflow** — then
> keeps watching enrolled patients, surfacing disqualifying events from routine
> follow-up conversations before they slip through.

Beacon is decision support, not automation: it screens, explains, and flags —
but a clinician confirms every status change. Nothing is diagnosed or
disqualified autonomously.

---

## The problem

Screening patients for a clinical trial is slow, manual, and lossy:

- **Eligibility is buried** in dense protocols and scattered across the chart —
  BMI trends, ICD-10 codes, labs, vitals, free-text notes.
- **Clinician expertise doesn't persist.** A trial physician knows "watch alcohol
  and biliary disease for pancreatitis risk on a GLP-1" — but that judgment lives
  in their head, re-applied ad hoc, patient by patient.
- **Disqualifying events after enrollment get missed.** A participant mentions a
  hospitalization in a routine check-in; unless someone connects it back to an
  exclusion criterion, they stay enrolled when they shouldn't.

## What Beacon does

Beacon turns a one-time screening effort into a durable, auditable workflow:

1. **Parse the protocol** into structured, evaluable criteria — labeling each as a
   deterministic **Rule** (BMI ≥30, pulse 60–100, ICD-10 exclusions) or a
   **Judgement** call that needs note interpretation ("poorly controlled"
   hypertension, "symptomatic" gallbladder disease).
2. **Capture clinician knowledge by voice.** The trial physician speaks a caveat
   once ("flag heavy drinkers and biliary disease for pancreatitis review — don't
   auto-exclude"); Beacon turns it into a reusable rule that re-screens the whole
   cohort and adjusts match scores.
3. **Screen the cohort** deterministically against the real chart, with every
   decision backed by **verbatim evidence** from the record.
4. **Surveil follow-ups.** Live transcription + extraction pulls adverse events
   from a check-in conversation, and re-screens the transcript against the trial's
   exclusion criteria — auto-flagging a disqualification with the patient's own
   words as evidence, for the clinician to confirm.

The throughline of the demo: the pancreatitis risk the physician voice-captured
at screening plays out as a real on-trial adverse event — and Beacon catches it.

---

## Key features

| Feature | What it does |
|---|---|
| **Live protocol search** | Debounced ClinicalTrials.gov v2 search — screen against any real trial (cancer, psoriasis, obesity…) |
| **Voice → clinician knowledge** | Real mic capture (Whisper STT) → Claude turns spoken caveats into structured, cohort-wide screening rules |
| **Deterministic screener** | BMI (incl. ≥27 + comorbidity branch), weight-stability, ICD-10 exclusions, pulse bounds, stale-lab detection — evidence quoted verbatim |
| **Match vs Enriched scores** | Base protocol match score, then a real delta when clinician knowledge fires (e.g. 68 → 53, flag for review) |
| **Ask Beacon — cohort search** | Natural-language questions over the whole cohort (AEs + follow-up transcripts); every match returns verbatim evidence, IDs validated server-side |
| **AE extraction + disqualification surveillance** | Follow-up transcript → adverse events, actionable insights, escalation, and exclusion re-screen — with a signable anti-emetic order and same-day scheduling |
| **Human-in-the-loop everywhere** | The system flags; the clinician confirms. Status changes require explicit confirmation and are attributed + timestamped |
| **Model benchmark** | A `/benchmark` page + eval harness measuring extraction accuracy against a hand-labeled ground-truth set |

---

## Honesty: what's real vs seeded

We do not rig the demo. Labels in the UI are truthful:

- **Genuinely computed live:** deterministic screening, ClinicalTrials.gov search,
  and — with an API key — Claude extraction (knowledge, AE, cohort) and Whisper
  transcription. These are labeled **"Live Claude extraction"** / **"Live
  transcription · OpenAI Whisper."**
- **Seeded fallback:** with no API key / mic / network, every feature still works
  from hand-checked seeded results, labeled **"Seeded result (offline fallback)."**
- **Deterministic-by-design:** overall queue status is anchored to clinician
  ground truth for demo stability — but the criterion-level screening underneath
  is really executed against the patient records.

**Synthetic data only. No real patient data, ever, no PHI.**

---

## Demo flow (~3 min)

1. **`/trials`** → open the primary trial (NCT07589608) → **Page 2**: play the
   clinician voice note → Claude turns speech into screening rules (rendered left,
   under the criteria) → **Apply to Screening Logic**.
2. **`/patients`** → screen the cohort. Hover status tooltips for provenance;
   affected rows now show the Match → Enriched score shift. Try **Ask Beacon** for
   natural-language cohort questions.
3. Click **Nathan Chen** → **Page 4** two-column criterion / evidence review.
4. Click **Mark Davis** → live AE extraction + escalation panel (signable order,
   same-day booking).
5. Click **Elizabeth Garcia** → her follow-up reveals acute pancreatitis after a
   birthday-party alcohol binge → Beacon auto-flags the **exc_006** disqualification
   with her quote → **Confirm** → the queue updates.
   **Wow move:** edit the transcript live, re-extract, and watch the output change.

### The demo cohort

12 synthetic patients, each a deliberate archetype with `scenario_metadata`
ground truth:

| Patient | Beat |
|---|---|
| Nathan Chen | Clean match, evidence review |
| Michael Torres | Clear exclusion (T2DM) + weight-instability not-met |
| Jennifer Martinez | Borderline BMI 27.2 (comorbidity branch) |
| David Lee | 8 drinks/wk → clinician-knowledge pancreatitis flag |
| Patricia Johnson | Prior cholecystitis → biliary-disease flag |
| Robert Brown | Bradycardia (HR 52) → pulse exclusion |
| Mark Davis | Severe adverse event + escalation (has real audio) |
| Elizabeth Garcia | **Disqualification-surveillance beat** — on-trial pancreatitis |

*(plus missing-data, expired-lab, mild-AE, and subjective-severity archetypes)*

---

## Architecture

**Frontend + serving layer:** Next.js 15 · TypeScript · Tailwind v4. The demo is
served by **Next.js API routes** (`frontend/app/api/*`) backed by the Anthropic
SDK (`claude-opus-4-8`, structured JSON output) and OpenAI Whisper for STT. Every
route catches errors and degrades to a seeded fallback.

| Route | Purpose |
|---|---|
| `/api/knowledge` | Clinician voice → annotated criterion + reusable rule |
| `/api/follow-up` | Transcript → AEs, insights, escalation, exclusion re-screen |
| `/api/cohort` | Natural-language cohort search with verbatim, ID-validated evidence |
| `/api/transcribe` | Real mic recording → Whisper transcription |
| `/api/trials`, `/api/trials/[nctId]` | Live ClinicalTrials.gov v2 proxy |

**Data** (`data/`): the synthetic cohort (`patients.json`), the real primary trial
criteria (`criteria.json`, NCT07589608 — a sub-study of Master Protocol
NCT06143956), and the voice-captured clinician rules (`clinician_knowledge.json`).
The frontend's deterministic screener runs directly over these records.

**Design system:** Abridge-inspired — cream canvas, sage accents, lavender for
AI-generated content, brand red for voice. Borderless rounded cards, DM Sans.

> `backend/` (FastAPI) and `scripts/` are documented design skeletons of the
> production shape; the Next.js API routes serve the live demo.

---

## Running it

```bash
cd frontend && npm install && npm run dev   # → http://localhost:3000
```

Everything works out of the box via seeded fallbacks. To enable live AI:

```bash
cp frontend/.env.local.example frontend/.env.local
# add ANTHROPIC_API_KEY (live extraction) and OPENAI_API_KEY (Whisper STT)
```

---

## Team

- **Holly** — product + all engineering
- **Jae** — clinical design, synthetic cohort, mock voice ([@developingmedicine](https://github.com/developingmedicine))

Full product spec: [PRD.md](PRD.md).
