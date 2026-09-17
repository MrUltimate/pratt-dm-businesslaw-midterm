import type { Question } from "@/lib/types";
import { ch1 } from "./ch1";
import { ch2 } from "./ch2";
import { ch3 } from "./ch3";
import { ch4 } from "./ch4";
import { ch5 } from "./ch5";

export const QUESTIONS: Question[] = [...ch1, ...ch2, ...ch3, ...ch4, ...ch5];

export const QUESTION_MAP: Map<string, Question> = new Map(QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return QUESTION_MAP.get(id);
}

export function countByChapter(): Record<number, number> {
  return QUESTIONS.reduce<Record<number, number>>((acc, q) => {
    acc[q.ch] = (acc[q.ch] ?? 0) + 1;
    return acc;
  }, {});
}

export const MULTI_ANSWER_COUNT = QUESTIONS.filter((q) => q.a.length > 1).length;
