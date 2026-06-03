import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages: /entrenamatch/
  // Capacitor / native Android APK: relative '' so assets load inside WebView
  base: process.env.CAPACITOR ? '' : '/entrenamatch/',

  define: {
    // Used by App.tsx and OnboardingFlow to decide whether to load the capacitor-plugins module.
    __CAPACITOR_BUILD__: JSON.stringify(!!process.env.CAPACITOR),
  },

  // Force Vite to know about the Capacitor plugins and the loader module.
  // This helps both dev and the production CAPACITOR build to properly resolve/bundle them.
  optimizeDeps: {
    include: [
      '@capacitor/camera',
      '@capacitor/push-notifications',
      // the loader is only for cap builds but including it doesn't hurt
      './src/capacitor-plugins',
    ],
  },
})
