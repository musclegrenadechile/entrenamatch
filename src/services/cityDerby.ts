/**
 * City derby — Región de Valparaíso vs Santiago (weekly minutes, scored per 100k inhabitants).
 */

import type { Firestore } from 'firebase/firestore'
import { normalizeCity } from './localNetwork'
import {
  attachCityWeeklyStatsListener,
  cityStatsDocId,
  type CityWeeklyStatsDoc,
} from './cityWeeklyStats'
import { getWeekKey } from '../utils/weekLiveTracker'

/** Firestore aggregate key (legacy doc id); UI label is regional. */
export const DERBY_HOME = { norm: 'vina del mar', label: 'Región de Valparaíso' } as const
export const DERBY_AWAY = { norm: 'santiago', label: 'Santiago' } as const

/** INE Chile ~2024 — Región de Valparaíso (V). */
export const DERBY_HOME_POPULATION = 1_815_902
/** INE Chile ~2024 — comuna de Santiago (sin otras comunas RM). */
export const DERBY_AWAY_POPULATION = 467_327

/** Costa / V Región — cuentan para el equipo Valparaíso. */
export const DERBY_HOME_ALLIES = [
  'vina del mar',
  'valparaiso',
  'concon',
  'quilpue',
  'villa alemana',
  'limache',
  'olmue',
  'san antonio',
  'casablanca',
  'quintero',
  'puchuncavi',
  'cartagena',
  'el tabo',
  'el quisco',
  'algarrobo',
  'la calera',
  'hijuelas',
  'nogales',
] as const

/** Solo comuna Santiago — otras comunas RM no suman al derby. */
export const DERBY_AWAY_ALLIES = ['santiago'] as const

const HOME_ALLY_SET = new Set<string>(DERBY_HOME_ALLIES)
const AWAY_ALLY_SET = new Set<string>(DERBY_AWAY_ALLIES)

export type CityDerbySide = {
  cityNorm: string
  cityLabel: string
  totalMinutes: number
  participantCount: number
  population: number
  /** Minutos por cada 100 mil habitantes — score justo entre zonas. */
  indexPer100k: number
}

export type CityDerbyState = {
  weekKey: string
  home: CityDerbySide
  away: CityDerbySide
  leaderNorm: string | null
  leaderLabel: string | null
  /** Diferencia de índice/100k hab entre líder y rival. */
  marginIndex: number
  myTeam: 'home' | 'away' | null
  homeBarPct: number
  awayBarPct: number
  isTie: boolean
}

/** Fair derby score: minutes normalized by zone population. */
export function derbyPopulationIndex(minutes: number, population: number): number {
  if (population <= 0 || minutes <= 0) return 0
  return Math.round((minutes / population) * 100_000 * 10) / 10
}

function regionalLabel(cityNorm: string, fallback?: string): string {
  if (cityNorm === DERBY_HOME.norm) return DERBY_HOME.label
  if (cityNorm === DERBY_AWAY.norm) return DERBY_AWAY.label
  return fallback || cityNorm
}

function enrichSide(
  side: Omit<CityDerbySide, 'population' | 'indexPer100k'>,
  population: number
): CityDerbySide {
  return {
    ...side,
    population,
    indexPer100k: derbyPopulationIndex(side.totalMinutes, population),
  }
}

function sideFromStats(
  fallback: Omit<CityDerbySide, 'population' | 'indexPer100k'>,
  stats: CityWeeklyStatsDoc | null,
  population: number
): CityDerbySide {
  if (!stats) return enrichSide(fallback, population)
  const cityNorm = stats.cityNorm || fallback.cityNorm
  return enrichSide(
    {
      cityNorm,
      cityLabel: regionalLabel(cityNorm, stats.cityLabel || fallback.cityLabel),
      totalMinutes: Math.max(stats.totalMinutes, fallback.totalMinutes),
      participantCount: Math.max(stats.participantCount ?? 0, fallback.participantCount),
    },
    population
  )
}

export function resolveDerbyTeam(city?: string | null): 'home' | 'away' | null {
  const norm = normalizeCity(city)
  if (!norm) return null
  if (HOME_ALLY_SET.has(norm)) return 'home'
  if (AWAY_ALLY_SET.has(norm)) return 'away'
  return null
}

/** Regional Firestore doc to bump when user's commune is a home ally (not the aggregate key). */
export function derbyRegionalBumpTarget(
  city?: string | null
): { cityNorm: string; cityLabel: string } | null {
  const norm = normalizeCity(city)
  const team = resolveDerbyTeam(city)
  if (team === 'home' && norm !== DERBY_HOME.norm) {
    return { cityNorm: DERBY_HOME.norm, cityLabel: DERBY_HOME.label }
  }
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
    homeStats,
    DERBY_HOME_POPULATION
  )
  const away = sideFromStats(
    {
      cityNorm: DERBY_AWAY.norm,
      cityLabel: DERBY_AWAY.label,
      totalMinutes: clientMinutes.away ?? 0,
      participantCount: 0,
    },
    awayStats,
    DERBY_AWAY_POPULATION
  )

  const totalIndex = home.indexPer100k + away.indexPer100k
  const homeBarPct =
    totalIndex > 0 ? Math.round((home.indexPer100k / totalIndex) * 100) : 50
  const awayBarPct = totalIndex > 0 ? 100 - homeBarPct : 50

  let leaderNorm: string | null = null
  let leaderLabel: string | null = null
  let marginIndex = 0
  const isTie = home.indexPer100k === away.indexPer100k

  if (home.indexPer100k > away.indexPer100k) {
    leaderNorm = home.cityNorm
    leaderLabel = home.cityLabel
    marginIndex = Math.round((home.indexPer100k - away.indexPer100k) * 10) / 10
  } else if (away.indexPer100k > home.indexPer100k) {
    leaderNorm = away.cityNorm
    leaderLabel = away.cityLabel
    marginIndex = Math.round((away.indexPer100k - home.indexPer100k) * 10) / 10
  }

  return {
    weekKey,
    home,
    away,
    leaderNorm,
    leaderLabel,
    marginIndex,
    myTeam: resolveDerbyTeam(myCity),
    homeBarPct,
    awayBarPct,
    isTie,
  }
}

export function derbyStatusLine(derby: CityDerbyState): string {
  if (derby.isTie && derby.home.totalMinutes === 0 && derby.away.totalMinutes === 0) {
    return 'Primera zona en entrenar lleva la delantera'
  }
  if (derby.isTie) return 'Empate ajustado por población — el próximo sync define'
  const leader = derby.leaderLabel || '—'
  return `${leader} lidera · +${derby.marginIndex} índice/100k hab`
}

export function derbyTeamCta(derby: CityDerbyState): string {
  if (!derby.myTeam) return 'Entrena en vivo y suma índice a tu zona'
  const my = derby.myTeam === 'home' ? derby.home : derby.away
  const rival = derby.myTeam === 'home' ? derby.away : derby.home
  if (derby.myTeam === 'home' && derby.leaderNorm === DERBY_AWAY.norm) {
    return `${DERBY_HOME.label} va abajo ${derby.marginIndex} índice — activa LIVE hoy`
  }
  if (derby.myTeam === 'away' && derby.leaderNorm === DERBY_HOME.norm) {
    return `${DERBY_AWAY.label} va abajo ${derby.marginIndex} índice — suma con un sync`
  }
  if (derby.leaderNorm === my.cityNorm) {
    return `${my.cityLabel} lidera — mantén la ventaja`
  }
  return `${my.cityLabel} ${my.indexPer100k} índice · rival ${rival.indexPer100k}`
}

/** Listen Firestore weekly stats for both derby cities. */
export function aggregateDerbyClientMinutes(
  totals: Array<{ cityNorm: string; minutes: number }>
): { home: number; away: number } {
  let home = 0
  let away = 0
  for (const t of totals) {
    if (HOME_ALLY_SET.has(t.cityNorm)) home += t.minutes
    else if (AWAY_ALLY_SET.has(t.cityNorm)) away += t.minutes
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
