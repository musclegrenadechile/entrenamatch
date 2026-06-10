import { Capacitor } from '@capacitor/core'

/** True when running inside Capacitor APK/AAB (not mobile browser / PWA). */
export function isNativeCapacitorPlatform(): boolean {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}
