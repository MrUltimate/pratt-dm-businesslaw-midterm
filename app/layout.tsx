import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pratt DM • Business Law Mid-term",
  description:
    "Timed multiple-choice practice drawn from Chapters 1-5: law and courts, civil dispute resolution, criminal law, constitutional law, and torts.",
};

// Runs before paint so the page never flashes the wrong theme.
const themeScript = `
try {
  var stored = localStorage.getItem('lawprep.theme');
  var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dark) document.documentElement.classList.add('dark');
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <header className="border-b bg-card">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-base font-semibold tracking-tight">
              Pratt DM&nbsp;&nbsp;&bull;&nbsp;&nbsp;Business Law Mid-term
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <nav className="flex items-center gap-1">
                <Link
                  href="/"
                  className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Start
                </Link>
                <Link
                  href="/history"
                  className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  History
                </Link>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-xs text-muted-foreground">
          Scores and times are saved in this browser only.
        </footer>
      </body>
    </html>
  );
}
