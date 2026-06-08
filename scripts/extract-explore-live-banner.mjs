/**
 * Extract Explore live banner JSX from App.tsx into ExploreLiveBanner.tsx
 */
import fs from 'fs'
import path from 'path'

const appPath = path.join(process.cwd(), 'src/App.tsx')
const lines = fs.readFileSync(appPath, 'utf8').split(/\r?\n/)

const start = lines.findIndex((l) => l.includes('LIVE TRAINING BANNER - ALWAYS VISIBLE'))
if (start < 0) throw new Error('banner marker not found')
const divStart = start + 1
const mapComment = lines.findIndex((l, i) => i > divStart && l.includes('Map area - primer paso'))
if (mapComment < 0) throw new Error('map marker not found')

const body = lines.slice(divStart, mapComment).map((line) => {
  if (line.startsWith('          ')) return line.slice(10)
  return line
})

const outPath = path.join(process.cwd(), 'src/components/explore/ExploreLiveBanner.tsx')
const header = `import { motion } from 'framer-motion'
import type { CurrentUser, Profile, Tab } from '../../types'
import type { DailyPulseState, SyncBond } from '../../types/profilePulse'

export interface ExploreLiveBannerProps {
  liveCountForUI: number
  liveTrainingNow: Profile[]
  syncBonds: Record<string, SyncBond>
  dailyPulse: DailyPulseState | null
  activeSyncCount: number
  currentUser: CurrentUser | null
  userLocation: { lat: number; lng: number } | null
  joiningSyncWith: string | null
  onShowProfile: (profile: Profile) => void
  onSwipeRight: (profileId: string) => void
  onOpenLiveMap: () => void
  onOpenProfileTab: () => void
  onOpenLiveModal: () => void
}

export function ExploreLiveBanner({
  liveCountForUI,
  liveTrainingNow,
  syncBonds,
  dailyPulse,
  activeSyncCount,
  currentUser,
  userLocation,
  joiningSyncWith,
  onShowProfile,
  onSwipeRight,
  onOpenLiveMap,
  onOpenProfileTab,
  onOpenLiveModal,
}: ExploreLiveBannerProps) {
  return (
`

const footer = `  )
}
`

let bodyStr = body.join('\n')
bodyStr = bodyStr.replace(/setShowFullProfile\(user\)/g, 'onShowProfile(user)')
bodyStr = bodyStr.replace(/handleSwipe\(user\.id,'right'\)/g, "onSwipeRight(user.id)")
bodyStr = bodyStr.replace(/setShowLiveMap\(true\)/g, 'onOpenLiveMap()')
bodyStr = bodyStr.replace(/setActiveTab\('profile'\)/g, 'onOpenProfileTab()')
bodyStr = bodyStr.replace(/setShowLiveModal\(true\)/g, 'onOpenLiveModal()')

fs.writeFileSync(outPath, header + bodyStr + footer)
console.log('Wrote', outPath, `(${body.length} lines)`)
