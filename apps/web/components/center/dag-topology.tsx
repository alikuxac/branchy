"use client";

import React, { useState } from "react";
import {
  GitCommit,
  ArrowDownLeft,
  ArrowUpRight,
  GitMerge,
  GitFork,
  Check,
  Layers,
} from "lucide-react";
import type { Branch, CommitNode } from "@branchy/git-engine";
import { formatCurrency } from "@/lib/utils";

interface DAGTopologyProps {
  branches: Branch[];
  activeBranchId: string;
  commits: CommitNode[];
  onSelectForkNode?: (nodeId: string) => void;
}

export function DAGTopology({
  branches,
  activeBranchId,
  commits,
  onSelectForkNode,
}: DAGTopologyProps) {
  const [selectedCommit, setSelectedCommit] = useState<CommitNode | null>(null);

  // Group commits by branch
  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];
  const isScenarioActive = activeBranch && activeBranch.name !== "main" && activeBranch.id !== "b_main";

  // Reverse chronological to chronological order for left-to-right flow
  const sortedCommits = [...commits].sort((a, b) => a.timestamp - b.timestamp);

  const mainCommits = sortedCommits.filter(
    (c) => c.branchId === "b_main" || c.nodeType === "actual"
  );
  const scenarioCommits = sortedCommits.filter(
    (c) => c.branchId !== "b_main" && c.nodeType === "projected"
  );

  return (
    <div className="h-64 border-b border-zinc-800 bg-zinc-950/60 p-4 flex flex-col shrink-0 relative overflow-hidden">
      {/* Topology Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-400" />
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            DAG Topology & Branch Rails
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">
            ({commits.length} commits)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-zinc-400">main (actual)</span>
          </div>
          {isScenarioActive && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-400 ring-2 ring-indigo-500/20" />
              <span className="text-indigo-300 font-medium">{activeBranch?.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Parallel Rails Canvas Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden rounded-lg bg-zinc-900/30 border border-zinc-800/60 p-3 relative flex items-center">
        {sortedCommits.length === 0 ? (
          <div className="w-full text-center text-xs text-zinc-500">
            No commits recorded in DAG yet.
          </div>
        ) : (
          <div className="flex flex-col gap-6 min-w-max pr-6 py-2">
            {/* Track 1: Main branch rail */}
            <div className="flex items-center gap-3 relative">
              {/* Rail Line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500/30 z-0" />

              <div className="w-20 shrink-0 z-10 flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-emerald-500/30 text-[11px] font-mono font-medium text-emerald-400 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>main</span>
              </div>

              {/* Commit Nodes on Main */}
              <div className="flex items-center gap-4 z-10 pl-2">
                {mainCommits.map((node) => {
                  const isIncome = node.delta > 0;
                  const isExpense = node.delta < 0;
                  const isMerge = node.payload.category === "merge";

                  return (
                    <div
                      key={node.id}
                      onClick={() => {
                        setSelectedCommit(node);
                        onSelectForkNode?.(node.id);
                      }}
                      className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer select-none bg-zinc-950 ${
                        selectedCommit?.id === node.id
                          ? "border-emerald-400 ring-2 ring-emerald-500/20"
                          : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                          isMerge
                            ? "bg-purple-500/20 text-purple-400"
                            : isIncome
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {isMerge ? (
                          <GitMerge className="h-3 w-3" />
                        ) : isIncome ? (
                          <ArrowDownLeft className="h-3 w-3" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3" />
                        )}
                      </div>

                      <div className="text-left font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-zinc-400 font-semibold">
                            {node.id.slice(0, 7)}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              node.delta >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {node.delta >= 0 ? "+" : ""}
                            {formatCurrency(node.delta)}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate max-w-[110px]">
                          {node.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Track 2: Scenario Rail (when scenario branch exists) */}
            {isScenarioActive && (
              <div className="flex items-center gap-3 relative pl-8">
                {/* SVG Connecting curve from fork point */}
                <svg
                  className="absolute -top-6 left-12 w-12 h-6 pointer-events-none z-0"
                  fill="none"
                >
                  <path
                    d="M 0 0 C 0 16, 24 24, 48 24"
                    stroke="#818cf8"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                </svg>

                {/* Scenario Rail Line */}
                <div className="absolute left-8 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500/40 border-b border-dashed border-indigo-400/50 z-0" />

                <div className="w-28 shrink-0 z-10 flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-indigo-500/40 text-[10px] font-mono font-medium text-indigo-300 shadow-sm truncate">
                  <GitFork className="h-3 w-3 text-indigo-400 shrink-0" />
                  <span className="truncate">{activeBranch?.name.replace("scenario/", "")}</span>
                </div>

                {/* Scenario Commit Nodes */}
                <div className="flex items-center gap-4 z-10 pl-2">
                  {scenarioCommits.length === 0 ? (
                    <span className="text-[11px] text-zinc-500 italic pl-2">
                      Forked point ready. Add projected commits in right sidebar.
                    </span>
                  ) : (
                    scenarioCommits.map((node) => {
                      const isIncome = node.delta > 0;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedCommit(node)}
                          className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer select-none bg-zinc-950 ${
                            selectedCommit?.id === node.id
                              ? "border-indigo-400 ring-2 ring-indigo-500/20"
                              : "border-indigo-500/40 hover:border-indigo-400"
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                              isIncome
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                          </div>

                          <div className="text-left font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-indigo-400 font-semibold">
                                {node.id.slice(0, 7)}
                              </span>
                              <span
                                className={`text-[10px] font-bold ${
                                  node.delta >= 0
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {node.delta >= 0 ? "+" : ""}
                                {formatCurrency(node.delta)}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-300 truncate max-w-[120px]">
                              {node.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
