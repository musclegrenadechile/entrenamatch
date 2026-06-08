/** One-time GPS reminder when opening the map tab (fase 193). */
const MAP_GPS_PROMPT_KEY = 'entrenamatch_map_gps_prompt_v1'

export function shouldShowMapGpsPrompt(): boolean {
  try {
    return localStorage.getItem(MAP_GPS_PROMPT_KEY) !== '1'
  } catch {
    return true
  }
}

export function markMapGpsPromptShown(): void {
  try {
    localStorage.setItem(MAP_GPS_PROMPT_KEY, '1')
  } catch {
    /* ignore quota */
  }
}
