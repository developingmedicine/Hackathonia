import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import DemoResetButton from "@/components/DemoResetButton";

export const metadata: Metadata = {
  title: "Beacon — Clinical Trial Enrollment Copilot",
  description:
    "Clinician-guided trial screening, enrollment readiness, and follow-up monitoring. Synthetic data only.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
            <Link
              href="/trials"
              className="flex items-center gap-2 font-semibold tracking-tight text-slate-900"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
                B
              </span>
              Beacon
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/trials"
                className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Trial Explorer
              </Link>
              <Link
                href="/patients"
                className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Patient Queue
              </Link>
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-xs text-slate-400 md:block">
                Synthetic data · decision support only
              </span>
              <DemoResetButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
