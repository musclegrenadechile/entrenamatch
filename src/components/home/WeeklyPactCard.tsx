import type { WeeklyPact, WeeklyPactProgress } from '../../services/weeklyPact'
import { PACT_LIVE_OPTIONS, PACT_SYNC_OPTIONS } from '../../services/weeklyPact'
import type { TeamMemberView } from './DailyHome'

export interface WeeklyPactCardProps {
  progress: WeeklyPactProgress
  pact: WeeklyPact | null
  teamMembers: TeamMemberView[]
  isLoopActive?: boolean
  onPledge: (pact: Omit<WeeklyPact, 'weekKey' | 'pledgedAt'> & { weekKey?: string }) => void
  onSyncWithPartner?: (partnerId: string, partnerName: string) => void
  onMessagePartner?: (partnerId: string) => void
  onToggleLive?: () => void
  isLive?: boolean
}

export function WeeklyPactCard({
  progress,
  pact,
  teamMembers,
  isLoopActive = false,
  onPledge,
  onSyncWithPartner,
  onMessagePartner,
  onToggleLive,
  isLive,
}: WeeklyPactCardProps) {
  const bondMembers = teamMembers.filter((m) => m.isBond)
  const suggestedPartner = bondMembers[0] || teamMembers[0]

  if (!progress.pledged) {
    return (
      <div className="weekly-pact-card weekly-pact-card--setup">
        <p className="text-[11px] text-white font-bold mb-1">Tu pacto de esta semana</p>
        <p className="text-[10px] text-[#9CA3AF] mb-3 leading-snug">
          Cierra el loop: live visible + al menos un sync con tu equipo.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {PACT_LIVE_OPTIONS.map((n) => (
            <button
              key={`live-${n}`}
              type="button"
              onClick={() =>
                onPledge({
                  liveDaysTarget: n,
                  syncSessionsTarget: 1,
                  partnerId: suggestedPartner?.id,
                  partnerName: suggestedPartner?.name,
                })
              }
              className="weekly-pact-chip"
            >
              {n} días live
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {PACT_SYNC_OPTIONS.map((n) => (
            <button
              key={`sync-${n}`}
              type="button"
              onClick={() =>
                onPledge({
                  liveDaysTarget: 3,
                  syncSessionsTarget: n,
                  partnerId: suggestedPartner?.id,
                  partnerName: suggestedPartner?.name,
                })
              }
              className="weekly-pact-chip weekly-pact-chip--sync"
            >
              {n} sync{n > 1 ? 's' : ''}
            </button>
          ))}
        </div>
        {suggestedPartner && (
          <p className="text-[9px] text-[#FFD700]/90 mt-3 text-center">
            Compromiso con {suggestedPartner.name.split(' ')[0]} de tu equipo
          </p>
        )}
      </div>
    )
  }

  const partnerFirst = pact?.partnerName?.split(' ')[0]

  return (
    <div
      className={`weekly-pact-card ${isLoopActive ? 'weekly-pact-card--active' : ''} ${
        progress.isComplete ? 'weekly-pact-card--done' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#FF671F] font-bold">
            Pacto semanal
          </p>
          <p className="text-[12px] font-bold text-white mt-0.5">
            {progress.isComplete ? '¡Semana sellada!' : 'En marcha esta semana'}
          </p>
          {partnerFirst && (
            <p className="text-[10px] text-[#FFD700]/90 mt-0.5">Con {partnerFirst}</p>
          )}
        </div>
        <span className="text-lg font-black text-[#FF671F] tabular-nums">
          {progress.overallPct}%
        </span>
      </div>

      <div className="space-y-2.5 mb-3">
        <PactMeter
          label="Live"
          done={progress.liveDaysDone}
          target={progress.liveDaysTarget}
          pct={progress.livePct}
          color="#22c55e"
        />
        <PactMeter
          label="Sync"
          done={progress.syncSessionsDone}
          target={progress.syncSessionsTarget}
          pct={progress.syncPct}
          color="#FF671F"
        />
      </div>

      {!progress.isComplete && (
        <div className="flex flex-wrap gap-2">
          {!isLive && onToggleLive && (
            <button type="button" onClick={onToggleLive} className="weekly-pact-cta">
              Activar live
            </button>
          )}
          {pact?.partnerId && onSyncWithPartner && (
            <button
              type="button"
              onClick={() => onSyncWithPartner(pact.partnerId!, pact.partnerName || 'Compañero')}
              className="weekly-pact-cta weekly-pact-cta--primary"
            >
              Sync con {partnerFirst || 'equipo'}
            </button>
          )}
          {pact?.partnerId && onMessagePartner && (
            <button
              type="button"
              onClick={() => onMessagePartner(pact.partnerId!)}
              className="weekly-pact-cta weekly-pact-cta--ghost"
            >
              Mensaje
            </button>
          )}
        </div>
      )}

      {progress.isComplete && (
        <p className="text-[10px] text-[#22c55e] text-center font-semibold">
          Loop semanal completo — Live, Equipo, Sync y Pacto ✓
        </p>
      )}
    </div>
  )
}

function PactMeter({
  label,
  done,
  target,
  pct,
  color,
}: {
  label: string
  done: number
  target: number
  pct: number
  color: string
}) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-[#9CA3AF] font-semibold">{label}</span>
        <span className="text-white font-bold tabular-nums">
          {done}/{target}
        </span>
      </div>
      <div className="weekly-pact-meter">
        <span
          className="weekly-pact-meter__fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
