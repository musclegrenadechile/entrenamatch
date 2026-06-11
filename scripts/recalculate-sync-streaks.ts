#!/usr/bin/env npx tsx
/**
 * One-time cleanup: recalculate profiles.syncStreak from verified evidence (≥15 min).
 *
 * Usage:
 *   npx tsx scripts/recalculate-sync-streaks.ts              # dry-run (default)
 *   npx tsx scripts/recalculate-sync-streaks.ts --apply      # write to Firestore
 *   npx tsx scripts/recalculate-sync-streaks.ts --uid=XXX    # single user
 *
 * Credentials: GOOGLE_APPLICATION_CREDENTIALS or android/play-service-account.json
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pathToFileURL } from 'node:url'

type Firestore = import('firebase-admin/firestore').Firestore
type FieldValue = typeof import('firebase-admin/firestore').FieldValue
import {
  countVerifiedSyncStreak,
  shouldUpdateSyncStreak,
  type PilotSyncEvidence,
  type SyncRatingEvidence,
  type SyncWorkoutEvidence,
  MIN_VERIFIED_SYNC_MINUTES,
} from '../src/utils/recalculateSyncStreak'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function arg(name: string): string | undefined {
  const prefixed = process.argv.find((a) => a.startsWith(`${name}=`))
  if (prefixed) return prefixed.split('=').slice(1).join('=')
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const apply = process.argv.includes('--apply')
const singleUid = arg('--uid')

async function loadAdminSdk() {
  const adminRoot = join(root, 'functions', 'node_modules', 'firebase-admin')
  if (!existsSync(join(adminRoot, 'package.json'))) {
    throw new Error('Missing functions/node_modules/firebase-admin — run: cd functions && npm install')
  }
  const appMod = await import(pathToFileURL(join(adminRoot, 'lib/app/index.js')).href)
  const fsMod = await import(pathToFileURL(join(adminRoot, 'lib/firestore/index.js')).href)
  const { initializeApp, cert, applicationDefault } = appMod
  const { getFirestore, FieldValue } = fsMod

  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const fallback = join(root, 'android', 'play-service-account.json')
  if (envPath && existsSync(envPath)) {
    initializeApp({ credential: cert(JSON.parse(readFileSync(envPath, 'utf8'))) })
  } else if (existsSync(fallback)) {
    initializeApp({ credential: cert(JSON.parse(readFileSync(fallback, 'utf8'))) })
  } else {
    initializeApp({ credential: applicationDefault() })
  }

  return { db: getFirestore(), FieldValue }
}

type ProfileRow = {
  uid: string
  name: string
  stored: number
  ratings: SyncRatingEvidence[]
  accountStatus?: string
}

async function loadWorkoutsByUser(db: Firestore): Promise<Map<string, SyncWorkoutEvidence[]>> {
  const map = new Map<string, SyncWorkoutEvidence[]>()
  const snap = await db.collection('workouts').where('source', '==', 'sync').get()
  for (const doc of snap.docs) {
    const d = doc.data()
    const userId = String(d.userId || '')
    if (!userId) continue
    const durationMin = Number(d.stats?.durationMin ?? d.durationMin) || 0
    const row: SyncWorkoutEvidence = {
      id: doc.id,
      syncSessionId: typeof d.syncSessionId === 'string' ? d.syncSessionId : null,
      durationMin,
      endedAt: Number(d.endedAt) || undefined,
      partnerId: typeof d.partnerId === 'string' ? d.partnerId : null,
    }
    const list = map.get(userId) || []
    list.push(row)
    map.set(userId, list)
  }
  return map
}

async function loadPilotSessionsByUser(db: Firestore): Promise<Map<string, PilotSyncEvidence[]>> {
  const map = new Map<string, PilotSyncEvidence[]>()
  const snap = await db.collection('pilotSyncSessions').get()
  for (const doc of snap.docs) {
    const d = doc.data()
    const durationMin = Number(d.durationMin) || 0
    const sessionId = String(d.sessionId || doc.id)
    const participants = Array.isArray(d.participants) ? d.participants.map(String) : []
    const evidence: PilotSyncEvidence = {
      sessionId,
      durationMin,
      endedAt: Number(d.endedAt) || undefined,
    }
    for (const uid of participants) {
      const list = map.get(uid) || []
      list.push(evidence)
      map.set(uid, list)
    }
  }
  return map
}

async function loadProfiles(db: Firestore, uid?: string): Promise<ProfileRow[]> {
  const rows: ProfileRow[] = []
  if (uid) {
    const snap = await db.collection('profiles').doc(uid).get()
    if (!snap.exists) return []
    const d = snap.data() || {}
    rows.push({
      uid,
      name: String(d.name || uid),
      stored: Number(d.syncStreak) || 0,
      ratings: Array.isArray(d.syncRatings) ? d.syncRatings : [],
      accountStatus: typeof d.accountStatus === 'string' ? d.accountStatus : undefined,
    })
    return rows
  }

  const snap = await db.collection('profiles').get()
  for (const doc of snap.docs) {
    const d = doc.data()
    const stored = Number(d.syncStreak) || 0
    const ratings = Array.isArray(d.syncRatings) ? d.syncRatings : []
    if (stored <= 0 && ratings.length === 0) continue
    rows.push({
      uid: doc.id,
      name: String(d.name || doc.id),
      stored,
      ratings,
      accountStatus: typeof d.accountStatus === 'string' ? d.accountStatus : undefined,
    })
  }
  return rows
}

async function main() {
  const { db, FieldValue } = await loadAdminSdk()

  console.log(`\n=== Recalcular syncStreak (≥${MIN_VERIFIED_SYNC_MINUTES} min) ===`)
  console.log(`Modo: ${apply ? 'APPLY (escribe Firestore)' : 'DRY-RUN (solo reporte)'}`)
  if (singleUid) console.log(`Usuario: ${singleUid}`)
  console.log('')

  const [profiles, workoutsByUser, pilotByUser] = await Promise.all([
    loadProfiles(db, singleUid),
    loadWorkoutsByUser(db),
    loadPilotSessionsByUser(db),
  ])

  const changes: Array<{
    uid: string
    name: string
    stored: number
    recalculated: number
    ratings: number
    workouts: number
    pilot: number
  }> = []

  for (const profile of profiles) {
    if (profile.accountStatus === 'deleted') continue

    const workouts = workoutsByUser.get(profile.uid) || []
    const pilot = pilotByUser.get(profile.uid) || []
    const recalculated = countVerifiedSyncStreak(profile.ratings, workouts, pilot)

    if (!shouldUpdateSyncStreak(profile.stored, recalculated)) continue

    const verifiedRatings = profile.ratings.filter((r) => (Number(r.minutes) || 0) >= MIN_VERIFIED_SYNC_MINUTES).length
    const verifiedWorkouts = workouts.filter((w) => w.durationMin >= MIN_VERIFIED_SYNC_MINUTES).length
    const verifiedPilot = pilot.filter((p) => p.durationMin >= MIN_VERIFIED_SYNC_MINUTES).length

    changes.push({
      uid: profile.uid,
      name: profile.name,
      stored: profile.stored,
      recalculated,
      ratings: verifiedRatings,
      workouts: verifiedWorkouts,
      pilot: verifiedPilot,
    })
  }

  if (changes.length === 0) {
    console.log('Nada que corregir — todos los syncStreak coinciden con evidencia verificada.')
    return
  }

  changes.sort((a, b) => b.stored - b.recalculated - (a.stored - a.recalculated))

  let totalRemoved = 0
  for (const row of changes) {
    const delta = row.recalculated - row.stored
    if (delta < 0) totalRemoved += -delta
    console.log(
      `  ${row.name.slice(0, 24).padEnd(24)} ${String(row.stored).padStart(3)} → ${String(row.recalculated).padStart(3)}  (ratings:${row.ratings} workouts:${row.workouts} pilot:${row.pilot})  ${row.uid}`
    )
  }

  console.log(`\nPerfiles a actualizar: ${changes.length}`)
  console.log(`Syncs inflados a quitar (neto): ${totalRemoved}`)

  if (!apply) {
    console.log('\nDry-run completo. Ejecuta con --apply para escribir los cambios.')
    return
  }

  const batchSize = 400
  for (let i = 0; i < changes.length; i += batchSize) {
    const batch = db.batch()
    const slice = changes.slice(i, i + batchSize)
    for (const row of slice) {
      batch.update(db.collection('profiles').doc(row.uid), {
        syncStreak: row.recalculated,
        syncStreakRecalculatedAt: FieldValue.serverTimestamp(),
        updatedAt: Date.now(),
      })
    }
    await batch.commit()
  }

  await db.collection('adminAudit').add({
    action: 'recalculate_sync_streaks',
    profilesUpdated: changes.length,
    totalRemoved,
    minVerifiedMinutes: MIN_VERIFIED_SYNC_MINUTES,
    dryRun: false,
    createdAt: FieldValue.serverTimestamp(),
  })

  console.log('\n✅ Firestore actualizado.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
