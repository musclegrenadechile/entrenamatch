import { useState } from 'react'
import type { WeeklyPact, WeeklyPactProgress } from '../../services/weeklyPact'
import { PACT_LIVE_OPTIONS, PACT_SYNC_OPTIONS } from '../../services/weeklyPact'
import type { TeamMemberView } from './DailyHome'

export interface WeeklyPactCardProps {
  progress: WeeklyPactProgress
  pact: WeeklyPact | null
  teamMembers: TeamMemberView[]
  isLoopActive?: boolean
  forceWizard?: boolean
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
  forceWizard = false,
  onPledge,
  onSyncWithPartner,
  onMessagePartner,
  onToggleLive,
  isLive,
}: WeeklyPactCardProps) {
  const bondMembers = teamMembers.filter((m) => m.isBond)
  const suggestedPartner = bondMembers[0] || teamMembers[0]
  const [wizardStep, setWizardStep] = useState(forceWizard ? 0 : -1)
  const [pickLive, setPickLive] = useState(3)
  const [pickSync, setPickSync] = useState(1)

  const showWizard = !progress.pledged && (wizardStep >= 0 || forceWizard)

  const commitPledge = (live: number, sync: number) => {
    onPledge({
      liveDaysTarget: live,
      syncSessionsTarget: sync,
      partnerId: suggestedPartner?.id,
      partnerName: suggestedPartner?.name,
    })
    setWizardStep(-1)
  }

  if (!progress.pledged && showWizard) {
    const step = wizardStep < 0 ? 0 : wizardStep
    return (
      <div className="weekly-pact-card weekly-pact-card--setup">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-white font-bold">Meta semanal</p>
          <span className="text-[9px] text-[#FF671F] font-bold">{step + 1}/3</span>
        </div>

        {step === 0 && (
          <>
            <p className="text-[10px] text-[#9CA3AF] mb-3">¿Cuántos días quieres entrenar en vivo?</p>
            <button
              type="button"
              onClick={() => commitPledge(3, 1)}
              className="w-full mb-3 py-2.5 rounded-xl bg-[#FF671F] text-black font-bold text-sm active:brightness-90"
            >
              Meta recomendada: 3 live + 1 sync + 3 logs
            </button>
            <div className="flex flex-wrap gap-2">
              {PACT_LIVE_OPTIONS.map((n) => (
                <button
                  key={`live-${n}`}
                  type="button"
                  onClick={() => {
                    setPickLive(n)
                    setWizardStep(1)
                  }}
                  className="weekly-pact-chip"
                >
                  {n} días live
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-[10px] text-[#9CA3AF] mb-3">
              {pickLive} días live — ¿cuántos EntrenaSync?
            </p>
            <div className="flex flex-wrap gap-2">
              {PACT_SYNC_OPTIONS.map((n) => (
                <button
                  key={`sync-${n}`}
                  type="button"
                  onClick={() => {
                    setPickSync(n)
                    setWizardStep(2)
                  }}
                  className="weekly-pact-chip weekly-pact-chip--sync"
                >
                  {n} sync{n > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-[10px] text-[#9CA3AF] mb-2">Confirma tu meta</p>
            <div className="p-3 rounded-xl bg-black/30 border border-[#FF671F]/20 mb-3 text-center">
              <p className="text-sm font-bold text-white">
                {pickLive} live · {pickSync} sync · 3 logs
              </p>
              {suggestedPartner && (
                <p className="text-[10px] text-[#FFD700]/90 mt-1">
                  Con {suggestedPartner.name.split(' ')[0]}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => commitPledge(pickLive, pickSync)}
              className="w-full py-2.5 rounded-xl bg-[#22c55e] text-black font-bold text-sm"
            >
              Fijar meta →
            </button>
          </>
        )}
      </div>
    )
  }

  if (!progress.pledged) {
    return (
      <div className="weekly-pact-card weekly-pact-card--setup">
        <p className="text-[11px] text-white font-bold mb-1">Tu meta de esta semana</p>
        <p className="text-[10px] text-[#9CA3AF] mb-3 leading-snug">
          Live visible + al menos un sync — cierra la semana con tu red.
        </p>
        <button
          type="button"
          onClick={() => setWizardStep(0)}
          className="w-full py-2.5 rounded-xl bg-[#FF671F] text-black font-bold text-sm mb-2"
        >
          Configurar meta (&lt;30s)
        </button>
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
            Meta semanal
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
          color="#FFD700"
        />
        <PactMeter
          label="Logs"
          done={progress.loggedSessionsDone}
          target={progress.loggedSessionsTarget}
          pct={progress.loggedPct}
          color="#FF671F"
        />
      </div>

      {!progress.isComplete && (
        <div className="flex flex-wrap gap-2">
          {!isLive && onToggleLive && (
            <button
              type="button"
              onClick={onToggleLive}
              className="text-[10px] px-3 py-1.5 rounded-full bg-[#22c55e]/15 text-[#22c55e] font-bold border border-[#22c55e]/30"
            >
              Activar live
            </button>
          )}
          {pact?.partnerId && onSyncWithPartner && (
            <button
              type="button"
              onClick={() => onSyncWithPartner(pact.partnerId!, pact.partnerName || 'Socio')}
              className="text-[10px] px-3 py-1.5 rounded-full bg-[#FFD700]/15 text-[#FFD700] font-bold border border-[#FFD700]/30"
            >
              Sync con {partnerFirst}
            </button>
          )}
          {pact?.partnerId && onMessagePartner && (
            <button
              type="button"
              onClick={() => onMessagePartner(pact.partnerId!)}
              className="text-[10px] px-3 py-1.5 rounded-full bg-[#1C1C20] text-[#9CA3AF] border border-[#2F2F35]"
            >
              Mensaje
            </button>
          )}
        </div>
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
        <span className="text-[#9CA3AF]">{label}</span>
        <span className="font-bold text-white tabular-nums">
          {done}/{target}
        </span>
      </div>
      <div className="h-1.5 bg-[#2F2F35] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
