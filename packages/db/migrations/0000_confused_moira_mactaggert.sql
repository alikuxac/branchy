CREATE TABLE `commits` (
	`id` text PRIMARY KEY NOT NULL,
	`branch_id` text NOT NULL,
	`parent_commit_id` text,
	`message` text NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`source_account` text,
	`target_account` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `cross_repo_prs` (
	`id` text PRIMARY KEY NOT NULL,
	`source_branch` text NOT NULL,
	`target_branch` text NOT NULL,
	`status` text NOT NULL,
	`diff_summary` text,
	`created_at` integer NOT NULL,
	`merged_at` integer
);
--> statement-breakpoint
CREATE TABLE `branches` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`base_branch_id` text,
	`head_node_id` text,
	`fork_node_id` text,
	`head_commit_id` text,
	`is_default` integer DEFAULT false,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `branches_name_unique` ON `branches` (`name`);--> statement-breakpoint
CREATE TABLE `nodes` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`branch_id` text NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`type` text DEFAULT 'actual' NOT NULL,
	`timestamp` integer NOT NULL,
	`name` text,
	`metadata` text,
	`created_at` integer NOT NULL
);
