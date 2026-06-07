/**
 * P1: extract Explore live panel + Home tab from App.tsx
 */
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const appPath = path.join(root, 'src/App.tsx')
const lines = fs.readFileSync(appPath, 'utf8').split(/\r?\n/)

function sliceBody(startLine, endLine, indent = 10) {
  const pad = ' '.repeat(indent)
  return lines
    .slice(startLine - 1, endLine)
    .map((line) => (line.startsWith(pad) ? line.slice(indent) : line))
    .join('\n')
}

// Explore: lines 8781-9475 (inner div content)
const exploreBody = sliceBody(8781, 9475)

const exploreOut = `// @ts-nocheck — P1 extract from App.tsx; tighten types incrementally
import { motion } from 'framer-motion'
import { GymPulseMap } from '../map/GymPulseMap'

/** Props mirror App scope used by explore live banner + map block */
export type ExploreLivePanelProps = Record<string, unknown>

export function ExploreLivePanel(props: ExploreLivePanelProps) {
  const {
    liveCountForUI,
    liveTrainingNow,
    syncBonds,
    dailyPulse,
    activeSyncCount,
    currentUser,
    userLocation,
    joiningSyncWith,
    setShowFullProfile,
    handleSwipe,
    setShowLiveMap,
    setActiveTab,
    setShowLiveModal,
    triggerHaptic,
    showLiveMap,
    networkStats,
    gymPulseMapRef,
    mapLiveTrainingNow,
    effectiveUserId,
    ritualRipples,
    partnerLocations,
    echoPins,
    mapNearOnly,
    selectedMapZone,
    showOnlyLegends,
    showPartners,
    mapMyGymOnly,
    mapMyGymId,
    mapForceTick,
    isDeveloper,
    isPlacingPartner,
    isQuickAddPartner,
    setMapNearOnly,
    setSelectedMapZone,
    setShowOnlyLegends,
    setShowPartners,
    setMapForceTick,
    openAddPartner,
    openManagePartners,
    setIsQuickAddPartner,
    logoutDeveloper,
    addPartnerAtCurrentCenter,
    reloadPartners,
    spawnDevTestLives,
    clearDevTestLives,
    startSyncWith,
    witnessEchoPin,
    witnessRipple,
    isQuickAddPartnerRef,
    isDemoMode,
    db,
    setPartnerLocations,
    startEditPartner,
    setPartnerFormLat,
    setPartnerFormLng,
    setIsPlacingPartner,
    setEditingPartner,
    setPartnerForm,
    setShowPartnerForm,
    devTestLives,
    toast,
    partnerForm,
    editingPartner,
    showPartnerForm,
    isSavingPartner,
    savePartner,
    deletePartner,
    partnerFormLat,
    partnerFormLng,
  } = props

  return (
${exploreBody.split('\n').map((l) => (l ? `    ${l}` : '')).join('\n')}
  )
}
`

fs.mkdirSync(path.join(root, 'src/components/explore'), { recursive: true })
fs.writeFileSync(path.join(root, 'src/components/explore/ExploreLivePanel.tsx'), exploreOut)

// Home: lines 9675-10145 (inner div)
const homeBody = sliceBody(9675, 10145)

const homeOut = `// @ts-nocheck — P1 extract from App.tsx; tighten types incrementally
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { DailyRitualHome } from './DailyRitualHome'
import { isGymCheckInFresh } from '../../utils/gymCheckIn'

export type HomeTabProps = Record<string, unknown>

export function HomeTab(props: HomeTabProps) {
  const {
    currentUser,
    homeWeekDays,
    homeWeekTrainedCount,
    homeTeamMembers,
    liveCountForUI,
    activeSyncCount,
    isTogglingLive,
    toggleLiveTraining,
    setActiveTab,
    setShowLiveMap,
    startSyncWith,
    setActiveChat,
    setShowEntrenaLogModal,
    fuelProfile,
    fuelTodayTotals,
    fuelPostWorkoutTip,
    setShowFuelSetupModal,
    setShowFuelLogModal,
    homeCityChallengeMerged,
    homeLocalLeaderboard,
    homeMyLeaderboardRank,
    homeCityLiveCount,
    homeNearestGym,
    homeGymLiveCount,
    handleToggleLeaderboard,
    handleGymCheckIn,
    mapMyGymId,
    handleOpenGymMap,
    setShowFeedPostModal,
    feedSearch,
    setFeedSearch,
    feedOnlyReal,
    setFeedOnlyReal,
    feedOnlyLive,
    setFeedOnlyLive,
    feedShowPinnedOnly,
    setFeedShowPinnedOnly,
    feedMaxProfiles,
    setFeedMaxProfiles,
    feedDisplayLimit,
    setFeedDisplayLimit,
    loadGlobalFeed,
    isDemoMode,
    loadRealProfiles,
    isLoadingFeed,
    activeSyncPairs,
    liveTrainingNow,
    syncBonds,
    triggerHaptic,
    showFeedPublishSuccess,
    feedComputation,
    hasMoreGlobalFeed,
    effectiveUserId,
    setShowFullProfile,
    handleFeedReaction,
    handleFeedComment,
    toggleFeedPin,
    deleteFeedPost,
    reportFeedPost,
    shareFeedPost,
    formatFeedTime,
    getProfileById,
    toast,
  } = props

  return (
${homeBody.split('\n').map((l) => (l ? `    ${l}` : '')).join('\n')}
  )
}
`

fs.writeFileSync(path.join(root, 'src/components/home/HomeTab.tsx'), homeOut)

console.log('Wrote ExploreLivePanel.tsx and HomeTab.tsx')
