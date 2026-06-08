import type { Profile } from '../types'
import { calculateCompatibility } from './index'

export function generateIcebreakers(me: Profile, them: Profile): string[] {
  const tips: string[] = []
  const sharedTypes = me.trainingTypes.filter((t) => them.trainingTypes.includes(t))
  const sharedGoals = me.goals.filter((g) => them.goals.includes(g))
  if (sharedTypes.length) {
    tips.push(`¿Hacemos ${sharedTypes[0]} juntos esta semana?`)
  }
  if (sharedGoals.length) {
    tips.push(`Vi que también buscas ${sharedGoals[0].toLowerCase()} — ¿sync un día?`)
  }
  if (me.city === them.city) {
    tips.push(`¿Entrenamos en ${me.city}? Conozco un gym bueno cerca.`)
  }
  if (me.availability.some((a) => them.availability.includes(a))) {
    const slot = me.availability.find((a) => them.availability.includes(a))
    tips.push(`¿Te tinca ${slot?.toLowerCase()} para un live?`)
  }
  const score = calculateCompatibility(me, them)
  if (score >= 75) {
    tips.push(`Match ${score}% — ¿probamos un EntrenaSync corto?`)
  }
  return tips.slice(0, 4).length ? tips.slice(0, 4) : ['¿Te tinca entrenar juntos pronto?', '¿Gym esta semana?']
}
