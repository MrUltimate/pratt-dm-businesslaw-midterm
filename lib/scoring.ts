import { getQuestion } from "@/data/questions";
import type { AnswerStatus, ChapterId, Question, RunItem, RunRecord } from "./types";
import { CHAPTERS } from "./types";

export type GradedItem = {
  question: Question;
  item: RunItem;
  status: AnswerStatus;
  /** correct options the user selected */
  hits: number[];
  /** correct options the user failed to select ("missed") */
  missed: number[];
  /** incorrect options the user selected */
  wrong: number[];
  /** 0..1 partial credit: (hits - wrong) / correctCount, floored at 0 */
  credit: number;
  multi: boolean;
};

export function gradeItem(item: RunItem): GradedItem | null {
  const question = getQuestion(item.qid);
  if (!question) return null;

  const correct = new Set(question.a);
  const selected = new Set(item.selected);

  const hits = question.a.filter((i) => selected.has(i));
  const missed = question.a.filter((i) => !selected.has(i));
  const wrong = item.selected.filter((i) => !correct.has(i));

  let status: AnswerStatus;
  if (item.selected.length === 0) status = "skipped";
  else if (wrong.length > 0) status = "incorrect";
  else if (missed.length > 0) status = "partial";
  else status = "correct";

  const credit = Math.max(0, (hits.length - wrong.length) / question.a.length);

  return {
    question,
    item,
    status,
    hits,
    missed,
    wrong,
    credit: status === "skipped" ? 0 : credit,
    multi: question.a.length > 1,
  };
}

export type ChapterBreakdown = {
  ch: ChapterId;
  label: string;
  total: number;
  correct: number;
  partial: number;
  incorrect: number;
  skipped: number;
  credit: number;
};

export type TopicBreakdown = {
  topic: string;
  ch: ChapterId;
  total: number;
  correct: number;
  credit: number;
};

export type RunAnalytics = {
  graded: GradedItem[];
  total: number;
  counts: Record<AnswerStatus, number>;
  /** exact-match score */
  strictScore: number;
  /** partial-credit score */
  creditScore: number;
  /** option-level tallies across the run */
  options: { hits: number; missed: number; wrong: number; totalCorrectOptions: number };
  chapters: ChapterBreakdown[];
  topics: TopicBreakdown[];
  single: { total: number; correct: number };
  multi: { total: number; correct: number };
  durationMs: number;
  msPerQuestion: number;
};

export function analyzeRun(run: RunRecord): RunAnalytics {
  const graded = run.items.map(gradeItem).filter((g): g is GradedItem => g !== null);

  const counts: Record<AnswerStatus, number> = { correct: 0, partial: 0, incorrect: 0, skipped: 0 };
  const options = { hits: 0, missed: 0, wrong: 0, totalCorrectOptions: 0 };
  const chapterMap = new Map<ChapterId, ChapterBreakdown>();
  const topicMap = new Map<string, TopicBreakdown>();
  const single = { total: 0, correct: 0 };
  const multi = { total: 0, correct: 0 };

  let creditSum = 0;

  for (const g of graded) {
    counts[g.status] += 1;
    options.hits += g.hits.length;
    options.missed += g.missed.length;
    options.wrong += g.wrong.length;
    options.totalCorrectOptions += g.question.a.length;
    creditSum += g.credit;

    const ch = g.question.ch;
    if (!chapterMap.has(ch)) {
      chapterMap.set(ch, {
        ch,
        label: CHAPTERS[ch],
        total: 0,
        correct: 0,
        partial: 0,
        incorrect: 0,
        skipped: 0,
        credit: 0,
      });
    }
    const c = chapterMap.get(ch)!;
    c.total += 1;
    c.credit += g.credit;
    if (g.status === "correct") c.correct += 1;
    else if (g.status === "partial") c.partial += 1;
    else if (g.status === "incorrect") c.incorrect += 1;
    else c.skipped += 1;

    const key = `${ch}::${g.question.topic}`;
    if (!topicMap.has(key)) {
      topicMap.set(key, { topic: g.question.topic, ch, total: 0, correct: 0, credit: 0 });
    }
    const t = topicMap.get(key)!;
    t.total += 1;
    t.credit += g.credit;
    if (g.status === "correct") t.correct += 1;

    const bucket = g.multi ? multi : single;
    bucket.total += 1;
    if (g.status === "correct") bucket.correct += 1;
  }

  const total = graded.length || 1;

  return {
    graded,
    total: graded.length,
    counts,
    strictScore: counts.correct / total,
    creditScore: creditSum / total,
    options,
    chapters: [...chapterMap.values()].sort((a, b) => a.ch - b.ch),
    topics: [...topicMap.values()].sort((a, b) => a.credit / a.total - b.credit / b.total),
    single,
    multi,
    durationMs: run.durationMs,
    msPerQuestion: run.durationMs / total,
  };
}

export const STATUS_LABEL: Record<AnswerStatus, string> = {
  correct: "Correct",
  partial: "Partly right",
  incorrect: "Incorrect",
  skipped: "Skipped",
};

export const STATUS_TONE: Record<AnswerStatus, string> = {
  correct: "text-[hsl(var(--ok))]",
  partial: "text-[hsl(var(--warn))]",
  incorrect: "text-[hsl(var(--bad))]",
  skipped: "text-muted-foreground",
};
