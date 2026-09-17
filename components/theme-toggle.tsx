"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY = "lawprep.theme";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    const root = document.documentElement;
    root.classList.add("no-transition");
    root.classList.toggle("dark", next);
    setDark(next);
    // Two rAF calls ensure the class change paints before re-enabling transitions.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove("no-transition")),
    );
    try {
      window.localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      // Preference just won't persist.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      {mounted && dark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
