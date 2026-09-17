"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { countByChapter, QUESTIONS } from "@/data/questions";
import { analyzeRun } from "@/lib/scoring";
import {
  clearActiveRun,
  DEFAULT_SETTINGS,
  loadActiveRun,
  loadRuns,
  loadSettings,
  saveSettings,
} from "@/lib/storage";
import { CHAPTERS, type ChapterId, type RunRecord, type RunSettings } from "@/lib/types";
import { cn, formatDate, formatDuration, formatPct } from "@/lib/utils";

const MAX_RUN_SIZE = 50;
const CHAPTER_IDS: ChapterId[] = [1, 2, 3, 4, 5];

export default function StartPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<RunSettings>(DEFAULT_SETTINGS);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [hasActive, setHasActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setRuns(loadRuns());
    setHasActive(!!loadActiveRun());
    setReady(true);
  }, []);

  const counts = countByChapter();
  const pool = QUESTIONS.filter((q) => settings.chapters.includes(q.ch)).length;
  const runLength = Math.min(settings.count, pool);

  function update(patch: Partial<RunSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  }

  function toggleChapter(ch: ChapterId) {
    const on = settings.chapters.includes(ch);
    const next = on ? settings.chapters.filter((c) => c !== ch) : [...settings.chapters, ch];
    if (next.length === 0) return; // at least one chapter has to stay selected
    update({ chapters: next.sort() });
  }

  function start() {
    clearActiveRun();
    router.push("/practice?new=1");
  }

  const lastRuns = runs.slice(0, 5);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Questions, one clock, then the damage report.
        </h1>
        <p className="mt-3 max-w-reading text-[15px] text-muted-foreground">
          {QUESTIONS.length} multiple-choice questions drawn from Chapters 1&ndash;5. Some have more
          than one right answer, so each question is scored on what you marked, what you got wrong,
          and what you left out.
        </p>
      </section>

      {hasActive && ready && (
        <Card className="border-warn/50 bg-warn/[0.06]">
          <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm">
            <RotateCcw className="h-4 w-4 text-warn" aria-hidden />
            <span className="flex-1">You have a run in progress. The clock is paused.</span>
            <Link href="/practice" className={cn(buttonVariants({ size: "sm" }))}>
              Resume it
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                clearActiveRun();
                setHasActive(false);
              }}
            >
              Discard
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Set up this run</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium">Chapters to draw from</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {CHAPTER_IDS.map((ch) => {
                const on = settings.chapters.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChapter(ch)}
                    aria-pressed={on}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-left text-sm transition-colors",
                      on ? "border-primary bg-accent/60" : "hover:bg-secondary",
                    )}
                  >
                    <span className="text-muted-foreground">Ch {ch}</span> {CHAPTERS[ch]}{" "}
                    <span className="nums text-muted-foreground">{counts[ch] ?? 0}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground nums">
              {pool} questions in the pool
            </p>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">Questions per run</p>
              <span className="nums text-sm font-semibold tabular-nums">
                {runLength}
                {runLength < settings.count && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">(pool limit)</span>
                )}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={MAX_RUN_SIZE}
              value={settings.count}
              onChange={(e) => update({ count: Number(e.target.value) })}
              className="mt-2 w-full accent-primary"
              aria-label="Number of questions"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground nums">
              <span>1</span>
              <span>{MAX_RUN_SIZE}</span>
            </div>
          </div>

          <div className="space-y-3 border-t pt-5">
            <div className="flex items-start gap-3 text-sm">
              <Switch
                id="feedback"
                checked={settings.immediateFeedback}
                onCheckedChange={(v) => update({ immediateFeedback: v })}
              />
              <span>
                Show the answer after each question
                <span className="block text-xs text-muted-foreground">
                  Checking an answer locks it. Leave this off to see everything at the end.
                </span>
              </span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Switch
                id="shuffle"
                checked={settings.shuffleOptions}
                onCheckedChange={(v) => update({ shuffleOptions: v })}
              />
              <span>
                Shuffle the answer options
                <span className="block text-xs text-muted-foreground">
                  Stops you from remembering that the answer was &ldquo;c&rdquo; last time.
                </span>
              </span>
            </div>
          </div>

          <Button size="lg" onClick={start} disabled={!ready}>
            <Play className="h-4 w-4" aria-hidden />
            Start {runLength}-question run
          </Button>
        </CardContent>
      </Card>

      {lastRuns.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent runs</h2>
            <Link href="/history" className="text-sm text-primary hover:underline">
              All runs
            </Link>
          </div>
          <Card className="mt-3">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-5 py-2.5 font-medium">Finished</th>
                    <th className="px-5 py-2.5 font-medium">Score</th>
                    <th className="px-5 py-2.5 font-medium">Missed</th>
                    <th className="px-5 py-2.5 font-medium">Time</th>
                    <th className="px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {lastRuns.map((r) => {
                    const a = analyzeRun(r);
                    return (
                      <tr key={r.id} className="border-b last:border-b-0">
                        <td className="px-5 py-2.5">{formatDate(r.finishedAt)}</td>
                        <td className="nums px-5 py-2.5 font-medium">
                          {formatPct(a.strictScore)}{" "}
                          <span className="text-xs text-muted-foreground">
                            {a.counts.correct}/{a.total}
                          </span>
                        </td>
                        <td className="nums px-5 py-2.5 text-muted-foreground">
                          {a.total - a.counts.correct}
                        </td>
                        <td className="nums px-5 py-2.5 text-muted-foreground">
                          {formatDuration(r.durationMs)}
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <Link href={`/history/${r.id}`} className="text-primary hover:underline">
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
