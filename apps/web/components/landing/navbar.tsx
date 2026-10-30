"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GitBranch, ArrowRight, Menu, X, Terminal } from "lucide-react";
import { GithubIcon } from "./github-icon";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GitBranch className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-zinc-100 text-base">
                Branchy
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                DAG Engine
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              Git for Personal Finance
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          <a
            href="#features"
            className="hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-zinc-100 transition-colors cursor-pointer"
          >
            How it Works
          </a>
          <a
            href="#interactive-demo"
            className="hover:text-zinc-100 transition-colors cursor-pointer"
          >
            DAG Demo
          </a>
          <a
            href="#terminal"
            className="hover:text-zinc-100 transition-colors cursor-pointer"
          >
            CLI & API
          </a>
          <a
            href="#pricing"
            className="hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="hover:text-zinc-100 transition-colors cursor-pointer"
          >
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://github.com/alikuxac/branchy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 text-xs font-medium hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <GithubIcon className="h-4 w-4" />
            <span>GitHub</span>
          </a>

          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all cursor-pointer active:scale-95"
          >
            <span>Launch App</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-zinc-300">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-zinc-900 hover:text-white"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-zinc-900 hover:text-white"
            >
              How it Works
            </a>
            <a
              href="#interactive-demo"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-zinc-900 hover:text-white"
            >
              DAG Demo
            </a>
            <a
              href="#terminal"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-zinc-900 hover:text-white"
            >
              CLI & API
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-zinc-900 hover:text-white"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-zinc-900 hover:text-white"
            >
              FAQ
            </a>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
            <a
              href="https://github.com/alikuxac/branchy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 text-xs font-medium"
            >
              <GithubIcon className="h-4 w-4" />
              <span>View Source on GitHub</span>
            </a>
            <Link
              href="/workspace"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-md"
            >
              <span>Launch Interactive Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
