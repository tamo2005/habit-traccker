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
