CREATE TABLE `course_enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`enrolled_at` integer NOT NULL,
	`completed_at` integer,
	`last_accessed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `enrollments_user_course_idx` ON `course_enrollments` (`user_id`,`course_id`);--> statement-breakpoint
CREATE INDEX `enrollments_user_idx` ON `course_enrollments` (`user_id`);--> statement-breakpoint
CREATE INDEX `enrollments_course_idx` ON `course_enrollments` (`course_id`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`slug` text NOT NULL,
	`thumbnail_url` text,
	`difficulty` text DEFAULT 'beginner' NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_slug_unique` ON `courses` (`slug`);--> statement-breakpoint
CREATE INDEX `courses_slug_idx` ON `courses` (`slug`);--> statement-breakpoint
CREATE INDEX `courses_published_idx` ON `courses` (`is_published`);--> statement-breakpoint
CREATE TABLE `video_likes` (
	`user_id` text NOT NULL,
	`video_id` text NOT NULL,
	`liked_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `video_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `video_likes_user_idx` ON `video_likes` (`user_id`);--> statement-breakpoint
CREATE INDEX `video_likes_video_idx` ON `video_likes` (`video_id`);--> statement-breakpoint
CREATE TABLE `video_watch_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`video_id` text NOT NULL,
	`watched_seconds` integer DEFAULT 0 NOT NULL,
	`watch_percentage` real DEFAULT 0 NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`first_watched_at` integer NOT NULL,
	`last_watched_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `watch_progress_user_video_idx` ON `video_watch_progress` (`user_id`,`video_id`);--> statement-breakpoint
CREATE INDEX `watch_progress_user_idx` ON `video_watch_progress` (`user_id`);--> statement-breakpoint
CREATE INDEX `watch_progress_video_idx` ON `video_watch_progress` (`video_id`);--> statement-breakpoint
CREATE INDEX `watch_progress_completed_idx` ON `video_watch_progress` (`is_completed`);--> statement-breakpoint
CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`course_id` integer NOT NULL,
	`metadata` text,
	`title` text NOT NULL,
	`description` text,
	`thumbnail_url` text,
	`duration` integer NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `videos_course_id_idx` ON `videos` (`course_id`);--> statement-breakpoint
CREATE INDEX `videos_published_idx` ON `videos` (`is_published`);--> statement-breakpoint
CREATE INDEX `videos_course_order_idx` ON `videos` (`course_id`,`order_index`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `users_username_idx` ON `user` (`username`);
