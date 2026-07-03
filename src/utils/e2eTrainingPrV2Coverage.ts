/** Registro E2E PR v2 — union de 5 specs tono PR (oleada 447). */
import { E2E_FUEL_LOG_PREFILL_PR_SPECS } from './e2eFuelLogPrefillPrCoverage'
import { E2E_GYM_LOG_FAB_SESSION_PR_SPECS } from './e2eGymLogFabSessionPrCoverage'
import { E2E_GYM_LOG_SESSION_PR_SPECS } from './e2eGymLogSessionPrCoverage'
import { E2E_WORKOUT_HISTORY_ROW_PR_SPECS } from './e2eWorkoutHistoryRowPrCoverage'
import { E2E_WORKOUT_SAVE_BANNER_PR_SPECS } from './e2eWorkoutSaveBannerPrCoverage'
import { isFuelLogPrefillPrCoverageComplete } from './e2eFuelLogPrefillPrCoverage'
import { isGymLogFabSessionPrCoverageComplete } from './e2eGymLogFabSessionPrCoverage'
import { isGymLogSessionPrCoverageComplete } from './e2eGymLogSessionPrCoverage'
import { isWorkoutHistoryRowPrCoverageComplete } from './e2eWorkoutHistoryRowPrCoverage'
import { isWorkoutSaveBannerPrCoverageComplete } from './e2eWorkoutSaveBannerPrCoverage'

export type E2ETrainingPrV2Cover =
  | 'session-pr-tone'
  | 'fab-session-pr-tone'
  | 'banner-pr-tone'
  | 'fuel-prefill-pr-tone'
  | 'history-row-pr-tone'
  | 'harness'
  | 'aria'

export type E2ETrainingPrV2SpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2ETrainingPrV2Cover[]
}

export const E2E_TRAINING_PR_V2_SPECS: readonly E2ETrainingPrV2SpecEntry[] = [
  ...E2E_GYM_LOG_SESSION_PR_SPECS,
  ...E2E_GYM_LOG_FAB_SESSION_PR_SPECS,
  ...E2E_WORKOUT_SAVE_BANNER_PR_SPECS,
  ...E2E_FUEL_LOG_PREFILL_PR_SPECS,
  ...E2E_WORKOUT_HISTORY_ROW_PR_SPECS,
] as const

const PR_V2_TONE_COVERS = [
  'session-pr-tone',
  'fab-session-pr-tone',
  'banner-pr-tone',
  'fuel-prefill-pr-tone',
  'history-row-pr-tone',
] as const

export function countE2ETrainingPrV2Specs(): number {
  return E2E_TRAINING_PR_V2_SPECS.length
}

export function unionTrainingPrV2Covers(): E2ETrainingPrV2Cover[] {
  const all = new Set<E2ETrainingPrV2Cover>()
  for (const spec of E2E_TRAINING_PR_V2_SPECS) {
    for (const cover of spec.covers) all.add(cover)
  }
  return [...all]
}

export function trainingPrV2SpecFileBasenames(): string[] {
  return E2E_TRAINING_PR_V2_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}

export function e2eTrainingPrV2UnionBlockRange(): { from: number; to: number } {
  return { from: 436, to: 444 }
}

export function isTrainingPrV2CoverageComplete(): boolean {
  const covers = unionTrainingPrV2Covers()
  return (
    isGymLogSessionPrCoverageComplete() &&
    isGymLogFabSessionPrCoverageComplete() &&
    isWorkoutSaveBannerPrCoverageComplete() &&
    isFuelLogPrefillPrCoverageComplete() &&
    isWorkoutHistoryRowPrCoverageComplete() &&
    PR_V2_TONE_COVERS.every((c) => covers.includes(c))
  )
}