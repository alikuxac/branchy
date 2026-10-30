"use client";

import React from "react";
import { X, GitCommit, ArrowRight, GitMerge, Check } from "lucide-react";
import type { DiffResult } from "@branchy/git-engine";
import { formatCurrency } from "@/lib/utils";

interface DiffDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  diff: DiffResult | null;
  scenarioName: string;
  onMerge: () => Promise<void>;
  loadingMerge?: boolean;
}

export function DiffDrawer({
  isOpen,
  onClose,
  diff,
  scenarioName,
  onMerge,
  loadingMerge,
}: DiffDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-indigo-400 font-semibold">
                {scenarioName}
              </span>
              <span className="text-zinc-500 text-xs">diff vs</span>
              <span className="font-mono text-xs text-emerald-400 font-semibold">
                main
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Impact of applying this scenario to the actual ledger
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {diff ? (
            <>
              {/* Summary Impact Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-[11px] text-zinc-500 block">
                    Net Impact
                  </span>
                  <span
                    className={`text-base font-bold font-mono ${
                      diff.netImpact >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {diff.netImpact >= 0 ? "+" : ""}
                    {formatCurrency(diff.netImpact)}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-[11px] text-zinc-500 block">
                    Ahead by
                  </span>
                  <span className="text-base font-bold font-mono text-indigo-400">
                    {diff.aheadBy} {diff.aheadBy === 1 ? "commit" : "commits"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                  <span className="text-[11px] text-zinc-500 block">
                    Behind by
                  </span>
                  <span className="text-base font-bold font-mono text-zinc-400">
                    {diff.behindBy} {diff.behindBy === 1 ? "commit" : "commits"}
                  </span>
                </div>
              </div>

              {/* Unique commits list */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Commits unique to this scenario ({diff.uniqueToSource.length})
                </h4>
                {diff.uniqueToSource.length === 0 ? (
                  <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-500">
                    No unique commits in this branch. Head matches main.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {diff.uniqueToSource.map((item) => (
                      <div
                        key={item.commitId}
                        className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <GitCommit className="h-4 w-4 text-indigo-400 shrink-0" />
                          <div>
                            <p className="font-medium text-zinc-200">
                              {item.message}
                            </p>
                            <span className="font-mono text-[10px] text-zinc-500">
                              {item.commitId.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`font-mono font-semibold ${
                            item.delta >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {item.delta >= 0 ? "+" : ""}
                          {formatCurrency(item.delta)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-zinc-500 text-xs">
              Calculating branch diff...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3 bg-zinc-950/60 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={async () => {
              await onMerge();
              onClose();
            }}
            disabled={loadingMerge || !diff || diff.aheadBy === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-emerald-950"
          >
            <GitMerge className="h-3.5 w-3.5" />
            <span>
              {loadingMerge ? "Merging..." : "Chốt phương án (Merge to main)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
