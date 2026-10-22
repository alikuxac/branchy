import type {
  Branch,
  CommitNode,
  DailyBalancePoint,
  ForkBranchOptions,
  NodeType,
  ProjectTimelineOptions,
  RunwayWarningOptions,
  RunwayWarningResult,
  TransactionPayload,
  TransactionType,
  VirtualCommitPayload,
} from "../types/index.js";
import { getCommitAncestry } from "../analytics/calculator.js";
import { simulateDailyTimeline } from "../analytics/simulator.js";
import { checkRunwayAndDeficit } from "../analytics/runway.js";

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

  /**
   * Forks a new branch from a specified node or head of an existing branch.
   * Isolates financial projection without modifying the base branch state.
   *
   * @param fromBranchId ID or name of the source branch (e.g. 'b_main' or 'main')
   * @param newBranchName Name of the new forked branch
   * @param fromNodeIdOrOptions Optional specific commit/node ID or options to fork from
   */
  public forkBranch(
    fromBranchId: string,
    newBranchName: string,
    fromNodeIdOrOptions?: string | ForkBranchOptions | null
  ): Branch {
    if (!newBranchName || !newBranchName.trim()) {
      throw new Error("New branch name is required.");
    }
    const cleanName = newBranchName.trim();
    const existing = this.getBranch(cleanName);
    if (existing) {
      throw new Error(`Branch with name '${cleanName}' already exists.`);
    }

    const sourceBranch = this.getBranch(fromBranchId);
    if (!sourceBranch) {
      throw new Error(`Source branch '${fromBranchId}' not found.`);
    }

    let targetNodeId: string | null = sourceBranch.headCommitId;
    const requestedNodeId =
      typeof fromNodeIdOrOptions === "string"
        ? fromNodeIdOrOptions
        : fromNodeIdOrOptions?.fromNodeId;

    if (requestedNodeId) {
      const commit = this.commits.get(requestedNodeId);
      if (!commit) {
        throw new Error(
          `Target fork node '${requestedNodeId}' not found in commit store.`
        );
      }
      const ancestry = getCommitAncestry(
        sourceBranch.headCommitId,
        this.commits
      );
      if (!ancestry.includes(requestedNodeId)) {
        throw new Error(
          `Node '${requestedNodeId}' does not belong to the ancestry of branch '${sourceBranch.name}'.`
        );
      }
      targetNodeId = requestedNodeId;
    }

    const newBranch: Branch = {
      id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: cleanName,
      headCommitId: targetNodeId,
      headNodeId: targetNodeId,
      forkPointNodeId: targetNodeId,
      baseBranchId: sourceBranch.id,
      createdAt: Date.now(),
    };

    this.branches.set(newBranch.id, newBranch);
    return newBranch;
  }

  /**
   * Appends a virtual / projected commit to a specified branch.
   * Leaves the main branch and any base branch completely unmodified.
   *
   * @param branchId ID or name of the target branch
   * @param payload Commit payload or transaction details
   */
  public addCommit(
    branchId: string,
    payload: VirtualCommitPayload | TransactionPayload | CommitParams
  ): CommitNode {
    const targetBranch = this.getBranch(branchId);
    if (!targetBranch) {
      throw new Error(`Branch '${branchId}' not found.`);
    }

    const isWrappedParams =
      "payload" in payload &&
      typeof payload.payload === "object" &&
      payload.payload !== null;
    const innerPayload = isWrappedParams
      ? (payload as { payload: TransactionPayload }).payload
      : (payload as TransactionPayload);

    const type: TransactionType =
      innerPayload.type ??
      (payload as VirtualCommitPayload).type ??
      "expense";
    const amount: number =
      innerPayload.amount ??
      (payload as VirtualCommitPayload).amount ??
      Math.abs((payload as VirtualCommitPayload).delta ?? 0);
    const delta: number =
      (payload as VirtualCommitPayload).delta !== undefined
        ? (payload as VirtualCommitPayload).delta!
        : type === "expense"
          ? -Math.abs(amount)
          : amount;

    const category: string =
      innerPayload.category ??
      (payload as VirtualCommitPayload).category ??
      "Projected Spending";
    const description: string =
      innerPayload.description ??
      (payload as VirtualCommitPayload).description ??
      (payload as VirtualCommitPayload).message ??
      "Projected commit";
    const message: string =
      (payload as VirtualCommitPayload).message ?? description;
    const nodeType: NodeType =
      (payload as VirtualCommitPayload).nodeType ??
      ((payload as VirtualCommitPayload).isProjected === false
        ? "actual"
        : "projected");
    const isVirtual: boolean =
      (payload as VirtualCommitPayload).isVirtual ?? (nodeType === "projected");

    const transactionPayload: TransactionPayload = {
      amount,
      category,
      type,
      description,
      sourceAccount:
        innerPayload.sourceAccount ??
        (payload as VirtualCommitPayload).sourceAccount,
      targetAccount:
        innerPayload.targetAccount ??
        (payload as VirtualCommitPayload).targetAccount,
      isProjected: isVirtual,
    };

    const parentIds: string[] = [];
    if (targetBranch.headCommitId) {
      parentIds.push(targetBranch.headCommitId);
    }
    const additional = (payload as VirtualCommitPayload).additionalParentIds;
    if (additional) {
      for (const pId of additional) {
        if (!parentIds.includes(pId)) {
          parentIds.push(pId);
        }
      }
    }

    const commitNode: CommitNode = {
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      parentIds,
      branchId: targetBranch.id,
      message,
      timestamp: (payload as VirtualCommitPayload).timestamp ?? Date.now(),
      delta,
      payload: transactionPayload,
      isVirtual,
      nodeType,
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

  public getInitialBalance(): number {
    return this.initialBalance;
  }

  public projectTimeline(
    branchId: string,
    days: number = 30,
    options?: ProjectTimelineOptions
  ): DailyBalancePoint[] {
    const branch = this.getBranch(branchId);
    if (!branch) {
      throw new Error(`Branch '${branchId}' not found.`);
    }

    let commits: CommitNode[];
    if (options?.commits) {
      commits = options.commits;
    } else {
      const commitStore = this.getCommitStore();
      const ancestryIds = getCommitAncestry(branch.headCommitId, commitStore);
      commits = ancestryIds.map((id) => commitStore.get(id)!).filter(Boolean);
    }

    const initialBalance = options?.initialBalance ?? this.initialBalance;

    return simulateDailyTimeline(commits, days, {
      ...options,
      initialBalance,
    });
  }

  public checkRunway(
    branchId: string,
    days: number = 30,
    options?: ProjectTimelineOptions & RunwayWarningOptions
  ): RunwayWarningResult {
    const timeline = this.projectTimeline(branchId, days, options);
    return checkRunwayAndDeficit(timeline, options);
  }
}

export const defaultBranchManager = new BranchManager();

/**
 * Functional wrapper for forkBranch.
 * Can be called with (fromBranchId, newBranchName), (fromBranchId, newBranchName, fromNodeId),
 * or with an explicit BranchManager instance.
 */
export function forkBranch(
  fromBranchId: string,
  newBranchName: string,
  fromNodeIdOrManager?: string | ForkBranchOptions | BranchManager | null,
  manager?: BranchManager
): Branch {
  let mgr: BranchManager;
  let fromNodeIdOrOpts: string | ForkBranchOptions | null | undefined;

  if (fromNodeIdOrManager instanceof BranchManager) {
    mgr = fromNodeIdOrManager;
    fromNodeIdOrOpts = undefined;
  } else {
    fromNodeIdOrOpts = fromNodeIdOrManager;
    mgr = manager ?? defaultBranchManager;
  }

  return mgr.forkBranch(fromBranchId, newBranchName, fromNodeIdOrOpts);
}

/**
 * Functional wrapper for addCommit.
 * Appends a projected commit to branch on the provided or default BranchManager.
 */
export function addCommit(
  branchId: string,
  payload: VirtualCommitPayload | TransactionPayload | CommitParams,
  manager?: BranchManager
): CommitNode {
  const mgr = manager ?? defaultBranchManager;
  return mgr.addCommit(branchId, payload);
}

export function projectTimeline(
  branchId: string,
  days?: number,
  options?: ProjectTimelineOptions,
  manager?: BranchManager
): DailyBalancePoint[];

export function projectTimeline(
  commits: CommitNode[],
  days?: number,
  options?: ProjectTimelineOptions
): DailyBalancePoint[];

export function projectTimeline(
  target: string | CommitNode[],
  days: number = 30,
  options?: ProjectTimelineOptions,
  manager?: BranchManager
): DailyBalancePoint[] {
  if (Array.isArray(target)) {
    return simulateDailyTimeline(target, days, options);
  }
  const mgr = manager ?? defaultBranchManager;
  return mgr.projectTimeline(target, days, options);
}

export function checkRunway(
  branchId: string,
  days?: number,
  options?: ProjectTimelineOptions & RunwayWarningOptions,
  manager?: BranchManager
): RunwayWarningResult;

export function checkRunway(
  timeline: DailyBalancePoint[],
  options?: RunwayWarningOptions
): RunwayWarningResult;

export function checkRunway(
  commits: CommitNode[],
  days?: number,
  options?: ProjectTimelineOptions & RunwayWarningOptions
): RunwayWarningResult;

export function checkRunway(
  target: string | DailyBalancePoint[] | CommitNode[],
  daysOrOptions?: number | (ProjectTimelineOptions & RunwayWarningOptions) | RunwayWarningOptions,
  options?: ProjectTimelineOptions & RunwayWarningOptions,
  manager?: BranchManager
): RunwayWarningResult {
  if (typeof target === "string") {
    const days = typeof daysOrOptions === "number" ? daysOrOptions : 30;
    const opts = typeof daysOrOptions === "object" ? daysOrOptions : options;
    const mgr = manager ?? defaultBranchManager;
    return mgr.checkRunway(target, days, opts);
  }

  if (target.length > 0 && "balance" in target[0]!) {
    const opts = typeof daysOrOptions === "object" ? daysOrOptions : options;
    return checkRunwayAndDeficit(target as DailyBalancePoint[], opts);
  }

  const days = typeof daysOrOptions === "number" ? daysOrOptions : 30;
  const opts =
    typeof daysOrOptions === "object"
      ? (daysOrOptions as ProjectTimelineOptions & RunwayWarningOptions)
      : options;
  const timeline = simulateDailyTimeline(
    target as CommitNode[],
    days,
    opts as ProjectTimelineOptions | undefined
  );
  return checkRunwayAndDeficit(timeline, opts);
}
