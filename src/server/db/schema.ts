import { relations } from "drizzle-orm";
import { index, sqliteTableCreator } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `concarne_${name}`);

export const users = createTable("user", (d) => ({
  id: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: d.text({ length: 255 }),
  password: d.text({ length: 255 }),
  height: d.integer()
}));

export const usersRelations = relations(users, (s) => ({
  data: s.many(data),
}));

export const data = createTable(
  "data",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    weight: d.integer().notNull(),
    // Date as ISO string (e.g., "2023-04-24T12:00:00.000Z")
    date: d.text().notNull(),
  }),
  (t) => [
    index("data_userid_idx").on(t.userId),
    index("data_userid_date_unique_idx").on(t.userId, t.date),
  ],
);

export const dataRelations = relations(data, ({ one }) => ({
  user: one(users, {
    fields: [data.userId],
    references: [users.id],
  }),
}));

export const fasts = createTable(
  "fasts",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    startTime: d.text().notNull(), // Start time as ISO string (e.g., "2023-04-24T12:00:00.000Z")
    endTime: d.text(), // End time as ISO string (null if fast is ongoing)
    targetHours: d.integer().notNull(), // Target duration in hours (e.g., 16 for 16:8)
    fastType: d.text({ length: 255 }).notNull(), // Type of fast (e.g., "16:8 INTERMITTENT")
    isCompleted: d.integer().default(0), // 0 for ongoing, 1 for completed
    createdAt: d.text().notNull().$defaultFn(() => new Date().toISOString()) // When the fast record was created
  }),
  (t) => [index("fasts_userid_idx").on(t.userId)]
)

export const fastsRelations = relations(fasts, ({ one }) => ({
  user: one(users, {
    fields: [fasts.userId],
    references: [users.id],
  }),
}));
