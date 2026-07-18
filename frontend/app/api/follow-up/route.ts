// POST /api/follow-up — live Claude extraction of adverse events +
// disqualification surveillance from a follow-up transcript (PRD §24.11,
// §31). Falls back to the seeded scenario result on any failure (§38), so
// the demo never depends on network or API-key availability.

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import rawCriteriaJson from "../../../../data/criteria.json";
import { FOLLOWUPS } from "@/lib/data";
import type { FollowUpExtraction } from "@/types";

export const maxDuration = 60;

const client = new Anthropic({ maxRetries: 1 });

const criteriaList = (
  rawCriteriaJson as {
    base_criteria: {
      criterion_id: string;
      criterion_type: string;
      normalized_text: string;
    }[];
  }
).base_criteria
  .map((c) => `- [${c.criterion_id}] (${c.criterion_type}) ${c.normalized_text}`)
  .join("\n");

const SCHEMA = {
  type: "object",
  properties: {
    events: {
      type: "array",
      items: {
        type: "object",
        properties: {
          event: { type: "string" },
          detail: { type: "string" },
          confidence: { type: "integer" },
        },
        required: ["event", "detail", "confidence"],
        additionalProperties: false,
      },
    },
    footnotes: { type: "array", items: { type: "string" } },
    escalation: { anyOf: [{ type: "string" }, { type: "null" }] },
    disqualification: {
      anyOf: [
        {
          type: "object",
          properties: {
            criterion: { type: "string" },
            evidence: { type: "string" },
          },
          required: ["criterion", "evidence"],
          additionalProperties: false,
        },
        { type: "null" },
      ],
    },
  },
  required: ["events", "footnotes", "escalation", "disqualification"],
  additionalProperties: false,
} as const;

const SYSTEM = `You are the adverse-event extraction service for Beacon, a clinical-trial enrollment copilot demo running on synthetic data only. Extract possible adverse events from a patient's follow-up-visit transcript for trial NCT07589608.

Rules:
- Extract only what the transcript supports. "detail" should quote or closely paraphrase the patient's words (timing, frequency, severity). "confidence" is an integer 0-100.
- "footnotes": 2-4 short observations — possible relationship to study medication, hydration/oral intake status, and whether clinician review is recommended. Everything is decision support requiring clinician confirmation; never diagnose or decide autonomously.
- "escalation": if the symptoms warrant notifying the trial physician promptly (severity, dehydration risk, functional decline, medication-tolerance/dropout risk), give a one-sentence recommendation; otherwise null.
- "disqualification": compare the transcript against the trial's exclusion criteria below. If it reveals the patient now meets one, return {"criterion": "<normalized text> (<criterion_id>)", "evidence": "<verbatim quote from the transcript>"}; otherwise null. Only flag genuine matches.

Trial criteria:
${criteriaList}`;

function seeded(patientId: string): FollowUpExtraction {
  const s = FOLLOWUPS[patientId];
  if (!s) return { events: [], footnotes: [], escalation: null, disqualification: null, source: "seeded" };
  return {
    events: s.events,
    footnotes: s.footnotes,
    escalation: s.escalation ?? null,
    disqualification: s.disqualification ?? null,
    source: "seeded",
  };
}

export async function POST(req: Request) {
  const { patientId, transcript } = (await req.json()) as {
    patientId: string;
    transcript: string;
  };
  try {
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
            content: `Follow-up visit transcript:\n"""\n${transcript}\n"""`,
          },
        ],
      },
      { timeout: 45_000 },
    );
    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    const parsed = JSON.parse(text);
    return NextResponse.json({ ...parsed, source: "live" });
  } catch (err) {
    console.error("follow-up extraction failed; seeded fallback:", err);
    return NextResponse.json(seeded(patientId));
  }
}
