import type { Report } from '../../types'

const REPORT_REASONS = [
  'Comportamiento inadecuado / acoso',
  'Perfil falso o suplantación',
  'Spam o contenido irrelevante',
  'Contenido inapropiado (fotos/voz)',
  'Otra violación de las reglas de comunidad',
] as const

export type ReportModalMountProps = {
  open: boolean
  targetId: string | null
  reason: string
  details: string
  context: Report['context']
  onReasonChange: (reason: string) => void
  onDetailsChange: (details: string) => void
  onClose: () => void
  onOpenCommunityRules: () => void
  onSubmit: () => void | Promise<void>
}

/** Fase 457 — report user modal extracted from App.tsx. */
export function ReportModalMount({
  open,
  targetId,
  reason,
  details,
  onReasonChange,
  onDetailsChange,
  onClose,
  onOpenCommunityRules,
  onSubmit,
}: ReportModalMountProps) {
  if (!open || !targetId) return null

  return (
    <div className="em-v2-report__overlay absolute inset-0 z-[140] flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="em-v2-report__sheet w-full p-5 max-h-[85vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="em-v2-report__title">Reportar usuario</div>
          <button type="button" onClick={onClose} className="text-[#9CA3AF]">
            ✕
          </button>
        </div>

        <div className="text-sm text-[#9CA3AF] mb-3">
          Selecciona el motivo principal. Tu reporte es anónimo para el otro usuario.
        </div>

        <div className="space-y-2 mb-4">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onReasonChange(r)}
              className={`em-v2-report__reason ${reason === r ? 'em-v2-report__reason--active' : ''}`}
            >
              {r}
            </button>
          ))}
        </div>

        <textarea
          value={details}
          onChange={(e) => onDetailsChange(e.target.value)}
          placeholder="Detalles adicionales (opcional)..."
          className="form-input w-full mb-4 min-h-[80px] resize-none"
        />

        <div className="flex gap-2">
          <button type="button" onClick={onOpenCommunityRules} className="em-v2-cta-secondary flex-1">
            Ver reglas de comunidad
          </button>
          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={!reason}
            className="em-v2-hero-card__cta flex-1 disabled:opacity-50"
          >
            Enviar reporte
          </button>
        </div>
        <div className="em-v2-report__footer">
          Los reportes ayudan a mantener la comunidad segura y enfocada en rendimiento.
        </div>
      </div>
    </div>
  )
}
