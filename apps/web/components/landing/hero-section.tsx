"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  GitCommit,
  GitFork,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  balance: number;
  delta: number;
  safeToSpend: number;
  runwayDays: number;
  riskDetected: boolean;
  commits: Array<{
    hash: string;
    label: string;
    amount: string;
    type: "income" | "expense" | "virtual";
  }>;
}

const SCENARIOS: Scenario[] = [
  {
    id: "main",
    name: "main",
    badge: "Actual Ledger",
    description: "Production timeline synced with verified bank feeds.",
    balance: 8450,
    delta: 0,
    safeToSpend: 4250,
    runwayDays: 60,
    riskDetected: false,
    commits: [
      { hash: "c1a90f", label: "Salary Deposit", amount: "+$4,800", type: "income" },
      { hash: "f82b14", label: "Apartment Rent", amount: "-$1,650", type: "expense" },
      { hash: "e34d71", label: "Cloudflare & SaaS", amount: "-$140", type: "expense" },
    ],
  },
  {
    id: "trip",
    name: "feat/tokyo-trip",
    badge: "Simulated Scenario",
    description: "Simulating a 2-week trip to Japan in June without mutating main.",
    balance: 5250,
    delta: -3200,
    safeToSpend: 1050,
    runwayDays: 45,
    riskDetected: false,
    commits: [
      { hash: "c1a90f", label: "Salary Deposit", amount: "+$4,800", type: "income" },
      { hash: "8a1e93", label: "[Virtual] Flight ANA", amount: "-$1,400", type: "virtual" },
      { hash: "4d7c22", label: "[Virtual] Shinjuku Hotel", amount: "-$1,800", type: "virtual" },
    ],
  },
  {
    id: "car",
    name: "feat/car-lease",
    badge: "Runway Breach Alert",
    description: "Testing a $850/mo lease with $3,000 down payment.",
    balance: 2950,
    delta: -5500,
    safeToSpend: 0,
    runwayDays: 24,
    riskDetected: true,
    commits: [
      { hash: "c1a90f", label: "Salary Deposit", amount: "+$4,800", type: "income" },
      { hash: "9f012b", label: "[Virtual] Down Payment", amount: "-$3,000", type: "virtual" },
      { hash: "2c8411", label: "[Virtual] Monthly Payment", amount: "-$850", type: "virtual" },
    ],
  },
  {
    id: "saas",
    name: "feat/saas-sideproject",
    badge: "Revenue Expansion",
    description: "Projecting 10 new B2B annual subscriptions & hosting cost.",
    balance: 12250,
    delta: +3800,
    safeToSpend: 7800,
    runwayDays: 90,
    riskDetected: false,
    commits: [
      { hash: "c1a90f", label: "Salary Deposit", amount: "+$4,800", type: "income" },
      { hash: "6b33fa", label: "[Virtual] 10x Team Tier", amount: "+$4,200", type: "virtual" },
      { hash: "11a0de", label: "[Virtual] AWS & Workers", amount: "-$400", type: "virtual" },
    ],
  },
];

export function HeroSection() {
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Background glow effects */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-zinc-200">Branchy 0.1.0</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Git-Powered Financial Runway Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Branch your spending{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
              before you break
            </span>{" "}
            your runway.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Personal financial ledger modeled on Git version control. Fork spending
            scenarios as a Directed Acyclic Graph (DAG), calculate timeline diffs, and
            project cash flow without mutating the main financial history.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/workspace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
            >
              <span>Launch Live Workspace</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <a
              href="#interactive-demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 font-medium text-sm transition-all"
            >
              <GitFork className="h-4 w-4 text-indigo-400" aria-hidden="true" />
              <span>Explore Interactive DAG</span>
            </a>
          </div>

          {/* Quick value trust signals */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>Zero external AI dependencies</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>AGPL-3.0 Open Source</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>Cloudflare Workers & D1 Edge</span>
            </div>
          </div>
        </div>

        {/* Interactive Mini-DAG Simulator Widget */}
        <div id="interactive-demo" className="mt-14 max-w-5xl mx-auto scroll-mt-24">
          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/70 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl overflow-hidden">
            {/* Widget Header / Branch Picker */}
            <div className="px-4 sm:px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-zinc-400 font-medium">
                  branchy-simulation-sandbox
                </span>
              </div>

              {/* Scenario Switcher Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {SCENARIOS.map((scenario) => {
                  const isActive = activeScenario.id === scenario.id;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => setActiveScenario(scenario)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm font-semibold"
                          : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      <GitBranch className="h-3 w-3" aria-hidden="true" />
                      <span>{scenario.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulation Canvas Body */}
            <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Branch DAG Node Pipeline */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                      Active Branch Pipeline
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        activeScenario.riskDetected
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : activeScenario.id === "main"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                      }`}
                    >
                      {activeScenario.badge}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    Ahead: {activeScenario.commits.length - 1} commits
                  </span>
                </div>

                {/* Visual Commit Nodes */}
                <div className="space-y-3 relative pl-6 border-l-2 border-indigo-500/30 ml-3">
                  {activeScenario.commits.map((commit, idx) => (
                    <div
                      key={commit.hash}
                      className="relative flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                    >
                      {/* Node Bullet Point */}
                      <div
                        className={`absolute -left-[31px] h-3.5 w-3.5 rounded-full border-2 border-zinc-950 ${
                          commit.type === "virtual"
                            ? activeScenario.riskDetected
                              ? "bg-rose-500 ring-2 ring-rose-500/30"
                              : "bg-indigo-400 ring-2 ring-indigo-500/30"
                            : "bg-emerald-400"
                        }`}
                        aria-hidden="true"
                      />

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                          {commit.hash}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-zinc-200">
                            {commit.label}
                          </p>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {commit.type === "virtual"
                              ? "Virtual DAG Node (Hypothetical)"
                              : "Committed to Ledger"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-mono font-semibold ${
                          commit.amount.startsWith("+")
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {commit.amount}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-zinc-400 pt-1">
                  💡 <span className="text-zinc-300 font-medium">Scenario Note:</span>{" "}
                  {activeScenario.description}
                </p>
              </div>

              {/* Right Column: Computed Real-Time Financial Projection */}
              <div className="rounded-xl p-5 bg-zinc-950/90 border border-zinc-800/90 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <span className="text-xs font-mono text-zinc-400">
                      Projected Balance
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Horizon: 60d</span>
                  </div>

                  <div className="pt-3">
                    <div className="text-2xl font-bold font-mono tracking-tight text-white">
                      ${activeScenario.balance.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs font-mono font-medium ${
                          activeScenario.delta >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {activeScenario.delta > 0
                          ? `+$${activeScenario.delta.toLocaleString()}`
                          : activeScenario.delta < 0
                          ? `-$${Math.abs(activeScenario.delta).toLocaleString()}`
                          : "±$0 diff vs main"}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        (timeline diff)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Safe-to-Spend & Runway */}
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">Safe-to-Spend:</span>
                      <span
                        className={`font-bold ${
                          activeScenario.safeToSpend > 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        ${activeScenario.safeToSpend.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Capital remaining above configured safety buffer floor.
                    </p>
                  </div>

                  <div
                    className={`p-3 rounded-lg border text-xs font-mono ${
                      activeScenario.riskDetected
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {activeScenario.riskDetected ? (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                      )}
                      <div>
                        <span className="font-semibold block">
                          Runway: {activeScenario.runwayDays} Days
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {activeScenario.riskDetected
                            ? "Buffer deficit breached on Day 24!"
                            : "Runway healthy across whole forecast."}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/workspace"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-medium transition-colors"
                >
                  <span>Open in Full Workspace</span>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
