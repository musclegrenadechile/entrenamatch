import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages: /entrenamatch/
  // Capacitor / native Android APK: relative '' so assets load inside WebView
  base: process.env.CAPACITOR ? '' : '/entrenamatch/',

  define: {
    // Build-time constant so we can conditional the import strategy:
    // - In CAPACITOR builds: normal dynamic import (Vite resolves + bundles the plugin code)
    // - In web builds (Firebase/GH Pages): @vite-ignore dynamic import (no build-time resolve, no native code in bundle)
    __CAPACITOR_BUILD__: JSON.stringify(!!process.env.CAPACITOR),
  },

  // Force Vite to resolve and pre-bundle the Capacitor native plugins in both builds.
  // This fixes "Rolldown failed to resolve import" for @capacitor/push-notifications
  // (and camera) in the CI for CAPACITOR=1 (APK) and web builds.
  optimizeDeps: {
    include: ['@capacitor/camera', '@capacitor/push-notifications'],
  },
})
