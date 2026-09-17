"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, SkipForward } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";
import { Progress } from "@/components/ui/progress";
import { QuestionCard } from "@/components/quiz/question-card";
import { Results } from "@/components/quiz/results";
import { RunTimer } from "@/components/quiz/timer";
import { getQuestion } from "@/data/questions";
import { clearActiveRun, saveActiveRun, saveRun } from "@/lib/storage";
import type { ActiveRun, RunRecord } from "@/lib/types";
import { cn, OPTION_LETTERS } from "@/lib/utils";

export function Runner({ initial, title }: { initial: ActiveRun; title?: string }) {
  const [run, setRun] = useState<ActiveRun>(initial);
  const runRef = useRef(initial);
  const [finished, setFinished] = useState<RunRecord | null>(null);

  const baseRef = useRef(initial.elapsedMs);
  const sessionStartRef = useRef(Date.now());
  const finalDurationRef = useRef<number | null>(null);

  // Keep ref in sync so callbacks always read the latest run without stale closures.
  runRef.current = run;

  const getElapsed = useCallback(() => {
    if (finalDurationRef.current !== null) return finalDurationRef.current;
    return baseRef.current + (Date.now() - sessionStartRef.current);
  }, []);

  const total = run.items.length;
  const item = run.items[run.index];
  const question = item ? getQuestion(item.qid) : undefined;
  const answeredCount = run.items.filter((i) => i.selected.length > 0).length;
  const revealed = run.settings.immediateFeedback && !!item?.visited;
  const isLast = run.index === total - 1;

  const updateItem = useCallback(
    (index: number, patch: (prev: ActiveRun["items"][number]) => ActiveRun["items"][number]) => {
      const prev = runRef.current;
      const next: ActiveRun = {
        ...prev,
        items: prev.items.map((it, i) => (i === index ? patch(it) : it)),
      };
      runRef.current = next;
      setRun(next);
      saveActiveRun({ ...next, elapsedMs: getElapsed() });
    },
    [getElapsed],
  );

  const toggle = useCallback(
    (canonicalIndex: number) => {
      if (revealed || !question) return;
      const multi = question.a.length > 1;
      updateItem(run.index, (prev) => {
        const has = prev.selected.includes(canonicalIndex);
        if (!multi) return { ...prev, selected: has ? [] : [canonicalIndex] };
        return {
          ...prev,
          selected: has
            ? prev.selected.filter((i) => i !== canonicalIndex)
            : [...prev.selected, canonicalIndex],
        };
      });
    },
    [question, revealed, run.index, updateItem],
  );

  const goTo = useCallback((index: number) => {
    const prev = runRef.current;
    const next: ActiveRun = { ...prev, index: Math.max(0, Math.min(prev.items.length - 1, index)) };
    runRef.current = next;
    setRun(next);
    saveActiveRun({ ...next, elapsedMs: getElapsed() });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [getElapsed]);

  const markVisited = useCallback(() => {
    updateItem(run.index, (prev) => ({ ...prev, visited: true }));
  }, [run.index, updateItem]);

  const finish = useCallback(
    (items: ActiveRun["items"]) => {
      const duration = getElapsed();
      finalDurationRef.current = duration;
      const record: RunRecord = {
        id: run.id,
        startedAt: run.startedAt,
        finishedAt: Date.now(),
        durationMs: duration,
        settings: run.settings,
        items,
      };
      saveRun(record);
      clearActiveRun();
      setFinished(record);
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    },
    [getElapsed, run.id, run.settings, run.startedAt],
  );

  const attemptFinish = useCallback(() => {
    const items = run.items.map((it, i) => (i === run.index ? { ...it, visited: true } : it));
    const unanswered = items.filter((it) => it.selected.length === 0).length;
    if (unanswered > 0) {
      const ok = window.confirm(
        `${unanswered} question${unanswered === 1 ? "" : "s"} still unanswered. They will be scored as skipped. Finish the run?`,
      );
      if (!ok) return;
    }
    finish(items);
  }, [finish, run.index, run.items]);

  const primaryAction = useCallback(() => {
    if (run.settings.immediateFeedback && !revealed) {
      markVisited();
      return;
    }
    if (isLast) {
      attemptFinish();
      return;
    }
    markVisited();
    goTo(run.index + 1);
  }, [attemptFinish, goTo, isLast, markVisited, revealed, run.index, run.settings.immediateFeedback]);

  const skip = useCallback(() => {
    updateItem(run.index, (prev) => ({ ...prev, selected: [], visited: true }));
    if (!isLast) goTo(run.index + 1);
  }, [goTo, isLast, run.index, updateItem]);

  const primaryLabel = useMemo(() => {
    if (run.settings.immediateFeedback && !revealed) return "Check answer";
    return isLast ? "Finish run" : "Next";
  }, [isLast, revealed, run.settings.immediateFeedback]);

  // Keyboard shortcuts: letters pick answers, Enter advances, S skips, arrows navigate.
  useEffect(() => {
    if (finished || !item || !question) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;

      const key = e.key.toLowerCase();

      if (key === "enter") {
        // A focused button handles its own Enter; don't fire twice.
        if (tag === "BUTTON" || tag === "A") return;
        e.preventDefault();
        primaryAction();
        return;
      }
      if (key === "s") {
        e.preventDefault();
        skip();
        return;
      }
      if (key === "arrowleft") {
        e.preventDefault();
        goTo(run.index - 1);
        return;
      }
      if (key === "arrowright") {
        e.preventDefault();
        goTo(run.index + 1);
        return;
      }

      const letterIndex = OPTION_LETTERS.indexOf(key);
      if (letterIndex >= 0 && letterIndex < item!.order.length) {
        e.preventDefault();
        toggle(item!.order[letterIndex]);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finished, goTo, item, primaryAction, question, run.index, skip, toggle]);

  if (finished) {
    return <Results run={finished} heading="Run results" />;
  }

  if (!item || !question) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">This run has no questions in it.</p>
          <Link href="/" className={cn(buttonVariants(), "mt-4")}>
            Back to start
          </Link>
        </CardContent>
      </Card>
    );
  }

  const optionRange =
    item.order.length > 1
      ? `${OPTION_LETTERS[0]}\u2013${OPTION_LETTERS[item.order.length - 1]}`
      : OPTION_LETTERS[0];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-lg font-semibold tracking-tight">{title ?? "Practice run"}</span>
          <span className="nums text-sm text-muted-foreground">
            {answeredCount} of {total} answered
          </span>
          <RunTimer getElapsed={getElapsed} running className="ml-auto" />
        </div>
        <Progress value={(answeredCount / total) * 100} className="mt-2.5" label="Run progress" />
      </div>

      <Card>
        <CardContent className="p-5 sm:p-6">
          <div key={run.index} className="animate-fade-up">
            <QuestionCard
              question={question}
              order={item.order}
              selected={item.selected}
              revealed={revealed}
              number={run.index + 1}
              total={total}
              onToggle={toggle}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => goTo(run.index - 1)} disabled={run.index === 0}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Previous
          <Kbd>&larr;</Kbd>
        </Button>
        <Button variant="ghost" onClick={skip}>
          <SkipForward className="h-4 w-4" aria-hidden />
          Skip
          <Kbd>S</Kbd>
        </Button>
        <Button className="ml-auto" onClick={primaryAction}>
          {primaryLabel}
          {primaryLabel === "Next" && <ArrowRight className="h-4 w-4" aria-hidden />}
          <Kbd tone="onPrimary">Enter</Kbd>
        </Button>
        {!isLast && (
          <Button variant="outline" onClick={attemptFinish}>
            Finish early
          </Button>
        )}
      </div>

      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
        <Kbd>{optionRange}</Kbd> choose an answer
        <span aria-hidden>&middot;</span>
        <Kbd>Enter</Kbd> {primaryLabel.toLowerCase()}
        <span aria-hidden>&middot;</span>
        <Kbd>S</Kbd> skip
        <span aria-hidden>&middot;</span>
        <Kbd>&larr;</Kbd>
        <Kbd>&rarr;</Kbd> move between questions
      </p>

      <div>
        <p className="text-xs text-muted-foreground">Jump to a question</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {run.items.map((it, i) => {
            const answered = it.selected.length > 0;
            const current = i === run.index;
            return (
              <button
                key={it.qid}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Question ${i + 1}${answered ? ", answered" : it.visited ? ", skipped" : ""}`}
                aria-current={current ? "true" : undefined}
                className={cn(
                  "nums h-7 w-7 rounded-md border text-xs transition-colors",
                  answered && "border-foreground/40 bg-accent text-accent-foreground",
                  !answered && it.visited && "border-warn/60 text-warn",
                  !answered && !it.visited && "text-muted-foreground hover:bg-secondary",
                  current && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
