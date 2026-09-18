import { Box } from '@mui/material'

/**
 * The app's mark: a badminton court with its net, drawn in two divs. No image, no
 * icon font, no network request — it paints with the first frame.
 */
export function CourtMark() {
  return (
    <Box
      aria-hidden
      sx={{
        width: 30,
        height: 30,
        flexShrink: 0,
        borderRadius: 2,
        bgcolor: 'primary.main',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box
        sx={{
          width: 13,
          height: 17,
          borderRadius: '2px',
          border: '1.5px solid',
          borderColor: 'primary.contrastText',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: -3,
            right: -3,
            top: '50%',
            borderTop: '1.5px solid',
            borderColor: 'primary.contrastText',
          },
        }}
      />
    </Box>
  )
}
