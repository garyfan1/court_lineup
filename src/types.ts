/** A group: 1-4 players. `court_id === null` means it is in the queue. */
export type Group = {
  id: string
  players: string[]
  court_id: number | null
  created_at: string
}

export const COURTS = [1, 2, 3] as const

/** A court in use always shows four slots, however many players the group had. */
export type Slot = { name: string; index: number } | null

export function slotsOf(group: Group): Slot[] {
  return Array.from({ length: 4 }, (_, i) =>
    i < group.players.length ? { name: group.players[i], index: i + 1 } : null,
  )
}
