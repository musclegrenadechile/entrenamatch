import {
  isTrainingReviewPrToneAriaExpected,
  readTrainingReviewCardAriaLabel,
  readTrainingReviewCardToneClass,
} from './e2eWorkoutSaveBannerDom'

/** Harness E2E reseña post-entreno (oleada 445) — evita inflar App.tsx. */
export const trainingReviewE2EHarness = {
  getTrainingReviewCardToneClass: readTrainingReviewCardToneClass,
  getTrainingReviewCardAriaLabel: readTrainingReviewCardAriaLabel,
  isTrainingReviewPrToneAriaExpected,
} as const