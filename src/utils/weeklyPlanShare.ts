import type { WeeklyPlanResult } from '../domain/weeklyPlan'
import { formatWeeklyPlanExternalShareText } from '../domain/weeklyPlan'
import { resolveShareableAppBase, sanitizeShareUrl } from './sparseCityDefaults'
import { shareNativeMessage, type ShareNativeOutcome } from './shareNative'

export type WeeklyPlanShareOutcome = ShareNativeOutcome

export async function shareWeeklyPlanExternally(
  plan: WeeklyPlanResult,
  options?: { userName?: string; inviteUrl?: string }
): Promise<WeeklyPlanShareOutcome> {
  const text = formatWeeklyPlanExternalShareText(plan, options?.userName)
  const url = sanitizeShareUrl(options?.inviteUrl) || resolveShareableAppBase()
  return shareNativeMessage({ title: 'EntrenaPlan · EntrenaMatch', text, url })
}
