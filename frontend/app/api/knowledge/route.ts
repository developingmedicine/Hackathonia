// POST /api/knowledge — live Claude conversion of a clinician's spoken
// guidance into structured screening guidance (PRD §21, §24.4, §31).
// Falls back to the seeded guidance on any failure (§38).

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import rawCriteriaJson from "../../../../data/criteria.json";
import { GUIDANCE } from "@/lib/data";

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
    annotates: { type: "string" },
    bullets: { type: "array", items: { type: "string" } },
  },
  required: ["annotates", "bullets"],
  additionalProperties: false,
} as const;

const SYSTEM = `You convert a trial clinician's spoken guidance into structured screening guidance for Beacon, a clinical-trial enrollment copilot demo (trial NCT07589608, synthetic data only).

Return:
- "annotates": the single existing trial criterion this guidance most directly annotates, formatted "<normalized text> (<criterion_id>)", chosen from the list below. The clinician never creates new criteria — only adds context to existing ones.
- "bullets": 3-5 short imperative bullets capturing the triggers (thresholds, diagnosis codes, conditions) and effects (flag for review, do NOT auto-exclude, priority adjustments) exactly as stated. Do not invent thresholds or codes the clinician did not say.

Trial criteria:
${criteriaList}`;

export async function POST(req: Request) {
  const { transcript } = (await req.json()) as { transcript: string };
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
            content: `Clinician voice transcript:\n"""\n${transcript}\n"""`,
          },
        ],
      },
      { timeout: 45_000 },
    );
    const text = response.content.find((b) => b.type === "text")?.text ?? "";
    const parsed = JSON.parse(text);
    return NextResponse.json({ ...parsed, source: "live" });
  } catch (err) {
    console.error("knowledge extraction failed; seeded fallback:", err);
    return NextResponse.json({ ...GUIDANCE, source: "seeded" });
  }
}
