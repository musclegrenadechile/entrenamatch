import type { FuelGoal, WorkoutType } from '../../types'

export interface WorkoutFuelInsight {
  workoutId?: string
  label: string
  type: WorkoutType
  durationMin: number
  burnKcal: number
  dominantMuscle?: string
  source: 'workout' | 'live' | 'sync'
}

export interface DailyMacroTargets {
  targetKcal: number
  targetProteinG: number
  targetCarbsG: number
  targetFatG: number
}

export interface DailyEnergyBalance {
  baseTargetKcal: number
  workoutBurnKcal: number
  liveBurnKcal: number
  adjustedTargetKcal: number
  consumed: { kcal: number; proteinG: number; carbsG: number; fatG: number }
  remaining: { kcal: number; proteinG: number; carbsG: number; fatG: number }
  macroTargets: DailyMacroTargets
  workoutInsights: WorkoutFuelInsight[]
  dominantMuscle?: string
  coachingLine?: string
  postWorkoutWindowActive: boolean
}

export interface LiveBurnInput {
  trainingNow: boolean
  trainingNowSince?: number | null
  weightKg: number
  now?: number
}

export interface MacroShiftInput {
  goal: FuelGoal
  dominantMuscle?: string
  workoutBurnKcal: number
  baseMacros: DailyMacroTargets
}
