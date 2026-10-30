"use client";

import React, { useState } from "react";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Tag,
  Clock,
  Check,
  Calendar,
  AlertCircle,
  History,
} from "lucide-react";
import type { Branch, CommitNode, TransactionType } from "@branchy/git-engine";
import { formatCurrency } from "@/lib/utils";

interface TransactionSidebarProps {
  branches: Branch[];
  activeBranchId: string;
  commits: CommitNode[];
  onAddCommit: (data: {
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
    branchId: string;
  }) => Promise<void>;
  onRevertCommit: (commitId: string) => Promise<void>;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  "Salary & Income",
  "Housing & Rent",
  "Food & Groceries",
  "Utilities & Bills",
  "Tech & Hardware",
  "Shopping & Lifestyle",
  "Healthcare",
  "Travel & Transport",
  "Investment",
];

export function TransactionSidebar({
  branches,
  activeBranchId,
  commits,
  onAddCommit,
  onRevertCommit,
  isSubmitting,
}: TransactionSidebarProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>(CATEGORIES[2]!);
  const [description, setDescription] = useState<string>("");
  const [targetBranchId, setTargetBranchId] = useState<string>(activeBranchId);
  const [revertingId, setRevertingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync target branch when active branch changes
  React.useEffect(() => {
    setTargetBranchId(activeBranchId);
  }, [activeBranchId]);

  const targetBranch = branches.find((b) => b.id === targetBranchId) || branches[0];
  const isMainTarget = targetBranch?.name === "main" || targetBranch?.id === "b_main";
  const commitTag = isMainTarget ? "actual" : "projected";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please specify a valid positive amount");
      return;
    }

    try {
      setError(null);
      await onAddCommit({
        amount: parsedAmount,
        type,
        category,
        description: description.trim() || `${category} (${type})`,
        branchId: targetBranchId,
      });

      // Reset form
      setAmount("");
      setDescription("");
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleRevert = async (commitId: string) => {
    try {
      setRevertingId(commitId);
      await onRevertCommit(commitId);
    } finally {
      setRevertingId(null);
    }
  };

  return (
    <aside className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0 select-none overflow-hidden h-[calc(100vh-3.5rem)]">
      {/* 1. Fast Transaction Entry Form */}
      <div className="p-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Quick Transaction
            </h3>
          </div>
          {/* Commit Classification Pill */}
          <span
            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
              commitTag === "actual"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
            }`}
          >
            Type: {commitTag}
          </span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 mb-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                type === "expense"
                  ? "bg-rose-500/20 text-rose-300 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Expense (-)</span>
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                type === "income"
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <ArrowDownLeft className="h-3.5 w-3.5" />
              <span>Income (+)</span>
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">
                $
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono text-sm"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Target Branch Option */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Commit Target Branch
            </label>
            <select
              value={targetBranchId}
              onChange={(e) => setTargetBranchId(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.name === "main" ? "(actual)" : "(what-if)"}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Note / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Starbucks, Annual Domain, AWS"
              className="w-full px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors disabled:opacity-50 shadow-md shadow-indigo-950"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Committing..." : "Commit Transaction"}</span>
          </button>
        </form>
      </div>

      {/* 2. Commit History Log */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <History className="h-4 w-4 text-zinc-400" />
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Commit History
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {commits.length} log items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {commits.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500">
              No commit history recorded.
            </div>
          ) : (
            commits.map((commit) => {
              const isActual = commit.nodeType === "actual" || commit.branchId === "b_main";
              const isIncome = commit.delta > 0;
              const isReverting = revertingId === commit.id;

              return (
                <div
                  key={commit.id}
                  className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-zinc-400 font-semibold">
                      {commit.id.slice(0, 8)}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                        isActual
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      }`}
                    >
                      {isActual ? "actual" : "projected"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono">
                    <span className="text-zinc-200 truncate pr-2 font-medium">
                      {commit.message}
                    </span>
                    <span
                      className={`font-bold shrink-0 ${
                        commit.delta >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {commit.delta >= 0 ? "+" : ""}
                      {formatCurrency(commit.delta)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50 text-[10px] text-zinc-400 font-mono">
                    <span>{commit.payload?.category || "General"}</span>

                    {/* Revert Commit Button */}
                    <button
                      onClick={() => handleRevert(commit.id)}
                      disabled={isReverting}
                      title="Create counter-transaction reverting this commit"
                      className="flex items-center gap-1 text-zinc-400 hover:text-amber-400 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>{isReverting ? "Reverting..." : "Revert"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
