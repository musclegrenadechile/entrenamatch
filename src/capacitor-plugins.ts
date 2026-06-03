// This file contains static imports for Capacitor native plugins.
// It is ONLY loaded in CAPACITOR builds (via dynamic import with variable specifier).
// In pure web builds (Firebase Hosting, GH Pages, dev), this module is never
// part of the bundle graph, so Vite/Rolldown never sees these imports and
// never tries to resolve the @capacitor/* packages → no "failed to resolve" errors.

import { Camera } from '@capacitor/camera'
import { PushNotifications } from '@capacitor/push-notifications'

export { Camera, PushNotifications }
