import { Box, Button, Chip, Paper, Typography } from '@mui/material'
import type { Group } from '../types'
import { courtTint } from '../theme'

type Props = {
  group: Group
  disabled: boolean
  /** This is the one group entitled to a court: full, and earliest of the full ones. */
  nextUp: boolean
  courtFree: boolean
  onJoin: () => void
  onRemove: (index: number, name: string) => void
  onPlayNow: () => void
}

/**
 * The free slots of an open group ARE the join affordance — a dashed "+ Join" chip
 * you tap. That keeps the remove buttons from being nested click targets inside a
 * wholly-tappable card, and says "there is room here" without a label explaining it.
 *
 * Only the next-up group carries a "Play now" button at all. A disabled button on
 * every other card would be four ways of saying "not you" and would make every card
 * taller; the queue is the explanation, so the cards stay quiet.
 */
export function GroupCard({
  group,
  disabled,
  nextUp,
  courtFree,
  onJoin,
  onRemove,
  onPlayNow,
}: Props) {
  const free = 4 - group.players.length

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        ...(nextUp && {
          borderWidth: 2,
          borderColor: 'primary.main',
          bgcolor: courtTint(0.06),
        }),
      }}
    >
      {nextUp && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box
            sx={{
              px: 1.25,
              py: 0.25,
              borderRadius: 99,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
            }}
          >
            NEXT UP
          </Box>
          {!courtFree && (
            <Typography variant="caption" color="text.secondary">
              waiting for a court
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: nextUp ? 1.25 : 0 }}>
        {group.players.map((name, i) => (
          // Anyone may remove anyone (ADR-0001). No confirmation: retyping is cheap.
          <Chip
            key={i}
            label={name}
            onDelete={disabled ? undefined : () => onRemove(i + 1, name)}
            sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
          />
        ))}
        {Array.from({ length: free }, (_, i) => (
          <Chip
            key={'free' + i}
            label="+ Join"
            variant="outlined"
            color="primary"
            clickable
            disabled={disabled}
            onClick={onJoin}
            sx={{ borderStyle: 'dashed', fontWeight: 700 }}
          />
        ))}
      </Box>

      {nextUp && (
        <Button
          fullWidth
          variant="contained"
          disabled={disabled || !courtFree}
          onClick={onPlayNow}
        >
          Play now
        </Button>
      )}
    </Paper>
  )
}
