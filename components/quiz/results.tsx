"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Minus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { analyzeRun, STATUS_LABEL, type GradedItem } from "@/lib/scoring";
import type { AnswerStatus, RunRecord } from "@/lib/types";
import { cn, formatDate, formatDuration, formatPct, OPTION_LETTERS } from "@/lib/utils";

const FILTERS: { key: AnswerStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "incorrect", label: "Incorrect" },
  { key: "partial", label: "Partly right" },
  { key: "skipped", label: "Skipped" },
  { key: "correct", label: "Correct" },
];

const statusBadge: Record<AnswerStatus, "ok" | "warn" | "bad" | "muted"> = {
  correct: "ok",
  partial: "warn",
  incorrect: "bad",
  skipped: "muted",
};

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "ok" | "warn" | "bad" | "muted";
}) {
  const toneClass =
    tone === "ok"
      ? "text-ok"
      : tone === "warn"
        ? "text-warn"
        : tone === "bad"
          ? "text-bad"
          : tone === "muted"
            ? "text-muted-foreground"
            : "text-foreground";
  return (
    <div className="border-l pl-3 first:border-l-0 first:pl-0">
      <div className={cn("nums text-2xl font-semibold tracking-tight leading-none", toneClass)}>{value}</div>
      <div className="mt-1.5 text-xs text-muted-foreground">{label}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function ReviewRow({ g, index }: { g: GradedItem; index: number }) {
  const [open, setOpen] = useState(g.status !== "correct");
  const q = g.question;

  return (
    <div className="border-t py-3 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid w-full items-start gap-x-3 text-left"
        style={{ gridTemplateColumns: "1.5rem 1fr auto 1rem" }}
        aria-expanded={open}
      >
        <span className="nums pt-0.5 text-xs text-muted-foreground">{index + 1}.</span>
        <span className="text-[15px] font-medium leading-snug">{q.q}</span>
        <Badge variant={statusBadge[g.status]} className="mt-0.5">
          {STATUS_LABEL[g.status]}
        </Badge>
        <ChevronDown
          className={cn("mt-0.5 h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div className="mt-3 space-y-1.5 pl-9">
          {g.item.order.map((canonical, display) => {
            const selected = g.item.selected.includes(canonical);
            const correct = q.a.includes(canonical);
            const tone = correct
              ? selected
                ? "border-ok bg-ok/10"
                : "border-warn border-dashed bg-warn/10"
              : selected
                ? "border-bad bg-bad/10"
                : "border-border";
            const note = correct
              ? selected
                ? "you marked this, correct"
                : "correct answer you missed"
              : selected
                ? "you marked this, incorrect"
                : null;
            return (
              <div
                key={canonical}
                className={cn("flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-sm", tone)}
              >
                <span className="nums pt-0.5 text-xs text-muted-foreground">
                  {OPTION_LETTERS[display]}
                </span>
                <span className="max-w-reading flex-1">{q.o[canonical]}</span>
                {note && (
                  <span
                    className={cn(
                      "shrink-0 pt-0.5 text-[11px]",
                      correct && selected && "text-ok",
                      correct && !selected && "text-warn",
                      !correct && selected && "text-bad",
                    )}
                  >
                    {note}
                  </span>
                )}
              </div>
            );
          })}
          <p className="max-w-reading pt-1.5 text-sm text-muted-foreground">{q.e}</p>
          <p className="text-xs text-muted-foreground">
            Chapter {q.ch} · {q.topic}
          </p>
        </div>
      )}
    </div>
  );
}

export function Results({ run, heading }: { run: RunRecord; heading?: string }) {
  const a = useMemo(() => analyzeRun(run), [run]);
  const [filter, setFilter] = useState<AnswerStatus | "all">("all");

  const shown = a.graded.filter((g) => filter === "all" || g.status === filter);
  const missedCount = a.total - a.counts.correct;
  const worst = a.topics.filter((t) => t.credit / t.total < 1).slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{heading ?? "Run results"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(run.finishedAt)} · {a.total} questions · finished in{" "}
          <span className="nums">{formatDuration(a.durationMs)}</span> ·{" "}
          <span className="nums">{formatDuration(a.msPerQuestion)}</span> per question
        </p>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 lg:grid-cols-6">
          <Stat label="Score" value={formatPct(a.strictScore)} sub="exact matches" />
          <Stat label="With partial credit" value={formatPct(a.creditScore)} sub="per-option" />
          <Stat label={STATUS_LABEL.correct} value={String(a.counts.correct)} tone="ok" />
          <Stat label={STATUS_LABEL.partial} value={String(a.counts.partial)} tone="warn" />
          <Stat label={STATUS_LABEL.incorrect} value={String(a.counts.incorrect)} tone="bad" />
          <Stat label={STATUS_LABEL.skipped} value={String(a.counts.skipped)} tone="muted" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Where the answers went</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-ok text-white" aria-hidden>
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="flex-1">Right answers you marked</span>
              <span className="nums font-medium">
                {a.options.hits} / {a.options.totalCorrectOptions}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-warn text-warn" aria-hidden>
                <Minus className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="flex-1">Right answers you missed</span>
              <span className="nums font-medium">{a.options.missed}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-bad text-white" aria-hidden>
                <X className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="flex-1">Wrong answers you marked</span>
              <span className="nums font-medium">{a.options.wrong}</span>
            </div>
            <div className="border-t pt-3 text-muted-foreground">
              Single-answer questions:{" "}
              <span className="nums text-foreground">
                {a.single.correct}/{a.single.total}
              </span>{" "}
              · Multi-answer questions:{" "}
              <span className="nums text-foreground">
                {a.multi.correct}/{a.multi.total}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By chapter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {a.chapters.map((c) => (
              <div key={c.ch}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    <span className="text-muted-foreground">Ch {c.ch}</span> {c.label}
                  </span>
                  <span className="nums text-muted-foreground">
                    {c.correct}/{c.total}
                  </span>
                </div>
                <Progress
                  value={(c.credit / c.total) * 100}
                  className="mt-1.5"
                  label={`Chapter ${c.ch} score`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {worst.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topics to go back to</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {worst.map((t) => (
              <span
                key={`${t.ch}-${t.topic}`}
                className="rounded-md border bg-secondary/50 px-2.5 py-1 text-sm"
              >
                {t.topic}{" "}
                <span className="nums text-muted-foreground">
                  {t.correct}/{t.total}
                </span>
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-2 text-lg font-semibold tracking-tight">Question by question</h2>
          {FILTERS.map((f) => {
            const count = f.key === "all" ? a.total : a.counts[f.key];
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  filter === f.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary",
                )}
              >
                {f.label} <span className="nums">{count}</span>
              </button>
            );
          })}
        </div>

        <Card className="mt-3">
          <CardContent className="p-5">
            {shown.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing in this category.</p>
            ) : (
              shown.map((g) => (
                <ReviewRow key={g.question.id} g={g} index={a.graded.indexOf(g)} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/practice?new=1" className={cn(buttonVariants())}>
          Start another run
        </Link>
        {missedCount > 0 && (
          <Link
            href={`/practice?retry=${run.id}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Redo the {missedCount} you didn&apos;t get
          </Link>
        )}
        <Link href="/history" className={cn(buttonVariants({ variant: "ghost" }))}>
          See all runs
        </Link>
      </div>
    </div>
  );
}
