import type { FuelWeekMacroDay } from '../../services/fuel'
import type { FuelWeekBalanceDay } from '../../utils/fuelWeekBalance'
import { getWeekKey } from '../../utils/weekLiveTracker'
import type { WeeklyEnergySummary } from './types'

export function computeWeeklyEnergySummary(input: {
  weekMacros: FuelWeekMacroDay[]
  weekBalanceDays?: FuelWeekBalanceDay[]
  dailyTargetKcal: number
  todayRemainingKcal?: number
  ref?: Date
}): WeeklyEnergySummary {
  const { weekMacros, weekBalanceDays = [], dailyTargetKcal, todayRemainingKcal } = input
  const loggedDays = weekMacros.filter((d) => d.logged).length
  const totalConsumedKcal = weekMacros.reduce((s, d) => s + (d.kcal || 0), 0)
  const totalBurnKcal = weekBalanceDays.reduce((s, d) => s + (d.burnKcal || 0), 0)
  const daysInWindow = weekMacros.length || 7
  const totalTargetKcal = Math.round(dailyTargetKcal * daysInWindow)
  const weeklyDeltaKcal = totalConsumedKcal - totalBurnKcal - totalTargetKcal
  const avgDailyDeltaKcal =
    loggedDays > 0 ? Math.round(weeklyDeltaKcal / loggedDays) : weeklyDeltaKcal

  return {
    weekKey: getWeekKey(input.ref),
    loggedDays,
    totalConsumedKcal: Math.round(totalConsumedKcal),
    totalBurnKcal: Math.round(totalBurnKcal),
    totalTargetKcal,
    weeklyDeltaKcal: Math.round(weeklyDeltaKcal),
    avgDailyDeltaKcal,
    todayRemainingKcal,
  }
}
