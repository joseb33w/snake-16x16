# Neon Snake 16×16

Classic Snake on a 16×16 grid built with Vite, TypeScript, Tailwind, and Supabase.

## Features

- Center-starting snake that moves continuously and cannot reverse direction.
- Tap-swipe canvas controls plus keyboard support with arrow keys or WASD.
- Random red food dots on empty cells, +1 score and +1 length per bite.
- Wall and self-collision game over.
- Glowing snake head with a rainbow body gradient that shifts as the snake grows.
- Supabase magic-link auth and a per-user top-5 leaderboard backed by RLS.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Fill `.env` with the Supabase values provided by Gogi:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_TABLE_PREFIX`

## Supabase

The app reads and writes to `<VITE_SUPABASE_TABLE_PREFIX>_snake_runs`. Apply `supabase/schema.sql` to provision the table, RLS policy, grants, and leaderboard index.

## Build

```bash
npm run build
```
