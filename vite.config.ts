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
})
