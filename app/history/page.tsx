"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { analyzeRun } from "@/lib/scoring";
import { clearRuns, deleteRun, loadRuns } from "@/lib/storage";
import type { RunRecord } from "@/lib/types";
import { cn, formatDate, formatDuration, formatPct } from "@/lib/utils";

export default function HistoryPage() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRuns(loadRuns());
    setReady(true);
  }, []);

  const analyses = runs.map((r) => ({ run: r, a: analyzeRun(r) }));
  const best = analyses.reduce((m, x) => Math.max(m, x.a.strictScore), 0);
  const avgScore = analyses.length
    ? analyses.reduce((s, x) => s + x.a.strictScore, 0) / analyses.length
    : 0;
  const avgTime = analyses.length
    ? analyses.reduce((s, x) => s + x.run.durationMs, 0) / analyses.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Run history</h1>
        {runs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm("Delete every saved run from this browser?")) {
                clearRuns();
                setRuns([]);
              }
            }}
          >
            Clear all runs
          </Button>
        )}
      </div>

      {ready && runs.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              No runs saved yet. Finish one and it will show up here with its score and time.
            </p>
            <Link href="/" className={cn(buttonVariants(), "mt-4")}>
              Start a run
            </Link>
          </CardContent>
        </Card>
      )}

      {runs.length > 0 && (
        <>
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              <div>
                <div className="nums text-2xl font-semibold tracking-tight leading-none">{runs.length}</div>
                <div className="mt-1.5 text-xs text-muted-foreground">runs finished</div>
              </div>
              <div className="border-l pl-4">
                <div className="nums text-2xl font-semibold tracking-tight leading-none">{formatPct(best)}</div>
                <div className="mt-1.5 text-xs text-muted-foreground">best score</div>
              </div>
              <div className="border-l pl-4">
                <div className="nums text-2xl font-semibold tracking-tight leading-none">{formatPct(avgScore)}</div>
                <div className="mt-1.5 text-xs text-muted-foreground">average score</div>
              </div>
              <div className="border-l pl-4">
                <div className="nums text-2xl font-semibold tracking-tight leading-none">{formatDuration(avgTime)}</div>
                <div className="mt-1.5 text-xs text-muted-foreground">average time</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-5 py-2.5 font-medium">Finished</th>
                    <th className="px-5 py-2.5 font-medium">Score</th>
                    <th className="px-5 py-2.5 font-medium">Partial</th>
                    <th className="px-5 py-2.5 font-medium">Skipped</th>
                    <th className="px-5 py-2.5 font-medium">Time</th>
                    <th className="px-5 py-2.5 font-medium">Chapters</th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {analyses.map(({ run, a }) => (
                    <tr key={run.id} className="border-b last:border-b-0">
                      <td className="px-5 py-2.5">{formatDate(run.finishedAt)}</td>
                      <td className="nums px-5 py-2.5 font-medium">
                        {formatPct(a.strictScore)}{" "}
                        <span className="text-xs text-muted-foreground">
                          {a.counts.correct}/{a.total}
                        </span>
                      </td>
                      <td className="nums px-5 py-2.5 text-muted-foreground">
                        {formatPct(a.creditScore)}
                      </td>
                      <td className="nums px-5 py-2.5 text-muted-foreground">{a.counts.skipped}</td>
                      <td className="nums px-5 py-2.5 text-muted-foreground">
                        {formatDuration(run.durationMs)}
                      </td>
                      <td className="nums px-5 py-2.5 text-muted-foreground">
                        {run.settings.chapters.join(", ")}
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/history/${run.id}`} className="text-primary hover:underline">
                            Review
                          </Link>
                          <button
                            type="button"
                            aria-label="Delete this run"
                            onClick={() => {
                              deleteRun(run.id);
                              setRuns(loadRuns());
                            }}
                            className="text-muted-foreground hover:text-bad"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
