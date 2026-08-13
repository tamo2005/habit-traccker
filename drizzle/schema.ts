import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing the Manus OAuth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const habitColors = ["saffron", "moss", "clay", "ink"] as const;

/** Each habit belongs to precisely one signed-in user. */
export const habits = mysqlTable(
  "habits",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 140 }).notNull(),
    cadence: varchar("cadence", { length: 48 }).notNull().default("Daily"),
    color: mysqlEnum("color", habitColors).notNull().default("saffron"),
    sortOrder: int("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("habitsUserOrderIdx").on(table.userId, table.sortOrder)],
);

/** A date-only completion mark avoids timezone ambiguity in the habit board. */
export const habitCompletions = mysqlTable(
  "habitCompletions",
  {
    id: int("id").autoincrement().primaryKey(),
    habitId: int("habitId")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    completedOn: varchar("completedOn", { length: 10 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("completionHabitIdx").on(table.habitId),
    uniqueIndex("completionHabitDayUnique").on(table.habitId, table.completedOn),
  ],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
