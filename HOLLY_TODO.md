# Holly — Frontend Handoff from Jae

Two fixes needed in **`frontend/lib/data.ts`** after Jae's data-folder refactor.

---

## 1. Repoint clinician knowledge — ⚠️ currently breaking the build

Jae split the clinician-knowledge rule out of `data/criteria.json` into its own
file: **`data/clinician_knowledge.json`** (now a **top-level array** of knowledge
objects, not a wrapper object).

- `criteria.json` now contains **`base_criteria` only** — the
  `clinician_knowledge_modifications` key no longer exists there.
- [data.ts:86](frontend/lib/data.ts#L86) still reads
  `rawCriteria.clinician_knowledge_modifications[0]`, so `next build` fails:

  ```
  Error prerendering /patients
  TypeError: Cannot read properties of undefined (reading '0')
  ```

**Fix:** import `data/clinician_knowledge.json` and read element `[0]` from it
(it's a bare array, so `rawKnowledge[0]` rather than `rawFile.clinician_knowledge_modifications[0]`).

---

## 2. Margaret Davis → Mark Davis

[data.ts:591](frontend/lib/data.ts#L591) has `patientName: "Margaret Davis"`.

pt_011 was switched to **male ("Mark Davis")** to match Jae's recorded voice; the
data (`data/patients.json`) is already correct. Update the hardcoded string.

---

*Jae's data folder is clean and verified — these are the only two frontend touch-ups needed.*
