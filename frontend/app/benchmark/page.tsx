// PAGE — Model Benchmark (demo closer, not in nav). Renders the live eval
// results from scripts/eval_models.mjs (data/training/eval_results.json) and
// the training-dataset stats (data/training/train.jsonl). Files are read at
// request time so re-running the eval refreshes this page on reload. Scores
// are genuinely computed — nothing seeded (PRD hard rule).

import fs from "node:fs";
import path from "node:path";
import rawCriteriaJson from "../../../data/criteria.json";

export const dynamic = "force-dynamic";

interface CriterionScore {
  correct: number;
  total: number;
}
interface Mismatch {
  patient_id: string;
  criterion_id: string;
  expected: string;
  predicted: string;
  model_evidence: string;
}
interface ModelResult {
  model: string;
  label: string;
  deterministic_accuracy: CriterionScore;
  per_criterion: Record<string, CriterionScore>;
  evidence_groundedness: { grounded: number; checkable: number };
  mismatches: Mismatch[];
}
interface EvalFile {
  started_at: string;
  trial: string;
  results: ModelResult[];
}

const TRAINING_DIR = path.resolve(process.cwd(), "..", "data", "training");

function loadEval(): EvalFile | null {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(TRAINING_DIR, "eval_results.json"), "utf8"),
    ) as EvalFile;
  } catch {
    return null;
  }
}

function loadDatasetCounts(): { total: number; bySource: [string, number][] } | null {
  try {
    const lines = fs
      .readFileSync(path.join(TRAINING_DIR, "train.jsonl"), "utf8")
      .split("\n")
      .filter(Boolean);
    const bySource: Record<string, number> = {};
    for (const line of lines) {
      const src = (JSON.parse(line).metadata?.label_source ?? "unknown") as string;
      bySource[src] = (bySource[src] ?? 0) + 1;
    }
    return { total: lines.length, bySource: Object.entries(bySource) };
  } catch {
    return null;
  }
}

const CRITERIA_TEXT: Record<string, string> = Object.fromEntries(
  (rawCriteriaJson as { base_criteria: { criterion_id: string; normalized_text: string }[] })
    .base_criteria.map((c) => [c.criterion_id, c.normalized_text]),
);

const SOURCE_LABELS: Record<string, string> = {
  deterministic_screener: "Deterministic screener (patient × criterion)",
  clinician_ground_truth: "Clinician ground truth (whole-patient outcome)",
  clinician_knowledge_rule: "Clinician knowledge rules (voice → trigger)",
  recorded_transcript: "Recorded voice transcripts (structured output)",
};

const pct = (a: number, b: number) => (b ? `${Math.round((100 * a) / b)}%` : "—");

export default function BenchmarkPage() {
  const evalData = loadEval();
  const dataset = loadDatasetCounts();

  if (!evalData) {
    return (
      <div className="pt-4">
        <h1 className="text-4xl font-bold tracking-tight text-ink">Model benchmark.</h1>
        <p className="mt-4 max-w-xl text-sm text-inkmid">
          No eval results found. Run{" "}
          <code className="rounded bg-creamdeep px-1.5 py-0.5 text-xs">
            node scripts/eval_models.mjs
          </code>{" "}
          from the repo root, then reload this page.
        </p>
      </div>
    );
  }

  const { results } = evalData;
  const runDate = new Date(evalData.started_at);

  return (
    <div className="pt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">Model benchmark.</h1>
          <p className="mt-2 text-sm text-inkmid">
            Live eval over the synthetic cohort · trial {evalData.trial} · scored against
            programmatic ground truth
          </p>
        </div>
        <span className="rounded-full bg-lav px-4 py-2 text-xs font-semibold text-lavdeep">
          Genuinely computed · {runDate.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </span>
      </div>

      {/* Headline metric cards */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {results.map((r) => {
          const a = r.deterministic_accuracy;
          const g = r.evidence_groundedness;
          return (
            <div key={r.model} className="rounded-3xl bg-white p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold text-ink">{r.label}</h2>
                <span className="text-[11px] text-inksoft">{r.model}</span>
              </div>
              <div className="mt-4 flex items-end gap-8">
                <div>
                  <div className="text-4xl font-bold tracking-tight text-ink">
                    {pct(a.correct, a.total)}
                  </div>
                  <div className="mt-1 text-xs text-inkmid">
                    deterministic accuracy · {a.correct}/{a.total}
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold tracking-tight text-sagedeep">
                    {pct(g.grounded, g.checkable)}
                  </div>
                  <div className="mt-1 text-xs text-inkmid">
                    evidence grounded · {g.grounded}/{g.checkable}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-inksoft">
                {r.mismatches.length === 0
                  ? "Perfect score on all deterministic criteria."
                  : `${r.mismatches.length} miss${r.mismatches.length > 1 ? "es" : ""} — see failure modes below.`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Per-criterion table */}
      <div className="mt-6 rounded-3xl bg-white p-6">
        <h2 className="text-lg font-bold text-ink">Accuracy by criterion</h2>
        <p className="mt-1 text-xs text-inkmid">
          Deterministic criteria only — note-interpretation criteria are unscored by design
          (no automatic ground truth; they go to clinician review).
        </p>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-inksoft">
              <th className="pb-2 pr-4 font-semibold">Criterion</th>
              {results.map((r) => (
                <th key={r.model} className="pb-2 pr-4 font-semibold">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(results[0].per_criterion).map((cid) => (
              <tr key={cid} className="border-t border-creamdeep">
                <td className="py-2.5 pr-4">
                  <span className="font-semibold text-ink">{cid}</span>
                  <span className="ml-2 text-xs text-inkmid">{CRITERIA_TEXT[cid]}</span>
                </td>
                {results.map((r) => {
                  const pc = r.per_criterion[cid] ?? { correct: 0, total: 0 };
                  const perfect = pc.correct === pc.total;
                  return (
                    <td
                      key={r.model}
                      className={`py-2.5 pr-4 font-semibold ${perfect ? "text-sagedeep" : "text-brand"}`}
                    >
                      {pc.correct}/{pc.total}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Failure modes */}
      {results.some((r) => r.mismatches.length > 0) && (
        <div className="mt-6 rounded-3xl bg-white p-6">
          <h2 className="text-lg font-bold text-ink">Failure modes</h2>
          <p className="mt-1 text-xs text-inkmid">
            The benchmark doesn&apos;t just score models — it localizes where they fail.
          </p>
          <div className="mt-4 space-y-5">
            {results
              .filter((r) => r.mismatches.length > 0)
              .map((r) => (
                <div key={r.model}>
                  <h3 className="text-sm font-bold text-ink">{r.label}</h3>
                  <ul className="mt-2 space-y-2">
                    {r.mismatches.map((m, i) => (
                      <li
                        key={i}
                        className="rounded-2xl bg-creamdeep/60 px-4 py-3 text-xs leading-relaxed text-inkmid"
                      >
                        <span className="font-semibold text-ink">
                          {m.patient_id} · {m.criterion_id}
                        </span>{" "}
                        — expected <span className="font-semibold text-sagedeep">{m.expected}</span>,
                        got <span className="font-semibold text-brand">{m.predicted}</span>
                        {m.model_evidence && (
                          <span className="text-inksoft"> · “{m.model_evidence}”</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Dataset card */}
      {dataset && (
        <div className="mt-6 rounded-3xl bg-lav/50 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-ink">Training dataset</h2>
            <span className="text-[11px] text-lavdeep">
              data/training/train.jsonl · fine-tuning messages format · synthetic only
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-10">
            <div>
              <div className="text-4xl font-bold tracking-tight text-lavdeep">
                {dataset.total}
              </div>
              <div className="mt-1 text-xs text-inkmid">labeled samples, each with provenance</div>
            </div>
            <table className="text-sm">
              <tbody>
                {dataset.bySource.map(([src, n]) => (
                  <tr key={src}>
                    <td className="pr-6 text-xs text-inkmid">{SOURCE_LABELS[src] ?? src}</td>
                    <td className="text-right font-semibold text-ink">{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-inkmid">
            Every clinician Confirm or Override of an AI flag appends one more expert-labeled
            sample — annotation as a by-product of the clinical workflow. Today decision
            support; the same pipeline is an eval benchmark and fine-tuning flywheel.
          </p>
        </div>
      )}

      <p className="mt-6 max-w-3xl text-[11px] leading-relaxed text-inksoft">
        12 synthetic patients is an architecture proof, not a statistical benchmark: schema,
        programmatic scorer, provenance-labeled data, and failure-mode analysis are validated;
        scale comes from running the same pipeline inside the clinical workflow. Scores vary
        slightly between runs; re-run with <code>node scripts/eval_models.mjs</code>.
      </p>
    </div>
  );
}
