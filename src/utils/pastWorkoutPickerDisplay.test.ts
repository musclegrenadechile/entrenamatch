import { describe, expect, it } from 'vitest'
import { buildPastWorkoutPickerSubline } from './pastWorkoutPickerDisplay'

describe('buildPastWorkoutPickerSubline', () => {
  it('cubre vacío, singular y plural', () => {
    expect(buildPastWorkoutPickerSubline(0)).toBe('Aún no tienes rutinas guardadas')
    expect(buildPastWorkoutPickerSubline(1)).toBe('1 rutina guardada')
    expect(buildPastWorkoutPickerSubline(4)).toBe('4 rutinas en tu historial')
  })
})