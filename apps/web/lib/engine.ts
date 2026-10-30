import {
  BranchManager,
  calculateBranchBalance,
  calculateDiff,
  calculateSafeToSpend,
  getCommitAncestry,
  type Branch,
  type CommitNode,
  type DailyBalancePoint,
  type DiffResult,
  type RunwayWarningResult,
  type SafeToSpendResult,
  type TransactionPayload,
  type TransactionType,
} from "@branchy/git-engine";

export interface WorkspaceState {
  branches: Branch[];
  activeBranchId: string;
  activeBranch: Branch;
  commits: CommitNode[];
  actualBalance: number;
  currentBranchBalance: number;
  safeToSpend: SafeToSpendResult;
  runway: RunwayWarningResult;
  mainTimeline: DailyBalancePoint[];
  activeTimeline: DailyBalancePoint[];
}

export interface NewCommitInput {
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  branchId?: string;
}

class FinancialWorkspaceEngine {
  private readonly manager: BranchManager;
  private readonly initialBaseline = 3000;

  constructor() {
    this.manager = new BranchManager({ initialBalance: this.initialBaseline });
    this.seedBaseline();
  }

  private seedBaseline(): void {
    // 1. Initial Salary
    this.manager.commit({
      branchId: "b_main",
      message: "Monthly Base Salary",
      delta: 4500,
      payload: {
        amount: 4500,
        category: "Salary",
        type: "income",
        description: "Primary income direct deposit",
      },
    });

    // 2. Rent
    this.manager.commit({
      branchId: "b_main",
      message: "Apartment Lease Payment",
      delta: -1400,
      payload: {
        amount: 1400,
        category: "Housing",
        type: "expense",
        description: "Monthly apartment rent",
      },
    });

    // 3. Groceries
    this.manager.commit({
      branchId: "b_main",
      message: "Monthly Groceries & Living",
      delta: -550,
      payload: {
        amount: 550,
        category: "Food",
        type: "expense",
        description: "Supermarket & groceries",
      },
    });

    // 4. Utilities
    const forkNode = this.manager.commit({
      branchId: "b_main",
      message: "High-speed Internet & Utilities",
      delta: -150,
      payload: {
        amount: 150,
        category: "Utilities",
        type: "expense",
        description: "Electricity, Water, Fiber",
      },
    });

    // Create default scenario branch
    const scenarioBranch = this.manager.forkBranch("b_main", "scenario/mua-macbook", forkNode.id);
    this.manager.addCommit(scenarioBranch.id, {
      message: "MacBook Pro M4 Max 36GB",
      delta: -2499,
      type: "expense",
      amount: 2499,
      category: "Tech & Workstation",
      description: "Upgrade dev machine for AI and local LLM work",
      nodeType: "projected",
      isProjected: true,
    });
  }

  public getState(horizonDays: number = 60): WorkspaceState {
    const branches = this.manager.listBranches();
    const activeBranch = this.manager.getActiveBranch();
    const commitStore = this.manager.getCommitStore();
    const allCommits = Array.from(commitStore.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );

    const mainBranch = branches.find((b) => b.name === "main" || b.id === "b_main") || branches[0]!;
    const actualBalance = calculateBranchBalance(
      mainBranch.headCommitId,
      commitStore,
      this.initialBaseline
    );
    const currentBranchBalance = calculateBranchBalance(
      activeBranch.headCommitId,
      commitStore,
      this.initialBaseline
    );

    // Compute timelines
    const mainTimeline = this.manager.projectTimeline(mainBranch.id, horizonDays);
    const activeTimeline = this.manager.projectTimeline(activeBranch.id, horizonDays);

    // Compute Safe-to-Spend on active branch
    const activeCommitAncestry = getCommitAncestry(activeBranch.headCommitId, commitStore);
    const scheduledDeltas = activeCommitAncestry
      .map((id) => commitStore.get(id)?.delta ?? 0);

    const safeToSpend = calculateSafeToSpend(scheduledDeltas, {
      currentBalance: currentBranchBalance,
      reserveFloor: 500, // $500 emergency safety floor
    });

    const runway = this.manager.checkRunway(activeBranch.id, horizonDays, {
      reserveFloor: 0,
      safetyBuffer: 200,
    });

    return {
      branches,
      activeBranchId: activeBranch.id,
      activeBranch,
      commits: allCommits,
      actualBalance,
      currentBranchBalance,
      safeToSpend,
      runway,
      mainTimeline,
      activeTimeline,
    };
  }

  public checkout(branchId: string): Branch {
    return this.manager.checkout(branchId);
  }

  public forkBranch(fromBranchId: string, newBranchName: string, fromNodeId?: string): Branch {
    return this.manager.forkBranch(fromBranchId, newBranchName, fromNodeId);
  }

  public deleteBranch(branchId: string): boolean {
    return this.manager.deleteBranch(branchId);
  }

  public addCommit(input: NewCommitInput): CommitNode {
    const activeBranch = this.manager.getActiveBranch();
    const branchId = input.branchId || activeBranch.id;
    const isMain = branchId === "b_main" || activeBranch.name === "main";

    const delta = input.type === "expense" ? -Math.abs(input.amount) : Math.abs(input.amount);
    const nodeType = isMain ? "actual" : "projected";

    return this.manager.addCommit(branchId, {
      message: input.description || `${input.category} (${input.type})`,
      delta,
      amount: input.amount,
      type: input.type,
      category: input.category,
      description: input.description,
      nodeType,
      isProjected: !isMain,
    });
  }

  public revertCommit(branchId: string, commitId: string): CommitNode {
    const commit = this.manager.getCommit(commitId);
    if (!commit) {
      throw new Error(`Commit '${commitId}' not found.`);
    }

    const opposingDelta = -commit.delta;
    const opposingType: TransactionType = opposingDelta > 0 ? "income" : "expense";

    return this.manager.addCommit(branchId, {
      message: `Revert: ${commit.message}`,
      delta: opposingDelta,
      amount: Math.abs(opposingDelta),
      type: opposingType,
      category: "Reversal",
      description: `Counter-transaction for commit ${commit.id}`,
      nodeType: commit.nodeType,
      isProjected: commit.isVirtual,
    });
  }

  public mergeBranch(sourceBranchId: string, targetBranchId: string, message?: string) {
    return this.manager.merge(sourceBranchId, targetBranchId, message);
  }

  public getDiff(sourceBranchId: string, targetBranchId: string): DiffResult {
    const source = this.manager.getBranch(sourceBranchId);
    const target = this.manager.getBranch(targetBranchId);

    if (!source || !target) {
      throw new Error("Source or target branch not found.");
    }

    return calculateDiff(
      source.headCommitId,
      target.headCommitId,
      this.manager.getCommitStore()
    );
  }

  public getRunway(branchId: string, days: number = 60) {
    const timeline = this.manager.projectTimeline(branchId, days);
    const warning = this.manager.checkRunway(branchId, days);
    return { timeline, warning };
  }
}

// Global singleton instance across Next.js dev server reloads
const globalForEngine = globalThis as unknown as {
  workspaceEngine?: FinancialWorkspaceEngine;
};

export const workspaceEngine =
  globalForEngine.workspaceEngine ?? new FinancialWorkspaceEngine();

if (process.env.NODE_ENV !== "production") {
  globalForEngine.workspaceEngine = workspaceEngine;
}
