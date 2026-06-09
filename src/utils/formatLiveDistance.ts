/** Label for live-athlete distance rows — never returns "— km". */
export function formatLiveDistanceKm(distance?: number | null): string | null {
  if (typeof distance !== 'number' || !Number.isFinite(distance) || distance < 0 || distance >= 900) {
    return null
  }
  if (distance < 0.05) return 'cerca'
  return `${distance.toFixed(1)} km`
}
