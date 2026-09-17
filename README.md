# Business Law Practice Runs

A timed multiple-choice trainer built from Chapters 1&ndash;5 of the business law reading:
law and courts, civil dispute resolution, criminal law and procedure, the Constitution and
business regulation, and tort law.

**305 questions** in the bank. Each run draws **50 at random** from the chapters you select.
186 of the questions have more than one correct answer, so scoring tracks what you marked,
what you marked wrongly, and what you left out.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Requires Node 18.17+ (Node 20 recommended). The first `npm run dev` or `npm run build`
downloads the two web fonts, so it needs network access.

## Deploy to Vercel

Option A, from the terminal:

```bash
npm i -g vercel
vercel        # preview deploy, accept the defaults
vercel --prod # production
```

Option B, from the dashboard: push this folder to a GitHub repo, then in Vercel choose
**Add New → Project**, import the repo, and deploy. Vercel detects Next.js; no environment
variables, build command changes, or settings are needed.

## How a run works

1. **Start screen.** Pick which chapters to draw from (counts are shown per chapter), then
   choose whether to see answers as you go and whether answer options get shuffled.
2. **The run.** One question per screen. Multi-answer questions are labelled and show how many
   answers are correct. You can go back to earlier questions, skip any question, jump around
   using the number grid at the bottom, or finish early. It is fully keyboard driven: the option
   letters (`a`, `b`, `c`&hellip;) select answers, `Enter` checks or advances, `S` skips, and the
   arrow keys move between questions. Each shortcut is printed next to its button.
3. **The clock.** The timer sits in the run header next to the answered count. It starts on
   question 1 and stops when you finish. If you close the tab mid-run, the run is saved and the clock pauses; the next
   visit offers to resume where you left off.
4. **Results.** A dashboard of the run: exact-match score, partial-credit score, counts by
   outcome, option-level totals, per-chapter bars, weakest topics, and a question-by-question
   review you can filter to just the ones you got wrong.
5. **Afterwards.** Every finished run is saved with its score and duration. From any result page
   you can redo only the questions you didn't get fully right.

## Scoring

Each question lands in one of four buckets:

| Status | Meaning |
| --- | --- |
| Correct | Your selections exactly match the correct set |
| Partly right | Everything you picked was right, but you missed at least one correct answer |
| Incorrect | You picked at least one wrong answer |
| Skipped | You picked nothing |

Two scores are reported. **Score** is exact matches over questions asked, the strict
exam-style number. **With partial credit** gives each question
`(right options marked − wrong options marked) ÷ correct options`, floored at zero, which is
kinder on multi-answer questions.

## Appearance

Inter throughout, on a neutral gray scale; the only colors are the answer-feedback greens,
ambers and reds. Light and dark modes both ship, toggled from the top right of the header.
The choice is stored under `lawprep.theme` and defaults to your system setting.

## Storage

Everything lives in this browser's `localStorage` &mdash; no accounts, no server, no database.
Keys used: `lawprep.runs.v1` (up to 60 finished runs), `lawprep.active.v1` (the run in
progress), `lawprep.settings.v1`. Clearing site data wipes your history.

## Project layout

```
app/
  page.tsx                  start screen: chapter filter, options, recent runs
  practice/                 the run itself (new, resumed, or redo-missed)
  history/                  all saved runs, plus a page per run
components/
  quiz/                     runner, question card, results dashboard, timer
  ui/                       shadcn-style primitives (button, card, badge, progress, switch)
data/questions/ch1..ch5.ts  the question bank, one file per chapter
lib/
  scoring.ts                grading and run analytics
  storage.ts                localStorage persistence
  run.ts                    run construction and sampling
  types.ts                  shared types
```

## Editing the question bank

Questions are plain TypeScript objects:

```ts
{
  id: "c2-044",
  ch: 2,
  topic: "Deposition",
  q: "The testimony under oath of a person who is examined out of court ... is known as a(n):",
  o: ["Deposition", "Intermediary", "Answer", "Crossclaim"],
  a: [0],                       // indices into `o`; more than one makes it multi-answer
  e: "A deposition is the sworn out-of-court testimony of a deponent.",
}
```

Add or edit entries in `data/questions/ch*.ts`. Any question with more than one index in `a`
should say "Select all that apply" in its prompt, and `topic` is what shows up in the
"topics to go back to" panel.
