import { describe, expect, it } from "vitest";
import { formatClock, nextFocusMode, secondsForMinutes, secondsForMode } from "./focusClock";

describe("focus clock helpers", () => {
  it("formats an accessible minute-and-second clock", () => {
    expect(formatClock(1505)).toBe("25:05");
    expect(formatClock(-2)).toBe("00:00");
  });

  it("constrains duration inputs and derives the active mode duration", () => {
    expect(secondsForMinutes(0)).toBe(60);
    expect(secondsForMode("focus", 25, 5)).toBe(1500);
    expect(secondsForMode("break", 25, 5)).toBe(300);
  });

  it("alternates between focus and break modes after a completed interval", () => {
    expect(nextFocusMode("focus")).toBe("break");
    expect(nextFocusMode("break")).toBe("focus");
  });
});
