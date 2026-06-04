import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.entrenamatch.app',
  appName: 'EntrenaMatch',
  webDir: 'dist',
  android: {
    // Enable remote WebView debugging (chrome://inspect) even for release builds.
    // Very useful for seeing JS console errors, React crashes (#310 etc.), network, etc. in real time
    // while testing the APK on a real device connected via USB.
    // Only works when USB Debugging is enabled on the device.
    // For production final release you can set to false.
    webContentsDebuggingEnabled: true
  }
};

export default config;
