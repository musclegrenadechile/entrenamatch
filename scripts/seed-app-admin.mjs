#!/usr/bin/env node
/**
 * Grant community admin (appAdmins/{uid}).
 *
 *   node scripts/seed-app-admin.mjs --uid FIREBASE_UID --name "Jorge Erpel"
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or firebase-admin default credentials.
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'

function arg(name) {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const uid = arg('--uid')
const name = arg('--name') || 'Admin'

if (!uid) {
  console.error('Usage: node scripts/seed-app-admin.mjs --uid <firebase-uid> [--name "Jorge Erpel"]')
  process.exit(1)
}

const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (saPath && existsSync(saPath)) {
  initializeApp({ credential: cert(JSON.parse(readFileSync(saPath, 'utf8'))) })
} else {
  initializeApp({ credential: applicationDefault() })
}

const db = getFirestore()

await db.collection('appAdmins').doc(uid).set(
  {
    name,
    displayLabel: 'Admin',
    role: 'community',
    grantedAt: FieldValue.serverTimestamp(),
  },
  { merge: true }
)

await db.collection('profiles').doc(uid).set(
  { communityAdmin: true, updatedAt: Date.now() },
  { merge: true }
)

console.log(JSON.stringify({ ok: true, uid, name }))
