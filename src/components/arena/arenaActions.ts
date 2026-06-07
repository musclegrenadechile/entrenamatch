/** Five hero gym-native actions for the immersive Arena (replaces 13-button grid). */

export interface ArenaHeroAction {
  id: string
  emoji: string
  label: string
  sub: string
  accent: 'green' | 'orange' | 'gold' | 'cyan' | 'pink'
}

export const ARENA_HERO_ACTIONS: ArenaHeroAction[] = [
  { id: 'set', emoji: '💪', label: 'Set listo', sub: 'Serie completada', accent: 'green' },
  { id: 'pr', emoji: '🏆', label: 'PR logrado', sub: 'Récord personal', accent: 'gold' },
  { id: 'rest', emoji: '💧', label: 'Descanso', sub: 'Recuperación', accent: 'cyan' },
  { id: 'hype', emoji: '🔥', label: 'Ánimo', sub: 'Energía al compañero', accent: 'orange' },
  { id: 'photo', emoji: '📸', label: 'Foto', sub: 'Momento en Arena', accent: 'pink' },
]

export function heroActionToSync(hero: ArenaHeroAction): { emoji: string; label: string } {
  return { emoji: hero.emoji, label: hero.label }
}
