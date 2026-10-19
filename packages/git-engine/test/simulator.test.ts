import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  BranchManager,
  projectTimeline,
  simulateDailyTimeline,
  normalizeStartOfDay,
} from "../src/index.js";
import type { CommitNode } from "../src/types/index.js";

describe("Daily Cashflow Projection Simulator (AIO-520)", () => {
  const BASE_DATE_STR = "2026-11-01";
  const BASE_START_MS = normalizeStartOfDay(BASE_DATE_STR);
  const DAY_MS = 86_400_000;

  test("generates 30 daily balance points by default with sequential dates", () => {
    const manager = new BranchManager({ initialBalance: 500 });
    const main = manager.getBranch("main")!;

    manager.commit({
      branchId: main.id,
      message: "Baseline deposit",
      delta: 1000,
      payload: { amount: 1000, category: "Income", type: "income" },
    });

    const timeline = manager.projectTimeline(main.id, 30, {
      startDate: BASE_DATE_STR,
    });

    assert.equal(timeline.length, 30);
    const firstPoint = timeline[0]!;
    const lastPoint = timeline[29]!;
    assert.equal(firstPoint.date, BASE_DATE_STR);
    assert.equal(firstPoint.timestamp, BASE_START_MS);
    assert.equal(lastPoint.date, "2026-11-30");

    for (let i = 1; i < timeline.length; i++) {
      const current = timeline[i]!;
      assert.equal(current.balance, firstPoint.balance);
      assert.equal(current.netChange, 0);
      assert.equal(current.commitCount, 0);
    }
  });

  test("correctly accounts for prior commits before startDate in initial running balance", () => {
    const manager = new BranchManager({ initialBalance: 200 });
    const main = manager.getBranch("main")!;

    const priorTimestamp = BASE_START_MS - DAY_MS;
    const c1: CommitNode = {
      id: "c_prior",
      parentIds: [],
      branchId: main.id,
      message: "Prior salary",
      timestamp: priorTimestamp,
      delta: 3000,
      payload: { amount: 3000, category: "Salary", type: "income" },
    };
    manager.addCommit(main.id, {
      ...c1,
      timestamp: priorTimestamp,
    });

    const timeline = manager.projectTimeline(main.id, 10, {
      startDate: BASE_DATE_STR,
    });

    assert.equal(timeline.length, 10);
    const p0 = timeline[0]!;
    const p9 = timeline[9]!;
    assert.equal(p0.balance, 3200);
    assert.equal(p0.netChange, 0);
    assert.equal(p9.balance, 3200);
  });

  test("interpolates daily balances across scheduled future commits", () => {
    const manager = new BranchManager({ initialBalance: 1000 });
    const main = manager.getBranch("main")!;

    manager.addCommit(main.id, {
      message: "Utility bill",
      delta: -300,
      amount: 300,
      type: "expense",
      category: "Utilities",
      timestamp: BASE_START_MS + 2 * DAY_MS + 3600_000,
    });

    manager.addCommit(main.id, {
      message: "Freelance gig",
      delta: 1500,
      amount: 1500,
      type: "income",
      category: "Freelance",
      timestamp: BASE_START_MS + 5 * DAY_MS + 10_000,
    });

    const timeline = manager.projectTimeline(main.id, 7, {
      startDate: BASE_DATE_STR,
    });

    assert.equal(timeline.length, 7);

    const d0 = timeline[0]!;
    const d1 = timeline[1]!;
    const d2 = timeline[2]!;
    const d3 = timeline[3]!;
    const d4 = timeline[4]!;
    const d5 = timeline[5]!;
    const d6 = timeline[6]!;

    assert.equal(d0.balance, 1000);
    assert.equal(d0.netChange, 0);

    assert.equal(d1.balance, 1000);
    assert.equal(d1.netChange, 0);

    assert.equal(d2.balance, 700);
    assert.equal(d2.netChange, -300);
    assert.equal(d2.commitCount, 1);

    assert.equal(d3.balance, 700);
    assert.equal(d4.balance, 700);

    assert.equal(d5.balance, 2200);
    assert.equal(d5.netChange, 1500);

    assert.equal(d6.balance, 2200);
  });

  test("aggregates multiple commits occurring on the same calendar day", () => {
    const manager = new BranchManager({ initialBalance: 500 });
    const main = manager.getBranch("main")!;

    const day3TimeA = BASE_START_MS + 3 * DAY_MS + 1000;
    const day3TimeB = BASE_START_MS + 3 * DAY_MS + 7200_000;

    manager.addCommit(main.id, {
      message: "Morning coffee",
      delta: -5,
      amount: 5,
      type: "expense",
      category: "Food",
      timestamp: day3TimeA,
    });

    manager.addCommit(main.id, {
      message: "Afternoon client fee",
      delta: 200,
      amount: 200,
      type: "income",
      category: "Client",
      timestamp: day3TimeB,
    });

    const timeline = manager.projectTimeline(main.id, 5, {
      startDate: BASE_DATE_STR,
    });

    const d3 = timeline[3]!;
    assert.equal(d3.netChange, 195);
    assert.equal(d3.balance, 695);
    assert.equal(d3.commitCount, 2);
    assert.equal(d3.commitIds.length, 2);
  });

  test("isolates forked scenario timeline from base branch", () => {
    const manager = new BranchManager({ initialBalance: 1000 });
    const main = manager.getBranch("main")!;

    manager.addCommit(main.id, {
      message: "Base deposit",
      delta: 500,
      timestamp: BASE_START_MS - DAY_MS,
    });

    const scenario = manager.forkBranch(main.id, "vacation-scenario");

    manager.addCommit(scenario.id, {
      message: "Flight tickets",
      delta: -800,
      amount: 800,
      type: "expense",
      category: "Travel",
      timestamp: BASE_START_MS + 3 * DAY_MS,
    });

    const mainTimeline = manager.projectTimeline(main.id, 5, {
      startDate: BASE_DATE_STR,
    });
    const scenarioTimeline = manager.projectTimeline(scenario.id, 5, {
      startDate: BASE_DATE_STR,
    });

    const mainD3 = mainTimeline[3]!;
    const scenarioD3 = scenarioTimeline[3]!;

    assert.equal(mainD3.balance, 1500);
    assert.equal(mainD3.netChange, 0);

    assert.equal(scenarioD3.balance, 700);
    assert.equal(scenarioD3.netChange, -800);
  });

  test("standalone functions work with raw commit array and default manager", () => {
    const customCommits: CommitNode[] = [
      {
        id: "c_1",
        parentIds: [],
        branchId: "custom",
        message: "Paycheck",
        delta: 2000,
        timestamp: BASE_START_MS + 1 * DAY_MS,
        payload: { amount: 2000, category: "Salary", type: "income" },
      },
      {
        id: "c_2",
        parentIds: ["c_1"],
        branchId: "custom",
        message: "Groceries",
        delta: -150,
        timestamp: BASE_START_MS + 4 * DAY_MS,
        payload: { amount: 150, category: "Food", type: "expense" },
      },
    ];

    const directResult = simulateDailyTimeline(customCommits, 6, {
      startDate: BASE_DATE_STR,
      initialBalance: 100,
    });
    assert.equal(directResult.length, 6);
    assert.equal(directResult[0]!.balance, 100);
    assert.equal(directResult[1]!.balance, 2100);
    assert.equal(directResult[4]!.balance, 1950);

    const overloadResult = projectTimeline(customCommits, 6, {
      startDate: BASE_DATE_STR,
      initialBalance: 100,
    });
    assert.deepEqual(overloadResult, directResult);
  });

  test("handles edge cases: days=0, negative days, non-existent branch, out-of-horizon commits", () => {
    const manager = new BranchManager();
    const main = manager.getBranch("main")!;

    const emptyResult = manager.projectTimeline(main.id, 0);
    assert.deepEqual(emptyResult, []);

    assert.throws(
      () => manager.projectTimeline(main.id, -5),
      /Projection horizon \(days\) must be a non-negative number/
    );

    assert.throws(
      () => manager.projectTimeline("non-existent-branch", 30),
      /Branch 'non-existent-branch' not found/
    );

    manager.addCommit(main.id, {
      message: "Next year bonus",
      delta: 50000,
      timestamp: BASE_START_MS + 100 * DAY_MS,
    });

    const horizonTimeline = manager.projectTimeline(main.id, 10, {
      startDate: BASE_DATE_STR,
    });
    assert.equal(horizonTimeline[9]!.balance, 0);
  });
});
