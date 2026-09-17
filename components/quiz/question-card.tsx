"use client";

import { Check, Minus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CHAPTERS, type Question } from "@/lib/types";
import { cn, OPTION_LETTERS } from "@/lib/utils";

type OptionState = "idle" | "selected" | "hit" | "missed" | "wrong" | "quiet";

function optionState(
  canonicalIndex: number,
  selected: number[],
  correct: number[],
  revealed: boolean,
): OptionState {
  const isSelected = selected.includes(canonicalIndex);
  const isCorrect = correct.includes(canonicalIndex);
  if (!revealed) return isSelected ? "selected" : "idle";
  if (isSelected && isCorrect) return "hit";
  if (isSelected && !isCorrect) return "wrong";
  if (!isSelected && isCorrect) return "missed";
  return "quiet";
}

const stateStyles: Record<OptionState, string> = {
  idle: "border-border bg-card hover:border-foreground/30 hover:bg-secondary/70",
  selected: "border-foreground/70 bg-accent",
  hit: "border-ok bg-ok/10",
  missed: "border-warn bg-warn/10 border-dashed",
  wrong: "border-bad bg-bad/10",
  quiet: "border-border bg-card opacity-70",
};

function Marker({ state, multi, letter }: { state: OptionState; multi: boolean; letter: string }) {
  const shape = multi ? "rounded-[4px]" : "rounded-full";
  const base = "grid h-5 w-5 shrink-0 place-items-center border text-[11px] font-medium nums";

  if (state === "hit") {
    return (
      <span className={cn(base, shape, "border-ok bg-ok text-white")} aria-hidden>
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === "wrong") {
    return (
      <span className={cn(base, shape, "border-bad bg-bad text-white")} aria-hidden>
        <X className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === "missed") {
    return (
      <span className={cn(base, shape, "border-warn text-warn")} aria-hidden>
        <Minus className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === "selected") {
    return (
      <span className={cn(base, shape, "border-primary bg-primary text-primary-foreground")} aria-hidden>
        {letter}
      </span>
    );
  }
  return (
    <span className={cn(base, shape, "border-input text-muted-foreground")} aria-hidden>
      {letter}
    </span>
  );
}

export function QuestionCard({
  question,
  order,
  selected,
  revealed,
  number,
  total,
  onToggle,
}: {
  question: Question;
  order: number[];
  selected: number[];
  revealed: boolean;
  number: number;
  total: number;
  onToggle: (canonicalIndex: number) => void;
}) {
  const multi = question.a.length > 1;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="nums font-medium text-foreground">
          {number} / {total}
        </span>
        <span aria-hidden>·</span>
        <span>
          Chapter {question.ch}: {CHAPTERS[question.ch]}
        </span>
        <span aria-hidden>·</span>
        <span>{question.topic}</span>
        {multi && (
          <Badge variant="muted" className="ml-auto">
            {question.a.length} correct answers
          </Badge>
        )}
      </div>

      <h2 className="mt-3 max-w-reading text-xl font-medium leading-snug tracking-[-0.01em] sm:text-[1.4rem]">{question.q}</h2>

      <fieldset className="mt-5 space-y-2" disabled={revealed}>
        <legend className="sr-only">
          {multi ? "Select all answers that apply" : "Select one answer"}
        </legend>
        {order.map((canonicalIndex, displayIndex) => {
          const state = optionState(canonicalIndex, selected, question.a, revealed);
          const letter = OPTION_LETTERS[displayIndex];
          return (
            <button
              key={canonicalIndex}
              type="button"
              onClick={() => onToggle(canonicalIndex)}
              aria-pressed={selected.includes(canonicalIndex)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-[15px] leading-normal transition-colors",
                !revealed && "active:scale-[0.99] active:opacity-90 transition-[colors,transform,opacity]",
                stateStyles[state],
                revealed && "cursor-default",
              )}
            >
              <span className="pt-0.5">
                <Marker state={state} multi={multi} letter={letter} />
              </span>
              <span className="max-w-reading">{question.o[canonicalIndex]}</span>
            </button>
          );
        })}
      </fieldset>

      {revealed && (
        <div className="mt-4 rounded-md border-l-2 border-l-primary bg-secondary/60 px-4 py-3 text-sm">
          <p className="max-w-reading text-muted-foreground">{question.e}</p>
        </div>
      )}
    </div>
  );
}
