import type { FuelGoal, FuelProfile, WorkoutType } from '../types'

export type ActivityLevel = FuelProfile['activityLevel']

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

/** Mifflin-St Jeor BMR → TDEE with activity multiplier. */
export function calculateTdee(input: {
  weightKg: number
  heightCm: number
  age: number
  gender: 'hombre' | 'mujer'
  activityLevel: ActivityLevel
}): number {
  const w = input.weightKg
  const h = input.heightCm
  const a = input.age
  const bmr =
    input.gender === 'hombre'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[input.activityLevel])
}

export function targetKcalFromGoal(tdee: number, goal: FuelGoal): number {
  if (goal === 'lose') return Math.round(tdee * 0.85)
  if (goal === 'gain') return Math.round(tdee * 1.1)
  if (goal === 'muscle') return Math.round(tdee * 1.08)
  return tdee
}

/** Simple macro split: 30% protein / 40% carbs / 30% fat (adjust for muscle). */
export function macroTargetsFromKcal(kcal: number, goal: FuelGoal) {
  const proteinRatio = goal === 'muscle' ? 0.32 : 0.3
  const fatRatio = goal === 'lose' ? 0.28 : 0.3
  const carbsRatio = 1 - proteinRatio - fatRatio
  return {
    targetKcal: kcal,
    targetProteinG: Math.round((kcal * proteinRatio) / 4),
    targetCarbsG: Math.round((kcal * carbsRatio) / 4),
    targetFatG: Math.round((kcal * fatRatio) / 9),
  }
}

export function buildFuelProfile(input: {
  weightKg: number
  heightCm: number
  age: number
  gender: 'hombre' | 'mujer'
  goal: FuelGoal
  activityLevel: ActivityLevel
  restrictions?: string
}): Omit<FuelProfile, 'updatedAt'> {
  const tdee = calculateTdee(input)
  const targetKcal = targetKcalFromGoal(tdee, input.goal)
  const macros = macroTargetsFromKcal(targetKcal, input.goal)
  return {
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    age: input.age,
    gender: input.gender,
    goal: input.goal,
    activityLevel: input.activityLevel,
    restrictions: input.restrictions?.trim() || undefined,
    tdee,
    ...macros,
  }
}

export function toLocalDateStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getPostWorkoutFuelTip(workoutType?: WorkoutType): string | undefined {
  if (!workoutType) return undefined
  if (workoutType === 'legs')
    return 'Después de piernas: apunta a 30–40g de proteína en las próximas 2 horas.'
  if (workoutType === 'push' || workoutType === 'pull')
    return 'Post torso: combina proteína + carbohidratos para recuperar mejor.'
  if (workoutType === 'cardio')
    return 'Post cardio: hidrata bien y suma carbohidratos moderados + proteína ligera.'
  if (workoutType === 'full')
    return 'Full body hoy: reparte proteína en 2 comidas antes de dormir.'
  return 'Buen entreno — cierra el día acercándote a tu target de proteína.'
}

/** Client-side fallback when Fuel AI function is unavailable. */
export function estimateMacrosFromDescription(text: string): {
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  label: string
  tip: string
} {
  const t = text.toLowerCase()
  let kcal = 450
  let label = text.slice(0, 60) || 'Comida'

  if (t.includes('ensalada') || t.includes('verdura')) kcal = 280
  else if (t.includes('pollo') || t.includes('pechuga')) kcal = 420
  else if (t.includes('arroz') || t.includes('pasta')) kcal = 520
  else if (t.includes('hamburg') || t.includes('pizza')) kcal = 750
  else if (t.includes('batido') || t.includes('proteína') || t.includes('proteina')) kcal = 320
  else if (t.includes('desayuno') || t.includes('avena')) kcal = 380

  const proteinG = Math.round(kcal * 0.28 / 4)
  const fatG = Math.round(kcal * 0.3 / 9)
  const carbsG = Math.round((kcal - proteinG * 4 - fatG * 9) / 4)

  return {
    kcal,
    proteinG,
    carbsG,
    fatG,
    label,
    tip: 'Estimación aproximada — no es consejo médico. Ajusta manualmente si hace falta.',
  }
}
