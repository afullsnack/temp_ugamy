CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` text NOT NULL,
	`plan_code` text NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
ALTER TABLE `user` ADD `plan_id` text REFERENCES plans(id);
