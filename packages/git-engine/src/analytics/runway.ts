import type {
  DailyBalancePoint,
  RunwayWarningOptions,
  RunwayWarningResult,
} from "../types/index.js";

/**
 * Scans a DailyBalancePoint[] timeline to evaluate runway and financial deficit risk.
 *
 * Breach condition:
 * - When safetyBuffer > 0: point.balance <= safetyBuffer (touches or drops below safety buffer).
 * - When safetyBuffer <= 0: point.balance < 0 (drops below 0).
 *
 * Output:
 * - riskDetected: boolean indicating if any breach occurred.
 * - riskDate: ISO date string (YYYY-MM-DD) of the first day a breach occurs, or null if safe.
 * - runwayDays: number of safe days before breach occurs (or timeline.length if safe).
 * - maxDeficit: maximum shortfall below safetyBuffer / zero (positive number, 0 if safe).
 * - minBalance: global minimum balance across the scanned timeline.
 * - maxDeficitDate: ISO date string where the minimum balance occurred (or null if safe).
 * - safetyBuffer: normalized buffer threshold applied during evaluation.
 */
export function checkRunwayAndDeficit(
  timeline: DailyBalancePoint[],
  options?: RunwayWarningOptions
): RunwayWarningResult {
  const safetyBuffer = options?.safetyBuffer ?? options?.reserveFloor ?? 0;

  if (timeline.length === 0) {
    return {
      riskDetected: false,
      riskDate: null,
      runwayDays: 0,
      maxDeficit: 0,
      minBalance: 0,
      maxDeficitDate: null,
      safetyBuffer,
    };
  }

  let riskDetected = false;
  let riskDate: string | null = null;
  let runwayDays = timeline.length;
  let minBalance = timeline[0]!.balance;
  let minBalanceDate = timeline[0]!.date;

  for (let i = 0; i < timeline.length; i++) {
    const point = timeline[i]!;

    if (point.balance < minBalance) {
      minBalance = point.balance;
      minBalanceDate = point.date;
    }

    const isBreach =
      safetyBuffer > 0 ? point.balance <= safetyBuffer : point.balance < 0;

    if (isBreach && !riskDetected) {
      riskDetected = true;
      riskDate = point.date;
      runwayDays = i;
    }
  }

  const maxDeficit = riskDetected ? Math.max(0, safetyBuffer - minBalance) : 0;
  const maxDeficitDate = riskDetected ? minBalanceDate : null;

  return {
    riskDetected,
    riskDate,
    runwayDays,
    maxDeficit,
    minBalance,
    maxDeficitDate,
    safetyBuffer,
  };
}

/**
 * Functional alias for checkRunwayAndDeficit.
 */
export const evaluateRunwayWarning = checkRunwayAndDeficit;
