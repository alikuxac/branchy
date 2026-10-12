import type {
  CommitNode,
  DiffItem,
  DiffResult,
  SafeToSpendOptions,
  SafeToSpendResult,
} from "../types/index.js";

/**
 * Calculates cumulative balance along a commit chain starting from head commit.
 */
export function calculateBranchBalance(
  headCommitId: string | null,
  commitStore: Map<string, CommitNode>,
  initialBalance: number = 0
): number {
  if (!headCommitId) return initialBalance;

  let balance = initialBalance;
  let currentId: string | null = headCommitId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const commit = commitStore.get(currentId);
    if (!commit) break;

    balance += commit.delta;
    currentId = commit.parentIds[0] ?? null;
  }

  return balance;
}

/**
 * Traverses ancestry line of a commit back to root.
 */
export function getCommitAncestry(
  commitId: string | null,
  commitStore: Map<string, CommitNode>
): string[] {
  const ancestry: string[] = [];
  let currentId: string | null = commitId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    ancestry.push(currentId);
    const commit = commitStore.get(currentId);
    if (!commit) break;
    currentId = commit.parentIds[0] ?? null;
  }

  return ancestry;
}

/**
 * Calculates git-like diff between two branches (source vs target).
 */
export function calculateDiff(
  sourceHeadId: string | null,
  targetHeadId: string | null,
  commitStore: Map<string, CommitNode>
): DiffResult {
  const sourceLine = getCommitAncestry(sourceHeadId, commitStore);
  const targetLine = getCommitAncestry(targetHeadId, commitStore);

  const targetSet = new Set(targetLine);
  const sourceSet = new Set(sourceLine);

  const uniqueToSourceIds = sourceLine.filter((id) => !targetSet.has(id));
  const uniqueToTargetIds = targetLine.filter((id) => !sourceSet.has(id));

  const uniqueToSource: DiffItem[] = uniqueToSourceIds.map((id) => {
    const c = commitStore.get(id)!;
    return {
      commitId: c.id,
      message: c.message,
      delta: c.delta,
      type: c.payload.type,
    };
  });

  const uniqueToTarget: DiffItem[] = uniqueToTargetIds.map((id) => {
    const c = commitStore.get(id)!;
    return {
      commitId: c.id,
      message: c.message,
      delta: c.delta,
      type: c.payload.type,
    };
  });

  const netImpact = uniqueToSource.reduce((acc, curr) => acc + curr.delta, 0);

  return {
    aheadBy: uniqueToSource.length,
    behindBy: uniqueToTarget.length,
    netImpact,
    uniqueToSource,
    uniqueToTarget,
  };
}

/**
 * Calculates Safe-To-Spend budget ensuring balance doesn't breach the floor.
 */
export function calculateSafeToSpend(
  scheduledDeltas: number[],
  options: SafeToSpendOptions
): SafeToSpendResult {
  const floor = options.reserveFloor ?? 0;
  let runningBalance = options.currentBalance;
  let minBalance = runningBalance;

  for (const delta of scheduledDeltas) {
    runningBalance += delta;
    if (runningBalance < minBalance) {
      minBalance = runningBalance;
    }
  }

  const safeToSpend = Math.max(0, minBalance - floor);
  const riskDetected = minBalance < floor;

  return {
    safeToSpend,
    projectedMinBalance: minBalance,
    riskDetected,
  };
}
