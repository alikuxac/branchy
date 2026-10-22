import {
  BranchManager,
  calculateDiff,
  calculateSafeToSpend,
  checkRunwayAndDeficit,
  type Branch,
  type CommitNode,
  type DailyBalancePoint,
  type DiffResult,
  type MergeResult,
  type RunwayWarningOptions,
  type RunwayWarningResult,
  type SafeToSpendResult,
  type TransactionPayload,
  type VirtualCommitPayload,
} from "@branchy/git-engine";

export interface ProjectTimelineDTO {
  branchId: string;
  days?: number;
  startDate?: string | number;
  initialBalance?: number;
}

export interface CheckRunwayDTO {
  branchId?: string;
  timeline?: DailyBalancePoint[];
  commits?: CommitNode[];
  days?: number;
  startDate?: string | number;
  initialBalance?: number;
  safetyBuffer?: number;
  reserveFloor?: number;
}

export interface CreateBranchDTO {
  name: string;
  baseBranchId?: string;
}

export interface ForkBranchDTO {
  fromBranchId: string;
  newBranchName: string;
  fromNodeId?: string;
}

export interface AddCommitDTO extends VirtualCommitPayload {
  branchId: string;
}

export interface CheckoutBranchDTO {
  branchId: string;
}

export interface CommitDTO {
  branchId: string;
  message: string;
  delta: number;
  payload: TransactionPayload;
}

export interface MergeBranchDTO {
  sourceBranchId: string;
  targetBranchId: string;
  message?: string;
}

export interface SimulateDiffDTO {
  sourceHeadId: string;
  targetHeadId: string;
  commits: CommitNode[];
}

export interface SafeToSpendDTO {
  currentBalance: number;
  scheduledDeltas: number[];
  reserveFloor?: number;
}

export class FinancialGitService {
  private readonly branchManager: BranchManager;

  constructor() {
    this.branchManager = new BranchManager();
    this.seedInitialBranch();
  }

  private seedInitialBranch(): void {
    this.branchManager.commit({
      branchId: "b_main",
      message: "Initial financial baseline",
      delta: 1000,
      payload: {
        amount: 1000,
        category: "Starting Balance",
        type: "income",
        description: "Initial balance for main branch",
      },
    });
  }

  public getBranches(): { activeBranchId: string; branches: Branch[] } {
    return {
      activeBranchId: this.branchManager.getActiveBranch().id,
      branches: this.branchManager.listBranches(),
    };
  }

  public createBranch(dto: CreateBranchDTO): Branch {
    if (!dto.name || !dto.name.trim()) {
      throw new Error("Branch name is required");
    }
    return this.branchManager.createBranch({
      name: dto.name.trim(),
      baseBranchId: dto.baseBranchId,
    });
  }

  public forkBranch(dto: ForkBranchDTO): Branch {
    if (!dto.fromBranchId) {
      throw new Error("fromBranchId is required");
    }
    if (!dto.newBranchName || !dto.newBranchName.trim()) {
      throw new Error("newBranchName is required");
    }
    return this.branchManager.forkBranch(
      dto.fromBranchId,
      dto.newBranchName.trim(),
      dto.fromNodeId
    );
  }

  public checkout(dto: CheckoutBranchDTO): Branch {
    if (!dto.branchId) {
      throw new Error("branchId is required");
    }
    return this.branchManager.checkout(dto.branchId);
  }

  public commit(dto: CommitDTO): CommitNode {
    return this.branchManager.commit({
      branchId: dto.branchId,
      message: dto.message,
      delta: dto.delta,
      payload: dto.payload,
    });
  }

  public addCommit(dto: AddCommitDTO): CommitNode {
    if (!dto.branchId) {
      throw new Error("branchId is required");
    }
    return this.branchManager.addCommit(dto.branchId, dto);
  }

  public merge(dto: MergeBranchDTO): MergeResult {
    return this.branchManager.merge(
      dto.sourceBranchId,
      dto.targetBranchId,
      dto.message
    );
  }

  public simulateDiff(dto: SimulateDiffDTO): DiffResult {
    const commitStore = new Map<string, CommitNode>();
    for (const commit of dto.commits || []) {
      commitStore.set(commit.id, commit);
    }
    return calculateDiff(dto.sourceHeadId, dto.targetHeadId, commitStore);
  }

  public calculateSafeToSpend(dto: SafeToSpendDTO): SafeToSpendResult {
    return calculateSafeToSpend(dto.scheduledDeltas, {
      currentBalance: dto.currentBalance,
      reserveFloor: dto.reserveFloor,
    });
  }

  public projectTimeline(dto: ProjectTimelineDTO): DailyBalancePoint[] {
    if (!dto.branchId) {
      throw new Error("branchId is required");
    }
    return this.branchManager.projectTimeline(dto.branchId, dto.days, {
      startDate: dto.startDate,
      initialBalance: dto.initialBalance,
    });
  }

  public checkRunway(dto: CheckRunwayDTO): RunwayWarningResult {
    let timeline: DailyBalancePoint[];

    if (dto.timeline) {
      timeline = dto.timeline;
    } else if (dto.branchId) {
      timeline = this.branchManager.projectTimeline(dto.branchId, dto.days, {
        startDate: dto.startDate,
        initialBalance: dto.initialBalance,
        commits: dto.commits,
      });
    } else if (dto.commits) {
      timeline = this.branchManager.projectTimeline("main", dto.days, {
        startDate: dto.startDate,
        initialBalance: dto.initialBalance,
        commits: dto.commits,
      });
    } else {
      throw new Error("Either branchId, commits, or timeline is required to check runway.");
    }

    return checkRunwayAndDeficit(timeline, {
      safetyBuffer: dto.safetyBuffer ?? dto.reserveFloor,
      reserveFloor: dto.reserveFloor ?? dto.safetyBuffer,
    });
  }
}

export const financialGitService = new FinancialGitService();
