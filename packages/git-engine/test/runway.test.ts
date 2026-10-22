import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  BranchManager,
  checkRunway,
  checkRunwayAndDeficit,
  evaluateRunwayWarning,
  normalizeStartOfDay,
  type CommitNode,
  type DailyBalancePoint,
} from "../src/index.js";

describe("Runway & Deficit Warning Check (AIO-521)", () => {
  const BASE_DATE_STR = "2026-11-01";
  const BASE_START_MS = normalizeStartOfDay(BASE_DATE_STR);
  const DAY_MS = 86_400_000;

  function createMockPoint(dayIndex: number, balance: number): DailyBalancePoint {
    const timestamp = BASE_START_MS + dayIndex * DAY_MS;
    const d = new Date(timestamp);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return {
      date: `${y}-${m}-${day}`,
      timestamp,
      balance,
      netChange: 0,
      commitCount: 0,
      commitIds: [],
    };
  }

  test("returns safe metadata when timeline remains strictly positive with no buffer", () => {
    const timeline: DailyBalancePoint[] = [
      createMockPoint(0, 1000),
      createMockPoint(1, 1200),
      createMockPoint(2, 900),
      createMockPoint(3, 1500),
    ];

    const result = checkRunwayAndDeficit(timeline);

    assert.equal(result.riskDetected, false);
    assert.equal(result.riskDate, null);
    assert.equal(result.runwayDays, 4);
    assert.equal(result.maxDeficit, 0);
    assert.equal(result.minBalance, 900);
    assert.equal(result.maxDeficitDate, null);
    assert.equal(result.safetyBuffer, 0);
  });

  test("detects first deficit day, calculates max deficit and runway days when balance drops below 0", () => {
    const timeline: DailyBalancePoint[] = [
      createMockPoint(0, 1000), // safe (day 0)
      createMockPoint(1, 500),  // safe (day 1)
      createMockPoint(2, -150), // first breach! (day 2)
      createMockPoint(3, -400), // lowest point / max deficit (day 3)
      createMockPoint(4, -100), // recovery but still deficit
      createMockPoint(5, 200),  // safe again
    ];

    const result = checkRunwayAndDeficit(timeline, { safetyBuffer: 0 });

    assert.equal(result.riskDetected, true);
    assert.equal(result.riskDate, "2026-11-03"); // day index 2
    assert.equal(result.runwayDays, 2);
    assert.equal(result.maxDeficit, 400); // 0 - (-400) = 400
    assert.equal(result.minBalance, -400);
    assert.equal(result.maxDeficitDate, "2026-11-04"); // day index 3
    assert.equal(result.safetyBuffer, 0);
  });

  test("triggers breach when balance touches or drops below configured safety buffer", () => {
    const safetyBuffer = 500;
    const timeline: DailyBalancePoint[] = [
      createMockPoint(0, 2000), // safe
      createMockPoint(1, 1200), // safe
      createMockPoint(2, 500),  // touches safetyBuffer! (breach)
      createMockPoint(3, 300),  // drops below buffer
      createMockPoint(4, 800),  // rebounds
    ];

    const result = checkRunwayAndDeficit(timeline, { safetyBuffer });

    assert.equal(result.riskDetected, true);
    assert.equal(result.riskDate, "2026-11-03"); // day index 2 (touches buffer)
    assert.equal(result.runwayDays, 2);
    assert.equal(result.minBalance, 300);
    assert.equal(result.maxDeficit, 200); // 500 - 300 = 200
    assert.equal(result.maxDeficitDate, "2026-11-04"); // day index 3
    assert.equal(result.safetyBuffer, 500);
  });

  test("detects immediate Day 0 breach resulting in 0 runway days", () => {
    const timeline: DailyBalancePoint[] = [
      createMockPoint(0, -50),
      createMockPoint(1, -100),
      createMockPoint(2, 500),
    ];

    const result = checkRunwayAndDeficit(timeline);

    assert.equal(result.riskDetected, true);
    assert.equal(result.riskDate, "2026-11-01");
    assert.equal(result.runwayDays, 0);
    assert.equal(result.maxDeficit, 100);
    assert.equal(result.minBalance, -100);
    assert.equal(result.maxDeficitDate, "2026-11-02");
  });

  test("supports reserveFloor as alias for safetyBuffer", () => {
    const timeline: DailyBalancePoint[] = [
      createMockPoint(0, 800),
      createMockPoint(1, 400),
    ];

    const result = checkRunwayAndDeficit(timeline, { reserveFloor: 600 });

    assert.equal(result.riskDetected, true);
    assert.equal(result.safetyBuffer, 600);
    assert.equal(result.riskDate, "2026-11-02");
    assert.equal(result.runwayDays, 1);
    assert.equal(result.maxDeficit, 200);
  });

  test("handles empty timeline safely", () => {
    const result = checkRunwayAndDeficit([]);

    assert.equal(result.riskDetected, false);
    assert.equal(result.riskDate, null);
    assert.equal(result.runwayDays, 0);
    assert.equal(result.maxDeficit, 0);
    assert.equal(result.minBalance, 0);
    assert.equal(result.maxDeficitDate, null);
    assert.equal(result.safetyBuffer, 0);
  });

  test("integrates with BranchManager.checkRunway across projected branch commits", () => {
    const manager = new BranchManager({ initialBalance: 1000 });
    const main = manager.getBranch("main")!;

    // Commit 1: Income of +500 on day 2
    manager.addCommit(main.id, {
      id: "c_income",
      parentIds: [main.headCommitId],
      branchId: main.id,
      message: "Client invoice payment",
      timestamp: BASE_START_MS + 2 * DAY_MS,
      delta: 500,
      payload: { amount: 500, category: "Invoice", type: "income" },
    });

    // Commit 2: Expense of -2000 on day 4 (causes balance to drop to -500)
    manager.addCommit(main.id, {
      id: "c_expense",
      parentIds: ["c_income"],
      branchId: main.id,
      message: "Quarterly server licensing",
      timestamp: BASE_START_MS + 4 * DAY_MS,
      delta: -2000,
      payload: { amount: 2000, category: "Software", type: "expense" },
    });

    const result = manager.checkRunway(main.id, 10, {
      startDate: BASE_DATE_STR,
      safetyBuffer: 0,
    });

    assert.equal(result.riskDetected, true);
    assert.equal(result.riskDate, "2026-11-05"); // day index 4
    assert.equal(result.runwayDays, 4);
    assert.equal(result.minBalance, -500);
    assert.equal(result.maxDeficit, 500);
    assert.equal(result.maxDeficitDate, "2026-11-05");
  });

  test("standalone checkRunway supports branchId, DailyBalancePoint[], and raw CommitNode[]", () => {
    const manager = new BranchManager({ initialBalance: 500 });
    const main = manager.getBranch("main")!;

    // Test with branchId
    const res1 = checkRunway(main.id, 15, { safetyBuffer: 100 }, manager);
    assert.equal(res1.riskDetected, false);
    assert.equal(res1.runwayDays, 15);

    // Test with pre-existing DailyBalancePoint[]
    const points: DailyBalancePoint[] = [
      createMockPoint(0, 300),
      createMockPoint(1, -50),
    ];
    const res2 = checkRunway(points);
    assert.equal(res2.riskDetected, true);
    assert.equal(res2.runwayDays, 1);
    assert.equal(res2.maxDeficit, 50);

    // Test with CommitNode[]
    const commits: CommitNode[] = [
      {
        id: "c1",
        parentIds: [],
        branchId: "b1",
        message: "Big expense",
        timestamp: BASE_START_MS + 3 * DAY_MS,
        delta: -800,
        payload: { amount: 800, category: "Equipment", type: "expense" },
      },
    ];
    const res3 = checkRunway(commits, 7, {
      startDate: BASE_DATE_STR,
      initialBalance: 500,
    });
    assert.equal(res3.riskDetected, true);
    assert.equal(res3.runwayDays, 3);
    assert.equal(res3.maxDeficit, 300); // 500 - 800 = -300 -> deficit 300
  });

  test("evaluateRunwayWarning is exported as functional alias", () => {
    const points: DailyBalancePoint[] = [createMockPoint(0, 100)];
    const result = evaluateRunwayWarning(points);
    assert.equal(result.riskDetected, false);
    assert.equal(result.runwayDays, 1);
  });
});
