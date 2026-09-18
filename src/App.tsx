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
import { GroupCard } from './components/GroupCard'
import { NameDialog } from './components/NameDialog'
import { ConfirmDialog } from './components/ConfirmDialog'
import { useBoard } from './useBoard'

type NamePrompt = { mode: 'create' } | { mode: 'join'; groupId: string }
type Confirmation = { kind: 'end'; court: number } | { kind: 'clear' }

export function App() {
  const board = useBoard()
  const [prompt, setPrompt] = useState<NamePrompt | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)

  // One global lock. Disconnected counts as locked: showing nothing is preferred
  // to showing stale state, and acting on stale state is worse than both.
  const locked = board.busy || !board.connected

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar variant="dense">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Court Lineup
          </Typography>
          <Box
            role="status"
            aria-label={board.connected ? 'Connected' : 'Reconnecting'}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: board.connected ? 'success.main' : 'warning.main',
            }}
          />
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
              <Stack spacing={1}>
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
                <Typography variant="overline" color="text.secondary">
                  Queue{board.queue.length > 0 ? ` (${board.queue.length})` : ''}
                </Typography>
                {!board.anyCourtFree && board.queue.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    All three courts are in use.
                  </Typography>
                )}
              </Box>

              {board.queue.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed' }}>
                  <Typography color="text.secondary">Nobody waiting.</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add your name below to start a group.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={1}>
                  {board.queue.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      disabled={locked}
                      canPlay={board.anyCourtFree}
                      onJoin={() => setPrompt({ mode: 'join', groupId: group.id })}
                      onRemove={(index, name) => void board.leaveGroup(group.id, index, name)}
                      onPlayNow={() => void board.playNow(group.id)}
                    />
                  ))}
                </Stack>
              )}

              {/* Deliberately far from anything anyone taps often. */}
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <Button
                  size="small"
                  disabled={locked}
                  onClick={() => setConfirmation({ kind: 'clear' })}
                  sx={{ color: 'text.disabled' }}
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
        elevation={3}
        sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: (t) => t.zIndex.appBar }}
      >
        <Container
          maxWidth="sm"
          sx={{ pt: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))' }}
        >
          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={locked}
            onClick={() => setPrompt({ mode: 'create' })}
          >
            Add my name
          </Button>
        </Container>
      </Paper>

      <NameDialog
        open={prompt !== null}
        title={prompt?.mode === 'join' ? 'Join this group' : 'Add my name'}
        submitLabel={prompt?.mode === 'join' ? 'Join' : 'Add'}
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
