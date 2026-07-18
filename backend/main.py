"""
FastAPI app assembly.
- Mount routers: trials, patients, screenings, follow_up.
- CORS for the Next.js dev origin.
- Startup: load seeded JSON data + cached trial/parse/screening results (PRD §38).
No business logic here — everything lives in services/.
"""
