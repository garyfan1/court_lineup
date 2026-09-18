# One global board, no rooms

There is exactly one board in the world, at one URL, with three hardcoded courts and
one queue. There is no concept of a room, venue, or session to create or join.

The alternative was room codes ("BADMINTON-TUE"), which would let several halls share
a deployment. It was rejected because it forces a first-run screen onto every user on
every visit — what room am I in, did I type the code right, why is this board empty —
which is a login system wearing a hat, and this product's defining constraint is that
there is no login. "Three courts" is a fact about one specific hall, not a setting.

## Consequences

- A second hall cannot use this deployment; they deploy their own copy. Retrofitting
  rooms later means every group and court grows a room ID and the URL structure
  changes, so this is the most expensive decision here to reverse.
- Anyone with the URL is on the board and, per ADR-0001, can end games on it.

  This was first written as "the unguessable URL is the whole security model". That
  is false, and the correction matters. A pure-frontend app ships its Supabase URL
  and publishable key in the JavaScript bundle, so anyone who reaches the site can
  call the API without it. The board is not protected by being hard to address; it
  is protected by being uninteresting, and by ADR-0003 limiting `anon` to `select`
  plus six invariant-preserving functions. The worst a stranger can do is what any
  person in the hall can already do, and the recovery procedure is retyping names.

  Accepted deliberately. Mitigations are blast-radius caps, not access control:
  `noindex` and a `robots.txt` so the board is reachable but not discoverable, and
  a ceiling in `create_group` refusing to insert past ~50 groups. Supabase
  anonymous sign-ins would give each browser a JWT and allow per-device rate
  limiting without a login screen; rejected as auth infrastructure defending
  against an adversary with no motive.
