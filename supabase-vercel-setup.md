# Supabase + Vercel setup notes

## Selected architecture

The Vercel-native Supabase integration is the chosen replacement for the Manus-managed database and OAuth stack. It supplies Supabase Postgres, Supabase Auth, and environment-variable synchronization for the linked Vercel project.

## Verified integration details

The [Supabase Vercel Marketplace integration](https://vercel.com/marketplace/supabase) describes a Vercel-native installation that can create or link a Supabase account, sync Supabase project variables into Vercel, and automatically create redirect URLs for preview branches. It lists `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` among the supplied variables.

Vercel’s storage documentation identifies Marketplace storage as the supported path for hosted relational databases and says that provider credentials can be injected into the linked Vercel project. Source: https://vercel.com/docs/storage

## Current provisioning state

The Vercel Marketplace installation dialog is open. The **Create New Supabase Account** path was selected, and the existing **tamo's projects (`tamos-projects-2df55e85`)** team was chosen. Vercel reports that Supabase is already installed for this team, so the next step should link or configure the existing integration for the `habit-traccker` project rather than create a duplicate team-level installation.

The configuration flow selected the recommended **Washington, D.C., USA (East) — `iad1`** region and the standard `NEXT_PUBLIC_` public-variable prefix. The interface presents a **Supabase Free Plan** as the available installation plan and is waiting at the final continuation step before account confirmation and database provisioning.

The confirmation step was approved with the resource renamed to `habit-tracker-db`. Provisioning completed successfully: Vercel reports that the Supabase database is ready and was successfully created. The installation flow is waiting for its final continuation step to expose the linked-resource configuration.

The final integration step now presents the Vercel project selector. The `habit-traccker` project is available, with Production and Preview environments selected by default; Development remains unselected. The resource must be connected to this project before its Supabase environment variables are injected.

The `habit-traccker` project has been selected. Production and Preview remain selected, preserving the user-facing and preview deployment scopes. The connection action will inject the integration-managed database and Supabase configuration values into that Vercel project.

The Vercel integration now confirms that `habit-traccker` is connected to the `habit-tracker-db` database. The available resource shows Supabase ID `dsglpcmxnbbixsmevzsh`, status `Available`, and the Supabase Free Plan. Its generated project configuration exposes the expected URL, publishable/anon-key, service-secret, and Postgres connection variables without disclosing their values.

The resource Projects view independently lists `habit-traccker` as connected and scopes it to both Production and Preview. The project’s Vercel environment-variable settings page has been opened for the remaining variable-presence verification.

The Vercel project environment-variable settings confirm that Supabase and Postgres variables were injected successfully into both Production and Preview. The visible names include `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `POSTGRES_URL`, `POSTGRES_DATABASE`, `POSTGRES_HOST`, `POSTGRES_USER`, and `POSTGRES_PASSWORD`. Values remain masked and were not copied into project files.

## Next implementation work

After linking the service, move persistence and user sessions to Supabase, create a row-level-security-protected habit schema, link the `habit-traccker` Vercel project, set the allowed production callback URL, and deploy the updated app.

The initial SQL migration attempt failed before completion because the SQL editor substituted the intended Supabase role `authenticated` with the nonexistent role `authentication_method`. The migration will be retried with the role explicitly quoted as `"authenticated"`; the idempotent schema statements make the retry safe regardless of whether preceding table statements were applied.

The corrected SQL migration completed successfully in the Supabase SQL Editor on Aug 13, 2026. It created or confirmed the `public.habits` and `public.habit_completions` tables, their ownership indexes, and row-level-security policies limited to the quoted `authenticated` role. The editor reported: `Success. No rows returned`.

Supabase URL Configuration currently has the default `http://localhost:3000` Site URL and no permitted redirect URLs. The Vercel production URL `https://habit-traccker-gamma.vercel.app` must be saved as the Site URL and allowlisted as a redirect destination before email authentication can return users to the deployed app.

The Vercel production URL has been entered as the pending Site URL, and the Supabase redirect-URL dialog is open with a blank allowlist entry. The configuration has not been saved yet.

Supabase has now saved `https://habit-traccker-gamma.vercel.app` as an allowed redirect URL. The Site URL save is a separate action and remains at its prior default (`http://localhost:3000`), so it must be updated again and saved separately.

The Supabase Site URL is now also saved as `https://habit-traccker-gamma.vercel.app`. Passwordless email authentication therefore has both a safe default return destination and a matching allowed redirect entry for the public Vercel host.

For Vercel-compatible branded media, the Supabase Storage creation dialog is configured for a bucket named `habit-assets`. The user approved public read access for this bucket; file-size and MIME-type restrictions remain disabled because it will contain only the known logo, three static illustrations, favicon reference, and focus-music loop.

The `habit-assets` bucket was created successfully and appears in Supabase Storage as a public bucket. It currently contains no files, has no configured upload policies, permits files up to the plan default of 50 MB, and accepts the needed image and audio MIME types.

On 13 August 2026, the approved transfer of the branded media completed through an authenticated Supabase dashboard session. The storage service confirmed successful uploads of `signal-flag-logo.png`, `signal-paper-field.png`, `signal-week-illustration.png`, `signal-focus-card.png`, and `habit-signal-loop.mp3`. The durable public URLs follow `https://dsglpcmxnbbixsmevzsh.supabase.co/storage/v1/object/public/habit-assets/<filename>`.

Direct browser validation confirmed that the public `signal-flag-logo.png` and `signal-focus-card.png` object URLs render correctly from the `habit-assets` bucket. The production bundle now references this same public URL base instead of project-local managed-storage routes.

The updated local project passed all six Vitest assertions, a standalone TypeScript check, and `vite build`. The desktop and mobile development previews both rendered the Supabase-hosted logo, header artwork, and focus-card illustration successfully. Vite is configured to expose `SUPABASE_URL` and `NEXT_PUBLIC_*` variables to the browser bundle, matching the names injected by the linked Vercel integration.

Commit `5162d03` (`feat: migrate habit sync to Supabase`) was pushed to `tamo2005/habit-traccker` on `main`. An initial production check immediately after the push still returned the prior bundle, identified by its `/manus-storage/...` media URLs. Vercel’s build propagation or repository linkage must therefore be confirmed before final production acceptance checks can proceed.

Vercel subsequently confirmed a successful Production deployment for commit `5162d03`. The deployment completed in 31 seconds, is marked **Ready** and **Current**, and is assigned to `habit-traccker-gamma.vercel.app` as well as the deployment-specific Vercel domain. The public host can now be rechecked against the newly built static bundle.

The first navigation to the current production domain after deployment returned the rendered application controls, including the sign-in and focus-sound controls. The browser’s screenshot transfer then reset the inspection tab to `about:blank`, so a clean production reload is still required to confirm the exact asset URLs and authenticated cloud workflow in the deployed browser session.

A clean production reload with the deployed build identifier confirmed the release now renders the logo, paper illustration, and focus-card artwork from the public `habit-assets` Supabase Storage URLs, not `/manus-storage` routes. The deployed **Sign in to sync** action opens the passwordless **Save the signal** dialog with an email-address input and a **Send secure sign-in link** control. No email was submitted during this interface validation.

With the user’s explicit confirmation, the production passwordless form was submitted for the user-provided email address. The interface entered its **Sending…** state; the request outcome and the secure-link return flow remain to be confirmed before cloud persistence is marked accepted.

The deployed form then closed without showing an error, which is the application’s success path after Supabase accepts a magic-link request. The remaining validation requires the user to open the received secure link, returning to the Vercel host with an authenticated Supabase session, before private habit CRUD, refresh persistence, and sign-out can be tested.

The user confirmed that they opened the secure link and that the sign-in flow works in their browser. A subsequent check from the isolated sandbox browser correctly remained signed out, confirming that this test context is separate from the user’s authenticated session; it is therefore not suitable for exercising the user’s private cloud data without an explicit shared-browser session.

The current production page loads `assets/index-CJOaH90R.js`, the static bundle built for commit `5162d03`, and the browser console contained no active application, Supabase, or public-media errors during the production check.

After a clean Vite restart, the local preview loaded successfully with no new module-resolution diagnostics. The media catalog file was present, the `@` alias resolved to `client/src`, and the local page rendered the Supabase-hosted logo, paper illustration, and focus-card artwork. Its favicon and audio element both resolve to public `habit-assets` URLs; the focus audio reported `readyState: 4` with no media error.

For the planning-workspace extension, the actual linked Supabase SQL Editor is available at `https://supabase.com/dashboard/project/dsglpcmxnbbixsmevzsh/sql/new` with the **Primary Database** selected and the `postgres` role. The managed project database tool remains the retired template’s TiDB database and cannot apply PostgreSQL/Supabase DDL; planned-task schema migrations must therefore run in this linked Supabase editor.

The existing private SQL snippet in that Supabase editor contains the successfully applied habits and completions schema. The new planned-task migration is additive, uses `create table if not exists`, and does not modify or remove existing user data.

On 13 August 2026, the `planned_tasks` migration completed successfully in the linked Supabase **Primary Database**. The new table stores `title`, constrained `priority`, scheduled time, optional completion timestamp, and an authenticated `user_id`; it has an owner-scoped index and row-level policy that permits each authenticated user to manage only their own planned tasks.

The planning enhancement commits `8a5b674` and `b8f5c8e` were pushed to `main` on 13 August 2026. Vercel's deployment history initially still showed `5162d03` as the most recent production release, so the public domain had not yet received the enhancement. With the user's confirmation, a production deployment for commit `b8f5c8e` was manually created and entered the **Building** state. The latest working state is preserved in Manus checkpoint `b8f5c8eb` while final release validation completes.

The Vercel production deployment for `b8f5c8e` completed successfully in 37 seconds at `https://habit-traccker-9j4j34zr0-tamos-projects-2df55e85.vercel.app`. The canonical production domain now renders the new Signal / Streak landing page, including Supabase-hosted media and `task:priority:time` guidance. Its `/app` workspace opens without a runtime error and displays the local-first dashboard, Plan tab, focus clock, configurable duration fields, and accessible focus controls.

The current delivery path is a static Vite application: `pnpm run dev` starts Vite, `pnpm build` runs only `vite build`, and `vercel.json` serves `dist/public` with an SPA fallback. Retained `server/`, tRPC, and template-auth files are not imported by the active Home, Landing, or main entrypoint and are therefore isolated from the deployed Supabase browser application. After the latest restart, the current Vite log contains only normal startup and HMR messages; the earlier `@/lib/focusClock` diagnostic was historical and preceded the successful subsequent build and runtime checks.

GitHub pushes to `main` now create Vercel production deployments automatically. The current `45e6e8e` deployment completed successfully in 34 seconds at `https://habit-traccker-lrmfue5rs-tamos-projects-2df55e85.vercel.app`. Its deployed workspace renders the shared Today/Plan task queue, local-time clock, Pomodoro, short-break, long-break, and custom timer controls, plus the local-only personal-music control; its public media URLs resolve from Supabase Storage.
