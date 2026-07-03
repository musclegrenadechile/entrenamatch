import { describe, expect, it } from 'vitest'
import { VOICE_EXERCISE_ALIASES } from './workoutVoiceAliases'
import {
  normalizeVoiceTranscript,
  parseWorkoutVoiceLocally,
  shouldUseLocalParse,
} from './workoutVoiceLocalParse'

describe('workoutVoiceLocalParse', () => {
  it('dominadas alias pattern matches', () => {
    const row = VOICE_EXERCISE_ALIASES.find((a) => a.name === 'Dominadas')
    expect(row?.pattern.test('dominadas 4 por 10')).toBe(true)
  })

  it('normalizes common STT glitches', () => {
    expect(normalizeVoiceTranscript('press de banco 3 series')).toContain('banca')
    expect(normalizeVoiceTranscript('pecho plano tres series')).toContain('press banca')
  })

  it('finds dominadas alias in segment', () => {
    const result = parseWorkoutVoiceLocally('dominadas 4 por 10')
    expect(result.exercises[0]?.name).toBe('Dominadas')
    expect(result.exercises[0]?.sets).toHaveLength(4)
  })

  it('parses classic gym phrase instantly with high confidence', () => {
    const result = parseWorkoutVoiceLocally(
      'Press banca 3 series de 8 a 80 kilos, dominadas 4 por 10, 45 minutos'
    )
    expect(result.exercises).toHaveLength(2)
    expect(result.exercises[0].name).toBe('Press banca')
    expect(result.exercises[0].sets).toHaveLength(3)
    expect(result.exercises[0].sets[0].reps).toBe(8)
    expect(result.exercises[0].sets[0].weightKg).toBe(80)
    expect(result.exercises[1].name).toBe('Dominadas')
    expect(result.exercises[1].sets).toHaveLength(4)
    expect(result.durationMin).toBe(45)
    expect(result.confidence).toBeGreaterThanOrEqual(0.7)
    expect(shouldUseLocalParse(result)).toBe(true)
  })

  it('parses spoken numbers: tres de ocho con ochenta', () => {
    const result = parseWorkoutVoiceLocally('press banca tres de ocho con ochenta kilos')
    expect(result.exercises[0].name).toBe('Press banca')
    expect(result.exercises[0].sets).toHaveLength(3)
    expect(result.exercises[0].sets[0].reps).toBe(8)
    expect(result.exercises[0].sets[0].weightKg).toBe(80)
    expect(shouldUseLocalParse(result)).toBe(true)
  })

  it('parses pecho plano alias', () => {
    const result = parseWorkoutVoiceLocally('pecho plano 4x8 a 60 kilos')
    expect(result.exercises[0].name).toBe('Press banca')
    expect(result.exercises[0].sets).toHaveLength(4)
    expect(result.exercises[0].sets[0].weightKg).toBe(60)
  })

  it('prefers recent exercise names when mentioned', () => {
    const result = parseWorkoutVoiceLocally('remo con barra 4 series de 10', [
      'Remo con barra',
      'Remo con mancuerna',
    ])
    expect(result.exercises[0].name).toBe('Remo con barra')
  })

  it('parses 4x10 shorthand', () => {
    const result = parseWorkoutVoiceLocally('sentadilla 4x10')
    expect(result.exercises[0].name).toBe('Sentadilla libre')
    expect(result.exercises[0].sets).toHaveLength(4)
    expect(result.exercises[0].sets[0].reps).toBe(10)
  })

  it('returns low confidence for vague transcript', () => {
    const result = parseWorkoutVoiceLocally('hice algo de pecho hoy')
    expect(result.confidence).toBeLessThan(0.7)
    expect(shouldUseLocalParse(result)).toBe(false)
  })
})
