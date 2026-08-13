/* Signal / Streak: a local-first habit board that syncs private data after sign-in. */
import { Button } from "@/components/ui/button";
import { habitAssets } from "@/lib/assets";
import { mapCloudHabit, type Habit, type HabitColor } from "@/lib/habitData";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleHelp,
  Flag,
  Leaf,
  LogIn,
  LogOut,
  Music2,
  Pause,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type View = "today" | "insights";

const STORAGE_KEY = "signal-streak-habits";
const MUSIC_URL = habitAssets.focusSound;
const starterHabits: Habit[] = [
  { id: "movement", name: "Morning movement", cadence: "Daily", color: "saffron", completedDates: [] },
  { id: "reading", name: "Read 10 pages", cadence: "Daily", color: "moss", completedDates: [] },
  { id: "water", name: "Drink a full glass of water", cadence: "Daily", color: "clay", completedDates: [] },
  { id: "reset", name: "Plan tomorrow", cadence: "Weeknights", color: "ink", completedDates: [] },
];
const colorOptions: { id: HabitColor; label: string }[] = [
  { id: "saffron", label: "Signal" },
  { id: "moss", label: "Moss" },
  { id: "clay", label: "Clay" },
  { id: "ink", label: "Ink" },
];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateAtOffset(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

function readableDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(date);
}

function shortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function getInitialHabits() {
  if (typeof window === "undefined") return starterHabits;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return starterHabits;
    const parsed = JSON.parse(stored) as Habit[];
    return Array.isArray(parsed) ? parsed : starterHabits;
  } catch {
    return starterHabits;
  }
}

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
}

function habitStreak(habit: Habit) {
  let count = 0;
  for (let offset = 0; offset < 365; offset += 1) {
    if (!habit.completedDates.includes(dateKey(dateAtOffset(-offset)))) break;
    count += 1;
  }
  return count;
}

function progressLabel(done: number, total: number) {
  if (total === 0) return "No habits filed yet";
  if (done === total) return "The whole board is marked";
  if (done === 0) return "A clear board is a clean start";
  return `${total - done} ${total - done === 1 ? "mark" : "marks"} left today`;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudSaving, setCloudSaving] = useState(false);
  const [cloudHabits, setCloudHabits] = useState<Habit[]>([]);
  const [localHabits, setLocalHabits] = useState<Habit[]>(getInitialHabits);
  const [activeView, setActiveView] = useState<View>("today");
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCadence, setNewHabitCadence] = useState("Daily");
  const [newHabitColor, setNewHabitColor] = useState<HabitColor>("saffron");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.34);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isAuthenticated = Boolean(user);
  const userLabel = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Signed in";
  const habits = isAuthenticated ? cloudHabits : localHabits;
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => dateKey(today), [today]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => dateAtOffset(index - 6)), []);
  const weekKeys = useMemo(() => weekDays.map(dateKey), [weekDays]);
  const completedToday = habits.filter(habit => habit.completedDates.includes(todayKey)).length;
  const weeklyMarks = habits.reduce((total, habit) => total + habit.completedDates.filter(day => weekKeys.includes(day)).length, 0);
  const weeklyCapacity = Math.max(habits.length * 7, 1);
  const weeklyPercent = Math.round((weeklyMarks / weeklyCapacity) * 100);
  const allTimeMarks = habits.reduce((total, habit) => total + habit.completedDates.length, 0);
  const longestCurrentStreak = habits.reduce((max, habit) => Math.max(max, habitStreak(habit)), 0);
  const activeDays = new Set(habits.flatMap(habit => habit.completedDates)).size;
  const isSaving = cloudSaving;

  const loadCloudHabits = useCallback(async (userId: string) => {
    const client = supabase;
    if (!client) return;
    setCloudLoading(true);
    const selectHabits = () => client
      .from("habits")
      .select("id, name, cadence, color, habit_completions(completed_on)")
      .order("created_at", { ascending: true });

    let { data, error } = await selectHabits();
    if (!error && !data?.length) {
      const starterRows = starterHabits.map(({ name, cadence, color }) => ({ user_id: userId, name, cadence, color }));
      const { error: seedError } = await client.from("habits").insert(starterRows);
      if (seedError) error = seedError;
      else ({ data, error } = await selectHabits());
    }
    if (error) {
      toast.error("Cloud board could not load.", { description: "Your local workspace is still available while setup completes." });
      setCloudHabits([]);
    } else {
      setCloudHabits((data ?? []).map(mapCloudHabit));
    }
    setCloudLoading(false);
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setAuthLoading(false);
      return;
    }
    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      setAuthLoading(false);
      if (nextUser) void loadCloudHabits(nextUser.id);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setAuthLoading(false);
      if (nextUser) void loadCloudHabits(nextUser.id);
      else setCloudHabits([]);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadCloudHabits]);

  useEffect(() => {
    if (!isAuthenticated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localHabits));
  }, [isAuthenticated, localHabits]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = musicMuted ? 0 : musicVolume;
  }, [musicMuted, musicVolume]);

  async function toggleHabit(habit: Habit) {
    const wasComplete = habit.completedDates.includes(todayKey);
    if (isAuthenticated && supabase && user) {
      try {
        setCloudSaving(true);
        const request = wasComplete
          ? supabase.from("habit_completions").delete().eq("habit_id", habit.id).eq("completed_on", todayKey)
          : supabase.from("habit_completions").insert({ habit_id: habit.id, user_id: user.id, completed_on: todayKey });
        const { error } = await request;
        if (error) throw error;
        await loadCloudHabits(user.id);
      } catch {
        toast.error("That mark could not be saved. Please try again.");
        return;
      } finally {
        setCloudSaving(false);
      }
    } else {
      setLocalHabits(current => current.map(item => item.id !== habit.id ? item : {
        ...item,
        completedDates: wasComplete ? item.completedDates.filter(day => day !== todayKey) : [...item.completedDates, todayKey],
      }));
    }
    toast(wasComplete ? "Mark removed for today." : "Marked for today.", {
      description: isAuthenticated ? "Saved privately to your account." : "Saved on this device. Sign in to sync it anywhere.",
    });
  }

  async function markAllRemaining() {
    const remaining = habits.filter(habit => !habit.completedDates.includes(todayKey));
    if (!habits.length) {
      setIsAdding(true);
      toast("File your first habit to start the signal.");
      return;
    }
    if (isAuthenticated && supabase && user) {
      try {
        setCloudSaving(true);
        const { error } = await supabase.from("habit_completions").upsert(
          remaining.map(habit => ({ habit_id: habit.id, user_id: user.id, completed_on: todayKey })),
          { onConflict: "habit_id,completed_on", ignoreDuplicates: true },
        );
        if (error) throw error;
        await loadCloudHabits(user.id);
      } catch {
        toast.error("Some marks could not be saved. Please try again.");
        return;
      } finally {
        setCloudSaving(false);
      }
    } else {
      setLocalHabits(current => current.map(habit => habit.completedDates.includes(todayKey) ? habit : { ...habit, completedDates: [...habit.completedDates, todayKey] }));
    }
    toast.success("The board is marked.", { description: isAuthenticated ? "Every mark is synced to your account." : "Your progress is saved on this device." });
  }

  async function deleteHabit(habit: Habit) {
    if (isAuthenticated && supabase && user) {
      try {
        setCloudSaving(true);
        const { error } = await supabase.from("habits").delete().eq("id", habit.id);
        if (error) throw error;
        await loadCloudHabits(user.id);
      } catch {
        toast.error("That habit could not be removed. Please try again.");
        return;
      } finally {
        setCloudSaving(false);
      }
    } else {
      setLocalHabits(current => current.filter(item => item.id !== habit.id));
    }
    toast(`${habit.name} removed.`, { description: isAuthenticated ? "Removed from your private board." : "You can add it again any time." });
  }

  async function addHabit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newHabitName.trim();
    if (!name) {
      toast.error("Give the habit a name first.");
      return;
    }
    if (isAuthenticated && supabase && user) {
      try {
        setCloudSaving(true);
        const { error } = await supabase.from("habits").insert({ user_id: user.id, name, cadence: newHabitCadence, color: newHabitColor });
        if (error) throw error;
        await loadCloudHabits(user.id);
      } catch {
        toast.error("That habit could not be saved. Please try again.");
        return;
      } finally {
        setCloudSaving(false);
      }
    } else {
      setLocalHabits(current => [...current, { id: makeId(), name, cadence: newHabitCadence, color: newHabitColor, completedDates: [] }]);
    }
    setNewHabitName("");
    setNewHabitCadence("Daily");
    setNewHabitColor("saffron");
    setIsAdding(false);
    toast.success("Habit filed.", { description: isAuthenticated ? "It is saved to your private board." : "Sign in any time to keep it across devices." });
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setIsMusicPlaying(true);
        toast("Focus sound on.", { description: "Use the volume slider whenever you want a quieter room." });
      } catch {
        toast.error("Your browser needs one more tap to start the sound.");
      }
    } else {
      audio.pause();
      setIsMusicPlaying(false);
    }
  }

  function openSignIn() {
    if (!isSupabaseConfigured) {
      toast.error("Cloud sign-in is not configured in this preview.", { description: "Use the Vercel deployment after the next build to sync across devices." });
      return;
    }
    setIsAuthOpen(true);
  }

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !authEmail.trim()) return;
    setIsSendingLink(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setIsSendingLink(false);
    if (error) {
      toast.error("Sign-in link could not be sent.", { description: error.message });
      return;
    }
    setIsAuthOpen(false);
    toast.success("Check your inbox.", { description: "Open the secure link to return to your private cloud board." });
  }

  async function handleLogout() {
    try {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast("Signed out.", { description: "This browser is back in its device-only workspace." });
    } catch {
      toast.error("Sign out did not complete. Please try again.");
    }
  }

  const weekStart = shortDate(weekDays[0]);
  const weekEnd = shortDate(weekDays[6]);

  return (
    <div className="app-shell">
      <audio ref={audioRef} src={MUSIC_URL} loop preload="metadata" onPause={() => setIsMusicPlaying(false)} onPlay={() => setIsMusicPlaying(true)} />
      <aside className="side-rail">
        <div className="brand-lockup">
          <img src={habitAssets.logo} alt="Signal / Streak orange flag mark" className="brand-mark" />
          <div><p className="brand-name">Habit<span>.</span></p><p className="brand-subtitle">signal / streak</p></div>
        </div>
        <div className="rail-rule" />
        <p className="rail-label">Workspace</p>
        <nav className="rail-nav" aria-label="Primary navigation">
          <button className={`rail-nav-item ${activeView === "today" ? "is-active" : ""}`} onClick={() => setActiveView("today")}>
            <Target size={16} strokeWidth={1.8} /><span>Today</span><span className="rail-count">{completedToday}/{habits.length}</span>
          </button>
          <button className={`rail-nav-item ${activeView === "insights" ? "is-active" : ""}`} onClick={() => setActiveView("insights")}>
            <BarChart3 size={16} strokeWidth={1.8} /><span>Insights</span><ArrowUpRight size={13} className="nav-arrow" />
          </button>
          <button className="rail-nav-item" onClick={() => toast(isAuthenticated ? "Your habit data is private to this signed-in account." : "This device-only board can be synced when you sign in.")}>
            <ShieldCheck size={16} strokeWidth={1.8} /><span>Privacy</span><CircleHelp size={13} className="nav-arrow" />
          </button>
        </nav>

        <section className="sound-panel" aria-label="Focus sound controls">
          <div className="sound-panel-header"><span><Music2 size={14} /> Focus sound</span><span>{isMusicPlaying ? "On" : "Off"}</span></div>
          <div className="sound-actions">
            <button className="sound-toggle" onClick={toggleMusic} aria-pressed={isMusicPlaying}>{isMusicPlaying ? <Pause size={14} /> : <Music2 size={14} />}{isMusicPlaying ? "Pause" : "Play"}</button>
            <button className="sound-icon" onClick={() => setMusicMuted(current => !current)} aria-label={musicMuted ? "Unmute focus sound" : "Mute focus sound"}>{musicMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
          </div>
          <input className="volume-slider" aria-label="Focus sound volume" type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={event => setMusicVolume(Number(event.target.value))} />
        </section>

        <section className="account-panel" aria-live="polite">
          {authLoading ? <p className="account-status">Checking your workspace…</p> : isAuthenticated ? <>
            <div className="account-copy"><span className="account-initial">{userLabel.charAt(0).toUpperCase()}</span><div><strong>{userLabel}</strong><small>Cloud sync on</small></div></div>
            <button className="rail-auth-button" onClick={handleLogout}><LogOut size={14} /> Sign out</button>
          </> : <>
            <p className="account-status">Your board is saved on this device.</p>
            <button className="rail-auth-button is-sign-in" onClick={openSignIn}><LogIn size={14} /> Sign in to sync</button>
          </>}
        </section>
        <div className="rail-footer"><div className="rail-footer-icon"><Leaf size={15} /></div><p>Small rituals.<br /><strong>Clearer weeks.</strong></p></div>
      </aside>

      <div className="mobile-topbar">
        <div className="brand-lockup"><img src={habitAssets.logo} alt="Signal / Streak orange flag mark" className="brand-mark" /><p className="brand-name">Habit<span>.</span></p></div>
        <div className="mobile-actions">
          <Button size="icon" variant="outline" aria-label={isMusicPlaying ? "Pause focus sound" : "Play focus sound"} onClick={toggleMusic}>{isMusicPlaying ? <Pause size={18} /> : <Music2 size={18} />}</Button>
          {isAuthenticated ? <Button size="icon" variant="outline" aria-label="Sign out" onClick={handleLogout}><LogOut size={17} /></Button> : <Button size="icon" variant="outline" aria-label="Sign in to sync" onClick={openSignIn}><LogIn size={17} /></Button>}
          <Button size="icon" variant="outline" aria-label="Add habit" onClick={() => setIsAdding(true)}><Plus size={18} /></Button>
        </div>
      </div>

      <main className="main-canvas">
        <header className="dashboard-header">
          <img src={habitAssets.paperField} alt="" className="header-art" />
          <div className="header-copy"><p className="eyebrow">01 / DAILY SIGNAL</p><p className="header-date">{readableDate(today)}</p><h1>Keep the<br /><em>signal moving.</em></h1><p className="header-description">A quiet board for the small things that make a week feel like yours.</p><p className="sync-status">{isAuthenticated ? (cloudLoading ? "Private cloud board · syncing" : "Private cloud board · saved") : isSupabaseConfigured ? "Device-only board · sign in to sync" : "Device-only board · cloud setup in progress"}</p></div>
          <div className="header-metric"><span className="metric-label">Today</span><strong>{completedToday}<small>/{habits.length}</small></strong><span className="metric-caption">marked</span></div>
        </header>

        {activeView === "today" ? <>
          <section className="week-section" aria-labelledby="week-heading">
            <div className="section-heading"><div><p className="eyebrow">02 / THIS WEEK <span className="eyebrow-detail">{weekStart} — {weekEnd}</span></p><h2 id="week-heading">Small marks. Clear pattern.</h2></div><Button className="add-habit-button" onClick={() => setIsAdding(current => !current)}>{isAdding ? <X size={16} /> : <Plus size={16} />}{isAdding ? "Close" : "Add habit"}</Button></div>
            <div className="week-strip" aria-label="Habit completion by day">{weekDays.map(day => {
              const key = dateKey(day); const marks = habits.filter(habit => habit.completedDates.includes(key)).length; const isToday = key === todayKey; const height = habits.length ? Math.max(12, Math.round((marks / habits.length) * 100)) : 12;
              return <div className={`day-signal ${isToday ? "is-today" : ""}`} key={key}><span className="day-name">{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day)}</span><div className="signal-track"><span className="signal-fill" style={{ height: `${height}%` }} /></div><span className="day-number">{day.getDate()}</span><span className="day-mark-count">{marks ? `${marks} / ${habits.length}` : "—"}</span></div>;
            })}</div>
          </section>
          <div className="workspace-grid">
            <section className="habits-panel" aria-labelledby="habits-heading">
              <div className="panel-heading"><div><p className="eyebrow">03 / YOUR MARKS</p><h2 id="habits-heading">The daily list</h2></div><p className="panel-status">{cloudLoading && isAuthenticated ? "Syncing marks…" : progressLabel(completedToday, habits.length)}</p></div>
              {habits.length ? <div className="habit-list">{habits.map((habit, index) => {
                const complete = habit.completedDates.includes(todayKey); const streak = habitStreak(habit);
                return <article className={`habit-row ${complete ? "is-complete" : ""}`} key={habit.id} style={{ animationDelay: `${index * 45}ms` }}><span className={`habit-index index-${habit.color}`}>0{index + 1}</span><div className="habit-copy"><h3>{habit.name}</h3><p><span className={`color-dot dot-${habit.color}`} />{habit.cadence}{streak > 0 ? ` · ${streak} day${streak === 1 ? "" : "s"} running` : " · Ready when you are"}</p></div><button disabled={isSaving} className={`check-tile ${complete ? "is-complete" : ""}`} aria-pressed={complete} aria-label={`${complete ? "Unmark" : "Mark"} ${habit.name}`} onClick={() => void toggleHabit(habit)}>{complete ? <Check size={19} strokeWidth={2.5} /> : <span className="mark-glyph" aria-hidden="true"><i /><i /><i /></span>}</button><button disabled={isSaving} className="icon-button delete-button" aria-label={`Remove ${habit.name}`} onClick={() => void deleteHabit(habit)}><Trash2 size={15} /></button></article>;
              })}</div> : <div className="empty-state"><Flag size={24} /><h3>A clear board.</h3><p>File one habit to give today a place to begin.</p><button onClick={() => setIsAdding(true)}>Add your first habit <ChevronRight size={15} /></button></div>}
            </section>
            <aside className="focus-column">
              <section className="focus-card"><img src={habitAssets.focusCard} alt="Abstract signal lines flowing toward a saffron tile" /><div className="focus-card-content"><p className="eyebrow eyebrow-light">FOCUS NOTE</p><h2>{completedToday === habits.length && habits.length ? "The board is clear." : "Keep it small."}</h2><p>{completedToday === habits.length && habits.length ? "You made every mark that mattered today." : "The next mark is closer than it looks."}</p><button disabled={isSaving} className="text-action" onClick={() => void markAllRemaining()}>{habits.length && completedToday === habits.length ? "Review the week" : "Mark remaining"} <ArrowUpRight size={15} /></button></div></section>
              {isAdding && <form className="add-panel" onSubmit={event => void addHabit(event)}><div className="add-panel-heading"><div><p className="eyebrow">FILE A NEW MARK</p><h3>Add a habit</h3></div><button type="button" className="icon-button" aria-label="Close add habit form" onClick={() => setIsAdding(false)}><X size={17} /></button></div><label className="field-label" htmlFor="habit-name">What do you want to keep?<input id="habit-name" autoFocus value={newHabitName} onChange={event => setNewHabitName(event.target.value)} placeholder="e.g. Take a short walk" /></label><div className="field-row"><label className="field-label" htmlFor="habit-cadence">Cadence<select id="habit-cadence" value={newHabitCadence} onChange={event => setNewHabitCadence(event.target.value)}><option>Daily</option><option>Weeknights</option><option>Three times a week</option><option>Weekends</option></select></label><fieldset><legend className="field-label">Signal</legend><div className="color-picker">{colorOptions.map(option => <button type="button" key={option.id} aria-label={option.label} className={`color-choice dot-${option.id} ${newHabitColor === option.id ? "is-selected" : ""}`} onClick={() => setNewHabitColor(option.id)} />)}</div></fieldset></div><button disabled={isSaving} className="submit-button" type="submit">{isSaving ? "Saving…" : "File habit"} <Plus size={16} /></button></form>}
              <section className="week-note"><div className="week-note-copy"><p className="eyebrow">04 / A QUICK LOOK</p><h3>{weeklyPercent}% of your week is in motion.</h3><p>{weeklyMarks} marks across {activeDays} active {activeDays === 1 ? "day" : "days"}.</p></div><div className="week-note-art" aria-hidden="true"><span /><span /><span /><span /></div></section>
            </aside>
          </div>
        </> : <section className="insights-view" aria-labelledby="insights-heading"><div className="section-heading"><div><p className="eyebrow">02 / INSIGHTS</p><h2 id="insights-heading">The pattern, over time.</h2></div><Button className="add-habit-button" onClick={() => { setActiveView("today"); setIsAdding(true); }}><Plus size={16} /> Add habit</Button></div><div className="insight-stats"><div className="insight-stat"><span className="eyebrow">WEEKLY SIGNAL</span><strong>{weeklyPercent}<small>%</small></strong><p>{weeklyMarks} total marks in the last seven days.</p></div><div className="insight-stat"><span className="eyebrow">CURRENT RUN</span><strong>{longestCurrentStreak}<small> days</small></strong><p>Your longest active streak right now.</p></div><div className="insight-stat"><span className="eyebrow">ALL-TIME MARKS</span><strong>{allTimeMarks}</strong><p>{isAuthenticated ? "Every completed action in your private cloud board." : "Every completed action saved locally."}</p></div></div><div className="insight-chart"><div className="panel-heading"><div><p className="eyebrow">LAST SEVEN DAYS</p><h3>Where the signal showed up</h3></div><Sparkles size={18} /></div><div className="insight-bars">{weekDays.map(day => { const key = dateKey(day); const marks = habits.reduce((count, habit) => count + (habit.completedDates.includes(key) ? 1 : 0), 0); const height = habits.length ? Math.max(10, Math.round((marks / habits.length) * 100)) : 10; return <div className="insight-bar-wrap" key={key}><div className="insight-bar-track"><div className="insight-bar-fill" style={{ height: `${height}%` }} /></div><span>{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day)}</span><small>{marks}</small></div>; })}</div></div><div className="insight-footer"><Leaf size={18} /><p>Consistency is not a straight line. It is a set of returns.</p><button onClick={() => setActiveView("today")}>Back to today <ChevronRight size={15} /></button></div></section>}
      </main>
      {isAuthOpen && <div className="auth-dialog-backdrop" role="presentation" onMouseDown={() => setIsAuthOpen(false)}>
        <form className="auth-dialog" aria-modal="true" aria-labelledby="auth-dialog-title" role="dialog" onSubmit={sendMagicLink} onMouseDown={event => event.stopPropagation()}>
          <button className="icon-button auth-dialog-close" type="button" aria-label="Close sign-in" onClick={() => setIsAuthOpen(false)}><X size={17} /></button>
          <p className="eyebrow">PRIVATE CLOUD BOARD</p>
          <h2 id="auth-dialog-title">Save the signal.</h2>
          <p>Enter your email and we will send a secure sign-in link. No password to remember.</p>
          <label className="field-label" htmlFor="auth-email">Email address<input id="auth-email" type="email" autoComplete="email" required autoFocus value={authEmail} onChange={event => setAuthEmail(event.target.value)} placeholder="you@example.com" /></label>
          <button className="submit-button" type="submit" disabled={isSendingLink}>{isSendingLink ? "Sending…" : "Send secure sign-in link"}<ArrowUpRight size={16} /></button>
        </form>
      </div>}
    </div>
  );
}
