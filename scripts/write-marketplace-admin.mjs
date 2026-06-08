/**
 * Write marketplaceAdmins/{uid} — run after firebase login.
 * Usage:
 *   node scripts/write-marketplace-admin.mjs YOUR_FIREBASE_UID [email]
 *   node scripts/write-marketplace-admin.mjs you@email.com
 */
import { readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const arg = process.argv[2]?.trim() || ''
const arg2 = process.argv[3]?.trim() || ''

if (!arg) {
  console.error('Usage:')
  console.error('  node scripts/write-marketplace-admin.mjs YOUR_FIREBASE_UID [email]')
  console.error('  node scripts/write-marketplace-admin.mjs you@email.com')
  process.exit(1)
}

const configPath = join(process.cwd(), 'firebase.json')
let projectId = 'entrenamatch'
try {
  const cfg = JSON.parse(readFileSync(configPath, 'utf8'))
  projectId = cfg.projectId || process.env.GCLOUD_PROJECT || projectId
} catch {
  /* default */
}

const tokenPath = join(homedir(), '.config', 'configstore', 'firebase-tools.json')
let accessToken
try {
  const store = JSON.parse(readFileSync(tokenPath, 'utf8'))
  accessToken = store?.tokens?.access_token
} catch {
  console.error('Run: firebase login')
  process.exit(1)
}

if (!accessToken) {
  console.error('No Firebase access token. Run: firebase login')
  process.exit(1)
}

async function lookupUidByEmail(email) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: [email] }),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Auth lookup failed (${res.status}): ${text}`)
  }
  const data = await res.json()
  const uid = data?.users?.[0]?.localId
  if (!uid) throw new Error(`No Firebase user found for ${email}`)
  return uid
}

let uid = arg
let email = arg.includes('@') ? arg : arg2

if (arg.includes('@')) {
  console.log(`Looking up UID for ${arg}…`)
  uid = await lookupUidByEmail(arg)
  console.log(`Found UID: ${uid}`)
} else if (uid.length < 10) {
  console.error('UID too short. Pass a full Firebase UID or an email address.')
  process.exit(1)
}

const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/marketplaceAdmins/${uid}?updateMask.fieldPaths=role&updateMask.fieldPaths=email&updateMask.fieldPaths=addedAt`

const body = {
  fields: {
    role: { stringValue: 'developer' },
    email: { stringValue: email },
    addedAt: { integerValue: String(Date.now()) },
  },
}

const res = await fetch(url, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
})

if (!res.ok) {
  const text = await res.text()
  console.error('Failed:', res.status, text)
  process.exit(1)
}

console.log(`✓ marketplaceAdmins/${uid} (${email || 'no email'})`)
console.log('Recarga la app (Perfil → Tienda) para ver "+ Nuevo".')
console.log('If writes fail, deploy rules: firebase deploy --only firestore:rules')
