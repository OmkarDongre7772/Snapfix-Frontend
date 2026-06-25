import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,        // auto-opens browser on start
    strictPort: false, // fall back to next free port if 5173 is busy
  },
})
