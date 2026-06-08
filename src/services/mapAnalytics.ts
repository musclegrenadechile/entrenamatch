/**
 * GymPulse map analytics (fase 120).
 * Events: map_open, cluster_expand, partner_checkin
 */

import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'

export type MapAnalyticsEvent = 'map_open' | 'cluster_expand' | 'partner_checkin'

export function logMapEvent(
  name: MapAnalyticsEvent,
  params?: Record<string, string | number | boolean>
): void {
  try {
    if (!analytics) return
    logEvent(analytics, name, params)
  } catch {
    /* analytics optional on web/capacitor */
  }
}
