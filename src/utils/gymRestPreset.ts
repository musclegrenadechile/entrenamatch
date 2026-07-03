export const REST_PRESETS_SEC = [45, 60, 90, 120, 180] as const
export const REST_PRESET_KEY = 'entrenamatch_rest_preset'

export type RestPresetSec = (typeof REST_PRESETS_SEC)[number]

export function isValidRestPreset(sec: number): sec is RestPresetSec {
  return (REST_PRESETS_SEC as readonly number[]).includes(sec)
}

export function loadDefaultRestPreset(): number {
  try {
    const raw = localStorage.getItem(REST_PRESET_KEY)
    const n = raw ? parseInt(raw, 10) : 90
    return isValidRestPreset(n) ? n : 90
  } catch {
    return 90
  }
}

export function saveDefaultRestPreset(sec: number): void {
  if (!isValidRestPreset(sec)) return
  try {
    localStorage.setItem(REST_PRESET_KEY, String(sec))
  } catch {
    /* ignore */
  }
}