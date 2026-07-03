/** Inventario E2E tono PR×banner post-guardar — 1 spec (oleada 439). */

export type E2EWorkoutSaveBannerPrCover = 'banner-pr-tone' | 'harness' | 'aria'

export type E2EWorkoutSaveBannerPrSpecEntry = {
  id: string
  file: string
  oleada: number
  covers: readonly E2EWorkoutSaveBannerPrCover[]
}

export const E2E_WORKOUT_SAVE_BANNER_PR_SPECS: readonly E2EWorkoutSaveBannerPrSpecEntry[] = [
  {
    id: 'workout-flow',
    file: 'e2e/workout-flow.spec.ts',
    oleada: 439,
    covers: ['banner-pr-tone', 'harness', 'aria'],
  },
] as const

export function countE2EWorkoutSaveBannerPrSpecs(): number {
  return E2E_WORKOUT_SAVE_BANNER_PR_SPECS.length
}

export function e2eWorkoutSaveBannerPrBlockRange(): { from: number; to: number } {
  return { from: 439, to: 439 }
}

export function isWorkoutSaveBannerPrCoverageComplete(): boolean {
  return E2E_WORKOUT_SAVE_BANNER_PR_SPECS.every((s) => s.covers.includes('banner-pr-tone'))
}

export function workoutSaveBannerPrSpecFileBasenames(): string[] {
  return E2E_WORKOUT_SAVE_BANNER_PR_SPECS.map((s) => s.file.replace(/^e2e\//, ''))
}