/** Fase 91 — restore last map view when offline / slow network. */

const KEY = 'entrenamatch_map_view_v1'

export type CachedMapView = {
  lat: number
  lng: number
  zoom: number
  savedAt: number
}

export function saveMapView(lat: number, lng: number, zoom: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(zoom)) return
  try {
    const payload: CachedMapView = { lat, lng, zoom, savedAt: Date.now() }
    localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* quota */
  }
}

export function loadMapView(maxAgeMs = 7 * 24 * 60 * 60 * 1000): CachedMapView | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as CachedMapView
    if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) return null
    if (Date.now() - (data.savedAt || 0) > maxAgeMs) return null
    return data
  } catch {
    return null
  }
}
