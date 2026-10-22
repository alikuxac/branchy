export type TransactionType = "income" | "expense" | "transfer";

export type NodeType = "actual" | "projected";

export interface TransactionMetadata {
  category?: string;
  description?: string;
  sourceAccount?: string;
  targetAccount?: string;
  tags?: string[];
  [key: string]: unknown;
}

/**
 * TransactionNode contract: DAG node representing a financial movement.
 */
export interface TransactionNode {
  id: string;
  parentId: string | null;
  timestamp: number;
  amount: number;
  type: NodeType;
  metadata?: TransactionMetadata;
}

export type NodeMap = Map<string, TransactionNode> | Record<string, TransactionNode>;

export interface ResolveBalanceOptions {
  timestamp?: number;
  initialBalance?: number;
}

export interface TransactionPayload {
  amount: number;
  category: string;
  type: TransactionType;
  description?: string;
  sourceAccount?: string;
  targetAccount?: string;
  isProjected?: boolean;
}

export interface CommitNode {
  id: string;
  parentIds: string[];
  branchId: string;
  message: string;
  timestamp: number;
  delta: number;
  payload: TransactionPayload;
  isVirtual?: boolean;
  nodeType?: NodeType;
}

export interface ForkBranchOptions {
  fromNodeId?: string | null;
}

export interface VirtualCommitPayload {
  message?: string;
  amount?: number;
  delta?: number;
  type?: TransactionType;
  category?: string;
  description?: string;
  sourceAccount?: string;
  targetAccount?: string;
  isProjected?: boolean;
  nodeType?: NodeType;
  isVirtual?: boolean;
  payload?: TransactionPayload;
  timestamp?: number;
  additionalParentIds?: string[];
  [key: string]: unknown;
}

/**
 * Branch contract: Represents a financial scenario / timeline branch.
 */
export interface Branch {
  id: string;
  name: string;
  headNodeId?: string | null;
  forkPointNodeId?: string | null;
  headCommitId: string | null;
  baseBranchId: string | null;
  createdAt: number;
}

export interface DiffItem {
  commitId: string;
  message: string;
  delta: number;
  type: TransactionType;
}

export interface DiffResult {
  aheadBy: number;
  behindBy: number;
  netImpact: number;
  uniqueToSource: DiffItem[];
  uniqueToTarget: DiffItem[];
}

export interface SafeToSpendOptions {
  currentBalance: number;
  reserveFloor?: number;
  daysHorizon?: number;
}

export interface SafeToSpendResult {
  safeToSpend: number;
  projectedMinBalance: number;
  riskDetected: boolean;
}

export interface DailyBalancePoint {
  date: string;
  timestamp: number;
  balance: number;
  netChange: number;
  commitCount: number;
  commitIds: string[];
}

export interface ProjectTimelineOptions {
  startDate?: Date | number | string;
  initialBalance?: number;
  commits?: CommitNode[];
}

export interface RunwayWarningOptions {
  safetyBuffer?: number;
  reserveFloor?: number;
}

export interface RunwayWarningResult {
  riskDetected: boolean;
  riskDate: string | null;
  runwayDays: number;
  maxDeficit: number;
  minBalance: number;
  maxDeficitDate: string | null;
  safetyBuffer: number;
}
