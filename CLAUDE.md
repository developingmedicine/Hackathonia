# Beacon — Clinical Trial Enrollment Copilot (Hackathonia)

Anthropic hackathon build (Jul 18, 2026). Team: **Holly** (product + all engineering) ·
**Jae** (clinical design, synthetic cohort, mock voice — GitHub: developingmedicine).
Full spec: [PRD.md](PRD.md) (v1.1). Jae's deliverables checklist: [JAE_TODO.md](JAE_TODO.md).

> A clinician-guided enrollment copilot that turns protocol criteria, clinician
> expertise, and patient evidence into a reusable screening workflow — with
> real-time disqualification surveillance from follow-up conversations.

## Hard rules

- **Synthetic data only, no PHI.** Never add real patient data.
- **Never rig a demo dishonestly.** Deterministic screening is genuinely computed;
  live Claude output is labeled "Live Claude extraction"; seeded fallbacks are
  labeled "Seeded result (offline fallback)". Keep those labels truthful.
- **Everything is clinician-reviewed decision support** — the system never
  diagnoses or disqualifies autonomously; UI copy must preserve this framing.
- **Never commit `frontend/.env.local`** (holds `ANTHROPIC_API_KEY`; gitignored).

## Running

```bash
cd frontend && npm install && npm run dev   # http://localhost:3000
cp frontend/.env.local.example frontend/.env.local  # then paste real key → enables live AI
```

- Port 3000 is sometimes occupied by stale dev servers from other projects
  (`pearl-website2`, `glioma-copilot`) — `lsof -nP -iTCP:3000 -sTCP:LISTEN` and kill.
- **Never run `npm run build` while `next dev` is running** — both write `.next/`
  and corrupt it (symptom: `Cannot find module './53.js'`). Fix:
  `rm -rf frontend/.next` and restart dev.
- Without an API key everything still works via seeded fallbacks (PRD §38).

## Architecture (what's real vs seeded)

**Frontend**: Next.js 15 + TypeScript + Tailwind v4, five pages (v1.1: former
Page 5 merged into Page 3):

| Route | Page |
|---|---|
| `/trials` | 1 — Trial Explorer (primary trial highlighted) |
| `/trials/[trialId]` | 2 — criteria (left, read-only) + voice → transcript → **live Claude knowledge extraction** (guidance renders LEFT, under criteria) |
| `/patients` | 3 — queue: status tooltips w/ provenance, purple = enrolled inline, fixed-width badge/score columns |
| `/patients/[patientId]` | 4 — summary on TOP, work-up high, two-column criterion/evidence table |
| `/patients/[patientId]/follow-up` | 6 — typing animation → **live Claude AE extraction + disqualification surveillance**; transcript editable + "Re-extract with Claude" |

**Data** (`frontend/lib/data.ts`): imports Jae's delivered files directly —
`data/patients.json` (12 patients, PRD §18 schema, `scenario_metadata` = clinical
ground truth), `data/criteria.json` (real trial **NCT07589608**, Lilly
macupatide/eloralintide; 10 base criteria) and `data/clinician_knowledge.json`
(bare array of knowledge rules — knowledge_001 alcohol/biliary pancreatitis-risk,
split out per PRD §21). Contains a
**deterministic mini-screener** (BMI incl. ≥27+comorbidity branch, ICD-10 checks
for T2DM/CV/pancreatitis, pulse bounds, gallbladder window, stale-LFT missing
data) with verbatim chart evidence. Knowledge rules are **data-driven**: it
executes each rule's `trigger.any` from `clinician_knowledge.json` (drinks/wk
≥ threshold; `in` over `conditions.code` is ICD-10 prefix-aware, so "K81"
matches pt_007's K81.9) — flag-for-review only, never auto-exclude; queue
scores stay seeded (§38), `priority_adjustment` surfaces in the note text. Overall queue
status is seeded from Jae's ground truth (§38 demo stability); note-interpretation
criteria show NEEDS REVIEW.

**Live AI** (`frontend/app/api/*`, Anthropic SDK, model `claude-opus-4-8`,
structured JSON output via `output_config.format`, adaptive thinking, effort low):
- `POST /api/follow-up` — transcript → AEs + escalation + exclusion-criteria
  re-screen (returns `disqualification` w/ verbatim evidence). Verified: the
  pancreatitis transcript flags exc_006; a benign edited transcript doesn't.
- `POST /api/knowledge` — clinician voice text → annotated criterion + rule bullets.
- Both catch all errors → seeded fallback from `lib/data.ts` with `source:"seeded"`.

**Demo state** (`frontend/lib/demo.ts`): localStorage status overrides — confirming
Elizabeth's disqualification flips her Page 3 row to Excluded; header "Reset demo"
clears everything (PRD §38).

**Audio**: Jae's real recordings in `frontend/public/audio/`
(`clinician-context.m4a` = Page 2; `adverse-effect.m4a` = Mark Davis pt_011,
NOT Christopher — per Jae's delivery notes; transcript text matches his script verbatim).

**Design system**: Abridge-inspired — cream canvas `#f6f3ee`, ink text, sage
avatar circles, lavender = AI content, brand red `#e0311d` for voice, borderless
rounded-3xl white cards, pill buttons, DM Sans. Tokens in `app/globals.css`
(`@theme`); status vocab + colors single-sourced in `lib/status.ts` (PRD §16).

**Backend `backend/` + `scripts/`**: docstring-only skeletons (FastAPI plan,
PRD §24–27) — not implemented; the Next.js API routes serve the demo instead.

## Demo flow (~3 min)

1. `/trials` → open NCT07589608 → Page 2: "Use Demo Audio" (plays Jae's voice,
   transcript types out) → Apply → live Claude turns speech into rules (left column)
2. Screen cohort → Page 3: hover tooltips (provenance), 12 real patients
3. Click Nathan (pt_001) → Page 4 two-column evidence review
4. Click purple Mark (pt_011) → audio + live AE extraction + escalation panel
5. Click purple Elizabeth (pt_009) → transcript reveals pancreatitis → Claude
   auto-flags exc_006 disqualification w/ quote → Confirm → queue updates.
   **Wow move**: edit the transcript live, "Re-extract with Claude" — output changes.

## Key demo patients

| id | name | beat |
|---|---|---|
| pt_001 | Nathan Chen | clean match, 96%, evidence review |
| pt_005 | Jennifer Martinez | borderline BMI 27.2 (comorbidity branch) |
| pt_006 | David Lee | 8 drinks/wk → clinician knowledge flag |
| pt_008 | Robert Brown | HR 52 → exc_007 exclusion |
| pt_009 | Elizabeth Garcia | **disqualification surveillance beat** |
| pt_011 | Mark Davis | severe AE + escalation, has Jae's audio |

## Merge rule (PRD §34)

Any schema change updates together: PRD · `frontend/types/index.ts` ·
`data/*.json` samples · (future) backend models + validate script.
