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
    <div className="absolute inset-0 z-[140] bg-black/80 flex items-end" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-[#0D0D10] rounded-t-3xl p-5 max-h-[85vh] overflow-auto border-t border-[#2F2F35]"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-lg">Reportar usuario</div>
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
              className={`w-full text-left p-3 rounded-xl border ${reason === r ? 'border-[#FF671F] bg-[#FF671F]/10' : 'border-[#2F2F35]'} active:bg-[#1C1C20]`}
            >
              {r}
            </button>
          ))}
        </div>

        <textarea
          value={details}
          onChange={(e) => onDetailsChange(e.target.value)}
          placeholder="Detalles adicionales (opcional)..."
          className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-xl p-3 text-sm mb-4 min-h-[80px]"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenCommunityRules}
            className="flex-1 py-2 text-sm border border-[#2F2F35] rounded-2xl active:bg-[#1C1C20]"
          >
            Ver reglas de comunidad
          </button>
          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={!reason}
            className="flex-1 py-2 text-sm bg-[#FF671F] text-black font-bold rounded-2xl disabled:opacity-50 active:bg-[#E55A1A]"
          >
            Enviar reporte
          </button>
        </div>
        <div className="text-[10px] text-center text-[#9CA3AF] mt-3">
          Los reportes ayudan a mantener la comunidad segura y enfocada en rendimiento.
        </div>
      </div>
    </div>
  )
}
