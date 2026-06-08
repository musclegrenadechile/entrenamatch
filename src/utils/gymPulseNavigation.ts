/** Open native maps app (Google / Apple / Waze-friendly) for gym navigation — Fase 108. */
export function openMapsNavigation(
  lat: number,
  lng: number,
  label?: string
): void {
  const name = encodeURIComponent(label || 'Gym')
  const coords = `${lat},${lng}`
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const url = isIOS
    ? `maps://?daddr=${coords}&q=${name}`
    : `https://www.google.com/maps/dir/?api=1&destination=${coords}&destination_place_id=&travelmode=driving`
  window.open(url, '_blank', 'noopener,noreferrer')
}
