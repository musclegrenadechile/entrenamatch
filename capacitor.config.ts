import type { CapacitorConfig } from '@capacitor/cli';

const isDevBuild = process.env.CAP_DEV === '1' || process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'com.entrenamatch.app',
  appName: 'EntrenaMatch',
  webDir: 'dist',
  server: {
    // Spotify OAuth requires https redirect — http://localhost is rejected as "Insecure".
    androidScheme: 'https',
    iosScheme: 'https',
  },
  android: {
    // USB WebView debugging only for local dev (CAP_DEV=1). Off for Play Store builds.
    webContentsDebuggingEnabled: isDevBuild,
  },
  ios: {
    // Match Android: https scheme for OAuth / secure context in WKWebView.
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
  },
  plugins: {
    FirebaseAuthentication: {
      providers: ['google.com'],
    },
  },
};

export default config;
