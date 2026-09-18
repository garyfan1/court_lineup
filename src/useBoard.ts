import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import { COURTS, type Group } from './types'

const DEBOUNCE_MS = 100
const SLOW_WRITE_MS = 5000

/**
 * The whole client state.
 *
 * Local state is only ever a whole snapshot the server just handed over: the
 * realtime callback deliberately ignores its payload and refetches instead, so
 * there is no mechanism by which the client's opinion could survive a disagreement.
 * See docs/adr/0004-the-client-never-patches-state.md.
 */
export function useBoard() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loaded, setLoaded] = useState(false)
  const [connected, setConnected] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const seq = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const busyRef = useRef(false)

  const fetchBoard = useCallback(async () => {
    const mine = ++seq.current
    const { data, error } = await supabase.from('groups').select('*').order('created_at')
    if (mine !== seq.current) return // a newer fetch has started; this answer is stale
    if (error) return
    setGroups((data ?? []) as Group[])
    setLoaded(true)
  }, [])

  // Trailing debounce: clear_board deletes several rows and fires an event for each.
  const scheduleFetch = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(fetchBoard, DEBOUNCE_MS)
  }, [fetchBoard])

  useEffect(() => {
    const channel = supabase
      .channel('board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () =>
        scheduleFetch(),
      )
      .subscribe((status) => {
        const ok = status === 'SUBSCRIBED'
        setConnected(ok)
        if (!ok) return

        void fetchBoard() // resubscribing is also how we recover missed events

        // SUBSCRIBED arrives slightly BEFORE the server has finished registering the
        // postgres_changes filter -- measured at 1-2s against a live project -- so a
        // change made inside that window is never delivered to us at all. Without this
        // second pass the board could sit stale until the next unrelated event.
        clearTimeout(settle.current)
        settle.current = setTimeout(fetchBoard, 3000)
      })

    // A backgrounded tab misses events silently; coming back is a refetch trigger.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void fetchBoard()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      clearTimeout(timer.current)
      clearTimeout(settle.current)
      void supabase.removeChannel(channel)
    }
  }, [fetchBoard, scheduleFetch])

  /**
   * One global lock rather than per-button state: writes are short and rare, and it
   * kills the whole class of "I tapped Join and Play now in the same 200ms".
   */
  const run = useCallback(
    async (call: () => PromiseLike<{ error: { message: string } | null }>) => {
      if (busyRef.current) return
      busyRef.current = true
      setBusy(true)

      let settled = false
      const release = () => {
        settled = true
        busyRef.current = false
        setBusy(false)
      }
      const slow = setTimeout(() => {
        if (settled) return
        release()
        setMessage('That is taking a while — try again')
      }, SLOW_WRITE_MS)

      try {
        const { error } = await call()
        if (settled) return // the slow-write timeout already spoke; ignore the late answer
        clearTimeout(slow)
        release()
        // Every function raises with a message written for a person on a court.
        if (error) setMessage(error.message)
      } catch {
        if (settled) return
        clearTimeout(slow)
        release()
        setMessage('Could not reach the board')
      }
    },
    [],
  )

  const actions = {
    createGroup: (name: string) => run(() => supabase.rpc('create_group', { p_name: name })),
    joinGroup: (groupId: string, name: string) =>
      run(() => supabase.rpc('join_group', { p_group_id: groupId, p_name: name })),
    // SQL arrays are 1-based, and the expected name guards against a shifted index.
    leaveGroup: (groupId: string, index: number, name: string) =>
      run(() =>
        supabase.rpc('leave_group', {
          p_group_id: groupId,
          p_index: index,
          p_expected_name: name,
        }),
      ),
    playNow: (groupId: string) => run(() => supabase.rpc('play_now', { p_group_id: groupId })),
    endGame: (court: number) => run(() => supabase.rpc('end_game', { p_court_id: court })),
    clearBoard: () => run(() => supabase.rpc('clear_board')),
  }

  const courts = COURTS.map((n) => ({
    number: n,
    group: groups.find((g) => g.court_id === n) ?? null,
  }))
  const queue = groups.filter((g) => g.court_id === null)

  return {
    courts,
    queue,
    loaded,
    connected,
    busy,
    message,
    dismissMessage: () => setMessage(null),
    anyCourtFree: courts.some((c) => c.group === null),
    ...actions,
  }
}
