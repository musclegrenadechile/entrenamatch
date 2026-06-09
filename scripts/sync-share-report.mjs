#!/usr/bin/env node
/**
 * Post-sync share funnel — weekly publish rate per user.
 * Usage: node scripts/sync-share-report.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const saPath = join(__dirname, '..', 'serviceAccountKey.json')

function weekKey(d = new Date()) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  return monday.toISOString().slice(0, 10)
}

async function main() {
  if (!existsSync(saPath)) {
    console.error('Missing serviceAccountKey.json — run from project root with Firebase admin creds.')
    process.exit(1)
  }
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(readFileSync(saPath, 'utf8'))) })
  }
  const db = getFirestore()
  const wk = weekKey()
  const snap = await db.collection('syncShareWeekly').where('weekKey', '==', wk).get()
  if (snap.empty) {
    console.log(`No syncShareWeekly docs for week ${wk}`)
    return
  }
  let offers = 0
  let publishes = 0
  let skips = 0
  for (const doc of snap.docs) {
    const d = doc.data()
    offers += d.offers || 0
    publishes += d.publishes || 0
    skips += d.skips || 0
    const rate = d.offers ? Math.round(((d.publishes || 0) / d.offers) * 100) : 0
    console.log(
      `${d.uid?.slice(0, 8) || doc.id} · offers ${d.offers} · publish ${d.publishes} · skip ${d.skips} · ${rate}%`
    )
  }
  const globalRate = offers ? Math.round((publishes / offers) * 100) : 0
  console.log(`\nWeek ${wk} — total offers ${offers}, publishes ${publishes}, skips ${skips}, rate ${globalRate}%`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
