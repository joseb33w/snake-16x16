# Goal
Build a fresh Vite + TypeScript + Tailwind Snake app in a new repository with a 16×16 canvas game, Supabase magic-link auth, per-user saved runs, and a top-5 personal leaderboard.

# Files to touch
- Project config: `package.json`, `vite.config.ts`, `tsconfig.json`, `.env.example`, `.gitignore`, `README.md`
- App shell and styles: `index.html`, `src/main.ts`, `src/style.css`
- Game modules: `src/game/Grid.ts`, `src/game/Snake.ts`, `src/game/Food.ts`, `src/game/GameLoop.ts`
- UI/lib modules: `src/components/Canvas.ts`, `src/components/ScoreBar.ts`, `src/components/Leaderboard.ts`, `src/lib/supabase.ts`, `src/lib/swipeDetector.ts`
- Supabase schema: `supabase/schema.sql`

# Verification approach
- Apply the prefixed Supabase schema and verify RLS policies/grants.
- Run TypeScript and production build.
- Verify Supabase positive/negative access with real auth users and clean them up.
- Run a Playwright browser test against the built frontend, including magic-link auth, snake movement, scoring, game-over saving, and leaderboard rendering.
- Deploy `dist/` to R2 and confirm the preview is reachable.

# Out of scope
- Global leaderboard, multiplayer, skins, levels, and offline play.
