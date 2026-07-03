import type { FuelGoal } from '../../types'
import { estimateBurnFromMet, estimateWorkoutBurn } from '../fuelBalance/estimateWorkoutBurn'
import { buildPlanExercises, planTitleForType } from './buildPlanExercises'
import type {
  PlanConfidence,
  PlanScenario,
  WeeklyEnergySummary,
  WeeklyPlanContext,
  WeeklyPlanResult,
  WeeklyTrainingLoad,
} from './types'

const DISCLAIMER =
  'Estimaciones orientativas según tu registro en EntrenaMatch. No sustituye consejo médico ni nutricional profesional.'

function confidenceFromLogs(loggedDays: number): PlanConfidence {
  if (loggedDays >= 4) return 'high'
  if (loggedDays >= 2) return 'medium'
  return 'low'
}

function pickScenario(
  goal: FuelGoal,
  energy: WeeklyEnergySummary,
  load: WeeklyTrainingLoad,
  todayRemaining?: number
): PlanScenario {
  if (energy.loggedDays < 2) return 'under_fueled'
  if (load.daysSinceLastSession === 0 && load.sessionsCount >= 5) return 'rest_needed'
  if (load.daysSinceLastSession >= 3 && load.sessionsCount <= 1) return 'catch_up'

  const surplusThreshold = goal === 'lose' ? 350 : 600
  const deficitThreshold = goal === 'muscle' || goal === 'gain' ? -400 : -250

  if (todayRemaining !== undefined && todayRemaining < -200) return 'surplus'
  if (energy.weeklyDeltaKcal > surplusThreshold) return 'surplus'
  if (energy.weeklyDeltaKcal < deficitThreshold) return 'deficit'
  return 'on_track'
}

function durationForLevel(
  level: WeeklyPlanContext['profile']['level'],
  base: number
): number {
  if (level === 'Principiante') return Math.max(25, base - 10)
  if (level === 'Avanzado') return base + 10
  return base
}

export function recommendNextSessions(ctx: WeeklyPlanContext): WeeklyPlanResult {
  const { profile, energy, load } = ctx
  const todayRemaining = ctx.todayRemainingKcal ?? energy.todayRemainingKcal
  const scenario = pickScenario(profile.goal, energy, load, todayRemaining)
  const confidence = confidenceFromLogs(energy.loggedDays)
  const weightKg = profile.weightKg || 70
  const now = ctx.now ?? Date.now()

  let activityType: WeeklyPlanResult['recommendation']['type'] = 'strength'
  let workoutType = load.suggestedWorkoutType
  let durationMin = durationForLevel(profile.level, 45)
  let intensity: 'light' | 'moderate' | 'intense' = 'moderate'
  let headline = 'Tu próximo entreno'
  let detail = 'Según tu semana de Fuel y EntrenaLog.'
  let nutritionNote: string | undefined

  switch (scenario) {
    case 'under_fueled':
      activityType = 'strength'
      workoutType = load.suggestedWorkoutType
      durationMin = durationForLevel(profile.level, 40)
      headline = 'Registra más comidas para afinar el plan'
      detail =
        'Con pocos días de Fuel, el plan usa tu historial de entrenos. Registra 2–3 días más para recomendaciones calóricas precisas.'
      nutritionNote = 'Empieza a registrar comidas en Fuel para ver balance real.'
      break

    case 'rest_needed':
      activityType = 'rest'
      durationMin = 20
      headline = 'Día de descanso activo'
      detail =
        'Llevas buena carga esta semana. Caminata ligera o movilidad ayudan a recuperar sin sumar fatiga.'
      nutritionNote = 'Prioriza proteína y sueño; mañana vuelve con fuerza moderada.'
      break

    case 'catch_up':
      activityType = 'strength'
      workoutType = 'full'
      durationMin = durationForLevel(profile.level, 40)
      intensity = 'moderate'
      headline = 'Retoma ritmo con full body'
      detail = `Van ${load.daysSinceLastSession} días sin sesión registrada. Un full body moderado reactiva la semana.`
      nutritionNote =
        profile.goal === 'muscle' || profile.goal === 'gain'
          ? 'Cierra el día con proteína + carbs tras el entreno.'
          : undefined
      break

    case 'surplus':
      if (profile.goal === 'lose' || (todayRemaining !== undefined && todayRemaining < -150)) {
        activityType = 'walk'
        workoutType = 'cardio'
        durationMin = 35
        intensity = 'light'
        headline = 'Compensa con movimiento ligero'
        detail =
          energy.weeklyDeltaKcal > 0
            ? `Balance semanal ~+${energy.weeklyDeltaKcal} kcal vs objetivo. Caminata o cardio suave crea déficit sin castigar recuperación.`
            : 'Hoy vas sobre el target — mañana prioriza caminata o cardio moderado.'
        nutritionNote = 'No hace falta “quemar todo” en un día; cena ligera y proteína magra.'
      } else {
        activityType = 'strength'
        durationMin = durationForLevel(profile.level, 40)
        intensity = 'moderate'
        headline = 'Mantén fuerza, baja volumen extra'
        detail = 'Margen calórico alto: entrena normal pero evita cardio largo adicional.'
      }
      break

    case 'deficit':
      activityType = 'strength'
      workoutType = load.suggestedWorkoutType
      durationMin = durationForLevel(profile.level, 50)
      intensity = profile.goal === 'muscle' ? 'intense' : 'moderate'
      headline = 'Fuerza con buen aporte'
      detail =
        'Buen momento para entrenar fuerza y cerrar proteína — tu cuerpo necesita combustible para rendir esta semana.'
      nutritionNote = 'Prioriza carbs + proteína post-entreno; evita cardio largo de más.'
      break

    case 'on_track':
    default:
      activityType = 'strength'
      workoutType = load.suggestedWorkoutType
      durationMin = durationForLevel(profile.level, 45)
      headline = 'Siguiente sesión recomendada'
      detail = `Ritmo equilibrado: ${load.sessionsCount} sesiones esta semana. Rotación sugerida: ${workoutType}.`
      if (load.prRotationNote) detail = `${detail} ${load.prRotationNote}`
      if (profile.goal === 'lose') {
        nutritionNote = 'Mantén proteína alta; snacks controlados entre comidas.'
      }
      break
  }

  if (activityType === 'rest') {
    durationMin = 25
    workoutType = 'other'
  }

  const exercises =
    activityType === 'walk'
      ? ['Caminata activa', 'Estiramientos 10 min']
      : activityType === 'rest'
        ? ['Movilidad cadera/hombro', 'Caminata suave 20 min']
        : activityType === 'cardio'
          ? buildPlanExercises('cardio', profile.level, 3).map((e) => e.name)
          : buildPlanExercises(workoutType, profile.level).map((e) => e.name)

  let estimatedBurnKcal = 0
  if (activityType === 'walk') {
    estimatedBurnKcal = estimateBurnFromMet(3.5, weightKg, durationMin)
  } else if (activityType === 'rest') {
    estimatedBurnKcal = estimateBurnFromMet(2.5, weightKg, durationMin)
  } else if (activityType === 'cardio') {
    estimatedBurnKcal = estimateWorkoutBurn(
      { type: 'cardio', stats: { durationMin, totalVolumeKg: 0, totalSets: 0, exerciseCount: 1 }, exercises: [] },
      weightKg,
      false
    )
  } else {
    estimatedBurnKcal = estimateWorkoutBurn(
      {
        type: workoutType,
        stats: { durationMin, totalVolumeKg: 4000, totalSets: 12, exerciseCount: exercises.length },
        exercises: [],
      },
      weightKg
    )
  }

  const title =
    activityType === 'walk'
      ? 'Caminata compensatoria'
      : activityType === 'rest'
        ? 'Descanso activo'
        : planTitleForType(workoutType, intensity)

  return {
    scenario,
    headline,
    detail,
    recommendation: {
      type: activityType,
      workoutType: activityType === 'strength' || activityType === 'cardio' ? workoutType : undefined,
      durationMin,
      estimatedBurnKcal,
      intensity,
      exercises,
      title,
    },
    nutritionNote,
    confidence,
    disclaimer: DISCLAIMER,
    weekKey: energy.weekKey,
    generatedAt: now,
    energySummary: energy,
    trainingLoad: load,
    source: 'rules',
  }
}

/** One-liner for notifications / share. */
export function formatWeeklyPlanShareText(plan: WeeklyPlanResult, userName?: string): string {
  const who = userName ? `${userName} · ` : ''
  const rec = plan.recommendation
  return `${who}EntrenaPlan: ${plan.headline} — ${rec.title}, ${rec.durationMin} min (~${rec.estimatedBurnKcal} kcal). ${plan.detail}`
}

/** Copy for WhatsApp, Instagram, etc. — includes invite CTA. */
export function formatWeeklyPlanExternalShareText(plan: WeeklyPlanResult, userName?: string): string {
  const who = userName ? `${userName} comparte su plan en EntrenaMatch` : 'Mi plan en EntrenaMatch'
  const rec = plan.recommendation
  return `${who}: ${plan.headline} — ${rec.title}, ${rec.durationMin} min (~${rec.estimatedBurnKcal} kcal). ${plan.detail} ¿Te sumas? #EntrenaMatch #EntrenaPlan`
}
