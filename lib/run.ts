import { EASY_QUESTIONS, QUESTIONS } from "@/data/questions";
import { gradeItem } from "./scoring";
import type { ActiveRun, RunItem, RunRecord, RunSettings } from "./types";
import { shuffle } from "./utils";

function poolFor(settings: RunSettings) {
  return settings.level === "easy" ? EASY_QUESTIONS : QUESTIONS;
}

export function availableCount(settings: RunSettings): number {
  return poolFor(settings).filter((q) => settings.chapters.includes(q.ch)).length;
}

export function buildRun(settings: RunSettings): ActiveRun {
  const pool = poolFor(settings).filter((q) => settings.chapters.includes(q.ch));
  const picked = shuffle(pool).slice(0, Math.min(settings.count, pool.length));

  const items: RunItem[] = picked.map((q) => {
    const canonical = q.o.map((_, i) => i);
    return {
      qid: q.id,
      order: settings.shuffleOptions ? shuffle(canonical) : canonical,
      selected: [],
      visited: false,
    };
  });

  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    startedAt: Date.now(),
    elapsedMs: 0,
    settings: { ...settings, count: items.length },
    items,
    index: 0,
  };
}

/** Rebuild a run from the questions a previous run got wrong, partly right, or skipped. */
export function buildRetryRun(previous: RunRecord, settings: RunSettings): ActiveRun {
  const ids = previous.items
    .map((item) => {
      const graded = gradeItem(item);
      return graded && graded.status !== "correct" ? item.qid : null;
    })
    .filter((id): id is string => id !== null);

  // Search both banks so retries work regardless of which level the original run used.
  const allQuestions = [...QUESTIONS, ...EASY_QUESTIONS];
  const picked = shuffle(allQuestions.filter((q) => ids.includes(q.id)));

  const items: RunItem[] = picked.map((q) => {
    const canonical = q.o.map((_, i) => i);
    return {
      qid: q.id,
      order: settings.shuffleOptions ? shuffle(canonical) : canonical,
      selected: [],
      visited: false,
    };
  });

  return {
    id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    startedAt: Date.now(),
    elapsedMs: 0,
    settings: { ...settings, count: items.length },
    items,
    index: 0,
  };
}
