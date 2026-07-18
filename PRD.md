# AI Clinical Trial Enrollment Copilot
## Hackathon Product Requirements Document

**Document version:** v1.1  
**Product owner:** Holly Tang  
**Clinical workflow lead:** Jae  
**Status:** Ready for implementation  
**Scope:** Browser-based hackathon prototype; no EHR integration; synthetic patient data only

> ### v1.1 changelog (Jul 18 — from Jae's clinical review; look for "v1.1 update" blocks)
> 1. **Page 2**: clinician adds context to *existing* criteria (not new criteria); Extracted Guidance moves to the LEFT column next to the criteria.
> 2. **Page 3**: hover tooltips on status colors (actionable context + provenance); clinician can correct/override with evidence; enrolled patients render inline in purple.
> 3. **Page 4**: two-column layout (criterion+status left, evidence citations right); summary moves to the top; work-up checklist moves up.
> 4. **Page 5**: REMOVED as a separate page — merged into Page 3 via purple status.
> 5. **Page 6**: new Maya Patel scenario — follow-up transcript triggers automatic disqualification re-screening (real-time surveillance).
> 6. **§17.1**: patient cohort is now derived from the organizer-provided synthetic EHR dataset (25 patients, JSON/JSONL), agent-edited to fit the trial.

---

## 1. Executive Summary

Clinical trial enrollment is slowed by repetitive protocol review, manual patient screening, missing patient information, and clinical judgment that is rarely captured in a reusable form.

This product is a browser-based AI enrollment copilot that:

1. Retrieves a clinical trial from ClinicalTrials.gov.
2. Parses the protocol into structured inclusion and exclusion criteria.
3. Lets a clinician add trial-specific knowledge through voice.
4. Converts that knowledge into reusable screening guidance.
5. Screens a synthetic patient cohort against the trial.
6. Surfaces potential matches, confirmed exclusions, missing actionable data, and cases requiring clinician review.
7. Generates a criterion-level explanation and work-up checklist.
8. Demonstrates follow-up adverse-event extraction for an enrolled participant.

The hackathon demo will focus on one actively recruiting Lilly-sponsored trial and one clinically believable synthetic patient cohort. The underlying workflow and data contracts will be reusable across additional trials.

---

## 2. One-Liner

> **An AI-powered clinical trial enrollment copilot that turns protocol criteria and clinician expertise into reusable patient screening workflows.**

### Alternate pitch

> **Capture clinical knowledge once, apply it across every patient, and move more candidates from possible match to enrollment-ready.**

---

## 3. Product Vision

Clinical trial recruitment should not depend on clinicians and coordinators repeatedly interpreting the same protocol, manually reviewing every chart, and discarding patients simply because a data point is missing or ambiguous.

The long-term vision is a reusable clinical trial enrollment intelligence layer that combines:

- protocol-defined eligibility rules;
- clinician-authored contextual knowledge;
- patient-level clinical evidence;
- uncertainty and missing-data detection;
- actionable next steps;
- longitudinal trial monitoring.

The hackathon prototype proves the workflow without claiming production readiness, regulatory clearance, or universal clinical coverage.

---

## 4. Problem Statement

Clinical trial enrollment remains slow, manual, and fragmented.

### Current problems

- Eligibility criteria are written in long-form natural language.
- The same protocol must be interpreted repeatedly by investigators and coordinators.
- Important clinical judgment often exists only in a clinician’s head.
- Research teams screen patients one at a time.
- Structured rules alone cannot interpret subjective notes or nuanced risk factors.
- Missing but obtainable information is often treated as a practical exclusion.
- Near-matches are difficult to identify and prioritize.
- Screening decisions are often difficult to audit.
- Once a patient enrolls, adverse-event information may be buried in follow-up conversations.

### Core opportunity

The system should not only answer:

> “Does this patient match?”

It should also answer:

- Why?
- Which exact criterion is satisfied or not satisfied?
- What evidence supports the assessment?
- What information is missing?
- Can that missing information be obtained?
- Does a clinician need to review this case?
- What should happen next?
- Is an enrolled participant reporting a possible adverse event?

---

## 5. Product Goals

### Hackathon goals

1. Demonstrate an end-to-end enrollment workflow.
2. Use one real, recruiting clinical trial as the primary demo.
3. Parse protocol eligibility criteria into structured data.
4. Capture clinician knowledge through mock voice input.
5. Apply one clinician input across an entire patient cohort.
6. Screen clinically believable synthetic patients.
7. Surface clear matches, exclusions, missing data, and grey-zone cases.
8. Provide criterion-level evidence and next actions.
9. Demonstrate adverse-event extraction from a mock follow-up conversation.
10. Deliver a polished, low-click, browser-based experience.

### Success criteria

The demo is successful if a judge can understand, within three minutes:

- who the product is for;
- why the current workflow is inefficient;
- how clinician knowledge changes the screening logic;
- how the same logic is applied across multiple patients;
- why a patient was surfaced;
- what information is missing;
- what action a coordinator or clinician should take next;
- how the same product can support follow-up monitoring.

---

## 6. Non-Goals

The hackathon prototype will **not** include:

- EHR integration;
- Epic, Oracle Health, or SMART on FHIR connectivity;
- real patient records;
- protected health information;
- real payer eligibility verification;
- automated medical decision-making;
- autonomous enrollment;
- production-grade security or compliance;
- regulatory submission workflows;
- site contracting or trial budgeting;
- complete coverage of every trial or disease;
- fully automated adverse-event grading;
- claims that the model replaces a clinician or research coordinator.

---

## 7. Target Users

### Primary users

#### Principal Investigator

Needs to:

- select or configure a trial;
- review parsed criteria;
- add trial-specific clinical guidance;
- identify candidates;
- review ambiguous cases.

#### Clinical Research Coordinator

Needs to:

- review prioritized candidates;
- understand eligibility evidence;
- identify missing information;
- generate outreach or work-up tasks;
- track enrolled participants.

#### Trial Physician or Sub-Investigator

Needs to:

- review clinical judgement cases;
- validate criteria assessments;
- evaluate risk factors;
- assess possible adverse events.

### Secondary users

- treating physicians;
- dermatologists, endocrinologists, and other specialists;
- research nurses;
- clinical trial operations teams.

### Future users

- pharmaceutical sponsors;
- contract research organizations;
- health systems;
- site networks;
- patient recruitment teams.

---

## 8. Primary Demo Scope

### Disease and trial

The primary demo will use:

- one actively recruiting Lilly-sponsored trial;
- a disease area that supports both deterministic criteria and clinician judgement;
- a synthetic patient cohort designed around that trial.

The exact NCT identifier should be inserted once the final trial is confirmed.

```text
Primary Trial ID: TBD
Sponsor: Eli Lilly and Company
Recruitment Status: Recruiting
Primary Disease Area: TBD
Primary Geography: Bay Area, if available
```

### Why one trial

The demo uses one trial to make the story clinically coherent and executable within hackathon constraints.

The system architecture remains protocol-driven:

```text
ClinicalTrials.gov trial
        ↓
Protocol parser
        ↓
Normalized criteria
        ↓
Clinician knowledge
        ↓
Reusable screening workflow
        ↓
Multiple patients
```

No patient-specific screening logic should be hardcoded into the UI.

---

## 9. Product Principles

### 9.1 Browser first

The prototype will be a web application only.

### 9.2 Minimum clicks

The product should surface important information instead of forcing users to search through multiple screens.

### 9.3 Evidence before confidence

Every eligibility assessment should show supporting patient evidence.

### 9.4 Missing is not excluded

Unknown information must be distinguished from a confirmed negative result.

### 9.5 Human review for grey zones

The system should escalate ambiguity rather than fabricate certainty.

### 9.6 Clinician knowledge is reusable

One trial-specific clinician input should influence the screening of every relevant patient.

### 9.7 Synthetic but believable

Synthetic patient records should feel clinically plausible and internally consistent.

### 9.8 Clear limitations

The product should describe itself as a decision-support and workflow prototype, not a diagnostic or autonomous enrollment system.

---

## 10. Core Product Workflow

```text
┌───────────────────────────┐
│ ClinicalTrials.gov Search │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Select Recruiting Trial   │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Parse Inclusion /         │
│ Exclusion Criteria        │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Clinician Voice Knowledge │
│ Intake                    │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Generate Enhanced Trial   │
│ Screening Logic           │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Screen Synthetic Cohort   │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Prioritized Patient Queue │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Criterion-Level Review    │
│ + Evidence + Work-up      │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Mark Patient Enrolled     │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Follow-up Conversation    │
│ + Adverse Event Extraction│
└───────────────────────────┘
```

---

## 11. Demo Narrative

### Scene 1: Select a trial

A PI opens the Trial Explorer and selects an actively recruiting Lilly-sponsored trial.

### Scene 2: Parse the protocol

The product automatically extracts and classifies inclusion and exclusion criteria.

### Scene 3: Add clinical knowledge

The PI records a short voice note that adds practical clinical context not explicitly captured in the protocol.

Example:

> “Patients with a significant alcohol-use history or gallbladder disease may have elevated pancreatitis risk. Do not automatically exclude them, but flag them for physician review and lower their screening priority.”

The system transcribes the audio and converts it into structured trial guidance.

### Scene 4: Screen the cohort

The system applies the protocol and the clinician guidance to the entire synthetic patient cohort.

### Scene 5: Review a surfaced patient

A clinician opens a patient who is a possible match but has missing or ambiguous information.

The product shows:

- overall status;
- criterion-by-criterion result;
- exact evidence;
- confidence;
- missing data;
- clinician review flags;
- work-up checklist.

### Scene 6: Follow an enrolled patient

The patient is shown as actively enrolled.

During a follow-up conversation, the patient reports nausea and vomiting.

The product extracts:

- symptom;
- timing;
- frequency;
- possible medication relationship;
- severity indicators;
- whether escalation is required.

---

## 12. Information Architecture

The prototype consists of five primary pages (v1.1: former Page 5 merged into Page 3).

```text
Page 1: Trial Explorer
Page 2: Trial Intelligence and Clinician Knowledge Intake
Page 3: Patient Screening Queue (includes actively-enrolled patients in purple)
Page 4: Patient Eligibility Review
Page 5: REMOVED in v1.1 — enrolled patients live in the Page 3 queue
Page 6: Follow-up Visit and Adverse Event Extraction (+ disqualification surveillance)
```

---

# 13. Page Requirements and ASCII Wireframes

## Page 1 — Trial Explorer

### Purpose

- Search relevant trials.
- Display multiple recruiting trials.
- Select one trial for setup and screening.
- Establish that the platform is not hardcoded to one study.

### Core content

- search input;
- disease or intervention filters;
- trial cards;
- sponsor;
- recruitment status;
- location;
- NCT identifier;
- primary action: “Open Trial.”

### ASCII wireframe

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ LOGO                          Trial Explorer               [Patient Queue] │
├───────────────────────────────────────────────────────────────────────────┤
│ Find a recruiting trial                                                   │
│ ┌──────────────────────────────────────────┐ [Search] [Filters]           │
│ │ obesity, psoriasis, GLP-1...             │                              │
│ └──────────────────────────────────────────┘                              │
│                                                                           │
│ Recruiting Trials                                                        │
│                                                                           │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ Lilly-sponsored Trial                                                │ │
│ │ NCTXXXXXXXX · Recruiting · Bay Area                                  │ │
│ │ Disease area · Phase X · Estimated enrollment                        │ │
│ │                                                      [Open Trial →]  │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ Additional Trial                                                     │ │
│ │ NCTXXXXXXXX · Recruiting                                             │ │
│ │                                                      [Open Trial →]  │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

### Acceptance criteria

- At least three trials appear in the interface.
- Trial data is loaded from the ClinicalTrials.gov API or cached API output.
- The selected trial opens Page 2.
- The primary demo trial is visually marked.

---

## Page 2 — Trial Intelligence and Clinician Knowledge Intake

### Purpose

- Display automatically parsed protocol information.
- Separate deterministic criteria from judgement-based criteria.
- Capture trial-specific clinician knowledge through voice.
- Convert the voice transcript into structured reusable guidance.

> **v1.1 update (Jae review):** The clinician is NOT the trial designer — they never
> create new criteria, only add context and insight to the *existing* criteria.
> Layout: existing criteria stay first/left (preserved, read-only); recording control
> stays right; **Extracted Guidance moves to the LEFT column**, directly under the
> criteria it annotates, so criteria + guidance read as one iterable unit.

### Core content

- trial summary;
- parsed inclusion criteria;
- parsed exclusion criteria;
- criteria classification;
- voice recording control;
- transcript;
- extracted guidance;
- “Apply to Screening Logic” action.

### ASCII wireframe

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ ← Back to Trials                  Trial Intelligence                      │
├───────────────────────────────────────────────────────────────────────────┤
│ Lilly-sponsored Trial · NCTXXXXXXXX · Recruiting                         │
│ Disease area · Phase · Locations                                          │
├───────────────────────────────────────┬───────────────────────────────────┤
│ Parsed Eligibility Criteria           │ Clinician Knowledge Layer         │
│                                       │                                   │
│ Inclusion                             │ Add trial-specific guidance once   │
│ [Rule] Age 18–75                      │ and apply it across all patients.  │
│ [Rule] BMI ≥ 30                       │                                   │
│ [Judgement] Moderate-to-severe ...    │ [● Start Recording]               │
│                                       │                                   │
│ Exclusion                             │ Transcript                         │
│ [Rule] History of pancreatitis        │ ┌───────────────────────────────┐ │
│ [Rule] Prohibited medication          │ │ Patients with significant...  │ │
│ [Judgement] Investigator concern      │ └───────────────────────────────┘ │
│                                       │                                   │
│                                       │ Extracted Guidance                │
│                                       │ • Flag alcohol-use risk           │
│                                       │ • Flag gallbladder disease        │
│                                       │ • Require physician review        │
│                                       │                                   │
│                                       │ [Apply to Screening Logic]        │
├───────────────────────────────────────┴───────────────────────────────────┤
│ [Screen Patient Cohort →]                                                 │
└───────────────────────────────────────────────────────────────────────────┘
```

### Acceptance criteria

- Trial eligibility text is converted into structured criteria.
- Each criterion has a type:
  - deterministic rule;
  - clinical judgement;
  - missing-data-sensitive;
  - human review.
- The mock voice recording is placed on this page.
- The transcript is editable before applying.
- Extracted guidance is displayed in human-readable form.
- Applying guidance updates the trial knowledge object.
- Screening can be triggered from this page.

---

## Page 3 — Patient Screening Queue

### Purpose

- Show a clinician-facing patient list.
- Prioritize patients based on screening status.
- Make matches and blockers visible with minimal clicks.

### Core content

- patient name;
- age;
- visit time;
- primary condition;
- screening status;
- match score;
- top reason;
- alert count;
- filter by status.

### Status vocabulary

- **Potential Match**
- **Enrollment Ready**
- **Missing Actionable Data**
- **Needs Clinician Review**
- **Confirmed Exclusion**
- **Actively Enrolled**

### ASCII wireframe

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ Trial: Lilly-sponsored Trial                         [Active Participants] │
├───────────────────────────────────────────────────────────────────────────┤
│ Today's Patient Queue                                                    │
│ [All] [Potential Match] [Missing Data] [Needs Review] [Excluded]          │
│                                                                           │
│ ┌──────┬──────────────────────┬───────────────┬─────────┬───────────────┐ │
│ │ 9:00 │ Nathan Chen         │ Plaque PSO    │  92%    │ 🟢 Match      │ │
│ │      │ Age 48              │               │         │ 1 open item   │ │
│ ├──────┼──────────────────────┼───────────────┼─────────┼───────────────┤ │
│ │ 9:30 │ Sarah Williams      │ Obesity       │  78%    │ 🟡 Review     │ │
│ │      │ Age 56              │               │         │ Grey zone     │ │
│ ├──────┼──────────────────────┼───────────────┼─────────┼───────────────┤ │
│ │10:00 │ Michael Lee         │ Obesity       │  24%    │ 🔴 Excluded   │ │
│ │      │ Age 43              │               │         │ Prior event   │ │
│ └──────┴──────────────────────┴───────────────┴─────────┴───────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

> **v1.1 update (Jae review):**
> - **Hover tooltips on every status indicator** — the green/yellow/red chip alone hides
>   the actionable context. Hovering shows a high-level summary: what's open ("missing
>   smoking history"), why excluded ("prior pancreatitis event, note 2024-03-02") —
>   enough to decide whether to double-click into Page 4. This is provenance: the
>   clinician may not trust the computer initially, so always show the chain of evidence.
> - **Clinician can correct the system** — e.g. "Michael Lee does NOT have a pancreatitis
>   history" → provide the correction with evidence and the status updates.
> - **Actively-enrolled patients render inline in this queue in purple** (former Page 5 is
>   removed). Render at least one purple patient; clicking them opens the Page 6 follow-up
>   view. Keeps the clinician in their normal I'm-seeing-my-patients workflow.
> - Match score confirmed useful — keeps outreach rank-ordered.

### Acceptance criteria

- The queue displays at least 8–12 synthetic patients.
- Patients are sorted by priority.
- Status labels use a fixed vocabulary.
- Every status chip has a hover tooltip with summary + provenance (v1.1).
- At least one actively-enrolled (purple) patient appears in the queue (v1.1).
- Clicking a candidate row opens Page 4; clicking a purple row opens Page 6 (v1.1).
- The user can filter by status.
- At least one patient appears in each important demo state.

---

## Page 4 — Patient Eligibility Review

### Purpose

- Explain why a patient was surfaced.
- Show every criterion and its evidence.
- Distinguish confirmed exclusion, missing data, and clinician judgement.
- Provide a work-up checklist.

### Core content

- patient summary;
- overall status;
- score;
- criterion result table;
- evidence snippets;
- clinician flags;
- work-up items;
- action to mark the patient enrollment-ready or enrolled.

> **v1.1 update (Jae review):** current single-column layout is too visually busy.
> - **Split the eligibility review into two columns**: LEFT = criterion + status
>   (✓ MET, ✓ LIKELY MET, ? MISSING, ⚠ NEEDS REVIEW); RIGHT = the corresponding
>   evidence as citations (verbatim text · source · date, e.g. "BMI 33.4 kg/m²,
>   collected 2026-07-10"). Evidence reads like a reference column.
> - **Move the summary from the bottom to the TOP** of the page (visual hierarchy —
>   as users gain trust they read top-down and skip steps).
> - **Move the work-up checklist up** so the next action is immediately visible.

### ASCII wireframe

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ ← Patient Queue                      Nathan Chen                          │
├───────────────────────────────────────────────────────────────────────────┤
│ Potential Match · 92% confidence                                         │
│ Age 48 · BMI 33.4 · Plaque psoriasis · Endocrinology follow-up            │
├───────────────────────────────────────────────────────────────────────────┤
│ Eligibility Review                                                       │
│                                                                           │
│ ✓ MET                                                                    │
│ BMI ≥ 30                                                                 │
│ Evidence: BMI 33.4 kg/m² collected 2026-07-10                            │
│                                                                           │
│ ✓ LIKELY MET                                                             │
│ Moderate-to-severe plaque psoriasis                                      │
│ Evidence: Dermatology note documents 12% body surface area involvement   │
│ Source: Dermatologist · 2026-06-22                                       │
│                                                                           │
│ ? MISSING ACTIONABLE DATA                                                │
│ Smoking history                                                          │
│ No structured or note evidence found                                     │
│ Next action: Ask patient about current and historical tobacco use         │
│                                                                           │
│ ⚠ NEEDS CLINICIAN REVIEW                                                 │
│ Potential pancreatitis risk                                              │
│ Evidence: Moderate alcohol use documented                                │
│ Guidance source: Trial clinician voice input                             │
├───────────────────────────────────────────────────────────────────────────┤
│ Work-up Checklist                                                        │
│ [ ] Confirm smoking history                                              │
│ [ ] Review alcohol-use history                                           │
│ [ ] Repeat liver panel if required by screening window                    │
│                                                                           │
│ [Mark Enrollment Ready]  [Exclude]  [Keep Under Review]                  │
└───────────────────────────────────────────────────────────────────────────┘
```

### Acceptance criteria

- Every criterion result contains:
  - status;
  - evidence;
  - confidence;
  - next action when relevant.
- Missing information is never presented as a confirmed exclusion.
- Clinician-authored guidance is visibly attributed.
- The work-up checklist is generated from unresolved criteria.
- The user can update the patient’s trial status.

---

## Page 5 — Active Trial Participants — ❌ REMOVED in v1.1

> **v1.1 update (Jae review):** A separate participants page disrupts the clinician's
> workflow. Enrolled patients now appear **inline in the Page 3 queue with a purple
> status**; clicking a purple patient opens the Page 6 follow-up view. Do not build
> this page. The wireframe below is kept for historical reference only.

### Original purpose (superseded)

- Show patients already enrolled in the trial.
- Visually distinguish candidates from active participants.
- Provide entry into the follow-up monitoring workflow.

### Core content

- enrolled patient list;
- study week;
- enrollment date;
- upcoming visit;
- symptom or monitoring alerts;
- action to open follow-up visit.

### ASCII wireframe

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ Active Trial Participants                              [Back to Screening] │
├───────────────────────────────────────────────────────────────────────────┤
│ Trial: Lilly-sponsored Trial                                              │
│                                                                           │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ 🟣 Nathan Chen                                                       │ │
│ │ Enrolled · Week 3 · Next visit today                                 │ │
│ │ Current alerts: None                                                 │ │
│ │                                              [Open Follow-up Visit →] │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ 🟣 Maya Patel                                                        │ │
│ │ Enrolled · Week 6 · Next visit in 4 days                             │ │
│ │ Current alerts: Mild nausea                                          │ │
│ │                                              [Open Follow-up Visit →] │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

### Acceptance criteria

- At least one patient is shown as actively enrolled.
- Active participants use a visually distinct status.
- Clicking a participant opens Page 6.
- Trial week and follow-up status are visible.

---

## Page 6 — Follow-up Visit and Adverse Event Extraction

### Purpose

- Demonstrate longitudinal value after enrollment.
- Extract possible adverse events from a patient conversation.
- Present the result for clinician review.
- **v1.1: detect disqualification events, not just adverse events.**

> **v1.1 update (Jae review) — two demo scenarios:**
> 1. **Nathan Chen (with audio):** the existing adverse-event extraction demo —
>    nausea/vomiting, extracted with timing, frequency, confidence.
> 2. **Maya Patel (no audio; 5–10 s talk-through):** her follow-up transcript reveals
>    she was hospitalized last week and diagnosed with pancreatitis and started a
>    prohibited medication. The system knows her enrolled trial and its exclusion
>    criteria, so on transcript update it **automatically re-screens**: surfaces the
>    adverse event AND flags that she now meets an exclusion criterion → status flips
>    to disqualified with the exact transcript quotes as the chain of evidence, and
>    her Page 3 row updates automatically. No manual button needed — this is
>    real-time trial surveillance (the "holy grail" moment of the demo).

### Core content

- mock voice recording or prerecorded audio;
- live or simulated transcript;
- extracted symptom entities;
- timing;
- frequency;
- severity;
- supporting quote;
- escalation recommendation;
- save-to-participant-record action.

### ASCII wireframe

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ ← Active Participants                Nathan Chen · Week 3 Follow-up       │
├───────────────────────────────────────────────────────────────────────────┤
│ Visit Conversation                                                        │
│ [● Start Recording] [Use Demo Audio]                                      │
│                                                                           │
│ Transcript                                                                │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │ “I started the study medication three weeks ago. I feel nauseous     │ │
│ │ most mornings and vomited twice this week, but I can still drink     │ │
│ │ water.”                                                              │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────────────┤
│ AI-Extracted Events                                                       │
│                                                                           │
│ Nausea                                                                   │
│ Frequency: Most mornings · Confidence: 96%                               │
│                                                                           │
│ Vomiting                                                                 │
│ Frequency: Twice this week · Confidence: 94%                             │
│                                                                           │
│ Possible relationship: After study medication initiation                 │
│ Hydration concern: Not currently reported                                │
│ Escalation: Clinician review recommended                                 │
│                                                                           │
│ [Confirm Findings] [Edit] [Save to Participant Record]                   │
└───────────────────────────────────────────────────────────────────────────┘
```

### Acceptance criteria

- The mock patient voice is placed on Page 6.
- The transcript contains at least one plausible GLP-1-related symptom.
- The system extracts symptom, timing, frequency, and confidence.
- The UI clearly states that findings require clinician review.
- The extracted event can be saved into the participant’s synthetic record.

---

## 14. UI References

This section will be completed after reference images are added.

### Intended visual direction

- browser-based clinical application;
- familiar patient-list structure;
- modernized version of current clinical dashboards;
- low visual noise;
- minimal clicks;
- evidence-forward;
- Abridge-inspired clarity and typography;
- subtle status indicators rather than large consumer-style cards;
- desktop-first responsive layout.

### Reference placeholders

```text
Reference 1: Trial list / search
[IMAGE TO BE ADDED]

Reference 2: Clinician patient queue
[IMAGE TO BE ADDED]

Reference 3: Abridge visual language
[IMAGE TO BE ADDED]

Reference 4: Patient detail / criterion review
[IMAGE TO BE ADDED]

Reference 5: Transcript and extraction UI
[IMAGE TO BE ADDED]
```

---

# 15. Functional Requirements

## 15.1 Trial retrieval

The system must:

- search ClinicalTrials.gov;
- retrieve trial metadata;
- retrieve recruitment status;
- retrieve sponsor;
- retrieve locations;
- retrieve eligibility criteria;
- cache selected trial data locally.

## 15.2 Protocol parsing

The system must convert eligibility text into structured criteria.

Each criterion should contain:

- identifier;
- original text;
- normalized description;
- inclusion or exclusion type;
- evaluation mode;
- required patient data;
- time window, when applicable;
- human-review requirement.

## 15.3 Clinician knowledge intake

The system must:

- accept audio or a prerecorded mock clip;
- transcribe the audio;
- display an editable transcript;
- convert transcript content into structured guidance;
- attach the guidance to the selected trial;
- apply it across the cohort.

## 15.4 Cohort screening

The system must:

- screen every selected patient;
- produce criterion-level results;
- produce an overall status;
- produce a match score;
- identify missing actionable data;
- identify clinician review cases;
- generate next steps.

## 15.5 Patient review

The system must:

- display supporting evidence;
- preserve exact evidence snippets;
- show source and date;
- show confidence;
- show whether guidance came from protocol text or clinician input.

## 15.6 Enrollment status

The system must support status updates from:

- not screened;
- potential match;
- missing actionable data;
- needs clinician review;
- confirmed exclusion;
- enrollment ready;
- actively enrolled;
- withdrawn.

## 15.7 Follow-up monitoring

The system must:

- accept a mock follow-up transcript;
- extract possible adverse events;
- preserve supporting transcript text;
- distinguish observation from confirmed clinical judgement;
- allow the clinician to confirm or edit the extraction.

---

# 16. Status and Evaluation Vocabulary

## Criterion status

```typescript
type CriterionStatus =
  | "met"
  | "likely_met"
  | "not_met"
  | "missing_data"
  | "needs_review"
  | "not_applicable";
```

## Patient enrollment status

```typescript
type EnrollmentStatus =
  | "not_screened"
  | "potential_match"
  | "missing_actionable_data"
  | "needs_review"
  | "confirmed_exclusion"
  | "enrollment_ready"
  | "actively_enrolled"
  | "withdrawn";
```

## UI mapping

```text
Potential match          → Green
Enrollment ready         → Green
Missing actionable data  → Amber
Needs clinician review   → Amber
Confirmed exclusion      → Red
Actively enrolled        → Purple
Withdrawn                 → Gray
```

---

# 17. Synthetic Patient Data Strategy

## 17.1 Source

> **v1.1 update:** The cohort is now **derived from the organizer-provided synthetic
> EHR dataset** (25 patients, JSON + JSONL; richly detailed — e.g. serial blood
> pressures, a COVID admission with ~600 touch points). Workflow: at hackathon start,
> an agent edits selected patients to fit the target trial (adjust weight/height/BMI,
> add or remove exclusion-triggering history) while keeping them realistic. Jae curates
> which patients to use and validates clinical plausibility of every edit. The §18
> canonical schema still applies as the app-facing contract (Jae reviewed: close to
> SNOMED-style real data); patients are mapped from the organizer schema into §18 form.

All patient data remains synthetic.

There will be:

- no real patient data;
- no PHI;
- no EHR import;
- no insurance system integration;
- no claim that the cohort represents a validated epidemiological population.

## 17.2 Ownership

Jae owns:

- clinical realism;
- patient archetype design;
- patient histories;
- labs;
- medications;
- clinical notes;
- edge cases;
- expected clinical interpretation.

Holly owns:

- schema;
- validation;
- API contract;
- frontend rendering;
- backend ingestion;
- eligibility pipeline;
- final data integration.

## 17.3 Cohort size

Minimum:

- 8 synthetic patients.

Recommended:

- 12 synthetic patients.

Stretch:

- 20 synthetic patients.

## 17.4 Required archetypes

The cohort should include:

1. clear match;
2. clear exclusion;
3. missing smoking history;
4. expired or missing laboratory result;
5. borderline numeric criterion;
6. subjective disease-severity note;
7. pancreatitis risk from alcohol-use history;
8. gallbladder disease risk;
9. high dropout or tolerance concern;
10. already enrolled participant;
11. mild adverse-event scenario;
12. escalation-worthy adverse-event scenario.

## 17.5 Ground truth

Each patient must include scenario metadata with:

- archetype;
- intended outcome;
- expected criterion results;
- explanation;
- intentionally missing data;
- intended clinician review trigger.

This is used for demo reliability and internal evaluation.

---

# 18. Patient Data Contract

## 18.1 Canonical patient object

```json
{
  "patient_id": "pt_001",
  "name": {
    "first": "Nathan",
    "last": "Chen",
    "display": "Nathan Chen"
  },
  "demographics": {
    "age": 48,
    "date_of_birth": "1978-04-12",
    "sex_at_birth": "male",
    "gender_identity": "male"
  },
  "visit": {
    "appointment_id": "appt_001",
    "appointment_date": "2026-07-18",
    "appointment_time": "09:30",
    "visit_type": "follow-up",
    "clinician": "Dr. Jae",
    "department": "Endocrinology"
  },
  "conditions": [
    {
      "code": "E66.9",
      "system": "ICD-10",
      "name": "Obesity",
      "status": "active",
      "diagnosed_date": "2022-05-14",
      "source": "problem_list"
    }
  ],
  "medications": [
    {
      "name": "Metformin",
      "dose": "500 mg",
      "frequency": "twice daily",
      "route": "oral",
      "status": "active",
      "start_date": "2023-01-10",
      "end_date": null
    }
  ],
  "allergies": [
    {
      "substance": "Penicillin",
      "reaction": "rash",
      "severity": "mild"
    }
  ],
  "observations": [
    {
      "type": "BMI",
      "code": "39156-5",
      "system": "LOINC",
      "value": 33.4,
      "unit": "kg/m2",
      "collected_at": "2026-07-10",
      "reference_range": null,
      "status": "final"
    }
  ],
  "social_history": {
    "smoking_status": "unknown",
    "pack_years": null,
    "alcohol_use": {
      "status": "current",
      "drinks_per_week": 12,
      "risk_level": "moderate"
    },
    "substance_use": []
  },
  "procedures": [
    {
      "name": "Cholecystectomy",
      "date": "2018-08-22",
      "status": "completed"
    }
  ],
  "clinical_notes": [
    {
      "note_id": "note_001",
      "note_type": "dermatology",
      "author_role": "dermatologist",
      "date": "2026-06-22",
      "text": "Plaque psoriasis involving the scalp, elbows, trunk, and knees with approximately 12 percent body surface area involvement.",
      "source_reliability": "specialist_documented"
    }
  ],
  "trial_status": {
    "status": "not_screened",
    "trial_id": null,
    "enrollment_date": null,
    "study_week": null
  },
  "adverse_events": [],
  "scenario_metadata": {
    "archetype": "missing_actionable_data",
    "expected_outcome": "needs_review",
    "ground_truth_notes": [
      "BMI meets inclusion criterion",
      "Disease severity likely meets criterion",
      "Smoking history is missing",
      "Alcohol use may increase pancreatitis risk"
    ]
  }
}
```

## 18.2 Required fields

Every patient must include:

```text
patient_id
name.display
demographics.age
demographics.sex_at_birth
visit.appointment_date
visit.appointment_time
conditions
medications
observations
social_history
clinical_notes
trial_status
scenario_metadata.archetype
scenario_metadata.expected_outcome
scenario_metadata.ground_truth_notes
```

Optional values should be represented as `null`, not omitted, unless the omission itself is an intentional missing-data test.

---

# 19. Trial Data Contract

## 19.1 Canonical trial object

```json
{
  "trial_id": "NCTXXXXXXXX",
  "title": "Example Trial Title",
  "short_title": "Lilly Trial",
  "sponsor": "Eli Lilly and Company",
  "status": "RECRUITING",
  "phase": "PHASE2",
  "conditions": [
    "Obesity",
    "Plaque Psoriasis"
  ],
  "interventions": [
    {
      "name": "Study Drug",
      "type": "DRUG"
    }
  ],
  "locations": [
    {
      "facility": "Example Research Site",
      "city": "San Francisco",
      "state": "California",
      "country": "United States"
    }
  ],
  "eligibility_text": "Full unmodified eligibility criteria text",
  "minimum_age": "18 Years",
  "maximum_age": "75 Years",
  "sex": "ALL",
  "last_updated": "2026-07-01"
}
```

---

# 20. Parsed Criterion Contract

```json
{
  "criterion_id": "inc_001",
  "trial_id": "NCTXXXXXXXX",
  "criterion_type": "inclusion",
  "original_text": "Body mass index greater than or equal to 30 kg/m2",
  "normalized_text": "BMI must be at least 30 kg/m2",
  "evaluation_mode": "deterministic",
  "required_data": [
    "observations.BMI"
  ],
  "operator": ">=",
  "threshold": 30,
  "unit": "kg/m2",
  "time_window": null,
  "requires_human_review": false
}
```

### Allowed evaluation modes

```typescript
type EvaluationMode =
  | "deterministic"
  | "note_interpretation"
  | "missing_data_sensitive"
  | "clinical_judgement";
```

---

# 21. Clinician Knowledge Contract

## 21.1 Canonical knowledge object

```json
{
  "knowledge_id": "knowledge_001",
  "trial_id": "NCTXXXXXXXX",
  "source": "clinician_voice",
  "source_transcript": "Patients with significant alcohol use or gallbladder disease may have elevated pancreatitis risk.",
  "created_by": "Jae",
  "created_at": "2026-07-18T09:00:00Z",
  "trigger": {
    "any": [
      {
        "field": "social_history.alcohol_use.risk_level",
        "operator": "in",
        "value": [
          "moderate",
          "high"
        ]
      },
      {
        "field": "conditions.name",
        "operator": "contains",
        "value": "gallbladder disease"
      }
    ]
  },
  "effect": {
    "action": "flag_for_review",
    "priority_adjustment": -10,
    "label": "Potential pancreatitis risk",
    "explanation": "The patient may have elevated pancreatitis risk and should be reviewed by a trial clinician."
  },
  "requires_human_confirmation": true
}
```

---

# 22. Screening Result Contract

```json
{
  "screening_id": "screen_001",
  "patient_id": "pt_001",
  "trial_id": "NCTXXXXXXXX",
  "overall_status": "needs_review",
  "match_score": 82,
  "summary": "Patient meets core demographic and disease criteria, but smoking history is missing and alcohol use may increase pancreatitis risk.",
  "criteria_results": [
    {
      "criterion_id": "inc_001",
      "criterion_text": "BMI greater than or equal to 30 kg/m2",
      "type": "inclusion",
      "status": "met",
      "confidence": 0.99,
      "evidence": [
        {
          "source_type": "observation",
          "source_id": "BMI",
          "text": "BMI 33.4 kg/m2",
          "date": "2026-07-10"
        }
      ],
      "next_action": null
    },
    {
      "criterion_id": "inc_004",
      "criterion_text": "Documented smoking history",
      "type": "inclusion",
      "status": "missing_data",
      "confidence": 1.0,
      "evidence": [],
      "next_action": "Ask the patient to confirm current and historical smoking status."
    }
  ],
  "workup_items": [
    {
      "workup_id": "workup_001",
      "type": "patient_question",
      "label": "Confirm smoking history",
      "priority": "high",
      "owner": "clinician",
      "status": "open"
    }
  ],
  "clinical_flags": [
    {
      "flag_id": "flag_001",
      "label": "Elevated pancreatitis risk",
      "reason": "Moderate alcohol use documented",
      "severity": "medium",
      "requires_human_review": true,
      "knowledge_id": "knowledge_001"
    }
  ]
}
```

---

# 23. Adverse Event Contract

```json
{
  "event_id": "ae_001",
  "patient_id": "pt_001",
  "trial_id": "NCTXXXXXXXX",
  "visit_date": "2026-08-08",
  "event": "nausea",
  "severity": "mild",
  "onset": "after medication initiation",
  "frequency": "most mornings",
  "confidence": 0.94,
  "supporting_text": "I've been feeling nauseous since starting the medication",
  "requires_escalation": false,
  "clinician_confirmed": false
}
```

---

# 24. API Specification

## 24.1 Trial search

```http
GET /api/trials?query=obesity&status=RECRUITING&sponsor=Eli%20Lilly
```

### Response

```json
{
  "trials": [
    {
      "trial_id": "NCTXXXXXXXX",
      "short_title": "Lilly Trial",
      "sponsor": "Eli Lilly and Company",
      "status": "RECRUITING",
      "phase": "PHASE2",
      "conditions": [
        "Obesity"
      ],
      "locations": [
        {
          "city": "San Francisco",
          "state": "California"
        }
      ]
    }
  ],
  "total": 3
}
```

---

## 24.2 Get trial

```http
GET /api/trials/{trial_id}
```

Returns the canonical trial object.

---

## 24.3 Parse trial eligibility

```http
POST /api/trials/{trial_id}/parse
```

### Response

```json
{
  "trial_id": "NCTXXXXXXXX",
  "criteria": [
    {
      "...": "parsed criterion object"
    }
  ]
}
```

---

## 24.4 Submit clinician knowledge

```http
POST /api/trials/{trial_id}/knowledge
```

### Request

```json
{
  "transcript": "Patients with significant alcohol use or gallbladder disease may have elevated pancreatitis risk.",
  "source": "mock_voice",
  "created_by": "Jae"
}
```

### Response

```json
{
  "knowledge": {
    "...": "structured clinician knowledge object"
  }
}
```

---

## 24.5 Get all patients

```http
GET /api/patients
```

### Optional query parameters

```http
GET /api/patients?trial_id=NCTXXXXXXXX
GET /api/patients?status=potential_match
GET /api/patients?date=2026-07-18
```

### Response

```json
{
  "patients": [
    {
      "patient_id": "pt_001",
      "display_name": "Nathan Chen",
      "age": 48,
      "appointment_time": "09:30",
      "primary_condition": "Plaque psoriasis",
      "enrollment_status": "needs_review",
      "match_score": 82,
      "trial_id": "NCTXXXXXXXX",
      "top_reason": "Smoking history is missing",
      "alert_count": 2
    }
  ],
  "total": 12
}
```

---

## 24.6 Get one patient

```http
GET /api/patients/{patient_id}
```

### Response

```json
{
  "patient": {
    "...": "full canonical patient object"
  }
}
```

---

## 24.7 Import synthetic patients

```http
POST /api/patients/import
```

### Request

```json
{
  "patients": [
    {
      "...": "canonical patient object"
    }
  ]
}
```

### Response

```json
{
  "created": 12,
  "failed": 0,
  "validation_errors": []
}
```

A local import script may be used instead:

```bash
python scripts/import_patients.py data/patients.json
```

---

## 24.8 Screen one patient

```http
POST /api/screenings
```

### Request

```json
{
  "patient_id": "pt_001",
  "trial_id": "NCTXXXXXXXX",
  "include_clinician_knowledge": true
}
```

Returns the canonical screening result object.

---

## 24.9 Screen the cohort

```http
POST /api/trials/{trial_id}/screen-cohort
```

### Request

```json
{
  "patient_ids": [
    "pt_001",
    "pt_002",
    "pt_003"
  ],
  "include_clinician_knowledge": true
}
```

### Response

```json
{
  "trial_id": "NCTXXXXXXXX",
  "screened_count": 12,
  "results": [
    {
      "patient_id": "pt_001",
      "status": "needs_review",
      "match_score": 82
    },
    {
      "patient_id": "pt_002",
      "status": "confirmed_exclusion",
      "match_score": 21
    }
  ]
}
```

---

## 24.10 Update trial status

```http
PATCH /api/patients/{patient_id}/trial-status
```

### Request

```json
{
  "trial_id": "NCTXXXXXXXX",
  "status": "actively_enrolled",
  "enrollment_date": "2026-07-18",
  "study_week": 1
}
```

---

## 24.11 Submit follow-up transcript

```http
POST /api/patients/{patient_id}/follow-up
```

### Request

```json
{
  "trial_id": "NCTXXXXXXXX",
  "visit_date": "2026-08-08",
  "transcript": "I've been feeling nauseous since starting the medication, especially after meals.",
  "source": "mock_voice"
}
```

### Response

```json
{
  "patient_id": "pt_001",
  "detected_events": [
    {
      "event": "nausea",
      "severity": "mild",
      "onset": "after medication initiation",
      "frequency": "most mornings",
      "confidence": 0.94,
      "supporting_text": "I've been feeling nauseous since starting the medication",
      "requires_escalation": false
    }
  ],
  "recommended_action": "Review symptom severity and hydration status during the visit."
}
```

---

# 25. Mock Voice Requirements

## 25.1 Page 2 mock clinician voice

### Owner

Jae

### Purpose

Demonstrate that trial-specific expertise can be captured once and applied across the cohort.

### Required content

The script should include:

- a protocol-related risk factor;
- an instruction not to auto-exclude;
- an instruction to flag for physician review;
- a prioritization adjustment.

### Draft script

> “For the pancreatitis exclusion, I also want the system to flag patients with significant alcohol use or gallbladder disease. These patients should not be automatically excluded, but they may have elevated risk, so lower their screening priority and require physician review.”

### Implementation

Hackathon-safe options:

1. prerecorded audio;
2. browser microphone recording;
3. simulated transcript animation.

The demo must work even if microphone permissions fail. A “Use Demo Audio” fallback is required.

---

## 25.2 Page 6 mock patient voice

### Owner

Jae

### Purpose

Demonstrate adverse-event extraction after trial enrollment.

### Required content

The script should include:

- medication timing;
- nausea;
- vomiting;
- frequency;
- hydration or oral intake;
- whether symptoms interfere with daily activity.

### Draft script

> “I started the study medication three weeks ago. I have felt nauseous most mornings and vomited twice this week. I can still drink water and eat small meals, but it is making it harder to get through the workday.”

### Implementation

Use the same audio pipeline as Page 2.

---

# 26. Technical Architecture

## 26.1 Recommended stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion, only where it improves demo clarity

### Backend

- FastAPI
- Python
- Pydantic
- Uvicorn

### AI

- Claude API for:
  - protocol parsing;
  - note interpretation;
  - structured knowledge extraction;
  - criterion assessment;
  - evidence-linked summaries;
  - work-up generation;
  - adverse-event extraction.

### Speech-to-text

Preferred:

- OpenAI Whisper API or local Whisper-compatible service.

Fallback:

- prewritten transcripts;
- prerecorded audio plus simulated transcription.

### Storage

Primary hackathon approach:

- JSON files.

Optional:

- SQLite.

Avoid adding a production database unless necessary.

### External data

- ClinicalTrials.gov API v2.

---

## 26.2 Architecture diagram

```text
┌──────────────────────────────┐
│       Next.js Frontend       │
│ Pages 1–6                    │
└──────────────┬───────────────┘
               │ REST/JSON
               ▼
┌──────────────────────────────┐
│       FastAPI Backend        │
├──────────────────────────────┤
│ Trial Service                │
│ Protocol Parser              │
│ Knowledge Intake Service     │
│ Screening Engine             │
│ Evidence Resolver            │
│ Work-up Generator            │
│ Adverse Event Extractor      │
└───────┬──────────┬───────────┘
        │          │
        │          ├──────────────► Claude API
        │          │
        │          └──────────────► Whisper / Demo Transcript
        │
        ├─────────────────────────► ClinicalTrials.gov API
        │
        └─────────────────────────► Local JSON / SQLite
```

---

# 27. Backend Module Responsibilities

## Trial service

- fetch trial data;
- normalize API output;
- cache selected trials.

## Protocol parser

- split inclusion and exclusion criteria;
- normalize criteria;
- identify data requirements;
- classify evaluation mode.

## Knowledge intake service

- receive transcript;
- extract triggers and actions;
- create a clinician knowledge object;
- attach knowledge to a trial.

## Screening engine

- compare patient data with criteria;
- apply deterministic logic;
- call Claude for note interpretation;
- apply clinician knowledge;
- generate overall status and score.

## Evidence resolver

- retrieve exact patient evidence;
- include source type;
- include date;
- preserve original text.

## Work-up generator

- convert missing or outdated data into actionable tasks;
- assign owner and priority.

## Adverse-event extractor

- identify symptoms;
- extract timing, frequency, and severity;
- preserve transcript evidence;
- flag cases for clinician review.

---

# 28. Frontend Data Types

```typescript
export type EnrollmentStatus =
  | "not_screened"
  | "potential_match"
  | "missing_actionable_data"
  | "needs_review"
  | "confirmed_exclusion"
  | "enrollment_ready"
  | "actively_enrolled"
  | "withdrawn";

export interface PatientSummary {
  patientId: string;
  displayName: string;
  age: number;
  appointmentTime: string;
  primaryCondition: string;
  enrollmentStatus: EnrollmentStatus;
  matchScore: number | null;
  trialId: string | null;
  topReason: string | null;
  alertCount: number;
}

export interface CriterionResult {
  criterionId: string;
  criterionText: string;
  type: "inclusion" | "exclusion";
  status:
    | "met"
    | "likely_met"
    | "not_met"
    | "missing_data"
    | "needs_review"
    | "not_applicable";
  confidence: number;
  evidence: EvidenceItem[];
  nextAction: string | null;
}

export interface EvidenceItem {
  sourceType:
    | "condition"
    | "observation"
    | "medication"
    | "procedure"
    | "clinical_note"
    | "social_history";
  sourceId: string;
  text: string;
  date: string | null;
}
```

---

# 29. Proposed Repository Structure

```text
/
├── frontend/
│   ├── app/
│   │   ├── trials/
│   │   ├── patients/
│   │   ├── participants/
│   │   └── follow-up/
│   ├── components/
│   ├── lib/
│   └── types/
│
├── backend/
│   ├── main.py
│   ├── models/
│   │   ├── patient.py
│   │   ├── trial.py
│   │   ├── criterion.py
│   │   ├── knowledge.py
│   │   ├── screening.py
│   │   └── adverse_event.py
│   ├── routes/
│   │   ├── trials.py
│   │   ├── patients.py
│   │   ├── screenings.py
│   │   └── follow_up.py
│   └── services/
│       ├── clinical_trials_api.py
│       ├── protocol_parser.py
│       ├── knowledge_engine.py
│       ├── screening_engine.py
│       ├── evidence_resolver.py
│       ├── workup_generator.py
│       └── adverse_event_engine.py
│
├── data/
│   ├── patients.json
│   ├── trials.json
│   ├── criteria.json
│   ├── clinician_knowledge.json
│   └── transcripts/
│       ├── clinician_intake.txt
│       └── patient_follow_up.txt
│
├── scripts/
│   ├── import_patients.py
│   ├── validate_patients.py
│   └── seed_demo.py
│
└── README.md
```

---

# 30. Data Validation Requirements

Before any patient data is merged:

1. Validate against the canonical schema.
2. Reject unknown status values.
3. Require a unique `patient_id`.
4. Require ground-truth scenario metadata.
5. Require at least one supporting evidence source for every intended positive or negative eligibility result.
6. Explicitly represent missing data.
7. Reject accidental contradictions.
8. Allow intentional contradictions only when marked as a grey-zone scenario.
9. Validate dates and units.
10. Confirm that no real patient names or identifiable details were used.

Suggested command:

```bash
python scripts/validate_patients.py
```

---

# 31. AI Output Requirements

Every AI call that affects UI state should return structured JSON.

The system should not rely on free-form model output for:

- criterion parsing;
- knowledge extraction;
- screening results;
- work-up items;
- adverse-event extraction.

### Required safeguards

- preserve original protocol text;
- preserve patient evidence text;
- distinguish extraction from inference;
- distinguish missing data from negative evidence;
- include confidence;
- include human-review flags;
- avoid diagnostic or treatment claims;
- do not state that a patient is definitively eligible without clinician confirmation.

---

# 32. Match Score

The match score is a prioritization aid, not a clinical probability.

### Proposed calculation

```text
Base score: 100

Confirmed exclusion:
-100 and status = confirmed_exclusion

Unmet inclusion:
-40 per criterion

Missing actionable data:
-10 per criterion

Needs clinician review:
-8 per criterion

Clinician risk flag:
-5 to -15 depending on severity

Strong supporting evidence:
No deduction

Enrollment ready:
All required criteria resolved and no confirmed exclusion
```

The final score must not override a confirmed exclusion.

---

# 33. Team Ownership

## Holly

### Product and design

- product strategy;
- PRD;
- information architecture;
- UI/UX;
- visual design;
- demo narrative;
- presentation;
- pitch.

### Engineering

- frontend;
- backend;
- ClinicalTrials.gov integration;
- trial parser;
- AI pipeline;
- data models;
- API contracts;
- patient import;
- screening engine;
- evidence display;
- work-up checklist;
- audio integration;
- demo fallback states;
- deployment.

## Jae

### Clinical design

- final trial selection;
- synthetic patient design;
- clinical plausibility;
- patient histories;
- labs;
- medications;
- notes;
- edge cases;
- expected outcomes;
- clinician knowledge rules;
- clinical workflow validation.

### Mock audio

- Page 2 clinician knowledge script and voice;
- Page 6 patient follow-up script and voice.

### Review

- review parsed criteria;
- review synthetic cohort;
- review clinical flags;
- review work-up recommendations;
- review adverse-event extraction;
- review final demo narrative for clinical credibility.

---

# 34. Handoff Requirements Between Holly and Jae

## Holly provides Jae

1. Final selected trial JSON.
2. Parsed criteria draft.
3. Canonical patient JSON template.
4. Allowed status vocabulary.
5. Required archetype list.
6. Example completed patient.
7. Data validation script.
8. Deadline for patient JSON delivery.

## Jae provides Holly

1. Final trial recommendation.
2. 8–12 valid patient JSON objects.
3. Ground-truth outcome for each patient.
4. Explanation for each grey-zone case.
5. Mock Page 2 clinician script and recording.
6. Mock Page 6 patient script and recording.
7. Clinical review comments.
8. Approval of final demo cases.

## Merge rule

No schema changes should be made by either person without updating:

- the PRD;
- backend Pydantic models;
- frontend TypeScript types;
- validation script;
- sample JSON.

---

# 35. Implementation Plan

## Phase 1 — Alignment

- finalize the trial;
- finalize criteria;
- finalize patient schema;
- finalize archetypes;
- freeze API contracts.

## Phase 2 — Parallel build

### Holly

- build pages;
- build API routes;
- connect ClinicalTrials.gov;
- implement parser;
- implement screening pipeline.

### Jae

- create synthetic patient cohort;
- write mock clinician voice;
- write mock patient voice;
- validate clinical logic.

## Phase 3 — Integration

- import patient JSON;
- screen cohort;
- fix schema errors;
- adjust expected outcomes;
- connect queue to patient detail;
- connect enrollment state to active participant page.

## Phase 4 — Polish

- add audio;
- add transcript animation;
- add loading states;
- add demo reset;
- rehearse narrative;
- prepare fallback video or screenshots.

---

# 36. Suggested Hackathon Timeline

## Before coding

- lock the trial;
- lock the schema;
- lock the six-page flow.

## Build block 1

- Page 1;
- Page 2;
- ClinicalTrials.gov API;
- protocol parsing.

## Build block 2

- synthetic cohort;
- patient import;
- screening engine;
- Page 3.

## Build block 3

- Page 4;
- evidence display;
- work-up checklist;
- status updates.

## Build block 4

- Page 5;
- Page 6;
- audio and adverse-event extraction.

## Final block

- UI polish;
- demo reset;
- pitch;
- rehearsal;
- backup recording.

---

# 37. Risks and Mitigations

## Scope creep

**Risk:** Attempting to support too many trials or diseases.

**Mitigation:** One primary trial, multiple trial cards, one complete end-to-end path.

## Synthetic data feels fake

**Risk:** Judges do not find the cohort credible.

**Mitigation:** Jae authors and reviews every scenario; include realistic notes, dates, labs, and internal consistency.

## AI output is unstable

**Risk:** Live model output changes during the demo.

**Mitigation:** Cache parsed criteria and screening results; retain a “Run Again” option but demo with stable seeded outputs.

## Voice input fails

**Risk:** Browser microphone permissions or transcription latency.

**Mitigation:** Provide “Use Demo Audio” and “Use Demo Transcript” fallbacks.

## Protocol criteria are too complex

**Risk:** Parser produces unusable rules.

**Mitigation:** Manually review and cache the primary trial criteria before the demo.

## Adverse-event feature expands scope

**Risk:** Monitoring becomes a second product.

**Mitigation:** Keep Page 6 to one transcript, one extraction, and one review state.

## Medical overclaiming

**Risk:** The demo appears to make autonomous clinical decisions.

**Mitigation:** Use “potential match,” “needs review,” and “clinician confirmation required.”

---

# 38. Demo Reliability Requirements

The application must include:

- seeded demo data;
- a demo reset button;
- cached trial data;
- cached primary parsing result;
- cached primary screening results;
- prerecorded audio;
- transcript fallback;
- loading state;
- error state;
- no dependency on microphone success;
- no dependency on live ClinicalTrials.gov availability during judging.

---

# 39. Analytics for the Demo

Optional metrics to display:

- patients screened;
- potential matches surfaced;
- confirmed exclusions;
- missing actionable data items;
- clinician review cases;
- estimated charts avoided;
- unresolved work-up items.

Example:

```text
12 patients screened
3 potential matches
2 missing-data candidates recovered
4 clinician review flags
7 manual chart reviews avoided
```

These figures should be derived from the synthetic cohort and not presented as validated real-world outcomes.

---

# 40. Innovation and Differentiation

## 40.1 Protocol-to-logic conversion

The product converts free-text eligibility criteria into structured screening logic.

## 40.2 Clinician knowledge intake

The system captures practical clinical expertise through natural speech.

## 40.3 Reusable knowledge

One clinician input is applied across every patient screened for the trial.

## 40.4 Missing-data recovery

The product distinguishes an actual exclusion from a missing, obtainable data point.

## 40.5 Evidence-linked assessment

Every criterion is supported by source evidence.

## 40.6 Grey-zone routing

Ambiguous cases are prioritized for clinician review rather than hidden or falsely resolved.

## 40.7 Enrollment readiness

The system generates the next steps required to move a near-match toward formal screening.

## 40.8 Longitudinal extension

The same workflow can continue after enrollment by extracting possible adverse events from follow-up conversations.

---

# 41. Future Roadmap

Future versions may include:

- multiple trials per patient;
- disease-specific clinical modules;
- trial portfolio analytics;
- multi-site screening;
- real coordinator workflows;
- SMART on FHIR integration;
- EHR read and write-back;
- sponsor coverage and screening-budget metadata;
- patient outreach;
- consent workflow;
- adverse-event trend monitoring;
- investigator feedback loops;
- validated evaluation against de-identified clinical data.

These are explicitly outside the hackathon implementation.

---

# 42. Open Decisions

The following decisions must be finalized before implementation begins:

```text
[ ] Product name
[ ] Primary NCT identifier
[ ] Primary disease area
[ ] Final patient cohort size
[ ] Claude model selection
[ ] Whisper implementation or prerecorded-only approach
[ ] JSON-only storage or SQLite
[ ] Exact demo duration
[ ] Whether Page 5 and Page 6 are included in the live demo or shown as stretch features
```

---

# 43. Definition of Done

The product is demo-ready when:

- one real trial is loaded;
- eligibility criteria are parsed;
- clinician voice input produces structured knowledge;
- at least 8 synthetic patients pass schema validation;
- cohort screening completes;
- the patient queue displays multiple statuses;
- one patient detail page shows evidence and work-up;
- one patient can be marked actively enrolled;
- one follow-up transcript produces adverse-event extraction;
- the entire flow can be completed in under three minutes;
- the demo works without live microphone access;
- all medical outputs are framed as clinician-reviewed decision support.

---

# 44. Final Product Positioning

This is not a generic trial search engine.

This is not an autonomous eligibility decision-maker.

This is not an EHR replacement.

It is:

> **A clinician-guided enrollment copilot that transforms protocol criteria, clinical expertise, and patient evidence into a reusable workflow for screening, enrollment readiness, and follow-up monitoring.**
