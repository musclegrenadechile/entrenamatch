export const WORKOUT_SAVE_BANNER_CLASS = 'em-v2-training-save-banner'

export const WORKOUT_SAVE_BANNER_PR_TONE_CLASS = `${WORKOUT_SAVE_BANNER_CLASS}--has-pr`

export function resolveWorkoutSaveBannerPrToneClass(hasPr: boolean): string | null {
  return hasPr ? WORKOUT_SAVE_BANNER_PR_TONE_CLASS : null
}

export type WorkoutSaveBannerPrToneAriaOpts = {
  title: string
  prSummary?: string
  sessionSummary?: string
  fuelBalanceHint?: string
}

/** aria-label del banner post-guardar con PR (oleada 439). */
export function buildWorkoutSaveBannerPrToneAriaLabel(
  opts: WorkoutSaveBannerPrToneAriaOpts
): string {
  const parts = [`Entreno guardado: ${opts.title}`]
  if (opts.sessionSummary) parts.push(opts.sessionSummary)
  if (opts.fuelBalanceHint) parts.push(opts.fuelBalanceHint)
  if (opts.prSummary) parts.push('Nuevo récord personal')
  return parts.filter(Boolean).join('. ')
}

export function bannerPrAriaMatchesPr(ariaLabel: string | null): boolean {
  if (!ariaLabel) return false
  return ariaLabel.includes('récord personal')
}