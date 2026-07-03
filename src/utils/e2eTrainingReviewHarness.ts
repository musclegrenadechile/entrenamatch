import {
  isTrainingReviewPrToneAriaExpected,
  readTrainingReviewCardAriaLabel,
  readTrainingReviewCardToneClass,
} from './e2eWorkoutSaveBannerDom'
import { workoutHistorySparklineE2EHarness } from './e2eWorkoutHistoryDom'

/** Harness E2E reseña + sparkline historial (oleadas 445/448) — evita inflar App.tsx. */
export const trainingReviewE2EHarness = {
  getTrainingReviewCardToneClass: readTrainingReviewCardToneClass,
  getTrainingReviewCardAriaLabel: readTrainingReviewCardAriaLabel,
  isTrainingReviewPrToneAriaExpected,
  ...workoutHistorySparklineE2EHarness,
} as const