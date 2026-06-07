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
  const profile: Omit<FuelProfile, 'updatedAt'> = {
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    age: input.age,
    gender: input.gender,
    goal: input.goal,
    activityLevel: input.activityLevel,
    tdee,
    ...macros,
  }
  const restrictions = input.restrictions?.trim()
  if (restrictions) profile.restrictions = restrictions
  return profile
}

export function toLocalDateStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const GOAL_LABELS: Record<FuelGoal, string> = {
  lose: 'perder grasa',
  maintain: 'mantener peso',
  muscle: 'ganar músculo',
  gain: 'subir peso',
}

/** Context sent to Gemini for personalized meal analysis. */
export function buildFuelAnalyzeContext(
  profile: FuelProfile | null | undefined,
  totals: { kcal: number; proteinG: number; carbsG: number; fatG: number }
) {
  if (!profile) return undefined
  return {
    goal: profile.goal,
    goalLabel: GOAL_LABELS[profile.goal],
    restrictions: profile.restrictions?.trim() || undefined,
    targetKcal: profile.targetKcal,
    targetProteinG: profile.targetProteinG,
    consumedKcal: totals.kcal,
    consumedProteinG: totals.proteinG,
    remainingKcal: Math.max(0, profile.targetKcal - totals.kcal),
    remainingProteinG: Math.max(0, profile.targetProteinG - totals.proteinG),
  }
}

/** Short coaching line for FuelDayCard based on progress today. */
export function getFuelCoachingTip(
  profile: FuelProfile,
  totals: { kcal: number; proteinG: number; carbsG: number; fatG: number; entryCount: number }
): string | undefined {
  if (totals.entryCount === 0) {
    return `Objetivo hoy: ${profile.targetKcal} kcal · ${profile.targetProteinG}g proteína. Registra tu primera comida con Fuel AI.`
  }
  const remKcal = profile.targetKcal - totals.kcal
  const remP = profile.targetProteinG - totals.proteinG
  if (remKcal < -150) {
    return 'Vas sobre el target de kcal — prioriza proteína magra y verduras en lo que queda del día.'
  }
  if (remP > 25) {
    return `Te faltan ~${remP}g proteína. Un plato con pollo, huevos o batido te acerca al objetivo.`
  }
  if (remKcal > 400 && profile.goal === 'muscle') {
    return `Quedan ~${remKcal} kcal — buen margen post-entreno para carbs + proteína.`
  }
  if (remKcal > 0 && remKcal <= 400) {
    return `Cerca del cierre: ~${remKcal} kcal restantes para completar el día.`
  }
  return undefined
}

const MEAL_IDEAS_PROTEIN = [
  'Pechuga de pollo + ensalada',
  '3 huevos revueltos + tostadas integrales',
  'Batido whey + plátano',
  'Atún + arroz integral',
]

/** Actionable meal idea based on remaining macros (local, no API cost). */
export function getFuelMealSuggestion(
  profile: FuelProfile,
  totals: { kcal: number; proteinG: number; entryCount: number }
): string | undefined {
  if (totals.entryCount === 0) return undefined
  const remKcal = profile.targetKcal - totals.kcal
  const remP = profile.targetProteinG - totals.proteinG
  if (remKcal <= 0 && remP <= 5) return undefined

  if (remP > 20) {
    const idea = MEAL_IDEAS_PROTEIN[totals.entryCount % MEAL_IDEAS_PROTEIN.length]
    return `💡 ${idea} · ~${Math.min(remP, 45)}g proteína que te faltan`
  }
  if (remKcal > 280 && profile.goal !== 'lose') {
    return `💡 Arroz + proteína magra · ~${remKcal} kcal restantes para cerrar el día`
  }
  if (remKcal > 0 && remKcal <= 280) {
    return `💡 Snack: yogur griego o frutos secos · ~${remKcal} kcal restantes`
  }
  return undefined
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
