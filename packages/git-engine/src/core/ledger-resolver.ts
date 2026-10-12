import type { NodeMap, ResolveBalanceOptions, TransactionNode } from "../types/index.js";

/**
 * Normalizes Map or Record object into a lookup function.
 */
function getNode(graph: NodeMap, id: string): TransactionNode | undefined {
  if (graph instanceof Map) {
    return graph.get(id);
  }
  return graph[id];
}

/**
 * Traverses ledger graph backward from a given nodeId to the root node
 * and calculates cumulative balance at an optional time T.
 * Only follows direct ancestry line; independent branches do not affect the balance.
 *
 * @param nodeId Starting head/target node ID
 * @param graph Node collection (Map or Record)
 * @param options Optional timestamp cutoff (T) and initial balance
 * @returns Cumulative balance along the ancestry path up to time T
 */
export function resolveBalanceAt(
  nodeId: string | null,
  graph: NodeMap,
  options?: ResolveBalanceOptions | number
): number {
  if (!nodeId) return 0;

  let cutoffTimestamp: number | undefined;
  let runningBalance = 0;

  if (typeof options === "number") {
    cutoffTimestamp = options;
  } else if (options) {
    cutoffTimestamp = options.timestamp;
    runningBalance = options.initialBalance ?? 0;
  }

  let currentId: string | null = nodeId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = getNode(graph, currentId);
    if (!node) break;

    // Only include node in cumulative balance if it occurred at or before cutoff timestamp T
    if (cutoffTimestamp === undefined || node.timestamp <= cutoffTimestamp) {
      runningBalance += node.amount;
    }

    currentId = node.parentId;
  }

  return runningBalance;
}

/**
 * Returns ordered array of transaction nodes from current node back to root.
 */
export function getNodeAncestry(
  nodeId: string | null,
  graph: NodeMap
): TransactionNode[] {
  if (!nodeId) return [];

  const ancestry: TransactionNode[] = [];
  let currentId: string | null = nodeId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = getNode(graph, currentId);
    if (!node) break;

    ancestry.push(node);
    currentId = node.parentId;
  }

  return ancestry;
}
