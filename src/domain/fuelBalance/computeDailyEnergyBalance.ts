import type { FuelLogEntry, FuelProfile, Workout } from '../../types'
import { sumFuelLogs } from '../../services/fuel'
import { mergeHealthBurnWithBalance } from '../../services/healthImport'
import { toLocalDateStr } from '../../utils/fuelCalculator'
import {
  estimateLiveBurn,
  estimateWorkoutBurn,
  liveMinutesFromSince,
} from './estimateWorkoutBurn'
import { inferDominantMuscle, workoutInsightLabel } from './inferDominantMuscle'
import type { DailyEnergyBalance, LiveBurnInput, MacroShiftInput } from './types'

function isWorkoutOnDate(workout: Workout, dateStr: string): boolean {
  const d = new Date(workout.endedAt || workout.startedAt)
  return toLocalDateStr(d) === dateStr
}

export function applyMacroShift(input: MacroShiftInput): MacroShiftInput['baseMacros'] {
  const { goal, dominantMuscle, workoutBurnKcal, baseMacros } = input
  if (workoutBurnKcal <= 0) return baseMacros

  let protein = baseMacros.targetProteinG
  let carbs = baseMacros.targetCarbsG
  let fat = baseMacros.targetFatG

  const muscle = (dominantMuscle || '').toLowerCase()
  if (muscle.includes('pierna') || muscle.includes('glúteo') || muscle.includes('full')) {
    protein += 20
  } else if (muscle.includes('pecho') || muscle.includes('espalda') || muscle.includes('push')) {
    protein += 12
    if (goal === 'muscle' || goal === 'gain') carbs += 25
  } else if (muscle.includes('cardio')) {
    carbs += 30
    protein += 8
  } else {
    protein += 10
  }

  const extraKcal = workoutBurnKcal
  const adjustedKcal = baseMacros.targetKcal + extraKcal

  return {
    targetKcal: adjustedKcal,
    targetProteinG: protein,
    targetCarbsG: carbs,
    targetFatG: fat,
  }
}

function buildCoachingLine(
  balance: Omit<DailyEnergyBalance, 'coachingLine'>
): string | undefined {
  const { remaining, dominantMuscle, postWorkoutWindowActive, workoutInsights } = balance
  if (workoutInsights.length === 0 && balance.liveBurnKcal === 0) return undefined

  if (postWorkoutWindowActive && remaining.proteinG > 20) {
    const m = dominantMuscle || 'entreno'
    return `Ventana post-${m.toLowerCase()}: te faltan ~${remaining.proteinG}g proteína para cerrar el balance.`
  }
  if (remaining.kcal > 400) {
    return `Balance ajustado: te quedan ~${remaining.kcal} kcal tras sumar el gasto de hoy.`
  }
  if (remaining.kcal < -100) {
    return 'Vas sobre el target ajustado — prioriza proteína magra en lo que queda.'
  }
  return undefined
}

export function computeDailyEnergyBalance(input: {
  profile: FuelProfile | null
  fuelLogs: FuelLogEntry[]
  workouts: Workout[]
  live?: LiveBurnInput
  healthBurnKcal?: number
  dateStr?: string
}): DailyEnergyBalance | null {
  const { profile, fuelLogs, workouts, live } = input
  if (!profile) return null

  const dateStr = input.dateStr || toLocalDateStr()
  const todayLogs = fuelLogs.filter((l) => l.date === dateStr)
  const consumed = sumFuelLogs(todayLogs)
  const todayWorkouts = workouts.filter((w) => isWorkoutOnDate(w, dateStr))

  const weightKg = profile.weightKg || 70
  const workoutInsights = todayWorkouts.map((w) => {
    const dominantMuscle = inferDominantMuscle(w.exercises, w.type)
    const burnKcal = estimateWorkoutBurn(w, weightKg)
    return {
      workoutId: w.id,
      label: workoutInsightLabel(w.type, dominantMuscle),
      type: w.type,
      durationMin: w.stats?.durationMin || 1,
      burnKcal,
      dominantMuscle,
      source: w.source === 'sync' ? ('sync' as const) : ('workout' as const),
    }
  })

  let liveBurnKcal = 0
  let liveMinutes = 0
  if (live?.trainingNow) {
    liveMinutes = liveMinutesFromSince(
      live.trainingNow,
      live.trainingNowSince,
      live.now
    )
    const loggedMin = workoutInsights.reduce((s, i) => s + i.durationMin, 0)
    const extraLiveMin = Math.max(0, liveMinutes - loggedMin)
    if (extraLiveMin > 0) {
      liveBurnKcal = estimateLiveBurn({ weightKg, durationMin: extraLiveMin })
    }
  }

  const workoutBurnKcal = workoutInsights.reduce((s, i) => s + i.burnKcal, 0)
  const metBurn = workoutBurnKcal + liveBurnKcal
  const healthBurnKcal = Math.max(
    0,
    mergeHealthBurnWithBalance(metBurn, input.healthBurnKcal ?? 0) - metBurn
  )
  const totalBurn = metBurn + healthBurnKcal

  const dominantMuscle =
    inferDominantMuscle(
      todayWorkouts.flatMap((w) => w.exercises),
      todayWorkouts[0]?.type
    ) || workoutInsights[0]?.dominantMuscle

  const baseTargetKcal = profile.targetKcal
  const baseMacros = {
    targetKcal: profile.targetKcal,
    targetProteinG: profile.targetProteinG,
    targetCarbsG: profile.targetCarbsG,
    targetFatG: profile.targetFatG,
  }

  const macroTargets = applyMacroShift({
    goal: profile.goal,
    dominantMuscle,
    workoutBurnKcal: totalBurn,
    baseMacros,
  })

  const remaining = {
    kcal: macroTargets.targetKcal - consumed.kcal,
    proteinG: macroTargets.targetProteinG - consumed.proteinG,
    carbsG: macroTargets.targetCarbsG - consumed.carbsG,
    fatG: macroTargets.targetFatG - consumed.fatG,
  }

  const lastWorkoutEnd = todayWorkouts.reduce(
    (max, w) => Math.max(max, w.endedAt || w.startedAt || 0),
    0
  )
  const postWorkoutWindowActive =
    totalBurn > 0 &&
    (live?.trainingNow ||
      (lastWorkoutEnd > 0 && Date.now() - lastWorkoutEnd < 4 * 60 * 60 * 1000))

  const partial: Omit<DailyEnergyBalance, 'coachingLine'> = {
    baseTargetKcal,
    workoutBurnKcal,
    liveBurnKcal,
    healthBurnKcal,
    adjustedTargetKcal: macroTargets.targetKcal,
    consumed,
    remaining,
    macroTargets,
    workoutInsights,
    dominantMuscle,
    postWorkoutWindowActive,
  }

  return {
    ...partial,
    coachingLine: buildCoachingLine(partial),
  }
}

/** Combined burn for sync summary (both partners estimate from duration). */
export function estimateSyncSessionBurn(
  weightKg: number,
  durationMin: number
): number {
  return estimateWorkoutBurn(
    {
      type: 'full',
      stats: { durationMin, totalVolumeKg: 6000, totalSets: 12, exerciseCount: 4 },
      exercises: [],
    },
    weightKg
  )
}
