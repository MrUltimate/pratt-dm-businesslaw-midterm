"use client";

import { useEffect, useState } from "react";
import { Timer as TimerIcon } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

export function RunTimer({
  getElapsed,
  running,
  className,
}: {
  getElapsed: () => number;
  running: boolean;
  className?: string;
}) {
  const [elapsed, setElapsed] = useState(() => getElapsed());

  useEffect(() => {
    setElapsed(getElapsed());
    if (!running) return;
    const id = window.setInterval(() => setElapsed(getElapsed()), 500);
    return () => window.clearInterval(id);
  }, [getElapsed, running]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-sm",
        className,
      )}
      aria-live="off"
    >
      <TimerIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <span className="nums font-medium" aria-label="Elapsed time">
        {formatDuration(elapsed)}
      </span>
      {!running && <span className="text-xs text-muted-foreground">stopped</span>}
    </span>
  );
}
