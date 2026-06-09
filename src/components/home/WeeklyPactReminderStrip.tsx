import { Target } from 'lucide-react'
import type { WeeklyPactProgress } from '../../services/weeklyPact'
import { buildPactReminderMessage } from '../../services/weeklyPact'

export interface WeeklyPactReminderStripProps {
  progress: WeeklyPactProgress
  onOpenEntrenoLog?: () => void
  onDismiss?: () => void
}

export function WeeklyPactReminderStrip({
  progress,
  onOpenEntrenoLog,
  onDismiss,
}: WeeklyPactReminderStripProps) {
  const message = buildPactReminderMessage(progress)
  if (!message) return null

  const logsGap =
    progress.loggedSessionsTarget - progress.loggedSessionsDone

  return (
    <div className="mb-3 rounded-xl border border-[#FFD700]/30 bg-[#FFD700]/8 px-3 py-2.5 flex items-start gap-2.5">
      <Target className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-white">{message}</p>
        <p className="text-[10px] text-[#9CA3AF] mt-0.5">
          Pacto semanal · {progress.overallPct}% completado
        </p>
        {logsGap > 0 && onOpenEntrenoLog && (
          <button
            type="button"
            onClick={onOpenEntrenoLog}
            className="mt-1.5 text-[10px] font-bold text-[#FF671F] active:underline"
          >
            Registrar en Entreno de Hoy →
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-[#9CA3AF] text-xs px-1 active:text-white"
          aria-label="Ocultar recordatorio"
        >
          ×
        </button>
      )}
    </div>
  )
}
