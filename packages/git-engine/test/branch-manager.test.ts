import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  BranchManager,
  forkBranch,
  addCommit,
} from "../src/branch-manager.js";
import { calculateBranchBalance, getCommitAncestry } from "../src/calculator.js";

describe("Branch Forking & Virtual Commits (AIO-519)", () => {
  test("forkBranch forks from main head and leaves main state untouched", () => {
    const manager = new BranchManager();
    const mainBranch = manager.getBranch("main")!;

    // Seed initial commit on main
    const c1 = manager.commit({
      branchId: mainBranch.id,
      message: "Initial deposit",
      delta: 1000,
      payload: { amount: 1000, category: "Income", type: "income" },
    });

    const initialMainHead = manager.getBranch("main")!.headCommitId;
    assert.equal(initialMainHead, c1.id);

    // Fork new scenario branch
    const scenarioBranch = manager.forkBranch("b_main", "trip-budget");

    assert.equal(scenarioBranch.name, "trip-budget");
    assert.equal(scenarioBranch.baseBranchId, mainBranch.id);
    assert.equal(scenarioBranch.headCommitId, c1.id);
    assert.equal(scenarioBranch.forkPointNodeId, c1.id);

    // Main branch head should remain identical
    assert.equal(manager.getBranch("main")!.headCommitId, initialMainHead);
  });

  test("forkBranch forks from a specific node in ancestry", () => {
    const manager = new BranchManager();
    const main = manager.getBranch("main")!;

    const c1 = manager.commit({
      branchId: main.id,
      message: "C1: Salary",
      delta: 3000,
      payload: { amount: 3000, category: "Salary", type: "income" },
    });

    const c2 = manager.commit({
      branchId: main.id,
      message: "C2: Rent",
      delta: -1000,
      payload: { amount: 1000, category: "Rent", type: "expense" },
    });

    const c3 = manager.commit({
      branchId: main.id,
      message: "C3: Dinner",
      delta: -50,
      payload: { amount: 50, category: "Food", type: "expense" },
    });

    // Fork from C2 specifically
    const forkedBranch = manager.forkBranch("main", "what-if-no-dinner", c2.id);

    assert.equal(forkedBranch.headCommitId, c2.id);
    assert.equal(forkedBranch.forkPointNodeId, c2.id);
    assert.equal(forkedBranch.baseBranchId, main.id);

    // Main branch head is still C3
    assert.equal(manager.getBranch("main")!.headCommitId, c3.id);
  });

  test("forkBranch throws when fork node does not exist or does not belong to branch", () => {
    const manager = new BranchManager();
    const main = manager.getBranch("main")!;

    manager.commit({
      branchId: main.id,
      message: "C1",
      delta: 100,
      payload: { amount: 100, category: "Test", type: "income" },
    });

    assert.throws(
      () => manager.forkBranch("main", "invalid-node-fork", "non_existent_node"),
      /Target fork node 'non_existent_node' not found/
    );

    // Create an unrelated branch with its own commit
    const otherBranch = manager.createBranch({ name: "other-timeline" });
    const otherCommit = manager.commit({
      branchId: otherBranch.id,
      message: "Other commit",
      delta: 50,
      payload: { amount: 50, category: "Test", type: "income" },
    });

    assert.throws(
      () => manager.forkBranch("main", "alien-fork", otherCommit.id),
      /does not belong to the ancestry of branch 'main'/
    );
  });

  test("addCommit appends projected commit to forked branch without mutating main", () => {
    const manager = new BranchManager();
    const main = manager.getBranch("main")!;

    const c1 = manager.commit({
      branchId: main.id,
      message: "Baseline balance",
      delta: 2000,
      payload: { amount: 2000, category: "Savings", type: "income" },
    });

    const scenario = manager.forkBranch("main", "renovation-scenario");
    const mainHeadBefore = manager.getBranch("main")!.headCommitId;

    // Attach projected commit
    const virtualCommit1 = manager.addCommit(scenario.id, {
      message: "Projected kitchen remodel",
      amount: 500,
      type: "expense",
      category: "Home",
    });

    assert.equal(virtualCommit1.isVirtual, true);
    assert.equal(virtualCommit1.nodeType, "projected");
    assert.equal(virtualCommit1.delta, -500);
    assert.deepEqual(virtualCommit1.parentIds, [c1.id]);

    // Check branch head updates
    const updatedScenario = manager.getBranch(scenario.id)!;
    assert.equal(updatedScenario.headCommitId, virtualCommit1.id);

    // Verify main branch remains completely untouched
    const mainAfter = manager.getBranch("main")!;
    assert.equal(mainAfter.headCommitId, mainHeadBefore);

    // Add another virtual commit to the scenario
    const virtualCommit2 = manager.addCommit(scenario.id, {
      message: "Projected freelance bonus",
      delta: 800,
      amount: 800,
      type: "income",
      category: "Bonus",
    });

    assert.deepEqual(virtualCommit2.parentIds, [virtualCommit1.id]);

    // Verify balances
    const commitStore = manager.getCommitStore();
    const mainBalance = calculateBranchBalance(mainAfter.headCommitId, commitStore);
    const scenarioBalance = calculateBranchBalance(
      manager.getBranch(scenario.id)!.headCommitId,
      commitStore
    );

    // Main: 2000
    assert.equal(mainBalance, 2000);
    // Scenario: 2000 - 500 + 800 = 2300
    assert.equal(scenarioBalance, 2300);

    // Verify ancestry lines
    const mainAncestry = getCommitAncestry(mainAfter.headCommitId, commitStore);
    assert.deepEqual(mainAncestry, [c1.id]);

    const scenarioAncestry = getCommitAncestry(
      manager.getBranch(scenario.id)!.headCommitId,
      commitStore
    );
    assert.deepEqual(scenarioAncestry, [
      virtualCommit2.id,
      virtualCommit1.id,
      c1.id,
    ]);
  });

  test("standalone functions forkBranch and addCommit operate with custom or default manager", () => {
    const customManager = new BranchManager();
    const main = customManager.getBranch("main")!;

    const baseCommit = customManager.commit({
      branchId: main.id,
      message: "Base",
      delta: 500,
      payload: { amount: 500, category: "Base", type: "income" },
    });

    // Use standalone functional wrapper with custom manager
    const forked = forkBranch("main", "side-scenario", null, customManager);
    assert.equal(forked.name, "side-scenario");
    assert.equal(forked.headCommitId, baseCommit.id);

    const projected = addCommit(
      forked.id,
      {
        message: "Virtual purchase",
        delta: -150,
        amount: 150,
        category: "Gadgets",
        type: "expense",
      },
      customManager
    );

    assert.equal(projected.branchId, forked.id);
    assert.equal(projected.delta, -150);
    assert.equal(projected.isVirtual, true);

    // Main remains unchanged
    assert.equal(customManager.getBranch("main")!.headCommitId, baseCommit.id);
  });
});
