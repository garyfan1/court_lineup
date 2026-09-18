import { useState } from 'react'
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { CourtCard } from './components/CourtCard'
import { CourtMark } from './components/CourtMark'
import { GroupCard } from './components/GroupCard'
import { NameDialog } from './components/NameDialog'
import { ConfirmDialog } from './components/ConfirmDialog'
import { useBoard } from './useBoard'
import { courtTint } from './theme'

type NamePrompt = { mode: 'create' } | { mode: 'join'; groupId: string }
type Confirmation = { kind: 'end'; court: number } | { kind: 'clear' }

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="overline" color="text.secondary" sx={{ display: 'block' }}>
      {children}
    </Typography>
  )
}

export function App() {
  const board = useBoard()
  const [prompt, setPrompt] = useState<NamePrompt | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)

  // One global lock. Disconnected counts as locked: showing nothing is preferred
  // to showing stale state, and acting on stale state is worse than both.
  const locked = board.busy || !board.connected

  // At most one line under the queue heading: the queue is competing for the fold
  // with three court cards, and the next-up card says it the rest of the time.
  const queueNote = !board.anyCourtFree
    ? 'All three courts are in use.'
    : board.nextUpId === null
      ? 'A court is free. The first group of four to fill up takes it.'
      : null

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar variant="dense" sx={{ gap: 1.25 }}>
          <CourtMark />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Court Lineup
          </Typography>
          <Box
            role="status"
            aria-label={board.connected ? 'Connected' : 'Reconnecting'}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: board.connected ? 'primary.main' : 'warning.main',
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, letterSpacing: '0.06em' }}
            >
              {board.connected ? 'Live' : 'Offline'}
            </Typography>
          </Box>
        </Toolbar>
        <LinearProgress sx={{ height: 2, visibility: board.busy ? 'visible' : 'hidden' }} />
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 2, pb: 14 }}>
        <Stack spacing={2}>
          {/* Outside the loading branch on purpose: an unreachable board must say so
              rather than spin forever. */}
          {!board.connected && (
            <Alert severity="warning">
              Reconnecting. The board is frozen until it is back, so you are never looking at
              stale names.
            </Alert>
          )}

          {!board.loaded ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                opacity: board.connected ? 1 : 0.4,
                pointerEvents: board.connected ? 'auto' : 'none',
                transition: 'opacity 150ms',
              }}
            >
              <SectionLabel>Courts</SectionLabel>
              <Stack spacing={1} sx={{ mt: 0.5 }}>
                {board.courts.map((court) => (
                  <CourtCard
                    key={court.number}
                    number={court.number}
                    group={court.group}
                    disabled={locked}
                    onEndGame={() => setConfirmation({ kind: 'end', court: court.number })}
                  />
                ))}
              </Stack>

              <Box sx={{ mt: 3, mb: 1 }}>
                <SectionLabel>
                  Queue{board.queue.length > 0 ? ` · ${board.queue.length}` : ''}
                </SectionLabel>
                {board.queue.length > 0 && queueNote && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {queueNote}
                  </Typography>
                )}
              </Box>

              {board.queue.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderStyle: 'dashed',
                    bgcolor: courtTint(0.04),
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>Nobody waiting</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Tap <strong>Start a group</strong> below and put your name down. A court
                    opens up once four names are together.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={1}>
                  {board.queue.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      disabled={locked}
                      nextUp={group.id === board.nextUpId}
                      courtFree={board.anyCourtFree}
                      onJoin={() => setPrompt({ mode: 'join', groupId: group.id })}
                      onRemove={(index, name) => void board.leaveGroup(group.id, index, name)}
                      onPlayNow={() => void board.playNow(group.id)}
                    />
                  ))}
                </Stack>
              )}

              {/* Deliberately far from anything anyone taps often. */}
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 5 }}>
                <Button
                  size="small"
                  disabled={locked}
                  onClick={() => setConfirmation({ kind: 'clear' })}
                  sx={{ color: 'text.disabled', fontWeight: 500 }}
                >
                  Clear board
                </Button>
              </Box>
            </Box>
          )}
        </Stack>
      </Container>

      <Paper
        square
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (t) => t.zIndex.appBar,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth="sm" sx={{ pt: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))' }}>
          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={locked}
            onClick={() => setPrompt({ mode: 'create' })}
          >
            Start a group
          </Button>
        </Container>
      </Paper>

      <NameDialog
        open={prompt !== null}
        title={prompt?.mode === 'join' ? 'Join this group' : 'Start a group'}
        submitLabel={prompt?.mode === 'join' ? 'Join' : 'Start'}
        onClose={() => setPrompt(null)}
        onSubmit={(name) => {
          if (prompt?.mode === 'join') void board.joinGroup(prompt.groupId, name)
          else void board.createGroup(name)
        }}
      />

      <ConfirmDialog
        open={confirmation !== null}
        title={confirmation?.kind === 'clear' ? 'Clear the whole board?' : 'End this game?'}
        body={
          confirmation?.kind === 'clear'
            ? 'Every court and everyone waiting will be removed. Names have to be typed in again.'
            : 'Everyone on this court will be removed. Nobody is put back in the queue.'
        }
        confirmLabel={confirmation?.kind === 'clear' ? 'Clear board' : 'End game'}
        onClose={() => setConfirmation(null)}
        onConfirm={() => {
          if (confirmation?.kind === 'clear') void board.clearBoard()
          else if (confirmation) void board.endGame(confirmation.court)
        }}
      />

      {/* The board simply shows the truth; nothing animates backwards. */}
      <Snackbar
        open={board.message !== null}
        autoHideDuration={4000}
        onClose={board.dismissMessage}
        message={board.message ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 9 }}
      />
    </>
  )
}
