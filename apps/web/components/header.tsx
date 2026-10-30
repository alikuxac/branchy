"use client";

import React from "react";
import { GitBranch, ShieldCheck, Activity, Terminal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface HeaderProps {
  actualBalance: number;
  activeBranchName: string;
  safeToSpend: number;
  riskDetected: boolean;
}

export function Header({
  actualBalance,
  activeBranchName,
  safeToSpend,
  riskDetected,
}: HeaderProps) {
  const isMain = activeBranchName === "main";

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-5 flex items-center justify-between select-none shrink-0 z-30">
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 hover:bg-indigo-600/30 transition-colors cursor-pointer"
          title="Back to Landing Page"
        >
          <GitBranch className="h-4 w-4" />
        </a>
        <div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="font-bold tracking-tight text-zinc-100 text-sm hover:text-indigo-400 transition-colors"
            >
              Branchy
            </a>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
              v0.1.0-alpha
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 hidden sm:block">
            Git-Powered Financial Runway & What-If Scenarios
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Active Branch Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs">
          <span className="text-zinc-500 font-mono text-[11px]">HEAD:</span>
          <span
            className={`font-mono font-medium ${
              isMain ? "text-emerald-400" : "text-indigo-400"
            }`}
          >
            {activeBranchName}
          </span>
          {isMain ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              actual ledger
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              what-if
            </span>
          )}
        </div>

        {/* Quick Safe-To-Spend Metric */}
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-mono ${
            riskDetected
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Safe-to-Spend:</span>
          <span className="font-semibold">{formatCurrency(safeToSpend)}</span>
        </div>

        {/* Actual Balance */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
          <span className="text-zinc-400">Actual:</span>
          <span className="font-semibold text-zinc-100">
            {formatCurrency(actualBalance)}
          </span>
        </div>
      </div>
    </header>
  );
}
