/** One-time GPS reminder when opening the map tab (fase 193 / 108). */
const MAP_GPS_PROMPT_KEY = 'entrenamatch_map_gps_prompt_v1'

export function shouldShowMapGpsPrompt(opts?: { sharesLocation?: boolean }): boolean {
  if (opts?.sharesLocation === false) return false
  try {
    return localStorage.getItem(MAP_GPS_PROMPT_KEY) !== '1'
  } catch {
    return opts?.sharesLocation !== false
  }
}

export function markMapGpsPromptShown(): void {
  try {
    localStorage.setItem(MAP_GPS_PROMPT_KEY, '1')
  } catch {
    /* ignore quota */
  }
}

/** Call after user grants or denies the browser location prompt. */
export function markMapGpsPromptResolved(): void {
  markMapGpsPromptShown()
}
