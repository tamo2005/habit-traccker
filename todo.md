# Project checklist

- [x] Inspect the selected GitHub repository and current local project state.
- [x] Prepare the completed habit-tracker files for version control.
- [x] Create a commit with the finished application.
- [x] Push the commit to the selected GitHub repository.
- [x] Verify the remote branch and commit URL.

## Public repository migration

- [x] Create the public repository named `habit-traccker`.
- [x] Push the completed application to the new public repository.
- [x] Verify the new repository URL and default branch.

## Vercel deployment

- [x] Inspect the project’s Vercel compatibility and build settings.
- [x] Prepare any required Vercel configuration.
- [x] Connect `tamo2005/habit-traccker` to Vercel and deploy it.
- [x] Verify the production URL and core app flow.

## Authenticated habit tracking

- [x] Upgrade the project with Manus authentication and database support.
- [x] Add per-user habit and completion data models.
- [x] Add protected server procedures and connect the UI to cloud persistence.
- [x] Preserve a safe local-first fallback for signed-out users.
- [x] Add branded logo and favicon treatment.
- [x] Add optional background music with play, pause, volume, and mute controls.
- [x] Verify sign-in, sign-out, data persistence, media controls, and responsive layouts.

## Final acceptance checks

- [x] Confirm the upgraded app retains a branded favicon and matching page metadata.
- [ ] Browser-test sign-in, cloud habit creation and persistence after refresh, and sign-out.
- [x] Browser-test play, pause, mute, and volume controls for the focus-sound loop.
- [ ] Configure the public runtime and OAuth callback, then complete the final end-to-end sign-in and cloud-persistence test on that host.

## Vercel full-stack migration

- [x] Identify the minimum Vercel serverless entrypoint and environment requirements for the existing Express and tRPC backend.
- [x] Add a Vercel-compatible API entrypoint and update the deployment configuration.
- [ ] Configure a managed production database and OAuth redirect URL for the Vercel hostname.
- [ ] Deploy the full-stack update and complete the public authenticated persistence test.
- [ ] Protect `/api/*` from the SPA fallback rewrite and verify the Vercel API and OAuth routes resolve correctly.
- [ ] Browser-test public sign-in and cloud persistence after the Vercel runtime settings are configured.
- [ ] Connect the Vercel project to the public GitHub repository or manually redeploy commit `eb3dc68` before production verification.
- [ ] Diagnose why the Vercel deployment returns `404 NOT_FOUND` for `/api/trpc/*` despite the serverless entrypoints, then deploy a verified API function.

## Vercel managed-services setup

- [ ] Select a Vercel-compatible full-stack runtime that can serve the SPA and API from one deployment.
- [x] Provision a managed Supabase Postgres database and link its managed environment variables to Vercel.
- [ ] Register an OAuth application with the Vercel production callback URL and configure its client settings securely.
- [ ] Apply the habit schema to the selected production database and verify user-level data isolation.

## Supabase migration for Vercel

- [x] Provision a Supabase project from the Vercel Marketplace and link it to the `habit-traccker` Vercel project.
- [x] Replace the Manus-specific login and database procedures with Supabase authentication and client configuration.
- [x] Create the cloud habit schema with row-level security so users can access only their own records.
- [x] Add Vercel production and preview environment variables for the Supabase project.
- [ ] Deploy the migration and validate sign-up, sign-in, sign-out, and cross-refresh habit persistence.
- [ ] Validate row-level security with separate authenticated user sessions before closing the production acceptance test.
- [x] Configure Supabase email sign-in Site and redirect URLs for the public Vercel host.

## Supabase runtime cleanup

- [x] Verify and document that remaining Manus authentication, database, and server code is isolated from the Vercel/Supabase app path.
- [x] Confirm the active Vite development path has no current runtime error from the retained unused server entrypoint.
- [x] Run and record successful tests, build, and development preview checks for the Supabase migration.
- [x] Repair the logo and focus-illustration asset references so all branded imagery loads in the Vite preview and Vercel deployment.

## Supabase public media

- [x] Create a public Supabase Storage bucket for the habit-tracker’s branded media.
- [x] Upload the logo, editorial illustrations, and focus-music loop to the public bucket.
- [x] Replace the managed-project asset paths with Supabase public media URLs and verify all assets load locally and on Vercel.

## Final local media validation

- [x] Confirm `client/src/lib/assets.ts` is present and the `@/lib/assets` import resolves after a clean Vite restart.
- [x] Re-check the local preview for the Supabase-hosted logo, header illustration, focus card, favicon, and focus audio without runtime import errors.

## Planning workspace and focus clock

- [ ] Define a task model with title, priority, scheduled time, and completion state that works locally and with signed-in cloud storage.
- [x] Add a public landing page that presents Signal / Streak and routes visitors to the workspace.
- [x] Add a planning workspace where users can inspect and complete scheduled tasks.
- [x] Add bulk task creation from a JSON file and the `task:priority:time` text format, with validation and import feedback.
- [x] Add an accessible focus clock with configurable focus and break durations, start/pause/reset controls, and completion alarm.
- [x] Add a deliberate break-mode animation that respects reduced-motion preferences.
- [x] Add focused tests for import parsing and focus-clock state transitions.
- [x] Verify the new experience in desktop and mobile previews, then deploy the enhancement to Vercel.
- [x] Implement local-first planned-task persistence using the new task model.
- [ ] Add signed-in Supabase CRUD for `planned_tasks` and map cloud rows into workspace state.
- [ ] Verify local task persistence and authenticated task load/save behavior before closing the task-model work.
- [x] Fix concise `task:priority:time` parsing so standard HH:MM times are accepted during bulk import.
- [x] Include client-side utility tests in the Vitest configuration so planning-import coverage runs in the standard suite.
- [x] Browser-test JSON file import with valid and invalid entries, confirming successful tasks and targeted validation feedback.
- [ ] Inspect and test signed-in `planned_tasks` read, create, completion toggle, delete, and refresh persistence through the workspace UI.
- [x] Correct focus-clock primary control labels so start and resume actions describe the current interval accurately.
- [x] Add component-level FocusClock tests for start, pause, reset, switching modes, duration changes, and interval completion.
- [x] Re-verify focus-clock labels and controls in the browser after the correction.

## Unified tasks, real-time clock, and personal music

- [x] Diagnose why imported planned tasks remain isolated from the main Today dashboard list.
- [x] Surface planned tasks in the main dashboard with priority, time, completion, and navigation back to the planner.
- [ ] Keep planned-task completion changes consistent between Today and Plan for local and signed-in cloud users.
- [x] Add a live real-time clock alongside the focus timer.
- [x] Add selectable timer modes, including Pomodoro, short break, long break, and a custom duration mode.
- [x] Make timer state, labels, alarms, and break animations correctly reflect the selected mode.
- [x] Add a user-selected personal-music file option with local-only playback and clear privacy guidance.
- [x] Test the integrated task, timer, and personal-music flows in desktop and mobile previews and deploy the update.
- [x] Commit and push the verified unified-task, clock, and personal-music enhancement to the public GitHub repository.
- [x] Restore accessible mobile navigation, sign-in, and personal-music controls in the compact workspace header.

## Preset task deletion regression

- [x] Reproduce the preset-task deletion flow and identify why it returns the user to the page entry state.
- [x] Fix deletion so the active dashboard view and surrounding UI state remain intact.
- [x] Add regression coverage for an intentionally empty cloud board and validate the corrected preset-deletion browser flow.
- [ ] Commit and push the verified preset-task deletion correction to GitHub.
