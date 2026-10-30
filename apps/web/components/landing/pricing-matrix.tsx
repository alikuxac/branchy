"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  popular?: boolean;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

const PLANS: Plan[] = [
  {
    id: "self-hosted",
    name: "Self-Hosted Hacker",
    popular: false,
    priceMonthly: 0,
    priceAnnual: 0,
    description: "Free forever under AGPL-3.0. Deploy to your own Cloudflare account.",
    features: [
      "Zero-dependency TypeScript DAG Engine",
      "Unlimited local branches & commit histories",
      "Cloudflare Workers & D1 local execution",
      "60-day predictive runway projections",
      "Community GitHub support",
    ],
    ctaLabel: "Clone from GitHub",
    ctaHref: "https://github.com/alikuxac/branchy",
  },
  {
    id: "pro",
    name: "Pro Engineer",
    popular: true,
    priceMonthly: 12,
    priceAnnual: 9,
    description: "Cloud syncing, automated recurring bills, and cross-device DAG timelines.",
    features: [
      "Everything in Self-Hosted",
      "Encrypted cloud backup with Cloudflare D1",
      "Up to 20 simultaneous what-if scenario branches",
      "Real-time runway deficit webhook alerts (Slack, Discord)",
      "180-day extended cashflow projection horizon",
      "Priority feature requests",
    ],
    ctaLabel: "Start 14-Day Free Trial",
    ctaHref: "/workspace",
  },
  {
    id: "teams",
    name: "Founders & Teams",
    popular: false,
    priceMonthly: 39,
    priceAnnual: 29,
    description: "For startups, partners, and small businesses managing shared burn rate.",
    features: [
      "Everything in Pro",
      "Multi-user scenario branching & merge requests",
      "Runway audit logs & approval workflows",
      "Custom reserve buffer policies",
      "Dedicated Slack channel with core maintainers",
      "Custom domain & SSO integration",
    ],
    ctaLabel: "Launch Team Sandbox",
    ctaHref: "/workspace",
  },
];

export function PricingMatrix() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-zinc-950/70 border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Transparent SaaS Plans</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Simple, honest pricing for developers.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            100% open-source core. Upgrade for managed Cloudflare cloud sync, automated
            alerts, and multi-user branch diffing.
          </p>

          {/* Billing Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              className={`text-xs font-medium ${
                !isAnnual ? "text-white" : "text-zinc-400"
              }`}
            >
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              role="switch"
              aria-checked={isAnnual}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-indigo-500 shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-medium ${
                  isAnnual ? "text-white" : "text-zinc-400"
                }`}
              >
                Annual Billing
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Save 25%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl flex flex-col justify-between p-7 sm:p-8 transition-all ${
                  plan.popular
                    ? "bg-zinc-900/90 border-2 border-indigo-500/80 shadow-2xl shadow-indigo-950/40"
                    : "bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700/80"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-zinc-400 min-h-[36px] mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-zinc-800">
                    <span className="text-4xl font-extrabold font-mono text-white">
                      ${price}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      / month {isAnnual && plan.priceAnnual > 0 && "(billed annually)"}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 block mb-2 font-semibold">
                      Included Capabilities
                    </span>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
                    plan.popular
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80"
                  }`}
                >
                  <span>{plan.ctaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
