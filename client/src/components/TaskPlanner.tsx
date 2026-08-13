import { mapCloudTask, parseTaskFormat, parseTaskJson, type PlanTask } from "@/lib/taskData";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Check, FileJson2, ListPlus, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const TASK_STORAGE_KEY = "signal-streak-planned-tasks";
const EXAMPLE = "Draft outline:high:09:30\nCall a friend:medium:12:15\nEvening reset:low:17:45";

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function initialTasks(): PlanTask[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TASK_STORAGE_KEY) ?? "[]") as PlanTask[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function readableTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
}

export default function TaskPlanner({ user }: { user: User | null }) {
  const [localTasks, setLocalTasks] = useState<PlanTask[]>(initialTasks);
  const [cloudTasks, setCloudTasks] = useState<PlanTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formatText, setFormatText] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const tasks = user ? cloudTasks : localTasks;

  const loadCloudTasks = useCallback(async () => {
    if (!user || !supabase) return;
    setIsLoading(true);
    const { data, error } = await supabase.from("planned_tasks").select("id, title, priority, scheduled_time, completed_at").order("scheduled_time", { ascending: true }).order("created_at", { ascending: true });
    if (error) toast.error("Your plan could not load.", { description: "Try refreshing in a moment." });
    else setCloudTasks((data ?? []).map(mapCloudTask));
    setIsLoading(false);
  }, [user]);

  useEffect(() => { if (user) void loadCloudTasks(); else setCloudTasks([]); }, [loadCloudTasks, user]);
  useEffect(() => { if (!user) window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(localTasks)); }, [localTasks, user]);

  async function persistImported(items: ReturnType<typeof parseTaskFormat>["tasks"]) {
    if (!items.length) return;
    if (user && supabase) {
      setIsSaving(true);
      const { error } = await supabase.from("planned_tasks").insert(items.map(item => ({ user_id: user.id, title: item.title, priority: item.priority, scheduled_time: item.scheduledTime })));
      setIsSaving(false);
      if (error) { toast.error("Those tasks could not be saved.", { description: error.message }); return; }
      await loadCloudTasks();
    } else setLocalTasks(current => [...current, ...items.map(item => ({ ...item, id: makeId(), completedAt: null }))].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)));
    toast.success(`${items.length} ${items.length === 1 ? "task" : "tasks"} added.`, { description: user ? "Saved to your private cloud plan." : "Saved on this device. Sign in whenever you want to sync." });
  }

  async function importFormat() {
    const result = parseTaskFormat(formatText);
    setIssues(result.issues.map(issue => `${issue.row ? `Line ${issue.row}: ` : ""}${issue.message}`));
    await persistImported(result.tasks);
    if (result.tasks.length) setFormatText("");
    if (!result.tasks.length && result.issues.length) toast.error("Nothing was added yet.", { description: "Correct the highlighted format and try again." });
  }

  async function importJson(file: File) {
    const result = parseTaskJson(await file.text());
    setIssues(result.issues.map(issue => `${issue.row ? `Item ${issue.row}: ` : ""}${issue.message}`));
    await persistImported(result.tasks);
    if (!result.tasks.length && result.issues.length) toast.error("The JSON file needs a small fix.");
  }

  async function toggleTask(task: PlanTask) {
    const nextCompletedAt = task.completedAt ? null : new Date().toISOString();
    if (user && supabase) {
      setIsSaving(true);
      const { error } = await supabase.from("planned_tasks").update({ completed_at: nextCompletedAt }).eq("id", task.id);
      setIsSaving(false);
      if (error) { toast.error("The task could not be updated."); return; }
      await loadCloudTasks();
    } else setLocalTasks(current => current.map(item => item.id === task.id ? { ...item, completedAt: nextCompletedAt } : item));
  }

  async function removeTask(task: PlanTask) {
    if (user && supabase) {
      setIsSaving(true);
      const { error } = await supabase.from("planned_tasks").delete().eq("id", task.id);
      setIsSaving(false);
      if (error) { toast.error("The task could not be removed."); return; }
      await loadCloudTasks();
    } else setLocalTasks(current => current.filter(item => item.id !== task.id));
  }

  const completeCount = tasks.filter(task => task.completedAt).length;
  return <section className="planning-view" aria-labelledby="planning-heading">
    <div className="section-heading planning-heading"><div><p className="eyebrow">02 / PLANNING DESK</p><h2 id="planning-heading">Give today a shape.</h2><p className="planning-intro">Add a batch, set the order, and leave room between the things that matter.</p></div><p className="planning-summary">{isLoading ? "Loading your plan…" : `${completeCount}/${tasks.length} cues complete`}</p></div>
    <div className="planning-grid">
      <section className="task-list-panel" aria-labelledby="task-list-heading"><div className="panel-heading"><div><p className="eyebrow">TODAY’S QUEUE</p><h3 id="task-list-heading">The next clear move</h3></div><span className={`plan-sync ${user ? "is-cloud" : ""}`}>{user ? "Private cloud" : "This device"}</span></div>
        {tasks.length ? <div className="planned-task-list">{tasks.map((task, index) => <article className={`planned-task ${task.completedAt ? "is-complete" : ""}`} key={task.id}><span className={`planned-task-number priority-${task.priority}`}>0{index + 1}</span><div className="planned-task-copy"><h4>{task.title}</h4><p>{task.priority} priority · {readableTime(task.scheduledTime)}</p></div><button disabled={isSaving} className="plan-check" aria-label={`${task.completedAt ? "Reopen" : "Complete"} ${task.title}`} aria-pressed={Boolean(task.completedAt)} onClick={() => void toggleTask(task)}>{task.completedAt ? <Check size={17} /> : <span />}</button><button disabled={isSaving} className="icon-button delete-button" aria-label={`Remove ${task.title}`} onClick={() => void removeTask(task)}><Trash2 size={15} /></button></article>)}</div> : <div className="planning-empty"><ListPlus size={25} /><h3>The page is clear.</h3><p>Paste a few cues below or import a prepared JSON file.</p></div>}
      </section>
      <aside className="import-panel"><div><p className="eyebrow">BULK IMPORT</p><h3>Bring your rough plan.</h3><p>One task per line, using <code>task:priority:time</code>.</p></div><textarea value={formatText} onChange={event => setFormatText(event.target.value)} placeholder={EXAMPLE} aria-label="Tasks in task priority time format" /><div className="import-actions"><button type="button" className="submit-button" disabled={!formatText.trim() || isSaving} onClick={() => void importFormat()}><ListPlus size={16} /> Add formatted tasks</button><button type="button" className="import-file-button" disabled={isSaving} onClick={() => fileInput.current?.click()}><FileJson2 size={16} /> Upload JSON <Upload size={14} /></button></div><input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={event => { const file = event.target.files?.[0]; if (file) void importJson(file); event.currentTarget.value = ""; }} />{issues.length > 0 && <div className="import-issues" role="status">{issues.slice(0, 3).map(issue => <p key={issue}>{issue}</p>)}</div>}<details className="json-guide"><summary>JSON format</summary><pre>{`{ "tasks": [{ "task": "Draft outline", "priority": "high", "time": "09:30" }] }`}</pre></details></aside>
    </div>
  </section>;
}
