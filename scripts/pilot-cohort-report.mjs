#!/usr/bin/env node
/**
 * Pilot cohort MAU report — costa central + Santiago closed beta.
 * Usage: node scripts/pilot-cohort-report.mjs
 */
import { getPilotFirestore, serviceAccountPath } from './lib/pilotFirebase.mjs'
import { existsSync } from 'node:fs'

const PILOT_CITIES = ['vina del mar', 'valparaiso', 'santiago', 'concon']
const TARGET_MIN = 50
const TARGET_MAX = 200

if (!existsSync(serviceAccountPath())) {
  console.log('\n=== Piloto costa central — consulta manual ===\n')
  console.log('Firebase Console → pilotCohort')
  for (const c of PILOT_CITIES) {
    console.log(`  - ${c}`)
  }
  console.log(`\nMeta: ${TARGET_MIN}–${TARGET_MAX} MAU total piloto\n`)
  process.exit(0)
}

const db = await getPilotFirestore()
if (!db) {
  console.error('No se pudo inicializar Firestore admin.')
  process.exit(1)
}

console.log('\n=== Piloto cerrado — cohorte por ciudad ===\n')

let total = 0
try {
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
} catch (e) {
  const denied = e?.code === 7 || String(e?.message || '').includes('PERMISSION_DENIED')
  console.error(denied ? '\n⚠️  Service account sin permiso Firestore read.' : e.message)
  console.log('\nConsulta manual: Firebase Console → Firestore → pilotCohort')
  for (const c of PILOT_CITIES) console.log(`  - ${c}`)
  console.log(`\nMeta: ${TARGET_MIN}–${TARGET_MAX} MAU total piloto\n`)
  process.exit(denied ? 0 : 1)
}
