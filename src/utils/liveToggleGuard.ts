/** Guard window while a LIVE on/off write is in flight or recently completed. */
export const LIVE_PENDING_GUARD_MS = 45_000

export type PendingLiveWrite = { trainingNow: boolean; at: number }

export function isPendingLiveGuardActive(
  pending: PendingLiveWrite | null | undefined,
  now = Date.now()
): boolean {
  return !!pending && now - pending.at < LIVE_PENDING_GUARD_MS
}

/** Ignore Firestore profile snapshots that conflict with an in-flight LIVE toggle. */
export function shouldIgnoreConflictingLiveSnapshot(
  pending: PendingLiveWrite | null | undefined,
  firestoreTrainingNow: boolean,
  now = Date.now()
): boolean {
  if (!isPendingLiveGuardActive(pending, now)) return false
  return firestoreTrainingNow !== pending!.trainingNow
}

/**
 * Reject Firestore trainingNow:true when local is already OFF.
 * Only allow Firestore true while a pending ON write is in flight.
 */
export function shouldRejectStaleLiveOn(
  localTrainingNow: boolean | undefined,
  firestoreTrainingNow: boolean,
  pending: PendingLiveWrite | null | undefined,
  now = Date.now()
): boolean {
  if (localTrainingNow) return false
  if (!firestoreTrainingNow) return false
  if (pending?.trainingNow === true && isPendingLiveGuardActive(pending, now)) return false
  return true
}

/** Drop stale trainingNow:true from profile patches when user already turned LIVE off. */
export function stripStaleLiveReactivation<T extends { trainingNow?: boolean; trainingNowSince?: number | null }>(
  patch: T,
  localTrainingNow: boolean | undefined,
  pending: PendingLiveWrite | null | undefined,
  now = Date.now()
): T {
  if (localTrainingNow || !patch.trainingNow) return patch
  if (pending?.trainingNow === true && isPendingLiveGuardActive(pending, now)) return patch
  return {
    ...patch,
    trainingNow: false,
    trainingNowSince: null,
  }
}
