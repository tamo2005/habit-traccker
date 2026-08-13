import { Pause, Play, RotateCcw, TimerReset } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { formatClock, nextFocusMode, secondsForMode, type FocusMode } from "@/lib/focusClock";
import "./focus-clock.css";

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

function ringAlarm() {
  try {
    const AudioContextConstructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const context = new AudioContextConstructor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(784, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1046, context.currentTime + 0.22);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.6);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.62);
    window.setTimeout(() => void context.close(), 800);
  } catch {
    // The visual state change and live announcement remain available if audio is blocked.
  }
}

export default function FocusClock() {
  const [mode, setMode] = useState<FocusMode>("focus");
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [remainingSeconds, setRemainingSeconds] = useState(() => secondsForMode("focus", DEFAULT_FOCUS_MINUTES, DEFAULT_BREAK_MINUTES));
  const [isRunning, setIsRunning] = useState(false);
  const announcedMode = useRef<FocusMode | null>(null);

  const totalSeconds = secondsForMode(mode, focusMinutes, breakMinutes);
  const progress = Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / totalSeconds) * 100));
  const modeLabel = mode === "focus" ? "Focus interval" : "Break interval";
  const primaryActionLabel = isRunning
    ? "Pause"
    : remainingSeconds === totalSeconds
      ? `Start ${mode}`
      : `Resume ${mode}`;

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => setRemainingSeconds(current => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || remainingSeconds !== 0) return;
    const nextMode = nextFocusMode(mode);
    setIsRunning(false);
    setMode(nextMode);
    setRemainingSeconds(secondsForMode(nextMode, focusMinutes, breakMinutes));
    ringAlarm();
    toast.success(mode === "focus" ? "Focus interval complete." : "Break complete.", {
      description: nextMode === "break" ? "Step away for a short reset when you are ready." : "Return gently to your next clear move.",
    });
  }, [breakMinutes, focusMinutes, isRunning, mode, remainingSeconds]);

  useEffect(() => {
    if (announcedMode.current === mode) return;
    announcedMode.current = mode;
  }, [mode]);

  function resetTimer(nextMode = mode) {
    setIsRunning(false);
    setMode(nextMode);
    setRemainingSeconds(secondsForMode(nextMode, focusMinutes, breakMinutes));
  }

  function updateDuration(kind: FocusMode, value: number) {
    const safeValue = Math.min(120, Math.max(1, Number.isFinite(value) ? value : 1));
    if (kind === "focus") setFocusMinutes(safeValue);
    else setBreakMinutes(safeValue);
    if (!isRunning && mode === kind) setRemainingSeconds(secondsForMode(kind, kind === "focus" ? safeValue : focusMinutes, kind === "break" ? safeValue : breakMinutes));
  }

  const dialStyle = useMemo(() => ({ background: `conic-gradient(#e86a33 ${progress}%, rgba(34, 36, 31, 0.12) ${progress}% 100%)` }), [progress]);

  return <section className={`focus-clock ${mode === "break" ? "is-break" : ""}`} aria-labelledby="focus-clock-heading">
    <div className="focus-clock-heading"><div><p className="eyebrow">FOCUS CLOCK</p><h2 id="focus-clock-heading">{mode === "focus" ? "Make room for one thing." : "Leave a little space."}</h2></div><span className="focus-mode-tag">{mode === "focus" ? "Focus" : "Break"}</span></div>
    <div className="clock-stage">
      <div className="clock-dial" style={dialStyle} aria-label={`${modeLabel}: ${formatClock(remainingSeconds)} remaining`}><div className="clock-center"><span>{modeLabel}</span><strong>{formatClock(remainingSeconds)}</strong><small>{isRunning ? "Running" : "Paused"}</small></div></div>
      <div className="break-orbit" aria-hidden="true"><i /><i /><i /></div>
    </div>
    <p className="focus-clock-note" aria-live="polite">{mode === "focus" ? "A soft alarm will invite you into a break." : "A quiet reset animation is on while you take your break."}</p>
    <div className="clock-controls">
      <button className="clock-primary" onClick={() => setIsRunning(current => !current)} aria-pressed={isRunning}>{isRunning ? <Pause size={16} /> : <Play size={16} />}{primaryActionLabel}</button>
      <button className="clock-icon-button" onClick={() => resetTimer()} aria-label={`Reset ${modeLabel.toLowerCase()}`}><RotateCcw size={16} /></button>
      <button className="clock-icon-button" onClick={() => resetTimer(nextFocusMode(mode))} aria-label={`Switch to ${nextFocusMode(mode)} interval`}><TimerReset size={16} /></button>
    </div>
    <div className="clock-duration-controls"><label>Focus <input aria-label="Focus duration in minutes" type="number" min="1" max="120" value={focusMinutes} onChange={event => updateDuration("focus", Number(event.target.value))} /> <span>min</span></label><label>Break <input aria-label="Break duration in minutes" type="number" min="1" max="120" value={breakMinutes} onChange={event => updateDuration("break", Number(event.target.value))} /> <span>min</span></label></div>
  </section>;
}
