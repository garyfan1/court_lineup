import { Box, Button, Chip, Paper, Typography } from '@mui/material'
import type { Group } from '../types'

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
        ...(nextUp && { borderWidth: 2, borderColor: 'primary.main' }),
      }}
    >
      {nextUp && (
        <Typography
          variant="overline"
          color="primary"
          sx={{ display: 'block', lineHeight: 1.6, mb: 0.25 }}
        >
          Next up
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: nextUp ? 1 : 0 }}>
        {group.players.map((name, i) => (
          // Anyone may remove anyone (ADR-0001). No confirmation: retyping is cheap.
          <Chip
            key={i}
            label={name}
            onDelete={disabled ? undefined : () => onRemove(i + 1, name)}
          />
        ))}
        {Array.from({ length: free }, (_, i) => (
          <Chip
            key={'free' + i}
            label="+ Join"
            variant="outlined"
            clickable
            disabled={disabled}
            onClick={onJoin}
            sx={{ borderStyle: 'dashed' }}
          />
        ))}
      </Box>

      {nextUp && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
          {!courtFree && (
            <Typography variant="caption" color="text.secondary">
              Waiting for a court
            </Typography>
          )}
          <Button
            size="small"
            variant="contained"
            disabled={disabled || !courtFree}
            onClick={onPlayNow}
          >
            Play now
          </Button>
        </Box>
      )}
    </Paper>
  )
}
