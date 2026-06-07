import type { CapacitorConfig } from '@capacitor/cli';

const isDevBuild = process.env.CAP_DEV === '1' || process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'com.entrenamatch.app',
  appName: 'EntrenaMatch',
  webDir: 'dist',
  android: {
    // USB WebView debugging only for local dev (CAP_DEV=1). Off for Play Store builds.
    webContentsDebuggingEnabled: isDevBuild,
  },
};

export default config;
