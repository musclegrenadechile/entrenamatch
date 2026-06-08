import fs from 'fs'
import path from 'path'

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (!['node_modules', 'dist'].includes(ent.name)) walk(p, acc)
    } else if (/\.(tsx?|css)$/.test(ent.name)) acc.push(p)
  }
  return acc
}

const replacements = [
  ['isLegendRipple', 'isHighlightRipple'],
  ['isLegendNotif', 'isNetworkNotif'],
  ['isLegendMsg', 'isNetworkMsg'],
  ['DailyRitualHomeProps', 'DailyHomeProps'],
  ['DailyRitualHome', 'DailyHome'],
  ['daily-ritual-home', 'daily-home'],
  ['setRitualRipples', 'setSyncRipples'],
  ['ritualRipples', 'syncRipples'],
  ['onShowOnlyLegendsChange', 'onShowOnlyNetworkChange'],
  ['setShowOnlyLegends', 'setShowOnlyNetwork'],
  ['showOnlyLegends', 'showOnlyNetwork'],
  ['legendUnlocked', 'highlightUnlocked'],
  ['vibeToLegend', 'vibeToHighlight'],
  ['awardMomentum', 'awardConstancy'],
  ['_isRitualRipple', '_isSyncRipple'],
  ['isLegend', 'isNetworkBond'],
  ['action-ritual-btn', 'action-sync-btn'],
  ['arena-legend-badge--soon', 'arena-highlight-badge--soon'],
  ['arena-legend-badge', 'arena-highlight-badge'],
  ['legend-message-toast', 'network-message-toast'],
  ['legend-toast-content', 'network-toast-content'],
  ['legend-notif', 'network-notif'],
  ['legend-card', 'network-bond-card'],
  ['legend-flame', 'bond-flame'],
  ['ritual-ripple-pulse', 'sync-ripple-pulse'],
  ['legend-ripple-pulse', 'highlight-ripple-pulse'],
  ['ritual-map-ripple', 'sync-map-ripple'],
  ['legend-ripple', 'highlight-ripple'],
  ['ritual-ripple', 'sync-ripple'],
  ['ritual-wave-flow', 'sync-wave-flow'],
  ['ritual-wave-line', 'sync-wave-line'],
  ['ritual-wave-receiver', 'sync-wave-receiver'],
  ['ritual-receiver-pulse', 'sync-receiver-pulse'],
  ['legend-tether-glow', 'network-bond-tether-glow'],
  ['legend-tether', 'network-bond-tether'],
  ['legend-marker', 'network-bond-marker'],
  ["'ritual-'", "'sync-'"],
]

const root = path.resolve('src')
const files = walk(root)
files.push(path.resolve('src/index.css'))

let touched = 0
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8')
  const orig = text
  for (const [from, to] of replacements) {
    text = text.split(from).join(to)
  }
  if (text !== orig) {
    fs.writeFileSync(file, text)
    touched++
    console.log('updated', path.relative(process.cwd(), file))
  }
}

const oldPath = path.resolve('src/components/home/DailyRitualHome.tsx')
const newPath = path.resolve('src/components/home/DailyHome.tsx')
if (fs.existsSync(oldPath)) {
  fs.renameSync(oldPath, newPath)
  console.log('renamed DailyRitualHome.tsx -> DailyHome.tsx')
}

console.log(`Done: ${touched} files updated`)
