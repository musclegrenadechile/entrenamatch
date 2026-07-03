import {
  computeWeeklyEnergySummary,
  inferWeeklyTrainingLoad,
  recommendNextSessions,
} from '../domain/weeklyPlan'
import { buildLast7DaySlots, type FuelWeekMacroDay } from '../services/fuel'
import { buildE2EDemoFuelProfile } from './demoFuelProfile'
import { buildDemoWorkoutFromSave } from './demoWorkoutHistory'

export type E2EDemoFuelWeekScenario = 'under-fueled' | 'surplus' | 'deficit'

const MACRO_PRESETS: Record<
  E2EDemoFuelWeekScenario,
  { loggedDayCount: number; kcalPerDay: number }
> = {
  'under-fueled': { loggedDayCount: 1, kcalPerDay: 2100 },
  surplus: { loggedDayCount: 5, kcalPerDay: 4200 },
  deficit: { loggedDayCount: 5, kcalPerDay: 1600 },
}

/** Macros semanales demo para E2E Fuel×EntrenaPlan (oleada 413). */
export function buildE2EDemoFuelWeekMacros(
  scenario: E2EDemoFuelWeekScenario = 'under-fueled'
): FuelWeekMacroDay[] {
  const preset = MACRO_PRESETS[scenario]
  const slots = buildLast7DaySlots()

  return slots.map((slot, index) => {
    const logged = index >= slots.length - preset.loggedDayCount
    const kcal = logged ? preset.kcalPerDay : 0
    return {
      ...slot,
      logged,
      kcal,
      proteinG: logged ? Math.round((kcal * 0.25) / 4) : 0,
      carbsG: logged ? Math.round((kcal * 0.45) / 4) : 0,
      fatG: logged ? Math.round((kcal * 0.3) / 9) : 0,
    }
  })
}

/** Valida que el escenario demo produce el plan esperado (tests / inventario). */
export function e2eDemoFuelWeekScenarioMatches(
  scenario: E2EDemoFuelWeekScenario,
  expectedPlanScenario: 'under_fueled' | 'surplus' | 'deficit'
): boolean {
  const profile = buildE2EDemoFuelProfile()
  const macros = buildE2EDemoFuelWeekMacros(scenario)
  const energy = computeWeeklyEnergySummary({
    weekMacros: macros,
    dailyTargetKcal: profile.targetKcal,
  })
  const recentWorkouts =
    scenario === 'under-fueled'
      ? []
      : [
          buildDemoWorkoutFromSave('e2e-plan', {
            title: 'Push',
            type: 'push',
            exercises: [{ name: 'Press banca', sets: [{ reps: 10, weightKg: 60 }] }],
            durationMin: 45,
          }),
        ]

  const plan = recommendNextSessions({
    profile: {
      goal: profile.goal,
      weightKg: profile.weightKg,
      level: 'Intermedio',
      restrictions: profile.restrictions,
      targetKcal: profile.targetKcal,
    },
    energy,
    load: inferWeeklyTrainingLoad(recentWorkouts),
  })
  return plan?.scenario === expectedPlanScenario
}