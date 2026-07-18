# Changelog

## v1.1 — Jul 18, 2026 (applying Jae's Jul 17 clinical review)

PRD is long — this is the short list of what changed. Every change is also
marked inline in [PRD.md](PRD.md) with a `v1.1 update` block.

### Page 2 — Trial Intelligence
- Reframed: the clinician is **not** the trial designer — they add context and
  insight to *existing* criteria, never create new ones.
- Layout: existing criteria stay first on the LEFT (preserved); recording stays
  RIGHT; **Extracted Guidance moves to the LEFT column** under the criteria →
  criteria + guidance become one iterable unit.

### Page 3 — Screening Queue
- **Hover tooltips** on every status chip: high-level summary + provenance
  (what's open, why excluded, source + date) — enough context to decide whether
  to double-click into the detail page.
- Clinician can **correct/override** a system status with evidence (e.g.
  "Michael Lee does not actually have a pancreatitis history").
- **Enrolled patients now render inline in this queue in PURPLE** — at least
  one purple patient in the demo. Clicking a purple row opens the follow-up view.
- Match score confirmed: keep it (useful for rank-ordering outreach).

### Page 4 — Eligibility Review
- **Two-column layout**: LEFT = criterion + status; RIGHT = evidence as
  citations (verbatim text · source · date).
- **Summary moves to the top** of the page; work-up checklist moves up too.

### Page 5 — Active Participants
- **Removed as a separate page.** Merged into Page 3 via the purple status.
  (It disrupted the clinician's normal patient-list workflow.)

### Page 6 — Follow-up
- Now does **disqualification surveillance**, not just AE extraction:
  - **Nathan (with audio):** AE extraction demo as before.
  - **Maya Patel (no audio, quick talk-through):** transcript reveals a
    pancreatitis hospitalization + prohibited medication → system automatically
    re-screens against the trial's exclusion criteria → surfaces the AE **and**
    flips her to disqualified, with exact transcript quotes as the chain of
    evidence. Her Page 3 row updates automatically. Real-time surveillance.

### Data strategy (§17.1)
- Patient cohort now **derived from the organizer-provided synthetic EHR
  dataset** (25 patients, JSON + JSONL) instead of hand-authored from scratch.
  An agent edits selected patients to fit the trial; Jae curates and validates
  clinical plausibility. §18 schema stays as the app-facing contract
  (Jae-reviewed: close to SNOMED-style real data).

### Repo skeleton updated to match
- `frontend/app/participants/` deleted; follow-up route moved to
  `frontend/app/patients/[patientId]/follow-up/`.
- `ParticipantCard` component removed; `StatusTooltip` component added.
- Backend `follow_up` route / `adverse_event_engine` / `screening_engine`
  docs now include the auto re-screen (disqualification) responsibility.
- `JAE_TODO.md` §1 updated for the organizer-dataset workflow.
