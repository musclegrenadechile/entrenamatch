#!/usr/bin/env node
/**
 * Pilot cohort MAU report — Viña + Santiago closed beta.
 * Usage: node scripts/pilot-cohort-report.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const PILOT_CITIES = ['vina del mar', 'valparaiso', 'santiago', 'concon']
const TARGET_MIN = 50
const TARGET_MAX = 200

const saPath = join(root, 'android', 'play-service-account.json')
if (!existsSync(saPath)) {
  console.log('\n=== Piloto Viña × Santiago — consulta manual ===\n')
  console.log('Firebase Console → pilotCohort')
  for (const c of PILOT_CITIES) {
    console.log(`  - ${c.replace(/_/g, ' ')}`)
  }
  console.log(`\nMeta: ${TARGET_MIN}–${TARGET_MAX} MAU por ciudad piloto\n`)
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
console.log('\n=== Piloto cerrado — cohorte por ciudad ===\n')

let total = 0
for (const cityNorm of PILOT_CITIES) {
  const id = cityNorm.replace(/[^a-z0-9_-]/g, '_')
  const snap = await db.doc(`pilotCohort/${id}`).get()
  if (!snap.exists) {
    console.log(`  ${cityNorm}: 0 miembros (sin datos)`)
    continue
  }
  const d = snap.data()
  const n = d.memberCount || 0
  total += n
  const status = n >= TARGET_MIN ? '✅' : '🔄'
  console.log(`  ${status} ${d.cityLabel || cityNorm}: ${n} miembros (activos 7d: ${d.activeLast7d || 0})`)
}

console.log(`\nTotal piloto: ${total} miembros`)
console.log(`Meta ${TARGET_MIN}–${TARGET_MAX} MAU: ${total >= TARGET_MIN ? 'MÍNIMO ALCANZADO ✅' : 'en progreso 🔄'}\n`)
