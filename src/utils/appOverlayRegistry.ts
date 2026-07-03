/**
 * Fase 368 — registry of global App overlays (for QA + tests).
 */

export const APP_GLOBAL_OVERLAY_IDS = [
  'marketplace',
  'trainerCoach',
  'notifications',
  'fullProfile',
  'feedComposer',
  'feedPhoto',
  'syncArena',
  'entrenaLog',
  'fuelSetup',
  'fuelWizard',
  'fuelLog',
  'activationGuide',
  'featureTour',
  'exploreFilters',
  'liveNearModal',
  'matchCelebration',
  'safetyActionSheet',
  'legalPages',
  'reportModal',
  'verificationFlow',
  'moderationPanel',
  'trainingReview',
  'adminOps',
  'communityAdmin',
] as const

export type AppGlobalOverlayId = (typeof APP_GLOBAL_OVERLAY_IDS)[number]

export function countAppOverlays(): number {
  return APP_GLOBAL_OVERLAY_IDS.length
}
