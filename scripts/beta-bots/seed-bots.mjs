/**
 * Crea/actualiza 15 beta bots en Firebase (Auth + Storage fotos + Firestore profiles).
 *
 * Requisitos:
 *   - GOOGLE_APPLICATION_CREDENTIALS o android/play-service-account.json
 *   - Fotos en scripts/beta-bots/photos/{uid}_primary.png (generate-photos.ps1)
 *
 * Uso: node scripts/beta-bots/seed-bots.mjs
 *      node scripts/beta-bots/seed-bots.mjs --dry-run
 */

import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')
const require = createRequire(import.meta.url)
const admin = require(join(ROOT, 'functions/node_modules/firebase-admin'))
const DRY = process.argv.includes('--dry-run')
const NO_UPLOAD = process.argv.includes('--no-upload')
const PHOTO_BASE_URL =
  process.env.BETA_BOT_PHOTO_BASE_URL || 'https://entrenamatch.web.app/beta-bots'

const personas = JSON.parse(readFileSync(join(__dirname, 'personas.json'), 'utf8'))

function resolveCredential() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return
  const candidates = [
    join(ROOT, 'android', 'play-service-account.json'),
    join(ROOT, 'service-account.json'),
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = p
      return p
    }
  }
  throw new Error('No service account JSON found. Set GOOGLE_APPLICATION_CREDENTIALS.')
}

resolveCredential()
if (!admin.apps.length) {
  admin.initializeApp({
    storageBucket: 'entrenamatch.firebasestorage.app',
  })
}

const db = admin.firestore()
const bucket = admin.storage().bucket()

/** Auth opcional — requiere service account con rol Firebase Auth Admin (no el de Play Store). */
const SKIP_AUTH = process.argv.includes('--skip-auth') || process.env.BETA_BOTS_SKIP_AUTH === '1'
let auth = null
if (!SKIP_AUTH) {
  try {
    auth = admin.auth()
  } catch {
    /* ignore */
  }
}

async function ensureAuthUser(bot) {
  if (SKIP_AUTH || !auth) {
    return { created: false, email: null, skipped: true }
  }
  const email = `${bot.uid}@beta.entrenamatch.internal`
  try {
    await auth.getUser(bot.uid)
    if (!DRY) {
      await auth.updateUser(bot.uid, { displayName: bot.name, disabled: false })
    }
    return { created: false, email }
  } catch (e) {
    if (e.code !== 'auth/user-not-found') throw e
    if (DRY) return { created: true, email }
    await auth.createUser({
      uid: bot.uid,
      email,
      displayName: bot.name,
      password: `BetaBot_${bot.uid}_${Date.now().toString(36)}!`,
      disabled: false,
    })
    return { created: true, email }
  }
}

async function uploadPhoto(bot) {
  const local = join(__dirname, 'photos', `${bot.uid}_primary.png`)
  if (NO_UPLOAD) {
    if (existsSync(local)) {
      return `${PHOTO_BASE_URL}/${bot.uid}_primary.png`
    }
    console.warn(`  [warn] Sin foto local: ${local}`)
    return null
  }
  if (!existsSync(local)) {
    console.warn(`  [warn] Sin foto local: ${local} — usa placeholder`)
    return null
  }
  const dest = `beta-bots/${bot.uid}/primary.png`
  if (DRY) return `https://storage.googleapis.com/entrenamatch.firebasestorage.app/${dest}`

  await bucket.upload(local, {
    destination: dest,
    metadata: { contentType: 'image/png', cacheControl: 'public,max-age=31536000' },
  })
  const file = bucket.file(dest)
  await file.makePublic().catch(() => {})
  return `https://storage.googleapis.com/${bucket.name}/${dest}`
}

async function seedProfile(bot, photoUrl) {
  const now = Date.now()
  const photos = photoUrl
    ? [photoUrl]
    : [`https://picsum.photos/seed/${bot.uid}/600/800`]

  const profile = {
    uid: bot.uid,
    name: bot.name,
    age: bot.age,
    gender: bot.gender,
    city: bot.city,
    country: bot.country,
    lat: bot.lat,
    lng: bot.lng,
    bio: bot.bio,
    photos,
    trainingTypes: bot.trainingTypes,
    goals: bot.goals,
    level: bot.level,
    availability: bot.availability,
    isBetaBot: true,
    betaBotPersonality: bot.personality,
    betaBotVersion: personas.version,
    trainingNow: false,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }

  if (!DRY) {
    await db.collection('profiles').doc(bot.uid).set(profile, { merge: true })
  }
  return profile
}

async function seedConfig() {
  const cfg = {
    enabled: true,
    version: personas.version,
    badgeLabel: personas.badgeLabel,
    botUids: personas.bots.map((b) => b.uid),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }
  if (!DRY) {
    await db.collection('config').doc('betaBots').set(cfg, { merge: true })
  }
  return cfg
}

async function main() {
  console.log(`\nEntrenaMatch beta bots seed ${DRY ? '(DRY RUN)' : ''}`)
  console.log(`Bots: ${personas.bots.length}\n`)

  let created = 0
  let uploaded = 0

  for (const bot of personas.bots) {
    console.log(`→ ${bot.uid} (${bot.name})`)
    const authRes = await ensureAuthUser(bot)
    if (authRes.created) created++
    if (authRes.skipped) {
      console.log('  auth: skipped (--skip-auth)')
    } else {
      console.log(`  auth: ${authRes.created ? 'created' : 'exists'} ${authRes.email}`)
    }

    const photoUrl = await uploadPhoto(bot)
    if (photoUrl) {
      uploaded++
      console.log(`  photo: ${photoUrl.slice(0, 72)}...`)
    }

    await seedProfile(bot, photoUrl)
    console.log(`  profile: ok`)
  }

  await seedConfig()
  console.log(`\nconfig/betaBots: enabled=true`)
  console.log(`\nResumen: ${created} auth creados, ${uploaded} fotos subidas`)
  if (DRY) console.log('(dry-run — sin escrituras reales)')
  else console.log('\nSiguiente: firebase deploy --only functions:betaBotTick,functions:onLikeToBetaBot,functions:onMessageToBetaBot')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
