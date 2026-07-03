/** Copy contextual para reseña post-entreno según estrellas (oleada 390). */

export function buildTrainingReviewRatingHint(rating: number): string {
  if (rating <= 0) return 'Toca las estrellas para calificar'
  if (rating <= 2) return 'Cuéntanos qué mejorar — tu feedback ayuda a la comunidad'
  if (rating === 3) return 'Sesión correcta — añade un detalle si quieres'
  return '¡Buen match! Tu reseña refuerza la confianza en la red'
}

export function canSubmitTrainingReview(rating: number): boolean {
  return rating >= 1 && rating <= 5
}