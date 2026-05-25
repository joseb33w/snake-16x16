# Goal
Build and refine a fresh Vite + TypeScript + Tailwind Snake app in a new repository with a 16×16 canvas game, Supabase email/password auth, per-user saved runs, and a top-5 personal leaderboard. The auth screen must be the first view; no main game UI is shown until a user is signed in.

# Files to touch
- Project config/docs: `README.md`, `PLAN.md`
- App shell and styles: `src/main.ts`
- Supabase schema: `supabase/schema.sql` remains the backend table for saved runs.

# Verification approach
- Run TypeScript and production build.
- Verify Supabase RLS with real auth users and clean them up.
- Run a Playwright browser test against the built frontend, including blocked signed-out UI, email/password sign-in, snake movement, scoring, game-over saving, and leaderboard rendering.
- Deploy `dist/` to R2 and confirm the preview is reachable.

# Out of scope
- Global leaderboard, multiplayer, skins, levels, and offline play.
