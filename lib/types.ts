export type ChapterId = 1 | 2 | 3 | 4 | 5;

/**
 * Compact question shape (kept terse because the bank is large).
 *   id    stable id, e.g. "c2-014"
 *   ch    chapter number
 *   topic short label used in the results breakdown
 *   q     the prompt
 *   o     answer options, in canonical order
 *   a     indices into `o` that are correct (length > 1 => multi-answer)
 *   e     one-line explanation shown after answering
 */
export type Question = {
  id: string;
  ch: ChapterId;
  topic: string;
  q: string;
  o: string[];
  a: number[];
  e: string;
};

export const CHAPTERS: Record<ChapterId, string> = {
  1: "Law and Courts",
  2: "Civil Dispute Resolution",
  3: "Criminal Law and Procedure",
  4: "The Constitution and Business Regulation",
  5: "Tort Law",
};

export type AnswerStatus = "correct" | "partial" | "incorrect" | "skipped";

/** One question as it was presented in a run. */
export type RunItem = {
  qid: string;
  /** display order of option indices (option shuffling) */
  order: number[];
  /** canonical option indices the user picked */
  selected: number[];
  /** true once the user has moved past it (answered or skipped) */
  visited: boolean;
};

export type RunSettings = {
  count: number;
  chapters: ChapterId[];
  immediateFeedback: boolean;
  shuffleOptions: boolean;
};

export type RunRecord = {
  id: string;
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  settings: RunSettings;
  items: RunItem[];
};

export type ActiveRun = {
  id: string;
  startedAt: number;
  /** ms already banked from previous sittings of this run */
  elapsedMs: number;
  settings: RunSettings;
  items: RunItem[];
  index: number;
};
