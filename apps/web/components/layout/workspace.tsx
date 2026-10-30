"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "../header";
import { BranchSidebar } from "../sidebar/branch-sidebar";
import { DAGTopology } from "../center/dag-topology";
import { RunwayChart } from "../center/runway-chart";
import { TransactionSidebar } from "../ledger/transaction-sidebar";
import { CreateBranchModal } from "../sidebar/create-branch-modal";
import { DiffDrawer } from "../sidebar/diff-drawer";
import type {
  Branch,
  CommitNode,
  DailyBalancePoint,
  DiffResult,
  RunwayWarningResult,
  SafeToSpendResult,
  TransactionType,
} from "@branchy/git-engine";

export function Workspace() {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>("b_main");
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [commits, setCommits] = useState<CommitNode[]>([]);
  const [actualBalance, setActualBalance] = useState<number>(0);
  const [currentBranchBalance, setCurrentBranchBalance] = useState<number>(0);
  const [safeToSpend, setSafeToSpend] = useState<SafeToSpendResult>({
    safeToSpend: 0,
    projectedMinBalance: 0,
    riskDetected: false,
  });
  const [runway, setRunway] = useState<RunwayWarningResult>({
    riskDetected: false,
    riskDate: null,
    runwayDays: 60,
    maxDeficit: 0,
    minBalance: 0,
    maxDeficitDate: null,
    safetyBuffer: 200,
  });
  const [mainTimeline, setMainTimeline] = useState<DailyBalancePoint[]>([]);
  const [activeTimeline, setActiveTimeline] = useState<DailyBalancePoint[]>([]);
  const [horizonDays, setHorizonDays] = useState<number>(60);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch full state from API
  const fetchState = useCallback(async (days = horizonDays) => {
    try {
      const res = await fetch(`/api/branches?days=${days}`);
      const data = await res.json();
      if (data.success) {
        setBranches(data.branches);
        setActiveBranchId(data.activeBranchId);
        setActiveBranch(data.activeBranch);
        setCommits(data.commits);
        setActualBalance(data.actualBalance);
        setCurrentBranchBalance(data.currentBranchBalance);
        setSafeToSpend(data.safeToSpend);
        setRunway(data.runway);
        setMainTimeline(data.mainTimeline);
        setActiveTimeline(data.activeTimeline);
      }
    } catch (err) {
      console.error("Failed to load workspace state:", err);
    } finally {
      setLoading(false);
    }
  }, [horizonDays]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Checkout branch
  const handleCheckout = async (branchId: string) => {
    try {
      const res = await fetch("/api/branches/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId }),
      });
      const data = await res.json();
      if (data.success) {
        setBranches(data.branches);
        setActiveBranchId(data.activeBranchId);
        setActiveBranch(data.activeBranch);
        setSafeToSpend(data.safeToSpend);
        setRunway(data.runway);
        setActiveTimeline(data.activeTimeline);
      }
    } catch (err) {
      console.error("Failed to checkout branch:", err);
    }
  };

  // Fork / Create branch
  const handleFork = async (name: string, fromNodeId?: string) => {
    const res = await fetch("/api/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, fromBranchId: "b_main", fromNodeId }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to create branch");
    }
    await fetchState();
  };

  // Delete branch
  const handleDeleteBranch = async (branchId: string) => {
    try {
      const res = await fetch(`/api/branches?branchId=${branchId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await fetchState();
      }
    } catch (err) {
      console.error("Failed to delete branch:", err);
    }
  };

  // Add Commit
  const handleAddCommit = async (payload: {
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
    branchId: string;
  }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/commits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to commit");
      }
      await fetchState();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revert Commit
  const handleRevertCommit = async (commitId: string) => {
    try {
      const res = await fetch("/api/commits/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commitId, branchId: activeBranchId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchState();
      }
    } catch (err) {
      console.error("Failed to revert commit:", err);
    }
  };

  // Open Diff Modal & Calculate Diff
  const handleOpenDiff = async () => {
    if (!activeBranch || activeBranch.name === "main") return;
    try {
      const res = await fetch(
        `/api/diff?sourceBranchId=${activeBranch.id}&targetBranchId=b_main`
      );
      const data = await res.json();
      if (data.success) {
        setDiff(data.diff);
        setIsDiffModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to calculate diff:", err);
    }
  };

  // Merge scenario into main
  const handleMergeActive = async () => {
    if (!activeBranch || activeBranch.name === "main") return;
    setIsMerging(true);
    try {
      const res = await fetch("/api/branches/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceBranchId: activeBranch.id,
          targetBranchId: "b_main",
          message: `Chốt kịch bản: ${activeBranch.name}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchState();
      }
    } finally {
      setIsMerging(false);
    }
  };

  const handleHorizonChange = (days: number) => {
    setHorizonDays(days);
    fetchState(days);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span>Mounting Financial DAG & Git Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top System Header */}
      <Header
        actualBalance={actualBalance}
        activeBranchName={activeBranch?.name || "main"}
        safeToSpend={safeToSpend.safeToSpend}
        riskDetected={safeToSpend.riskDetected}
      />

      {/* Main 3-Pane Layout Container */}
      <main className="flex-1 flex overflow-hidden">
        {/* Pane 1: Left Sidebar (w-72) */}
        <BranchSidebar
          branches={branches}
          activeBranchId={activeBranchId}
          actualBalance={actualBalance}
          safeToSpend={safeToSpend}
          onCheckout={handleCheckout}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenDiffModal={handleOpenDiff}
          onMergeActive={handleMergeActive}
          onDeleteBranch={handleDeleteBranch}
          isMerging={isMerging}
        />

        {/* Pane 2: Center Main View (flex-1) */}
        <section className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
          {/* Top: DAG Graph Topology View */}
          <DAGTopology
            branches={branches}
            activeBranchId={activeBranchId}
            commits={commits}
          />

          {/* Bottom: Cashflow Runway Line Chart */}
          <RunwayChart
            mainTimeline={mainTimeline}
            activeTimeline={activeTimeline}
            activeBranchName={activeBranch?.name || "main"}
            runway={runway}
            horizonDays={horizonDays}
            onHorizonChange={handleHorizonChange}
          />
        </section>

        {/* Pane 3: Right Sidebar (w-80) */}
        <TransactionSidebar
          branches={branches}
          activeBranchId={activeBranchId}
          commits={commits}
          onAddCommit={handleAddCommit}
          onRevertCommit={handleRevertCommit}
          isSubmitting={isSubmitting}
        />
      </main>

      {/* Modals */}
      <CreateBranchModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        commits={commits}
        onFork={handleFork}
      />

      <DiffDrawer
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        diff={diff}
        scenarioName={activeBranch?.name || ""}
        onMerge={handleMergeActive}
        loadingMerge={isMerging}
      />
    </div>
  );
}
