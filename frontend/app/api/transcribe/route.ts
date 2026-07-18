// POST /api/transcribe — live speech-to-text via OpenAI Whisper for the real
// mic-recording path (Pages 2 & 6). The seeded demo-audio path never hits this
// route; without OPENAI_API_KEY the UI surfaces the error and the demo audio
// remains the fallback (PRD §38).

import { NextResponse } from "next/server";

export const maxDuration = 60;

// Bias Whisper toward the demo's clinical vocabulary (whisper-1 prompt param).
const VOCAB_PROMPT =
  "Clinical trial screening conversation. Terms: macupatide, eloralintide, " +
  "GLP-1, incretin, biliary pancreatitis, cholecystectomy, gallbladder, " +
  "lipase, HbA1c, exclusion criteria, NCT07589608.";

export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error:
          "Live transcription needs OPENAI_API_KEY in frontend/.env.local — use the demo audio instead.",
      },
      { status: 503 },
    );
  }
  try {
    const form = await req.formData();
    const audio = form.get("audio");
    if (!(audio instanceof File) || audio.size === 0) {
      return NextResponse.json({ error: "No audio received." }, { status: 400 });
    }
    const upstream = new FormData();
    upstream.append("file", audio, audio.name || "recording.webm");
    upstream.append("model", "whisper-1");
    upstream.append("language", "en");
    upstream.append("prompt", VOCAB_PROMPT);
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: upstream,
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      console.error("whisper error:", res.status, await res.text());
      return NextResponse.json(
        {
          error: `Whisper request failed (HTTP ${res.status}) — try again or use the demo audio.`,
        },
        { status: 502 },
      );
    }
    const { text } = (await res.json()) as { text?: unknown };
    if (typeof text !== "string") {
      console.error("whisper response missing text field");
      return NextResponse.json(
        { error: "Whisper returned no transcript — try again or use the demo audio." },
        { status: 502 },
      );
    }
    return NextResponse.json({ text });
  } catch (err) {
    console.error("transcription failed:", err);
    return NextResponse.json(
      { error: "Transcription failed — try again or use the demo audio." },
      { status: 502 },
    );
  }
}
