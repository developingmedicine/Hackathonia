# Hackathonia — AI Clinical Trial Enrollment Copilot

Anthropic Hackathon build (Jul 18, 2026). Full spec: [PRD.md](PRD.md).

> A clinician-guided enrollment copilot that turns protocol criteria, clinician
> expertise, and patient evidence into a reusable screening workflow.

**Team:** Holly (product + all engineering) · Jae (clinical design + synthetic data + mock audio)

Every file below currently contains only a header comment describing its
responsibility and the PRD sections it implements — no code yet (hackathon
rule: code must be written fresh on the day).

## Repository structure

```text
/
├── PRD.md                      Full product requirements (source of truth)
│
├── frontend/                   Next.js + TypeScript + Tailwind  [Holly]
│   ├── app/
│   │   ├── layout.tsx                      App shell + nav
│   │   ├── page.tsx                        Redirect → /trials
│   │   ├── trials/page.tsx                 PAGE 1 Trial Explorer
│   │   ├── trials/[trialId]/page.tsx       PAGE 2 Trial Intelligence + voice intake
│   │   ├── patients/page.tsx               PAGE 3 Screening Queue
│   │   ├── patients/[patientId]/page.tsx   PAGE 4 Eligibility Review
│   │   ├── participants/page.tsx           PAGE 5 Active Participants
│   │   └── participants/[patientId]/follow-up/page.tsx  PAGE 6 Follow-up + AE extraction
│   ├── components/             13 UI components (queue table, status badge,
│   │                           voice recorder w/ demo fallback, evidence, …)
│   ├── lib/                    api client · status vocab/colors · demo helpers
│   └── types/index.ts          Frontend types (PRD §28)
│
├── backend/                    FastAPI + Pydantic  [Holly]
│   ├── main.py                 App assembly, CORS, seeded-data startup
│   ├── models/                 Data contracts: patient §18 · trial §19 ·
│   │                           criterion §20 · knowledge §21 · screening §22 ·
│   │                           adverse_event §23
│   ├── routes/                 HTTP layer, endpoints per PRD §24
│   └── services/               clinical_trials_api · protocol_parser ·
│                               knowledge_engine · screening_engine ·
│                               evidence_resolver · workup_generator ·
│                               adverse_event_engine · claude_client ·
│                               transcription · storage   (PRD §26–27)
│
├── data/                       Seeded demo data  [SHARED — see table below]
│   ├── patients.json           8–12 synthetic patients          [JAE writes]
│   ├── trials.json             Cached CT.gov trials             [Holly]
│   ├── criteria.json           Parsed criteria (primary trial)  [Holly → JAE reviews]
│   ├── clinician_knowledge.json Structured guidance             [Holly, from Jae's script]
│   ├── screenings_cache.json   Cached results for demo (§38)    [Holly]
│   ├── transcripts/            Two mock voice scripts           [JAE]
│   └── audio/                  Two recordings                   [JAE]
│
└── scripts/                    [Holly builds]
    ├── import_patients.py      Load Jae's patients.json into the app
    ├── validate_patients.py    §30 validation gate — JAE runs this on his data
    └── seed_demo.py            One-command demo reset (§38)
```

## Who works where

### Jae — your files

| File | What to do | PRD |
|---|---|---|
| `data/patients.json` | Author 8–12 synthetic patients covering the 12 archetypes; each needs `scenario_metadata` ground truth | §17, §18 |
| `data/transcripts/clinician_intake.txt` | Finalize the Page 2 clinician voice script (draft inside) | §25.1 |
| `data/transcripts/patient_follow_up.txt` | Finalize the Page 6 patient voice script (draft inside) | §25.2 |
| `data/audio/` | Record both scripts (mp3/m4a) | §25 |
| `data/criteria.json` | **Review only** — check Holly's parsed criteria for clinical accuracy | §34 |
| `scripts/validate_patients.py` | **Run only** — `python scripts/validate_patients.py` before handing off patients | §30 |

### Holly — your files

Everything under `frontend/`, `backend/`, `scripts/`, plus generating
`data/trials.json`, `data/criteria.json`, `data/clinician_knowledge.json`,
`data/screenings_cache.json`.

### Merge rule (PRD §34)

Any schema change must update **all five together**: PRD · `backend/models/` ·
`frontend/types/index.ts` · `scripts/validate_patients.py` · sample JSON.

## Honesty rules

Synthetic patients only — no real patient data, no PHI (§17.1). All outputs
framed as clinician-reviewed decision support, never autonomous eligibility
decisions (§31, §44).
