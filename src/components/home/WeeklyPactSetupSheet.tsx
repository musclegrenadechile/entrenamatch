import { useEffect, useState } from 'react'
import { X, Target, Zap } from 'lucide-react'
import type { WeeklyPact } from '../../services/weeklyPact'
import { PACT_LIVE_OPTIONS, PACT_SYNC_OPTIONS } from '../../services/weeklyPact'

export interface WeeklyPactSetupSheetProps {
  open: boolean
  partnerName?: string
  onClose: () => void
  onPledge: (partial: Omit<WeeklyPact, 'weekKey' | 'pledgedAt'> & { weekKey?: string }) => void
}

/** Meta de la semana — wizard modal (fix: ya no hay que scrollear al paso 4). */
export function WeeklyPactSetupSheet({
  open,
  partnerName,
  onClose,
  onPledge,
}: WeeklyPactSetupSheetProps) {
  const [step, setStep] = useState(0)
  const [pickLive, setPickLive] = useState(3)
  const [pickSync, setPickSync] = useState(1)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!open) return null

  const commit = (live: number, sync: number) => {
    onPledge({
      liveDaysTarget: live,
      syncSessionsTarget: sync,
      partnerName,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-label="Fijar meta de la semana"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-t-3xl border border-[#FF671F]/30 bg-[#141418] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FF671F]/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-[#FF671F]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#FF671F] font-bold">
                Meta de la semana
              </p>
              <p className="text-sm font-black text-white">Live + Sync + Logs</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-[#9CA3AF]" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <p className="text-[11px] text-[#9CA3AF] mb-4 leading-snug">
          Fija cuántos días entrenarás en vivo, cuántos EntrenaSync y registra tus sesiones en Entreno de
          Hoy. Tu equipo ve el progreso en el chat.
        </p>

        {step === 0 && (
          <>
            <button
              type="button"
              onClick={() => commit(3, 1)}
              className="w-full mb-3 py-3 rounded-2xl bg-gradient-to-r from-[#FF671F] to-[#ff8534] text-black font-black text-sm flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              Recomendado: 3 live · 1 sync · 3 logs
            </button>
            <p className="text-[10px] text-[#6B7280] mb-2">O elige a tu medida:</p>
            <div className="flex flex-wrap gap-2">
              {PACT_LIVE_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setPickLive(n)
                    setStep(1)
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
            <p className="text-[10px] text-[#9CA3AF] mb-3">{pickLive} días live — ¿cuántos EntrenaSync?</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PACT_SYNC_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setPickSync(n)
                    setStep(2)
                  }}
                  className="weekly-pact-chip weekly-pact-chip--sync"
                >
                  {n} sync{n > 1 ? 's' : ''}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setStep(0)} className="text-[10px] text-[#9CA3AF]">
              ← Volver
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="p-3 rounded-xl bg-black/30 border border-[#FF671F]/20 mb-3 text-center">
              <p className="text-sm font-bold text-white">
                {pickLive} live · {pickSync} sync · 3 logs
              </p>
              {partnerName && (
                <p className="text-[10px] text-[#FFD700]/90 mt-1">Con {partnerName.split(' ')[0]}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => commit(pickLive, pickSync)}
              className="w-full py-3 rounded-2xl bg-[#22c55e] text-black font-black text-sm"
            >
              Fijar meta →
            </button>
            <button type="button" onClick={() => setStep(1)} className="mt-2 text-[10px] text-[#9CA3AF]">
              ← Volver
            </button>
          </>
        )}
      </div>
    </div>
  )
}
