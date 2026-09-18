import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { rememberName, rememberedName } from '../rememberedName'

type Props = {
  open: boolean
  title: string
  submitLabel: string
  onSubmit: (name: string) => void
  onClose: () => void
}

export function NameDialog({ open, title, submitLabel, onSubmit, onClose }: Props) {
  const [name, setName] = useState('')
  const [wasOpen, setWasOpen] = useState(false)

  // Adjusting state during render when a prop changes -- cheaper and less surprising
  // than an effect, which would render the box empty for a frame before filling it.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setName(rememberedName())
  }

  const trimmed = name.trim()

  const submit = () => {
    if (!trimmed) return
    rememberName(trimmed)
    onSubmit(trimmed)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Name"
          value={name}
          slotProps={{ htmlInput: { maxLength: 24, autoCapitalize: 'words' } }}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!trimmed} onClick={submit}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
