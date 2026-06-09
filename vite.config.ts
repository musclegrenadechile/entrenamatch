import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: !process.env.CAPACITOR
      ? { '@capacitor/app': path.resolve(projectRoot, 'src/stubs/capacitor-app-stub.ts') }
      : undefined,
  },
  // Firebase Hosting (official): /
  // Capacitor / native Android APK: relative '' so assets load inside WebView
  base: process.env.CAPACITOR ? '' : '/',

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
    include: [
      '@capacitor/camera',
      '@capacitor/push-notifications',
      '@capacitor/share',
      '@capacitor/filesystem',
    ],
  },

  build: {
    chunkSizeWarningLimit: 2000,

    rollupOptions: {
      external: !process.env.CAPACITOR
        ? [
            '@capacitor/app',
            '@capacitor/camera',
            '@capacitor/push-notifications',
            '@capacitor/share',
            '@capacitor/filesystem',
          ]
        : [],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/leaflet')) return 'leaflet';
          if (id.includes('node_modules/firebase')) return 'firebase';
          if (id.includes('node_modules/framer-motion')) return 'motion';
        },
      },
    },
  },
})
