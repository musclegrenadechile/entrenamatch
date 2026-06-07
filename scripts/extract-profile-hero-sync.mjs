import fs from 'fs'
import path from 'path'

const profileTabPath = path.join(process.cwd(), 'src/components/profile/ProfileTab.tsx')
const lines = fs.readFileSync(profileTabPath, 'utf8').split(/\r?\n/)

function findLine(pred, from = 0) {
  const idx = lines.findIndex((l, i) => i >= from && pred(l))
  if (idx < 0) throw new Error('marker not found')
  return idx
}

const heroStart = findLine((l) => l.includes('HERO - FULL REMASTERED'))
const heroEnd = findLine((l) => l.includes('Bio - with quick inline edit')) - 1

const syncLifeStart = findLine((l) => l.includes('"Mi vida de entrenamiento" summary card'))
const syncNetEnd = findLine((l) => l.includes('Live streak badge - killer retention'))

function dedent(block) {
  return block.map((line) => (line.startsWith('      ') ? line.slice(6) : line))
}

function sectionFile(name, bodyLines, extraImports = '') {
  const body = dedent(bodyLines).join('\n')
  return `import {
  Camera, Edit2, Plus, Send,
} from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
${extraImports}import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ${name}(props: ProfileTabProps) {
  const p = profileTabBindings(props)
  const {
    currentUser,
    networkStats,
    syncBonds,
    openProfileEditor,
    saveUserWithRealSync,
    setMapForceTick,
    setActiveTab,
    setShowLiveModal,
    triggerHaptic,
    reorderGallery,
    deleteExtraPhoto,
    uploadProfilePhotoIfNeeded,
    CapacitorCamera,
    muroComposerRef,
    profilePosts,
    effectiveUserId,
    setFeedPhotoModal,
    isEditingBio,
    setIsEditingBio,
    setLastSync,
    profileSection,
    liveTrainingNow,
    realProfiles,
    SEED_PROFILES,
    startSyncWith,
    tryAutoStartSync,
    setShowFullProfile,
    networkStats: ns,
  } = p

  return (
    <>
${body}
    </>
  )
}
`
}

const heroBody = lines.slice(heroStart, heroEnd + 1)
const syncBody = [
  ...lines.slice(syncLifeStart, findLine((l) => l.includes('Actividad reciente en tu muro')) - 1),
  ...lines.slice(findLine((l) => l.includes('Actividad reciente en tu muro')), findLine((l) => l.includes('YOUR TRAINING NETWORK')) - 1),
  ...lines.slice(findLine((l) => l.includes('YOUR TRAINING NETWORK')), syncNetEnd),
]

const outDir = path.join(process.cwd(), 'src/components/profile')
fs.writeFileSync(path.join(outDir, 'ProfileHeroSection.tsx'), sectionFile('ProfileHeroSection', heroBody))
fs.writeFileSync(
  path.join(outDir, 'ProfileSyncNetworkSection.tsx'),
  sectionFile('ProfileSyncNetworkSection', syncBody, "import type { CurrentUser } from '../../types'\n"),
)

const replacements = [
  { start: syncLifeStart, end: syncNetEnd - 1, insert: '<ProfileSyncNetworkSection {...props} />' },
  { start: heroStart, end: heroEnd, insert: '<ProfileHeroSection {...props} />' },
].sort((a, b) => b.start - a.start)

let updated = [...lines]
for (const { start, end, insert } of replacements) {
  updated = [...updated.slice(0, start), `      ${insert}`, ...updated.slice(end + 1)]
}

// Fix broken ProfileDailyPulseSection comment
const brokenIdx = updated.findIndex((l) => l.includes('{/* ====================================================='))
if (brokenIdx >= 0) {
  const actIdx = updated.findIndex((l, i) => i > brokenIdx && l.includes('Actividad reciente en tu muro'))
  updated = [
    ...updated.slice(0, brokenIdx),
    '      <ProfileDailyPulseSection {...props} />',
    '',
    ...updated.slice(actIdx - 1),
  ]
}

const importIdx = updated.findIndex((l) => l.includes("from './ProfileAccountSection'"))
updated.splice(
  importIdx,
  0,
  "import { ProfileHeroSection } from './ProfileHeroSection'",
  "import { ProfileSyncNetworkSection } from './ProfileSyncNetworkSection'",
)

// Move ProfileAccountSection before footer logout
const accountUseIdx = updated.findIndex((l) => l.includes('<ProfileAccountSection {...props} />'))
const muroIdx = updated.findIndex((l) => l.includes('<ProfileMuroSection {...props} />'))
if (accountUseIdx >= 0 && muroIdx >= 0 && accountUseIdx < muroIdx) {
  updated.splice(accountUseIdx, 1)
  const newMuroIdx = updated.findIndex((l) => l.includes('<ProfileMuroSection {...props} />'))
  updated.splice(newMuroIdx + 1, 0, '      <ProfileAccountSection {...props} />')
}

fs.writeFileSync(profileTabPath, updated.join('\n'))

const indexPath = path.join(outDir, 'index.ts')
let index = fs.readFileSync(indexPath, 'utf8')
for (const name of ['ProfileHeroSection', 'ProfileSyncNetworkSection']) {
  if (!index.includes(name)) {
    index += `export { ${name} } from './${name}'\n`
  }
}
fs.writeFileSync(indexPath, index)

console.log('OK', { hero: heroBody.length, sync: syncBody.length, profileTabLines: updated.length })
