"use client";

// Transcript display shared by Pages 2 & 6: simulated typing while
// transcribing, editable once ready (Page 2 requirement).

export default function TranscriptPanel({
  value,
  editable,
  typing,
  onChange,
}: {
  value: string;
  editable?: boolean;
  typing?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Transcript{editable ? " (editable)" : ""}
      </h4>
      {editable && !typing ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={5}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 focus:border-slate-400 focus:outline-none"
        />
      ) : (
        <div className="mt-2 min-h-24 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700">
          {value || (
            <span className="italic text-slate-400">
              Transcript will appear here…
            </span>
          )}
          {typing && <span className="animate-pulse">▋</span>}
        </div>
      )}
    </div>
  );
}
