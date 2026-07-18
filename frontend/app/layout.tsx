import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import DemoResetButton from "@/components/DemoResetButton";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });

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
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans">
        <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-6">
            <Link
              href="/trials"
              className="flex items-center gap-2.5 text-[17px] font-bold tracking-tight text-ink"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                B
              </span>
              Beacon
            </Link>
            <nav className="flex items-center gap-1 text-sm font-medium">
              <Link
                href="/trials"
                className="rounded-full px-4 py-2 text-inkmid transition hover:bg-creamdeep hover:text-ink"
              >
                Trial Explorer
              </Link>
              <Link
                href="/patients"
                className="rounded-full px-4 py-2 text-inkmid transition hover:bg-creamdeep hover:text-ink"
              >
                Patient Queue
              </Link>
            </nav>
            <div className="ml-auto">
              <DemoResetButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 pb-10 pt-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 pb-8">
          <p className="text-center text-[11px] leading-relaxed text-inksoft">
            Beacon is a supplemental clinical decision support tool and may
            contain errors. All eligibility assessments use synthetic data and
            require independent clinician review and confirmation.
          </p>
        </footer>
      </body>
    </html>
  );
}
