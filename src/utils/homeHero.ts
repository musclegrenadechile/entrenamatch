/**
 * DailyHome hero card — single CTA for the day (oleada 6 / fase 222).
 */

import type { WeeklyPactProgress } from '../services/weeklyPact'
import type { Workout } from '../types'

export type HomeHeroAction = 'live' | 'log' | 'pact' | 'repeat' | 'map'

export interface HomeHeroState {
  title: string
  subtitle: string
  action: HomeHeroAction
  cta: string
  progressPct?: number
}

function localDateStr(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function hasWorkoutToday(workouts: Workout[], now = Date.now()): boolean {
  const today = localDateStr(now)
  return workouts.some((w) => localDateStr(w.endedAt || w.startedAt) === today)
}

export function getYesterdayWorkout(
  workouts: Workout[],
  now = Date.now()
): Workout | null {
  const yesterday = localDateStr(now - 86_400_000)
  return (
    workouts.find((w) => localDateStr(w.endedAt || w.startedAt) === yesterday) ?? null
  )
}

export function resolveHomeHero(opts: {
  isLive: boolean
  weeklyPactProgress: WeeklyPactProgress
  entrenoRecentWorkouts: Workout[]
  weekTrainedCount: number
  now?: number
}): HomeHeroState {
  const { isLive, weeklyPactProgress, entrenoRecentWorkouts, weekTrainedCount } = opts
  const now = opts.now ?? Date.now()
  const loggedToday = hasWorkoutToday(entrenoRecentWorkouts, now)
  const yesterday = getYesterdayWorkout(entrenoRecentWorkouts, now)

  if (isLive) {
    return {
      title: 'Estás en vivo',
      subtitle: 'Registra sets en Entreno de Hoy mientras entrenas.',
      action: 'log',
      cta: 'Registrar sesión →',
      progressPct: weeklyPactProgress.overallPct,
    }
  }

  if (!weeklyPactProgress.pledged) {
    return {
      title: 'Meta de la semana',
      subtitle: 'Live + Sync + Logs — fija tu objetivo en menos de 30 segundos.',
      action: 'pact',
      cta: 'Fijar mi meta →',
    }
  }

  if (!loggedToday && yesterday) {
    return {
      title: 'Repetir ayer',
      subtitle: `${yesterday.title} — mismo plan, nuevo día.`,
      action: 'repeat',
      cta: 'Copiar entreno de ayer →',
      progressPct: weeklyPactProgress.overallPct,
    }
  }

  if (!loggedToday) {
    const logsLeft =
      weeklyPactProgress.loggedSessionsTarget - weeklyPactProgress.loggedSessionsDone
    return {
      title: 'Tu log de hoy',
      subtitle:
        logsLeft > 0
          ? `Te faltan ${logsLeft} log${logsLeft === 1 ? '' : 's'} para tu meta esta semana.`
          : 'Cierra el día con un Entreno de Hoy.',
      action: 'log',
      cta: 'Abrir Entreno de Hoy →',
      progressPct: weeklyPactProgress.overallPct,
    }
  }

  if (weekTrainedCount < weeklyPactProgress.liveDaysTarget) {
    return {
      title: 'Sumar día live',
      subtitle: `${weekTrainedCount}/${weeklyPactProgress.liveDaysTarget} días live — usa el botón IR LIVE flotante.`,
      action: 'map',
      cta: 'Ver mapa LIVE →',
      progressPct: weeklyPactProgress.overallPct,
    }
  }

  if (!weeklyPactProgress.isComplete) {
    return {
      title: 'Cierra la semana',
      subtitle: `${weeklyPactProgress.overallPct}% de tu meta — sigue sumando.`,
      action: 'log',
      cta: 'Registrar otro entreno →',
      progressPct: weeklyPactProgress.overallPct,
    }
  }

  return {
    title: 'Semana sellada',
    subtitle: 'Meta cumplida — mantén el ritmo.',
    action: 'log',
    cta: 'Entreno de Hoy →',
    progressPct: 100,
  }
}
