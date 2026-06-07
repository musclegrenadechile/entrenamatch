import fs from 'fs'
import path from 'path'

const profileTabPath = path.join(process.cwd(), 'src/components/profile/ProfileTab.tsx')
const lines = fs.readFileSync(profileTabPath, 'utf8').split(/\r?\n/)

function findLine(pred, from = 0) {
  const idx = lines.findIndex((l, i) => i >= from && pred(l))
  if (idx < 0) throw new Error('marker not found')
  return idx
}

const bannerStart = findLine((l) => l.includes('Daily Pulse Banner'))
const navEnd = findLine((l) => l.includes('<ProfileHeroSection'))

const actividadStart = findLine((l) => l.includes("profileSection !== 'actividad'"))
const actividadEnd = findLine((l) => l.includes('Stats row - premium visual'))

const rendimientoStart = actividadEnd
const rendimientoEnd = findLine((l) => l.includes('<ProfileMuroSection')) - 1

const footerStart = findLine((l) => l.includes('Subtle logout at the very bottom'))
const footerEnd = findLine((l) => l.includes('Cerrar sesión / Cambiar de cuenta')) 

function dedent(block) {
  return block.map((line) => (line.startsWith('      ') ? line.slice(6) : line))
}

function headerFile(bodyLines) {
  const body = dedent(bodyLines).join('\n')
  return `import { motion } from 'framer-motion'
import { Edit2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { CurrentUser } from '../../types'
import { ProfileSectionNav } from './ProfileSectionNav'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileHeaderSection(props: ProfileTabProps) {
  const {
    showDailyPulseBanner,
    dailyPulse,
    triggerHaptic,
    setShowDailyPulseBanner,
    isDemoMode,
    isSyncingProfile,
    setIsSyncingProfile,
    loadRealProfiles,
    loadRealSessions,
    loadMyFeedbacks,
    firebaseUser,
    getUserProfile,
    saveUser,
    currentUser,
    setLastSync,
    lastSync,
    handleLogout,
    openProfileEditor,
    profileSection,
    setProfileSection,
  } = profileTabBindings(props)

  return (
    <>
${body}
    </>
  )
}
`
}

function actividadFile(bodyLines) {
  const body = dedent(bodyLines).join('\n')
  return `import { toast } from 'sonner'
import { TuRedPowerCard } from './TuRedPowerCard'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileActividadSection(props: ProfileTabProps) {
  const {
    profileSection,
    networkStats,
    syncBonds,
    currentUser,
    dailyPulse,
    getUnlockedGadgets,
    getTodayStr,
    setDailyPulse,
    saveUserWithRealSync,
  } = profileTabBindings(props)

  return (
    <>
${body}
    </>
  )
}
`
}

function rendimientoFile(bodyLines) {
  const body = dedent(bodyLines).join('\n')
  return `import { Clock, Dumbbell, Heart, Star, Users, Zap } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import type { CurrentUser } from '../../types'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileRendimientoSection(props: ProfileTabProps) {
  const {
    profileSection,
    matches,
    squads,
    currentUser,
    dailyPulse,
    liveCountForUI,
    liveTrainingNow,
    setActiveTab,
    setShowLiveModal,
    saveUserWithRealSync,
    testIntegrityNonce,
    setTestIntegrityNonce,
    checkPlayIntegrity,
    integrityChecking,
    lastIntegrity,
    toggleLiveTraining,
    isTogglingLive,
    syncPartnerId,
    showSyncArena,
    setShowSyncArena,
    syncVibe,
    syncStartedAt,
    realProfiles,
    profilePosts,
    effectiveUserId,
    SEED_PROFILES,
    setShowFullProfile,
  } = profileTabBindings(props)

  return (
    <>
${body}
    </>
  )
}
`

}

function footerFile(bodyLines) {
  const body = dedent(bodyLines).join('\n')
  return `import { APP_VERSION } from '../../constants'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileFooterSection(props: ProfileTabProps) {
  const { handleLogout } = profileTabBindings(props)

  return (
    <>
${body}
    </>
  )
}
`

}

const outDir = path.join(process.cwd(), 'src/components/profile')
fs.writeFileSync(path.join(outDir, 'ProfileHeaderSection.tsx'), headerFile(lines.slice(bannerStart, navEnd)))
fs.writeFileSync(path.join(outDir, 'ProfileActividadSection.tsx'), actividadFile(lines.slice(actividadStart, actividadEnd)))
fs.writeFileSync(path.join(outDir, 'ProfileRendimientoSection.tsx'), rendimientoFile(lines.slice(rendimientoStart, rendimientoEnd + 1)))
fs.writeFileSync(path.join(outDir, 'ProfileFooterSection.tsx'), footerFile(lines.slice(footerStart, footerEnd + 1)))

const replacements = [
  { start: footerStart, end: footerEnd, insert: '<ProfileFooterSection {...props} />' },
  { start: rendimientoStart, end: rendimientoEnd, insert: '<ProfileRendimientoSection {...props} />' },
  { start: actividadStart, end: actividadEnd - 1, insert: '<ProfileActividadSection {...props} />' },
  { start: bannerStart, end: navEnd - 1, insert: '<ProfileHeaderSection {...props} />' },
].sort((a, b) => b.start - a.start)

let updated = [...lines]
for (const { start, end, insert } of replacements) {
  updated = [...updated.slice(0, start), `      ${insert}`, ...updated.slice(end + 1)]
}

const newProfileTab = [
  "import { ProfileHeaderSection } from './ProfileHeaderSection'",
  "import { ProfileHeroSection } from './ProfileHeroSection'",
  "import { ProfileActividadSection } from './ProfileActividadSection'",
  "import { ProfileRendimientoSection } from './ProfileRendimientoSection'",
  "import { ProfileDailyPulseSection } from './ProfileDailyPulseSection'",
  "import { ProfileSyncNetworkSection } from './ProfileSyncNetworkSection'",
  "import { ProfileMuroSection } from './ProfileMuroSection'",
  "import { ProfileAccountSection } from './ProfileAccountSection'",
  "import { ProfileFooterSection } from './ProfileFooterSection'",
  "import type { ProfileTabProps } from './profileTabTypes'",
  '',
  "export type { ProfileTabProps } from './profileTabTypes'",
  '',
  'export function ProfileTab(props: ProfileTabProps) {',
  '  return (',
  '    <div className="flex-1 overflow-auto bg-[#0D0D10] pb-28">',
  '      <ProfileHeaderSection {...props} />',
  '      <ProfileHeroSection {...props} />',
  '      <ProfileActividadSection {...props} />',
  '      <ProfileRendimientoSection {...props} />',
  '      <ProfileDailyPulseSection {...props} />',
  '      <ProfileSyncNetworkSection {...props} />',
  '      <ProfileMuroSection {...props} />',
  '      <ProfileAccountSection {...props} />',
  '      <ProfileFooterSection {...props} />',
  '    </div>',
  '  )',
  '}',
  '',
].join('\n')

fs.writeFileSync(profileTabPath, newProfileTab)

const indexPath = path.join(outDir, 'index.ts')
let index = fs.readFileSync(indexPath, 'utf8')
for (const name of [
  'ProfileHeaderSection',
  'ProfileActividadSection',
  'ProfileRendimientoSection',
  'ProfileFooterSection',
]) {
  if (!index.includes(name)) {
    index += `export { ${name} } from './${name}'\n`
  }
}
fs.writeFileSync(indexPath, index)

console.log('OK', { profileTabLines: newProfileTab.split('\\n').length })
