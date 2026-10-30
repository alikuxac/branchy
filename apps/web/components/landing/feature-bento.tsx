"use client";

import React from "react";
import {
  GitBranch,
  GitCompare,
  ShieldAlert,
  Server,
  Layers,
  CheckCircle,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";

export function FeatureBento() {
  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-400">
            <Layers className="h-3.5 w-3.5" />
            <span>Architecture & Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for engineers who manage money like code.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Standard budgeting apps force linear histories and destructive edits.
            Branchy turns your personal finances into a directed acyclic graph.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: DAG Branching Engine (7 cols) */}
          <div className="md:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all group">
            <div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <GitBranch className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Directed Acyclic Graph (DAG) Branching
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Fork timelines at any arbitrary commit or checkpoint node. Test life changes
                like switching jobs, buying a house, or taking a sabbatical in a dedicated branch
                while your primary bank feed remains completely unpolluted.
              </p>
            </div>

            {/* Visual preview */}
            <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/90 p-4 font-mono text-xs text-zinc-400 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pb-2 border-b border-zinc-800">
                <span>GRAPH TOPOLOGY</span>
                <span className="text-indigo-400 font-semibold">dag.forkNode(c_main_head)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="text-zinc-300 font-semibold">b_main:</span>
                <span>c_payroll_apr ➔ c_rent_pay ➔ c_groceries</span>
              </div>
              <div className="flex items-center gap-2 pl-4 text-indigo-300">
                <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                <span className="font-semibold">feat/house-mortgage:</span>
                <span>forked @ c_rent_pay ➔ v_down_payment (-$45,000)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Ledger Diffing Engine (5 cols) */}
          <div className="md:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all group">
            <div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <GitCompare className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Timeline Ledger Diffing
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Run diffs between any two branches to see aheadBy, behindBy, and net
                cashflow impact. Know the exact mathematical consequence before you buy.
              </p>
            </div>

            {/* Visual diff box */}
            <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/90 p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span>aheadBy: 2 commits</span>
                <span className="text-rose-400 font-semibold">Net -$3,400</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-rose-500 h-full w-[65%]" />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
                <span>Baseline: $8,450</span>
                <span>Simulated: $5,050</span>
              </div>
            </div>
          </div>

          {/* Card 3: Safe-to-Spend Runway Warning (5 cols) */}
          <div className="md:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all group">
            <div>
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Safe-to-Spend & Runway Deficit
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Calculates minimum cash floor across a 30 to 180 day forward forecast.
                Automatically detects the exact calendar date of buffer breaches.
              </p>
            </div>

            {/* Runway Alert Box */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 font-mono text-xs text-rose-300 space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span>RUNWAY RISK DETECTED</span>
                <span>Day 37 (July 14)</span>
              </div>
              <p className="text-[11px] text-rose-300/80">
                Deficit of -$1,450 below configured $2,000 emergency reserve buffer.
              </p>
            </div>
          </div>

          {/* Card 4: Edge Serverless & Zero-AI Privacy (7 cols) */}
          <div className="md:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700/80 transition-all group">
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Server className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Cloudflare Workers & D1 Edge Runtime
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Built on Hono and D1 SQL without third-party LLM intermediaries or data scraping.
                Your financial transactions are computed deterministically at the edge closest
                to you.
              </p>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Zero financial data training leaks</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Immutable cryptographic commit IDs</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Sub-50ms global query execution</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Drizzle ORM SQL migrations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
