"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Results } from "@/components/quiz/results";
import { loadRun } from "@/lib/storage";
import type { RunRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RunDetailClient({ id }: { id: string }) {
  const [state, setState] = useState<{ loading: boolean; run?: RunRecord }>({ loading: true });

  useEffect(() => {
    setState({ loading: false, run: loadRun(id) });
  }, [id]);

  if (state.loading) {
    return <p className="text-sm text-muted-foreground">Opening the run&hellip;</p>;
  }

  if (!state.run) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm">
            No saved run with that id. Runs live in this browser only, so it may have been cleared.
          </p>
          <Link href="/history" className={cn(buttonVariants(), "mt-4")}>
            Back to history
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <Results run={state.run} heading="Saved run" />;
}
