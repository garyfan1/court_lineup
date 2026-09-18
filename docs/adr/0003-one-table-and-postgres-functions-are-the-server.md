# One table, and the Postgres functions are the server

The entire board is one `groups` table — `court_id is null` means queued, `1|2|3`
means on that court — and every write is a `security definer` Postgres function.
`anon` is granted `select` and nothing else, so the six functions are the complete
write API.

## Considered options

- **Three tables (`courts`, `groups`, `players`) with PostgREST CRUD** — rejected
  because it does not avoid server-side logic, it relocates it. PostgREST cannot
  express `players = players || $2`, cannot compute "lowest-numbered free court",
  and demands a filter on every delete, so `play_now`, `end_game`, `clear_board`
  and an atomic `create_group` remain functions at any table count. Three tables
  then *adds* two triggers — to cap a group at four players and to delete a group
  when its last player leaves — trading readable named functions for invisible
  write-time logic, plus three realtime subscriptions instead of one. Its one real
  gain, unambiguous delete-by-row-id, is bought for four lines of SQL instead by
  passing the expected name alongside the array index.
- **A mixed surface: functions only where PostgREST can't cope** — rejected because
  it leaves two mental models and two error shapes for six actions, and saves only
  three trivial calls.

## Consequences

- "Pure frontend" describes the deployment — no Node process, nothing to keep
  alive — not the absence of server logic. The logic is in `.sql` migrations.
- `create unique index one_group_per_court on groups (court_id) where court_id is
  not null` *is* the "one group per court" invariant. Concurrency is not defended
  by application code; Postgres refuses the losing write and the function raises.
- This makes ADR-0001 precise rather than contradicting it. "Anyone can do
  anything" means any human may perform any of the six actions. It never meant the
  published key should accept arbitrary CRUD.
- Placeholders (ADR: the "x" slots) are never stored. A court renders
  `4 - cardinality(players)` of them. Nothing persisted means nothing to drift.
- Failures raise exceptions rather than returning `false`, so every call site has
  one error path.
