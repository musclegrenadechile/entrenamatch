/** Contrato UI del banner post-guardar (oleadas 362, 390–391). */

export const WORKOUT_SAVE_BANNER_SESSION_CLASS = 'em-v2-training-save-banner__session'

export function hasWorkoutSaveBannerSessionSummary(
  summary?: string | null
): summary is string {
  return typeof summary === 'string' && summary.trim().length > 0
}