/**
 * City derby — Viña del Mar vs Santiago (weekly minutes live + sync).
 */

import type { Firestore } from 'firebase/firestore'
import { normalizeCity } from './localNetwork'
import {
  attachCityWeeklyStatsListener,
  cityStatsDocId,
  type CityWeeklyStatsDoc,
} from './cityWeeklyStats'
import { getWeekKey } from '../utils/weekLiveTracker'

export const DERBY_HOME = { norm: 'vina del mar', label: 'Viña del Mar' } as const
export const DERBY_AWAY = { norm: 'santiago', label: 'Santiago' } as const

/** Valpo / Concón cuentan para el equipo Costa (Viña). */
export const DERBY_HOME_ALLIES = ['vina del mar', 'valparaiso', 'concon'] as const

export type CityDerbySide = {
  cityNorm: string
  cityLabel: string
  totalMinutes: number
  participantCount: number
}

export type CityDerbyState = {
  weekKey: string
  home: CityDerbySide
  away: CityDerbySide
  leaderNorm: string | null
  leaderLabel: string | null
  marginMinutes: number
  myTeam: 'home' | 'away' | null
  homeBarPct: number
  awayBarPct: number
  isTie: boolean
}

function sideFromStats(
  fallback: CityDerbySide,
  stats: CityWeeklyStatsDoc | null
): CityDerbySide {
  if (!stats) return fallback
  return {
    cityNorm: stats.cityNorm || fallback.cityNorm,
    cityLabel: stats.cityLabel || fallback.cityLabel,
    totalMinutes: Math.max(stats.totalMinutes, fallback.totalMinutes),
    participantCount: Math.max(stats.participantCount ?? 0, fallback.participantCount),
  }
}

export function resolveDerbyTeam(city?: string | null): 'home' | 'away' | null {
  const norm = normalizeCity(city)
  if ((DERBY_HOME_ALLIES as readonly string[]).includes(norm)) return 'home'
  if (norm === DERBY_AWAY.norm) return 'away'
  return null
}

export function buildCityDerby(
  homeStats: CityWeeklyStatsDoc | null,
  awayStats: CityWeeklyStatsDoc | null,
  clientMinutes: { home?: number; away?: number } = {},
  myCity?: string | null,
  weekKey = getWeekKey()
): CityDerbyState {
  const home = sideFromStats(
    {
      cityNorm: DERBY_HOME.norm,
      cityLabel: DERBY_HOME.label,
      totalMinutes: clientMinutes.home ?? 0,
      participantCount: 0,
    },
    homeStats
  )
  const away = sideFromStats(
    {
      cityNorm: DERBY_AWAY.norm,
      cityLabel: DERBY_AWAY.label,
      totalMinutes: clientMinutes.away ?? 0,
      participantCount: 0,
    },
    awayStats
  )

  const total = home.totalMinutes + away.totalMinutes
  const homeBarPct = total > 0 ? Math.round((home.totalMinutes / total) * 100) : 50
  const awayBarPct = total > 0 ? 100 - homeBarPct : 50

  let leaderNorm: string | null = null
  let leaderLabel: string | null = null
  let marginMinutes = 0
  const isTie = home.totalMinutes === away.totalMinutes

  if (home.totalMinutes > away.totalMinutes) {
    leaderNorm = home.cityNorm
    leaderLabel = home.cityLabel
    marginMinutes = home.totalMinutes - away.totalMinutes
  } else if (away.totalMinutes > home.totalMinutes) {
    leaderNorm = away.cityNorm
    leaderLabel = away.cityLabel
    marginMinutes = away.totalMinutes - home.totalMinutes
  }

  return {
    weekKey,
    home,
    away,
    leaderNorm,
    leaderLabel,
    marginMinutes,
    myTeam: resolveDerbyTeam(myCity),
    homeBarPct,
    awayBarPct,
    isTie,
  }
}

export function derbyStatusLine(derby: CityDerbyState): string {
  if (derby.isTie && derby.home.totalMinutes === 0) {
    return 'Primera ciudad en entrenar lleva la delantera'
  }
  if (derby.isTie) return 'Empate — el próximo sync puede cambiar todo'
  const leader = derby.leaderLabel || '—'
  return `${leader} va ganando por ${derby.marginMinutes} min`
}

export function derbyTeamCta(derby: CityDerbyState): string {
  if (!derby.myTeam) return 'Entrena en vivo y suma minutos a tu región'
  const my = derby.myTeam === 'home' ? derby.home : derby.away
  const rival = derby.myTeam === 'home' ? derby.away : derby.home
  if (derby.myTeam === 'home' && derby.leaderNorm === DERBY_AWAY.norm) {
    return `Viña perdió por ${derby.marginMinutes} min — activa LIVE hoy`
  }
  if (derby.myTeam === 'away' && derby.leaderNorm === DERBY_HOME.norm) {
    return `Santiago va abajo ${derby.marginMinutes} min — suma con un sync`
  }
  if (derby.leaderNorm === my.cityNorm) {
    return `${my.cityLabel} lidera — mantén la ventaja`
  }
  return `${my.cityLabel} ${my.totalMinutes} min · rival ${rival.totalMinutes} min`
}

/** Listen Firestore weekly stats for both derby cities. */
export function aggregateDerbyClientMinutes(
  totals: Array<{ cityNorm: string; minutes: number }>
): { home: number; away: number } {
  let home = 0
  let away = 0
  for (const t of totals) {
    if ((DERBY_HOME_ALLIES as readonly string[]).includes(t.cityNorm)) home += t.minutes
    else if (t.cityNorm === DERBY_AWAY.norm) away += t.minutes
  }
  return { home, away }
}

export function attachCityDerbyListeners(
  db: Firestore,
  weekKey: string,
  onUpdate: (home: CityWeeklyStatsDoc | null, away: CityWeeklyStatsDoc | null) => void
): () => void {
  let home: CityWeeklyStatsDoc | null = null
  let away: CityWeeklyStatsDoc | null = null
  const emit = () => onUpdate(home, away)

  const unsubHome = attachCityWeeklyStatsListener(
    db,
    cityStatsDocId(DERBY_HOME.norm, weekKey),
    (s) => {
      home = s
      emit()
    }
  )
  const unsubAway = attachCityWeeklyStatsListener(
    db,
    cityStatsDocId(DERBY_AWAY.norm, weekKey),
    (s) => {
      away = s
      emit()
    }
  )

  return () => {
    unsubHome()
    unsubAway()
  }
}
