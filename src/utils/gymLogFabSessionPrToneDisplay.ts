import {
  buildGymLogSessionPrToneAriaLabel,
  sessionPrAriaMatchesLivePr,
} from './gymLogSessionPrToneDisplay'

export const GYM_LOG_FAB_SESSION_CHIP_CLASS = 'em-v2-workout-fab__session-chip'

export const GYM_LOG_FAB_SESSION_PR_TONE_CLASS = `${GYM_LOG_FAB_SESSION_CHIP_CLASS}--has-pr`

export const GYM_LOG_FAB_STRIP_CHIP_CLASS = 'em-v2-workout-fab__strip-chip'

export const GYM_LOG_FAB_STRIP_PR_TONE_CLASS = `${GYM_LOG_FAB_STRIP_CHIP_CLASS}--has-pr`

export function resolveGymLogFabSessionPrToneClass(livePrCount: number): string | null {
  return livePrCount > 0 ? GYM_LOG_FAB_SESSION_PR_TONE_CLASS : null
}

export function resolveGymLogFabStripPrToneClass(livePrCount: number): string | null {
  return livePrCount > 0 ? GYM_LOG_FAB_STRIP_PR_TONE_CLASS : null
}

/** aria-label del chip sesión en FAB minimizado (oleada 437). */
export function buildGymLogFabSessionPrToneAriaLabel(
  chipText: string,
  livePrCount: number
): string {
  return buildGymLogSessionPrToneAriaLabel(chipText, livePrCount)
}

export function fabSessionPrAriaMatchesLivePr(ariaLabel: string | null): boolean {
  return sessionPrAriaMatchesLivePr(ariaLabel)
}