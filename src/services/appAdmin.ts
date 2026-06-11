/**
 * Community admins — reportes, bloqueos y moderación (appAdmins/{uid}).
 */

import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type Firestore,
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import type { Report } from '../types'

const APP_ADMINS = 'appAdmins'
const REPORTS = 'reports'
const USER_BLOCKS = 'userBlocks'

export type AppAdminRecord = {
  uid: string
  name?: string
  displayLabel?: string
  role?: string
}

export type UserBlockRecord = {
  id: string
  blockerId: string
  blockedId: string
  blockerName?: string
  blockedName?: string
  timestamp: number
  source?: 'report' | 'manual'
  reportReason?: string
  reportDetails?: string
  reportId?: string
}

function mapReport(id: string, data: Record<string, unknown>): Report | null {
  if (typeof data.reportedUserId !== 'string') return null
  return {
    id,
    reporterId: String(data.reporterId || ''),
    reportedUserId: data.reportedUserId,
    reporterName: typeof data.reporterName === 'string' ? data.reporterName : undefined,
    reportedUserName: typeof data.reportedUserName === 'string' ? data.reportedUserName : undefined,
    reason: String(data.reason || ''),
    details: typeof data.details === 'string' ? data.details : undefined,
    context: (data.context as Report['context']) || 'profile',
    contextId: typeof data.contextId === 'string' ? data.contextId : undefined,
    timestamp: Number(data.timestamp) || Date.now(),
    status: (data.status as Report['status']) || 'pending',
    reviewedAt: typeof data.reviewedAt === 'number' ? data.reviewedAt : undefined,
  }
}

export function attachAppAdminListener(
  db: Firestore,
  uid: string,
  onChange: (record: AppAdminRecord | null) => void
): () => void {
  if (!uid) {
    onChange(null)
    return () => {}
  }
  return onSnapshot(
    doc(db, APP_ADMINS, uid),
    (snap) => {
      if (!snap.exists()) {
        onChange(null)
        return
      }
      const d = snap.data() as Record<string, unknown>
      onChange({
        uid,
        name: typeof d.name === 'string' ? d.name : undefined,
        displayLabel: typeof d.displayLabel === 'string' ? d.displayLabel : 'Admin',
        role: typeof d.role === 'string' ? d.role : 'community',
      })
    },
    () => onChange(null)
  )
}

export function attachAllReportsListener(
  db: Firestore,
  onUpdate: (reports: Report[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const q = query(collection(db, REPORTS), orderBy('timestamp', 'desc'), limit(200))
  return onSnapshot(
    q,
    (snap) => {
      const list: Report[] = []
      snap.forEach((d) => {
        const r = mapReport(d.id, d.data() as Record<string, unknown>)
        if (r) list.push(r)
      })
      onUpdate(list)
    },
    (err) => {
      console.warn('[Admin] reports listener error', err)
      onError?.(err)
      void getDocs(query(collection(db, REPORTS), limit(200)))
        .then((snap) => {
          const list: Report[] = []
          snap.forEach((d) => {
            const r = mapReport(d.id, d.data() as Record<string, unknown>)
            if (r) list.push(r)
          })
          list.sort((a, b) => b.timestamp - a.timestamp)
          onUpdate(list)
        })
        .catch(() => onUpdate([]))
    }
  )
}

export function attachUserBlocksListener(
  db: Firestore,
  onUpdate: (blocks: UserBlockRecord[]) => void
): () => void {
  const q = query(collection(db, USER_BLOCKS), orderBy('timestamp', 'desc'), limit(200))
  return onSnapshot(
    q,
    (snap) => {
      const list: UserBlockRecord[] = []
      snap.forEach((d) => {
        const data = d.data() as Record<string, unknown>
        list.push({
          id: d.id,
          blockerId: String(data.blockerId || ''),
          blockedId: String(data.blockedId || ''),
          blockerName: typeof data.blockerName === 'string' ? data.blockerName : undefined,
          blockedName: typeof data.blockedName === 'string' ? data.blockedName : undefined,
          timestamp: Number(data.timestamp) || Date.now(),
          source: data.source === 'report' || data.source === 'manual' ? data.source : undefined,
          reportReason: typeof data.reportReason === 'string' ? data.reportReason : undefined,
          reportDetails: typeof data.reportDetails === 'string' ? data.reportDetails : undefined,
          reportId: typeof data.reportId === 'string' ? data.reportId : undefined,
        })
      })
      onUpdate(list)
    },
    () => onUpdate([])
  )
}

export async function updateReportStatus(
  db: Firestore,
  reportId: string,
  status: Report['status']
): Promise<void> {
  await updateDoc(doc(db, REPORTS, reportId), {
    status,
    reviewedAt: Date.now(),
  })
}

export async function adminDeleteUserAccount(
  targetUserId: string,
  reason?: string
): Promise<{ ok: boolean; message?: string }> {
  const fn = getFunctions()
  const call = httpsCallable<
    { targetUserId: string; reason?: string },
    { ok: boolean; message?: string }
  >(fn, 'adminDeleteUserAccount')
  const res = await call({ targetUserId, reason })
  return res.data
}

export type SyncStreakRecalcChange = {
  uid: string
  name: string
  stored: number
  recalculated: number
  ratings: number
  workouts: number
  pilot: number
}

export type SyncStreakRecalcResult = {
  ok: boolean
  dryRun: boolean
  totalChanges: number
  profilesUpdated: number
  totalRemoved: number
  minVerifiedMinutes: number
  changes: SyncStreakRecalcChange[]
  changesTruncated?: boolean
}

export async function adminRecalculateSyncStreaks(opts?: {
  apply?: boolean
  targetUserId?: string
}): Promise<SyncStreakRecalcResult> {
  const fn = getFunctions()
  const call = httpsCallable<
    { apply?: boolean; targetUserId?: string },
    SyncStreakRecalcResult
  >(fn, 'adminRecalculateSyncStreaks')
  const res = await call({
    apply: opts?.apply === true,
    targetUserId: opts?.targetUserId,
  })
  return res.data
}

export async function persistUserBlock(
  db: Firestore,
  opts: {
    blockerId: string
    blockedId: string
    blockerName?: string
    blockedName?: string
    source?: 'report' | 'manual'
    reportReason?: string
    reportDetails?: string
    reportId?: string
  }
): Promise<void> {
  const { doc: docRef, setDoc, serverTimestamp } = await import('firebase/firestore')
  const id = `${opts.blockerId}_${opts.blockedId}`
  await setDoc(
    docRef(db, USER_BLOCKS, id),
    {
      blockerId: opts.blockerId,
      blockedId: opts.blockedId,
      blockerName: opts.blockerName || null,
      blockedName: opts.blockedName || null,
      source: opts.source || null,
      reportReason: opts.reportReason || null,
      reportDetails: opts.reportDetails || null,
      reportId: opts.reportId || null,
      timestamp: Date.now(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function fetchAppAdminUids(db: Firestore): Promise<string[]> {
  const snap = await getDocs(collection(db, APP_ADMINS))
  return snap.docs.map((d) => d.id)
}
