# Vercel deployment notes

The public GitHub source is `https://github.com/tamo2005/habit-traccker` on the `main` branch.

Vercel detected the project as **Vite**. The import flow used project name `habit-traccker`, root directory `./`, build command `pnpm build`, output directory `dist/public`, and install command `pnpm install --frozen-lockfile`, matching `vercel.json`.

The deployment was started from Vercel’s signed-in import flow on Aug 13, 2026 and completed successfully. Production URL: `https://habit-traccker-gamma.vercel.app`.

Smoke test: the production dashboard loaded with the Today, Insights, Privacy, Add habit, mark, and remove controls. Marking “Morning movement” updated the live count from `0/4` to `1/4` and displayed the completion confirmation message.
