export const FUEL_LOG_PREFILL_CHIP_CLASS = 'em-v2-fuel-log__workout-prefill'

export const FUEL_LOG_PREFILL_PR_TONE_CLASS = `${FUEL_LOG_PREFILL_CHIP_CLASS}--has-pr`

export function resolveFuelLogPrefillPrToneClass(hasPr: boolean): string | null {
  return hasPr ? FUEL_LOG_PREFILL_PR_TONE_CLASS : null
}

/** aria-label del chip macros sugeridos con PR (oleada 441). */
export function buildFuelLogPrefillPrToneAriaLabel(
  chipLabel: string,
  hasPr: boolean
): string {
  if (hasPr) {
    return `Sugerido del entreno con récord personal: ${chipLabel}`
  }
  return chipLabel
}

export function fuelPrefillPrAriaMatchesPr(ariaLabel: string | null): boolean {
  if (!ariaLabel) return false
  return ariaLabel.includes('récord personal')
}