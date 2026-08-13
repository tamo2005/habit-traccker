export type FocusMode = "focus" | "break";

export function secondsForMinutes(minutes: number) {
  return Math.max(60, Math.round(minutes * 60));
}

export function formatClock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function nextFocusMode(mode: FocusMode): FocusMode {
  return mode === "focus" ? "break" : "focus";
}

export function secondsForMode(mode: FocusMode, focusMinutes: number, breakMinutes: number) {
  return secondsForMinutes(mode === "focus" ? focusMinutes : breakMinutes);
}
