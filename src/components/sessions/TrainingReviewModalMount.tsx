import { AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'

export type TrainingReviewModalMountProps = {
  open: boolean
  partnerName: string
  rating: number
  comment: string
  photo: string | null
  onRatingChange: (rating: number) => void
  onCommentChange: (comment: string) => void
  onPhotoChange: (photo: string | null) => void
  onClose: () => void
  onSubmit: () => void
}

/** Fase 455 — post-training review modal extracted from App.tsx. */
export function TrainingReviewModalMount({
  open,
  partnerName,
  rating,
  comment,
  photo,
  onRatingChange,
  onCommentChange,
  onPhotoChange,
  onClose,
  onSubmit,
}: TrainingReviewModalMountProps) {
  if (!open) return null

  return (
    <AnimatePresence>
      <div
        className="em-visual-v2 em-v2-review-modal__overlay absolute inset-0 z-[110] flex items-center justify-center p-6"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()} className="em-v2-review-modal__card">
          <div className="text-center mb-4">
            <div className="em-v2-review-modal__title">¿Cómo fue entrenar con {partnerName}?</div>
            <p className="em-v2-review-modal__hint">Tu reseña ayuda a otros a confiar</p>
          </div>

          <div className="em-v2-review-modal__stars" role="group" aria-label="Calificación">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onRatingChange(star)}
                className={`em-v2-review-modal__star ${star <= rating ? 'em-v2-review-modal__star--active' : ''}`}
                aria-label={`${star} estrellas`}
                aria-pressed={star <= rating}
              >
                <Star className="w-6 h-6" fill={star <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Comentario opcional (qué tal fue el entrenamiento...)"
            className="em-v2-review-modal__input w-full h-24 resize-none mb-4"
          />

          <div className="em-v2-review-modal__photo">
            <label className="em-v2-review-modal__photo-label">Foto de la sesión (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = () => onPhotoChange(reader.result as string)
                  reader.readAsDataURL(file)
                }
              }}
              className="em-v2-review-modal__file"
            />
            {photo && (
              <div className="em-v2-review-modal__photo-preview">
                <img src={photo} className="em-v2-review-modal__photo-img" alt="Preview sesión" />
                <button
                  type="button"
                  onClick={() => onPhotoChange(null)}
                  className="em-v2-review-modal__photo-remove"
                  aria-label="Quitar foto"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="em-v2-cta-secondary">
              Cancelar
            </button>
            <button type="button" onClick={onSubmit} className="em-v2-hero-card__cta flex-1">
              Enviar reseña
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}