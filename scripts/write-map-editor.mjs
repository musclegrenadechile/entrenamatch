/**
 * Write mapEditors/{uid} via Firestore REST + user OAuth (firebase login).
 * Usage: node scripts/write-map-editor.mjs [uid] [email]
 */
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const uid = process.argv[2] || 'GuYzxUYezEflWOEgRYbQljhNEDk2'
const email = process.argv[3] || 'musclegrenadechile@gmail.com'

async function getAccessToken() {
  try {
    const { GoogleAuth } = require('google-auth-library')
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform'],
    })
    const client = await auth.getClient()
    const res = await client.getAccessToken()
    if (res.token) return res.token
  } catch (e) {
    console.warn('GoogleAuth failed:', e.message)
  }

  // Firebase CLI refresh token (Windows)
  const cfgPaths = [
    join(process.env.APPDATA || '', 'configstore', 'firebase-tools.json'),
    join(process.env.HOME || process.env.USERPROFILE || '', '.config', 'configstore', 'firebase-tools.json'),
  ]
  for (const p of cfgPaths) {
    if (!existsSync(p)) continue
    const cfg = JSON.parse(readFileSync(p, 'utf8'))
    const refresh = cfg?.tokens?.refresh_token
    if (!refresh) continue
    const params = new URLSearchParams({
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9pD0rKEiMJdbORFC9k8Md',
      refresh_token: refresh,
      grant_type: 'refresh_token',
    })
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    const data = await res.json()
    if (data.access_token) return data.access_token
  }

  throw new Error('No OAuth token — run: firebase login')
}

async function main() {
  const token = await getAccessToken()
  const url = `https://firestore.googleapis.com/v1/projects/entrenamatch/databases/(default)/documents/mapEditors/${uid}?updateMask.fieldPaths=role&updateMask.fieldPaths=email&updateMask.fieldPaths=addedBy`

  const body = {
    fields: {
      role: { stringValue: 'map' },
      email: { stringValue: email },
      addedBy: { stringValue: 'write-map-editor.mjs' },
    },
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Firestore REST ${res.status}: ${text}`)
  }

  console.log(`✓ mapEditors/${uid} (${email})`)
}

main().catch((e) => {
  console.error(e.message || e)
  process.exit(1)
})
