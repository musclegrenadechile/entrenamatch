import { describe, expect, it } from 'vitest'
import {
  EXERCISE_LIBRARY,
  countExercisesByMuscle,
  filterExercises,
  getLibraryExercise,
} from './exerciseLibrary'

describe('exerciseLibrary', () => {
  it('has unique exercise names', () => {
    const names = EXERCISE_LIBRARY.map((e) => e.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('covers extensive arm library', () => {
    expect(countExercisesByMuscle('Bíceps')).toBeGreaterThanOrEqual(24)
    expect(countExercisesByMuscle('Tríceps')).toBeGreaterThanOrEqual(26)
    expect(countExercisesByMuscle('Antebrazos')).toBeGreaterThanOrEqual(8)
  })

  it('has broad gym coverage overall', () => {
    expect(EXERCISE_LIBRARY.length).toBeGreaterThanOrEqual(200)
    expect(countExercisesByMuscle('Pecho')).toBeGreaterThanOrEqual(20)
    expect(countExercisesByMuscle('Espalda')).toBeGreaterThanOrEqual(25)
    expect(countExercisesByMuscle('Piernas')).toBeGreaterThanOrEqual(25)
  })

  it('finds exercises by partial search', () => {
    const curls = filterExercises('curl', 50)
    expect(curls.some((e) => e.muscle === 'Bíceps')).toBe(true)
    expect(getLibraryExercise('Curl martillo')?.muscle).toBe('Bíceps')
    expect(getLibraryExercise('Extensión de tríceps en polea con cuerda')?.muscle).toBe('Tríceps')
  })
})
