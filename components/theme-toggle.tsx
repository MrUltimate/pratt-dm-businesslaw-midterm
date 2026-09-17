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

  const easing = "cubic-bezier(0.2, 0, 0, 1)";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      <Moon
        className="h-4 w-4"
        style={{
          opacity: mounted && dark ? 0 : 1,
          scale: mounted && dark ? "0.25" : "1",
          filter: mounted && dark ? "blur(4px)" : "blur(0px)",
          transition: mounted ? `opacity 0.2s ${easing}, scale 0.2s ${easing}, filter 0.2s ${easing}` : "none",
        }}
        aria-hidden
      />
      <Sun
        className="absolute h-4 w-4"
        style={{
          opacity: mounted && dark ? 1 : 0,
          scale: mounted && dark ? "1" : "0.25",
          filter: mounted && dark ? "blur(0px)" : "blur(4px)",
          transition: mounted ? `opacity 0.2s ${easing}, scale 0.2s ${easing}, filter 0.2s ${easing}` : "none",
        }}
        aria-hidden
      />
    </button>
  );
}
