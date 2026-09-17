import type { Question } from "@/lib/types";
import { easyCh1 } from "./ch1";
import { easyCh2 } from "./ch2";
import { easyCh3 } from "./ch3";
import { easyCh4 } from "./ch4";
import { easyCh5 } from "./ch5";

/** Easy mode: short stem, exactly one correct answer, terse term options. */
export const EASY_QUESTIONS: Question[] = [
  ...easyCh1,
  ...easyCh2,
  ...easyCh3,
  ...easyCh4,
  ...easyCh5,
];

export const EASY_QUESTION_MAP: Map<string, Question> = new Map(
  EASY_QUESTIONS.map((q) => [q.id, q]),
);

export function easyCountByChapter(): Record<number, number> {
  return EASY_QUESTIONS.reduce<Record<number, number>>((acc, q) => {
    acc[q.ch] = (acc[q.ch] ?? 0) + 1;
    return acc;
  }, {});
}
