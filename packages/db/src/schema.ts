import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { branches } from "./schema/graph";

export * from "./schema/graph";

export const commits = sqliteTable("commits", {
  id: text("id").primaryKey(),
  branchId: text("branch_id")
    .notNull()
    .references(() => branches.id),
  parentCommitId: text("parent_commit_id"),
  message: text("message").notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // 'income' | 'expense' | 'transfer'
  category: text("category").notNull(),
  sourceAccount: text("source_account"),
  targetAccount: text("target_account"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const crossRepoPrs = sqliteTable("cross_repo_prs", {
  id: text("id").primaryKey(),
  sourceBranch: text("source_branch").notNull(),
  targetBranch: text("target_branch").notNull(),
  status: text("status").notNull(), // 'open' | 'merged' | 'closed'
  diffSummary: text("diff_summary"), // JSON summary of net impact
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  mergedAt: integer("merged_at", { mode: "timestamp" }),
});

export type CommitRecord = typeof commits.$inferSelect;
export type NewCommitRecord = typeof commits.$inferInsert;
export type CrossRepoPrRecord = typeof crossRepoPrs.$inferSelect;
export type NewCrossRepoPrRecord = typeof crossRepoPrs.$inferInsert;
