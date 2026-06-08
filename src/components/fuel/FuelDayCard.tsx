import { Pencil, Trash2 } from 'lucide-react'
import type { FuelDayTotals, FuelLogEntry, FuelProfile } from '../../types'
import type { FuelWeekDay } from '../../services/fuel'
import type { DailyEnergyBalance } from '../../domain/fuelBalance'
import { getFuelCoachingTip, getFuelMealSuggestion } from '../../utils/fuelCalculator'

export interface FuelDayCardProps {
  profile: FuelProfile | null
  totals: FuelDayTotals
  energyBalance?: DailyEnergyBalance | null
  todayLogs?: FuelLogEntry[]
  weekDays?: FuelWeekDay[]
  postWorkoutTip?: string
  onSetup: () => void
  onLogMeal: () => void
  onEditLog?: (log: FuelLogEntry) => void
  onDeleteLog?: (logId: string) => void
  deletingLogId?: string | null
}

function pct(current: number, target: number): number {
  if (!target) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

function sourceBadge(source?: FuelLogEntry['source']): string | null {
  if (source === 'photo_ai' || source === 'text_ai') return '✨ IA'
  if (source === 'manual') return '✎'
  return null
}

export function FuelDayCard({
  profile,
  totals,
  energyBalance = null,
  todayLogs = [],
  weekDays = [],
  postWorkoutTip,
  onSetup,
  onLogMeal,
  onEditLog,
  onDeleteLog,
  deletingLogId,
}: FuelDayCardProps) {
  if (!profile) {
    return (
      <div className="rounded-3xl p-4 bg-gradient-to-br from-[#1a1520] via-[#141418] to-[#0f0f12] border border-[#a855f7]/25">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#c084fc] font-bold">Fuel AI</p>
        <h3 className="text-sm font-black text-white mt-1">Configura tu fuel del día</h3>
        <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
          TDEE + macros según tu objetivo. Luego registra comidas con foto o texto — Gemini estima
          kcal y macros.
        </p>
        <button
          type="button"
          onClick={onSetup}
          className="mt-3 w-full py-2.5 rounded-xl bg-[#a855f7]/20 border border-[#a855f7]/40 text-[11px] font-bold text-[#c084fc] active:bg-[#a855f7]/30"
        >
          Configurar Fuel →
        </button>
      </div>
    )
  }

  const targetKcal = energyBalance?.adjustedTargetKcal ?? profile.targetKcal
  const targetProteinG = energyBalance?.macroTargets.targetProteinG ?? profile.targetProteinG
  const targetCarbsG = energyBalance?.macroTargets.targetCarbsG ?? profile.targetCarbsG
  const targetFatG = energyBalance?.macroTargets.targetFatG ?? profile.targetFatG
  const totalBurn =
    (energyBalance?.workoutBurnKcal ?? 0) + (energyBalance?.liveBurnKcal ?? 0)

  const kcalPct = pct(totals.kcal, targetKcal)
  const proteinPct = pct(totals.proteinG, targetProteinG)
  const coachingTip = getFuelCoachingTip(profile, totals, energyBalance)
  const mealSuggestion = getFuelMealSuggestion(profile, totals, energyBalance)
  const remKcal = targetKcal - totals.kcal
  const remProtein = targetProteinG - totals.proteinG
  const weekLoggedCount = weekDays.filter((d) => d.logged).length

  return (
    <div className="rounded-3xl p-4 bg-gradient-to-br from-[#1a1520] via-[#141418] to-[#0f0f12] border border-[#a855f7]/25">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#c084fc] font-bold">Balance del día</p>
          <p className="text-lg font-black text-white tabular-nums">
            {totals.kcal}{' '}
            <span className="text-sm text-[#9CA3AF] font-semibold">/ {targetKcal} kcal</span>
          </p>
          {totalBurn > 0 && (
            <p className="text-[9px] text-[#22c55e] mt-0.5 tabular-nums">
              ↑ base {energyBalance?.baseTargetKcal ?? profile.targetKcal}
              {energyBalance?.workoutBurnKcal ? ` + ${energyBalance.workoutBurnKcal} entreno` : ''}
              {energyBalance?.liveBurnKcal ? ` + ${energyBalance.liveBurnKcal} live` : ''}
            </p>
          )}
          {(totals.entryCount > 0 || totalBurn > 0) && (
            <p className="text-[9px] text-[#6B7280] mt-0.5 tabular-nums">
              Restan ~{Math.max(0, remKcal)} kcal · ~{Math.max(0, remProtein)}g proteína
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onSetup}
          className="text-[9px] text-[#9CA3AF] underline shrink-0"
        >
          Editar
        </button>
      </div>

      {weekDays.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase tracking-wider text-[#6B7280] font-bold">
              Semana Fuel
            </span>
            <span className="text-[9px] text-[#6B7280] tabular-nums">{weekLoggedCount}/7 días</span>
          </div>
          <div className="flex justify-between gap-1">
            {weekDays.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                <span
                  className={`text-[8px] font-bold ${day.isToday ? 'text-[#c084fc]' : 'text-[#6B7280]'}`}
                >
                  {day.label}
                </span>
                <div
                  className={`w-full max-w-[1.75rem] aspect-square rounded-full border-2 transition-colors ${
                    day.logged
                      ? 'bg-[#a855f7] border-[#c084fc]'
                      : day.isToday
                        ? 'border-[#a855f7]/50 bg-[#a855f7]/10'
                        : 'border-white/10 bg-white/[0.03]'
                  }`}
                  title={day.logged ? 'Comida registrada' : 'Sin registro'}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-[#a855f7] to-[#c084fc] transition-all"
          style={{ width: `${kcalPct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-3">
        <div className="rounded-xl bg-white/5 py-2 px-1">
          <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-1.5 mx-1">
            <div className="h-full bg-[#c084fc]" style={{ width: `${proteinPct}%` }} />
          </div>
          <div className="text-[#c084fc] font-black tabular-nums">{totals.proteinG}g</div>
          <div className="text-[#6B7280]">Prot / {targetProteinG}g</div>
        </div>
        <div className="rounded-xl bg-white/5 py-2 px-1">
          <div className="text-white font-black tabular-nums">{totals.carbsG}g</div>
          <div className="text-[#6B7280]">Carbs / {targetCarbsG}g</div>
        </div>
        <div className="rounded-xl bg-white/5 py-2 px-1">
          <div className="text-white font-black tabular-nums">{totals.fatG}g</div>
          <div className="text-[#6B7280]">Grasa / {targetFatG}g</div>
        </div>
      </div>

      {energyBalance?.workoutInsights && energyBalance.workoutInsights.length > 0 && (
        <div className="mb-2 space-y-1">
          {energyBalance.workoutInsights.map((ins) => (
            <p
              key={ins.workoutId || `${ins.label}-${ins.durationMin}`}
              className="text-[10px] text-[#22c55e] leading-snug bg-[#22c55e]/8 rounded-xl px-2.5 py-1.5 border border-[#22c55e]/20"
            >
              🏋️ {ins.label} · {ins.durationMin} min · ~{ins.burnKcal} kcal
            </p>
          ))}
        </div>
      )}

      {energyBalance?.liveBurnKcal ? (
        <p className="text-[10px] text-[#22c55e] mb-2 leading-snug bg-[#22c55e]/8 rounded-xl px-2.5 py-1.5 border border-[#22c55e]/20">
          🟢 Live activo · ~{energyBalance.liveBurnKcal} kcal extra estimadas
        </p>
      ) : null}

      {coachingTip && (
        <p className="text-[10px] text-[#c084fc] mb-2 leading-snug bg-[#a855f7]/8 rounded-xl px-2.5 py-2 border border-[#a855f7]/20">
          {coachingTip}
        </p>
      )}

      {mealSuggestion && (
        <p className="text-[10px] text-[#e9d5ff] mb-2 leading-snug bg-[#a855f7]/12 rounded-xl px-2.5 py-2 border border-[#a855f7]/25">
          {mealSuggestion}
        </p>
      )}

      {postWorkoutTip && (
        <p className="text-[10px] text-[#22c55e] mb-2 leading-snug bg-[#22c55e]/8 rounded-xl px-2.5 py-2 border border-[#22c55e]/20">
          💡 {postWorkoutTip}
        </p>
      )}

      {todayLogs.length > 0 && (
        <div className="mb-3 space-y-1.5">
          <p className="text-[9px] uppercase tracking-wider text-[#6B7280] font-bold">
            Comidas hoy ({todayLogs.length})
          </p>
          <ul className="space-y-1 max-h-32 overflow-y-auto">
            {todayLogs.slice(0, 8).map((log) => {
              const badge = sourceBadge(log.source)
              const isDeleting = deletingLogId === log.id
              return (
                <li
                  key={log.id}
                  className="flex items-center gap-1.5 text-[10px] bg-white/[0.04] rounded-lg px-2 py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => onEditLog?.(log)}
                    className="flex-1 min-w-0 flex items-center justify-between gap-2 text-left active:opacity-70"
                  >
                    <span className="truncate text-white/90 font-medium">{log.mealLabel}</span>
                    <span className="tabular-nums text-[#9CA3AF] shrink-0 flex items-center gap-1">
                      {badge && <span className="text-[#c084fc]">{badge}</span>}
                      {log.kcal} kcal
                    </span>
                  </button>
                  {onEditLog && (
                    <button
                      type="button"
                      aria-label="Editar comida"
                      onClick={() => onEditLog(log)}
                      className="p-1 rounded-md bg-white/5 text-[#9CA3AF] active:bg-white/10 shrink-0"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                  {onDeleteLog && (
                    <button
                      type="button"
                      aria-label="Eliminar comida"
                      disabled={isDeleting}
                      onClick={() => onDeleteLog(log.id)}
                      className="p-1 rounded-md bg-red-500/10 text-red-400 active:bg-red-500/20 shrink-0 disabled:opacity-40"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onLogMeal}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-black text-[11px] font-extrabold active:opacity-90"
      >
        + Registrar comida (Fuel AI)
      </button>

      <p className="text-[8px] text-[#6B7280] mt-2 text-center leading-snug">
        Estimaciones IA — no es consejo médico. TDEE ref: {profile.tdee} kcal.
      </p>
    </div>
  )
}
