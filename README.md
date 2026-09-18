# Court Lineup

A shared realtime board for a badminton hall with three courts. No accounts: a name
typed in is the whole identity.

- [`CONTEXT.md`](./CONTEXT.md) — the glossary. Read this first.
- [`docs/adr/`](./docs/adr) — why it is built this way.
- [`docs/ui-design-brief.md`](./docs/ui-design-brief.md) — what the screen has to do.

## Shape

One Postgres table and six functions are the entire backend; there is no server
process. The React app holds no opinion of its own — every realtime event triggers a
full refetch, and nothing is optimistic. See
[ADR-0003](./docs/adr/0003-one-table-and-postgres-functions-are-the-server.md) and
[ADR-0004](./docs/adr/0004-the-client-never-patches-state.md).

## Setup

```sh
npm install
cp .env.example .env          # then fill in the two VITE_ values
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
npm run dev
```

`.env` holds two kinds of thing and they must not be confused:

| Variable | Where it goes |
| --- | --- |
| `VITE_SUPABASE_URL` | **Into the public bundle.** Public by design. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Into the public bundle.** Public by design. |
| `SUPABASE_SECRET_KEY` | CLI only. Bypasses RLS. Never gets a `VITE_` prefix. |
| `SUPABASE_DB_PASSWORD` | CLI only, for `supabase link` / `db push`. |

Only `VITE_`-prefixed variables are exposed to the client, so the last two cannot
leak through the build. Keep it that way.

## Deploying

Pushing to `main` builds and publishes to GitHub Pages. Before the first deploy:

1. **Settings → Pages → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions → Variables** — add
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. *Variables*, not secrets:
   both ship in the bundle, and storing them as secrets would imply a protection
   that does not exist.

The board lives at `https://<user>.github.io/court_lineup/`. Print a QR code and tape
it to the wall by the courts — that is the intended way in.

## Operating it

Free Supabase projects **pause after a week of inactivity**, and there is deliberately
no keepalive ([T8](./docs/adr)). If the hall goes quiet over a holiday, unpause the
project from the dashboard before the first session back.

There is no auto-expiry of anything. A game left running overnight shows as occupied
until someone presses **Clear board**.
