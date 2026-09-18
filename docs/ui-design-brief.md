# Court Lineup — UI design brief

Design the UI for **Court Lineup**, a shared realtime board for a badminton hall
with three courts. Deliver it as React + TypeScript + MUI v7 components with mock
data. No backend calls — every component takes props. Design **all** states, not
just the happy one.

## What it is

One web page, one URL, no accounts. People in a hall open it on their phones, type
their name to form or join a group of up to four, and a group takes a court when one
is free. Everyone sees the same board; it updates live.

## Screen contents, top to bottom

1. A minimal header: the title, and a connection indicator.
2. **Three court cards.** A court is `EMPTY` or `IN USE` — there is no other state.
   - *Empty*: the court number and "Empty".
   - *In use*: the court number, exactly four **slots**, and an **End game** button.
     A slot holds either a name or a placeholder rendered as `x`. A group of two on
     court shows two names and two `x`.
3. **The queue** — a vertical list of waiting groups in arrival order.
   - A group holds 1–4 names. Each name has a small remove control.
   - A group with fewer than four members is an **open group**: the whole card is
     tappable to join, and this must be obvious at a glance.
   - Exactly one group — the **next up** group — carries a **Play now** button. It
     is the earliest group in arrival order that has all four names. No other card
     has the button at all, disabled or otherwise.
4. A **sticky bottom bar** with the primary action: **Add my name**.
5. **Clear board** — present, but deliberately hard to hit by accident. Never
   adjacent to a frequent action.

## Interactions

| Action | Behaviour |
| --- | --- |
| **Add my name** | Dialog with one text field, pre-filled with the last name this browser used, fully editable → creates a new group containing that one name |
| **Tap an open group** | Same dialog → the name joins that group |
| **Remove a queued name** | Immediate, no confirmation. If it was the last name, the group disappears |
| **Play now** | Only on the next up group. It leaves the queue and lands on the lowest-numbered empty court. Disabled (not hidden) when all three courts are in use |
| **End game** | Confirmation dialog → the court empties, names are gone |
| **Clear board** | Confirmation dialog → everything is wiped |

Only **End game** and **Clear board** get confirmations. Nothing else does.

## Rules the design must obey

- **A group on a court is frozen.** Names cannot be removed, nobody can join, and
  the `x` placeholders are **not** tappable. A latecomer cannot take an `x`.
- **Queue position confers priority, but only among full groups.** The next up
  group is the earliest group of four; it alone may take a free court. A group of
  fewer than four is not in the running and does **not** block the groups behind
  it. So: the next up group is visually marked, and nothing else is — no reordering
  handles, no position numbers, no per-group countdowns.
- **A free court with no full group stays empty.** This is not an error state and
  must not be dramatised. The queue says so once, quietly, in one line.
- **Nobody picks a court.** There is no court selector anywhere.
- **No login, no avatars, no identity.** Anyone can remove anyone's name, end any
  game, clear the board. There are no owned or highlighted "my" items.
- **Duplicate names are expected.** Two people called Gary is normal.
- **No timestamps anywhere.** No "waiting 12m", no "playing since". Deliberate.

## States to design

- **First person of the evening** — three empty courts, empty queue. Should look
  inviting, not broken.
- **Busy night** — three courts in use, five groups queued.
- **Underfull court** — two real names and two `x`.
- **Mid-action** — a write is in flight. Every interactive control on the page is
  disabled at once (one global busy state, not per-button), with something showing
  work is happening.
- **Your action lost a race** — a brief snackbar, e.g. "Court 2 was taken." The
  board simply shows the truth; nothing animates backwards.
- **Disconnected** — the whole board greyed out, every control disabled, with a
  clear message. Showing nothing is preferred to showing stale state.

## Constraints

- **Mobile first**, designed at ~375px. The desktop version is the identical single
  column, centred, with side padding — MUI's `<Container maxWidth="sm">`. Do not
  design a separate wide layout.
- **One hue.** Green is the court, the brand, and every "you can act" signal — a
  free court, the next up group, the primary button. Red is destructive and nothing
  else. Everything else is neutral. A second accent colour is not available: two
  colours is what makes the board answerable at a glance from across the hall.
- **Nothing loads from the network.** No webfonts, no icon fonts, no images. The
  type is a system stack, the app mark and the court are drawn in CSS. Hall wifi is
  bad and the board must paint with the first frame.
- **Custom theme in `src/theme.ts`. Light only** — no dark scheme, and a phone in
  dark mode still gets the light board. It is read in a bright hall, and one scheme
  is one set of surfaces to check every court tint against. Component styling stays
  in `sx`; the theme holds palette, type, shape and MUI defaults only.
- **Court markings are decoration.** The in-use court card is drawn as a court —
  tinted surface, boundary line, a dashed net between the two rows of names. It must
  never imply state the system does not hold: no sides, no serve, no score.
- **Touch targets no smaller than 44px.** People tap this one-handed, standing up,
  sometimes holding a racket.
- The board should be readable without scrolling on a typical phone when the queue
  is short, and the primary action must stay thumb-reachable when it is long.

## The one thing that matters most

The board's job is to agree with the room. A screen showing a court as free while
four people are on it is the system's central failure. Favour clarity and
unambiguity over density, cleverness or decoration everywhere they conflict.

## Left open on purpose

- Where **Clear board** lives.
- How an open group signals "tap me to join" without looking like a button inside a
  card that is itself tappable.
