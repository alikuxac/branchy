import {
  BranchManager,
  calculateDiff,
  calculateSafeToSpend,
  type Branch,
  type CommitNode,
  type DiffResult,
  type MergeResult,
  type SafeToSpendResult,
  type TransactionPayload,
} from "@branchy/git-engine";

export interface CreateBranchDTO {
  name: string;
  baseBranchId?: string;
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
}

export const financialGitService = new FinancialGitService();
