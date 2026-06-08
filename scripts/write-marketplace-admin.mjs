/**
 * Write marketplaceAdmins/{uid} — run after firebase login.
 * Usage: node scripts/write-marketplace-admin.mjs YOUR_FIREBASE_UID you@email.com
 */
import { readFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const uid = process.argv[2]
const email = process.argv[3] || ''

if (!uid || uid.length < 10) {
  console.error('Usage: node scripts/write-marketplace-admin.mjs YOUR_FIREBASE_UID [email]')
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
console.log('Deploy rules: firebase deploy --only firestore:rules')
