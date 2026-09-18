import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'

type Props = {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}

/** Only End game and Clear board get one. The threat is fat fingers, not malice. */
export function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{body}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
