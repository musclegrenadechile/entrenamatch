#!/usr/bin/env node
/**
 * Weekly pilot sync report (Fase 100).
 * Requires: GOOGLE_APPLICATION_CREDENTIALS or firebase login for admin SDK.
 *
 * Usage:
 *   node scripts/pilot-sync-report.mjs
 *   node scripts/pilot-sync-report.mjs --week 2026-06-02
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function getWeekKey(d = new Date()) {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

const weekArg = process.argv.find((a) => a.startsWith('--week='))?.split('=')[1]
const weekKey = weekArg || getWeekKey()

const saPath = join(root, 'android', 'play-service-account.json')
if (!existsSync(saPath)) {
  console.error('Missing android/play-service-account.json for admin read.')
  console.log('\nManual Firestore Console queries:\n')
  console.log(`  pilotWeeklyMetrics where weekKey == "${weekKey}"`)
  console.log(`  pilotSyncSessions where weekKey == "${weekKey}" order by endedAt desc`)
  console.log('\nMeta Fase 100: >= 1 sync real/semana entre 2 usuarios en Viña o Santiago.')
  process.exit(0)
}

let admin
try {
  const mod = await import('firebase-admin')
  admin = mod.default || mod
  if (!admin.apps.length) {
    const cred = JSON.parse(readFileSync(saPath, 'utf8'))
    admin.initializeApp({ credential: admin.credential.cert(cred) })
  }
} catch (e) {
  console.error('firebase-admin not available:', e.message)
  process.exit(1)
}

const db = admin.firestore()
const metricsSnap = await db.collection('pilotWeeklyMetrics').where('weekKey', '==', weekKey).get()
const sessionsSnap = await db.collection('pilotSyncSessions').where('weekKey', '==', weekKey).get()

console.log(`\n=== Pilot EntrenaSync — semana ${weekKey} ===\n`)

if (metricsSnap.empty && sessionsSnap.empty) {
  console.log('Sin datos aún. Completa un sync real (≥2 min) entre 2 usuarios Firebase en Viña o Santiago.')
  process.exit(0)
}

let totalSyncs = 0
let totalMin = 0
for (const doc of metricsSnap.docs) {
  const d = doc.data()
  totalSyncs += d.realSyncCount || 0
  totalMin += d.totalSyncMinutes || 0
  console.log(`  ${d.cityLabel || d.cityNorm}: ${d.realSyncCount} syncs · ${d.totalSyncMinutes} min`)
}

console.log(`\nTotal: ${totalSyncs} syncs · ${totalMin} min`)
console.log(`Sesiones registradas: ${sessionsSnap.size}`)
console.log(`Meta Fase 100 (≥1 sync/semana): ${totalSyncs >= 1 ? '✅ CUMPLIDA' : '❌ Pendiente'}\n`)

if (sessionsSnap.size > 0) {
  console.log('Últimas sesiones:')
  const sorted = sessionsSnap.docs
    .map((d) => d.data())
    .sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0))
    .slice(0, 5)
  for (const s of sorted) {
    console.log(
      `  - ${s.sessionId} · ${s.durationMin}min · ${s.cityLabel} · ${s.participants?.join(' × ')}`
    )
  }
}
