-- The whole board. See docs/adr/0003-one-table-and-postgres-functions-are-the-server.md
--
--   court_id is null  -> the group is in the queue
--   court_id in 1..3  -> the group is playing on that court
--
-- Placeholders ("x" slots) are never stored: a court renders 4 - cardinality(players)
-- of them. Nothing persisted means nothing to drift.

create table public.groups (
  id         uuid primary key default gen_random_uuid(),
  players    text[]      not null,
  court_id   int,
  created_at timestamptz not null default now(),

  constraint players_one_to_four check (cardinality(players) between 1 and 4),
  constraint court_in_range      check (court_id is null or court_id between 1 and 3)
);

-- This index IS the "one group per court" invariant. Concurrency is not defended by
-- application code; Postgres refuses the losing write and play_now() raises.
create unique index one_group_per_court
  on public.groups (court_id)
  where court_id is not null;

-- Arrival order. Records history only, confers no priority (CONTEXT.md: Queue).
create index groups_created_at_idx on public.groups (created_at);

-- The board is world-readable and nobody may write to it directly. Supabase grants
-- new public tables to anon/authenticated by default, so the revoke is load-bearing:
-- without it the six functions stop being the whole write API.
alter table public.groups enable row level security;

revoke all on public.groups from anon, authenticated;
grant select on public.groups to anon, authenticated;

create policy "the board is public" on public.groups
  for select to anon, authenticated using (true);

-- One subscription on one table is the entire realtime feed.
alter publication supabase_realtime add table public.groups;
