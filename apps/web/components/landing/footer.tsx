"use client";

import React from "react";
import Link from "next/link";
import { GitBranch, Heart, Shield, Terminal } from "lucide-react";
import { GithubIcon } from "./github-icon";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 text-xs text-zinc-500 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-zinc-800/80">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-100 font-bold text-base">
              <div className="h-7 w-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <GitBranch className="h-4 w-4" />
              </div>
              <span>Branchy</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-xs">
              Personal financial ledger modeled on Git version control. Models transactions as a
              DAG to branch spending scenarios and project runway without mutating truth.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Cloudflare Edge Network: Active</span>
            </div>
          </div>

          {/* Col 2: Architecture */}
          <div className="space-y-3">
            <h4 className="text-zinc-200 font-mono text-xs uppercase tracking-wider font-semibold">
              Monorepo Packages
            </h4>
            <ul className="space-y-2 font-mono text-xs text-zinc-400">
              <li>
                <span className="text-indigo-400">packages/git-engine</span> — TypeScript DAG
              </li>
              <li>
                <span className="text-indigo-400">apps/api</span> — Hono + Cloudflare Workers
              </li>
              <li>
                <span className="text-indigo-400">packages/db</span> — Drizzle ORM + D1 SQL
              </li>
              <li>
                <span className="text-indigo-400">apps/web</span> — Next.js 16 App Router
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h4 className="text-zinc-200 font-mono text-xs uppercase tracking-wider font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <a href="#features" className="hover:text-zinc-200 transition-colors">
                  Features & Architecture
                </a>
              </li>
              <li>
                <a href="#interactive-demo" className="hover:text-zinc-200 transition-colors">
                  Interactive DAG Sandbox
                </a>
              </li>
              <li>
                <a href="#terminal" className="hover:text-zinc-200 transition-colors">
                  REST API & CLI
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-zinc-200 transition-colors">
                  SaaS Pricing Plans
                </a>
              </li>
              <li>
                <Link href="/workspace" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Launch Financial Workspace ➔
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Open Source */}
          <div className="space-y-3">
            <h4 className="text-zinc-200 font-mono text-xs uppercase tracking-wider font-semibold">
              Open Source & License
            </h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Branchy is free software released under the{" "}
              <span className="text-zinc-200 font-medium">GNU AGPL v3.0</span>.
            </p>
            <div className="pt-2">
              <a
                href="https://github.com/alikuxac/branchy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-xs font-medium"
              >
                <GithubIcon className="h-4 w-4" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <p>© {new Date().getFullYear()} Branchy. Git-Powered Financial Runway Engine.</p>
          <div className="flex items-center gap-4">
            <span>Deterministic Math</span>
            <span>•</span>
            <span>Zero Tracking Pixels</span>
            <span>•</span>
            <span>AGPL-3.0 License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
