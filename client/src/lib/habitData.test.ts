import { describe, expect, it } from "vitest";
import { mapCloudHabit } from "./habitData";

describe("mapCloudHabit", () => {
  it("maps a user-scoped Supabase habit and its completion dates into dashboard data", () => {
    expect(mapCloudHabit({
      id: "habit-1",
      name: "Morning movement",
      cadence: "Daily",
      color: "saffron",
      habit_completions: [{ completed_on: "2026-08-13" }, { completed_on: null }],
    })).toEqual({
      id: "habit-1",
      name: "Morning movement",
      cadence: "Daily",
      color: "saffron",
      completedDates: ["2026-08-13"],
    });
  });
});
