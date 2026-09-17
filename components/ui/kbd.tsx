import * as React from "react";
import { cn } from "@/lib/utils";

/** Secondary label showing the keyboard shortcut for an action. */
export function Kbd({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "onPrimary";
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "nums inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border px-1 text-[10px] font-medium leading-none",
        tone === "onPrimary"
          ? "border-primary-foreground/30 text-primary-foreground/75"
          : "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
