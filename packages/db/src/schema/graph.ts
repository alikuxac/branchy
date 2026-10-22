import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const nodes = sqliteTable("nodes", {
  id: text("id").primaryKey(),
  parentId: text("parent_id"),
  branchId: text("branch_id").notNull(),
  amount: real("amount").notNull().default(0),
  type: text("type").notNull().default("actual"),
  timestamp: integer("timestamp").notNull(),
  name: text("name"),
  metadata: text("metadata"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const branches = sqliteTable("branches", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  baseBranchId: text("base_branch_id"),
  headNodeId: text("head_node_id"),
  forkNodeId: text("fork_node_id"),
  headCommitId: text("head_commit_id"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const nodesRelations = relations(nodes, ({ one }) => ({
  parent: one(nodes, {
    fields: [nodes.parentId],
    references: [nodes.id],
    relationName: "node_parent",
  }),
  branch: one(branches, {
    fields: [nodes.branchId],
    references: [branches.id],
  }),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  baseBranch: one(branches, {
    fields: [branches.baseBranchId],
    references: [branches.id],
    relationName: "branch_ancestry",
  }),
  headNode: one(nodes, {
    fields: [branches.headNodeId],
    references: [nodes.id],
    relationName: "branch_head_node",
  }),
  forkNode: one(nodes, {
    fields: [branches.forkNodeId],
    references: [nodes.id],
    relationName: "branch_fork_node",
  }),
  nodes: many(nodes),
}));

export type NodeRecord = typeof nodes.$inferSelect;
export type NewNodeRecord = typeof nodes.$inferInsert;
export type BranchRecord = typeof branches.$inferSelect;
export type NewBranchRecord = typeof branches.$inferInsert;
