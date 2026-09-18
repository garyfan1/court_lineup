import { Box, Button, Paper, Typography } from '@mui/material'
import { slotsOf, type Group } from '../types'

type Props = {
  number: number
  group: Group | null
  disabled: boolean
  onEndGame: () => void
}

/**
 * An empty court is deliberately NOT the same shape as a court in use. Four empty
 * slots is a court in use with four placeholders, which is a different thing and
 * must never look similar. The compact row also makes "a court is free" legible
 * from peripheral vision, which is the single most important fact on the board.
 */
export function CourtCard({ number, group, disabled, onEndGame }: Props) {
  if (!group) {
    return (
      <Paper
        variant="outlined"
        sx={{
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 2,
          borderColor: 'success.main',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Court {number}
        </Typography>
        <Typography variant="subtitle1" color="success.main" sx={{ fontWeight: 600 }}>
          Empty
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper variant="outlined" sx={{ p: 1.25 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Court {number}
        </Typography>
        <Button size="small" color="error" disabled={disabled} onClick={onEndGame}>
          End game
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
        {slotsOf(group).map((slot, i) => (
          <Box
            key={i}
            sx={{
              height: 36,
              px: 1,
              borderRadius: 1,
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {slot ? (
              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                {slot.name}
              </Typography>
            ) : (
              // A placeholder is never tappable: a latecomer cannot take an "x".
              <Typography variant="body2" color="text.disabled" aria-label="empty slot">
                &times;
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
