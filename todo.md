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

- [ ] Verify and document that remaining Manus authentication, database, and server code is removed or isolated from the Vercel/Supabase app path.
- [ ] Fix the obsolete development-server runtime error caused by the unused server entrypoint.
- [x] Run and record successful tests, build, and development preview checks for the Supabase migration.
- [ ] Repair the logo and focus-illustration asset references so all branded imagery loads in the Vite preview and Vercel deployment.

## Supabase public media

- [x] Create a public Supabase Storage bucket for the habit-tracker’s branded media.
- [x] Upload the logo, editorial illustrations, and focus-music loop to the public bucket.
- [ ] Replace the managed-project asset paths with Supabase public media URLs and verify all assets load locally and on Vercel.
