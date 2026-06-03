import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages: /entrenamatch/
  // Capacitor / native Android APK: relative '' so assets load inside WebView
  base: process.env.CAPACITOR ? '' : '/entrenamatch/',

  // The Capacitor plugins are now statically imported.
  // We include them in optimizeDeps to ensure reliable resolution in all CI builds
  // (prevents any transient "failed to resolve" issues with Rolldown in the APK workflow).
  optimizeDeps: {
    include: ['@capacitor/camera', '@capacitor/push-notifications'],
  },
})
