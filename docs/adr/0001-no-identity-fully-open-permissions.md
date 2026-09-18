# No identity, fully open permissions

The board has no accounts and no roles: a name is typed in fresh each time, and
anyone looking at the board can add or remove any name, place any group, end any
game, and clear the board. This is deliberate, not an unfinished auth story.

## Considered options

- **Device-scoped soft ownership** — the browser remembers the names it created, so
  you remove your own freely and get a confirm for anyone else's. Rejected because
  its central assumption (one device, one person) is false most of the time it
  matters: one person routinely enters all four names for their group, phones die
  and get handed around, the hall may have a shared laptop, and a private-mode
  refresh wipes the record. It is a permission model built on a lie.
- **An organiser PIN gating court operations** — rejected because the PIN-holder
  goes home mid-session and the room is locked out of its own courts, and a shared
  secret in a walk-in space is known to everyone by the second week anyway.

## Consequences

The realistic threat is fat fingers, not malice — nobody grieves a badminton queue,
but people absolutely tap the wrong court. That is handled with confirmation
dialogs on the two irreversible actions (End game, Clear board), not with
permissions.

Combined with ADR-0002, obscurity is the entire access-control story, and per
ADR-0003 the six Postgres functions are the entire write surface it exposes.
