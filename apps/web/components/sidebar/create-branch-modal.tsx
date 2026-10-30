"use client";

import React, { useState } from "react";
import { GitBranch, X, Plus, AlertCircle } from "lucide-react";
import type { CommitNode } from "@branchy/git-engine";

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  commits: CommitNode[];
  onFork: (name: string, fromNodeId?: string) => Promise<void>;
}

export function CreateBranchModal({
  isOpen,
  onClose,
  commits,
  onFork,
}: CreateBranchModalProps) {
  const [name, setName] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please specify a scenario branch name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cleanName = name.startsWith("scenario/") ? name : `scenario/${name.trim()}`;
      await onFork(cleanName, selectedNodeId || undefined);
      setName("");
      setSelectedNodeId("");
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-indigo-400" />
            <h3 className="font-semibold text-sm text-zinc-100">
              Create What-If Scenario Branch
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Scenario Name
            </label>
            <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm focus-within:border-indigo-500">
              <span className="text-zinc-500 font-mono text-xs select-none mr-1">
                scenario/
              </span>
              <input
                type="text"
                value={name.replace(/^scenario\//, "")}
                onChange={(e) => setName(e.target.value)}
                placeholder="mua-xe-may, doi-tro, freelancer-trip"
                className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 focus:outline-none font-mono text-xs"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Creates an isolated timeline that will not alter real ledger balances until merged.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Fork from Commit (Optional)
            </label>
            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="">Latest commit on main (HEAD)</option>
              {commits.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id.slice(0, 8)} - {c.message} (
                  {c.delta >= 0 ? `+$${c.delta}` : `-$${Math.abs(c.delta)}`})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{loading ? "Creating..." : "Fork Scenario"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
