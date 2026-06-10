import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@capacitor-plugins-loader': path.resolve(
        projectRoot,
        process.env.CAPACITOR
          ? 'src/capacitor-plugins-loader.native.ts'
          : 'src/capacitor-plugins-loader.web.ts'
      ),
      ...(!process.env.CAPACITOR
        ? {
            '@capacitor/app': path.resolve(projectRoot, 'src/stubs/capacitor-app-stub.ts'),
            '@capacitor/browser': path.resolve(projectRoot, 'src/stubs/capacitor-browser-stub.ts'),
          }
        : {}),
    },
  },
  // Firebase Hosting (official): /
  // Capacitor / native Android APK: relative '' so assets load inside WebView
  base: process.env.CAPACITOR ? '' : '/',

  // Force Vite to know about the Capacitor plugins (for CAPACITOR builds).
  optimizeDeps: {
    include: [
      '@capacitor/app',
      '@capacitor/browser',
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
            '@capacitor/browser',
            /* web build: stubs only; native bundles via capacitor-plugins.ts */
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
