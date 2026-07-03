import type { FuelGoal, WorkoutType } from '../../types'

export type PlanScenario =
  | 'surplus'
  | 'deficit'
  | 'on_track'
  | 'under_fueled'
  | 'rest_needed'
  | 'catch_up'

export type RecommendedActivityType = 'strength' | 'cardio' | 'walk' | 'rest' | 'mobility'

export type PlanConfidence = 'high' | 'medium' | 'low'

export interface WeeklyEnergySummary {
  weekKey: string
  loggedDays: number
  totalConsumedKcal: number
  totalBurnKcal: number
  totalTargetKcal: number
  weeklyDeltaKcal: number
  avgDailyDeltaKcal: number
  todayRemainingKcal?: number
}

export interface WeeklyTrainingLoad {
  sessionsCount: number
  activeDays: number
  daysSinceLastSession: number
  lastWorkoutType?: WorkoutType
  fatiguedMuscleGroups: string[]
  suggestedWorkoutType: WorkoutType
  /** Grupos musculares con PR reciente (oleada 404). */
  recentPrMuscleGroups?: string[]
  prRotationNote?: string
}

export interface PlanRecommendation {
  type: RecommendedActivityType
  workoutType?: WorkoutType
  durationMin: number
  estimatedBurnKcal: number
  intensity: 'light' | 'moderate' | 'intense'
  exercises: string[]
  title: string
}

export interface WeeklyPlanResult {
  scenario: PlanScenario
  headline: string
  detail: string
  recommendation: PlanRecommendation
  nutritionNote?: string
  confidence: PlanConfidence
  disclaimer: string
  weekKey: string
  generatedAt: number
  energySummary: WeeklyEnergySummary
  trainingLoad: WeeklyTrainingLoad
  source: 'rules' | 'ai'
}

export interface WeeklyPlanContext {
  profile: {
    goal: FuelGoal
    weightKg: number
    level: 'Principiante' | 'Intermedio' | 'Avanzado'
    restrictions?: string
    targetKcal: number
  }
  energy: WeeklyEnergySummary
  load: WeeklyTrainingLoad
  todayRemainingKcal?: number
  now?: number
}
