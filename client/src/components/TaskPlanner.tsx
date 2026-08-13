import { parseTaskFormat, parseTaskJson, type PlanTask, type TaskImportResult } from "@/lib/taskData";
import { Check, FileJson2, ListPlus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

const EXAMPLE = "Draft outline:high:09:30\nCall a friend:medium:12:15\nEvening reset:low:17:45";

type TaskPlannerProps = {
  tasks: PlanTask[];
  isLoading: boolean;
  isSaving: boolean;
  isCloud: boolean;
  onAddTasks: (items: TaskImportResult["tasks"]) => Promise<boolean>;
  onToggleTask: (task: PlanTask) => Promise<void>;
  onRemoveTask: (task: PlanTask) => Promise<void>;
};

function readableTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
}

export default function TaskPlanner({ tasks, isLoading, isSaving, isCloud, onAddTasks, onToggleTask, onRemoveTask }: TaskPlannerProps) {
  const [formatText, setFormatText] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const completeCount = tasks.filter(task => task.completedAt).length;

  async function importItems(result: TaskImportResult, source: "format" | "json") {
    setIssues(result.issues.map(issue => `${issue.row ? `${source === "json" ? "Item" : "Line"} ${issue.row}: ` : ""}${issue.message}`));
    if (!result.tasks.length) return false;
    return onAddTasks(result.tasks);
  }

  async function importFormat() {
    const imported = await importItems(parseTaskFormat(formatText), "format");
    if (imported) setFormatText("");
  }

  async function importJson(file: File) {
    await importItems(parseTaskJson(await file.text()), "json");
  }

  return <section className="planning-view" aria-labelledby="planning-heading">
    <div className="section-heading planning-heading"><div><p className="eyebrow">02 / PLANNING DESK</p><h2 id="planning-heading">Give today a shape.</h2><p className="planning-intro">Your planned tasks appear here and in Today, so there is only one list to keep in motion.</p></div><p className="planning-summary">{isLoading ? "Loading your plan…" : `${completeCount}/${tasks.length} cues complete`}</p></div>
    <div className="planning-grid">
      <section className="task-list-panel" aria-labelledby="task-list-heading"><div className="panel-heading"><div><p className="eyebrow">TODAY’S QUEUE</p><h3 id="task-list-heading">The next clear move</h3></div><span className={`plan-sync ${isCloud ? "is-cloud" : ""}`}>{isCloud ? "Private cloud" : "This device"}</span></div>
        {tasks.length ? <div className="planned-task-list">{tasks.map((task, index) => <article className={`planned-task ${task.completedAt ? "is-complete" : ""}`} key={task.id}><span className={`planned-task-number priority-${task.priority}`}>0{index + 1}</span><div className="planned-task-copy"><h4>{task.title}</h4><p>{task.priority} priority · {readableTime(task.scheduledTime)}</p></div><button type="button" disabled={isSaving} className="plan-check" aria-label={`${task.completedAt ? "Reopen" : "Complete"} ${task.title}`} aria-pressed={Boolean(task.completedAt)} onClick={() => void onToggleTask(task)}>{task.completedAt ? <Check size={17} /> : <span />}</button><button type="button" disabled={isSaving} className="icon-button delete-button" aria-label={`Remove ${task.title}`} onClick={() => void onRemoveTask(task)}><Trash2 size={15} /></button></article>)}</div> : <div className="planning-empty"><ListPlus size={25} /><h3>The page is clear.</h3><p>Paste a few cues below or import a prepared JSON file.</p></div>}
      </section>
      <aside className="import-panel"><div><p className="eyebrow">BULK IMPORT</p><h3>Bring your rough plan.</h3><p>One task per line, using <code>task:priority:time</code>.</p></div><textarea value={formatText} onChange={event => setFormatText(event.target.value)} placeholder={EXAMPLE} aria-label="Tasks in task priority time format" /><div className="import-actions"><button type="button" className="submit-button" disabled={!formatText.trim() || isSaving} onClick={() => void importFormat()}><ListPlus size={16} /> Add formatted tasks</button><button type="button" className="import-file-button" disabled={isSaving} onClick={() => fileInput.current?.click()}><FileJson2 size={16} /> Upload JSON <Upload size={14} /></button></div><input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={event => { const file = event.target.files?.[0]; if (file) void importJson(file); event.currentTarget.value = ""; }} />{issues.length > 0 && <div className="import-issues" role="status">{issues.slice(0, 3).map(issue => <p key={issue}>{issue}</p>)}</div>}<details className="json-guide"><summary>JSON format</summary><pre>{`{ "tasks": [{ "task": "Draft outline", "priority": "high", "time": "09:30" }] }`}</pre></details></aside>
    </div>
  </section>;
}
