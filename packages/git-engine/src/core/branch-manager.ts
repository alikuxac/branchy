import type { Branch, CommitNode, TransactionPayload } from "../types/index.js";

export interface BranchManagerOptions {
  initialBalance?: number;
}

export interface CreateBranchParams {
  name: string;
  baseBranchId?: string | null;
}

export interface CommitParams {
  branchId: string;
  message: string;
  delta: number;
  payload: TransactionPayload;
  additionalParentIds?: string[];
}

export interface MergeResult {
  mergeCommit: CommitNode;
  updatedBranch: Branch;
}

/**
 * In-memory Git-like branch engine supporting branching, committing,
 * switching, and fast-forward / 3-way merge logic.
 */
export class BranchManager {
  private branches = new Map<string, Branch>();
  private commits = new Map<string, CommitNode>();
  private activeBranchId: string;
  private readonly initialBalance: number;

  constructor(options?: BranchManagerOptions) {
    this.initialBalance = options?.initialBalance ?? 0;
    const defaultBranch: Branch = {
      id: "b_main",
      name: "main",
      headCommitId: null,
      headNodeId: null,
      forkPointNodeId: null,
      baseBranchId: null,
      createdAt: Date.now(),
    };
    this.branches.set(defaultBranch.id, defaultBranch);
    this.activeBranchId = defaultBranch.id;
  }

  public getActiveBranch(): Branch {
    const branch = this.branches.get(this.activeBranchId);
    if (!branch) {
      throw new Error(`Active branch '${this.activeBranchId}' not found.`);
    }
    return branch;
  }

  public getBranch(idOrName: string): Branch | undefined {
    return (
      this.branches.get(idOrName) ??
      Array.from(this.branches.values()).find((b) => b.name === idOrName)
    );
  }

  public listBranches(): Branch[] {
    return Array.from(this.branches.values());
  }

  public getCommitStore(): Map<string, CommitNode> {
    return new Map(this.commits);
  }

  public getCommit(commitId: string): CommitNode | undefined {
    return this.commits.get(commitId);
  }

  /**
   * Creates a new branch from a base branch (or active branch if omitted).
   */
  public createBranch(params: CreateBranchParams): Branch {
    const existing = this.getBranch(params.name);
    if (existing) {
      throw new Error(`Branch with name '${params.name}' already exists.`);
    }

    const baseBranch = params.baseBranchId
      ? this.getBranch(params.baseBranchId)
      : this.getActiveBranch();

    if (!baseBranch) {
      throw new Error(
        `Base branch '${params.baseBranchId ?? this.activeBranchId}' not found.`
      );
    }

    const newBranch: Branch = {
      id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: params.name,
      headCommitId: baseBranch.headCommitId,
      headNodeId: baseBranch.headNodeId ?? baseBranch.headCommitId,
      forkPointNodeId: baseBranch.headNodeId ?? baseBranch.headCommitId,
      baseBranchId: baseBranch.id,
      createdAt: Date.now(),
    };

    this.branches.set(newBranch.id, newBranch);
    return newBranch;
  }

  /**
   * Switches the active branch.
   */
  public checkout(idOrName: string): Branch {
    const target = this.getBranch(idOrName);
    if (!target) {
      throw new Error(`Branch '${idOrName}' not found.`);
    }
    this.activeBranchId = target.id;
    return target;
  }

  /**
   * Appends a new commit to a specified branch (or current active branch).
   */
  public commit(params: CommitParams): CommitNode {
    const targetBranch = this.getBranch(params.branchId);
    if (!targetBranch) {
      throw new Error(`Branch '${params.branchId}' not found.`);
    }

    const parentIds: string[] = [];
    if (targetBranch.headCommitId) {
      parentIds.push(targetBranch.headCommitId);
    }
    if (params.additionalParentIds) {
      for (const pId of params.additionalParentIds) {
        if (!parentIds.includes(pId)) {
          parentIds.push(pId);
        }
      }
    }

    const commitNode: CommitNode = {
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      parentIds,
      branchId: targetBranch.id,
      message: params.message,
      timestamp: Date.now(),
      delta: params.delta,
      payload: params.payload,
    };

    this.commits.set(commitNode.id, commitNode);

    const updatedBranch: Branch = {
      ...targetBranch,
      headCommitId: commitNode.id,
      headNodeId: commitNode.id,
    };
    this.branches.set(updatedBranch.id, updatedBranch);

    return commitNode;
  }

  /**
   * Merges sourceBranch into targetBranch by creating a merge commit.
   */
  public merge(sourceBranchId: string, targetBranchId: string, message?: string): MergeResult {
    const sourceBranch = this.getBranch(sourceBranchId);
    const targetBranch = this.getBranch(targetBranchId);

    if (!sourceBranch) {
      throw new Error(`Source branch '${sourceBranchId}' not found.`);
    }
    if (!targetBranch) {
      throw new Error(`Target branch '${targetBranchId}' not found.`);
    }
    if (sourceBranch.id === targetBranch.id) {
      throw new Error("Cannot merge a branch into itself.");
    }
    if (!sourceBranch.headCommitId) {
      return {
        mergeCommit: {
          id: targetBranch.headCommitId ?? "empty",
          parentIds: [],
          branchId: targetBranch.id,
          message: "No-op merge: source has no commits",
          timestamp: Date.now(),
          delta: 0,
          payload: { amount: 0, category: "merge", type: "transfer" },
        },
        updatedBranch: targetBranch,
      };
    }

    const mergeCommit = this.commit({
      branchId: targetBranch.id,
      message:
        message ??
        `Merge branch '${sourceBranch.name}' into '${targetBranch.name}'`,
      delta: 0,
      payload: {
        amount: 0,
        category: "merge",
        type: "transfer",
        description: `Merged from ${sourceBranch.name}`,
      },
      additionalParentIds: [sourceBranch.headCommitId],
    });

    const updatedBranch = this.getBranch(targetBranch.id)!;
    return {
      mergeCommit,
      updatedBranch,
    };
  }

  public getInitialBalance(): number {
    return this.initialBalance;
  }
}
