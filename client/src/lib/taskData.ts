export type TaskPriority = "high" | "medium" | "low";

export type PlanTask = {
  id: string;
  title: string;
  priority: TaskPriority;
  scheduledTime: string;
  completedAt: string | null;
};

export type CloudTaskRow = {
  id: string;
  title: string;
  priority: TaskPriority;
  scheduled_time: string | null;
  completed_at: string | null;
};

export type ImportIssue = {
  row: number;
  message: string;
};

export type TaskImportResult = {
  tasks: Array<Omit<PlanTask, "id" | "completedAt">>;
  issues: ImportIssue[];
};

const priorityAliases: Record<string, TaskPriority> = {
  high: "high",
  h: "high",
  medium: "medium",
  med: "medium",
  m: "medium",
  low: "low",
  l: "low",
};

function normalisePriority(value: unknown): TaskPriority | null {
  if (typeof value !== "string") return null;
  return priorityAliases[value.trim().toLowerCase()] ?? null;
}

export function normaliseScheduledTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(?:([01]?\d|2[0-3]):([0-5]\d)|([01]?\d|2[0-3])\s*(am|pm))$/i);
  if (!match) return null;
  if (match[3]) {
    const hour = Number(match[3]);
    const suffix = match[4].toLowerCase();
    const twentyFourHour = suffix === "pm" ? (hour % 12) + 12 : hour % 12;
    return `${String(twentyFourHour).padStart(2, "0")}:00`;
  }
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function makeImportTask(title: unknown, priority: unknown, time: unknown, row: number): { task?: Omit<PlanTask, "id" | "completedAt">; issue?: ImportIssue } {
  const safeTitle = typeof title === "string" ? title.trim() : "";
  const safePriority = normalisePriority(priority);
  const safeTime = normaliseScheduledTime(time);
  if (!safeTitle) return { issue: { row, message: "Task name is required." } };
  if (safeTitle.length > 160) return { issue: { row, message: "Task names must be 160 characters or fewer." } };
  if (!safePriority) return { issue: { row, message: "Priority must be high, medium, or low." } };
  if (!safeTime) return { issue: { row, message: "Time must use 24-hour HH:MM or a value such as 9am." } };
  return { task: { title: safeTitle, priority: safePriority, scheduledTime: safeTime } };
}

export function parseTaskFormat(text: string): TaskImportResult {
  return text.split(/\r?\n/).reduce<TaskImportResult>((result, line, index) => {
    if (!line.trim()) return result;
    const [title, priority, ...timeParts] = line.split(":");
    const time = timeParts.join(":");
    if (!title || !priority || !time) {
      result.issues.push({ row: index + 1, message: "Use task:priority:time." });
      return result;
    }
    const { task, issue } = makeImportTask(title, priority, time, index + 1);
    if (task) result.tasks.push(task);
    if (issue) result.issues.push(issue);
    return result;
  }, { tasks: [], issues: [] });
}

export function parseTaskJson(text: string): TaskImportResult {
  try {
    const decoded: unknown = JSON.parse(text);
    const rows = Array.isArray(decoded)
      ? decoded
      : decoded && typeof decoded === "object" && Array.isArray((decoded as { tasks?: unknown }).tasks)
        ? (decoded as { tasks: unknown[] }).tasks
        : null;
    if (!rows) return { tasks: [], issues: [{ row: 0, message: "JSON must be an array or an object with a tasks array." }] };
    return rows.reduce<TaskImportResult>((result, row, index) => {
      if (!row || typeof row !== "object") {
        result.issues.push({ row: index + 1, message: "Each JSON item must be an object." });
        return result;
      }
      const entry = row as { task?: unknown; title?: unknown; priority?: unknown; time?: unknown; scheduledTime?: unknown };
      const { task, issue } = makeImportTask(entry.task ?? entry.title, entry.priority, entry.time ?? entry.scheduledTime, index + 1);
      if (task) result.tasks.push(task);
      if (issue) result.issues.push(issue);
      return result;
    }, { tasks: [], issues: [] });
  } catch {
    return { tasks: [], issues: [{ row: 0, message: "This file is not valid JSON." }] };
  }
}

export function mapCloudTask(row: CloudTaskRow): PlanTask {
  return {
    id: row.id,
    title: row.title,
    priority: row.priority,
    scheduledTime: (row.scheduled_time ?? "").slice(0, 5),
    completedAt: row.completed_at,
  };
}
