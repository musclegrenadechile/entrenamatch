/** Pure GymPulse Diario helpers (fase 125 — extracted from App.tsx). */

export const getTodayStr = () => new Date().toISOString().slice(0, 10)

export const computeRetentionLevel = (
  mom: number,
  tStreak: number,
  sStreak: number,
  vStreak: number,
  pStreak: number,
  netPower: number
) => {
  const totalXp = mom + tStreak * 40 + sStreak * 70 + vStreak * 25 + pStreak * 35 + netPower * 3
  const level = Math.floor(totalXp / 300) + 1
  const xp = totalXp % 300
  return { level, xp, totalXp }
}

export const GADGETS = [
  {
    level: 5,
    name: 'Halo Élite',
    icon: '✨',
    desc: 'Tu marcador en el mapa brilla con halo dorado extra (más visible para la red)',
    effect: 'map-halo',
  },
  {
    level: 10,
    name: 'Tether dorado Sync',
    icon: '🌟',
    desc: 'Tethers en EntrenaSync son dorados y más gruesos para ti',
    effect: 'golden-tether',
  },
  {
    level: 15,
    name: 'Sync Elite',
    icon: '🔥',
    desc: 'Acciones y emojis especiales solo para niveles altos en EntrenaSync',
    effect: 'exclusive-emojis',
  },
  {
    level: 20,
    name: 'Pulso Maestro',
    icon: '🌀',
    desc: 'Tus ripples/ondas en el mapa son más grandes y con color único',
    effect: 'map-ripple-boost',
  },
  {
    level: 25,
    name: 'Aura de Campeón',
    icon: '👑',
    desc: 'Badge especial + prioridad en lista live y recomendaciones',
    effect: 'priority',
  },
] as const

export const getUnlockedGadgets = (level: number) => GADGETS.filter((g) => level >= g.level)
export const getNextGadget = (level: number) => GADGETS.find((g) => level < g.level) || null

export function generateDailyChallenge(
  user: { id?: string },
  bonds: Record<string, unknown>,
  liveNow: Array<{ id: string }>,
  networkPower: number
) {
  const bondCount = Object.keys(bonds || {}).length
  const hasLiveRed = liveNow.some((u) => (bonds || {})[u.id])
  const today = getTodayStr()
  const seed = (user?.id || 'u') + today

  const options = [
    {
      id: 'anchor-' + seed,
      type: 'solo' as const,
      title: 'Reto GymPulse: Ancla personal',
      description:
        'Entrena 20+ minutos hoy (solo o con quien quieras). Construye tu base de retención.',
      target: 20,
      progress: 0,
      reward: 25,
      icon: '🔥',
      actionLabel: 'Marcar como entrenando',
    },
    {
      id: 'bond-' + seed,
      type: 'bond' as const,
      title: 'Reto GymPulse: Alianza activa',
      description:
        bondCount > 0
          ? `Sincronízate o envía nota de voz a uno de tus ${bondCount} socios de Red hoy.`
          : 'Conecta con alguien nuevo o completa un Sync. Fortalece tu grafo.',
      target: 1,
      progress: 0,
      reward: 40,
      icon: '🔗',
      actionLabel: bondCount > 0 ? 'Ir a tu Red' : 'Explorar',
    },
    {
      id: 'ripple-' + seed,
      type: 'network' as const,
      title: 'Reto GymPulse: Onda en la red',
      description: hasLiveRed
        ? 'Completa tu sesión y publica un post o voz que impulse el GymPulse visible en el mapa para tus GymPartners.'
        : 'Entrena y deja un "GymPulse" (post o voz) que sea visto por tus GymPartners. +Impacto colectivo.',
      target: 1,
      progress: 0,
      reward: 55,
      icon: '🌊',
      actionLabel: 'Completar y publicar en el GymPulse',
    },
    {
      id: 'voice-weak-' + seed,
      type: 'bond' as const,
      title: 'Reto GymPulse: Voz a tu alianza',
      description:
        bondCount > 0
          ? 'Envía una nota de voz a un GymPartner con menos interacción reciente.'
          : 'Envía tu primera nota de voz a un GymPartner y activa tu Voice Streak.',
      target: 1,
      progress: 0,
      reward: 35,
      icon: '🎙️',
      actionLabel: 'Grabar voz para Red',
    },
    {
      id: 'map-ripple-' + seed,
      type: 'network' as const,
      title: 'Reto GymPulse: Pulso en el mapa',
      description:
        'Completa entrenamiento y asegúrate de que tu actividad aparezca como ripple en el GymPulse del mapa (post + live).',
      target: 1,
      progress: 0,
      reward: 45,
      icon: '🗺️',
      actionLabel: 'Ir al GymPulse (mapa)',
    },
  ]

  let chosen = options[0]
  if (bondCount >= 1) {
    chosen = Math.random() > 0.5 ? options[1] : options[3]
  }
  if (hasLiveRed || networkPower > 25) {
    chosen = options[4]
  }
  if (networkPower > 40) chosen = options[2]

  return { ...chosen, expires: today + 'T23:59:59' }
}
