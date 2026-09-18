import { createTheme } from '@mui/material/styles'

/**
 * One hue, deliberately.
 *
 * Green is the court, the brand, and every "you can act" signal: a free court, the
 * next-up group, the primary button. Red is destructive and nothing else. Everything
 * remaining is neutral. Two colours means a glance at the board from ten metres away
 * answers "is there anything for me?" without anyone reading a word — which is the
 * only question the board exists to answer.
 *
 * Light only. The board is read in a bright hall, and a second scheme would double
 * the surfaces every court tint has to be checked against for one that nobody would
 * look at. `color-scheme: light` is declared so a phone in dark mode does not
 * repaint the form controls out from under us.
 *
 * Nothing is loaded from the network. A hall's wifi is bad and the board must paint
 * instantly, so the type is a system stack and the court is drawn in CSS.
 */
export const theme = createTheme({
  // Kept on with a single scheme so MUI still emits the `...Channel` tokens that
  // courtTint() below is built from.
  cssVariables: true,

  palette: {
    mode: 'light',
    primary: {
      main: '#0D6E5F',
      light: '#3E9D8B',
      dark: '#07503F',
      contrastText: '#FFFFFF',
    },
    error: { main: '#B3261E' },
    background: { default: '#F2F5F4', paper: '#FFFFFF' },
    text: { primary: '#131D1B', secondary: '#586D68' },
    divider: 'rgba(17, 45, 40, 0.14)',
  },

  shape: { borderRadius: 14 },

  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h6: { fontWeight: 800, letterSpacing: '-0.02em' },
    subtitle1: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle2: { fontWeight: 700 },
    overline: { fontWeight: 800, letterSpacing: '0.14em', fontSize: '0.7rem' },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
  },

  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10 },
        // 44px is the floor for a thumb on a phone held in one hand at the side of
        // a court. Nothing tappable is allowed below it.
        sizeSmall: { minHeight: 36, paddingLeft: 12, paddingRight: 12 },
        sizeMedium: { minHeight: 44 },
        sizeLarge: { minHeight: 52, fontSize: '1.0625rem' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 9, fontWeight: 600 },
        sizeMedium: { height: 34 },
      },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },
    MuiSnackbarContent: { styleOverrides: { root: { borderRadius: 12 } } },
  },
})

/**
 * A translucent wash of the brand green. MUI emits
 * `--mui-palette-primary-mainChannel`, so the brand colour is defined in exactly one
 * place and every tint follows it.
 */
export const courtTint = (alpha: number) =>
  `rgba(var(--mui-palette-primary-mainChannel) / ${alpha})`
