"""
Screening engine — the core (§27):
1. deterministic criteria vs structured patient data;
2. Claude interpretation for note-based / judgement criteria;
3. apply clinician knowledge triggers;
4. compute match score per §32 (score never overrides confirmed exclusion);
5. produce overall status + §22 result. Missing data != excluded (§9.4).
"""
