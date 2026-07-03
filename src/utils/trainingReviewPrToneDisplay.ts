export const REVIEW_MODAL_CARD_CLASS = 'em-v2-review-modal__card'

export const REVIEW_MODAL_PR_TONE_CLASS = `${REVIEW_MODAL_CARD_CLASS}--has-pr`

export function resolveTrainingReviewPrToneClass(hasPr: boolean): string | null {
  return hasPr ? REVIEW_MODAL_PR_TONE_CLASS : null
}

/** aria-label del diálogo reseña con PR (oleada 445). */
export function buildTrainingReviewPrToneAriaLabel(
  partnerName: string,
  hasPr: boolean
): string {
  if (hasPr) {
    return `Reseña post-entreno con récord personal: ¿Cómo fue entrenar con ${partnerName}?`
  }
  return `Reseña post-entreno: ¿Cómo fue entrenar con ${partnerName}?`
}

export function reviewPrAriaMatchesPr(ariaLabel: string | null): boolean {
  if (!ariaLabel) return false
  return ariaLabel.includes('récord personal')
}