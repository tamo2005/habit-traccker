import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  listUserHabits: vi.fn(),
  createUserHabit: vi.fn(),
  toggleUserHabitCompletion: vi.fn(),
  deleteUserHabit: vi.fn(),
}));

import * as habitDb from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const signedInUser = {
  id: 47,
  openId: "habit-test-user",
  email: "habit@example.com",
  name: "Habit Test",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createContext(user: TrpcContext["user"] = signedInUser): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("habits router", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists only the signed-in user’s habit board", async () => {
    const board = [{ id: 1, name: "Read", cadence: "Daily", color: "moss", completedDates: [] }];
    vi.mocked(habitDb.listUserHabits).mockResolvedValue(board as never);

    const result = await appRouter.createCaller(createContext()).habits.list();

    expect(result).toEqual(board);
    expect(habitDb.listUserHabits).toHaveBeenCalledWith(47);
  });

  it("creates a habit against the signed-in user", async () => {
    vi.mocked(habitDb.createUserHabit).mockResolvedValue(99 as never);
    const caller = appRouter.createCaller(createContext());

    await expect(caller.habits.create({ name: "Walk", cadence: "Daily", color: "saffron" })).resolves.toBe(99);
    expect(habitDb.createUserHabit).toHaveBeenCalledWith(47, { name: "Walk", cadence: "Daily", color: "saffron" });
  });

  it("rejects an invalid completion date before touching the database", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.habits.toggleCompletion({ habitId: 1, completedOn: "today" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(habitDb.toggleUserHabitCompletion).not.toHaveBeenCalled();
  });

  it("requires an authenticated user for habit data", async () => {
    const caller = appRouter.createCaller(createContext(null));

    await expect(caller.habits.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
