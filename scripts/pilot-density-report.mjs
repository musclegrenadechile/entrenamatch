#!/usr/bin/env node
/**
 * Fase 121 — reporte unificado de densidad piloto.
 * Usage: node scripts/pilot-density-report.mjs [--week=2026-06-09]
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const PILOT_CITIES = ['vina del mar', 'valparaiso', 'santiago', 'concon']
const TARGET_MIN = 50

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
  console.log('\n=== Piloto densidad — consulta manual ===\n')
  console.log(`Semana: ${weekKey}\n`)
  console.log('Firebase Console:')
  console.log('  pilotCohort → memberCount por ciudad')
  console.log(`  pilotWeeklyMetrics where weekKey == "${weekKey}"`)
  console.log(`  pilotDensityWeekly where weekKey == "${weekKey}"`)
  console.log(`  pilotSyncSessions where weekKey == "${weekKey}"`)
  console.log('\nMeta: 50 MAU/ciudad · ≥1 sync real/semana · invites creciendo\n')
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
  console.error('firebase-admin:', e.message)
  process.exit(1)
}

const db = admin.firestore()
console.log(`\n=== Piloto densidad — semana ${weekKey} ===\n`)

let totalMembers = 0
let totalSyncs = 0
let totalInvites = 0

for (const cityNorm of PILOT_CITIES) {
  const id = cityNorm.replace(/[^a-z0-9_-]/g, '_')
  const cohort = await db.doc(`pilotCohort/${id}`).get()
  const metricsId = `${id}__${weekKey}`.replace(/[^a-z0-9_-]/g, '_').slice(0, 120)
  const sync = await db.doc(`pilotWeeklyMetrics/${metricsId}`).get()
  const density = await db.doc(`pilotDensityWeekly/${metricsId}`).get()

  const members = cohort.exists ? cohort.data().memberCount || 0 : 0
  const syncs = sync.exists ? sync.data().realSyncCount || 0 : 0
  const invites = density.exists ? density.data().invitesShared || 0 : 0
  const qr = density.exists ? density.data().gymQrOpens || 0 : 0
  const stories = density.exists ? density.data().syncStoriesShared || 0 : 0

  totalMembers += members
  totalSyncs += syncs
  totalInvites += invites

  const label = cohort.exists ? cohort.data().cityLabel || cityNorm : cityNorm
  const status = members >= TARGET_MIN && syncs >= 1 ? '✅' : '🔄'
  console.log(`  ${status} ${label}`)
  console.log(`      Miembros: ${members} · Syncs: ${syncs} · Invites: ${invites} · QR: ${qr} · Stories: ${stories}`)
}

console.log(`\nTotales: ${totalMembers} miembros · ${totalSyncs} syncs · ${totalInvites} invites`)
console.log(`Meta MAU (${TARGET_MIN}+): ${totalMembers >= TARGET_MIN ? '✅' : '🔄'}`)
console.log(`Meta sync semanal (≥1): ${totalSyncs >= 1 ? '✅' : '❌'}\n`)
