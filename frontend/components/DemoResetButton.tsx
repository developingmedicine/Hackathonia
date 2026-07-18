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
      className="rounded-full bg-creamdeep px-3.5 py-1.5 text-xs font-medium text-inkmid transition hover:bg-white"
    >
      Reset demo
    </button>
  );
}
