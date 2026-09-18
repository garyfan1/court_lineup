import { Box, Button, Chip, Paper } from '@mui/material'
import type { Group } from '../types'

type Props = {
  group: Group
  disabled: boolean
  canPlay: boolean
  onJoin: () => void
  onRemove: (index: number, name: string) => void
  onPlayNow: () => void
}

/**
 * The free slots of an open group ARE the join affordance — a dashed "+ Join" chip
 * you tap. That keeps the remove buttons from being nested click targets inside a
 * wholly-tappable card, and says "there is room here" without a label explaining it.
 */
export function GroupCard({ group, disabled, canPlay, onJoin, onRemove, onPlayNow }: Props) {
  const free = 4 - group.players.length

  return (
    <Paper variant="outlined" sx={{ p: 1.25 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {/* Any group may take any free court, however few of them there are. The
            missing players are filled with "x" on the court. */}
        <Button
          size="small"
          variant="contained"
          disabled={disabled || !canPlay}
          onClick={onPlayNow}
        >
          Play now
        </Button>
      </Box>
    </Paper>
  )
}
