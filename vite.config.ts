import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages: /entrenamatch/
  // Capacitor / native Android APK: relative '' so assets load inside WebView
  base: process.env.CAPACITOR ? '' : '/entrenamatch/',
})
