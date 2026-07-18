"use client";

// Transcript display shared by Pages 2 & 6: simulated typing while
// transcribing, editable once ready (Page 2 requirement).

export default function TranscriptPanel({
  value,
  editable,
  typing,
  caption,
  onChange,
}: {
  value: string;
  editable?: boolean;
  typing?: boolean;
  caption?: string; // provenance note, e.g. live Whisper transcription
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-inksoft">
        Transcript{editable ? " (editable)" : ""}
      </h4>
      {editable && !typing ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={5}
          className="mt-2.5 w-full rounded-2xl bg-cream p-4 text-sm leading-relaxed text-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
      ) : (
        <div className="mt-2.5 min-h-24 rounded-2xl bg-cream p-4 text-sm leading-relaxed text-inkmid">
          {value || (
            <span className="italic text-inksoft">
              {typing ? "Listening…" : "Transcript will appear here…"}
            </span>
          )}
          {typing && value && <span className="animate-pulse">▋</span>}
        </div>
      )}
      {caption && !typing && (
        <p className="mt-2 text-[11px] font-semibold text-inksoft">{caption}</p>
      )}
    </div>
  );
}
