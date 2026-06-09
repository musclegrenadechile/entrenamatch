#!/usr/bin/env node
/**
 * Fase 103 — retención D1/D7 por cohorte piloto.
 * Usage: node scripts/pilot-retention-report.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const PILOT_CITIES = ['vina del mar', 'valparaiso', 'santiago', 'concon']

const saPath = join(root, 'android', 'play-service-account.json')
if (!existsSync(saPath)) {
  console.log('\n=== Retención piloto — consulta manual ===\n')
  console.log('Firebase Console → users (legalConsents.acceptedAt) + pilotCohort')
  console.log('D1 = usuarios que vuelven al día siguiente del registro')
  console.log('D7 = usuarios activos 7 días después del registro\n')
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
const now = Date.now()
const dayMs = 24 * 60 * 60 * 1000

console.log('\n=== Retención D1 / D7 — piloto Viña × Santiago ===\n')

const usersSnap = await db.collection('users').limit(500).get()
const byCity = new Map()

for (const doc of usersSnap.docs) {
  const d = doc.data()
  const city = (d.city || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  if (!PILOT_CITIES.includes(city)) continue
  const accepted = d.legalConsents?.acceptedAt || d.createdAt?.toMillis?.() || 0
  if (!accepted) continue
  const ageDays = Math.floor((now - accepted) / dayMs)
  const lastActive = d.lastActiveAt?.toMillis?.() || d.updatedAt?.toMillis?.() || accepted
  const daysSinceActive = Math.floor((now - lastActive) / dayMs)

  const bucket = byCity.get(city) || { registered: 0, d1: 0, d7: 0 }
  bucket.registered += 1
  if (ageDays >= 1 && daysSinceActive <= 1) bucket.d1 += 1
  if (ageDays >= 7 && daysSinceActive <= 7) bucket.d7 += 1
  byCity.set(city, bucket)
}

for (const city of PILOT_CITIES) {
  const b = byCity.get(city) || { registered: 0, d1: 0, d7: 0 }
  const d1pct = b.registered ? Math.round((b.d1 / b.registered) * 100) : 0
  const d7pct = b.registered ? Math.round((b.d7 / b.registered) * 100) : 0
  console.log(`  ${city}: ${b.registered} registrados · D1 ~${d1pct}% · D7 ~${d7pct}%`)
}

console.log('\nNota: aproximación por lastActiveAt; refinar con analytics en Fase 105.\n')
