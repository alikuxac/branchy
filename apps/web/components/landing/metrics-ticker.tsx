"use client";

import React from "react";
import { Cpu, Zap, Shield, GitBranch } from "lucide-react";

interface Metric {
  value: string;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const METRICS: Metric[] = [
  {
    value: "< 1.2ms",
    label: "DAG Diff Calculation",
    sublabel: "Sub-millisecond graph traversal and ahead/behind delta resolution",
    icon: Zap,
  },
  {
    value: "100%",
    label: "Deterministic Math",
    sublabel: "Zero hallucination, no LLM baggage, exact topological sort",
    icon: Shield,
  },
  {
    value: "< 50ms",
    label: "Edge Response Time",
    sublabel: "Deployed globally on Cloudflare Workers and D1 database",
    icon: Cpu,
  },
  {
    value: "AGPL-3.0",
    label: "Sovereign & Open Source",
    sublabel: "Self-host on your own infrastructure with total data privacy",
    icon: GitBranch,
  },
];

export function MetricsTicker() {
  return (
    <section className="py-12 border-y border-zinc-800/80 bg-zinc-950/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {METRICS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700/80 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
                    {item.value}
                  </div>
                </div>
                <h2 className="text-sm font-semibold text-zinc-200">
                  {item.label}
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {item.sublabel}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
