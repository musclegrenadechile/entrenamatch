import { Brain, Dumbbell, Megaphone, Share2, Sparkles, Footprints, Moon, UtensilsCrossed } from 'lucide-react'
import type { WeeklyPlanResult } from '../../domain/weeklyPlan'
import type { Workout } from '../../types'
import { EmV2EmptyState } from '../ui/EmV2EmptyState'
import {
  buildWeeklyPlanHistoryAriaLabel,
  buildWeeklyPlanHistoryHint,
  shouldShowWeeklyPlanHistoryHint,
  WEEKLY_PLAN_HISTORY_HINT_CLASS,
} from '../../utils/weeklyPlanHistoryDisplay'
import {
  buildWeeklyPlanRotationAriaLabel,
  buildWeeklyPlanRotationChipText,
  shouldShowWeeklyPlanRotationChip,
  WEEKLY_PLAN_ROTATION_CHIP_CLASS,
} from '../../utils/weeklyPlanRotationDisplay'
import {
  buildWeeklyPlanFuelWeekAriaLabel,
  buildWeeklyPlanFuelWeekHint,
  shouldShowWeeklyPlanFuelWeekHint,
  WEEKLY_PLAN_FUEL_WEEK_HINT_CLASS,
} from '../../utils/weeklyPlanFuelWeekDisplay'
import {
  buildWeeklyPlanFuelWeekChipAriaLabel,
  buildWeeklyPlanFuelWeekChipText,
  resolveWeeklyPlanFuelWeekChipToneClass,
  shouldShowWeeklyPlanFuelWeekChip,
  WEEKLY_PLAN_FUEL_WEEK_CHIP_CLASS,
} from '../../utils/weeklyPlanFuelWeekChipDisplay'
import {
  buildWeeklyPlanNutritionAriaLabel,
  buildWeeklyPlanNutritionFuelSuffix,
  mergeWeeklyPlanNutritionNote,
  shouldShowWeeklyPlanNutritionNote,
  WEEKLY_PLAN_NUTRITION_CLASS,
} from '../../utils/weeklyPlanNutritionDisplay'
import {
  resolveWeeklyPlanFuelWeekHintTone,
  resolveWeeklyPlanFuelWeekHintToneClass,
} from '../../utils/weeklyPlanFuelWeekToneDisplay'
import {
  formatWeeklyPlanDelta,
  resolveWeeklyPlanScenarioClass,
  shouldRenderWeeklyPlanEmpty,
  shouldShowWeeklyPlanFuelRow,
} from './weeklyPlanCardDisplay'

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
  onPublishPlanToFeed?: (plan: WeeklyPlanResult) => void
  onSharePlanExternally?: (plan: WeeklyPlanResult) => void
  onOpenFuelSetup?: () => void
  onOpenFuelLog?: () => void
  weeklyDeltaKcal?: number
  hasFuelProfile?: boolean
  /** Historial reciente para hint PR en EntrenaPlan (oleada 401). */
  recentWorkouts?: Workout[]
  /** Solo día 1 en Hoy — evita ruido «Activar Fuel» sin perfil. */
  showEmptyState?: boolean
}

export function WeeklyPlanCard({
  plan,
  enriching = false,
  onStartWorkout,
  onPublishPlanToFeed,
  onSharePlanExternally,
  onOpenFuelSetup,
  onOpenFuelLog,
  weeklyDeltaKcal,
  hasFuelProfile = false,
  recentWorkouts = [],
  showEmptyState = true,
}: WeeklyPlanCardProps) {
  if (!plan) {
    if (!shouldRenderWeeklyPlanEmpty(plan, showEmptyState)) return null
    return (
      <div className="em-v2-card em-v2-card--brand">
        <EmV2EmptyState
          compact
          emoji="🧠"
          title="EntrenaPlan"
          body="Configura Fuel y registra comidas + entrenos. Te recomendamos la próxima sesión según tu balance y carga semanal."
        >
          {onOpenFuelSetup && (
            <button type="button" onClick={onOpenFuelSetup} className="em-v2-hero-card__cta">
              Activar con Fuel →
            </button>
          )}
        </EmV2EmptyState>
      </div>
    )
  }

  const rec = plan.recommendation
  const scenarioClass = resolveWeeklyPlanScenarioClass(plan.scenario)
  const historyHint = buildWeeklyPlanHistoryHint(recentWorkouts)
  const showHistoryHint = shouldShowWeeklyPlanHistoryHint(rec.type, historyHint)
  const rotationNote = plan.trainingLoad.prRotationNote
  const showRotationChip = shouldShowWeeklyPlanRotationChip(rotationNote, rec.type)
  const fuelWeekHint = buildWeeklyPlanFuelWeekHint(plan.scenario, plan.energySummary)
  const showFuelWeekHint = shouldShowWeeklyPlanFuelWeekHint(fuelWeekHint, hasFuelProfile)
  const fuelWeekToneClass = resolveWeeklyPlanFuelWeekHintToneClass(
    resolveWeeklyPlanFuelWeekHintTone(plan.scenario, plan.energySummary)
  )
  const fuelWeekChipText = buildWeeklyPlanFuelWeekChipText(plan.scenario, plan.energySummary)
  const showFuelWeekChip = shouldShowWeeklyPlanFuelWeekChip(
    plan.scenario,
    plan.energySummary,
    hasFuelProfile
  )
  const fuelWeekChipToneClass = resolveWeeklyPlanFuelWeekChipToneClass(
    plan.scenario,
    plan.energySummary
  )
  const nutritionText = mergeWeeklyPlanNutritionNote(
    plan.nutritionNote,
    buildWeeklyPlanNutritionFuelSuffix(plan.scenario, plan.energySummary)
  )
  const showNutritionNote = shouldShowWeeklyPlanNutritionNote(nutritionText, hasFuelProfile)

  return (
    <div className={`em-v2-card em-v2-plan ${scenarioClass}`} aria-label="Plan de entreno recomendado">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="em-v2-training__eyebrow flex items-center gap-1">
            EntrenaPlan
            {plan.source === 'ai' && (
              <span className="text-[#c084fc] flex items-center gap-0.5">
                <Brain size={10} /> IA
              </span>
            )}
          </p>
          <h3 className="em-v2-card__title text-sm mt-0.5">{plan.headline}</h3>
        </div>
      </div>

      <p className="em-v2-card__detail mt-2 leading-snug">{plan.detail}</p>

      {showRotationChip && rotationNote && (
        <p
          className={WEEKLY_PLAN_ROTATION_CHIP_CLASS}
          role="status"
          aria-label={buildWeeklyPlanRotationAriaLabel(rotationNote)}
        >
          {buildWeeklyPlanRotationChipText(rotationNote)}
        </p>
      )}

      {showHistoryHint && historyHint && (
        <p
          className={WEEKLY_PLAN_HISTORY_HINT_CLASS}
          role="status"
          aria-label={buildWeeklyPlanHistoryAriaLabel(historyHint)}
        >
          {historyHint}
        </p>
      )}

      {shouldShowWeeklyPlanFuelRow(hasFuelProfile, weeklyDeltaKcal) && (
        <div className="em-v2-plan__fuel-row">
          <span className="text-[#c084fc] flex items-center gap-1">
            <UtensilsCrossed size={12} /> Fuel × entreno
          </span>
          {weeklyDeltaKcal != null && (
            <span className="font-bold tabular-nums text-white">
              {formatWeeklyPlanDelta(weeklyDeltaKcal)}
            </span>
          )}
          {onOpenFuelLog && (
            <button type="button" onClick={onOpenFuelLog} className="em-v2-card__cta--ghost text-[10px] ml-auto">
              + Comida
            </button>
          )}
        </div>
      )}

      {showFuelWeekChip && fuelWeekChipText && (
        <span
          className={[WEEKLY_PLAN_FUEL_WEEK_CHIP_CLASS, fuelWeekChipToneClass]
            .filter(Boolean)
            .join(' ')}
          role="status"
          aria-label={buildWeeklyPlanFuelWeekChipAriaLabel(fuelWeekChipText)}
        >
          {fuelWeekChipText}
        </span>
      )}

      {showFuelWeekHint && fuelWeekHint && (
        <p
          className={[WEEKLY_PLAN_FUEL_WEEK_HINT_CLASS, fuelWeekToneClass]
            .filter(Boolean)
            .join(' ')}
          role="status"
          aria-label={buildWeeklyPlanFuelWeekAriaLabel(fuelWeekHint)}
        >
          {fuelWeekHint}
        </p>
      )}

      <div className="em-v2-plan__rec">
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

      {showNutritionNote && nutritionText && (
        <p
          className={WEEKLY_PLAN_NUTRITION_CLASS}
          role="status"
          aria-label={buildWeeklyPlanNutritionAriaLabel(nutritionText)}
        >
          🍽 {nutritionText}
        </p>
      )}

      {plan.energySummary.loggedDays > 0 && (
        <p className="text-[10px] text-[#6B7280] mt-2">
          Semana: {plan.energySummary.totalConsumedKcal} kcal consumidas · ~
          {plan.energySummary.totalBurnKcal} quemadas
        </p>
      )}

      <div className="flex gap-2 mt-3">
        {onStartWorkout && rec.type !== 'rest' && (
          <button
            type="button"
            disabled={enriching}
            onClick={() => onStartWorkout(plan)}
            className="em-v2-plan__start flex-1 disabled:opacity-60"
          >
            {enriching ? 'Afinando…' : 'Empezar rutina →'}
          </button>
        )}
        {onStartWorkout && rec.type === 'rest' && (
          <button type="button" onClick={() => onStartWorkout(plan)} className="em-v2-cta-secondary flex-1">
            Registrar movilidad
          </button>
        )}
      </div>

      {(onPublishPlanToFeed || onSharePlanExternally) && (
        <div className="flex gap-2 mt-2">
          {onPublishPlanToFeed && (
            <button
              type="button"
              onClick={() => onPublishPlanToFeed(plan)}
              className="em-v2-card__cta--outline flex-1 text-[10px] flex items-center justify-center gap-1.5"
            >
              <Megaphone size={12} />
              Publicar en muro
            </button>
          )}
          {onSharePlanExternally && (
            <button
              type="button"
              onClick={() => onSharePlanExternally(plan)}
              className="em-v2-card__cta--outline flex-1 text-[10px] flex items-center justify-center gap-1.5"
            >
              <Share2 size={12} />
              Compartir fuera
            </button>
          )}
        </div>
      )}

      <p className="text-[10px] text-[#4B5563] mt-2 leading-snug">{plan.disclaimer}</p>
    </div>
  )
}