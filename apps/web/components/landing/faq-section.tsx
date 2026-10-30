"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How is Branchy different from budgeting apps like YNAB or Monarch?",
    answer:
      "Conventional apps use a single mutable ledger. If you want to simulate a major financial event (like buying a car or taking a sabbatical), you have to contaminate your real numbers or maintain messy side spreadsheets. Branchy models finances as a Directed Acyclic Graph (DAG). You create isolated feature branches, append virtual commits, diff the runway impacts, and merge or delete them cleanly without altering real-world history.",
  },
  {
    question: "Does Branchy send my financial data to external AI models?",
    answer:
      "No. Branchy contains zero third-party AI or LLM integrations. All graph traversals, timeline diffs, and runway calculations are 100% deterministic mathematical operations running in TypeScript on your device or on your private Cloudflare Workers runtime.",
  },
  {
    question: "Can I self-host Branchy on my own infrastructure?",
    answer:
      "Yes. Branchy is open-sourced under the GNU Affero General Public License v3.0 (AGPL-3.0). You can clone the monorepo, configure Cloudflare D1 via Drizzle ORM, and deploy apps/api to your own Cloudflare account with zero vendor lock-in.",
  },
  {
    question: "What is the difference between Actual Balance and Safe-to-Spend?",
    answer:
      "Actual Balance is your current reconciled bank balance today. Safe-to-Spend projects your daily net cash flow across the selected horizon (e.g., 60 days) and calculates the absolute lowest balance dip above your configured safety buffer reserve. If an upcoming bill causes a deficit next month, Safe-to-Spend flags it today.",
  },
  {
    question: "What happens when I merge a feature branch into main?",
    answer:
      "Merging a branch appends the scenario's planned commits into the main ledger branch, updating your baseline runway and incorporating the simulated decisions into your permanent financial roadmap.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything you need to know about Branchy.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Have questions about DAG branching, edge privacy, or setup? We have answers.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-zinc-100">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "transform rotate-180 text-indigo-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
