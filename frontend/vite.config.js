import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite should NOT look for main.jsx. We use index.js.
export default defineConfig({
  plugins: [react()],
})
