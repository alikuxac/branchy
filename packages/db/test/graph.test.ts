import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { getTableColumns } from "drizzle-orm";
import {
  nodes,
  branches,
  nodesRelations,
  branchesRelations,
  type NodeRecord,
  type BranchRecord,
} from "../src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("D1 Drizzle Schema - Graph Nodes & Branches", () => {
  it("should define nodes table with required columns including parent_id", () => {
    const columns = getTableColumns(nodes);

    assert.ok(columns.id, "nodes.id must exist");
    assert.ok(columns.parentId, "nodes.parentId must exist");
    assert.strictEqual(columns.parentId.name, "parent_id");
    assert.ok(columns.branchId, "nodes.branchId must exist");
    assert.strictEqual(columns.branchId.name, "branch_id");
    assert.ok(columns.amount, "nodes.amount must exist");
    assert.strictEqual(columns.amount.name, "amount");
    assert.ok(columns.type, "nodes.type must exist");
    assert.strictEqual(columns.type.name, "type");
    assert.ok(columns.timestamp, "nodes.timestamp must exist");
    assert.strictEqual(columns.timestamp.name, "timestamp");
    assert.ok(columns.createdAt, "nodes.createdAt must exist");
    assert.strictEqual(columns.createdAt.name, "created_at");
  });

  it("should define branches table with required columns including head_node_id and fork_node_id", () => {
    const columns = getTableColumns(branches);

    assert.ok(columns.id, "branches.id must exist");
    assert.ok(columns.name, "branches.name must exist");
    assert.strictEqual(columns.name.name, "name");
    assert.ok(columns.baseBranchId, "branches.baseBranchId must exist");
    assert.strictEqual(columns.baseBranchId.name, "base_branch_id");
    assert.ok(columns.headNodeId, "branches.headNodeId must exist");
    assert.strictEqual(columns.headNodeId.name, "head_node_id");
    assert.ok(columns.forkNodeId, "branches.forkNodeId must exist");
    assert.strictEqual(columns.forkNodeId.name, "fork_node_id");
    assert.ok(columns.headCommitId, "branches.headCommitId must exist");
    assert.strictEqual(columns.headCommitId.name, "head_commit_id");
    assert.ok(columns.isDefault, "branches.isDefault must exist");
    assert.strictEqual(columns.isDefault.name, "is_default");
    assert.ok(columns.createdAt, "branches.createdAt must exist");
    assert.strictEqual(columns.createdAt.name, "created_at");
  });

  it("should export relations for nodes and branches", () => {
    assert.ok(nodesRelations, "nodesRelations must be defined");
    assert.ok(branchesRelations, "branchesRelations must be defined");
  });

  it("should execute generated migration SQL file on SQLite database without errors", () => {
    const migrationsDir = path.resolve(__dirname, "../migrations");
    const sqlFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"));

    assert.ok(sqlFiles.length > 0, "At least one migration file must exist");

    const db = new DatabaseSync(":memory:");

    for (const sqlFile of sqlFiles) {
      const fullPath = path.join(migrationsDir, sqlFile);
      const sqlContent = fs.readFileSync(fullPath, "utf-8");

      // Split statements on Drizzle breakpoint delimiter
      const statements = sqlContent
        .split("--> statement-breakpoint")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      for (const statement of statements) {
        db.exec(statement);
      }
    }

    // Verify table structure in SQLite
    const tablesQuery = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('nodes', 'branches', 'commits', 'cross_repo_prs') ORDER BY name"
      )
      .all() as Array<{ name: string }>;

    const tableNames = tablesQuery.map((t) => t.name);
    assert.deepStrictEqual(tableNames, [
      "branches",
      "commits",
      "cross_repo_prs",
      "nodes",
    ]);

    // Test inserting and querying branch with head_node_id and fork_node_id
    const now = Math.floor(Date.now() / 1000);
    db.prepare(
      `INSERT INTO branches (id, name, base_branch_id, head_node_id, fork_node_id, head_commit_id, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run("b_main", "main", null, "node_root", null, null, 1, now);

    db.prepare(
      `INSERT INTO branches (id, name, base_branch_id, head_node_id, fork_node_id, head_commit_id, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run("b_feat", "feature-x", "b_main", "node_child_1", "node_root", null, 0, now);

    // Test inserting tree linked nodes with parent_id
    db.prepare(
      `INSERT INTO nodes (id, parent_id, branch_id, amount, type, timestamp, name, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run("node_root", null, "b_main", 1000, "actual", 1600000000, "Initial balance", null, now);

    db.prepare(
      `INSERT INTO nodes (id, parent_id, branch_id, amount, type, timestamp, name, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run("node_child_1", "node_root", "b_feat", -250, "projected", 1600000100, "Projected expense", null, now);

    // Verify retrieval
    const fetchedBranch = db
      .prepare("SELECT * FROM branches WHERE id = ?")
      .get("b_feat") as Record<string, unknown>;

    assert.strictEqual(fetchedBranch.fork_node_id, "node_root");
    assert.strictEqual(fetchedBranch.head_node_id, "node_child_1");
    assert.strictEqual(fetchedBranch.base_branch_id, "b_main");

    const fetchedNode = db
      .prepare("SELECT * FROM nodes WHERE id = ?")
      .get("node_child_1") as Record<string, unknown>;

    assert.strictEqual(fetchedNode.parent_id, "node_root");
    assert.strictEqual(fetchedNode.amount, -250);
    assert.strictEqual(fetchedNode.type, "projected");
  });
});
