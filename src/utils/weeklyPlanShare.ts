import type { WeeklyPlanResult } from '../domain/weeklyPlan'
import { formatWeeklyPlanExternalShareText } from '../domain/weeklyPlan'
import { shareNativeMessage, type ShareNativeOutcome } from './shareNative'

export type WeeklyPlanShareOutcome = ShareNativeOutcome

export async function shareWeeklyPlanExternally(
  plan: WeeklyPlanResult,
  options?: { userName?: string; inviteUrl?: string }
): Promise<WeeklyPlanShareOutcome> {
  const text = formatWeeklyPlanExternalShareText(plan, options?.userName)
  const url = options?.inviteUrl?.trim() || 'https://entrenamatch.web.app'
  return shareNativeMessage({ title: 'EntrenaPlan · EntrenaMatch', text, url })
}
