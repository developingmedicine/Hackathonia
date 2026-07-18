"use client";

// One-click demo reset (PRD §38): clears local overrides, back to seeded state.

import { resetDemo } from "@/lib/demo";

export default function DemoResetButton() {
  return (
    <button
      onClick={() => {
        resetDemo();
        window.location.href = "/trials";
      }}
      className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100"
    >
      Reset demo
    </button>
  );
}
