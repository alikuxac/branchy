"use client";

import React, { useState } from "react";
import { GitCommit, GitBranch, GitCompare, GitMerge, Check, ArrowRight } from "lucide-react";

interface Step {
  step: string;
  command: string;
  title: string;
  description: string;
  details: string[];
}

const STEPS: Step[] = [
  {
    step: "01",
    command: "branchy commit -m 'Payroll + Rent'",
    title: "1. Log Verified Ledger to main",
    description:
      "All historical transactions and steady recurring bills append immutable nodes to the main branch. This represents verified truth.",
    details: [
      "Cryptographic parent hashing prevents tampering",
      "Automatic balance reconciliation",
      "Zero speculation on the production ledger",
    ],
  },
  {
    step: "02",
    command: "branchy fork --from main -b feat/buy-tesla",
    title: "2. Fork an Isolated Spending Scenario",
    description:
      "Want to see how an unexpected $45k expense or a sabbatical affects your next 6 months? Fork a feature branch from any commit.",
    details: [
      "Complete snapshot inheritance from fork point",
      "No impact on actual banking data or reports",
      "Append hypothetical virtual commits freely",
    ],
  },
  {
    step: "03",
    command: "branchy diff feat/buy-tesla main",
    title: "3. Diff Timelines & Detect Deficits",
    description:
      "Evaluate aheadBy, behindBy, and Safe-to-Spend Runway across your configured horizon (30d, 60d, 180d).",
    details: [
      "Instantly identifies first deficit calendar date",
      "Calculates minimum reserve floor violations",
      "Visual timeline curve overlay",
    ],
  },
  {
    step: "04",
    command: "branchy merge feat/buy-tesla into main",
    title: "4. Merge Confirmed Plans or Discard Safely",
    description:
      "If the runway remains green and you decide to move forward, fast-forward merge the scenario into your financial roadmap.",
    details: [
      "One-click scenario consolidation",
      "Or simply `rm` the branch if the numbers look bad",
      "Full audit trail of all decision branches",
    ],
  },
];

export function HowItWorks() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = STEPS[activeStepIndex];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-zinc-950/80 border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <GitMerge className="h-3.5 w-3.5" />
            <span>Workflow Lifecycle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Git version control solves personal runway.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Four familiar stages that bring standard software engineering rigor
            to cash flow planning.
          </p>
        </div>

        {/* Step Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STEPS.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            return (
              <button
                key={step.step}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900 border-indigo-500/60 shadow-lg shadow-indigo-950/30"
                    : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isSelected ? "text-indigo-400" : "text-zinc-500"
                    }`}
                  >
                    STEP {step.step}
                  </span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  {step.title.split(". ")[1]}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase Card */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block px-2.5 py-1 rounded-md bg-zinc-800/70 text-indigo-400 font-mono text-xs border border-zinc-700/60">
              Terminal Command
            </div>
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-sm text-emerald-400 flex items-center justify-between">
              <span>$ {activeStep.command}</span>
              <span className="text-xs text-zinc-600 font-sans">Enter ↵</span>
            </div>

            <h3 className="text-2xl font-bold text-white">
              {activeStep.title}
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {activeStep.description}
            </p>

            <div className="space-y-2 pt-2">
              {activeStep.details.map((detail, index) => (
                <div key={index} className="flex items-center gap-2.5 text-xs text-zinc-400">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-500 text-[11px] pb-3 border-b border-zinc-800">
              <span>DAG ENGINE LOG</span>
              <span className="text-emerald-400">STATUS: 200 OK</span>
            </div>
            <div className="space-y-2 text-zinc-400">
              <p className="text-indigo-400">&gt; resolving git graph references...</p>
              <p>&gt; node depth: 14 commits</p>
              <p>&gt; topological order validated</p>
              <p className="text-emerald-400">&gt; timeline projection: 0 conflicts</p>
            </div>
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-zinc-500 text-[11px]">
              <span>Latency: 0.8ms</span>
              <span>Cloudflare D1</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
