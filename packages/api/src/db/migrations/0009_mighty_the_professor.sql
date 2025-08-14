PRAGMA foreign_keys=OFF;
CREATE TABLE `__new_videos` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`course_id` text NOT NULL,
	`metadata` text,
	`title` text NOT NULL,
	`description` text,
	`thumbnail_url` text,
	`duration` real NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE cascade
);

INSERT INTO `__new_videos`("id", "key", "course_id", "metadata", "title", "description", "thumbnail_url", "duration", "order_index", "is_published", "created_at", "updated_at") SELECT "id", "key", "course_id", "metadata", "title", "description", "thumbnail_url", "duration", "order_index", "is_published", "created_at", "updated_at" FROM `videos`;
DROP TABLE `videos`;
ALTER TABLE `__new_videos` RENAME TO `videos`;
PRAGMA foreign_keys=ON;
CREATE INDEX `videos_course_id_idx` ON `videos` (`course_id`);
CREATE INDEX `videos_published_idx` ON `videos` (`is_published`);
CREATE INDEX `videos_course_order_idx` ON `videos` (`course_id`,`order_index`);