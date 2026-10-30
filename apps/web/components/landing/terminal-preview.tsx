"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Code, Play } from "lucide-react";

interface Snippet {
  id: string;
  title: string;
  method: string;
  endpoint: string;
  code: string;
  response: string;
}

const SNIPPETS: Snippet[] = [
  {
    id: "diff",
    title: "Simulate Diff",
    method: "POST",
    endpoint: "/api/simulate-diff",
    code: `curl -X POST https://api.branchy.dev/api/simulate-diff \\
  -H "Content-Type: application/json" \\
  -d '{
    "sourceBranchId": "b_japan_trip",
    "targetBranchId": "b_main"
  }'`,
    response: `{
  "success": true,
  "diff": {
    "aheadBy": 2,
    "behindBy": 0,
    "netDifference": -3200,
    "sourceBalance": 5250,
    "targetBalance": 8450
  }
}`,
  },
  {
    id: "safe-to-spend",
    title: "Safe-to-Spend Runway",
    method: "POST",
    endpoint: "/api/safe-to-spend",
    code: `curl -X POST https://api.branchy.dev/api/safe-to-spend \\
  -H "Content-Type: application/json" \\
  -d '{
    "branchId": "b_japan_trip",
    "horizonDays": 60,
    "safetyBuffer": 1500
  }'`,
    response: `{
  "safeToSpend": 1050,
  "projectedMinBalance": 2550,
  "safetyBuffer": 1500,
  "riskDetected": false,
  "earliestDeficitDate": null
}`,
  },
  {
    id: "fork",
    title: "Fork Timeline",
    method: "POST",
    endpoint: "/api/branches/fork",
    code: `curl -X POST https://api.branchy.dev/api/branches/fork \\
  -H "Content-Type: application/json" \\
  -d '{
    "fromBranchId": "b_main",
    "newBranchName": "feat/sabbatical-q3"
  }'`,
    response: `{
  "success": true,
  "branch": {
    "id": "b_sabbatical_q3",
    "name": "feat/sabbatical-q3",
    "headCommitId": "c_9f02a1",
    "createdAt": "2026-10-26T15:30:00Z"
  }
}`,
  },
];

export function TerminalPreview() {
  const [activeSnippetId, setActiveSnippetId] = useState("diff");
  const [copied, setCopied] = useState(false);

  const activeSnippet =
    SNIPPETS.find((s) => s.id === activeSnippetId) || SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="terminal" className="py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-400">
            <Code className="h-3.5 w-3.5" />
            <span>Developer-First Platform</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Programmatic financial simulations via REST & TypeScript.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Automate what-if scenarios in your CI pipelines, trigger webhooks on major
            spending thresholds, or embed the DAG engine directly into your software.
          </p>
        </div>

        {/* Terminal Window */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-purple-950/20 overflow-hidden font-mono">
          {/* Header Bar */}
          <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-zinc-400 ml-2 font-medium">
                api.branchy.dev — Hono + Cloudflare Workers
              </span>
            </div>

            {/* Tab selector */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
              {SNIPPETS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSnippetId(s.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeSnippetId === s.id
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Request Endpoint Banner */}
          <div className="px-6 py-2.5 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {activeSnippet.method}
              </span>
              <span className="text-zinc-300 font-semibold">{activeSnippet.endpoint}</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs"
              title="Copy cURL snippet"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy cURL</span>
                </>
              )}
            </button>
          </div>

          {/* Code & Response Panes */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 text-xs">
            {/* Request */}
            <div className="p-5 bg-zinc-950 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block mb-2">
                Request cURL
              </span>
              <pre className="text-zinc-300 leading-relaxed overflow-x-auto">
                <code>{activeSnippet.code}</code>
              </pre>
            </div>

            {/* Response */}
            <div className="p-5 bg-zinc-950/60 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold block mb-2">
                Response JSON (200 OK)
              </span>
              <pre className="text-emerald-300 leading-relaxed overflow-x-auto">
                <code>{activeSnippet.response}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
