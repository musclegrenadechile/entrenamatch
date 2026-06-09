import { Brain, Dumbbell, Share2, Sparkles, Footprints, Moon } from 'lucide-react'
import type { WeeklyPlanResult } from '../../domain/weeklyPlan'

const SCENARIO_STYLES: Record<string, string> = {
  surplus: 'from-[#f97316]/20 to-[#ea580c]/10 border-[#f97316]/35',
  deficit: 'from-[#22c55e]/20 to-[#16a34a]/10 border-[#22c55e]/35',
  catch_up: 'from-[#6366f1]/20 to-[#4f46e5]/10 border-[#6366f1]/35',
  rest_needed: 'from-[#64748b]/20 to-[#475569]/10 border-[#64748b]/35',
  under_fueled: 'from-[#a855f7]/20 to-[#9333ea]/10 border-[#a855f7]/35',
  on_track: 'from-[#FF671F]/20 to-[#ea580c]/10 border-[#FF671F]/35',
}

function ActivityIcon({ type }: { type: WeeklyPlanResult['recommendation']['type'] }) {
  if (type === 'walk') return <Footprints size={16} className="text-[#38bdf8]" />
  if (type === 'rest') return <Moon size={16} className="text-[#94a3b8]" />
  if (type === 'cardio') return <Sparkles size={16} className="text-[#f472b6]" />
  return <Dumbbell size={16} className="text-[#22c55e]" />
}

export interface WeeklyPlanCardProps {
  plan: WeeklyPlanResult | null
  enriching?: boolean
  onStartWorkout?: (plan: WeeklyPlanResult) => void
  onSharePlan?: (plan: WeeklyPlanResult) => void
  onOpenFuelSetup?: () => void
}

export function WeeklyPlanCard({
  plan,
  enriching = false,
  onStartWorkout,
  onSharePlan,
  onOpenFuelSetup,
}: WeeklyPlanCardProps) {
  if (!plan) {
    return (
      <div className="rounded-3xl p-4 bg-gradient-to-br from-[#141418] via-[#12121a] to-[#0f0f12] border border-[#2F2F35]">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#FF671F] font-bold">EntrenaPlan</p>
        <h3 className="text-sm font-black text-white mt-1">Plan inteligente semanal</h3>
        <p className="text-[11px] text-[#9CA3AF] mt-1 leading-snug">
          Configura Fuel y registra comidas + entrenos. Te recomendamos la próxima sesión según tu balance
          calórico y carga de la semana.
        </p>
        {onOpenFuelSetup && (
          <button
            type="button"
            onClick={onOpenFuelSetup}
            className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF671F] to-[#ea580c] text-black text-[11px] font-extrabold"
          >
            Activar con Fuel →
          </button>
        )}
      </div>
    )
  }

  const rec = plan.recommendation
  const style = SCENARIO_STYLES[plan.scenario] || SCENARIO_STYLES.on_track
  const confidenceLabel =
    plan.confidence === 'high' ? 'Alta' : plan.confidence === 'medium' ? 'Media' : 'Baja'

  return (
    <div
      className={`rounded-3xl p-4 bg-gradient-to-br border ${style}`}
      aria-label="Plan de entreno recomendado"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#FF671F] font-bold flex items-center gap-1">
            EntrenaPlan
            {plan.source === 'ai' && (
              <span className="text-[#c084fc] flex items-center gap-0.5">
                <Brain size={10} /> IA
              </span>
            )}
          </p>
          <h3 className="text-sm font-black text-white mt-0.5">{plan.headline}</h3>
        </div>
        <span className="text-[9px] text-[#9CA3AF] tabular-nums shrink-0">
          conf. {confidenceLabel}
        </span>
      </div>

      <p className="text-[11px] text-[#d1d5db] mt-2 leading-snug">{plan.detail}</p>

      <div className="mt-3 rounded-2xl bg-black/30 border border-white/10 p-3">
        <div className="flex items-center gap-2">
          <ActivityIcon type={rec.type} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-white truncate">{rec.title}</p>
            <p className="text-[10px] text-[#9CA3AF]">
              {rec.durationMin} min · ~{rec.estimatedBurnKcal} kcal · {rec.intensity}
            </p>
          </div>
        </div>
        {rec.exercises.length > 0 && rec.type !== 'walk' && (
          <p className="text-[10px] text-[#6B7280] mt-2 leading-relaxed">
            {rec.exercises.slice(0, 4).join(' · ')}
          </p>
        )}
      </div>

      {plan.nutritionNote && (
        <p className="text-[10px] text-[#c084fc] mt-2 leading-snug">🍽 {plan.nutritionNote}</p>
      )}

      {plan.energySummary.loggedDays > 0 && (
        <p className="text-[9px] text-[#6B7280] mt-2">
          Semana: {plan.energySummary.totalConsumedKcal} kcal consumidas · ~
          {plan.energySummary.totalBurnKcal} quemadas · Δ{' '}
          {plan.energySummary.weeklyDeltaKcal > 0 ? '+' : ''}
          {plan.energySummary.weeklyDeltaKcal} vs objetivo
        </p>
      )}

      <div className="flex gap-2 mt-3">
        {onStartWorkout && rec.type !== 'rest' && (
          <button
            type="button"
            disabled={enriching}
            onClick={() => onStartWorkout(plan)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black text-[11px] font-extrabold active:scale-[0.98] disabled:opacity-60"
          >
            {enriching ? 'Afinando…' : 'Empezar rutina →'}
          </button>
        )}
        {onStartWorkout && rec.type === 'rest' && (
          <button
            type="button"
            onClick={() => onStartWorkout(plan)}
            className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-[11px] font-bold border border-white/15"
          >
            Registrar movilidad
          </button>
        )}
        {onSharePlan && (
          <button
            type="button"
            onClick={() => onSharePlan(plan)}
            className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#9CA3AF]"
            aria-label="Compartir plan"
          >
            <Share2 size={16} />
          </button>
        )}
      </div>

      <p className="text-[8px] text-[#4B5563] mt-2 leading-snug">{plan.disclaimer}</p>
    </div>
  )
}
