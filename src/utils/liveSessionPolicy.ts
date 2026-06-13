/**
 * LIVE session expiry — single source of truth (fase LIVE hygiene).
 *
 * Fórmula (todas deben cumplirse para seguir activo):
 * 1. trainingNow === true
 * 2. effectiveSince > 0 (sin since válido → no activo tras gracia corta)
 * 3. now - effectiveSince < LIVE_MAX_SESSION_MS (3 h duro)
 * 4. Si hay liveMotionAt: now - liveMotionAt < LIVE_HEARTBEAT_STALE_MS (45 min sin señal)
 * 5. Si hay presenceUpdatedAt: now - presenceUpdatedAt < LIVE_PRESENCE_STALE_MS (45 min sin heartbeat doc)
 */

import { LIVE_MOTION_IDLE_STALE_MS } from './liveMotionScore'
import { normalizeTrainingSince } from './gymPulseLive'

/** Máxima duración de una sesión LIVE (no renovable automáticamente). */
export const LIVE_MAX_SESSION_MS = 3 * 60 * 60 * 1000

/** Alias histórico — mismo valor que LIVE_MAX_SESSION_MS. */
export const ASSUMED_LIVE_SESSION_MS = LIVE_MAX_SESSION_MS

/** Sin trainingNowSince: solo gracia breve si el doc de presencia se actualizó hace poco. */
export const LIVE_MISSING_SINCE_GRACE_MS = 15 * 60 * 1000

/** Presencia / motion sin actualizar → sesión caducada. */
export const LIVE_HEARTBEAT_STALE_MS = LIVE_MOTION_IDLE_STALE_MS
export const LIVE_PRESENCE_STALE_MS = 45 * 60 * 1000

/** App en background sin volver → auto-off (solo cliente propio). */
export const LIVE_APP_HIDDEN_AUTO_OFF_MS = 30 * 60 * 1000

/** Intervalo de re-evaluación de TTL en UI. */
export const LIVE_SESSION_TICK_MS = 60_000

export type LiveSessionSubject = {
  trainingNow?: boolean
  trainingNowSince?: unknown
  liveMotionAt?: number
  liveMotionIdle?: boolean
  liveActivityState?: string
  /** Firestore presence updatedAt (ms) — opcional. */
  presenceUpdatedAt?: unknown
}

export type LiveSessionExpiryReason =
  | 'not_live'
  | 'missing_since'
  | 'max_duration'
  | 'heartbeat_stale'
  | 'presence_stale'

export function resolvePresenceUpdatedAtMs(val: unknown): number | undefined {
  return normalizeTrainingSince(val)
}

/** Inicio efectivo de sesión — nunca Date.now() como fallback para perfiles ajenos. */
export function resolveLiveSessionStartMs(
  subject: LiveSessionSubject,
  now = Date.now()
): number {
  const since = normalizeTrainingSince(subject.trainingNowSince)
  if (since && since > 0) return since

  const presenceAt = resolvePresenceUpdatedAtMs(subject.presenceUpdatedAt)
  if (presenceAt && presenceAt > 0 && now - presenceAt <= LIVE_MISSING_SINCE_GRACE_MS) {
    return presenceAt
  }

  return 0
}

export function getLiveSessionExpiryReason(
  subject: LiveSessionSubject,
  now = Date.now()
): LiveSessionExpiryReason | null {
  if (!subject?.trainingNow) return 'not_live'

  const startMs = resolveLiveSessionStartMs(subject, now)
  if (startMs <= 0) return 'missing_since'

  if (now - startMs >= LIVE_MAX_SESSION_MS) return 'max_duration'

  const motionAt = subject.liveMotionAt
  if (typeof motionAt === 'number' && motionAt > 0 && now - motionAt >= LIVE_HEARTBEAT_STALE_MS) {
    return 'heartbeat_stale'
  }

  const presenceAt = resolvePresenceUpdatedAtMs(subject.presenceUpdatedAt)
  if (
    presenceAt &&
    presenceAt > 0 &&
    !normalizeTrainingSince(subject.trainingNowSince) &&
    now - presenceAt >= LIVE_PRESENCE_STALE_MS
  ) {
    return 'presence_stale'
  }

  return null
}

export function isLiveSessionActive(subject: LiveSessionSubject, now = Date.now()): boolean {
  return getLiveSessionExpiryReason(subject, now) === null
}

export function liveSessionRemainingMs(subject: LiveSessionSubject, now = Date.now()): number {
  if (!isLiveSessionActive(subject, now)) return 0
  const startMs = resolveLiveSessionStartMs(subject, now)
  return Math.max(0, LIVE_MAX_SESSION_MS - (now - startMs))
}

export function liveSessionExpiryLabel(reason: LiveSessionExpiryReason): string {
  switch (reason) {
    case 'max_duration':
      return 'Sesión LIVE finalizada (máx. 3 h)'
    case 'heartbeat_stale':
      return 'Sesión LIVE pausada — sin actividad del reloj/teléfono'
    case 'presence_stale':
      return 'Sesión LIVE expirada — sin señal en el mapa'
    case 'missing_since':
      return 'Sesión LIVE inválida — se apagó automáticamente'
    default:
      return 'Sesión LIVE finalizada'
  }
}
