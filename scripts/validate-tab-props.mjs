/**
 * Ensure App.tsx tab prop values reference identifiers defined in App.tsx.
 */
import fs from 'fs'

const app = fs.readFileSync('src/App.tsx', 'utf8')
const defined = new Set()
for (const m of app.matchAll(/\b(?:const|let|function)\s+(\w+)/g)) defined.add(m[1])
for (const m of app.matchAll(/\b(SEED_PROFILES|CapacitorCamera|db)\b/g)) defined.add(m[1])

function checkComponent(name) {
  const re = new RegExp(`<${name}[\\s\\S]*?/>`, 'm')
  const block = app.match(re)?.[0]
  if (!block) {
    console.error(`Block not found: ${name}`)
    return
  }
  const missing = []
  for (const m of block.matchAll(/\{(\w+)\}/g)) {
    const id = m[1]
    if (!defined.has(id)) missing.push(id)
  }
  console.log(`${name}:`, missing.length ? `MISSING → ${missing.join(', ')}` : 'OK')
}

checkComponent('ExploreLivePanel')
checkComponent('HomeTab')
