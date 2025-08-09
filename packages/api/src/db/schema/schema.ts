import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";

export const tasks = sqliteTable("tasks", {
  id: integer("id", { mode: "number" })
    .primaryKey({ autoIncrement: true }),
  name: text("name")
    .notNull(),
  done: integer("done", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const selectTasksSchema = createSelectSchema(tasks);

export const insertTasksSchema = createInsertSchema(
  tasks,
  {
    name: schema => schema.name.min(1).max(500),
  },
).required({
  done: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const patchTasksSchema = insertTasksSchema.partial();

export const plans = sqliteTable("plans", {
  id: text("id")
    .primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name")
    .notNull(),
  amount: text("amount").notNull(),
  planCode: text("plan_code").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})

export const insertPlanSchema = createInsertSchema(plans, {
  name: schema => schema.name.min(3)
}).required({
  amount: true,
  planCode: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectPlanSchema = createSelectSchema(plans)
export const patchPlanSchema = insertPlanSchema.partial()

// Courses table
export const courses = sqliteTable('courses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  slug: text('slug').notNull().unique(),
  thumbnailUrl: text('thumbnail_url'),
  difficulty: text('difficulty', { enum: ['beginner', 'intermediate', 'advanced'] }).notNull().default('beginner'),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  slugIdx: index('courses_slug_idx').on(table.slug),
  publishedIdx: index('courses_published_idx').on(table.isPublished),
}));


// TODO: Create schema for videos
export const videos = sqliteTable("videos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull(),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  metadata: text("metadata", { mode: "json" }),
  title: text('title').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration').notNull(), // Duration in seconds
  orderIndex: integer('order_index').notNull().default(0), // Order within the course
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  courseIdIdx: index('videos_course_id_idx').on(table.courseId),
  publishedIdx: index('videos_published_idx').on(table.isPublished),
  courseOrderIdx: index('videos_course_order_idx').on(table.courseId, table.orderIndex),
}));

// User course enrollments
export const courseEnrollments = sqliteTable('course_enrollments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  courseId: text('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  enrolledAt: integer('enrolled_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  lastAccessedAt: integer('last_accessed_at', { mode: 'timestamp' }),
}, (table) => ({
  userCourseIdx: index('enrollments_user_course_idx').on(table.userId, table.courseId),
  userIdx: index('enrollments_user_idx').on(table.userId),
  courseIdx: index('enrollments_course_idx').on(table.courseId),
}));

// User video watch progress
export const videoWatchProgress = sqliteTable('video_watch_progress', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  videoId: text('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  watchedSeconds: integer('watched_seconds').notNull().default(0), // How many seconds watched
  watchPercentage: real('watch_percentage').notNull().default(0), // Percentage watched (0-100)
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  firstWatchedAt: integer('first_watched_at', { mode: 'timestamp' }).notNull()
    .$defaultFn(() => new Date()),
  lastWatchedAt: integer('last_watched_at', { mode: 'timestamp' }).notNull()
    .$defaultFn(() => new Date()),
}, (table) => ({
  userVideoIdx: index('watch_progress_user_video_idx').on(table.userId, table.videoId),
  userIdx: index('watch_progress_user_idx').on(table.userId),
  videoIdx: index('watch_progress_video_idx').on(table.videoId),
  completedIdx: index('watch_progress_completed_idx').on(table.isCompleted),
}));

// Video likes
export const videoLikes = sqliteTable('video_likes', {
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  videoId: text('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  likedAt: integer('liked_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.videoId] }),
  userIdx: index('video_likes_user_idx').on(table.userId),
  videoIdx: index('video_likes_video_idx').on(table.videoId),
}));


export const coursesRelations = relations(courses, ({ many }) => ({
  videos: many(videos),
  enrollments: many(courseEnrollments),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  course: one(courses, {
    fields: [videos.courseId],
    references: [courses.id],
  }),
  watchProgress: many(videoWatchProgress),
  likes: many(videoLikes),
}));

export const courseEnrollmentsRelations = relations(courseEnrollments, ({ one }) => ({
  user: one(user, {
    fields: [courseEnrollments.userId],
    references: [user.id],
  }),
  course: one(courses, {
    fields: [courseEnrollments.courseId],
    references: [courses.id],
  }),
}));

export const videoWatchProgressRelations = relations(videoWatchProgress, ({ one }) => ({
  user: one(user, {
    fields: [videoWatchProgress.userId],
    references: [user.id],
  }),
  video: one(videos, {
    fields: [videoWatchProgress.videoId],
    references: [videos.id],
  }),
}));

export const videoLikesRelations = relations(videoLikes, ({ one }) => ({
  user: one(user, {
    fields: [videoLikes.userId],
    references: [user.id],
  }),
  video: one(videos, {
    fields: [videoLikes.videoId],
    references: [videos.id],
  }),
}));
