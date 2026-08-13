export type HabitColor = "saffron" | "moss" | "clay" | "ink";

export type Habit = {
  id: string;
  name: string;
  cadence: string;
  color: HabitColor;
  completedDates: string[];
};

export type CloudHabitRow = {
  id: string;
  name: string;
  cadence: string;
  color: HabitColor;
  habit_completions?: Array<{ completed_on: string | null }> | null;
};

export function mapCloudHabit(row: CloudHabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    cadence: row.cadence,
    color: row.color,
    completedDates: (row.habit_completions ?? [])
      .map(completion => completion.completed_on)
      .filter((completedOn): completedOn is string => Boolean(completedOn)),
  };
}

export function mapCloudHabits(rows: CloudHabitRow[]): Habit[] {
  return rows.map(mapCloudHabit);
}
