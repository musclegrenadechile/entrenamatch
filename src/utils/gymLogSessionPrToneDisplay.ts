export const GYM_LOG_SESSION_CHIP_CLASS = 'em-v2-gym-session-chip'

export const GYM_LOG_SESSION_PR_TONE_CLASS = `${GYM_LOG_SESSION_CHIP_CLASS}--has-pr`

export function resolveGymLogSessionPrToneClass(livePrCount: number): string | null {
  return livePrCount > 0 ? GYM_LOG_SESSION_PR_TONE_CLASS : null
}

/** aria-label del chip sesión con PR en vivo (oleada 436). */
export function buildGymLogSessionPrToneAriaLabel(
  chipText: string,
  livePrCount: number
): string {
  if (livePrCount > 0) {
    const prLabel = livePrCount === 1 ? '1 PR en vivo' : `${livePrCount} PRs en vivo`
    return `Sesión activa (${prLabel}): ${chipText}`
  }
  return `Sesión activa: ${chipText}`
}

export function sessionPrAriaMatchesLivePr(ariaLabel: string | null): boolean {
  if (!ariaLabel) return false
  return ariaLabel.includes('PR en vivo') || ariaLabel.includes('PRs en vivo')
}