import { describe, expect, it } from "vitest";
import { mapCloudTask, normaliseScheduledTime, parseTaskFormat, parseTaskJson } from "./taskData";

describe("task import parsing", () => {
  it("imports concise task:priority:time lines and normalises their values", () => {
    expect(parseTaskFormat("Write outline:high:9am\nReview notes:low:14:30")).toEqual({
      tasks: [
        { title: "Write outline", priority: "high", scheduledTime: "09:00" },
        { title: "Review notes", priority: "low", scheduledTime: "14:30" },
      ],
      issues: [],
    });
  });

  it("keeps the colon inside standard HH:MM values when parsing shorthand", () => {
    expect(parseTaskFormat("Morning review:high:09:30\nClose the day:low:17:45")).toEqual({
      tasks: [
        { title: "Morning review", priority: "high", scheduledTime: "09:30" },
        { title: "Close the day", priority: "low", scheduledTime: "17:45" },
      ],
      issues: [],
    });
  });

  it("keeps valid JSON entries while returning useful validation issues", () => {
    expect(parseTaskJson(JSON.stringify({ tasks: [
      { task: "Plan week", priority: "medium", time: "08:00" },
      { task: "", priority: "urgent", time: "later" },
    ] }))).toEqual({
      tasks: [{ title: "Plan week", priority: "medium", scheduledTime: "08:00" }],
      issues: [{ row: 2, message: "Task name is required." }],
    });
  });

  it("maps cloud timestamps and validates clock values", () => {
    expect(normaliseScheduledTime("23:45")).toBe("23:45");
    expect(normaliseScheduledTime("24:00")).toBeNull();
    expect(mapCloudTask({ id: "task-1", title: "Reset desk", priority: "low", scheduled_time: "16:05:00", completed_at: null }))
      .toEqual({ id: "task-1", title: "Reset desk", priority: "low", scheduledTime: "16:05", completedAt: null });
  });
});
