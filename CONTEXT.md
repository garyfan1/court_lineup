# Court Lineup

A shared, realtime board for a badminton hall with three courts. Players put their
names down, form groups, wait in one queue, and get placed onto a court when one
frees up. No accounts — a name typed in is the whole identity.

## Language

**Board**:
The whole shared state of the hall — three courts plus the queue — as every person
sees it. There is exactly one board, and it is the same for everyone. A board that
disagrees with the room is the system's central failure.
_Avoid_: Screen, dashboard, session, room

**Court**:
One of the three physical playing areas. Courts are interchangeable — a group does
not queue for a specific court.
_Avoid_: Table, lane, pitch

**Group**:
One to four players who intend to play together. The unit that queues and the unit
that is placed on a court. A group always has at least one member — creating a group
is the act of entering your own name as its first member — and it ceases to exist
when its last member leaves.
_Avoid_: Team, party, foursome

**Open Group**:
A group in the queue with fewer than four members, which anyone may join. Queuing
alone is not a distinct act: it produces an open group of one.
_Avoid_: Partial group, incomplete group, solo

**Slot**:
One of the four positions on an occupied court. A court in use always shows four
slots, however many players the placed group had.
_Avoid_: Seat, spot, position

**Placeholder**:
A slot with no player in it, displayed as "x". Only full groups are placed now, so
no new placeholder can arise; the board still renders them so that a court placed
under the older any-size rule is displayed honestly rather than silently truncated.
_Avoid_: Empty slot, blank, ghost

**Placement**:
Moving the Next Up group out of the queue and onto an empty court. A placement is also the
start of play — there is no separate "start the game" step, and a court is therefore
either empty or in use.
_Avoid_: Assignment, allocation, calling up, starting

**Queue**:
The single list of groups waiting for a court. There is exactly one queue for the
whole hall, not one per court. Its order is arrival order, and it confers priority:
only the Next Up group may take a free court.
_Avoid_: Lineup, waitlist, line

**Next Up**:
The one group entitled to the next free court: the earliest-arriving group in the
queue that has all four players. A group of fewer than four is not in the running
and does not block the groups behind it, so a half-full group at the head of the
queue holds nobody up. There is at most one Next Up group, and when there is none
a free court simply stays empty.
_Avoid_: First in line, head of queue, priority group
