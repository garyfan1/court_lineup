import { Box, Button, Paper, Typography } from '@mui/material'
import { slotsOf, type Group } from '../types'
import { courtTint } from '../theme'

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
          borderColor: 'primary.main',
          bgcolor: courtTint(0.08),
        }}
      >
        <Typography variant="subtitle1">Court {number}</Typography>
        {/* A filled pill rather than coloured text: this is the one thing on the
            board that has to survive being glanced at from across the hall. */}
        <Box
          sx={{
            px: 1.5,
            py: 0.25,
            borderRadius: 99,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
          }}
        >
          FREE
        </Box>
      </Paper>
    )
  }

  return (
    <Paper variant="outlined" sx={{ p: 1 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 0.5,
          mb: 0.75,
        }}
      >
        <Typography variant="subtitle1">Court {number}</Typography>
        <Button size="small" color="error" disabled={disabled} onClick={onEndGame}>
          End game
        </Button>
      </Box>

      {/* The card is drawn as the court itself: a tinted surface inside a boundary
          line, with the net across the middle and two players either side of it.
          Decoration only — the system does not model sides, and nothing here can be
          tapped or rearranged. */}
      <Box
        sx={{
          position: 'relative',
          p: 0.75,
          borderRadius: 2,
          bgcolor: courtTint(0.07),
          border: '1px solid',
          borderColor: courtTint(0.25),
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 6,
            right: 6,
            top: '50%',
            borderTop: '2px dashed',
            borderColor: courtTint(0.35),
          }}
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: 0.75,
            rowGap: 1,
          }}
        >
          {slotsOf(group).map((slot, i) => (
            <Box
              key={i}
              sx={{
                position: 'relative',
                height: 32,
                px: 1,
                borderRadius: 1.5,
                bgcolor: slot ? 'background.paper' : 'transparent',
                border: slot ? 'none' : '1px dashed',
                borderColor: courtTint(0.3),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {slot ? (
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
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
      </Box>
    </Paper>
  )
}
