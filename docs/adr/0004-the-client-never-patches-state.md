# The client never patches state, and never guesses

The realtime subscription's callback takes no argument. Any change event, of any
type, triggers one `select *` of the whole table (debounced ~100ms) which replaces
local state wholesale. There are no optimistic updates: a write in flight sets a
global `busy` flag that disables every control, and the UI changes only once the
server's version of the board arrives.

Both halves of this look like omissions and are not. The callback ignoring its
payload, and the absence of optimistic updates, are the same decision twice.

## Considered options

- **Patching local state from the event payload** — the shape every tutorial uses,
  and rejected because it is only correct if you receive every event, in order,
  forever. A suspended tab or eight seconds of lost signal drops events silently,
  after which local state is permanently wrong *with no way to detect it* — the
  board disagreeing with the room, which CONTEXT.md names as the system's central
  failure. Refetching makes reconnect self-healing. It also sidesteps the fact that
  `DELETE` payloads carry only the primary key unless `REPLICA IDENTITY FULL` is
  set. The board is ~15 rows; the round trip this "saves" is smaller than a favicon.
- **Optimistic updates** — rejected because they reintroduce exactly the local
  opinion that refetch-everything exists to eliminate, and because ADR-0001's
  open-season `Play now` makes losing a write routine rather than exceptional.
  Showing a group on a court and retracting it 300ms later is worse than 300ms of
  a disabled button. The spinner never lies.

## Consequences

- Local state is only ever a whole snapshot the server just handed over, so there
  is no mechanism by which the client's opinion could survive. "Server state always
  wins" is not a rule anyone has to remember.
- Four situations share one code path: event arrived, socket reconnected, tab
  regained focus, app loaded. No merge logic exists to contain a bug.
- A single global `busy` flag rather than per-button state, with a ~5s timeout that
  clears it and toasts, so a hung request cannot freeze the board. Double-tap
  protection falls out of this for free.
- Anything other than `SUBSCRIBED` from the channel greys the board out and
  disables every control. Showing nothing is preferred to showing stale state.
- Transport is Postgres Changes, not Broadcast. Not recorded as its own decision
  because it is cheap to reverse — a trigger and one changed `.on()` call — but the
  reasoning was that Supabase's threshold for preferring Broadcast is ~3,000
  concurrent subscribers on the same changes, and a three-court hall is two orders
  of magnitude below it. Broadcast-from-database would also require disabling
  public access and then restoring it by RLS policy on `realtime.messages`, four
  moving parts netting to what the public channel does in zero.
