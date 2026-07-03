import { isWeeklyPlanFuelToneAriaStackAligned } from './weeklyPlanFuelToneStackAriaDisplay'
import { fuelCardAriaMatchesTone } from './weeklyPlanFuelToneStackCardDisplay'
import { fuelToneStackMatchesDemoExpected } from './weeklyPlanFuelToneStackExpectedDisplay'
import {
  fuelToneStackMatchesExpected,
  type WeeklyPlanFuelToneStackSnapshot,
} from './weeklyPlanFuelToneStackDisplay'
import type { FuelWeekHintTone } from './weeklyPlanFuelWeekToneDisplay'

export type WeeklyPlanFuelToneStackAriaSnapshot = {
  hint: string | null
  headline: string | null
  nutrition: string | null
  chip: string | null
  row: string | null
}

/** Card + stack visual + aria alineados al tono (oleada 428). */
export function isWeeklyPlanFuelToneStackFullySynced(
  tone: FuelWeekHintTone,
  snapshot: WeeklyPlanFuelToneStackSnapshot,
  cardAria: string | null,
  aria: WeeklyPlanFuelToneStackAriaSnapshot
): boolean {
  return (
    fuelToneStackMatchesExpected(snapshot, tone) &&
    fuelCardAriaMatchesTone(cardAria, tone) &&
    isWeeklyPlanFuelToneAriaStackAligned(aria, tone)
  )
}

/** Sync completo + capas demo E2E (oleada 428). */
export function isWeeklyPlanFuelToneStackDemoFullySynced(
  tone: FuelWeekHintTone,
  snapshot: WeeklyPlanFuelToneStackSnapshot,
  cardAria: string | null,
  aria: WeeklyPlanFuelToneStackAriaSnapshot
): boolean {
  return (
    isWeeklyPlanFuelToneStackFullySynced(tone, snapshot, cardAria, aria) &&
    fuelToneStackMatchesDemoExpected(snapshot, tone)
  )
}