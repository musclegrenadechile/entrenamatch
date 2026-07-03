import { describe, expect, it } from 'vitest'
import {
  buildWeeklyPlanRotationAriaLabel,
  buildWeeklyPlanRotationChipText,
  shouldShowWeeklyPlanRotationChip,
  WEEKLY_PLAN_ROTATION_CHIP_CLASS,
} from './weeklyPlanRotationDisplay'

describe('weeklyPlanRotationDisplay', () => {
  it('WEEKLY_PLAN_ROTATION_CHIP_CLASS', () => {
    expect(WEEKLY_PLAN_ROTATION_CHIP_CLASS).toBe('em-v2-plan__rotation-chip')
  })

  it('buildWeeklyPlanRotationChipText compacta la nota', () => {
    expect(buildWeeklyPlanRotationChipText('Tras PR en Pecho — rotación a Pull.')).toBe(
      '↻ Rotación a Pull'
    )
  })

  it('aria y visibilidad por tipo de actividad', () => {
    const note = 'Tras PR en Pecho — rotación a Pull.'
    expect(buildWeeklyPlanRotationAriaLabel(note)).toContain('Pull')
    expect(shouldShowWeeklyPlanRotationChip(note, 'strength')).toBe(true)
    expect(shouldShowWeeklyPlanRotationChip(note, 'rest')).toBe(false)
    expect(shouldShowWeeklyPlanRotationChip(undefined, 'strength')).toBe(false)
  })
})