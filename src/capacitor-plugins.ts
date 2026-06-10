// @ts-nocheck
// This file contains static imports for Capacitor native plugins.
// It is ONLY loaded in CAPACITOR builds (via dynamic import with variable specifier).
// In pure web builds (Firebase Hosting, GH Pages, dev), this module is never
// part of the bundle graph, so Vite/Rolldown never sees these imports and
// never tries to resolve the @capacitor/* packages → no "failed to resolve" errors.
// We use @ts-nocheck because tsc -b type-checks all .ts files unconditionally
// (even if only imported dynamically in CAPACITOR builds), and these packages
// are native-only (may not have perfect types or be resolvable in all contexts).

import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { Camera } from '@capacitor/camera'
import { PushNotifications } from '@capacitor/push-notifications'
import { PlayIntegrity } from '@capacitor-community/play-integrity'
import { Geolocation } from '@capacitor/geolocation'
import { Share } from '@capacitor/share'
import { Filesystem } from '@capacitor/filesystem'

// Side-effect: make available via global so components can pick it up after dynamic load.
// This avoids direct export issues in conditional loading.
if (typeof window !== 'undefined') {
  (window as any).__CAPACITOR_PLUGINS__ = {
    App,
    Browser,
    Camera,
    PushNotifications,
    PlayIntegrity,
    Geolocation,
    Share,
    Filesystem,
  }
}

export { App, Browser, Camera, PushNotifications, PlayIntegrity, Geolocation, Share, Filesystem }
