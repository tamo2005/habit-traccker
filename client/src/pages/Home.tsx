/* Signal / Streak page: contemporary editorialism, warm paper surfaces, and visible small rituals. */
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleHelp,
  Flag,
  Leaf,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type HabitColor = "saffron" | "moss" | "clay" | "ink";
type View = "today" | "insights";

type Habit = {
  id: string;
  name: string;
  cadence: string;
  color: HabitColor;
  completedDates: string[];
};

const STORAGE_KEY = "signal-streak-habits";

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
  const [habits, setHabits] = useState<Habit[]>(getInitialHabits);
  const [activeView, setActiveView] = useState<View>("today");
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCadence, setNewHabitCadence] = useState("Daily");
  const [newHabitColor, setNewHabitColor] = useState<HabitColor>("saffron");

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => dateKey(today), [today]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => dateAtOffset(index - 6)), []);
  const weekKeys = useMemo(() => weekDays.map(dateKey), [weekDays]);
  const completedToday = habits.filter((habit) => habit.completedDates.includes(todayKey)).length;
  const completionPercent = habits.length ? Math.round((completedToday / habits.length) * 100) : 0;
  const weeklyMarks = habits.reduce(
    (total, habit) => total + habit.completedDates.filter((completedDate) => weekKeys.includes(completedDate)).length,
    0,
  );
  const weeklyCapacity = Math.max(habits.length * 7, 1);
  const weeklyPercent = Math.round((weeklyMarks / weeklyCapacity) * 100);
  const allTimeMarks = habits.reduce((total, habit) => total + habit.completedDates.length, 0);
  const longestCurrentStreak = habits.reduce((max, habit) => Math.max(max, habitStreak(habit)), 0);
  const activeDays = new Set(habits.flatMap((habit) => habit.completedDates)).size;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  function toggleHabit(id: string) {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;
    const wasComplete = habit.completedDates.includes(todayKey);
    setHabits((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          completedDates: wasComplete
            ? item.completedDates.filter((completedDate) => completedDate !== todayKey)
            : [...item.completedDates, todayKey],
        };
      }),
    );
    toast(wasComplete ? "Mark removed for today." : "Marked for today.", {
      description: wasComplete ? "You can put it back whenever the moment feels right." : "One small signal is enough to keep the rhythm moving.",
    });
  }

  function markAllRemaining() {
    if (!habits.length) {
      setIsAdding(true);
      toast("File your first habit to start the signal.");
      return;
    }
    setHabits((current) =>
      current.map((habit) =>
        habit.completedDates.includes(todayKey) ? habit : { ...habit, completedDates: [...habit.completedDates, todayKey] },
      ),
    );
    toast.success("The board is marked.", { description: "Your progress is saved on this device." });
  }

  function deleteHabit(id: string) {
    const habit = habits.find((item) => item.id === id);
    setHabits((current) => current.filter((item) => item.id !== id));
    toast(`${habit?.name ?? "Habit"} removed.`, { description: "You can add it again any time." });
  }

  function addHabit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = newHabitName.trim();
    if (!cleanName) {
      toast.error("Give the habit a name first.");
      return;
    }
    setHabits((current) => [
      ...current,
      { id: makeId(), name: cleanName, cadence: newHabitCadence, color: newHabitColor, completedDates: [] },
    ]);
    setNewHabitName("");
    setNewHabitCadence("Daily");
    setNewHabitColor("saffron");
    setIsAdding(false);
    toast.success("Habit filed.", { description: "It is ready for its first mark." });
  }

  const weekStart = shortDate(weekDays[0]);
  const weekEnd = shortDate(weekDays[6]);

  return (
    <div className="app-shell">
      <aside className="side-rail">
        <div className="brand-lockup">
          <img src="/manus-storage/signal-flag-logo_707eb396.png" alt="Signal / Streak mark" className="brand-mark" />
          <div>
            <p className="brand-name">Habit<span>.</span></p>
            <p className="brand-subtitle">signal / streak</p>
          </div>
        </div>

        <div className="rail-rule" />
        <p className="rail-label">Workspace</p>
        <nav className="rail-nav" aria-label="Primary navigation">
          <button className={`rail-nav-item ${activeView === "today" ? "is-active" : ""}`} onClick={() => setActiveView("today")}>
            <Target size={16} strokeWidth={1.8} />
            <span>Today</span>
            <span className="rail-count">{completedToday}/{habits.length}</span>
          </button>
          <button className={`rail-nav-item ${activeView === "insights" ? "is-active" : ""}`} onClick={() => setActiveView("insights")}>
            <BarChart3 size={16} strokeWidth={1.8} />
            <span>Insights</span>
            <ArrowUpRight size={13} className="nav-arrow" />
          </button>
          <button className="rail-nav-item" onClick={() => toast("Your habits are stored locally on this device.")}>
            <ShieldCheck size={16} strokeWidth={1.8} />
            <span>Privacy</span>
            <CircleHelp size={13} className="nav-arrow" />
          </button>
        </nav>

        <div className="rail-footer">
          <div className="rail-footer-icon"><Leaf size={15} /></div>
          <p>Small rituals.<br /><strong>Clearer weeks.</strong></p>
        </div>
      </aside>

      <div className="mobile-topbar">
        <div className="brand-lockup">
          <img src="/manus-storage/signal-flag-logo_707eb396.png" alt="Signal / Streak mark" className="brand-mark" />
          <p className="brand-name">Habit<span>.</span></p>
        </div>
        <Button size="icon" variant="outline" aria-label="Add habit" onClick={() => setIsAdding(true)}><Plus size={18} /></Button>
      </div>

      <main className="main-canvas">
        <header className="dashboard-header">
          <img src="/manus-storage/signal-paper-field_b7fb1512.png" alt="" className="header-art" />
          <div className="header-copy">
            <p className="eyebrow">01 / DAILY SIGNAL</p>
            <p className="header-date">{readableDate(today)}</p>
            <h1>Keep the<br /><em>signal moving.</em></h1>
            <p className="header-description">A quiet board for the small things that make a week feel like yours.</p>
          </div>
          <div className="header-metric">
            <span className="metric-label">Today</span>
            <strong>{completedToday}<small>/{habits.length}</small></strong>
            <span className="metric-caption">marked</span>
          </div>
        </header>

        {activeView === "today" ? (
          <>
            <section className="week-section" aria-labelledby="week-heading">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">02 / THIS WEEK <span className="eyebrow-detail">{weekStart} — {weekEnd}</span></p>
                  <h2 id="week-heading">Small marks. Clear pattern.</h2>
                </div>
                <Button className="add-habit-button" onClick={() => setIsAdding((current) => !current)}>
                  {isAdding ? <X size={16} /> : <Plus size={16} />}
                  {isAdding ? "Close" : "Add habit"}
                </Button>
              </div>
              <div className="week-strip" aria-label="Habit completion by day">
                {weekDays.map((day) => {
                  const key = dateKey(day);
                  const marks = habits.filter((habit) => habit.completedDates.includes(key)).length;
                  const isToday = key === todayKey;
                  const height = habits.length ? Math.max(12, Math.round((marks / habits.length) * 100)) : 12;
                  return (
                    <div className={`day-signal ${isToday ? "is-today" : ""}`} key={key}>
                      <span className="day-name">{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day)}</span>
                      <div className="signal-track"><span className="signal-fill" style={{ height: `${height}%` }} /></div>
                      <span className="day-number">{day.getDate()}</span>
                      <span className="day-mark-count">{marks ? `${marks} / ${habits.length}` : "—"}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="workspace-grid">
              <section className="habits-panel" aria-labelledby="habits-heading">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">03 / YOUR MARKS</p>
                    <h2 id="habits-heading">The daily list</h2>
                  </div>
                  <p className="panel-status">{progressLabel(completedToday, habits.length)}</p>
                </div>

                {habits.length ? (
                  <div className="habit-list">
                    {habits.map((habit, index) => {
                      const complete = habit.completedDates.includes(todayKey);
                      const streak = habitStreak(habit);
                      return (
                        <article className={`habit-row ${complete ? "is-complete" : ""}`} key={habit.id} style={{ animationDelay: `${index * 45}ms` }}>
                          <span className={`habit-index index-${habit.color}`}>0{index + 1}</span>
                          <div className="habit-copy">
                            <h3>{habit.name}</h3>
                            <p><span className={`color-dot dot-${habit.color}`} />{habit.cadence}{streak > 0 ? ` · ${streak} day${streak === 1 ? "" : "s"} running` : " · Ready when you are"}</p>
                          </div>
                          <button className={`check-tile ${complete ? "is-complete" : ""}`} aria-pressed={complete} aria-label={`${complete ? "Unmark" : "Mark"} ${habit.name}`} onClick={() => toggleHabit(habit.id)}>
                            {complete ? <Check size={19} strokeWidth={2.5} /> : <span className="mark-glyph" aria-hidden="true"><i /><i /><i /></span>}
                          </button>
                          <button className="icon-button delete-button" aria-label={`Remove ${habit.name}`} onClick={() => deleteHabit(habit.id)}><Trash2 size={15} /></button>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state"><Flag size={24} /><h3>A clear board.</h3><p>File one habit to give today a place to begin.</p><button onClick={() => setIsAdding(true)}>Add your first habit <ChevronRight size={15} /></button></div>
                )}
              </section>

              <aside className="focus-column">
                <section className="focus-card">
                  <img src="/manus-storage/signal-focus-card_98038752.png" alt="Abstract signal lines flowing toward a saffron tile" />
                  <div className="focus-card-content">
                    <p className="eyebrow eyebrow-light">FOCUS NOTE</p>
                    <h2>{completedToday === habits.length && habits.length ? "The board is clear." : "Keep it small."}</h2>
                    <p>{completedToday === habits.length && habits.length ? "You made every mark that mattered today." : "The next mark is closer than it looks."}</p>
                    <button className="text-action" onClick={markAllRemaining}>{habits.length && completedToday === habits.length ? "Review the week" : "Mark remaining"} <ArrowUpRight size={15} /></button>
                  </div>
                </section>

                {isAdding && (
                  <form className="add-panel" onSubmit={addHabit}>
                    <div className="add-panel-heading"><div><p className="eyebrow">FILE A NEW MARK</p><h3>Add a habit</h3></div><button type="button" className="icon-button" aria-label="Close add habit form" onClick={() => setIsAdding(false)}><X size={17} /></button></div>
                    <label className="field-label" htmlFor="habit-name">What do you want to keep?</label>
                    <input id="habit-name" autoFocus value={newHabitName} onChange={(event) => setNewHabitName(event.target.value)} placeholder="e.g. Take a short walk" />
                    <div className="field-row">
                      <label className="field-label" htmlFor="habit-cadence">Cadence<select id="habit-cadence" value={newHabitCadence} onChange={(event) => setNewHabitCadence(event.target.value)}><option>Daily</option><option>Weeknights</option><option>Three times a week</option><option>Weekends</option></select></label>
                      <fieldset><legend className="field-label">Signal</legend><div className="color-picker">{colorOptions.map((option) => <button type="button" key={option.id} aria-label={option.label} className={`color-choice dot-${option.id} ${newHabitColor === option.id ? "is-selected" : ""}`} onClick={() => setNewHabitColor(option.id)} />)}</div></fieldset>
                    </div>
                    <button className="submit-button" type="submit">File habit <Plus size={16} /></button>
                  </form>
                )}

                <section className="week-note">
                  <div className="week-note-copy"><p className="eyebrow">04 / A QUICK LOOK</p><h3>{weeklyPercent}% of your week is in motion.</h3><p>{weeklyMarks} marks across {activeDays} active {activeDays === 1 ? "day" : "days"}.</p></div>
                  <div className="week-note-art" aria-hidden="true"><span /><span /><span /><span /></div>
                </section>
              </aside>
            </div>
          </>
        ) : (
          <section className="insights-view" aria-labelledby="insights-heading">
            <div className="section-heading">
              <div><p className="eyebrow">02 / INSIGHTS</p><h2 id="insights-heading">The pattern, over time.</h2></div>
              <Button className="add-habit-button" onClick={() => { setActiveView("today"); setIsAdding(true); }}><Plus size={16} /> Add habit</Button>
            </div>
            <div className="insight-stats">
              <div className="insight-stat"><span className="eyebrow">WEEKLY SIGNAL</span><strong>{weeklyPercent}<small>%</small></strong><p>{weeklyMarks} total marks in the last seven days.</p></div>
              <div className="insight-stat"><span className="eyebrow">CURRENT RUN</span><strong>{longestCurrentStreak}<small> days</small></strong><p>Your longest active streak right now.</p></div>
              <div className="insight-stat"><span className="eyebrow">ALL-TIME MARKS</span><strong>{allTimeMarks}</strong><p>Every completed action saved locally.</p></div>
            </div>
            <div className="insight-chart">
              <div className="panel-heading"><div><p className="eyebrow">LAST SEVEN DAYS</p><h3>Where the signal showed up</h3></div><Sparkles size={18} /></div>
              <div className="insight-bars">{weekDays.map((day) => { const key = dateKey(day); const marks = habits.reduce((count, habit) => count + (habit.completedDates.includes(key) ? 1 : 0), 0); const height = habits.length ? Math.max(10, Math.round((marks / habits.length) * 100)) : 10; return <div className="insight-bar-wrap" key={key}><div className="insight-bar-track"><div className="insight-bar-fill" style={{ height: `${height}%` }} /></div><span>{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day)}</span><small>{marks}</small></div>; })}</div>
            </div>
            <div className="insight-footer"><Leaf size={18} /><p>Consistency is not a straight line. It is a set of returns.</p><button onClick={() => setActiveView("today")}>Back to today <ChevronRight size={15} /></button></div>
          </section>
        )}
      </main>
    </div>
  );
}
