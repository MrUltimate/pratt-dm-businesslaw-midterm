"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Runner } from "@/components/quiz/runner";
import { buildRetryRun, buildRun } from "@/lib/run";
import { loadActiveRun, loadRun, loadSettings } from "@/lib/storage";
import type { ActiveRun } from "@/lib/types";
import { cn } from "@/lib/utils";

type State = { kind: "loading" } | { kind: "ready"; run: ActiveRun; title?: string } | { kind: "error"; message: string };

export function PracticeClient() {
  const params = useSearchParams();
  const isNew = params.get("new") === "1";
  const retryId = params.get("retry");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const settings = loadSettings();

    if (retryId) {
      const previous = loadRun(retryId);
      if (!previous) {
        setState({ kind: "error", message: "That run is no longer saved in this browser." });
        return;
      }
      const run = buildRetryRun(previous, settings);
      if (run.items.length === 0) {
        setState({ kind: "error", message: "There was nothing to redo in that run." });
        return;
      }
      setState({ kind: "ready", run, title: "Redo: questions you missed" });
      return;
    }

    if (!isNew) {
      const active = loadActiveRun();
      if (active) {
        setState({ kind: "ready", run: active, title: "Practice run (resumed)" });
        return;
      }
    }

    setState({ kind: "ready", run: buildRun(settings) });
    // Intentionally keyed only on the query string: a run is built once per visit.
  }, [isNew, retryId]);

  if (state.kind === "loading") {
    return <p className="text-sm text-muted-foreground">Dealing the questions&hellip;</p>;
  }

  if (state.kind === "error") {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm">{state.message}</p>
          <Link href="/" className={cn(buttonVariants(), "mt-4")}>
            Back to start
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <Runner key={state.run.id} initial={state.run} title={state.title} />;
}
