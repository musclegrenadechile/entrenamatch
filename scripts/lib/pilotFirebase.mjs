/**
 * Shared Firebase Admin bootstrap for pilot CLI reports.
 * Uses firebase-admin from functions/node_modules (no root install needed).
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const repoRoot = join(__dirname, '..', '..')

export function serviceAccountPath() {
  return join(repoRoot, 'android', 'play-service-account.json')
}

export async function getPilotFirestore() {
  const saPath = serviceAccountPath()
  if (!existsSync(saPath)) {
    return null
  }
  const require = createRequire(join(repoRoot, 'functions', 'package.json'))
  const admin = require('firebase-admin')
  if (!admin.apps.length) {
    const cred = JSON.parse(readFileSync(saPath, 'utf8'))
    admin.initializeApp({ credential: admin.credential.cert(cred) })
  }
  return admin.firestore()
}
