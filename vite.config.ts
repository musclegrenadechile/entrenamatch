import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Force correct subpath for GitHub Pages deployment under /entrenamatch/
  base: process.env.GITHUB_PAGES === 'true' ? '/entrenamatch/' : '/entrenamatch/',
})
