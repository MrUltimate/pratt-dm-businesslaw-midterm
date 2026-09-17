import type { ActiveRun, RunRecord, RunSettings } from "./types";

const RUNS_KEY = "lawprep.runs.v1";
const ACTIVE_KEY = "lawprep.active.v1";
const SETTINGS_KEY = "lawprep.settings.v1";
const MAX_RUNS = 60;

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function read<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked. Practice can continue without history.
  }
}

export function loadRuns(): RunRecord[] {
  return read<RunRecord[]>(RUNS_KEY, []).sort((a, b) => b.finishedAt - a.finishedAt);
}

export function loadRun(id: string): RunRecord | undefined {
  return loadRuns().find((r) => r.id === id);
}

export function saveRun(run: RunRecord) {
  const runs = [run, ...read<RunRecord[]>(RUNS_KEY, []).filter((r) => r.id !== run.id)];
  write(RUNS_KEY, runs.slice(0, MAX_RUNS));
}

export function deleteRun(id: string) {
  write(
    RUNS_KEY,
    read<RunRecord[]>(RUNS_KEY, []).filter((r) => r.id !== id),
  );
}

export function clearRuns() {
  write(RUNS_KEY, []);
}

export function loadActiveRun(): ActiveRun | null {
  return read<ActiveRun | null>(ACTIVE_KEY, null);
}

export function saveActiveRun(run: ActiveRun) {
  write(ACTIVE_KEY, run);
}

export function clearActiveRun() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(ACTIVE_KEY);
  } catch {
    // ignore
  }
}

export const DEFAULT_SETTINGS: RunSettings = {
  count: 50,
  chapters: [1, 2, 3, 4, 5],
  immediateFeedback: false,
  shuffleOptions: true,
};

export function loadSettings(): RunSettings {
  const s = read<RunSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const count = Math.min(50, Math.max(1, s.count ?? DEFAULT_SETTINGS.count));
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    count,
    chapters: s.chapters?.length ? s.chapters : DEFAULT_SETTINGS.chapters,
  };
}

export function saveSettings(settings: RunSettings) {
  write(SETTINGS_KEY, settings);
}
