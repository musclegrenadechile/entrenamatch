import { getWeekKey } from './weekLiveTracker'
import { buildWeeklyPlanNotificationBody } from '../services/weeklyPlan'
import type { WeeklyPlanResult } from '../domain/weeklyPlan'

const SENT_KEY = 'entrenamatch_weekly_plan_notif_week'

/** Sunday 10:00 local — one browser notification per week if permitted. */
export function maybeSendWeeklyPlanNotification(
  plan: WeeklyPlanResult | null,
  enabled: boolean
): void {
  if (!enabled || !plan) return
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

  const now = new Date()
  if (now.getDay() !== 0) return
  if (now.getHours() < 10) return

  const weekKey = getWeekKey(now)
  try {
    if (localStorage.getItem(SENT_KEY) === weekKey) return
    localStorage.setItem(SENT_KEY, weekKey)
  } catch {
    return
  }

  try {
    new Notification('EntrenaPlan · Tu semana', {
      body: buildWeeklyPlanNotificationBody(plan),
      tag: `weekly-plan-${weekKey}`,
    })
  } catch {
    /* ignore */
  }
}
