"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Dot,
} from "recharts";
import { AlertCircle, Calendar, LineChart as ChartIcon } from "lucide-react";
import type { DailyBalancePoint, RunwayWarningResult } from "@branchy/git-engine";
import { formatCurrency } from "@/lib/utils";

interface RunwayChartProps {
  mainTimeline: DailyBalancePoint[];
  activeTimeline: DailyBalancePoint[];
  activeBranchName: string;
  runway: RunwayWarningResult;
  horizonDays: number;
  onHorizonChange: (days: number) => void;
}

export function RunwayChart({
  mainTimeline,
  activeTimeline,
  activeBranchName,
  runway,
  horizonDays,
  onHorizonChange,
}: RunwayChartProps) {
  const isScenarioActive = activeBranchName !== "main";

  // Merge timelines by date
  const chartData = useMemo(() => {
    const dataMap = new Map<string, { date: string; main: number; scenario?: number }>();

    mainTimeline.forEach((pt) => {
      dataMap.set(pt.date, {
        date: pt.date.slice(5), // MM-DD
        main: pt.balance,
      });
    });

    if (isScenarioActive) {
      activeTimeline.forEach((pt) => {
        const existing = dataMap.get(pt.date);
        if (existing) {
          existing.scenario = pt.balance;
        } else {
          dataMap.set(pt.date, {
            date: pt.date.slice(5),
            main: pt.balance,
            scenario: pt.balance,
          });
        }
      });
    }

    return Array.from(dataMap.values()).slice(0, horizonDays);
  }, [mainTimeline, activeTimeline, isScenarioActive, horizonDays]);

  // Find lowest point for breach tooltip
  const minBalance = runway.minBalance;
  const isBreached = runway.riskDetected || minBalance < 0;

  return (
    <div className="flex-1 flex flex-col p-4 bg-zinc-950 overflow-hidden select-none">
      {/* Chart Controls & Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <ChartIcon className="h-4 w-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Cashflow Runway Projection
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Horizon Selector */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
            <span className="text-[10px] text-zinc-500 px-2 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Horizon:
            </span>
            {[30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => onHorizonChange(d)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  horizonDays === d
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Insolvency Breach Alert Banner */}
      {isBreached && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-rose-300">
                Insolvency Alert:
              </span>{" "}
              <span className="text-rose-400 font-mono">
                Projected to breach cashflow floor ({formatCurrency(minBalance)}) on {runway.riskDate || "forecast horizon"}.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
            Runway: {runway.runwayDays} days
          </span>
        </div>
      )}

      {/* Recharts Container */}
      <div className="flex-1 w-full rounded-lg bg-zinc-900/30 border border-zinc-800/80 p-3 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              tick={{ fontSize: 11, fill: "#71717a", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
            />
            <YAxis
              stroke="#71717a"
              tick={{ fontSize: 11, fill: "#71717a", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <div className="rounded-lg bg-zinc-900/95 border border-zinc-800 p-3 shadow-xl backdrop-blur-sm text-xs font-mono space-y-1">
                    <p className="text-zinc-400 font-semibold mb-1 border-b border-zinc-800 pb-1">
                      Date: {label}
                    </p>
                    <div className="flex items-center justify-between gap-4 text-emerald-400">
                      <span>main (actual):</span>
                      <span className="font-bold">
                        {formatCurrency(Number(payload[0]?.value) || 0)}
                      </span>
                    </div>
                    {isScenarioActive && payload[1] && (
                      <div className="flex items-center justify-between gap-4 text-indigo-400">
                        <span>{activeBranchName}:</span>
                        <span className="font-bold">
                          {formatCurrency(Number(payload[1]?.value) || 0)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1.5} />

            {/* Main branch curve: Solid line */}
            <Line
              type="monotone"
              dataKey="main"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#10b981", stroke: "#09090b", strokeWidth: 2 }}
              name="main"
            />

            {/* Scenario branch curve: Dashed line */}
            {isScenarioActive && (
              <Line
                type="monotone"
                dataKey="scenario"
                stroke="#818cf8"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  // If balance drops below 0, mark with prominent red dot
                  if (payload.scenario !== undefined && payload.scenario < 0) {
                    return (
                      <circle
                        key={`breach-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#f43f5e"
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    );
                  }
                  return <React.Fragment key={`empty-${cx}-${cy}`} />;
                }}
                activeDot={{ r: 5, fill: "#818cf8", stroke: "#09090b", strokeWidth: 2 }}
                name={activeBranchName}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend footer */}
      <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-zinc-500 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-emerald-400 inline-block" />
            <span className="text-zinc-300">Solid: main ledger</span>
          </div>
          {isScenarioActive && (
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b-2 border-dashed border-indigo-400 inline-block" />
              <span className="text-indigo-300">Dashed: {activeBranchName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>Red markers: Deficit / Insolvency points (&lt; $0)</span>
        </div>
      </div>
    </div>
  );
}
