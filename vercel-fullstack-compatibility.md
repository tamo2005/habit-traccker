# Vercel full-stack compatibility

Official Vercel guidance confirms that an Express application can run as a single Vercel Function when it is exposed through a root-level `app`, `index`, or `server` entrypoint that default-exports the Express application or starts a listener. Static assets must be served from `public/**`; Vercel ignores `express.static()` for its CDN assets. Vite itself produces a static frontend, and Vercel recommends using a compatible function/backend mechanism for full-stack behavior rather than treating the Vite build as a complete server.

The current Vercel deployment only publishes `dist/public`, so it cannot provide `/api/trpc`, `/api/oauth/callback`, database access, or the Manus storage proxy. The existing backend additionally requires `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, and Manus storage credentials. The final Vercel migration therefore requires a server entrypoint, environment configuration, and an OAuth redirect URI registered for the Vercel hostname. The SPA fallback must explicitly exclude `/api/*` so Vercel can dispatch those requests to the exported function.

## Sources

- [Express on Vercel](https://vercel.com/docs/frameworks/backend/express)
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Using the Node.js Runtime with Vercel Functions](https://vercel.com/docs/functions/runtimes/node-js)
