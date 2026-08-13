# Vercel full-stack compatibility

Official Vercel guidance confirms that an Express application can run as a single Vercel Function when it is exposed through a root-level `app`, `index`, or `server` entrypoint that default-exports the Express application or starts a listener. Static assets must be served from `public/**`; Vercel ignores `express.static()` for its CDN assets. Vite itself produces a static frontend, and Vercel recommends using a compatible function/backend mechanism for full-stack behavior rather than treating the Vite build as a complete server.

The current Vercel deployment only publishes `dist/public`, so it cannot provide `/api/trpc`, `/api/oauth/callback`, database access, or the Manus storage proxy. The existing backend additionally requires `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, and Manus storage credentials. The final Vercel migration therefore requires a server entrypoint, environment configuration, and an OAuth redirect URI registered for the Vercel hostname. The SPA fallback must explicitly exclude `/api/*` so Vercel can dispatch those requests to the exported function.

## Sources

- [Express on Vercel](https://vercel.com/docs/frameworks/backend/express)
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Using the Node.js Runtime with Vercel Functions](https://vercel.com/docs/functions/runtimes/node-js)

## Deployment observation

On Aug 13, 2026, Vercel detected GitHub commit `eb3dc68` (`Add Vercel API entrypoints for full-stack habit tracker`) and started a production build. The prior production URL remained available while the update was building. Vercel subsequently marked deployment `habit-traccker-ia1fjwvri-tamos-projects-2df55e85.vercel.app` as ready in 38 seconds. The production frontend rendered correctly at that URL, including the branded dashboard, local habit board, sign-in action, and focus-sound controls. API routing and authenticated persistence still require direct verification and runtime environment setup.

The deployment is now the current production deployment and is assigned the project domains. However, a direct request to `/api/trpc/auth.me` on that deployment returned Vercel `404 NOT_FOUND`, confirming that the deployed Vite project did not publish the expected API function. The build logs must be used to determine the supported routing and function configuration before the full-stack Vercel deployment can be considered valid.

The Vercel runtime-log view for this deployment showed no request logs or function errors after the API probe, consistent with the request failing before a serverless function was invoked.

## Architecture findings — Aug 13, 2026

- Vercel’s Vite guidance recommends adding a full-stack runtime such as Nitro when a Vite app needs a backend; the standard Vite deployment is a static frontend build. Source: https://vercel.com/docs/frameworks/frontend/vite
- Vercel’s Express guidance supports a default-exported Express app at root-level supported paths such as `app.ts`, `index.ts`, or `server.ts`; it becomes a single Vercel Function. Express static-file middleware is not supported, so static files must be delivered from `public/**` or the platform CDN. Source: https://vercel.com/docs/frameworks/backend/express
- Vercel functions are auto-discovered only from an `api/**` directory at the project root, and function behavior can be configured through `functions` in `vercel.json`. Source: https://vercel.com/docs/project-configuration/vercel-json

The revised approach should use an Express-first Vercel project with an explicit root-level app export and CDN-served frontend output, rather than expecting Vite static configuration to discover the nested tRPC function automatically.
