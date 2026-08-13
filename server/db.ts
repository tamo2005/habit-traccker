import { and, asc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  habitCompletions,
  habits,
  type Habit,
  type InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export type HabitWithCompletions = Habit & { completedDates: string[] };

const starterHabits = [
  { name: "Morning movement", cadence: "Daily", color: "saffron" as const },
  { name: "Read 10 pages", cadence: "Daily", color: "moss" as const },
  { name: "Drink a full glass of water", cadence: "Daily", color: "clay" as const },
  { name: "Plan tomorrow", cadence: "Weeknights", color: "ink" as const },
];

// Lazily create the Drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };

  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      const normalized = user[field] ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    }
  }

  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

async function ensureStarterHabits(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const existing = await db.select({ id: habits.id }).from(habits).where(eq(habits.userId, userId)).limit(1);
  if (existing.length) return;

  await db.insert(habits).values(
    starterHabits.map((habit, index) => ({ ...habit, userId, sortOrder: index })),
  );
}

export async function listUserHabits(userId: number): Promise<HabitWithCompletions[]> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await ensureStarterHabits(userId);
  const habitRows = await db.select().from(habits).where(eq(habits.userId, userId)).orderBy(asc(habits.sortOrder), asc(habits.id));
  if (!habitRows.length) return [];

  const completionRows = await db
    .select()
    .from(habitCompletions)
    .where(inArray(habitCompletions.habitId, habitRows.map(habit => habit.id)));

  const datesByHabitId = new Map<number, string[]>();
  for (const completion of completionRows) {
    const dates = datesByHabitId.get(completion.habitId) ?? [];
    dates.push(completion.completedOn);
    datesByHabitId.set(completion.habitId, dates);
  }

  return habitRows.map(habit => ({ ...habit, completedDates: datesByHabitId.get(habit.id) ?? [] }));
}

export async function createUserHabit(userId: number, input: { name: string; cadence: string; color: "saffron" | "moss" | "clay" | "ink" }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const existing = await db.select({ sortOrder: habits.sortOrder }).from(habits).where(eq(habits.userId, userId));
  const sortOrder = Math.max(-1, ...existing.map(habit => habit.sortOrder)) + 1;
  const result = await db.insert(habits).values({ ...input, userId, sortOrder });
  return result[0].insertId;
}

export async function toggleUserHabitCompletion(userId: number, habitId: number, completedOn: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const ownedHabit = await db
    .select({ id: habits.id })
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);
  if (!ownedHabit.length) throw new Error("Habit not found");

  const existing = await db
    .select({ id: habitCompletions.id })
    .from(habitCompletions)
    .where(and(eq(habitCompletions.habitId, habitId), eq(habitCompletions.completedOn, completedOn)))
    .limit(1);

  if (existing.length) {
    await db.delete(habitCompletions).where(eq(habitCompletions.id, existing[0].id));
    return { completed: false } as const;
  }

  await db.insert(habitCompletions).values({ habitId, completedOn });
  return { completed: true } as const;
}

export async function deleteUserHabit(userId: number, habitId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.delete(habits).where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
  return { success: true } as const;
}
