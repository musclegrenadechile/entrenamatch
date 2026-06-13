/**
 * Fase 373 — unified beta QA checklist (P0 + LIVE pilot).
 */

import { P0_BETA_QA_MATRIX, P0_BETA_QA_VERSION } from './p0BetaQaMatrix'
import { LIVE_PILOT_SATURDAY_STEPS } from './livePilotChecklist'

export type BetaReleaseChecklistItem = {
  id: string
  source: 'p0' | 'live-pilot'
  flow: string
  version: string
}

export function buildBetaReleaseChecklist(): BetaReleaseChecklistItem[] {
  const p0 = P0_BETA_QA_MATRIX.map((row) => ({
    id: row.id,
    source: 'p0' as const,
    flow: row.flow,
    version: row.version,
  }))
  const live = LIVE_PILOT_SATURDAY_STEPS.map((step) => ({
    id: step.id,
    source: 'live-pilot' as const,
    flow: `${step.action} → ${step.passCriteria}`,
    version: P0_BETA_QA_VERSION,
  }))
  return [...p0, ...live]
}

export function countBetaReleaseItems(): number {
  return buildBetaReleaseChecklist().length
}
