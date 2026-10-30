"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Shield,
  Plus,
  GitFork,
  GitMerge,
  Trash2,
  GitCompare,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { Branch, DiffResult, SafeToSpendResult } from "@branchy/git-engine";
import { formatCurrency } from "@/lib/utils";

interface BranchSidebarProps {
  branches: Branch[];
  activeBranchId: string;
  actualBalance: number;
  safeToSpend: SafeToSpendResult;
  onCheckout: (branchId: string) => Promise<void>;
  onOpenCreateModal: () => void;
  onOpenDiffModal: () => void;
  onMergeActive: () => Promise<void>;
  onDeleteBranch: (branchId: string) => Promise<void>;
  isMerging?: boolean;
}

export function BranchSidebar({
  branches,
  activeBranchId,
  actualBalance,
  safeToSpend,
  onCheckout,
  onOpenCreateModal,
  onOpenDiffModal,
  onMergeActive,
  onDeleteBranch,
  isMerging,
}: BranchSidebarProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];
  const isMain = activeBranch?.name === "main" || activeBranch?.id === "b_main";

  const mainBranch = branches.find((b) => b.name === "main" || b.id === "b_main");
  const scenarioBranches = branches.filter(
    (b) => b.name !== "main" && b.id !== "b_main"
  );

  return (
    <aside className="w-72 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0 select-none overflow-hidden h-[calc(100vh-3.5rem)]">
      {/* 1. Overview Metrics */}
      <div className="p-4 border-b border-zinc-800 space-y-3">
        {/* Actual Balance Card */}
        <div className="rounded-xl p-3 bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              Actual Balance
            </span>
            <span className="text-[10px] font-mono text-zinc-500">main</span>
          </div>
          <div className="text-xl font-bold font-mono text-zinc-100 tracking-tight">
            {formatCurrency(actualBalance)}
          </div>
        </div>

        {/* Safe-to-Spend Metric Card */}
        <div
          className={`rounded-xl p-3 border ${
            safeToSpend.riskDetected
              ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              {safeToSpend.riskDetected ? (
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
              Safe-to-Spend
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold">
              {safeToSpend.riskDetected ? "Deficit Risk" : "Stable Runway"}
            </span>
          </div>
          <div className="text-lg font-bold font-mono">
            {formatCurrency(safeToSpend.safeToSpend)}
          </div>
          <p className="text-[10px] mt-1 text-zinc-400">
            Min runway balance: {formatCurrency(safeToSpend.projectedMinBalance)}
          </p>
        </div>
      </div>

      {/* 2. Branch Selector List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Main Branch */}
        <div>
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-2">
            Base Ledger
          </div>
          {mainBranch && (
            <button
              onClick={() => onCheckout(mainBranch.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-all text-left ${
                activeBranchId === mainBranch.id
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold"
                  : "bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">main</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-normal">
                primary
              </span>
            </button>
          )}
        </div>

        {/* Scenario Branches */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Scenarios ({scenarioBranches.length})
            </span>
            <button
              onClick={onOpenCreateModal}
              title="Create new scenario branch"
              className="p-1 rounded text-zinc-400 hover:text-indigo-400 hover:bg-zinc-900 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {scenarioBranches.length === 0 ? (
            <div className="p-3 rounded-lg border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
              No scenarios created yet.
            </div>
          ) : (
            <div className="space-y-1.5">
              {scenarioBranches.map((branch) => {
                const isActive = activeBranchId === branch.id;
                return (
                  <div
                    key={branch.id}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 font-medium"
                        : "bg-zinc-900/40 border border-zinc-800/50 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}
                    onClick={() => onCheckout(branch.id)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <GitBranch className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{branch.name}</span>
                    </div>

                    {/* Quick delete on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(branch.id);
                      }}
                      title="Delete scenario"
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Active Scenario Branch Actions (Bottom section) */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/80 space-y-2 shrink-0">
        <button
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all"
        >
          <GitFork className="h-3.5 w-3.5 text-indigo-400" />
          <span>Tạo kịch bản mới</span>
        </button>

        {!isMain && (
          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="text-[11px] font-mono font-medium text-indigo-300 truncate">
              {activeBranch?.name}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={onOpenDiffModal}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <GitCompare className="h-3 w-3 text-indigo-400" />
                <span>Xem Diff</span>
              </button>

              <button
                onClick={onMergeActive}
                disabled={isMerging}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                <GitMerge className="h-3 w-3" />
                <span>{isMerging ? "Merging..." : "Chốt phương án"}</span>
              </button>
            </div>

            <button
              onClick={() => activeBranch && onDeleteBranch(activeBranch.id)}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[10px] text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              <span>Xóa nhánh thử nghiệm</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 max-w-xs w-full text-center space-y-3">
            <AlertTriangle className="h-6 w-6 text-rose-400 mx-auto" />
            <h4 className="text-xs font-semibold text-zinc-100">
              Delete Scenario Branch?
            </h4>
            <p className="text-[11px] text-zinc-400">
              This will permanently delete this scenario branch and its projected commits.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  await onDeleteBranch(id);
                }}
                className="px-3 py-1.5 text-xs bg-rose-600 text-white rounded-lg hover:bg-rose-500 font-medium"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
