# Planning Workspace

The planning workspace accepts either one shorthand task per line or a JSON file. The shorthand form is `task:priority:time`; a standard 24-hour time such as `09:30` is supported, as are values such as `9am`. Priority accepts `high`, `medium`, or `low` (including their concise aliases).

```text
Draft project outline:high:09:30
Walk after lunch:medium:12:15
Prepare tomorrow:low:17:45
```

For JSON import, supply either an array of task objects or an object containing a `tasks` array. Each task needs `task` (or `title`), `priority`, and `time` (or `scheduledTime`). Invalid entries produce targeted feedback while valid entries continue to import.

The workspace exposes a native JSON-only file input (`application/json,.json`) behind its Upload JSON action. This preserves file-type guidance at the browser boundary as well as parser-level validation. A browser-level upload of a valid two-item JSON fixture created both tasks, placed them in schedule order, and showed the device-saved import confirmation. A second fixture with one valid task and one blank title imported the valid task and displayed targeted feedback for item 2 without discarding the good entry.

In the signed-out workspace, imported tasks and their completion state are stored on the current device. The verified shorthand sample created three tasks in local storage, one task could be completed immediately, and both the task batch and completion state remained after a page refresh. The signed-in path writes the same task model to the user-owned `planned_tasks` Supabase table.
