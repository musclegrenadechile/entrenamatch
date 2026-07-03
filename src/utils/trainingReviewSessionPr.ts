/** Persiste contexto PR en reseña post-sync (oleada 450). */

let reviewSessionHasPr = false

export function deriveReviewSessionHasPr(prSummary: string | undefined): boolean {
  return !!prSummary
}

export function resolveTrainingReviewModalHasPr(
  bannerPrSummary: string | undefined,
  sessionHasPr: boolean
): boolean {
  return deriveReviewSessionHasPr(bannerPrSummary) || sessionHasPr
}

export function persistReviewSessionPr(prSummary: string | undefined): void {
  if (deriveReviewSessionHasPr(prSummary)) reviewSessionHasPr = true
}

export function clearReviewSessionPr(): void {
  reviewSessionHasPr = false
}

export function resolveTrainingReviewModalHasPrFromBanner(
  bannerPrSummary: string | undefined
): boolean {
  return resolveTrainingReviewModalHasPr(bannerPrSummary, reviewSessionHasPr)
}

/** Solo tests — reinicia estado de sesión. */
export function resetReviewSessionPrForTests(): void {
  reviewSessionHasPr = false
}

