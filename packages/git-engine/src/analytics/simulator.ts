import type {
  CommitNode,
  DailyBalancePoint,
  ProjectTimelineOptions,
} from "../types/index.js";

const DAY_MS = 86_400_000;

export function normalizeStartOfDay(input: Date | number | string): number {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const parts = input.split("-");
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return Date.UTC(y, m - 1, d, 0, 0, 0, 0);
    }
  }

  const d = new Date(input);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid startDate provided: ${String(input)}`);
  }

  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0);
}

export function formatIsoDate(utcTimestamp: number): string {
  const d = new Date(utcTimestamp);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function simulateDailyTimeline(
  commits: CommitNode[],
  days: number = 30,
  options?: ProjectTimelineOptions
): DailyBalancePoint[] {
  if (days < 0) {
    throw new Error("Projection horizon (days) must be a non-negative number.");
  }
  if (days === 0) {
    return [];
  }

  const startDayMs = normalizeStartOfDay(options?.startDate ?? Date.now());
  const horizonEndMs = startDayMs + days * DAY_MS;
  let runningBalance = options?.initialBalance ?? 0;

  const dayDeltas: number[] = new Array<number>(days).fill(0);
  const dayCommitIds: string[][] = Array.from({ length: days }, () => []);

  for (const commit of commits) {
    if (commit.timestamp < startDayMs) {
      runningBalance += commit.delta;
    } else if (commit.timestamp < horizonEndMs) {
      const dayIndex = Math.floor((commit.timestamp - startDayMs) / DAY_MS);
      if (dayIndex >= 0 && dayIndex < days) {
        dayDeltas[dayIndex] = (dayDeltas[dayIndex] ?? 0) + commit.delta;
        dayCommitIds[dayIndex]?.push(commit.id);
      }
    }
  }

  const timeline: DailyBalancePoint[] = [];
  for (let i = 0; i < days; i++) {
    const dayTimestamp = startDayMs + i * DAY_MS;
    const delta = dayDeltas[i] ?? 0;
    const commitIds = dayCommitIds[i] ?? [];
    runningBalance += delta;
    timeline.push({
      date: formatIsoDate(dayTimestamp),
      timestamp: dayTimestamp,
      balance: runningBalance,
      netChange: delta,
      commitCount: commitIds.length,
      commitIds,
    });
  }

  return timeline;
}
