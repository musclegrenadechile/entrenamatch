/** Capacitor APK/AAB — loads real native plugins into window.__CAPACITOR_PLUGINS__. */
export function loadCapacitorPlugins(): Promise<void> {
  return import('./capacitor-plugins.ts').then(() => undefined)
}
