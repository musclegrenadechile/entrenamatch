import type { RecommendedActivityType } from '../domain/weeklyPlan/types'

export const WEEKLY_PLAN_ROTATION_CHIP_CLASS = 'em-v2-plan__rotation-chip'

/** Chip compacto de rotación PR visible sin abrir detalle (oleada 407). */
export function buildWeeklyPlanRotationChipText(note: string): string {
  const match = note.match(/rotación a\s+(.+?)\.?$/i)
  if (match) return `↻ Rotación a ${match[1]}`
  return `↻ ${note.replace(/^Tras PR[^—]*—\s*/i, '').trim()}`
}

export function buildWeeklyPlanRotationAriaLabel(note: string): string {
  return `Rotación de plan: ${note.replace(/^Tras PR[^—]*—\s*/i, '').trim()}`
}

export function shouldShowWeeklyPlanRotationChip(
  prRotationNote: string | undefined,
  activityType: RecommendedActivityType
): boolean {
  if (!prRotationNote?.trim()) return false
  return activityType === 'strength'
}