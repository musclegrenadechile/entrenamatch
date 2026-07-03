import { describe, expect, it } from 'vitest'
import { applyWorkoutVoiceParse, resolveExerciseLibraryName } from './workoutVoiceApply'
import { expandVoiceExerciseSets } from './workoutVoiceExpandSets'
import { resolveVoiceExerciseAlias } from './workoutVoiceAliases'

describe('workoutVoiceAliases', () => {
  it('maps Chile gym slang to library names', () => {
    expect(resolveVoiceExerciseAlias('banca plana')).toBe('Press banca')
    expect(resolveVoiceExerciseAlias('sentadilla')).toBe('Sentadilla libre')
    expect(resolveVoiceExerciseAlias('dominadas')).toBe('Dominadas')
  })
})

describe('workoutVoiceExpandSets', () => {
  it('expands one template set into N series', () => {
    const expanded = expandVoiceExerciseSets({
      name: 'Press banca',
      setCount: 3,
      sets: [{ reps: 8, weightKg: 80 }],
    })
    expect(expanded.sets).toHaveLength(3)
    expect(expanded.sets[0].reps).toBe(8)
    expect(expanded.sets[2].weightKg).toBe(80)
  })
})

describe('workoutVoiceApply', () => {
  it('resolveExerciseLibraryName matches library and aliases', () => {
    expect(resolveExerciseLibraryName('press banca')).toBe('Press banca')
    expect(resolveExerciseLibraryName('banca')).toBe('Press banca')
    expect(resolveExerciseLibraryName('dominadas', ['Dominadas'])).toBe('Dominadas')
  })

  it('applyWorkoutVoiceParse builds WorkoutExercise rows', () => {
    const applied = applyWorkoutVoiceParse({
      transcript: 'tres series press banca ochenta',
      title: 'Push',
      type: 'push',
      durationMin: 50,
      confidence: 0.9,
      exercises: [
        {
          name: 'press banca',
          sets: [
            { reps: 8, weightKg: 80 },
            { reps: 8, weightKg: 80 },
            { reps: 8, weightKg: 80 },
          ],
        },
      ],
    })
    expect(applied.exercises).toHaveLength(1)
    expect(applied.exercises[0].name).toBe('Press banca')
    expect(applied.exercises[0].sets).toHaveLength(3)
    expect(applied.exercises[0].sets[0].weightKg).toBe(80)
    expect(applied.durationMin).toBe(50)
  })

  it('expands setCount from Gemini into multiple sets', () => {
    const applied = applyWorkoutVoiceParse({
      transcript: '3 series de press banca 8 reps 80 kilos',
      title: 'Push',
      type: 'push',
      durationMin: 45,
      confidence: 0.85,
      exercises: [
        {
          name: 'press banca',
          setCount: 3,
          sets: [{ reps: 8, weightKg: 80 }],
        },
      ],
    })
    expect(applied.exercises[0].sets).toHaveLength(3)
  })

  it('handles duration-only parse with empty exercises', () => {
    const applied = applyWorkoutVoiceParse({
      transcript: 'corrí cuarenta minutos',
      title: 'Running',
      type: 'cardio',
      durationMin: 40,
      confidence: 0.8,
      exercises: [],
    })
    expect(applied.exercises).toHaveLength(0)
    expect(applied.durationMin).toBe(40)
    expect(applied.type).toBe('cardio')
  })
})
