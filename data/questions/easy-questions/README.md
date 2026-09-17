# Easy mode question set

180 questions written to match the two questions the professor released from the real exam:
a one-sentence stem, **exactly one** correct answer, and four or five terse term options.
The standard bank (`data/questions/ch1..ch5.ts`) stays as it is; this is an additional set.

Counts: ch1 32, ch2 44, ch3 38, ch4 30, ch5 36.

The professor's two actual exam questions are included verbatim as `e2-001` (deposition) and
`e4-001` (strict scrutiny / race), each flagged in its explanation.

## Wiring it in

1. Add the level field to `lib/types.ts`:

```ts
export type QuestionLevel = "easy" | "standard";

export type Question = {
  id: string;
  ch: ChapterId;
  topic: string;
  q: string;
  o: string[];
  a: number[];
  e: string;
  level?: QuestionLevel; // absent means "standard"
};
```

2. Add `level` to `RunSettings` and to the run builder's pool selection:

```ts
// lib/types.ts
export type RunSettings = {
  count: number;
  chapters: ChapterId[];
  immediateFeedback: boolean;
  shuffleOptions: boolean;
  level: QuestionLevel | "mixed";
};

// lib/run.ts
import { EASY_QUESTIONS } from "@/data/questions/easy";

function poolFor(level: RunSettings["level"]) {
  if (level === "easy") return EASY_QUESTIONS;
  if (level === "standard") return QUESTIONS;
  return [...QUESTIONS, ...EASY_QUESTIONS];
}
```

3. `getQuestion(id)` has to resolve ids from both banks, or grading and saved runs break:

```ts
// data/questions/index.ts
import { EASY_QUESTION_MAP } from "./easy";
export function getQuestion(id: string) {
  return QUESTION_MAP.get(id) ?? EASY_QUESTION_MAP.get(id);
}
```

4. Add a three-way control on the start screen (Easy / Standard / Mixed) next to the chapter
   filter, default Standard. Old saved runs have no `level` in their settings, so read it as
   `run.settings.level ?? "standard"` when displaying history.

Nothing else needs to change: scoring already handles single-answer questions, and since every
easy question has one correct option, "partly right" can never occur in an easy run.
