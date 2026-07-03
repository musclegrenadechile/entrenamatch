#!/usr/bin/env node
/**
 * Weekly pilot sync report (Fase 100).
 * Usage: node scripts/pilot-sync-report.mjs [--week=2026-06-02]
 */
import { getPilotFirestore, serviceAccountPath } from './lib/pilotFirebase.mjs'
import { existsSync } from 'node:fs'

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

if (!existsSync(serviceAccountPath())) {
  console.log('\nManual Firestore Console queries:\n')
  console.log(`  pilotWeeklyMetrics where weekKey == "${weekKey}"`)
  console.log(`  pilotSyncSessions where weekKey == "${weekKey}" order by endedAt desc`)
  console.log('\nMeta: >= 1 sync real/semana entre 2 usuarios en piloto costero.\n')
  process.exit(0)
}

const db = await getPilotFirestore()
if (!db) {
  console.error('No se pudo inicializar Firestore admin.')
  process.exit(1)
}

let metricsSnap
let sessionsSnap
try {
  metricsSnap = await db.collection('pilotWeeklyMetrics').where('weekKey', '==', weekKey).get()
  sessionsSnap = await db.collection('pilotSyncSessions').where('weekKey', '==', weekKey).get()
} catch (e) {
  const denied = e?.code === 7 || String(e?.message || '').includes('PERMISSION_DENIED')
  console.error(denied ? '\n⚠️  Service account sin permiso Firestore read.' : e.message)
  console.log('\nConsulta manual:')
  console.log(`  pilotWeeklyMetrics where weekKey == "${weekKey}"`)
  console.log(`  pilotSyncSessions where weekKey == "${weekKey}"`)
  process.exit(denied ? 0 : 1)
}

console.log(`\n=== Pilot EntrenaSync — semana ${weekKey} ===\n`)

if (metricsSnap.empty && sessionsSnap.empty) {
  console.log('Sin datos aún. Completa un sync real (≥2 min) entre 2 usuarios Firebase en el piloto.')
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
console.log(`Meta (≥1 sync/semana): ${totalSyncs >= 1 ? '✅ CUMPLIDA' : '❌ Pendiente'}\n`)

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
