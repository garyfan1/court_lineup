import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this from https://<user>.github.io/court_lineup/, so built
  // asset URLs need that prefix. Dev stays at the root so localhost is normal.
  base: command === 'build' ? '/court_lineup/' : '/',
  plugins: [react()],
}))
