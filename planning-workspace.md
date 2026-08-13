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

The released Vercel planning view was inspected at `https://habit-traccker-gamma.vercel.app/app`. It presents the structured `task:priority:time` editor, format hint, JSON upload action, schema example, and a clear empty-state before any tasks are added. The production browser console had no active messages during this inspection.

Planned tasks now have one shared state owner in the workspace dashboard. The Today view renders the same device-saved task queue beneath habits, including priority, scheduled time, completion, removal, and a direct route back to Plan. During local validation, all six existing plan tasks appeared in Today and marking **Prepare notes** complete immediately updated its state without leaving the main board.

At a 375px viewport, the compact workspace header now retains action buttons for focus sound, local personal-music selection, cloud sign-in/sign-out, and adding a habit. A second row exposes Today, Plan, and Insights with the active view clearly marked, so no essential controls depend on the hidden desktop side rail.

Preset deletion no longer causes a deleted cloud board to be refilled with starter habits. The cloud loader now maps the returned user rows exactly, including an intentionally empty list, and all habit/task completion and deletion buttons explicitly use `type="button"` to prevent accidental form submission. In the local browser check, deleting **Morning movement** immediately showed the remaining three habits, retained the active Today view, and displayed a removal confirmation without navigation.

After a browser refresh, the same local board still displayed only the remaining three habits and stayed on Today, confirming that the deleted preset was not restored by the page load.
