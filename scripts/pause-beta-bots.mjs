#!/usr/bin/env node
/**
 * Pausa los 15 beta bots (tick + LIVE + presencia).
 *
 *   node scripts/pause-beta-bots.mjs
 *   node scripts/pause-beta-bots.mjs --resume
 *
 * Requiere GOOGLE_APPLICATION_CREDENTIALS o Application Default Credentials.
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'

const resume = process.argv.includes('--resume')
const BOT_UIDS = Array.from({ length: 15 }, (_, i) => `beta_bot_${String(i + 1).padStart(2, '0')}`)

const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (saPath && existsSync(saPath)) {
  initializeApp({ credential: cert(JSON.parse(readFileSync(saPath, 'utf8'))) })
} else {
  initializeApp({ credential: applicationDefault() })
}

const db = getFirestore()
const now = Date.now()

await db
  .collection('config')
  .doc('betaBots')
  .set(
    {
      enabled: resume,
      botBotSocialEnabled: resume,
      syncInviteEnabled: resume,
      batchSize: resume ? 3 : 0,
      pausedAt: resume ? FieldValue.delete() : now,
      pauseReason: resume ? FieldValue.delete() : 'perf-lag-temporary',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )

if (!resume) {
  const batch = db.batch()
  for (const uid of BOT_UIDS) {
    const profileRef = db.collection('profiles').doc(uid)
    batch.set(
      profileRef,
      {
        trainingNow: false,
        trainingNowSince: FieldValue.delete(),
        trainingSyncWith: FieldValue.delete(),
        updatedAt: now,
      },
      { merge: true }
    )
    batch.delete(db.collection('livePresence').doc(uid))
  }
  await batch.commit()
}

console.log(
  JSON.stringify({
    ok: true,
    action: resume ? 'resumed' : 'paused',
    bots: BOT_UIDS.length,
    config: 'config/betaBots',
  })
)
