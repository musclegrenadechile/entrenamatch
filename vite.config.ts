import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages: /entrenamatch/
  // Capacitor / native Android APK: relative '' so assets load inside WebView
  base: process.env.CAPACITOR ? '' : '/entrenamatch/',

  define: {
    // Used to decide at build time whether to load the real loader or a dummy.
    __CAPACITOR_BUILD__: JSON.stringify(!!process.env.CAPACITOR),
    // Placeholder for dynamic import specifier of the loader module.
    // Replaced at build time so that web builds never see the real './capacitor-plugins' string
    // in an import() context, preventing analysis of its static @capacitor imports.
    CAPACITOR_PLUGINS_LOADER: JSON.stringify(
      process.env.CAPACITOR ? './capacitor-plugins.ts' : 'data:application/javascript,export default {};'
    ),
  },

  // Force Vite to know about the Capacitor plugins (for CAPACITOR builds).
  optimizeDeps: {
    include: ['@capacitor/camera', '@capacitor/push-notifications'],
  },

  build: {
    // Suppress the large chunk warning (the app is intentionally not code-split much for simplicity in pre-alpha).
    // The previous "Build failed" was always the resolve error, not this warning.
    chunkSizeWarningLimit: 2000,

    rollupOptions: {
      // In web builds (no CAPACITOR env), externalize the native Capacitor plugins.
      // This prevents the bundler from trying to resolve and bundle them (which can fail in CI
      // for pure web deploys). The usage is runtime-guarded anyway.
      // In CAPACITOR builds, we bundle them normally so the dynamic load works at runtime in the app.
      external: !process.env.CAPACITOR
        ? ['@capacitor/camera', '@capacitor/push-notifications']
        : [],
    },
  },
})
