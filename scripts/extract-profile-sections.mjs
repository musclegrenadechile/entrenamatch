import fs from 'fs'
import path from 'path'

const profileTabPath = path.join(process.cwd(), 'src/components/profile/ProfileTab.tsx')
const lines = fs.readFileSync(profileTabPath, 'utf8').split(/\r?\n/)

function findLine(pred, from = 0) {
  const idx = lines.findIndex((l, i) => i >= from && pred(l))
  if (idx < 0) throw new Error('marker not found: ' + pred.toString())
  return idx
}

const debugStart = findLine((l) => l.includes('In-app debug logs export'))
const statsStart = findLine((l) => l.includes('Stats row - premium visual cards'))
const debugEnd = statsStart - 1

const pulseCommentStart = findLine((l) => l.includes('{/* ====================================================='))
const pulseStart = pulseCommentStart
const pulseEnd = lines.findIndex(
  (l, i) => i > pulseStart && l.trim() === ')}' && lines[i - 1]?.includes('</motion.div>'),
)
if (pulseEnd < 0) throw new Error('pulseEnd not found')

const muroStart = findLine((l) => l.includes('MURO / WALL'))
const verifyStart = findLine((l) => l.includes('Verification status - visual upgrade'))
const muroEnd = verifyStart - 1

const logoutStart = findLine((l) => l.includes('Subtle logout at the very bottom'))
const accountEnd = logoutStart - 1

function dedent(block) {
  return block.map((line) => (line.startsWith('      ') ? line.slice(6) : line))
}

function sectionFile(name, bodyLines, destructureBlock) {
  const body = dedent(bodyLines).join('\n')
  return `// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Star } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import { APP_VERSION } from '../../constants'
import type { ProfileTabProps } from './ProfileTab'

export function ${name}(props: ProfileTabProps) {
${destructureBlock}
  return (
    <>
${body}
    </>
  )
}
`
}

const pulseBody = lines.slice(pulseStart, pulseEnd + 1)
const muroBody = lines.slice(muroStart, muroEnd + 1)
const accountBody = [
  ...lines.slice(debugStart, debugEnd + 1),
  ...lines.slice(verifyStart, accountEnd + 1),
]

const destructureBlock = lines.slice(16, 123).join('\n')

const outDir = path.join(process.cwd(), 'src/components/profile')
fs.writeFileSync(path.join(outDir, 'ProfileDailyPulseSection.tsx'), sectionFile('ProfileDailyPulseSection', pulseBody, destructureBlock))
fs.writeFileSync(path.join(outDir, 'ProfileMuroSection.tsx'), sectionFile('ProfileMuroSection', muroBody, destructureBlock))
fs.writeFileSync(path.join(outDir, 'ProfileAccountSection.tsx'), sectionFile('ProfileAccountSection', accountBody, destructureBlock))

// Remove ranges bottom-up; insert component tags at section starts
const replacements = [
  { start: verifyStart, end: accountEnd, insert: null },
  { start: muroStart, end: muroEnd, insert: '<ProfileMuroSection {...props} />' },
  { start: pulseStart, end: pulseEnd, insert: '<ProfileDailyPulseSection {...props} />' },
  { start: debugStart, end: debugEnd, insert: '<ProfileAccountSection {...props} />' },
].sort((a, b) => b.start - a.start)

let updated = [...lines]
for (const { start, end, insert } of replacements) {
  const chunk = insert ? [`      ${insert}`] : []
  updated = [...updated.slice(0, start), ...chunk, ...updated.slice(end + 1)]
}

const importBlock = [
  "import { ProfileDailyPulseSection } from './ProfileDailyPulseSection'",
  "import { ProfileMuroSection } from './ProfileMuroSection'",
  "import { ProfileAccountSection } from './ProfileAccountSection'",
]
const importIdx = updated.findIndex((l) => l.includes("from './TuRedPowerCard'"))
updated.splice(importIdx + 1, 0, ...importBlock)

fs.writeFileSync(profileTabPath, updated.join('\n'))

const indexPath = path.join(outDir, 'index.ts')
let index = fs.readFileSync(indexPath, 'utf8')
for (const [name, file] of [
  ['ProfileDailyPulseSection', 'ProfileDailyPulseSection'],
  ['ProfileMuroSection', 'ProfileMuroSection'],
  ['ProfileAccountSection', 'ProfileAccountSection'],
]) {
  if (!index.includes(name)) {
    index += `export { ${name} } from './${file}'\n`
  }
}
fs.writeFileSync(indexPath, index)

console.log('OK', { pulse: pulseBody.length, muro: muroBody.length, account: accountBody.length, profileTabLines: updated.length })
