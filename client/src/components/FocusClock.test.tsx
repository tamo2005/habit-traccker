/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FocusClock from "./FocusClock";

const sonner = vi.hoisted(() => ({ success: vi.fn() }));

vi.mock("sonner", () => ({ toast: sonner }));

describe("FocusClock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sonner.success.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("labels start, pause, and resume actions for the active focus interval", () => {
    render(<FocusClock />);

    fireEvent.click(screen.getByRole("button", { name: "Start focus" }));
    expect(screen.getByRole("button", { name: "Pause" }).getAttribute("aria-pressed")).toBe("true");

    act(() => vi.advanceTimersByTime(1_000));
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Resume focus" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("switches modes, updates a paused duration, and resets the active interval", () => {
    render(<FocusClock />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to break interval" }));
    expect(screen.queryByText("Break interval")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Start break" })).not.toBeNull();

    fireEvent.change(screen.getByLabelText("Break duration in minutes"), { target: { value: "7" } });
    expect(screen.queryByText("07:00")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Start break" }));
    act(() => vi.advanceTimersByTime(1_000));
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset break interval" }));
    expect(screen.queryByText("07:00")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Start break" })).not.toBeNull();
  });

  it("selects Pomodoro, long break, and custom timer modes", () => {
    render(<FocusClock />);

    expect(screen.getByRole("button", { name: "Pomodoro" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Long break" }));
    expect(screen.queryByText("15:00")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Long break" }).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Custom" }));
    expect(screen.getByRole("button", { name: "Custom" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("announces completion and moves naturally from focus to break", () => {
    render(<FocusClock />);

    fireEvent.change(screen.getByLabelText("Focus duration in minutes"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Start focus" }));
    act(() => vi.advanceTimersByTime(60_000));

    expect(screen.queryByText("Break interval")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Start break" })).not.toBeNull();
    expect(sonner.success).toHaveBeenCalledWith("Focus interval complete.", expect.objectContaining({ description: expect.stringContaining("Step away") }));
  });
});
