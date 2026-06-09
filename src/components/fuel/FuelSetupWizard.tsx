import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import type { FuelGoal, FuelProfile } from '../../types'
import {
  buildFuelProfileFromWizard,
  defaultWizardAnswers,
  type FuelWizardAnswers,
  type FuelWizardHints,
} from '../../utils/fuelWizardDefaults'

export interface FuelSetupWizardProps {
  open: boolean
  hints?: FuelWizardHints
  onClose: () => void
  onSave: (profile: Omit<FuelProfile, 'updatedAt'>) => Promise<void>
  onAdvancedSetup?: () => void
  saving?: boolean
}

const GOALS: { id: FuelGoal; label: string; emoji: string }[] = [
  { id: 'lose', label: 'Perder grasa', emoji: '🔥' },
  { id: 'maintain', label: 'Mantener', emoji: '⚖️' },
  { id: 'muscle', label: 'Ganar músculo', emoji: '💪' },
  { id: 'gain', label: 'Subir peso', emoji: '📈' },
]

const ACTIVITY = [
  { id: 'light' as const, label: '1–2 días / sem' },
  { id: 'moderate' as const, label: '3–4 días / sem' },
  { id: 'active' as const, label: '5 días / sem' },
  { id: 'very_active' as const, label: '6+ o doble sesión' },
]

const STEPS = ['Objetivo', 'Actividad', 'Peso']

export function FuelSetupWizard({
  open,
  hints = {},
  onClose,
  onSave,
  onAdvancedSetup,
  saving = false,
}: FuelSetupWizardProps) {
  const defaults = useMemo(() => defaultWizardAnswers(hints), [hints])
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<FuelWizardAnswers>(defaults)

  useEffect(() => {
    if (!open) return
    setStep(0)
    setAnswers(defaultWizardAnswers(hints))
  }, [open, hints])

  if (!open) return null

  const preview = buildFuelProfileFromWizard(answers, hints)
  const isLast = step === STEPS.length - 1

  const handleNext = async () => {
    if (!isLast) {
      setStep((s) => s + 1)
      return
    }
    await onSave(preview)
  }

  return (
    <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#12121a] border border-[#a855f7]/30 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 sticky top-0 bg-[#12121a] z-10">
          <div>
            <p className="text-sm font-black text-white">Fuel en 1 min</p>
            <p className="text-[10px] text-[#9CA3AF]">
              Paso {step + 1}/{STEPS.length} · {STEPS[step]}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl bg-white/5">
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>

        <div className="px-4 pt-3 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={STEPS[i]}
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-[#a855f7]' : 'bg-white/10'}`}
            />
          ))}
        </div>

        <div className="p-4 space-y-4 text-sm min-h-[220px]">
          {step === 0 && (
            <div>
              <p className="text-white font-bold mb-2">¿Cuál es tu objetivo?</p>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, goal: g.id }))}
                    className={`py-3 px-2 rounded-2xl text-left border ${
                      answers.goal === g.id
                        ? 'bg-[#a855f7]/25 border-[#a855f7]/60 text-white'
                        : 'bg-white/5 border-white/10 text-[#9CA3AF]'
                    }`}
                  >
                    <span className="text-lg">{g.emoji}</span>
                    <p className="text-[11px] font-bold mt-1">{g.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-white font-bold mb-2">¿Cuánto entrenas?</p>
              <div className="space-y-1.5">
                {ACTIVITY.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAnswers((a0) => ({ ...a0, activityLevel: a.id }))}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-[11px] font-bold ${
                      answers.activityLevel === a.id
                        ? 'bg-[#a855f7]/20 border border-[#a855f7]/50 text-white'
                        : 'bg-white/5 text-[#9CA3AF] border border-transparent'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              {hints.weekTrainedCount != null && hints.weekTrainedCount > 0 && (
                <p className="text-[10px] text-[#6B7280] mt-2">
                  Sugerido según tu semana: {hints.weekTrainedCount} días entrenados
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-white font-bold mb-2">¿Cuánto pesas? (kg)</p>
              <input
                type="text"
                inputMode="decimal"
                value={String(answers.weightKg)}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(',', '.'))
                  if (Number.isFinite(n)) setAnswers((a) => ({ ...a, weightKg: n }))
                }}
                className="w-full px-4 py-3 rounded-2xl bg-[#1a1a22] border border-white/10 text-white text-lg font-black tabular-nums"
              />
              <p className="text-[10px] text-[#6B7280] mt-2 leading-snug">
                Usamos edad {hints.age ?? 28}, altura estimada y macros estándar. Puedes afinar
                después en ajustes avanzados.
              </p>
              <div className="rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/25 p-3 text-[11px] text-[#e9d5ff] mt-3">
                <p className="font-bold text-white">Preview</p>
                <p className="mt-1 tabular-nums">
                  {preview.targetKcal} kcal · P{preview.targetProteinG} · C{preview.targetCarbsG}{' '}
                  · G{preview.targetFatG}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/8 space-y-2">
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-3 rounded-2xl border border-white/15 text-[#9CA3AF] font-semibold text-sm flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Atrás
              </button>
            )}
            <button
              type="button"
              disabled={saving || answers.weightKg < 30}
              onClick={() => void handleNext()}
              className="flex-1 py-3 rounded-2xl bg-[#a855f7] text-black font-extrabold text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando…' : isLast ? 'Listo — guardar Fuel' : 'Siguiente'}
            </button>
          </div>
          {onAdvancedSetup && (
            <button
              type="button"
              onClick={onAdvancedSetup}
              className="w-full text-[10px] text-[#6B7280] underline"
            >
              Configuración avanzada (altura, restricciones…)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
