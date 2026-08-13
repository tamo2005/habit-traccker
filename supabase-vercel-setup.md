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
