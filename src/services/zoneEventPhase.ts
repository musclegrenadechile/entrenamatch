/**
 * Copa Zona — ciclo semanal por fases (hora Chile).
 * Guerra: Vie–Dom · Victoria: Lun–Mar · Armisticio: Mié–Jue
 */

import type { CityDerbyState } from './cityDerby'
import { DERBY_AWAY, DERBY_HOME } from './cityDerby'
import { toLocalDateStr } from '../utils/weekLiveTracker'

export type ZoneEventPhase = 'war' | 'celebration' | 'armistice'

const DAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export type ChileClock = { day: number; minutesSinceMidnight: number; dateStr: string }

export function chileClock(now = new Date()): ChileClock {
  const weekday = now.toLocaleString('en-US', { timeZone: 'America/Santiago', weekday: 'short' })
  const dateStr = now.toLocaleString('en-CA', { timeZone: 'America/Santiago' }).slice(0, 10)
  const time = now.toLocaleString('en-US', {
    timeZone: 'America/Santiago',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })
  const [hourStr, minuteStr] = time.split(':')
  const hour = Number(hourStr) || 0
  const minute = Number(minuteStr) || 0
  return { day: DAY_MAP[weekday] ?? 0, minutesSinceMidnight: hour * 60 + minute, dateStr }
}

export function getZoneEventPhaseFromChileDay(day: number): ZoneEventPhase {
  if (day === 5 || day === 6 || day === 0) return 'war'
  if (day === 1 || day === 2) return 'celebration'
  return 'armistice'
}

export function getZoneEventPhase(now = new Date()): ZoneEventPhase {
  return getZoneEventPhaseFromChileDay(chileClock(now).day)
}

export function isZoneScoringActive(now = new Date()): boolean {
  return getZoneEventPhase(now) === 'war'
}

/** Viernes (YYYY-MM-DD) que abrió la guerra del ciclo actual o recién cerrado. */
export function getWarEventKey(now = new Date()): string {
  const { day, dateStr } = chileClock(now)
  const daysBackToFriday =
    day === 5 ? 0 : day === 6 ? 1 : day === 0 ? 2 : day === 1 ? 3 : day === 2 ? 4 : day === 3 ? 5 : 6
  const [y, m, d] = dateStr.split('-').map(Number)
  const anchor = new Date(y, m - 1, d)
  anchor.setDate(anchor.getDate() - daysBackToFriday)
  return toLocalDateStr(anchor)
}

function minutesUntilChile(targetDay: number, targetMinutes: number, now: Date): number {
  const { day, minutesSinceMidnight } = chileClock(now)
  let dayDelta = targetDay - day
  if (dayDelta < 0) dayDelta += 7
  if (dayDelta === 0 && targetMinutes <= minutesSinceMidnight) dayDelta = 7
  const minuteDelta =
    dayDelta === 0
      ? targetMinutes - minutesSinceMidnight
      : dayDelta * 24 * 60 + (targetMinutes - minutesSinceMidnight)
  return Math.max(0, minuteDelta)
}

export type ZoneEventCountdown = {
  phase: ZoneEventPhase
  msRemaining: number
  label: string
  shortLabel: string
}

function formatDuration(ms: number): { label: string; shortLabel: string } {
  const totalMin = Math.ceil(ms / 60_000)
  if (totalMin < 60) {
    return { label: `${totalMin} min`, shortLabel: `${totalMin}m` }
  }
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h < 48) {
    return {
      label: m > 0 ? `${h}h ${m}m` : `${h}h`,
      shortLabel: m > 0 ? `${h}h ${m}m` : `${h}h`,
    }
  }
  const d = Math.floor(h / 24)
  const rh = h % 24
  return {
    label: rh > 0 ? `${d}d ${rh}h` : `${d}d`,
    shortLabel: rh > 0 ? `${d}d ${rh}h` : `${d}d`,
  }
}

/** Fin de fase: domingo 23:59 (guerra), martes 23:59 (victoria), jueves 23:59 (armisticio). */
export function getZoneEventCountdown(now = new Date()): ZoneEventCountdown {
  const phase = getZoneEventPhase(now)
  let endDay: number
  if (phase === 'war') endDay = 0 // domingo
  else if (phase === 'celebration') endDay = 2 // martes
  else endDay = 4 // jueves

  const endMinutes = 24 * 60 - 1
  const minutes = minutesUntilChile(endDay, endMinutes, now)
  const msRemaining = minutes * 60_000
  const dur = formatDuration(msRemaining)

  const label =
    phase === 'war'
      ? `Guerra termina en ${dur.label}`
      : phase === 'celebration'
        ? `Victoria · ${dur.label} restantes`
        : `Nueva guerra en ${dur.label}`

  const shortLabel =
    phase === 'war'
      ? `⏱ ${dur.shortLabel}`
      : phase === 'celebration'
        ? `🛡 ${dur.shortLabel}`
        : `⚔ ${dur.shortLabel}`

  return { phase, msRemaining, label, shortLabel }
}

export function zoneEventPhaseLabel(phase: ZoneEventPhase): string {
  if (phase === 'war') return 'Guerra en curso'
  if (phase === 'celebration') return 'Victoria'
  return 'Armisticio'
}

export function zoneEventPhaseKicker(phase: ZoneEventPhase): string {
  if (phase === 'war') return 'Copa Zona · guerra'
  if (phase === 'celebration') return 'Copa Zona · victoria'
  return 'Copa Zona · armisticio'
}

export function zoneEventStatusLine(derby: CityDerbyState, phase = getZoneEventPhase()): string {
  if (phase === 'celebration') {
    if (!derby.leaderNorm || derby.isTie) return 'Empate — el título queda en disputa la próxima guerra'
    return `🛡 ${derby.leaderLabel} es Defensor de la zona`
  }
  if (phase === 'armistice') {
    if (!derby.leaderNorm || derby.isTie) return 'Próxima guerra el viernes — el título está en juego'
    return `${derby.leaderLabel} defiende el título — la guerra vuelve el viernes`
  }
  if (derby.isTie && derby.home.totalMinutes === 0 && derby.away.totalMinutes === 0) {
    return 'La guerra empieza en cero — el primer LIVE marca la zona'
  }
  if (derby.isTie) return 'Empate ajustado por población — el próximo sync define'
  const leader = derby.leaderLabel || '—'
  return `${leader} lidera · +${derby.marginIndex} índice/100k hab`
}

export function zoneEventTeamCta(
  derby: CityDerbyState,
  userCity?: string | null,
  phase = getZoneEventPhase()
): string {
  const my = derby.myTeam === 'home' ? derby.home : derby.myTeam === 'away' ? derby.away : null
  const rival = derby.myTeam === 'home' ? derby.away : derby.home
  const isDefender =
    derby.leaderNorm &&
    !derby.isTie &&
    ((derby.myTeam === 'home' && derby.leaderNorm === DERBY_HOME.norm) ||
      (derby.myTeam === 'away' && derby.leaderNorm === DERBY_AWAY.norm))

  if (phase === 'celebration') {
    if (isDefender) return 'Saborea la victoria — comparte que tu zona es Defensora'
    if (derby.myTeam) return `${rival.cityLabel} atacará pronto — invita a tu zona`
    return 'Mira el marcador final — la próxima guerra arranca el viernes'
  }

  if (phase === 'armistice') {
    if (isDefender) return 'Prepara la defensa — la guerra vuelve el viernes'
    if (derby.myTeam) return 'Arma el ataque — convoca a tu zona antes del viernes'
    return 'Entrena normal — el viernes vuelve la Copa Zona'
  }

  if (!derby.myTeam) return 'Entrena en LIVE y suma índice a tu zona'
  if (my && my.participantCount === 0) {
    const place = userCity?.trim() || my.cityLabel
    return `Sé el primero en representar ${place}`
  }
  if (derby.myTeam === 'home' && derby.leaderNorm === DERBY_AWAY.norm) {
    return `${DERBY_HOME.label} va abajo ${derby.marginIndex} índice — activa LIVE hoy`
  }
  if (derby.myTeam === 'away' && derby.leaderNorm === DERBY_HOME.norm) {
    return `${DERBY_AWAY.label} va abajo ${derby.marginIndex} índice — suma con un sync`
  }
  if (isDefender) return 'Defiende el título — cada LIVE cuenta'
  if (derby.leaderNorm === my?.cityNorm) return `${my?.cityLabel} lidera — mantén la ventaja`
  return `${my?.cityLabel} ${my?.indexPer100k} índice · rival ${rival.indexPer100k}`
}
