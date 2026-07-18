/**
 * PAGE 4 — Patient Eligibility Review.
 * v1.1 layout (Jae review): SUMMARY AT TOP (visual hierarchy), then work-up
 * checklist high on the page, then a TWO-COLUMN eligibility table:
 *   LEFT  = criterion + status (MET / LIKELY MET / MISSING / NEEDS REVIEW)
 *   RIGHT = evidence as citations (verbatim text · source · date)
 * Status actions: Mark Enrollment Ready / Exclude / Keep Under Review.
 * Data: GET /api/patients/{id}, POST /api/screenings, PATCH /trial-status.
 * PRD: §13 Page 4 (v1.1 block), §22, §24.6/24.8/24.10.
 */
