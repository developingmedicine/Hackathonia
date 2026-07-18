// POST /api/cohort — live Claude answer to a natural-language cohort-level
// surveillance question over the 12-patient queue (Page 3 "Ask Beacon").
// Guardrails: matches are validated against real patient ids server-side and
// the UI derives counts from the matches array, so the number shown is never
// model prose. Falls back to hand-checked seeded answers for the example
// queries on any failure (PRD §38).

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { cohortContext, COHORT_SEEDED, PATIENTS } from "@/lib/data";

export const maxDuration = 60;

const client = new Anthropic({ maxRetries: 1 });

const SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          patient_id: { type: "string" },
          evidence: { type: "string" },
        },
        required: ["patient_id", "evidence"],
        additionalProperties: false,
      },
    },
    caveats: { type: "array", items: { type: "string" } },
  },
  required: ["answer", "matches", "caveats"],
  additionalProperties: false,
} as const;

const SYSTEM = `You answer cohort-level surveillance questions for Beacon, a clinical-trial enrollment copilot demo (trial NCT07589608, 12 synthetic patients, no PHI). The user message contains the full cohort as JSON: per-patient demographics, trial status, conditions (ICD-10), medications, observations, social history, adverse events, and follow-up transcripts where available.

Rules:
- "matches" lists ONLY patients whose provided record supports the answer. Each evidence string quotes the record verbatim (an observation, code + condition name, adverse-event supporting text, or the patient's transcript words) and names where it came from.
- "answer" is 1-3 plain sentences; any count you state must equal the number of matches.
- Decision-support framing only: surface findings for the trial physician to review — never diagnose, never recommend exclusion or enrollment.
- If the provided data cannot answer the question, say so plainly and return an empty matches array.
- "caveats": 0-2 short notes on data limits (e.g. symptom attribution requires clinician review).`;

const NAME_BY_ID = new Map(PATIENTS.map((p) => [p.id, p.name]));

function seededFor(question: string) {
  const key = Object.keys(COHORT_SEEDED).find(
    (k) => k.trim().toLowerCase() === question.trim().toLowerCase(),
  );
  if (key) return { ...COHORT_SEEDED[key], source: "seeded" as const };
  return {
    answer:
      "Live Claude cohort query is unavailable and there is no seeded answer for this question — try one of the example queries.",
    matches: [],
    caveats: [],
    source: "seeded" as const,
  };
}

export async function POST(req: Request) {
  // Parse outside the model try/catch but never let a malformed body 500 —
  // the seeded-fallback guarantee (§38) must cover every failure path.
  let question = "";
  let overrides: Record<string, { status?: string; reason?: string }> = {};
  try {
    const body = (await req.json()) as {
      question?: string;
      overrides?: Record<string, { status?: string; reason?: string }>;
    };
    if (typeof body.question === "string") question = body.question;
    if (body.overrides && typeof body.overrides === "object")
      overrides = body.overrides;
  } catch {
    // fall through with empty question → generic seeded response
  }
  if (!question.trim()) return NextResponse.json(seededFor(""));
  try {
    // Clinician-confirmed session overrides (e.g. Elizabeth's confirmed
    // disqualification) live in the browser; the client sends them so the
    // cohort answer can't contradict the queue the presenter just updated.
    const overrideNote = Object.keys(overrides).length
      ? `\n\nClinician-confirmed status overrides from this session (authoritative — they supersede trial_status in the cohort JSON): ${JSON.stringify(overrides)}`
      : "";
    const response = await client.messages.create(
      {
        model: "claude-opus-4-8",
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        output_config: {
          effort: "low",
          format: { type: "json_schema", schema: SCHEMA },
        },
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: `Cohort (JSON):\n${cohortContext()}${overrideNote}\n\nQuestion: ${question}`,
          },
        ],
      },
      { timeout: 45_000 },
    );
    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    const parsed = JSON.parse(text) as {
      answer?: string;
      matches?: { patient_id: string; evidence: string }[] | null;
      caveats?: string[] | null;
    };
    // Guardrails: drop hallucinated ids, dedup repeats, attach real names.
    const seen = new Set<string>();
    const matches: { patient_id: string; evidence: string; name: string }[] =
      [];
    let dropped = 0;
    for (const m of Array.isArray(parsed.matches) ? parsed.matches : []) {
      const name = NAME_BY_ID.get(m.patient_id);
      if (!name || seen.has(m.patient_id)) {
        dropped++;
        continue;
      }
      seen.add(m.patient_id);
      matches.push({ ...m, name });
    }
    const caveats = Array.isArray(parsed.caveats) ? [...parsed.caveats] : [];
    if (dropped > 0) {
      caveats.push(
        "Some model citations could not be verified against the patient records and were removed — the matched list below is the validated one.",
      );
    }
    return NextResponse.json({
      answer: parsed.answer ?? "",
      matches,
      caveats,
      source: "live",
    });
  } catch (err) {
    console.error("cohort query failed; seeded fallback:", err);
    return NextResponse.json(seededFor(question));
  }
}
