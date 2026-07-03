import { AnimatePresence } from 'framer-motion'

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
        className="em-v2-review-modal__overlay absolute inset-0 z-[110] flex items-center justify-center p-6"
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()} className="em-v2-review-modal__card">
          <div className="text-center mb-4">
            <div className="em-v2-review-modal__title">¿Cómo fue entrenar con {partnerName}?</div>
            <div className="text-sm text-[#9CA3AF] mt-1">Tu reseña ayuda a otros a confiar</div>
          </div>

          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => onRatingChange(star)} className="text-4xl transition">
                {star <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Comentario opcional (qué tal fue el entrenamiento...)"
            className="form-input w-full h-24 resize-none mb-4"
          />

          <div className="mb-4">
            <label className="text-xs text-[#9CA3AF] mb-1 block">Foto de la sesión (opcional)</label>
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
              className="text-sm"
            />
            {photo && (
              <div className="mt-2 relative w-24 h-24">
                <img
                  src={photo}
                  className="w-24 h-24 object-cover rounded-xl border border-[#2F2F35]"
                  alt="Preview"
                />
                <button
                  type="button"
                  onClick={() => onPhotoChange(null)}
                  className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
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
