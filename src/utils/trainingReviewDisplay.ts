/** Copy contextual para reseña post-entreno según estrellas (oleada 390). */

export function buildTrainingReviewRatingHint(rating: number, hasPr = false): string {
  if (rating <= 0) {
    return hasPr
      ? 'Toca las estrellas — celebraste un récord personal en esta sesión'
      : 'Toca las estrellas para calificar'
  }
  if (rating <= 2) return 'Cuéntanos qué mejorar — tu feedback ayuda a la comunidad'
  if (rating === 3) return 'Sesión correcta — añade un detalle si quieres'
  return '¡Buen match! Tu reseña refuerza la confianza en la red'
}

export function canSubmitTrainingReview(rating: number): boolean {
  return rating >= 1 && rating <= 5
}