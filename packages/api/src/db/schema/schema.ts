import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

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


// TODO: Create schema for videos
export const videos = sqliteTable("videos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull(),
  metadata: text("metadata", {mode: "json"})
})
