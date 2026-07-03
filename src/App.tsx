// âœ… Build limpio despuÃ©s de revert V2 - 06/06/2026
// @ts-nocheck
import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense, Component, startTransition, type ReactNode, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, MessageCircle, User, MapPin, Dumbbell, 
  Edit2, RefreshCw, Send, Star, Plus, Users, Bell, Download,
  Clock, Camera, Activity, Zap, Mic, Square, Play, Pause, X, RotateCcw, Sparkles
} from 'lucide-react'
import { 
  signUpWithEmail, 
  signInWithEmail, 
  updateUserProfile,
  getUserProfile,
  logout,
  sendPasswordReset,
  signInWithGoogle,
  completeGoogleSignInProfile,
} from './services/auth'
import { GoogleAuthError } from './services/googleAuth'
import { storage, db, isFirebaseConfigured } from './services/firebase'
import { useAuth } from './contexts/AuthContext'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { demoStorage, DEMO_KEYS } from './services/demoStorage'

// ==================== REFACTORED IMPORTS ====================
import type { 
  Profile, Message, TrainingSession, TrainingReview, 
  SessionMessage, Squad, Report, Notification, CurrentUser, Tab,
  ProfilePost,
  ProfilePostType,
} from './types'
import type { FuelProfile, FuelLogEntry, FuelDayTotals } from './types'
import { 
  TRAINING_OPTIONS, AVAILABILITY, AUTO_MATCH_IDS, APP_VERSION
} from './constants'
import { BRAND_COPY } from './constants/brandCopy'

// Capacitor plugins are loaded via a separate module that is only analyzed in CAPACITOR builds.
// This prevents Vite/Rolldown from ever trying to resolve @capacitor/* packages during pure web builds
// (Firebase --base=/ , GH Pages, dev server) â†’ eliminates the "failed to resolve import" errors.
let CapacitorCamera: any = null
let PushNotifications: any = null
let PlayIntegrityNative: any = null
let GeolocationNative: any = null

import { loadCapacitorPlugins } from '@capacitor-plugins-loader'

void loadCapacitorPlugins().then(() => {
  const plugins = (typeof window !== 'undefined' && (window as any).__CAPACITOR_PLUGINS__) || {}
  CapacitorCamera = plugins.Camera || null
  PushNotifications = plugins.PushNotifications || null
  PlayIntegrityNative = plugins.PlayIntegrity || null
  GeolocationNative = plugins.Geolocation || null
})

// Fallback runtime guard (in case the async load hasn't completed yet when code runs).
// In web builds the vars stay null forever, which is correct.
if (typeof window !== 'undefined' && (window as any).Capacitor) {
  // The values will be set by the import above shortly after module eval.
}

import { 
  getDistanceKm, 
  calculateCompatibility, 
  getTrainingStreak, 
  getAverageRating 
} from './utils'
import { resolveNotificationTarget, type NotificationNavTarget } from './utils/notificationNavigation'
import { resolvePushNotificationData } from './utils/pushNavigation'
import { normalizeTabNavigation, resolveRedSubTab, isRedTabActive, type RedSubTab } from './utils/tabNavigation'
import { parseTabFromUrl, syncTabToUrl } from './utils/tabUrlSync'
import { installE2EHarness, isE2EHarnessActive } from './utils/e2eHarness'
import { buildE2EDemoFuelProfile } from './utils/demoFuelProfile'
import { buildE2EDemoFuelWeekMacros } from './utils/demoFuelWeekLogs'
import { buildDemoWorkoutFromSave, buildE2EDemoWorkoutHistory } from './utils/demoWorkoutHistory'
import {
  countWorkoutHistoryPrBadges,
  readWorkoutHistoryRowSummaries,
  readWorkoutHistorySectionKicker,
  readWorkoutHistorySparklineAriaLabels,
} from './utils/e2eWorkoutHistoryDom'
import {
  readGymLogFabSessionChipAriaLabel,
  readGymLogFabSessionChipText,
  readGymLogFabSessionChipToneClass,
} from './utils/e2eGymLogFabSessionDom'
import {
  readGymLogSessionChipAriaLabel,
  readGymLogSessionChipText,
  readGymLogSessionChipToneClass,
} from './utils/e2eGymLogSessionDom'
import { fabSessionPrAriaMatchesLivePr } from './utils/gymLogFabSessionPrToneDisplay'
import { sessionPrAriaMatchesLivePr } from './utils/gymLogSessionPrToneDisplay'
import {
  isWeeklyPlanCardVisible,
  readWeeklyPlanCardAriaLabel,
  readWeeklyPlanDetail,
  readWeeklyPlanFuelWeekAriaLabel,
  readWeeklyPlanFuelWeekChip,
  readWeeklyPlanFuelWeekChipAriaLabel,
  readWeeklyPlanFuelHeadlineChip,
  readWeeklyPlanFuelHeadlineChipAriaLabel,
  readWeeklyPlanFuelHeadlineChipToneClass,
  readWeeklyPlanFuelWeekHint,
  readWeeklyPlanFuelWeekToneClass,
  readWeeklyPlanNutritionNote,
  readWeeklyPlanNutritionAriaLabel,
  readWeeklyPlanHistoryHint,
  readWeeklyPlanHistoryAriaLabel,
  readWeeklyPlanHistoryToneClass,
  readWeeklyPlanRotationChip,
  readWeeklyPlanRotationAriaLabel,
  readWeeklyPlanRotationToneClass,
  readWeeklyPlanEnergySummaryText,
  readWeeklyPlanEnergySummaryAriaLabel,
  readWeeklyPlanEnergySummaryToneClass,
  readWeeklyPlanFuelRowToneClass,
  readWeeklyPlanFuelToneStackSnapshot,
  readWeeklyPlanScenarioClass,
  readWeeklyPlanNutritionToneClass,
  readWeeklyPlanFuelRowAriaLabel,
} from './utils/e2eWeeklyPlanHistoryDom'
import {
  fuelToneStackMatchesExpected,
  isWeeklyPlanFuelToneStackConsistent,
} from './utils/weeklyPlanFuelToneStackDisplay'
import { fuelToneStackMatchesDemoExpected } from './utils/weeklyPlanFuelToneStackExpectedDisplay'
import { isWeeklyPlanFuelToneAriaStackAligned } from './utils/weeklyPlanFuelToneStackAriaDisplay'
import { fuelCardAriaMatchesTone } from './utils/weeklyPlanFuelToneStackCardDisplay'
import { isWeeklyPlanFuelToneStackDemoFullySynced } from './utils/weeklyPlanFuelToneStackFullDisplay'
import { historyFuelAriaMatchesTone } from './utils/weeklyPlanFuelHistoryToneDisplay'
import { rotationFuelAriaMatchesTone } from './utils/weeklyPlanFuelRotationToneDisplay'
import { energySummaryFuelAriaMatchesTone } from './utils/weeklyPlanFuelEnergySummaryToneDisplay'
import type { FuelWeekHintTone } from './utils/weeklyPlanFuelWeekToneDisplay'
import {
  parseGymIdFromSearch,
  resolvePartnerGymById,
  clearGymDeepLinkParam,
} from './utils/deepLinkGym'
import { parseAppDeepLink, clearAppDeepLinkParams } from './utils/appDeepLinks'
import { buildSyncPostText, syncStoryToDataUrl } from './utils/syncStoryShare'
import { recordSyncShareMetric } from './services/syncShareMetrics'
import { BottomNav } from './components/app/BottomNav'
import { EmV2TabShell } from './components/app/EmV2TabShell'
import { AppFeatureTour, hasSeenAppFeatureTour, markAppFeatureTourSeen } from './components/onboarding/AppFeatureTour'
import { FeatureTourMount } from './components/onboarding/FeatureTourMount'
import { ExploreFiltersSheetMount } from './components/explore/ExploreFiltersSheetMount'
import { MatchCelebrationMount } from './components/matches/MatchCelebrationMount'
import { LiveNearModalMount } from './components/explore/LiveNearModalMount'
import { SafetyActionSheetMount } from './components/safety/SafetyActionSheetMount'
import { LegalPagesMount } from './components/legal/LegalPagesMount'
import { ReportModalMount } from './components/safety/ReportModalMount'
import { VerificationFlowMount } from './components/safety/VerificationFlowMount'
import { ModerationPanelMount } from './components/safety/ModerationPanelMount'
import { TrainingReviewModalMount } from './components/sessions/TrainingReviewModalMount'

import { useExploreDeck } from './hooks/useExploreDeck'
import { useAndroidBackHandler } from './hooks/useAndroidBackHandler'
import { suggestedSquadName } from './utils/sparseCityDefaults'
import { formatLiveDistanceKm } from './utils/formatLiveDistance'
import {
  ensurePersistableProfilePhotos,
  filterPersistablePhotos,
  isDataUrlPhoto,
  latestPhotosUpdatedAt,
  profilePhotosChanged,
  resolveProfilePhotos,
  resolvePhotosForFirestoreSave,
} from './utils/profilePhotos'
import { partnersForMap } from './utils/partnerLocations'
import {
  getTodayStr,
  getUnlockedGadgets,
  getNextGadget,
} from './utils/dailyPulseCore'
import { WeeklyPactSetupSheet } from './components/home/WeeklyPactSetupSheet'
import { SyncLiveBlockerModal } from './components/sync/SyncLiveBlockerModal'
import {
  ASSUMED_LIVE_SESSION_MS,
  normalizeTrainingSince as normalizeTrainingSinceMs,
  mergeLiveUsersById,
  enrichLiveUser as buildEnrichedLiveUser,
  isActiveLiveUser,
  isUserLiveInSnapshot,
  profileDocToLiveUser,
} from './utils/gymPulseLive'
import { LIVE_PENDING_GUARD_MS, stripStaleLiveReactivation } from './utils/liveToggleGuard'
import { useDemoAuth } from './hooks/useDemoAuth'
import { useProfile } from './contexts/ProfileContext'
import { useFilters } from './hooks/useFilters'
import { useRealSessions } from './hooks/useRealSessions'
import { useSwipeDeck } from './hooks/useSwipeDeck'
import { MapExplorePanelMount } from './components/map/MapExplorePanelMount'
import { RedTab, RedMessagesPanel } from './components/red'
import type { ProfileSection } from './components/profile'
import { LiveToggleFab } from './components/home'
import { MarketplaceViewMount } from './components/marketplace/MarketplaceViewMount'
import { AdminOpsPanelMount, CommunityAdminPanelMount } from './components/admin'
import {
  attachAppAdminListener,
  persistUserBlock,
  type AppAdminRecord,
} from './services/appAdmin'
import {
  attachMarketplaceAdminListener,
  attachMarketplaceProductsListener,
  DEMO_MARKETPLACE_PRODUCTS,
} from './services/marketplace'
import {
  attachAllMarketplaceOrdersListener,
  attachMyMarketplaceOrdersListener,
} from './services/adminOps'
import {
  attachAllTrainerBookingsListener,
} from './services/adminAnalytics'
import { fetchMpHealth, type MpHealthResult } from './services/adminMp'
import { ActivationGuideMount } from './components/onboarding/ActivationGuideMount'
import { PullToRefresh } from './components/ui/PullToRefresh'
import {
  shouldShowActivationGuide,
  loadFirstStepsProgress,
  saveFirstStepsProgress,
  type FirstStepsProgress,
} from './services/firstStepsProgress'
import type { MarketplaceProduct, TrainerBooking, TrainerDispatchRequest, TrainerProfile, MarketplaceOrder } from './types'
import { TrainerCoachViewMount } from './components/trainerCoach/TrainerCoachViewMount'
import {
  attachTrainerProfilesListener,
  attachMyTrainerProfileListener,
  attachTrainerBookingsListener,
  linkReviewToBooking,
} from './services/trainerCoach'
import {
  attachClientDispatchListener,
  attachTrainerDispatchOfferListener,
  attachClientDispatchHistoryListener,
  attachTrainerDispatchHistoryListener,
} from './services/trainerDispatch'
import { LazyHomeTab, LazyExploreTab, LazyProfileTab, LazyMatchesTab, LazySquadsTab, LazySessionsTab, TAB_LOADING } from './components/app/LazyTabs'
import { TabErrorBoundary } from './components/app/TabErrorBoundary'
import { CityChallengeCelebrationModal } from './components/explore/CityChallengeCelebrationModal'
import { parseReferralFromUrl } from './components/growth/ReferralInviteCard'
import { createEmptySyncArenaSnapshot } from './sync/syncArenaState'
import {
  attachGlobalFeedListener,
  fetchGlobalProfilePosts,
  fetchProfilePostById,
  togglePostLikeInFirestore,
  persistPostReactionsInFirestore,
} from './services/profilePosts'
import { fetchReviewsForProfile, submitReviewToFirestore } from './services/trainingReviews'
import { isQuickDemoSession, clearQuickDemoSession } from './utils/quickDemo'
import { enrichReturningProfile, hasCoreProfileFields, isProfileComplete } from './utils/profileComplete'
import {
  fetchProfilesByIds,
  mergeDiscoveryWithPinnedPartners,
  mergeProfileLists,
} from './services/profileDiscovery'
import { isIncompleteMatchProfile } from './utils/matchProfileDisplay'
import { isDeletedProfile, isDeletedProfileData } from './utils/deletedProfile'
import { filterSeedsForCity } from './utils/citySeeds'
import {
  buildWeekDayStatuses,
  loadWeekLiveDays,
  recordWeekLiveDay,
  getWeekKey,
  MIN_LIVE_MINUTES_FOR_WEEK_DAY,
} from './utils/weekLiveTracker'
import {
  buildCityChallenge,
  buildCityLeaderboard,
  buildGymLeaderboard,
  aggregateCityTotals,
  enrichCityChallengeV2,
  findNearestGym,
  mergeWeekStats,
  normalizeCity,
  isGymCheckInFresh,
  countLiveAtGym,
  countLiveInCity,
  findLeaderboardRank,
} from './services/localNetwork'
import {
  attachPartnerTypingListener,
  markDirectMessageRead,
  setChatTyping,
} from './services/chatPresence'
import {
  attachCityWeeklyStatsListener,
  bumpCityWeeklyStats,
  cityStatsDocId,
  mergeCityChallengeWithFirestore,
} from './services/cityWeeklyStats'
import { registerPilotMember, touchPilotActivity } from './services/pilotCohort'
import {
  aggregateDerbyClientMinutes,
  attachCityDerbyListeners,
  buildCityDerby,
  derbyRegionalBumpTarget,
} from './services/cityDerby'
import { notifyDerbyLeaderChange } from './services/derbyLeaderNotify'
import {
  freezeWarDerbyState,
  loadFrozenWarDerby,
  persistDerbyWeekToFirestore,
  recordDerbyWeekSnapshot,
} from './services/derbyWeeklyHistory'
import {
  getWarEventKey,
  isZoneScoringActive,
} from './services/zoneEventPhase'
import { saveUserPushToken } from './services/userPushTokens'
import { isPubliclyVerified } from './utils/profileVerification'
import { buildInviteLink } from './utils/sparseCityDefaults'
import { shouldFireSyncHourNotif } from './services/syncHour'
import {
  isHomeDayOneMode,
  isProfileProgressiveMode,
  shouldHideCoachAndMarketplace,
} from './utils/profileProgressive'
import { isMarketplaceUiEnabled } from './utils/pilotFeatureFlags'
import {
  formatLastLiveLabel,
  getTeamMemberStatus,
  sortTeamMembers,
} from './utils/homeTeam'
import { isTeamMemberId } from './utils/teamMembers'
import { isSeedProfileId, SEED_PROFILES, CHAT_OPENERS } from './utils/seedProfiles'
import { EntrenoDeHoyModalMount } from './components/workout/EntrenoDeHoyModalMount'
import { WorkoutPostCard, WorkoutSessionFab } from './components/workout'
import { buildGymLogSessionChipCompact } from './utils/gymLogSessionDisplay'
import { buildWorkoutSaveBannerFuelHint } from './utils/workoutSaveBannerDisplay'
import { detectWorkoutPRs, formatWorkoutPRSummary } from './utils/workoutPR'
import { cloneExercises, workoutToTemplate } from './utils/workoutTemplates'
import {
  clearWorkoutDraft,
  isWorkoutDraftFresh,
  loadWorkoutDraft,
  quickAddSetToWorkoutDraft,
} from './utils/workoutDraft'
import { buildWeekWorkoutSummary, getTopExerciseProgress } from './utils/workoutProgress'
import { FuelOverlaysMount, NutritionPostCard } from './components/fuel'
import {
  loadFuelProfile,
  saveFuelProfile,
  fetchFuelLogsForDate,
  fetchFuelWeekSummary,
  fetchFuelWeekMacros,
  saveFuelLog,
  updateFuelLog,
  deleteFuelLog,
  computeFuelWeekFromDates,
  createNutritionPost,
  analyzeFoodWithAi,
  sumFuelLogs,
  emptyFuelDayTotals,
} from './services/fuel'
import { getPostWorkoutFuelTip, estimateMacrosFromDescription, toLocalDateStr, buildFuelAnalyzeContext } from './utils/fuelCalculator'
import {
  buildFuelLogPrefillFromWorkoutSave,
  extractFuelLogPrefillMacros,
  type FuelLogPrefill,
} from './utils/fuelLogPrefill'
import { fireWorkoutPRConfetti } from './utils/workoutPRConfetti'
import { fetchRecentWorkouts, fetchUserWorkouts, fetchWorkoutsForDate, saveWorkoutWithPost, fetchWorkoutById, saveSyncWorkoutWithPost, deleteWorkoutWithLinkedPost, buildWorkoutPreview, computeWorkoutStats, workoutToPreview, workoutShareText } from './services/workouts'
import { useFuelBalancePipeline } from './hooks/useFuelBalancePipeline'
import { useFuelState } from './hooks/useFuelState'
import { useWeeklyPlan } from './hooks/useWeeklyPlan'
import {
  buildPlanExercises,
  formatWeeklyPlanShareText,
  type WeeklyPlanResult,
} from './domain/weeklyPlan'
import {
  enrichWeeklyPlanWithAi,
  saveWeeklyPlanCache,
} from './services/weeklyPlan'
import { maybeSendWeeklyPlanNotification } from './utils/weeklyPlanNotify'
import { shareWeeklyPlanExternally } from './utils/weeklyPlanShare'
import { shareNativeMessage } from './utils/shareNative'
import { shareWorkoutStory, toastWorkoutShareOutcome } from './utils/workoutStoryShare'
import {
  SYNC_REPLAY_COPY,
  buildWitnessEchoPostText,
  formatSyncVibeLabel,
} from './utils/syncReplayCopy'
import {
  loadExercisePRs,
  syncExercisePRs,
  topExercisePRs,
  type ExercisePRRecord,
} from './services/exercisePRs'
import { useDailyPulse, type DailyPulseBridge } from './hooks/useDailyPulse'
import { useChatSession } from './hooks/useChatSession'
import { useChatVoicePlayer } from './hooks/useChatVoicePlayer'
import { useNotificationRouter } from './hooks/useNotificationRouter'
import { HomeFeedOverlays, FeedPhotoLightbox } from './components/home/HomeFeedOverlays'
import { useNotificationsState } from './hooks/useNotificationsState'
import { NotificationsPanel } from './components/notifications/NotificationsPanel'
import { getRelativeTime } from './utils/relativeTime'
import { useFeedState } from './hooks/useFeedState'
import { useFeedPipeline } from './hooks/useFeedPipeline'
import { pickLivePostText, userHasRecentAutoLivePost } from './utils/feedPostMeta'
import { useSyncSession } from './hooks/useSyncSession'
import { useArenaSyncController } from './hooks/useArenaSyncController'
import { usePartnerLocations } from './hooks/usePartnerLocations'
import { useLiveMapPipeline } from './hooks/useLiveMapPipeline'
import { useLiveSessionGuard } from './hooks/useLiveSessionGuard'
import { useLiveMotionMonitor } from './hooks/useLiveMotionMonitor'
import { useSpotifyLiveSync } from './hooks/useSpotifyLiveSync'
import {
  fetchSpotifyNowPlaying,
  getValidSpotifyAccessToken,
  isSpotifyConnected,
  toProfileNowPlaying,
} from './services/spotify'
import type { SpotifyNowPlaying } from './types'
import { saveDailyEnergyCache } from './services/dailyEnergy'
import { estimateSyncSessionBurn } from './domain/fuelBalance'
import {
  recordPartnerGymCheckIn,
  fetchPartnerGymStats,
  seedPartnerGymIfMissing,
  type PartnerGymStats,
} from './services/partnerGym'
import {
  spendConstancia,
  earnConstancia,
  ensureConstanciaBalance,
} from './services/constanciaEconomy'
import { useWearableFuelIntegration } from './hooks/useWearableFuelIntegration'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { ProfileEditFlow } from './components/profile/ProfileEditFlow'
import { SyncArenaHost, SyncDuelSummary } from './components/arena'
import {
  attachPostCommentsListener,
  createCommentId,
  fetchPostComments,
  mergeCommentLists,
  writeCommentToFirestore,
  deleteCommentFromFirestore,
  type PostComment,
} from './services/postComments'
import { attachUserPostsListener } from './services/profilePosts'
import {
  fetchDiscoveryProfiles,
  attachDiscoveryProfilesListener,
} from './services/profileDiscoveryQuery'
import { canonicalProfileLocation } from './constants/pilotProgram'
import { parseProfileFromFirestoreDoc, PROFILE_LIST_LIMIT } from './utils/profileFirestoreParse'
import { shouldHideBetaBot } from './utils/betaBots'
import { bumpRealtimeStat, realtimeStats } from './utils/realtimeStats'
import { PerfOverlay } from './components/dev/PerfOverlay'
import { useAppVisibility } from './hooks/useAppVisibility'
import { REALTIME_HUB_POLICY } from './hooks/useRealtimeHub'
import {
  shouldRunBackgroundProfilePoll,
  shouldRunCityEngagementListeners,
  shouldRunProfilesListener,
  shouldRunSquadsListener,
} from './utils/tabRealtimePolicy'
import { attachDirectChatListener, type DirectChatMsg } from './services/chatMessages'
import { processLikeAndMaybeMatch } from './services/matching'
import { writePass } from './services/swipeState'
import {
  buildDefaultPact,
  buildPactReminderMessage,
  buildPostLiveFeedText,
  computeWeeklyPactProgress,
  countLoggedSessionsInWeek,
  isPactForCurrentWeek,
} from './services/weeklyPact'
import { compareSyncWorkoutLogs, summarizePartnerWeekFromPosts, summarizePartnerWeekFromWorkouts } from './utils/workoutSyncCompare'
import { fetchGymRoutinesFromFirestore, mergeGymRoutineTemplates } from './services/gymRoutines'
import { estimateWorkoutBurn } from './domain/fuelBalance/estimateWorkoutBurn'
import { FullProfileSheetMount } from './components/profile/FullProfileSheetMount'
import { VerifiedProfilePhoto } from './components/profile/VerifiedProfilePhoto'
import { triggerHaptic } from './utils/haptics'
import {
  isQuotaError,
  reclaimLocalStorageSpace,
  pruneSeenIdMap,
  pruneStringIdList,
  loadPersistedSeenIdMap,
  loadPersistedStringIdSet,
  loadPersistedRedSyncState,
  savePersistedRedSyncState,
  SEEN_LIVE_USERS_KEY,
  SEEN_LIVE_JOINS_KEY,
  PREV_RED_SYNC_STATE_KEY,
  SESSION_TOAST_GRACE_MS,
  seenLiveJoinsStorageKey,
  MAX_SEEN_IDS_PER_CHAT,
  MAX_SEEN_STRING_IDS,
  trimSetToMax,
} from './utils/safeLocalStorage'
import {
  attachGroupMessagesListener,
  mapGroupMessageDoc,
  mergeGroupMessages,
} from './services/groupMessages'
import {
  attachSquadsListener,
  createSquadInFirestore,
  joinSquadInFirestore,
  leaveSquadInFirestore,
  updateSquadRoutineInFirestore,
} from './services/squads'
import { attachLiveUsersListener, patchRealProfilesWithLiveSnapshot } from './services/liveUsers'
import {
  attachLivePresenceListener,
  writeLivePresence,
  clearLivePresence,
  buildLivePresencePayload,
  patchLivePresenceMotion,
  patchLivePresenceGymSound,
} from './services/livePresence'
import { requestPlayIntegrityToken, hasPositiveIntegrity, getLastIntegrityResult } from './services/playIntegrity'
import { Capacitor } from '@capacitor/core'
import { collection, query, where, getDocs, orderBy, limit, doc, onSnapshot, updateDoc } from 'firebase/firestore'

/** Keys that must not leak between real accounts on the same browser */
const ACCOUNT_SCOPED_STORAGE_KEYS = [
  'fitvina_liked', 'fitvina_passed', 'fitvina_matches', 'fitvina_messages',
  'entrenamatch_v1_profile',
  'entrenamatch_blocked', 'entrenamatch_notifications', 'entrenamatch_reports',
  'entrenamatch_chat_unreads', 'entrenamatch_session_unreads',
  'entrenamatch_profile_posts', 'entrenamatch_squads', 'entrenamatch_reviews',
  'entrenamatch_sessions', 'entrenamatch_session_messages',
  'entrenamatch_last_live', 'entrenamatch_location',
  'entrenamatch_seen_chat_msgs', 'entrenamatch_seen_group_msgs',
  'entrenamatch_seen_live_users', 'entrenamatch_seen_live_joins',
  'entrenamatch_demo_user',
] as const

function purgeAccountScopedStorage() {
  for (const key of ACCOUNT_SCOPED_STORAGE_KEYS) {
    try { localStorage.removeItem(key) } catch {}
  }
}

/** Squad ids from Firestore (`sq_*`) or legacy demo (`sq` + timestamp). */
function isSquadChatId(id: string): boolean {
  return id.startsWith('sq')
}

function groupMessagesCollectionPath(chatId: string): string {
  return isSquadChatId(chatId) ? `squads/${chatId}/messages` : `sessions/${chatId}/messages`
}

// ==================== MAIN APP ====================
function App() {
  // Persisted state
  const { 
    currentUser, 
    saveUser, 
    showOnboarding,
    setShowOnboarding,
    clearProfile 
  } = useProfile()

  // Real Auth from Firebase + Demo Auth -- hoisted very early so that isDemoMode, firebaseUser are available for any early effects' deps (e.g. the daily offline effect at ~1188, and to avoid TDZ on open).
  const { currentUser: firebaseUser, userProfile: firebaseProfile, isDemoMode, googleNewUser, clearGoogleNewUser, loading: authBooting, setDemoMode } = useAuth()
  const { 
    signInDemo, 
    signUpDemo, 
    isAuthenticated: isDemoAuthenticated 
  } = useDemoAuth()

  const effectiveUserId = !isDemoMode && firebaseUser?.uid ? firebaseUser.uid : 'me'

  // Used to break the "stuck on AuthScreen after successful real auth" race
  // because firebaseUser from the hook can lag behind the successful signIn/signUp call.
  const lastSuccessfulAuthRef = useRef(null)
  const loggingOutRef = useRef(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const groupChatScrollRef = useRef<HTMLDivElement>(null)
  const groupChatInputRef = useRef<HTMLInputElement>(null)
  const groupMessageUnsubsRef = useRef<Record<string, () => void>>({})
  const setActiveChatBridgeRef = useRef<(id: string | null) => void>(() => {})
  const activeChatRuntimeRef = useRef<string | null>(null)
  const chatIncomingRef = useRef<
    ((matchId: string, name: string, text: string, photo?: string) => void) | null
  >(null)
  const loadProfilePostsRef = useRef<
    ((userId: string) => Promise<ProfilePost[] | undefined>) | null
  >(null)
  const seenGroupMsgIdsRef = useRef(loadPersistedSeenIdMap('entrenamatch_seen_group_msgs'))
  // For live training urgency notifs: track seen live users so we only notify on *new* nearby lives (prevents spam on refresh)
  const seenLiveUserIdsRef = useRef(loadPersistedStringIdSet(SEEN_LIVE_USERS_KEY))
  // For "someone joined my live" notifs: dedup incoming comments/likes on the live posts we created when trainingNow
  const seenLiveJoinInteractionIdsRef = useRef(loadPersistedStringIdSet(SEEN_LIVE_JOINS_KEY))
  // Track previous trainingSyncWith for members of *your red* so we can notify when they start a strong sync (Network Power propagation moment)
  const prevRedSyncStateRef = useRef(loadPersistedRedSyncState())
  // First live snapshot per session: seed seen state without toasts (prevents burst on app open)
  const liveSessionAlertsReadyRef = useRef(false)
  const liveJoinsBootstrappedRef = useRef(false)
  const appStartedAtRef = useRef(Date.now())
  const recentPushToastKeysRef = useRef<Set<string>>(new Set())
  // Per-chat and per-session unread counts for badges + list dots (local, cleared on open)
  const [sessionUnreads, setSessionUnreads] = useState<Record<string, number>>({})

  // Same for session group unreads
  useEffect(() => {
    localStorage.setItem('entrenamatch_session_unreads', JSON.stringify(sessionUnreads))
  }, [sessionUnreads])

  // PWA install prompt wiring (beforeinstallprompt + nice banner after engagement) â€” web only
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return undefined
    const handler = (e: any) => {
      // Note: we intentionally do NOT call preventDefault here to avoid the "Banner not shown" browser info message.
      // We still capture the event if available for our custom "Instalar" button (which will call .prompt()).
      // The browser may show its own install banner at its preferred time.
      // Our custom banner provides additional guidance and a nice button.
      setDeferredInstallPrompt(e)
      if (!localStorage.getItem('entrenamatch_pwa_dismissed')) {
        setTimeout(() => {
          if (!localStorage.getItem('entrenamatch_pwa_dismissed')) {
            setShowPwaInstall(true)
          }
        }, 5000)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Fase 101 â€” PWA solo tras beforeinstallprompt (sin popup a los 3s)

    // Also listen for successful install
    const installedHandler = () => {
      setShowPwaInstall(false)
      setDeferredInstallPrompt(null)
      localStorage.setItem('entrenamatch_pwa_dismissed', '1')
      toast.success('Â¡App instalada!', { description: 'Ya puedes abrir EntrenaMatch desde tu pantalla de inicio como una app real.' })
    }
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const dailyPulseBridgeRef = useRef<DailyPulseBridge | null>(null)
  const pushNativeSetupUidRef = useRef<string | null>(null)
  const googleNewUserBootstrappedRef = useRef(false)
  const realProfileSyncedUidRef = useRef<string | null>(null)
  const saveUserWithRealSyncRef = useRef<(user: CurrentUser) => Promise<unknown>>(async () => {})
  const createProfilePostRef = useRef<
    (text: string, photo?: string | null, postType?: ProfilePostType) => Promise<unknown>
  >(async () => {})
  const triggerConfettiRef = useRef<(() => void) | undefined>(undefined)
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)

  // Boost visibility of install banner on meaningful interaction (swipe or tab change to social)
  // More aggressive: show even without deferred (for manual guidance) if not dismissed
  const bumpPwaEngagement = () => {
    if (Capacitor.isNativePlatform()) return
    if (!pwaInstallDismissed && !showPwaInstall) {
      setShowPwaInstall(true)
    }
  }

  const handleInstallPwa = async () => {
    if (!deferredInstallPrompt) return
    try {
      deferredInstallPrompt.prompt()
      const { outcome } = await deferredInstallPrompt.userChoice
      if (outcome === 'accepted') {
        localStorage.setItem('entrenamatch_pwa_dismissed', '1')
        setShowPwaInstall(false)
        toast.success('Â¡Gracias! La app se estÃ¡ instalando.')
      } else {
        setShowPwaInstall(false)
      }
      setDeferredInstallPrompt(null)
    } catch (e) {
      setShowPwaInstall(false)
    }
  }

  const dismissPwaInstall = () => {
    localStorage.setItem('entrenamatch_pwa_dismissed', '1')
    setShowPwaInstall(false)
  }

  // === VOICE NOTES: Spectacular UX for messages in the fitness social network ===
  // Record short voice memos (up to 60s) to share training tips, motivation, post-sync notes.
  // Works on web + Capacitor native (mic permission handled by browser/OS).
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        const duration = Math.max(1, Math.floor((Date.now() - recordingStartTimeRef.current) / 1000))
        setPendingVoice({ blob, duration, url })
        // cleanup stream
        stream.getTracks().forEach(track => track.stop())
        if (voicePreviewUrlRef.current) URL.revokeObjectURL(voicePreviewUrlRef.current)
        voicePreviewUrlRef.current = url
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
          recordingTimerRef.current = null
        }
        isRecordingRef.current = false
        setIsRecordingVoice(false)
        setRecordingTime(0)
        currentRecordingTimeRef.current = 0
        recordingStartTimeRef.current = 0
        // cleanup live visualizer
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
        if (analyserRef.current) analyserRef.current = null
        if (audioContextRef.current) { try { audioContextRef.current.close() } catch {}; audioContextRef.current = null }
        setRecordingLevels([4,7,5,9,3,8,4,6,5,7])
      }

      mediaRecorder.start()
      isRecordingRef.current = true
      setIsRecordingVoice(true)
      setRecordingTime(0)
      currentRecordingTimeRef.current = 0
      recordingStartTimeRef.current = Date.now()
      setPendingVoice(null)
      try { triggerHaptic('medium') } catch {}

      // === PREMIUM LIVE VISUALIZER (real mic levels via WebAudio) ===
      try {
        const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext)
        const audioCtx = new AudioCtx()
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        analyser.minDecibels = -80
        analyser.maxDecibels = -10
        analyser.smoothingTimeConstant = 0.75
        source.connect(analyser)
        audioContextRef.current = audioCtx
        analyserRef.current = analyser

        const buffer = new Uint8Array(analyser.frequencyBinCount)
        const updateLiveWave = () => {
          if (!analyserRef.current || !isRecordingRef.current) return
          analyserRef.current.getByteFrequencyData(buffer)
          const levels = Array.from({ length: 10 }, (_, i) => {
            const v = buffer[i * 2] || 20
            return Math.max(3, Math.min(16, Math.floor(3 + (v / 255) * 13)))
          })
          setRecordingLevels(levels)
          rafRef.current = requestAnimationFrame(updateLiveWave)
        }
        rafRef.current = requestAnimationFrame(updateLiveWave)
      } catch (e) {
        // graceful fallback static-ish bars
        setRecordingLevels([5,8,4,11,6,9,5,7,4,10])
      }

      // timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const next = prev + 1
          currentRecordingTimeRef.current = next
          if (next >= 60) {
            // auto stop at 60s
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop()
            if (recordingTimerRef.current) {
              clearInterval(recordingTimerRef.current)
              recordingTimerRef.current = null
            }
            // onstop will set pending with the ref value and reset time
            return 60
          }
          return next
        })
      }, 1000)

      toast('ðŸŽ™ï¸ Grabando nota de voz', { description: 'Para tu EntrenaPartner. MÃ¡x 60s. PARAR para escucharla y decidir enviar.' })
    } catch (err) {
      console.error('Mic error', err)
      toast.error('No se pudo acceder al micrÃ³fono', {
        description: 'Activa el permiso de micrÃ³fono para EntrenaMatch en Ajustes del celular.',
      })
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop()
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    try { triggerHaptic('light') } catch {}
    // reset happens in onstop (also cleans visualizer)
  }

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop()
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    isRecordingRef.current = false
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    if (analyserRef.current) analyserRef.current = null
    if (audioContextRef.current) { try { audioContextRef.current.close() } catch {}; audioContextRef.current = null }
    setRecordingLevels([4,7,5,9,3,8,4,6,5,7])
    setIsRecordingVoice(false)
    setRecordingTime(0)
    currentRecordingTimeRef.current = 0
    recordingStartTimeRef.current = 0
    if (voicePreviewUrlRef.current) {
      URL.revokeObjectURL(voicePreviewUrlRef.current)
      voicePreviewUrlRef.current = null
    }
    setPendingVoice(null)
    try { triggerHaptic('light') } catch {}
  }

  const sendVoiceNote = async (chatId: string, isGroup = false) => {
    if (!pendingVoice) return

    const { blob, duration, url: previewUrl } = pendingVoice
    setIsUploadingVoice(true)
    setVoiceUploadProgress(0)

    try {
      let voiceUrl: string

      if (isDemoMode) {
        // Demo/local only: blob URL is acceptable (ephemeral)
        // simulate a quick progress for demo polish
        for (let p = 20; p <= 100; p += 20) {
          setVoiceUploadProgress(p)
          await new Promise(r => setTimeout(r, 80))
        }
        voiceUrl = previewUrl
      } else {
        // Real Firebase â€” use resumable upload for beautiful live progress bar
        if (!firebaseUser?.uid || !storage) {
          throw new Error('Firebase Storage no disponible')
        }
        const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
        const storageRef = ref(storage, `chat-voice/${chatId}/${Date.now()}.webm`)
        const uploadTask = uploadBytesResumable(storageRef, blob)

        // live progress
        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
              setVoiceUploadProgress(progress)
            },
            (error) => reject(error),
            async () => {
              voiceUrl = await getDownloadURL(uploadTask.snapshot.ref)
              resolve()
            }
          )
        })
      }

      const voiceDescriptor = { voiceUrl, voiceDuration: duration }

      if (isGroup && showGroupChatModalFor) {
        sendSessionMessage(showGroupChatModalFor, '', null, voiceDescriptor)
      } else if (activeChatRuntimeRef.current) {
        sendMessage('', voiceDescriptor)
      }

      // Revoke the local preview blob only after we have a safe permanent URL in the message
      if (voicePreviewUrlRef.current) {
        URL.revokeObjectURL(voicePreviewUrlRef.current)
        voicePreviewUrlRef.current = null
      }
      setPendingVoice(null)
      setIsUploadingVoice(false)
      setVoiceUploadProgress(0)
      try { triggerHaptic('success') } catch {}
      // Voice streak update (before toast so accurate)
      const pulseApi = dailyPulseBridgeRef.current
      pulseApi?.checkAndUpdateDailyPulse()
      const dp = pulseApi?.dailyPulseRef.current || pulseApi?.dailyPulse || {}
      const vStreak = (dp.voiceStreak || 0) + 1
      const vUpdate = { ...dp, voiceStreak: vStreak, longestVoice: Math.max((dp.longestVoice || 0), vStreak) }
      pulseApi?.setDailyPulse(vUpdate)
      saveUserWithRealSyncRef.current?.({ ...(currentUser as any), dailyVoiceStreak: vStreak } as CurrentUser)
      // Premium toast celebrating the ritual voice + streak
      toast.success('Nota enviada a tu EntrenaPartner', { 
        description: `${duration}s â€¢ Racha de voz ${vStreak}d ðŸ”¥  ${BRAND_COPY.toasts.voiceConstancy}` 
      })
      // Daily Pulse progress (voice is powerful for bond/ripple challenges)
      if (dp.currentChallenge?.type === 'bond' || dp.currentChallenge?.type === 'network') {
        pulseApi?.completeDailyChallenge(1)
      } else {
        pulseApi?.awardConstancy(5, BRAND_COPY.toasts.voiceConstancy)
      }
    } catch (e) {
      console.error('Send voice error', e)
      const isReal = !isDemoMode
      const uid = firebaseUser?.uid || 'sin-uid'
      toast.error('Error enviando nota de voz', { 
        description: isReal 
          ? `No se pudo subir el audio (uid: ${uid}). AsegÃºrate de que las storage rules estÃ©n deployadas (firebase deploy --only storage) y que estÃ©s autenticado con cuenta real.` 
          : 'Error local al procesar el audio.'
      })
      setIsUploadingVoice(false)
      setVoiceUploadProgress(0)
      // Do NOT clear pendingVoice on error, so user can retry or cancel
    }
  }

  const pickChatPhoto = async () => {
    try {
      if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform() && CapacitorCamera) {
        const photo = await CapacitorCamera.getPhoto({
          quality: 82,
          allowEditing: true,
          resultType: 'base64',
          source: 'prompt',
        })
        if (!photo.base64String) return
        const blob = await (await fetch(`data:image/jpeg;base64,${photo.base64String}`)).blob()
        const url = URL.createObjectURL(blob)
        if (chatPhotoPreviewRef.current) URL.revokeObjectURL(chatPhotoPreviewRef.current)
        chatPhotoPreviewRef.current = url
        setPendingChatPhoto({ blob, url })
        return
      }
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = () => {
        void (async () => {
          const file = input.files?.[0]
          if (!file) return
          const url = URL.createObjectURL(file)
          if (chatPhotoPreviewRef.current) URL.revokeObjectURL(chatPhotoPreviewRef.current)
          chatPhotoPreviewRef.current = url
          setPendingChatPhoto({ blob: file, url })
        })()
      }
      input.click()
    } catch (err) {
      console.warn('pickChatPhoto', err)
      toast.error('No se pudo abrir la cÃ¡mara o galerÃ­a')
    }
  }

  const sendChatPhoto = async (chatId: string) => {
    if (!pendingChatPhoto) return
    setIsUploadingChatPhoto(true)
    setChatPhotoUploadProgress(0)
    try {
      let photoUrl = ''
      const { blob, url: previewUrl } = pendingChatPhoto
      if (isDemoMode) {
        for (let p = 25; p <= 100; p += 25) {
          setChatPhotoUploadProgress(p)
          await new Promise((r) => setTimeout(r, 60))
        }
        photoUrl = previewUrl
      } else {
        if (!firebaseUser?.uid || !storage) throw new Error('Firebase Storage no disponible')
        const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
        const ext = blob.type.includes('png') ? 'png' : 'jpg'
        const storageRef = ref(storage, `chat-photos/${chatId}/${Date.now()}.${ext}`)
        const uploadTask = uploadBytesResumable(storageRef, blob)
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              setChatPhotoUploadProgress(
                Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
              )
            },
            reject,
            async () => {
              photoUrl = await getDownloadURL(uploadTask.snapshot.ref)
              resolve()
            }
          )
        })
      }
      sendMessage('', null, photoUrl)
      if (chatPhotoPreviewRef.current) {
        URL.revokeObjectURL(chatPhotoPreviewRef.current)
        chatPhotoPreviewRef.current = null
      }
      setPendingChatPhoto(null)
      setIsUploadingChatPhoto(false)
      setChatPhotoUploadProgress(0)
      try { triggerHaptic('success') } catch {}
      toast.success('Foto enviada')
    } catch (e) {
      console.error('sendChatPhoto', e)
      toast.error('No se pudo enviar la foto', {
        description: isDemoMode ? 'Error local' : 'Revisa conexiÃ³n y reglas de Storage (chat-photos).',
      })
      setIsUploadingChatPhoto(false)
      setChatPhotoUploadProgress(0)
    }
  }

  // Extend sendSessionMessage to support voice (update call sites later)
  // (existing function at ~4328, we'll patch it below)

  const {
    likedIds,
    passedIds,
    isResettingDeck,
    saveLiked,
    savePassed,
    resetDeck: resetSwipeDeck,
  } = useSwipeDeck({ isDemoMode, db, firebaseUser })

  // Chat + matches â€” useChatSession (fase 79), declared after realProfiles below

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const appVisible = useAppVisibility()
  const [redSubTab, setRedSubTab] = useState<RedSubTab>('matches')
  const [homeCoachBanner, setHomeCoachBanner] = useState<HomeCoachBannerContext | null>(null)
  const [postLiveSession, setPostLiveSession] = useState<{ minutes: number; gymName?: string | null } | null>(null)
  const [postLivePublishing, setPostLivePublishing] = useState(false)
  const [pactReminderDismissed, setPactReminderDismissed] = useState(false)
  const [profileViewWorkouts, setProfileViewWorkouts] = useState<import('./types').Workout[]>([])
  const [showHomeShopBanner, setShowHomeShopBanner] = useState(true)
  const [showSyncLiveBlocker, setShowSyncLiveBlocker] = useState(false)
  const [syncBlockerPartnerName, setSyncBlockerPartnerName] = useState<string | undefined>()
  const [showPactWizard, setShowPactWizard] = useState(false)
  const [showCityCelebration, setShowCityCelebration] = useState(false)
  const [safetySheetTarget, setSafetySheetTarget] = useState<{ id: string; name: string } | null>(null)
  const syncArenaSnapshotRef = useRef(createEmptySyncArenaSnapshot())
  const navigateTab = useCallback((tab: Tab) => {
    const { tab: resolved, redSubTab: sub } = normalizeTabNavigation(tab)
    setActiveTab(resolved)
    if (sub) setRedSubTab(sub)
    if (resolved !== 'red' && tab !== 'messages') setActiveChatBridgeRef.current(null)
    syncTabToUrl(resolved, { map: resolved === 'map' })
  }, [])
  const [profileSection, setProfileSection] = useState<ProfileSection>('actividad')
  const [homeSubTab, setHomeSubTab] = useState<import('./components/home/HomeTab').HomeSubTab>('day')
  const profileSectionBootRef = useRef(false)
  // Feed UI â€” useFeedState (fase 80), declared after setLastSync below
  const [weekLiveDays, setWeekLiveDays] = useState<string[]>([])
  const [showLiveModal, setShowLiveModal] = useState(false)
  const [showEntrenaLogModal, setShowEntrenaLogModal] = useState(false)
  const [entrenoRecentWorkouts, setEntrenoRecentWorkouts] = useState<import('./types').Workout[]>([])
  const [entrenoFirestoreGymRoutines, setEntrenoFirestoreGymRoutines] = useState<
    import('./utils/workoutTemplates').WorkoutQuickTemplate[]
  >([])
  const [pactPartnerWorkouts, setPactPartnerWorkouts] = useState<import('./types').Workout[]>([])
  const [entrenoRecentLoading, setEntrenoRecentLoading] = useState(false)
  const [savingWorkout, setSavingWorkout] = useState(false)
  const syncSession = useSyncSession()
  const {
    syncPartnerId,
    setSyncPartnerId,
    syncStartedAt,
    setSyncStartedAt,
    syncActions,
    setSyncActions,
    syncVibe,
    setSyncVibe,
    pendingSyncRating,
    setPendingSyncRating,
    activeSyncCount,
    setActiveSyncCount,
    joiningSyncWith,
    setJoiningSyncWith,
    syncCombo,
    setSyncCombo,
    flyingEmojis,
    setFlyingEmojis,
    arenaWaveCount,
    setArenaWaveCount,
    lastArenaWaveLabel,
    setLastArenaWaveLabel,
    arenaWavePulseKey,
    setArenaWavePulseKey,
    syncRealWitnessCount,
    setSyncRealWitnessCount,
    showSyncArena,
    setShowSyncArena,
    syncRipples,
    setSyncRipples,
    syncBonds,
    setSyncBonds,
    lastSyncStory,
    setLastSyncStory,
    syncWorkoutLog,
    setSyncWorkoutLog,
    syncPartnerLiveState,
    setSyncPartnerLiveState,
    syncRestUntil,
    setSyncRestUntil,
    syncRestStartedBy,
    setSyncRestStartedBy,
    syncWitnessIds,
    setSyncWitnessIds,
    syncPartnerIdRef,
    syncBondsRef,
    witnessedSessionsRef,
    networkStats,
  } = syncSession

  const [entrenaLogPrefill, setEntrenaLogPrefill] = useState<{
    title?: string
    exercises?: import('./types').WorkoutExercise[]
    type?: import('./types').WorkoutType
    durationMin?: number
  } | null>(null)
  const [entrenaLogSkipDraft, setEntrenaLogSkipDraft] = useState(false)
  const [entrenaLogExpandPastWorkouts, setEntrenaLogExpandPastWorkouts] = useState(false)
  const [entrenaLogShareToChat, setEntrenaLogShareToChat] = useState<string | null>(null)
  const [workoutDraftRefresh, setWorkoutDraftRefresh] = useState(0)
  const [workoutSaveBanner, setWorkoutSaveBanner] = useState<{
    title: string
    prSummary?: string
    burnKcal?: number
    fuelTip?: string
    sessionSummary?: string
    fuelBalanceHint?: string
  } | null>(null)
  const workoutSaveShareOptsRef = useRef<Parameters<typeof shareWorkoutStory>[0] | null>(null)
  const [showFuelSetupModal, setShowFuelSetupModal] = useState(false)
  const [showFuelSetupWizard, setShowFuelSetupWizard] = useState(false)
  const [showFuelLogModal, setShowFuelLogModal] = useState(false)
  const [fuelLogPrefill, setFuelLogPrefill] = useState<FuelLogPrefill | null>(null)
  const [showMarketplace, setShowMarketplace] = useState(false)
  const [marketplaceScreenMode, setMarketplaceScreenMode] = useState<'shop' | 'orders'>('shop')
  const [showAdminOps, setShowAdminOps] = useState(false)
  const [adminOrders, setAdminOrders] = useState<MarketplaceOrder[]>([])
  const [adminBookings, setAdminBookings] = useState<TrainerBooking[]>([])
  const [mpHealth, setMpHealth] = useState<MpHealthResult | null>(null)
  const [showActivationGuide, setShowActivationGuide] = useState(false)
  const [showFeatureTour, setShowFeatureTour] = useState(false)
  const maybeScheduleFeatureTour = useCallback(() => {
    if (isE2EHarnessActive() || hasSeenAppFeatureTour() || showActivationGuide) return
    window.setTimeout(() => {
      if (!hasSeenAppFeatureTour() && !showActivationGuide) setShowFeatureTour(true)
    }, 8000)
  }, [showActivationGuide])
  const [myMarketplaceOrders, setMyMarketplaceOrders] = useState<MarketplaceOrder[]>([])
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>([])
  const [isMarketplaceAdmin, setIsMarketplaceAdmin] = useState(false)
  const [appAdminRecord, setAppAdminRecord] = useState<AppAdminRecord | null>(null)
  const [showCommunityAdmin, setShowCommunityAdmin] = useState(false)
  const [showTrainerCoach, setShowTrainerCoach] = useState(false)
  const [trainerCoachPreselect, setTrainerCoachPreselect] = useState<string | null>(null)
  const [trainerProfiles, setTrainerProfiles] = useState<TrainerProfile[]>([])
  const [myTrainerProfile, setMyTrainerProfile] = useState<TrainerProfile | null>(null)
  const [trainerBookings, setTrainerBookings] = useState<TrainerBooking[]>([])
  const [activeTrainerDispatch, setActiveTrainerDispatch] = useState<TrainerDispatchRequest | null>(null)
  const [incomingDispatchOffer, setIncomingDispatchOffer] = useState<TrainerDispatchRequest | null>(null)
  const [clientDispatchHistory, setClientDispatchHistory] = useState<TrainerDispatchRequest[]>([])
  const [trainerDispatchHistory, setTrainerDispatchHistory] = useState<TrainerDispatchRequest[]>([])
  const [trainerCoachInitialTab, setTrainerCoachInitialTab] = useState<
    'explore' | 'now' | 'sessions' | 'trainer' | undefined
  >(undefined)
  const [pendingReviewBookingId, setPendingReviewBookingId] = useState<string | null>(null)
  const {
    savingFuel,
    setSavingFuel,
    fuelProfile,
    setFuelProfile,
    fuelTodayLogs,
    setFuelTodayLogs,
    fuelTodayTotals,
    setFuelTodayTotals,
    fuelWeekDays,
    setFuelWeekDays,
    fuelWeekMacros,
    setFuelWeekMacros,
    editingFuelLog,
    setEditingFuelLog,
    deletingFuelLogId,
    setDeletingFuelLogId,
    fuelPostWorkoutTip,
    setFuelPostWorkoutTip,
    fuelTodayWorkouts,
    setFuelTodayWorkouts,
    fuelWeekWorkouts,
    setFuelWeekWorkouts,
    refreshFuelData,
    syncFuelDayState,
  } = useFuelState({
    isDemoMode,
    db,
    firebaseUserUid: firebaseUser?.uid,
    effectiveUserId,
  })
  const [firstStepsProgress, setFirstStepsProgress] = useState<FirstStepsProgress | null>(null)
  const chatTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [exercisePRRecords, setExercisePRRecords] = useState<ExercisePRRecord[]>([])
  const [partnerGymStats, setPartnerGymStats] = useState<PartnerGymStats | null>(null)
  const [partnerGymLoading, setPartnerGymLoading] = useState(false)
  const [constanciaBalance, setConstanciaBalance] = useState<number | null>(null)
  // THE KILLER FEATURE: EntrenaSync â€” see useSyncSession() hook (fase 123)
  // Live modal local UI: search + sort for better discovery in the full list (killer feature polish)
  const [liveModalSearch, setLiveModalSearch] = useState('')
  const [liveModalSort, setLiveModalSort] = useState<'distance' | 'urgency' | 'hot'>('distance')

  // =====================================================
  // THE CORE PURPOSE OF ENTRENASYNC â€” building the first real social network for synchronized fitness performance.
  //
  // We are deliberately keeping these 5 non-negotiable mechanics (user directive):
  // â€¢ Real-time synchronized training with shared state â€” two people training "juntas" even when physically in different places.
  // â€¢ Strong visual connection in the moment â€” tether/energy line + orb that reacts live to the combined effort of both.
  // â€¢ Joint actions that create a shared performance score + visible, lasting impact afterward (profiles, feed, live map).
  // â€¢ "Training with someone" produces real, measurable consequences: better consistency, higher training volume, stronger motivation, and a permanent shared archive of the session.
  // â€¢ The map functions as a living social layer of real activity â€” you can literally see where meaningful, high-signal training is happening right now.
  //
  // Epic category vision (first-principles, like the original social graph or real-time public conversation):
  // This is the platform that makes synchronized physical effort between humans a primary, high-status, performance-enhancing social primitive.
  // Not another matching app. Not solo tracking.
  // But the network where training together is visible, consequential, status-bearing, and culturally significant.
  // Your training relationships form a real graph with history and compounding value.
  // Great sync sessions don't disappear â€” they leave measurable traces on both profiles, propagate through the feed, and light up the map.
  // The map becomes the living pulse of training communities worldwide.
  // In 5-10 years, serious athletes will say "I do my important sessions in Sync" the same way people say they post on the main social networks today.
  //
  // In the UI this must be obvious: the connection feels electric and high-stakes, joint actions feel powerful and consequential,
  // ending a strong sync feels like you built something real together that is now part of both of your permanent records,
  // and the entire community (feed + map) feels more alive because real synchronized training is happening at scale and being recognized.
  // This is infrastructure for the future of fitness as a synchronized, social, high-performance activity.
  // =====================================================

  const [witnessData, setWitnessData] = useState<any>(null) // for shared session highlight replay: replay of a strong EntrenaSync (shared state, actions, vibe) that can be archived as co-authored performance memory

  // Shared Performance Highlights & Discovery Pins
  // Strong EntrenaSync sessions create permanent, visible co-authored highlights in the feed and tappable pins on the map.
  // This builds real culture and status in the network: great synchronized training becomes discoverable and inspires others.
  // Training together compounds into visible performance capital for both people.
  const [echoPins, setEchoPins] = useState<any[]>([]); // persistent tappable highlight pins on map from strong sync sessions

  // Auto-refresh real sessions on tab DISABLED to fix TDZ.
  // Manual button remains.
  // useEffect(() => {
  //   if (activeTab === 'sesiones' && !isDemoMode) {
  //     loadRealSessions()
  //   }
  // }, [activeTab, isDemoMode])

  const [showFilters, setShowFilters] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState<Profile | null>(null)
  const [showFullProfile, setShowFullProfile] = useState<Profile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  // Onboarding step state (managed here so the flow actually advances)
  const [onboardingStep, setOnboardingStepLocal] = useState(0)

  // After Google redirect sign-in â€” bootstrap local profile + onboarding (once per new-user flag)
  useEffect(() => {
    if (!googleNewUser || isDemoMode || !firebaseUser?.uid) return
    if (googleNewUserBootstrappedRef.current) return
    googleNewUserBootstrappedRef.current = true

    clearGoogleNewUser()

    const profilePayload = firebaseProfile
      ? ({ ...firebaseProfile, id: 'me' } as any)
      : ({
          id: 'me' as any,
          name: firebaseUser.displayName || '',
          age: 25,
          gender: 'hombre' as const,
          city: '',
          country: 'Chile',
          bio: '',
          photos: firebaseUser.photoURL ? [firebaseUser.photoURL] : [],
          trainingTypes: [],
          goals: [],
          level: 'Intermedio' as const,
          intensity: 'Moderado' as const,
          availability: ['Tarde'],
        } as any)
    saveUser(profilePayload)

    lastSuccessfulAuthRef.current = firebaseUser
    setIsEditingProfile(false)
    setOnboardingStepLocal(0)
    if (!isProfileComplete(enrichReturningProfile(profilePayload))) {
      setShowOnboarding(true)
    }
  }, [googleNewUser, firebaseUser?.uid, firebaseProfile, isDemoMode, clearGoogleNewUser, saveUser, setShowOnboarding, firebaseUser])

  // Keep ref in sync when Firebase user appears (Google redirect / email login)
  useEffect(() => {
    if (firebaseUser) lastSuccessfulAuthRef.current = firebaseUser
  }, [firebaseUser?.uid])

  // Live-join dedup: per-account persistence + fresh session clock (no toast burst on login).
  useEffect(() => {
    appStartedAtRef.current = Date.now()
    liveJoinsBootstrappedRef.current = false
    if (!firebaseUser?.uid || isDemoMode) {
      seenLiveJoinInteractionIdsRef.current = new Set()
      return
    }
    seenLiveJoinInteractionIdsRef.current = loadPersistedStringIdSet(
      seenLiveJoinsStorageKey(firebaseUser.uid)
    )
  }, [firebaseUser?.uid, isDemoMode])

  // Quick demo entry from AuthScreen
  useEffect(() => {
    try {
      if ((window as any).__ENTRENAMATCH_QUICK_DEMO__) {
        (window as any).__ENTRENAMATCH_QUICK_DEMO__ = false;
        const demoSeed = {
          id: 'me' as any,
          name: 'Demo Tester',
          age: 28,
          gender: 'mujer' as const,
          city: 'ViÃ±a del Mar',
          country: 'Chile',
          lat: -33.0153,
          lng: -71.5528,
          bio: 'Demo lista para probar live + muro. Entreno pesas y running. Â¡Conectemos!',
          photos: ['https://picsum.photos/id/1011/600/800'],
          trainingTypes: ['Pesas/Gym', 'Running'],
          goals: ['Ganar mÃºsculo', 'Socializar y motivaciÃ³n'],
          level: 'Intermedio',
          intensity: 'Moderado',
          availability: ['Tarde'],
          wantsToGoLive: true
        };
        saveUser(demoSeed as any);
        setTimeout(() => {
          setShowOnboarding(true);
          setOnboardingStepLocal(0);
        }, 80);
        toast.success('Demo rÃ¡pido activado', { description: 'Preview en vivo + opt-in EN VIVO en el paso final. Â¡La clave de la app!' });
      }
    } catch (e) { console.warn('quick demo', e); }
  }, [saveUser, setShowOnboarding]); // deps safe

  // Auth UI state (restored for account creation)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  // Temporary edit state for profile (demo)
  const [editBio, setEditBio] = useState('')
  const [editAvailability, setEditAvailability] = useState<string[]>([])
  const [editGoals, setEditGoals] = useState<string[]>([])

  // Legal pages
  type LegalPage = 'terms' | 'privacy' | 'community' | null
  const [showLegal, setShowLegal] = useState<LegalPage>(null)

  // Filters - now powered by dedicated hook
  const { 
    filters, 
    setFilters, 
    resetFilters: resetFiltersHook, 
    toggleTrainingType: _toggleTrainingType, 
    toggleAvailability: _toggleAvailability 
  } = useFilters()

  // User GPS location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [_locationPermissionAsked] = useState(false)
  const isGettingLocationRef = useRef(false) // guard against concurrent GPS requests that can crash on Android permission/GPS prompt

  // Training Sessions (unique feature)
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [selectedTrainingType, setSelectedTrainingType] = useState('Pesas/Gym')
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  const closeCreateSession = () => {
    setShowCreateSession(false)
    setSelectedTrainingType('Pesas/Gym')
  }

  // âœ… FUNCIÃ“N RECURSIVA PARA LIMPIAR UNDEFINED (arregla currentDailyChallenge.completed y cualquier objeto anidado)
const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)).filter(item => item !== undefined);
  }

  if (typeof obj === 'object' && obj !== null) {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = sanitizeForFirestore(obj[key]);
      if (value !== undefined) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  }

  return obj;
};

  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  /** First discovery fetch/listener completed — avoids skeleton flash on every silent refresh. */
  const [discoveryReady, setDiscoveryReady] = useState(false)

  // Reviews for "Entrenamos Juntos" (unique trust system)
  const [reviews, setReviews] = useState<Record<string, TrainingReview[]>>({}) // key = matchId (profile id)

  // Group chat per session (the new feature)
  const [sessionMessages, setSessionMessages] = useState<Record<string, SessionMessage[]>>({})

  // Review modal state
  const [showReviewModalFor, setShowReviewModalFor] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null) // data URL for the session photo

  // Verification flow state (multi-step)
  const [showVerificationFlow, setShowVerificationFlow] = useState(false)
  const [verificationStep, setVerificationStep] = useState(1)
  const [verificationSelfie, setVerificationSelfie] = useState<string | null>(null)
  const [verificationSubmitting, setVerificationSubmitting] = useState(false)

  // Group chat modal state
  const [showGroupChatModalFor, setShowGroupChatModalFor] = useState<string | null>(null) // sessionId
  const [chatInputValue, setChatInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [groupChatPhoto, setGroupChatPhoto] = useState<string | null>(null) // for sending photo messages

  // Voice notes recording (for 1:1 and group chats) - spectacular UX for fitness social
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [pendingVoice, setPendingVoice] = useState<{blob: Blob, duration: number, url: string} | null>(null)
  const [isUploadingVoice, setIsUploadingVoice] = useState(false)
  const [voiceUploadProgress, setVoiceUploadProgress] = useState(0)
  const [pendingChatPhoto, setPendingChatPhoto] = useState<{ blob: Blob; url: string } | null>(null)
  const [isUploadingChatPhoto, setIsUploadingChatPhoto] = useState(false)
  const [chatPhotoUploadProgress, setChatPhotoUploadProgress] = useState(0)
  const chatPhotoPreviewRef = useRef<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Voice notes recording (for 1:1 and group chats) - spectacular UX for fitness social
  const audioChunksRef = useRef<Blob[]>([])

    // === FIRESTORE GLOBAL RESILIENCE + LISTENER CLEANUP (Fix para INTERNAL ASSERTION) ===
const listenersRef = useRef<(() => void)[]>([])

const cleanupAllListeners = useCallback(() => {
  listenersRef.current.forEach(unsub => unsub?.())
  listenersRef.current = []
  console.log('âœ… All Firestore listeners cleaned')
}, [])

useEffect(() => {
  return () => cleanupAllListeners()
}, [cleanupAllListeners])

// Network + Listener resilience (Fase 4: recover without disable â€” keeps RT listeners alive)
useEffect(() => {
  const handleOnline = async () => {
    setIsOffline(false)
    // Firestore auto-reconnects with persistentLocalCache â€” do NOT call enableNetwork (causes da08).
    if (!isDemoMode && firebaseUser?.uid) {
      setTimeout(() => {
        loadRealSessions?.()
        loadRealProfiles?.().catch(() => {})
        if (typeof loadProfilePosts === 'function') loadProfilePosts(firebaseUser.uid)
      }, 400)
    }
  }

  const handleOffline = () => setIsOffline(true)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  if (db && !isDemoMode) {
    // Offline cache via initializeFirestore(persistentLocalCache()) in firebase.ts â€” do NOT also call
    // enableIndexedDbPersistence (deprecated API; double persistence causes failed-precondition / stale writes).
  }

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}, [isDemoMode, firebaseUser?.uid, cleanupAllListeners])

  // Extra resilience for Capacitor: on app resume (user comes back from background), force network re-enable.
  // Mobile apps frequently kill/restrict long-lived WebChannel connections in background.
  useEffect(() => {
    let unsubApp: (() => void) | null = null

    ;(async () => {
      try {
        if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
          const { ensureCapacitorPlugins, getCapacitorApp } = await import('./utils/capacitorRuntimePlugins')
          await ensureCapacitorPlugins()
          const AppPlugin = getCapacitorApp()
          if (AppPlugin) {
            const listener = await AppPlugin.addListener('appStateChange', async (state: any) => {
              if (state.isActive) {
                // App resumed â€” reload data; Firestore RT listeners auto-reconnect (no enableNetwork).
                setTimeout(() => {
                  loadRealProfiles?.().catch(() => {})
                  loadRealSessions?.()
                }, 400)
              }
            })
            unsubApp = () => { try { listener.remove() } catch {} }
          }
        }
      } catch (e) {
        // App plugin optional
      }
    })()

    return () => { if (unsubApp) unsubApp() }
  }, [])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const voicePreviewUrlRef = useRef<string | null>(null)
  const currentRecordingTimeRef = useRef(0)
  const recordingStartTimeRef = useRef(0)

  // Cleanup voice player + analyser on unmount / major navigation (prevents leaks + background audio)
  useEffect(() => {
    return () => {
      isRecordingRef.current = false
      if (currentAudioRef.current) { try { currentAudioRef.current.pause() } catch {}; currentAudioRef.current = null }
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      if (audioContextRef.current) { try { audioContextRef.current.close() } catch {}; audioContextRef.current = null }
      if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null }
    }
  }, [])

  // For attractive voice message playback animation (fase 349 â€” useChatVoicePlayer)
  const {
    playingVoiceId,
    voicePlayProgress,
    currentAudioRef,
    toggleVoicePlay,
    stopVoice,
  } = useChatVoicePlayer({
    onHaptic: (kind) => {
      try {
        triggerHaptic(kind)
      } catch {
        /* ignore */
      }
    },
  })

  // Live visualizer for PREMIUM recording UX (real mic levels)
  const [recordingLevels, setRecordingLevels] = useState<number[]>([4, 7, 5, 9, 3, 8, 4, 6, 5, 7])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const isRecordingRef = useRef(false)

  // Squads feature (fixed small training groups)
  const [squads, setSquads] = useState<Squad[]>([])

  // Profile Muro / Wall posts - makes profiles feel alive (like FB wall)
  const [profilePosts, setProfilePosts] = useState<Record<string, ProfilePost[]>>({}) // userId -> posts array
  const profilePostsRef = useRef<Record<string, ProfilePost[]>>({})
  const postCommentUnsubsRef = useRef<Record<string, () => void>>({})
  const userPostsUnsubsRef = useRef<Record<string, () => void>>({})
  const globalFeedUnsubRef = useRef<(() => void) | null>(null)
  const homeCityRef = useRef(currentUser?.city || '')
  const liveUsersActiveRef = useRef<any[]>([])
  const postCommentInlineFallbackRef = useRef<Record<string, unknown>>({})
  useEffect(() => { profilePostsRef.current = profilePosts }, [profilePosts])
  const [muroComposerText, setMuroComposerText] = useState('')
  const [muroComposerPhoto, setMuroComposerPhoto] = useState<string | null>(null)
  const [muroPhotoUploading, setMuroPhotoUploading] = useState(false)
  const [muroPhotoUploadProgress, setMuroPhotoUploadProgress] = useState(0)
  const [muroPublishing, setMuroPublishing] = useState(false)
  const [loadingPersonalMuro, setLoadingPersonalMuro] = useState(false)
  // Inline comment composer for attractive muro (replaces ugly prompt() for both own + viewed profiles)
  const [activeComment, setActiveComment] = useState<{postId: string; postUserId: string; ownerName?: string} | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  // Full spectacular comments modal for muro threads (tap preview to open rich view)
  const [viewingPostComments, setViewingPostComments] = useState<{postId: string; postUserId: string; ownerName?: string} | null>(null)
  const [modalCommentDraft, setModalCommentDraft] = useState('')
  const [showCreateSquad, setShowCreateSquad] = useState(false)
  const [squadNameDraft, setSquadNameDraft] = useState('')
  const [selectedSquad, setSelectedSquad] = useState<string | null>(null) // for detail view
  const [squadRoutineDraft, setSquadRoutineDraft] = useState({ label: '', schedule: '', notes: '' })
  const [savingSquadRoutine, setSavingSquadRoutine] = useState(false)

  // Editing own post in muro (spectacular: inline edit without ugly prompts)
  const [editingPost, setEditingPost] = useState<{postId: string; postUserId: string; text: string} | null>(null)
  const [editDraft, setEditDraft] = useState('')

  // Ref for focusing composer from empty state CTA
  const muroComposerRef = useRef<HTMLTextAreaElement>(null)
  // Ref for hidden file input for attractive photo upload in muro composer (web)
  const muroPhotoInputRef = useRef<HTMLInputElement>(null)
  // Ref for feed post modal photo (same attractive file picker)
  const feedPhotoInputRef = useRef<HTMLInputElement>(null)

  // In-app debug logs (for phone-only crash reporting without adb/PC)
  // Collects important events + errors. Button in Profile to copy/share.
  const debugLogsRef = useRef<string[]>([])
  const addDebugLog = (msg: string) => {
    const entry = `[${new Date().toLocaleTimeString('es-CL')}] ${msg}`
    debugLogsRef.current = [entry, ...debugLogsRef.current].slice(0, 30)
    console.log('[EntrenaDebug]', msg)
  }
  // Expose for ErrorBoundary and key flows
  ;(window as any).__addEntrenaDebugLog = addDebugLog

  // Attractive web file photo handler for muro composer (replaces ugly prompt)
  const handleMuroPhotoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // For web: upload immediately with progress for great UX (no giant base64 lingering)
    if (!isDemoMode && storage) {
      setMuroPhotoUploading(true)
      setMuroPhotoUploadProgress(0)
      ;(async () => {
        try {
          const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
          const path = `posts/${effectiveUserId}/composer-${Date.now()}.jpg`
          const storageRef = ref(storage, path)
          const uploadTask = uploadBytesResumable(storageRef, file)
          uploadTask.on('state_changed', 
            (snap) => {
              const prog = (snap.bytesTransferred / snap.totalBytes) * 100
              setMuroPhotoUploadProgress(Math.round(prog))
            },
            (err) => { console.warn(err); setMuroPhotoUploading(false) },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref)
              setMuroComposerPhoto(url)
              setMuroPhotoUploading(false)
              setMuroPhotoUploadProgress(0)
            }
          )
        } catch (e) {
          // fallback to dataURL if storage fails
          const reader = new FileReader()
          reader.onload = (ev) => setMuroComposerPhoto(ev.target?.result as string)
          reader.readAsDataURL(file)
          setMuroPhotoUploading(false)
        }
      })()
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) setMuroComposerPhoto(event.target.result as string)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  // Same for feed post modal
  const handleFeedPhotoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const applyDataUrl = (dataUrl: string) => setFeedPostPhoto(dataUrl)

    if (!isDemoMode && storage && firebaseUser?.uid) {
      setFeedPhotoUploading(true)
      setFeedPhotoUploadProgress(0)
      void (async () => {
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (event) => {
              const result = event.target?.result
              if (typeof result === 'string') resolve(result)
              else reject(new Error('read failed'))
            }
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(file)
          })
          setFeedPhotoUploadProgress(35)
          const { ref, uploadString, getDownloadURL } = await import('firebase/storage')
          const path = `posts/${effectiveUserId}/feed-${Date.now()}.jpg`
          const storageRef = ref(storage, path)
          const snap = await uploadString(storageRef, dataUrl, 'data_url')
          setFeedPhotoUploadProgress(90)
          const url = await getDownloadURL(snap.ref)
          setFeedPostPhoto(url)
          setFeedPhotoUploadProgress(100)
        } catch (uploadErr) {
          try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = (event) => {
                const result = event.target?.result
                if (typeof result === 'string') resolve(result)
                else reject(new Error('read failed'))
              }
              reader.onerror = () => reject(reader.error)
              reader.readAsDataURL(file)
            })
            applyDataUrl(dataUrl)
            toast(
              (uploadErr as { code?: string })?.code === 'storage/unauthorized'
                ? 'Storage sin permisos â€” foto se subirÃ¡ al publicar'
                : 'Foto lista â€” se subirÃ¡ al publicar'
            )
          } catch {
            toast.error('No se pudo cargar la foto')
          }
        } finally {
          setFeedPhotoUploading(false)
        }
      })()
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) applyDataUrl(event.target.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handlePickFeedNativePhoto = useCallback(async () => {
    if (!CapacitorCamera) return
    try {
      const photo = await CapacitorCamera.getPhoto({
        quality: 82,
        allowEditing: true,
        resultType: 'base64',
      })
      if (photo?.base64String) {
        const dataUrl = `data:image/jpeg;base64,${photo.base64String}`
        if (!isDemoMode && storage) {
          setFeedPhotoUploading(true)
          setFeedPhotoUploadProgress(0)
          try {
            const { ref, uploadString, getDownloadURL } = await import('firebase/storage')
            const path = `posts/${effectiveUserId}/feed-${Date.now()}.jpg`
            const storageRef = ref(storage, path)
            const snap = await uploadString(storageRef, dataUrl, 'data_url')
            const url = await getDownloadURL(snap.ref)
            setFeedPostPhoto(url)
            setFeedPhotoUploading(false)
          } catch (uploadErr) {
            setFeedPostPhoto(dataUrl)
            setFeedPhotoUploading(false)
            toast(
              (uploadErr as { code?: string })?.code === 'storage/unauthorized'
                ? 'Storage sin permisos â€” revisa reglas'
                : 'Foto embebida'
            )
          }
        } else {
          setFeedPostPhoto(dataUrl)
        }
      }
    } catch {
      toast('No se pudo usar cÃ¡mara')
      setFeedPhotoUploading(false)
    }
  }, [isDemoMode, effectiveUserId, storage])

  // Safety & Moderation (critical for launch)
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [reports, setReports] = useState<Report[]>([])

  // Improved report flow
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportTargetId, setReportTargetId] = useState<string | null>(null)
  const [reportContext, setReportContext] = useState<Report['context']>('profile')
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')

  // Moderation Panel state
  const [showModerationPanel, setShowModerationPanel] = useState(false)
  const [moderationTab, setModerationTab] = useState<'reports' | 'verifications' | 'bans'>('reports')

  // Auth flow state (default to register in public demo for easy "Crear Cuenta")
  // (local auth state moved into AuthScreen + useDemoAuth)

  // Notifications system (fase 361 â€” useNotificationsState)
  const {
    notifications,
    setNotifications,
    showNotifications,
    setShowNotifications,
    notifPrefs,
    setNotifPrefs,
    saveNotifications,
    addNotification,
    addNotificationRef,
    markNotificationRead,
    clearReadNotifications,
    markAllNotificationsRead,
  } = useNotificationsState()

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanResult | null>(null)
  const [weeklyPlanEnriching, setWeeklyPlanEnriching] = useState(false)

  // PWA install prompt (attractive banner for web testers on mobile - uses Dunkin palette)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null)
  const [showPwaInstall, setShowPwaInstall] = useState(false)
  const [pwaInstallDismissed] = useState(() => !!localStorage.getItem('entrenamatch_pwa_dismissed'))

  const [showLiveMap, setShowLiveMap] = useState(false)

  useEffect(() => {
    setShowLiveMap(activeTab === 'map')
  }, [activeTab])

  // PWA manifest shortcuts: /entrenamatch/?tab=home | ?tab=map | legacy ?tab=explore&map=1 â†’ map tab
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const rawTab = params.get('tab')
      if (rawTab === 'messages') {
        navigateTab('red')
        setRedSubTab('messages')
      } else if (rawTab === 'matches') {
        navigateTab('red')
        setRedSubTab('matches')
      } else {
        const tabFromUrl = parseTabFromUrl(window.location.search)
        if (params.get('map') === '1' && tabFromUrl !== 'map') {
          navigateTab('map')
        } else if (tabFromUrl) {
          navigateTab(tabFromUrl)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const target = parseAppDeepLink(window.location.search)
      if (!target) return
      setTimeout(() => {
        applyNotificationNavigationRef.current?.(target)
        clearAppDeepLinkParams(['chat', 'sync', 'session', 'profile', 'push', 'name', 'userId', 'groupChatId'])
      }, 400)
    } catch {}
  }, [])

  const [firestoreCityStats, setFirestoreCityStats] = useState<import('./services/cityWeeklyStats').CityWeeklyStatsDoc | null>(null)
  const [derbyHomeStats, setDerbyHomeStats] = useState<import('./services/cityWeeklyStats').CityWeeklyStatsDoc | null>(null)
  const [derbyAwayStats, setDerbyAwayStats] = useState<import('./services/cityWeeklyStats').CityWeeklyStatsDoc | null>(null)
  const [mapForceTick, setMapForceTick] = useState(0) // tiny trigger so map re-renders when toggling partners layer
  const [isTogglingLive, setIsTogglingLive] = useState(false) // prevent double-tap and show loading on the live toggle button (fixes stuck click)
  const isTogglingLiveRef = useRef(false)
  useEffect(() => {
    if (!isTogglingLive) return
    const t = window.setTimeout(() => setIsTogglingLive(false), 8000)
    return () => window.clearTimeout(t)
  }, [isTogglingLive])
  // Ignore stale own-profile snapshots right after we write trainingNow (prevents instant revert)
  const pendingLiveWriteRef = useRef<{ trainingNow: boolean; at: number } | null>(null)
  const postLiveSideEffectsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => { isTogglingLiveRef.current = isTogglingLive }, [isTogglingLive])

  const userLocationRef = useRef(userLocation)
  useEffect(() => { userLocationRef.current = userLocation }, [userLocation])

  // Refs for current auth uid and blocked to avoid stale closures in onSnapshot callbacks (critical for live status skip-self and filtering)
  const currentUidRef = useRef<string | null>(null)
  const blockedUsersRef = useRef<string[]>([])
  const gymPulseMapRef = useRef<any>(null) // extracted GymPulseMap handle (centrar, flyTo, getCenter, invalidate)

  useEffect(() => { currentUidRef.current = firebaseUser?.uid || null }, [firebaseUser?.uid])
  useEffect(() => { blockedUsersRef.current = blockedUsers }, [blockedUsers])

  const {
    partnerLocations,
    setPartnerLocations,
    mapPartnerLocations,
    partnerLocationsRef,
    showPartners,
    setShowPartners,
    showAddPartnerForm,
    setShowAddPartnerForm,
    showManagePartners,
    setShowManagePartners,
    editingPartnerId,
    setEditingPartnerId,
    partnerFormName,
    setPartnerFormName,
    partnerFormType,
    setPartnerFormType,
    partnerFormLat,
    setPartnerFormLat,
    partnerFormLng,
    setPartnerFormLng,
    partnerFormAddress,
    setPartnerFormAddress,
    partnerLogoFile,
    setPartnerLogoFile,
    partnerLogoPreview,
    setPartnerLogoPreview,
    isPlacingPartner,
    setIsPlacingPartner,
    isQuickAddPartner,
    setIsQuickAddPartner,
    isPlacingPartnerRef,
    isQuickAddPartnerRef,
    showAddPartnerFormRef,
    isDeveloper,
    showDevLogin,
    setShowDevLogin,
    devPassword,
    setDevPassword,
    loginAsDeveloper,
    logoutDeveloper,
    openAddPartner,
    openManagePartners,
    startEditPartner,
    cancelPartnerForm,
    handlePartnerEditFromMap,
    handlePartnerLogoSelect,
    uploadPartnerLogoIfNeeded,
    addPartnerAtCurrentCenter,
    reloadPartners,
  } = usePartnerLocations({
    isDemoMode,
    db,
    storage,
    firebaseUser,
    userLocation,
    activeTab,
    showLiveMap,
    setActiveTab,
    setShowLiveMap,
    setMapForceTick,
    gymPulseMapRef,
    triggerHaptic,
  })

  // Zone colors shared for map markers and interactive legend (sigue con todo el mapa)
  const mapZoneColors: Record<string, string> = {
    'ViÃ±a del Mar': '#22c55e',
    'Santiago': '#FF671F',
    'ValparaÃ­so': '#3b82f6',
    'Concon': '#a855f7',
    default: '#eab308'
  }
  const startSyncRef = useRef<((partnerId: string, partnerName: string) => any) | null>(null)
  const loadActiveSyncCountRef = useRef<() => Promise<void>>(async () => {})
  const applyNotificationNavigationRef = useRef<
    ((target: NotificationNavTarget, partnerNameHint?: string) => void) | null
  >(null)
  const currentUserRef = useRef<CurrentUser | null>(null)
  const showFullProfileRef = useRef<((profile: any) => void) | null>(null)
  const latestRealProfilesRef = useRef<any[]>([])

  // Persist map open preference (nice for power users who like the radar always visible)
  useEffect(() => {
    try {
      if (activeTab === 'map') {
        localStorage.setItem('entrenamatch_show_map', '1')
      } else {
        localStorage.removeItem('entrenamatch_show_map')
      }
    } catch {}
  }, [activeTab])

  // ============================================================
  // REAL MULTI-USER STATE - DECLARED AS EARLY AS POSSIBLE TO AVOID TDZ
  // ============================================================

  const [realProfiles, setRealProfiles] = useState<Profile[]>([])

  const {
    mapNearOnly,
    setMapNearOnly,
    mapMyGymOnly,
    setMapMyGymOnly,
    selectedMapZone,
    setSelectedMapZone,
    showOnlyNetwork,
    setShowOnlyNetwork,
    devTestLives,
    liveFromPresenceRef,
    liveFromProfilesQueryRef,
    publishLiveSnapshot,
    buildSelfLiveEntry,
    liveUsersActive,
    liveTrainingNow,
    mapLiveTrainingNow,
    liveCountForUI,
    isUserLive,
    zoneLiveCounts,
    spawnDevTestLives,
    clearDevTestLives,
  } = useLiveMapPipeline({
    isDemoMode,
    db,
    isFirebaseConfigured,
    firebaseUserUid: firebaseUser?.uid,
    effectiveUserId,
    currentUser,
    userLocation,
    blockedUsers,
    syncBonds,
    isDeveloper,
    showLiveMap,
    activeTab,
    showPartners,
    partnerLocationsLength: partnerLocations.length,
    mapForceTick,
    setMapForceTick,
    realProfiles,
    setRealProfiles,
    SEED_PROFILES,
    saveUser,
    gymPulseMapRef,
    latestRealProfilesRef,
    currentUidRef,
    blockedUsersRef,
    liveUsersActiveRef,
    isTogglingLiveRef,
    pendingLiveWriteRef,
    currentUserRef,
    appVisible,
  })

  const {
    dailyPulse,
    setDailyPulse,
    dailyPulseRef,
    showDailyPulseBanner,
    setShowDailyPulseBanner,
    checkAndUpdateDailyPulse,
    refreshDailyPulse,
    completeDailyChallenge,
    awardConstancy,
  } = useDailyPulse({
    currentUser,
    currentUserRef,
    syncBonds,
    networkPower: networkStats.networkPower,
    saveUserWithRealSyncRef,
    setNotifications,
    createProfilePostRef,
    triggerConfettiRef,
    bridgeRef: dailyPulseBridgeRef,
  })

  const [lastSync, setLastSync] = useState<Date | null>(null)

  const {
    matches,
    setMatches,
    messages,
    setMessages,
    activeChat,
    setActiveChat,
    realMatches,
    setRealMatches,
    realChatMessages,
    setRealChatMessages,
    chatUnreads,
    setChatUnreads,
    chatPartnerTyping,
    totalChatUnreads,
    isRealChatId,
    sendRealMessage,
    loadRealChatMessages,
    loadRealMatches,
    saveMessages,
    saveMatches,
    seenChatMsgIdsRef,
    justMatchedLocallyRef,
    clearChatOnLogout,
    persistSeen,
  } = useChatSession({
    isDemoMode,
    db,
    firebaseUserUid: firebaseUser?.uid,
    realProfiles,
    SEED_PROFILES,
    latestRealProfilesRef,
    chatScrollRef,
    setLastSync,
    addNotification: addNotificationRef,
    onIncomingMessageRef: chatIncomingRef,
    onLoadProfilePostsRef: loadProfilePostsRef,
    activeTab,
    appVisible,
  })

  useEffect(() => {
    setActiveChatBridgeRef.current = setActiveChat
    activeChatRuntimeRef.current = activeChat
  }, [setActiveChat, activeChat])

  const matchesRef = useRef<string[]>([])
  const realMatchesRef = useRef<string[]>([])
  useEffect(() => {
    matchesRef.current = matches
  }, [matches])
  useEffect(() => {
    realMatchesRef.current = realMatches
  }, [realMatches])

  const getPinnedPartnerIds = useCallback((): string[] => {
    const ids = new Set<string>([
      ...matchesRef.current,
      ...realMatchesRef.current,
      ...Object.keys(syncBondsRef.current || {}),
    ])
    const chatId = activeChatRuntimeRef.current
    if (chatId && !isSeedProfileId(chatId)) ids.add(chatId)
    return Array.from(ids).filter(Boolean)
  }, [])

  const {
    isLoadingFeed,
    feedShowPinnedOnly,
    setFeedShowPinnedOnly,
    feedSearch,
    setFeedSearch,
    feedOnlyReal,
    setFeedOnlyReal,
    feedOnlyLive,
    setFeedOnlyLive,
    feedMaxProfiles,
    setFeedMaxProfiles,
    feedDisplayLimit,
    setFeedDisplayLimit,
    hasMoreGlobalFeed,
    feedPhotoModal,
    setFeedPhotoModal,
    feedReactions,
    setFeedReactions,
    showFeedPostModal,
    setShowFeedPostModal,
    feedPostText,
    setFeedPostText,
    feedPostPhoto,
    setFeedPostPhoto,
    feedPhotoUploading,
    setFeedPhotoUploading,
    feedPhotoUploadProgress,
    setFeedPhotoUploadProgress,
    recentlyPublishedPostId,
    setRecentlyPublishedPostId,
    feedPublishing,
    setFeedPublishing,
    showFeedPublishSuccess,
    setShowFeedPublishSuccess,
    loadGlobalFeed,
  } = useFeedState({
    isDemoMode,
    db,
    realProfiles,
    setProfilePosts,
    loadProfilePostsRef,
    setLastSync,
  })

  const openCommunityMuro = useCallback(
    (opts?: { prefill?: string; openPublish?: boolean }) => {
      navigateTab('home')
      setHomeSubTab('feed')
      setFeedMaxProfiles(15)
      setFeedDisplayLimit(10)
      void loadGlobalFeed()
      if (opts?.prefill) setFeedPostText(opts.prefill)
      if (opts?.openPublish) setShowFeedPostModal(true)
    },
    [
      navigateTab,
      loadGlobalFeed,
      setFeedMaxProfiles,
      setFeedDisplayLimit,
      setFeedPostText,
      setShowFeedPostModal,
    ]
  )

  const unreadNotifications = notifications.filter((n) => !n.read).length
  const totalSessionUnreads = Object.values(sessionUnreads).reduce(
    (sum, n) => sum + (n || 0),
    0
  )

  const { realSessions, setRealSessions, loadRealSessions } = useRealSessions(db, {
    isDemoMode,
    firebaseUid: firebaseUser?.uid,
    onSync: setLastSync,
  })

  // Merge local + real sessions, deduping by id so real cross-user sessions are always visible
  const displaySessions = (() => {
    if (isDemoMode) return sessions
    const all = [...sessions, ...realSessions]
    const seen = new Set<string>()
    return all.filter(s => {
      if (seen.has(s.id)) return false
      seen.add(s.id)
      return true
    })
  })()

  // Stable key for "my sessions" to setup bg message listeners only when the set of sessions I participate in changes
  const myGroupSessionIdsKey = useMemo(() => {
    const ids = displaySessions
      .filter(s => (s.participants || []).includes(effectiveUserId) || s.creatorId === effectiveUserId)
      .map(s => s.id)
      .sort();
    return ids.join(',');
  }, [displaySessions, effectiveUserId]);

  const knownSessionIds = useMemo(
    () => new Set(displaySessions.map((s) => s.id)),
    [displaySessions]
  )

  const { applyNotificationNavigation, openMessageNotificationTarget } = useNotificationRouter({
    realProfiles,
    seedProfiles: SEED_PROFILES,
    knownSessionIds,
    startSyncRef,
    navigationRef: applyNotificationNavigationRef,
    actions: {
      setShowNotifications,
      setActiveTab,
      setRedSubTab,
      navigateTab,
      setShowDailyPulseBanner,
      setShowLiveModal,
      setActiveChat,
      setChatUnreads,
      setShowGroupChatModalFor,
      setSessionUnreads,
      setSelectedSquad,
      setShowSyncArena,
      setTrainerCoachInitialTab,
      setShowTrainerCoach,
      setMarketplaceScreenMode,
      setShowMarketplace,
      setShowFullProfile,
    },
  })

  // Remaining profiles (not swiped) - Real Firestore profiles + Seed profiles (hybrid for Pre-Alpha)
  // Hoisted early (right after real multi-user state + displaySessions) so that all later effects, JSX, and discovery logic (deck, map, feed, live notifs) see the declarations before any code that might reference them during render or effect setup. Prevents TDZ for remainingProfiles, liveTrainingNow, zoneLiveCounts, feedComputation.
  const remainingProfiles = useMemo(() => {
    const swiped = new Set([...likedIds, ...passedIds])

    // Real accounts: Firestore profiles only â€” seeds stay in demo/onboarding (fase 184).
    const citySeeds = isDemoMode ? filterSeedsForCity(SEED_PROFILES, currentUser?.city) : []
    const allProfiles: Profile[] = [
      ...realProfiles,
      ...citySeeds.filter((s) => !realProfiles.some((r) => r.id === s.id)),
    ]
    
    // Remove duplicates (if a real user has same id as a seed - unlikely but safe)
    const unique = new Map<string, Profile>()
    allProfiles.forEach(p => {
      if (!unique.has(p.id)) unique.set(p.id, p)
    })
    
    return Array.from(unique.values()).filter(p => {
      if (swiped.has(p.id)) return false
      if (isDeletedProfile(p)) return false
      return true
    })
  }, [likedIds, passedIds, realProfiles, currentUser?.city, isDemoMode])

  // Prevents (now - Timestamp) producing NaN which would drop live users from GymPulse lists.
  const normalizeTrainingSince = (val: any): number | undefined => normalizeTrainingSinceMs(val)

  // Feed computation lifted to top-level useMemo so hook is ALWAYS called in the same order (fixes React #310 "Rendered more hooks than during the previous render" when switching tabs).
  // The previous inline IIFE inside {activeTab==='feed' && ...} was conditionally executing the useMemo hook â†’ violation.
  const feedComputation = useFeedPipeline({
    profilePosts,
    effectiveUserId,
    syncBonds,
    liveUsersActive,
    userLocation,
    realProfiles,
    currentUser,
    feedShowPinnedOnly,
    feedOnlyReal,
    feedOnlyLive,
    feedSearch,
    feedDisplayLimit,
    isSeedProfileId,
    recentlyPublishedPostId,
  })
  realtimeStats.lastFeedComputeMs = feedComputation.computeMs

  // Filtered deck (with distance support + blocking)
  // Polish: sort by best compatibility first (improves "matching quality" â€” high compat + close appear at top of swipe)
  // Hoisted early with the other discovery memos.
  const deck = useExploreDeck(
    remainingProfiles,
    filters,
    userLocation,
    blockedUsers,
    currentUser,
    liveUsersActive,
    syncBonds,
    isSeedProfileId
  )

  // Visible cards (top 3 for stack effect)
  const visibleCards = deck.slice(0, 3)

  // Current chatting profile (supports real + seed)
  const chatProfile = activeChat 
    ? [...SEED_PROFILES, ...realProfiles].find(p => p.id === activeChat) 
    : null

  const missingMatchPartnerIds = useMemo(() => {
    const byId = new Map(realProfiles.map((p) => [p.id, p]))
    return [...new Set([...matches, ...realMatches])].filter((id) => {
      if (!id || isDemoMode || isSeedProfileId(id)) return false
      const profile = byId.get(id)
      if (!profile) return true
      return isIncompleteMatchProfile(profile)
    })
  }, [matches, realMatches, realProfiles, isDemoMode])

  // Matches profiles (supports real profiles from Firestore + seeds)
  const matchProfiles = useMemo(() => {
    const seedPool = isDemoMode ? SEED_PROFILES : []
    const all = [...seedPool, ...realProfiles]
    const combinedMatchIds = Array.from(new Set([...matches, ...realMatches]))
    return combinedMatchIds
      .map((id) => {
        const found = all.find((p) => p.id === id)
        if (found) return found
        if (isDemoMode || isSeedProfileId(id)) return null
        return null
      })
      .filter((p): p is Profile => !!p && !isDeletedProfile(p))
  }, [matches, realMatches, realProfiles, isDemoMode])

  const teamMatchIds = useMemo(
    () => Array.from(new Set([...matches, ...realMatches])),
    [matches, realMatches]
  )

  // Phase A home: team strip (matches + sync partners, real people first)
  const homeTeamMembers = useMemo(() => {
    const ids = new Set<string>()
    Object.keys(syncBonds || {}).forEach((id) => {
      if (!isSeedProfileId(id)) ids.add(id)
    })
    matchProfiles.forEach((p) => {
      if (!isSeedProfileId(p.id)) ids.add(p.id)
    })

    const members = Array.from(ids).map((id) => {
      const profile =
        realProfiles.find((p) => p.id === id) ||
        SEED_PROFILES.find((p) => p.id === id) ||
        matchProfiles.find((p) => p.id === id)
      const live = isUserLive(id)
      const lastLive = profile?.lastLiveDate
      const status = getTeamMemberStatus(live, lastLive)
      return {
        id,
        name: profile?.name || 'Socio',
        status,
        lastLiveLabel: live ? undefined : formatLastLiveLabel(lastLive),
        isBond: !!syncBonds[id],
      }
    })

    return sortTeamMembers(members).slice(0, 6)
  }, [syncBonds, matchProfiles, realProfiles, isUserLive])

  const homeWeekDays = useMemo(
    () => buildWeekDayStatuses(weekLiveDays).map(({ label, trained, isToday }) => ({ label, trained, isToday })),
    [weekLiveDays]
  )

  const homeWeekTrainedCount = weekLiveDays.length

  const homeLoggedSessionsCount = useMemo(
    () => countLoggedSessionsInWeek(entrenoRecentWorkouts),
    [entrenoRecentWorkouts]
  )

  const homeWeeklyPactProgress = useMemo(
    () =>
      computeWeeklyPactProgress(
        (currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact,
        homeWeekTrainedCount,
        currentUser?.weekStats,
        homeLoggedSessionsCount
      ),
    [
      (currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact,
      homeWeekTrainedCount,
      currentUser?.weekStats,
      homeLoggedSessionsCount,
    ]
  )

  const pactCompleteToastRef = useRef(false)
  useEffect(() => {
    if (homeWeeklyPactProgress.isComplete && !pactCompleteToastRef.current) {
      pactCompleteToastRef.current = true
      toast.success('Semana sellada', {
        description: 'Live + Sync + Logs â€” meta semanal cumplida con tu equipo',
      })
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.55 } })
      } catch {}
      awardConstancy(25, 'Meta semanal')
    }
    if (!homeWeeklyPactProgress.isComplete) {
      pactCompleteToastRef.current = false
    }
  }, [homeWeeklyPactProgress.isComplete])

  const pactReminderToastRef = useRef<string | null>(null)
  useEffect(() => {
    if (activeTab !== 'home') return
    if (!homeWeeklyPactProgress.pledged || homeWeeklyPactProgress.isComplete) return
    const msg = buildPactReminderMessage(homeWeeklyPactProgress)
    if (!msg) return
    const today = getTodayStr()
    const key = `pact_reminder_${homeWeeklyPactProgress.weekKey}_${today}`
    if (pactReminderToastRef.current === key) return
    try {
      if (localStorage.getItem(`entrenamatch_${key}`)) return
      localStorage.setItem(`entrenamatch_${key}`, '1')
    } catch {
      /* ignore */
    }
    pactReminderToastRef.current = key
    toast(msg, { description: 'Cierra la semana con live, sync y Entreno de Hoy' })
  }, [activeTab, homeWeeklyPactProgress])

  useEffect(() => {
    setPactReminderDismissed(false)
  }, [homeWeeklyPactProgress.weekKey, homeWeeklyPactProgress.isComplete])

  const handleWeeklyPactPledge = useCallback(
    async (partial: {
      liveDaysTarget: number
      syncSessionsTarget: number
      partnerId?: string
      partnerName?: string
    }) => {
      const pact = {
        ...buildDefaultPact(partial.partnerId, partial.partnerName),
        liveDaysTarget: partial.liveDaysTarget,
        syncSessionsTarget: partial.syncSessionsTarget,
        partnerId: partial.partnerId,
        partnerName: partial.partnerName,
      }
      const updated = { ...currentUser, weeklyPact: pact } as CurrentUser & { weeklyPact: typeof pact }
      saveUser(updated as CurrentUser)
      currentUserRef.current = updated
      setShowPactWizard(false)
      if (!isDemoMode && firebaseUser?.uid) {
        try {
          await updateUserProfile(firebaseUser.uid, { weeklyPact: pact } as any)
        } catch (e) {
          console.warn('weeklyPact persist failed', e)
        }
      }
      triggerHaptic('success')
      toast.success('Meta fijada', {
        description: `${pact.liveDaysTarget} dÃ­as live Â· ${pact.syncSessionsTarget} sync Â· ${pact.loggedSessionsTarget ?? 3} logs esta semana`,
      })
    },
    [currentUser, isDemoMode, firebaseUser?.uid, saveUser]
  )

  const homeCityNorm = normalizeCity(currentUser?.city)

  const homeLocalLeaderboard = useMemo(() => {
    if (!homeCityNorm) return []
    return buildCityLeaderboard(realProfiles as Profile[], homeCityNorm, {
      userId: effectiveUserId,
      name: currentUser?.name || 'TÃº',
      stats: currentUser?.weekStats,
      liveStreak: currentUser?.liveStreak,
      showOnLeaderboard: currentUser?.showOnLeaderboard,
    })
  }, [
    realProfiles,
    homeCityNorm,
    effectiveUserId,
    currentUser?.name,
    currentUser?.weekStats,
    currentUser?.liveStreak,
    currentUser?.showOnLeaderboard,
  ])

  const homeCityChallenge = useMemo(() => {
    if (!homeCityNorm) return null
    return buildCityChallenge(
      realProfiles as Profile[],
      homeCityNorm,
      currentUser?.city || '',
      currentUser?.weekStats,
      effectiveUserId
    )
  }, [realProfiles, homeCityNorm, currentUser?.city, currentUser?.weekStats, effectiveUserId])

  const homeCityChallengeMerged = useMemo(
    () => mergeCityChallengeWithFirestore(homeCityChallenge, firestoreCityStats),
    [homeCityChallenge, firestoreCityStats]
  )

  const homeCityChallengeV2 = useMemo(() => {
    if (!homeCityChallengeMerged || !homeCityNorm) return null
    const totals = aggregateCityTotals(realProfiles as Profile[])
    return enrichCityChallengeV2(homeCityChallengeMerged, homeCityNorm, totals)
  }, [homeCityChallengeMerged, homeCityNorm, realProfiles])

  const homeCityDerbyLive = useMemo(() => {
    const totals = aggregateCityTotals(realProfiles as Profile[])
    const client = aggregateDerbyClientMinutes(totals)
    return buildCityDerby(
      derbyHomeStats,
      derbyAwayStats,
      client,
      currentUser?.city,
      getWarEventKey()
    )
  }, [derbyHomeStats, derbyAwayStats, realProfiles, currentUser?.city])

  const homeCityDerby = useMemo(() => {
    if (isZoneScoringActive()) return homeCityDerbyLive
    const warKey = getWarEventKey()
    return loadFrozenWarDerby(warKey) ?? homeCityDerbyLive
  }, [homeCityDerbyLive])

  useEffect(() => {
    if (isZoneScoringActive()) {
      notifyDerbyLeaderChange(homeCityDerbyLive)
      return
    }
    const warKey = getWarEventKey()
    if (!loadFrozenWarDerby(warKey)) {
      freezeWarDerbyState(homeCityDerbyLive)
      const snap = recordDerbyWeekSnapshot(homeCityDerbyLive)
      if (snap && db && !isDemoMode) {
        void persistDerbyWeekToFirestore(db, snap)
      }
    }
  }, [homeCityDerbyLive, db, isDemoMode])

  const homeGymLeaderboard = useMemo(() => {
    const gymId = currentUser?.gymCheckIn?.gymId
    if (!gymId || !isGymCheckInFresh(currentUser?.gymCheckIn)) return []
    return buildGymLeaderboard(realProfiles as Profile[], gymId, {
      userId: effectiveUserId,
      name: currentUser?.name || 'TÃº',
      stats: currentUser?.weekStats,
      liveStreak: currentUser?.liveStreak,
      gymCheckIn: currentUser?.gymCheckIn,
      showOnLeaderboard: currentUser?.showOnLeaderboard,
    })
  }, [
    realProfiles,
    currentUser?.gymCheckIn,
    effectiveUserId,
    currentUser?.name,
    currentUser?.weekStats,
    currentUser?.liveStreak,
    currentUser?.showOnLeaderboard,
  ])

  const homeNearestGym = useMemo(() => {
    const lat = userLocation?.lat ?? currentUser?.lat
    const lng = userLocation?.lng ?? currentUser?.lng
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return null
    const gyms = partnersForMap(partnerLocations || [], isDemoMode).map((p: any) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      address: p.address,
      city: p.city,
    }))
    return findNearestGym(gyms, Number(lat), Number(lng))
  }, [userLocation, currentUser?.lat, currentUser?.lng, partnerLocations, isDemoMode])

  const homeGymLiveCount = useMemo(() => {
    const gymId = currentUser?.gymCheckIn?.gymId
    if (!gymId || !isGymCheckInFresh(currentUser?.gymCheckIn)) return 0
    return countLiveAtGym(liveUsersActive, gymId)
  }, [currentUser?.gymCheckIn, liveUsersActive])

  const homeMyLeaderboardRank = useMemo(
    () => findLeaderboardRank(homeLocalLeaderboard, effectiveUserId),
    [homeLocalLeaderboard, effectiveUserId]
  )

  const homeCityLiveCount = useMemo(() => {
    if (!homeCityNorm) return 0
    return countLiveInCity(liveUsersActive, homeCityNorm)
  }, [homeCityNorm, liveUsersActive])

  const mapMyGymId = isGymCheckInFresh(currentUser?.gymCheckIn)
    ? currentUser?.gymCheckIn?.gymId ?? null
    : null

  const cityEngagementRealtime = shouldRunCityEngagementListeners(activeTab, appVisible)

  // Real-time city challenge aggregate (Firestore) â€” Home tab only
  useEffect(() => {
    if (isDemoMode || !db || !homeCityNorm || !cityEngagementRealtime) {
      if (!cityEngagementRealtime) setFirestoreCityStats(null)
      return undefined
    }
    const docId = cityStatsDocId(homeCityNorm, getWeekKey())
    return attachCityWeeklyStatsListener(db, docId, setFirestoreCityStats)
  }, [isDemoMode, db, homeCityNorm, cityEngagementRealtime])

  useEffect(() => {
    if (isDemoMode || !db || !cityEngagementRealtime) {
      if (!cityEngagementRealtime) {
        setDerbyHomeStats(null)
        setDerbyAwayStats(null)
      }
      return undefined
    }
    const weekKey = getWarEventKey()
    return attachCityDerbyListeners(db, weekKey, (home, away) => {
      setDerbyHomeStats(home)
      setDerbyAwayStats(away)
    })
  }, [isDemoMode, db, cityEngagementRealtime])

  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid || !currentUser?.city) return
    void touchPilotActivity(db, { uid: firebaseUser.uid, city: currentUser.city })
  }, [isDemoMode, db, firebaseUser?.uid, currentUser?.city])

  // Celebrate city challenge completion once per week (client-side)
  useEffect(() => {
    if (!homeCityChallengeMerged || homeCityChallengeMerged.progressPct < 100 || !homeCityNorm) return
    const storageKey = `entrenamatch_city_done_${homeCityChallengeMerged.weekKey}_${homeCityNorm}`
    try {
      if (localStorage.getItem(storageKey)) return
      localStorage.setItem(storageKey, '1')
      toast.success(`Â¡Reto completado en ${homeCityChallengeMerged.cityLabel}!`, {
        description: `${homeCityChallengeMerged.targetMinutes} min live+sync esta semana â€” la ciudad lo logrÃ³ ðŸ†`,
      })
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 } })
      setShowCityCelebration(true)
      try {
        localStorage.setItem(`entrenamatch_city_badge_${homeCityChallengeMerged.cityLabel}`, '1')
      } catch { /* ignore */ }
    } catch {}
  }, [homeCityChallengeMerged, homeCityNorm])

  useEffect(() => {
    const ref = parseReferralFromUrl()
    if (ref) {
      try { localStorage.setItem('entrenamatch_referral', ref) } catch { /* ignore */ }
      toast.success('InvitaciÃ³n de gym recibida', { description: `CÃ³digo: ${ref}` })
    }
  }, [])
  const [feedbackType, setFeedbackType] = useState<'bug' | 'idea' | 'ux' | 'other'>('idea')
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackText, setFeedbackText] = useState('')
  const [myFeedbacks, setMyFeedbacks] = useState<any[]>([])
  const [loadingMyFeedbacks, setLoadingMyFeedbacks] = useState(false)

  const [isSyncingProfile, setIsSyncingProfile] = useState(false)

  // Google Play Integrity (app + device attestation). Critical for closed beta security.
  const [integrityChecking, setIntegrityChecking] = useState(false)
  const [lastIntegrity, setLastIntegrity] = useState<any>(null)
  const [testIntegrityNonce, setTestIntegrityNonce] = useState('')

  // Live tick for "hace Xs" relative times (polish: updates empty states, headers, sync indicators without manual refresh)
  const [timeTick, setTimeTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTimeTick(t => t + 1), 30000) // every 30s
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    homeCityRef.current = (currentUser?.city || '').trim()
  }, [currentUser?.city])

  const profilesRealtime = shouldRunProfilesListener(activeTab, appVisible)

  // Scoped profiles listener — all city query terms; paused on Profile tab / background.
  useEffect(() => {
    if (isDemoMode || !db || !isFirebaseConfigured || !profilesRealtime) return undefined

    let unsub: (() => void) | null = null
    const city = homeCityRef.current || currentUser?.city || ''
    const country = currentUser?.country || ''

    unsub = attachDiscoveryProfilesListener(db, {
      city,
      country,
      limit: PROFILE_LIST_LIMIT,
      excludeUid: currentUidRef.current || firebaseUser?.uid,
      blockedIds: blockedUsersRef.current,
      hideBetaBot: shouldHideBetaBot,
      onProfiles: (profiles) => {
        setDiscoveryReady(true)
        setRealProfiles((prev) =>
          mergeDiscoveryWithPinnedPartners(profiles, prev, getPinnedPartnerIds())
        )
      },
      onError: () => {
        loadRealProfiles().catch(() => {})
      },
    })
    bumpRealtimeStat('profileListeners', 1)

    return () => {
      if (unsub) {
        unsub()
        bumpRealtimeStat('profileListeners', -1)
      }
    }
  }, [
    isDemoMode,
    db,
    isFirebaseConfigured,
    firebaseUser?.uid,
    blockedUsers,
    currentUser?.city,
    currentUser?.country,
    profilesRealtime,
  ])

  // Refresh discovery pool after onboarding / profile city change.
  useEffect(() => {
    if (isDemoMode || showOnboarding || !db || !firebaseUser?.uid) return
    if (!currentUser?.name || !currentUser?.city) return
    setDiscoveryReady(false)
    loadRealProfiles().catch(() => {})
  }, [showOnboarding, firebaseUser?.uid, currentUser?.city, currentUser?.name, isDemoMode, db])

  // Global silent sync â€” pull-to-refresh + tab focus (Fase 32)
  const silentRefreshReal = async (opts?: { includeChats?: boolean; includeFeed?: boolean }) => {
    if (isDemoMode) return
    setIsLoadingMatches(true)
    if (opts?.includeChats) setIsLoadingChats(true)
    try {
      await Promise.all([
        loadRealProfiles(),
        loadRealMatches(),
        loadRealSessions(),
        loadActiveSyncCountRef.current(),
        fetchMissingMatchPartners(),
      ])
      if (opts?.includeChats) {
        const matchIds = await loadRealMatches()
        for (const id of matchIds) {
          await loadRealChatMessages(id).catch(() => {})
        }
      }
      if (opts?.includeFeed && activeTab === 'home') {
        await loadGlobalFeed().catch(() => {})
      }
      setLastSync(new Date())
    } finally {
      setIsLoadingMatches(false)
      if (opts?.includeChats) setIsLoadingChats(false)
    }
  }

  const refreshAllReal = async () => {
    await silentRefreshReal({ includeFeed: activeTab === 'home' })
    toast.success('Datos actualizados')
  }

  // Silent sync al entrar en tabs clave (Fase 32)
  useEffect(() => {
    if (isDemoMode || showOnboarding) return
    const onRedMatches =
      activeTab === 'red' && redSubTab === 'matches'
    const onRedMessages =
      activeTab === 'red' && redSubTab === 'messages'
    if (activeTab === 'explore' || onRedMatches) {
      silentRefreshReal().catch(() => {})
    } else if (onRedMessages && !activeChat) {
      silentRefreshReal({ includeChats: true }).catch(() => {})
    }
  }, [activeTab, activeChat, redSubTab, isDemoMode, showOnboarding])

  // Google Play Integrity check
  // Call this on login, before sensitive actions (live toggle, profile create, etc.)
  // The raw token should go to a server for verification to produce the full verdict JSON you showed.
  const checkPlayIntegrity = async (showToast = true) => {
    setIntegrityChecking(true)
    try {
      const nonce = testIntegrityNonce.trim() || undefined
      const res = await requestPlayIntegrityToken(nonce)
      setLastIntegrity(res)

      if (res.token) {
        if (showToast) {
          toast.success('Token de integridad obtenido de Google Play', {
            description: nonce 
              ? `Usando nonce de prueba de la consola. EnvÃ­alo a tu backend para obtener el veredicto completo (JSON como el que me pasaste).`
              : 'EnvÃ­alo a tu backend para verificar y obtener el JSON completo de veredictos (como el que me pasaste). Copiado en consola.'
          })
        }
        console.log('%c[Play Integrity] Raw token (send this to server for full verification):', 'color:#22c55e', res.token)
        if (nonce) console.log('%c[Play Integrity] Used test nonce from console:', 'color:#f59e0b', nonce)
        console.log('Expected packageName in verdicts: com.entrenamatch.app')
      } else if (res.simulatedVerdict) {
        if (showToast) {
          toast.success('Integridad simulada (web/demo)', {
            description: 'En la APK nativa instalada desde Play obtendrÃ¡s un token real. El simulado es positivo (LICENSED + PLAY_RECOGNIZED + MEETS_DEVICE_INTEGRITY).'
          })
        }
        console.log('%c[Play Integrity] Simulated positive verdict (web):', 'color:#f59e0b', res.simulatedVerdict)
      } else {
        if (showToast) toast.error('No se pudo obtener integridad', { description: res.error || 'Desconocido' })
      }

      return res
    } catch (e: any) {
      const errRes = { available: false, error: e?.message || 'Error' }
      setLastIntegrity(errRes)
      if (showToast) toast.error('Error verificando con Google Play')
      return errRes
    } finally {
      setIntegrityChecking(false)
    }
  }

  // Enhanced beta feedback loader (Phase 0) - shows tester their own past submissions
  const loadMyFeedbacks = async () => {
    if (!isFirebaseConfigured || !db || !firebaseUser?.uid) {
      setMyFeedbacks([])
      return
    }
    setLoadingMyFeedbacks(true)
    try {
      const fbRef = collection(db, 'betaFeedback')
      const q = query(fbRef, where('userId', '==', firebaseUser.uid), orderBy('createdAt', 'desc'), limit(8))
      const snap = await getDocs(q)
      const list: any[] = []
      snap.forEach((d) => {
        const data = d.data() as any
        list.push({
          id: d.id,
          type: data.type || 'idea',
          rating: data.rating || 0,
          text: data.text || '',
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
          platform: data.platform || 'web',
        })
      })
      setMyFeedbacks(list)
    } catch (e) {
      // Rules may not allow listing yet or index missing; fail soft
      setMyFeedbacks([])
    } finally {
      setLoadingMyFeedbacks(false)
    }
  }

  const loadRealProfiles = async () => {
    if (!isFirebaseConfigured || !db) {
      setRealProfiles([])
      setDiscoveryReady(true)
      return
    }
    try {
      const currentUid = currentUidRef.current || firebaseUser?.uid
      const profiles = await fetchDiscoveryProfiles(db, {
        city: currentUser?.city || homeCityRef.current || '',
        country: currentUser?.country || '',
        limit: PROFILE_LIST_LIMIT,
        excludeUid: currentUid,
        blockedIds: blockedUsersRef.current,
        hideBetaBot: shouldHideBetaBot,
      })

      setRealProfiles((prev) =>
        mergeDiscoveryWithPinnedPartners(profiles, prev, getPinnedPartnerIds())
      )
      const now = new Date()
      setLastSync(now)
      profiles.slice(0, 5).forEach((p) => {
        loadProfilePosts(p.id).catch(() => {})
      })
    } catch (err) {
      console.warn('Could not load real profiles (Firestore may not have data yet):', err)
      setRealProfiles([])
    } finally {
      setDiscoveryReady(true)
    }
  }

  // Real profile sync effect: when we have a real Firebase user, load their rich profile from Firestore
  // and ensure we push any rich local data up if Firestore is minimal
  useEffect(() => {
    if (!firebaseUser?.uid) {
      realProfileSyncedUidRef.current = null
      return
    }
    if (!isDemoMode && realProfileSyncedUidRef.current === firebaseUser.uid) {
      return
    }
    if (!isDemoMode && firebaseUser?.uid) {
      realProfileSyncedUidRef.current = firebaseUser.uid;
      (async () => {
        try {
          const realProfile = await getUserProfile(firebaseUser.uid)
          
          const returning = realProfile ? enrichReturningProfile(realProfile) : null
          if (returning && (returning.name || hasCoreProfileFields(returning))) {
            const resolvedPhotos = resolveProfilePhotos(
              currentUser?.photos,
              realProfile.photos,
              currentUser?.photosUpdatedAt,
              realProfile.photosUpdatedAt
            )
            const merged: CurrentUser = {
              ...currentUser,
              id: 'me' as any,
              name: returning.name || currentUser?.name || '',
              age: returning.age ?? currentUser?.age ?? 25,
              gender: returning.gender || currentUser?.gender || 'hombre',
              city: returning.city || currentUser?.city || '',
              country: returning.country || currentUser?.country || 'Chile',
              bio: returning.bio || currentUser?.bio || '',
              photos: resolvedPhotos,
              photosUpdatedAt: latestPhotosUpdatedAt(
                currentUser?.photosUpdatedAt,
                realProfile.photosUpdatedAt
              ),
              trainingTypes: returning.trainingTypes || currentUser?.trainingTypes || [],
              goals: returning.goals || currentUser?.goals || [],
              level: returning.level || currentUser?.level || 'Intermedio',
              intensity: returning.intensity || currentUser?.intensity || 'Moderado',
              availability: returning.availability || currentUser?.availability || ['Tarde'],
              lat: realProfile.lat || currentUser?.lat || -33.0153,
              lng: realProfile.lng || currentUser?.lng || -71.5528,
              legalConsents: realProfile.legalConsents || currentUser?.legalConsents,
              trainingNow: realProfile.trainingNow,
              trainingNowSince: realProfile.trainingNowSince != null ? realProfile.trainingNowSince : undefined,
              liveStreak: realProfile.liveStreak != null ? realProfile.liveStreak : undefined,
              lastLiveDate: realProfile.lastLiveDate != null ? realProfile.lastLiveDate : undefined,
              liveJoins: realProfile.liveJoins != null ? realProfile.liveJoins : undefined,
              joinedLiveStreak: realProfile.joinedLiveStreak != null ? realProfile.joinedLiveStreak : undefined,
              dailyTrainingStreak: realProfile.dailyTrainingStreak != null ? realProfile.dailyTrainingStreak : undefined,
              dailySynergyStreak: realProfile.dailySynergyStreak != null ? realProfile.dailySynergyStreak : undefined,
              dailyVoiceStreak: realProfile.dailyVoiceStreak != null ? realProfile.dailyVoiceStreak : undefined,
              dailyPulseStreak: realProfile.dailyPulseStreak != null ? realProfile.dailyPulseStreak : undefined,
              momentumPoints: realProfile.momentumPoints != null ? realProfile.momentumPoints : undefined,
              lastDailyPulseDate: realProfile.lastDailyPulseDate != null ? realProfile.lastDailyPulseDate : undefined,
              streakProtectedDate: realProfile.streakProtectedDate || null,
              pulseAmplifiedDate: realProfile.pulseAmplifiedDate || null,
              currentDailyChallenge: realProfile.currentDailyChallenge || undefined,
              retentionLevel: realProfile.retentionLevel || 1,
              retentionXp: realProfile.retentionXp || 0,
              blockedUsers: realProfile.blockedUsers || [],
              trainingSyncWith: realProfile.trainingSyncWith,
              syncStartedAt: realProfile.syncStartedAt != null ? realProfile.syncStartedAt : undefined,
              syncActions: realProfile.syncActions || [],
              syncStreak: realProfile.syncStreak != null ? realProfile.syncStreak : undefined,
              syncBonds: realProfile.syncBonds || {},
              weekStats: realProfile.weekStats || currentUser?.weekStats,
              weeklyPact: isPactForCurrentWeek(realProfile.weeklyPact)
                ? realProfile.weeklyPact
                : currentUser?.weeklyPact,
              showOnLeaderboard:
                realProfile.showOnLeaderboard !== undefined
                  ? realProfile.showOnLeaderboard
                  : currentUser?.showOnLeaderboard,
              gymCheckIn: realProfile.gymCheckIn || currentUser?.gymCheckIn,
              ghostMode: realProfile.ghostMode ?? currentUser?.ghostMode,
              spotifyShareLive: realProfile.spotifyShareLive ?? currentUser?.spotifyShareLive,
              spotifyNowPlaying: realProfile.spotifyNowPlaying ?? currentUser?.spotifyNowPlaying,
              gymSoundAnthem: realProfile.gymSoundAnthem ?? currentUser?.gymSoundAnthem,
              wearableHealthConnected:
                realProfile.wearableHealthConnected ?? currentUser?.wearableHealthConnected,
              wearableHealthPlatform:
                realProfile.wearableHealthPlatform ?? currentUser?.wearableHealthPlatform,
              wearableHealthConnectedAt:
                realProfile.wearableHealthConnectedAt ?? currentUser?.wearableHealthConnectedAt,
              verificationStatus: realProfile.verificationStatus || currentUser?.verificationStatus,
              verificationDate: (realProfile as any).verificationDate ?? currentUser?.verificationDate,
              verificationDocuments: (realProfile as any).verificationDocuments ?? currentUser?.verificationDocuments,
            }
            if (merged.name || hasCoreProfileFields(merged)) {
              saveUser(merged)
              addDebugLog(`Real login: ${merged.name || 'returning'}`)
              // Mirror sync state from self profile
              if (merged.trainingSyncWith) {
                setSyncPartnerId(merged.trainingSyncWith)
                setSyncStartedAt(merged.syncStartedAt || null)
                setSyncActions(merged.syncActions || [])
                setShowSyncArena(true)
              }
              if (merged.syncBonds) {
                setSyncBonds(merged.syncBonds)
              }
              if (merged.blockedUsers && Array.isArray(merged.blockedUsers)) {
                setBlockedUsers(merged.blockedUsers)
                // re-filter profiles after loading blocks
                loadRealProfiles().catch(() => {})
              }
            }
          } else if (
            currentUser &&
            firebaseUser?.uid &&
            isProfileComplete(enrichReturningProfile(currentUser))
          ) {
            // New real user with a completed local profile but no Firestore doc yet â†’ push it up once
            let pushPhotos = filterPersistablePhotos(currentUser.photos)
            if (
              pushPhotos.length === 0 &&
              (currentUser.photos || []).some(isDataUrlPhoto) &&
              db
            ) {
              try {
                pushPhotos = await ensurePersistableProfilePhotos(
                  currentUser.photos || [],
                  uploadProfilePhotoIfNeeded
                )
              } catch (e) {
                console.warn('pushProfile photo upload failed', e)
              }
            }
            const pushProfile: any = {
              name: currentUser.name,
              age: currentUser.age,
              gender: currentUser.gender,
              city: currentUser.city,
              country: currentUser.country,
              bio: currentUser.bio,
              photos: pushPhotos,
              trainingTypes: currentUser.trainingTypes,
              goals: currentUser.goals,
              level: currentUser.level,
              intensity: currentUser.intensity,
              availability: currentUser.availability,
              lat: currentUser.lat,
              lng: currentUser.lng,
              legalConsents: currentUser.legalConsents,
              trainingNow: currentUser.trainingNow,
              trainingSyncWith: currentUser.trainingSyncWith,
              syncStartedAt: currentUser.syncStartedAt,
            };
            if (currentUser.trainingNow) {
              if (currentUser.trainingNowSince !== undefined) {
                pushProfile.trainingNowSince = currentUser.trainingNowSince;
              }
            } else {
              pushProfile.trainingNowSince = null;
            }
            if (currentUser.liveStreak !== undefined) {
              pushProfile.liveStreak = currentUser.liveStreak;
            }
            if (currentUser.lastLiveDate !== undefined) {
              pushProfile.lastLiveDate = currentUser.lastLiveDate;
            }
            if (currentUser.liveJoins !== undefined) {
              pushProfile.liveJoins = currentUser.liveJoins;
            }
            if (currentUser.joinedLiveStreak !== undefined) {
              pushProfile.joinedLiveStreak = currentUser.joinedLiveStreak;
            }
            if ((currentUser as any).streakProtectedDate !== undefined) {
              pushProfile.streakProtectedDate = (currentUser as any).streakProtectedDate;
            }
            if ((currentUser as any).pulseAmplifiedDate !== undefined) {
              pushProfile.pulseAmplifiedDate = (currentUser as any).pulseAmplifiedDate;
            }
            await updateUserProfile(firebaseUser.uid, pushProfile)
            // console.log removed (debug)
          }
        } catch (e) {
          console.warn('Could not load/push real profile from Firestore yet:', e)
        }
      })()
    }
  }, [firebaseUser?.uid, isDemoMode])

  const squadsRealtime = shouldRunSquadsListener(activeTab, appVisible)

  // Squads listener â€” only on Squads tab (perf).
  useEffect(() => {
    if (isDemoMode || !db || !squadsRealtime) return undefined
    const unsub = attachSquadsListener(db, (list) => setSquads(list))
    return unsub
  }, [isDemoMode, db, squadsRealtime])

 // Merge partial profile patches without accidentally killing an active live session
 // (e.g. awardConstancy spreading stale currentUser with trainingNow:false right after going live).
const mergeUserForRealtimeSync = (incoming: CurrentUser, prev: CurrentUser | null): CurrentUser => {
  if (!prev) return incoming

  const explicitLiveOff =
    prev.trainingNow === true &&
    incoming.trainingNow === false &&
    incoming.trainingNowSince === null &&
    (incoming.trainingSyncWith === null || incoming.syncStartedAt === null)

  const explicitLiveOn =
    incoming.trainingNow === true &&
    typeof incoming.trainingNowSince === 'number' &&
    incoming.trainingNowSince > 0

  const explicitSyncStart =
    !!incoming.trainingSyncWith &&
    typeof incoming.syncStartedAt === 'number' &&
    incoming.syncStartedAt > 0

  if (explicitSyncStart) {
    return {
      ...prev,
      ...incoming,
      trainingNow: incoming.trainingNow !== false ? (incoming.trainingNow ?? prev.trainingNow ?? true) : false,
    }
  }

  if (explicitLiveOff || explicitLiveOn) {
    return { ...prev, ...incoming }
  }

  if (!prev.trainingNow) {
    if (
      incoming.trainingNow === true &&
      explicitLiveOn &&
      pendingLiveWriteRef.current?.trainingNow === true
    ) {
      return { ...prev, ...incoming }
    }
    return {
      ...prev,
      ...incoming,
      trainingNow: false,
      trainingNowSince: incoming.trainingNowSince === undefined ? null : incoming.trainingNowSince,
    }
  }

  if (prev.trainingNow && incoming.trainingNow === false) {
    const explicitOffFields =
      incoming.trainingNowSince === null ||
      incoming.trainingSyncWith === null ||
      incoming.syncStartedAt === null
    if (explicitOffFields) {
      return { ...prev, ...incoming }
    }
    const isStalePartial =
      incoming.trainingNowSince === undefined &&
      incoming.trainingSyncWith === undefined &&
      incoming.syncStartedAt === undefined
    if (isStalePartial) {
      return {
        ...prev,
        ...incoming,
        trainingNow: true,
        trainingNowSince: prev.trainingNowSince,
        trainingSyncWith: prev.trainingSyncWith ?? null,
        syncStartedAt: prev.syncStartedAt ?? null,
        syncActions: prev.syncActions ?? incoming.syncActions,
      }
    }
    return { ...prev, ...incoming }
  }

  return { ...prev, ...incoming }
}

  const uploadProfilePhotoIfNeeded = useCallback(async (dataUrl: string): Promise<string> => {
    if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl
    if (isDemoMode) return dataUrl
    if (!firebaseUser?.uid || !storage) {
      throw new Error('No se pudo subir la foto: sesiÃ³n o Storage no disponible')
    }
    try {
      const { ref, uploadString, getDownloadURL } = await import('firebase/storage')
      const path = `profiles/${firebaseUser.uid}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
      const storageRef = ref(storage, path)
      const snap = await uploadString(storageRef, dataUrl, 'data_url')
      return await getDownloadURL(snap.ref)
    } catch (e) {
      console.warn('profile photo storage upload failed', e)
      throw new Error('No se pudo subir la foto de perfil. Revisa conexiÃ³n y permisos.')
    }
  }, [isDemoMode, firebaseUser?.uid])

 // âœ… SOLUCIÃ“N SIMPLE Y ESTABLE - Sin dynamic import problemÃ¡tico
const saveUserWithRealSync = useCallback(async (user: CurrentUser) => {
  // Local aliases â€” avoid minifier name collisions in App chunk (fase 191)
  const publishSnapshot = publishLiveSnapshot
  const mergeLive = mergeLiveUsersById
  const toLiveUser = profileDocToLiveUser

  const sanitizedUser = stripStaleLiveReactivation(
    user,
    currentUserRef.current?.trainingNow,
    pendingLiveWriteRef.current
  ) as CurrentUser

  let merged = mergeUserForRealtimeSync(sanitizedUser, currentUserRef.current)
  const pendingLive = pendingLiveWriteRef.current
  if (
    pendingLive &&
    Date.now() - pendingLive.at < LIVE_PENDING_GUARD_MS &&
    pendingLive.trainingNow === false &&
    merged.trainingNow
  ) {
    merged = {
      ...merged,
      trainingNow: false,
      trainingNowSince: null,
      trainingSyncWith: null,
      syncStartedAt: null,
      liveMotionScore: undefined,
      liveMotionAt: undefined,
      liveMotionIdle: undefined,
      liveActivityState: undefined,
    }
  }
  const priorPhotos = currentUserRef.current?.photos
  const needsPhotoUpload = (merged.photos || []).some(isDataUrlPhoto)

  if (!isDemoMode && firebaseUser?.uid && db) {
    if (needsPhotoUpload) {
      merged = {
        ...merged,
        photos: await ensurePersistableProfilePhotos(
          merged.photos || [],
          uploadProfilePhotoIfNeeded
        ),
      }
    }
  }

  const resolvedPhotosForSave = !isDemoMode && firebaseUser?.uid
    ? resolvePhotosForFirestoreSave(merged.photos, priorPhotos)
    : merged.photos || []

  const photosPersistedChanged = profilePhotosChanged(priorPhotos, resolvedPhotosForSave)

  merged = {
    ...merged,
    photos: resolvedPhotosForSave,
    ...(photosPersistedChanged
      ? { photosUpdatedAt: Date.now() }
      : {}),
  }

  if (!isDemoMode && firebaseUser?.uid) {
    const loc = userLocationRef.current
    const canonLoc = canonicalProfileLocation(merged.city, merged.country, {
      lat: merged.lat ?? loc?.lat,
      lng: merged.lng ?? loc?.lng,
    })
    merged = {
      ...merged,
      city: canonLoc.city,
      country: canonLoc.country,
      lat: canonLoc.lat,
      lng: canonLoc.lng,
    }
  }

  currentUserRef.current = merged
  saveUser(merged);

  if (!isDemoMode && firebaseUser?.uid && db) {
    try {
      const loc = userLocationRef.current
      const goingLive = !!merged.trainingNow
      const profileUpdate: any = {
        name: merged.name,
        age: merged.age,
        gender: merged.gender,
        city: merged.city,
        country: merged.country,
        bio: merged.bio,
        photos: merged.photos,
        photosUpdatedAt: merged.photosUpdatedAt ?? null,
        trainingTypes: merged.trainingTypes,
        goals: merged.goals,
        level: merged.level,
        intensity: merged.intensity,
        availability: merged.availability,
        lat: merged.lat,
        lng: merged.lng,
        trainingNow: goingLive,
        trainingNowSince: goingLive ? (merged.trainingNowSince ?? Date.now()) : null,
        liveStreak: merged.liveStreak ?? null,
        lastLiveDate: merged.lastLiveDate ?? null,
        joinedLiveStreak: merged.joinedLiveStreak ?? null,
        liveJoins: merged.liveJoins ?? null,
        trainingSyncWith: merged.trainingSyncWith ?? null,
        syncStartedAt: merged.syncStartedAt ?? null,
        currentDailyChallenge: merged.currentDailyChallenge,
        lastDailyPulseDate: (merged as any).lastDailyPulseDate ?? null,
        dailyTrainingStreak: (merged as any).dailyTrainingStreak ?? null,
        dailySynergyStreak: (merged as any).dailySynergyStreak ?? null,
        dailyVoiceStreak: (merged as any).dailyVoiceStreak ?? null,
        dailyPulseStreak: (merged as any).dailyPulseStreak ?? null,
        momentumPoints: (merged as any).momentumPoints ?? null,
        retentionLevel: (merged as any).retentionLevel ?? null,
        retentionXp: (merged as any).retentionXp ?? null,
        streakProtectedDate: (merged as any).streakProtectedDate ?? null,
        pulseAmplifiedDate: (merged as any).pulseAmplifiedDate ?? null,
        weekStats: merged.weekStats ?? null,
        weeklyPact: merged.weeklyPact ?? null,
        showOnLeaderboard: merged.showOnLeaderboard !== false,
        gymCheckIn: isGymCheckInFresh(merged.gymCheckIn) ? merged.gymCheckIn : null,
        ghostMode: !!merged.ghostMode,
        spotifyShareLive: !!merged.spotifyShareLive,
        spotifyNowPlaying:
          goingLive && merged.spotifyShareLive ? (merged.spotifyNowPlaying ?? null) : null,
        gymSoundAnthem:
          goingLive && merged.spotifyShareLive ? (merged.gymSoundAnthem ?? null) : null,
        liveMotionScore: goingLive ? (merged.liveMotionScore ?? null) : null,
        liveMotionAt: goingLive ? (merged.liveMotionAt ?? null) : null,
        liveMotionIdle: goingLive ? (merged.liveMotionIdle ?? null) : null,
        liveActivityState: goingLive ? (merged.liveActivityState ?? null) : null,
        verificationStatus: merged.verificationStatus ?? null,
        verificationDate: merged.verificationDate ?? null,
        verificationDocuments: merged.verificationDocuments ?? null,
        legalConsents: merged.legalConsents ?? null,
        wearableHealthConnected: merged.wearableHealthConnected ?? null,
        wearableHealthPlatform: merged.wearableHealthPlatform ?? null,
        wearableHealthConnectedAt: merged.wearableHealthConnectedAt ?? null,
      };

      const cleanProfileUpdate = sanitizeForFirestore(profileUpdate);

      // Optimistic: publish self to live pipeline immediately (before Firestore round-trip)
      if (typeof publishSnapshot === 'function') {
        if (goingLive) {
          const optimistic = toLiveUser(firebaseUser.uid, cleanProfileUpdate as any, { forceLive: true })
          const nextPresence = mergeLive([
            liveFromPresenceRef.current.filter((u) => u.id !== firebaseUser.uid),
            [optimistic],
          ])
          publishSnapshot(nextPresence, liveFromProfilesQueryRef.current)
        } else {
          const nextPresence = liveFromPresenceRef.current.filter((u) => u.id !== firebaseUser.uid)
          publishSnapshot(nextPresence, liveFromProfilesQueryRef.current)
        }
      }

      await updateUserProfile(firebaseUser.uid, cleanProfileUpdate);

      if (merged.city && db) {
        void registerPilotMember(db, {
          uid: firebaseUser.uid,
          city: merged.city,
          displayName: merged.name,
        })
      }

      if (goingLive) {
        await writeLivePresence(
          db,
          buildLivePresencePayload(firebaseUser.uid, { ...merged, ...profileUpdate }, loc),
          sanitizeForFirestore
        )
        await patchLivePresenceGymSound(
          db,
          firebaseUser.uid,
          {
            spotifyShareLive: !!merged.spotifyShareLive,
            spotifyNowPlaying:
              merged.spotifyShareLive && merged.spotifyNowPlaying ? merged.spotifyNowPlaying : null,
            gymSoundAnthem:
              merged.spotifyShareLive && merged.gymSoundAnthem ? merged.gymSoundAnthem : null,
          },
          sanitizeForFirestore
        )
      } else {
        await clearLivePresence(db, firebaseUser.uid)
      }

      console.log('âœ… Profile synced to Firestore', goingLive ? '(LIVE ON)' : '');
      if (
        pendingLiveWriteRef.current &&
        pendingLiveWriteRef.current.trainingNow === merged.trainingNow
      ) {
        pendingLiveWriteRef.current = null
      }
      setMapForceTick((t) => t + 1)
    } catch (e) {
      console.warn('Failed to sync profile to Firestore:', e);
      toast.error('No se pudo sincronizar con el servidor', {
        description: merged.trainingNow
          ? 'Revisa conexiÃ³n. Otros pueden no verte en live hasta que se sincronice.'
          : 'Revisa tu conexiÃ³n e intenta de nuevo.',
      })
      throw e
    }
  }
}, [saveUser, isDemoMode, firebaseUser?.uid, db, updateUserProfile, publishLiveSnapshot, uploadProfilePhotoIfNeeded]);

useEffect(() => {
  saveUserWithRealSyncRef.current = saveUserWithRealSync
}, [saveUserWithRealSync])

  const {
    healthBurnBonus,
    wearableActivity,
    wearableSyncing,
    healthImportHint,
    syncWearableNow,
    handleImportHealthBurn,
    refreshWearableDayBurn,
  } = useWearableFuelIntegration({
    enabled: !isDemoMode && !!firebaseUser?.uid && Capacitor.isNativePlatform(),
    userId: effectiveUserId,
    db: db || null,
    isDemoMode,
    currentUser,
    saveUserWithRealSync,
  })

  const handleLiveMotionSample = useCallback(
    async (result: {
      score: number
      lastAt: number
      idle: boolean
      state: 'active' | 'idle' | 'unknown'
    }) => {
      const base = currentUserRef.current
      const pendingLive = pendingLiveWriteRef.current
      if (
        !base?.trainingNow ||
        (pendingLive?.trainingNow === false && Date.now() - pendingLive.at < LIVE_PENDING_GUARD_MS)
      ) {
        return
      }
      const updated = {
        ...base,
        liveMotionScore: result.score,
        liveMotionAt: result.lastAt,
        liveMotionIdle: result.idle,
        liveActivityState: result.state,
      } as CurrentUser
      currentUserRef.current = updated
      saveUser(updated)
      if (isDemoMode || !firebaseUser?.uid || !db) {
        setMapForceTick((t) => t + 1)
        return
      }
      try {
        const motionPatch = {
          liveMotionScore: result.score,
          liveMotionAt: result.lastAt,
          liveMotionIdle: result.idle,
          liveActivityState: result.state,
        }
        await patchLivePresenceMotion(db, firebaseUser.uid, motionPatch, sanitizeForFirestore)
        await updateUserProfile(firebaseUser.uid, sanitizeForFirestore(motionPatch) as any)
        const optimistic = profileDocToLiveUser(
          firebaseUser.uid,
          { ...updated, trainingNow: true },
          { forceLive: true }
        )
        const nextPresence = mergeLiveUsersById([
          liveFromPresenceRef.current.filter((u) => u.id !== firebaseUser.uid),
          [optimistic],
        ])
        if (typeof publishLiveSnapshot === 'function') {
          publishLiveSnapshot(nextPresence, liveFromProfilesQueryRef.current)
        }
        setMapForceTick((t) => t + 1)
      } catch (e) {
        console.warn('[LiveMotion] sync failed', e)
      }
    },
    [saveUser, isDemoMode, firebaseUser?.uid, db, updateUserProfile, publishLiveSnapshot]
  )

  const getMotionLocation = useCallback(
    () => userLocationRef.current,
    []
  )

  useLiveMotionMonitor({
    enabled: !!currentUser?.trainingNow,
    prevScore: currentUser?.liveMotionScore,
    getLocation: getMotionLocation,
    onSample: handleLiveMotionSample,
  })

  const syncGymSoundToLivePresence = useCallback(
    async (user: CurrentUser) => {
      if (!db || !firebaseUser?.uid || !user.trainingNow) return
      await patchLivePresenceGymSound(
        db,
        firebaseUser.uid,
        {
          spotifyShareLive: !!user.spotifyShareLive,
          spotifyNowPlaying:
            user.spotifyShareLive && user.spotifyNowPlaying ? user.spotifyNowPlaying : null,
          gymSoundAnthem:
            user.spotifyShareLive && user.gymSoundAnthem ? user.gymSoundAnthem : null,
        },
        sanitizeForFirestore
      )
    },
    [db, firebaseUser?.uid]
  )

  const handleSpotifyNowPlaying = useCallback(
    async (nowPlaying: SpotifyNowPlaying | null) => {
      const cu = currentUserRef.current
      if (!cu) return
      const updated = {
        ...cu,
        spotifyNowPlaying: nowPlaying ?? undefined,
      } as CurrentUser
      currentUserRef.current = updated
      saveUser(updated)

      if (isDemoMode || !firebaseUser?.uid || !db) return

      try {
        const gymPatch = {
          spotifyShareLive: !!updated.spotifyShareLive,
          spotifyNowPlaying:
            updated.spotifyShareLive && nowPlaying ? nowPlaying : null,
          gymSoundAnthem:
            updated.spotifyShareLive && updated.gymSoundAnthem ? updated.gymSoundAnthem : null,
        }
        await updateUserProfile(
          firebaseUser.uid,
          sanitizeForFirestore({ spotifyNowPlaying: gymPatch.spotifyNowPlaying }) as any
        )
        if (updated.trainingNow) {
          await patchLivePresenceGymSound(db, firebaseUser.uid, gymPatch, sanitizeForFirestore)
          const optimistic = profileDocToLiveUser(
            firebaseUser.uid,
            { ...updated, trainingNow: true },
            { forceLive: true }
          )
          const nextPresence = mergeLiveUsersById([
            liveFromPresenceRef.current.filter((u) => u.id !== firebaseUser.uid),
            [optimistic],
          ])
          publishLiveSnapshot(nextPresence, liveFromProfilesQueryRef.current)
          setMapForceTick((t) => t + 1)
        }
      } catch (e) {
        console.warn('[GymSound] now playing sync failed', e)
      }
    },
    [
      saveUser,
      isDemoMode,
      firebaseUser?.uid,
      db,
      updateUserProfile,
      publishLiveSnapshot,
    ]
  )

  const handleGymSoundProfileSave = useCallback(
    async (user: Profile) => {
      await saveUserWithRealSync(user as CurrentUser)
      await syncGymSoundToLivePresence(user as CurrentUser)
    },
    [saveUserWithRealSync, syncGymSoundToLivePresence]
  )

  useSpotifyLiveSync({
    enabled: !isDemoMode && !!firebaseUser?.uid,
    isLive: !!currentUser?.trainingNow,
    shareWhileLive: !!currentUser?.spotifyShareLive,
    onNowPlayingChange: handleSpotifyNowPlaying,
  })

  const handleGymCheckIn = useCallback(
    async (gym: { id: string; name: string; lat: number; lng: number }) => {
      if (!currentUser) return
      const gymCheckIn = {
        gymId: gym.id,
        gymName: gym.name,
        lat: gym.lat,
        lng: gym.lng,
        checkedInAt: Date.now(),
      }
      const updated = {
        ...currentUser,
        gymCheckIn,
        lat: gym.lat,
        lng: gym.lng,
      } as CurrentUser
      saveUser(updated)
      try {
        if (!isDemoMode && db && firebaseUser?.uid) {
          await seedPartnerGymIfMissing(db, {
            id: gym.id,
            name: gym.name,
            city: currentUser.city,
          })
          await recordPartnerGymCheckIn(db, {
            userId: effectiveUserId,
            gymId: gym.id,
            gymName: gym.name,
            lat: gym.lat,
            lng: gym.lng,
          })
        }
        await saveUserWithRealSync(updated)
        toast.success(`Check-in en ${gym.name}`, {
          description: 'Tu pin aparecerÃ¡ en el mapa cuando entrenes en vivo',
        })
        setMapForceTick((t) => t + 1)
      } catch {
        toast.error('No se pudo registrar el check-in')
      }
    },
    [currentUser, saveUser, saveUserWithRealSync, isDemoMode, db, firebaseUser?.uid, effectiveUserId]
  )

  const gymDeepLinkHandledRef = useRef(false)
  useEffect(() => {
    if (gymDeepLinkHandledRef.current) return
    const gymId = parseGymIdFromSearch(window.location.search)
    if (!gymId) return
    const partner = resolvePartnerGymById(gymId, partnerLocations || [])
    if (!partner || partner.lat == null || partner.lng == null) return
    gymDeepLinkHandledRef.current = true
    navigateTab('map')
    void handleGymCheckIn({
      id: partner.id,
      name: partner.name,
      lat: Number(partner.lat),
      lng: Number(partner.lng),
    }).then(() => {
      clearGymDeepLinkParam()
      setTimeout(() => {
        try {
          gymPulseMapRef.current?.flyTo?.(Number(partner.lat), Number(partner.lng), 16)
        } catch {}
      }, 500)
    })
  }, [partnerLocations, handleGymCheckIn, navigateTab])

  const handleToggleLeaderboard = useCallback(
    async (visible: boolean) => {
      if (!currentUser) return
      const updated = { ...currentUser, showOnLeaderboard: visible } as CurrentUser
      saveUser(updated)
      try {
        await saveUserWithRealSync(updated)
        toast(visible ? 'Visible en el ranking de tu ciudad' : 'Oculto del ranking local')
      } catch {
        toast.error('No se pudo actualizar visibilidad')
      }
    },
    [currentUser, saveUser, saveUserWithRealSync]
  )

  const handleOpenGymMap = useCallback(() => {
    navigateTab('map')
    if (mapMyGymId) setMapMyGymOnly(true)
    const gym = currentUser?.gymCheckIn
    if (gym?.lat != null && gym?.lng != null) {
      setTimeout(() => {
        try {
          gymPulseMapRef.current?.flyTo?.(gym.lat, gym.lng, 16)
        } catch {}
      }, 400)
    }
  }, [mapMyGymId, currentUser?.gymCheckIn])

  const syncCityStatsBump = useCallback(
    async (liveMinutesDelta: number, syncMinutesDelta: number) => {
      if (isDemoMode || !db || !firebaseUser?.uid) return
      if (!isZoneScoringActive()) return
      const cityNorm = normalizeCity(currentUser?.city)
      if (!cityNorm || liveMinutesDelta + syncMinutesDelta <= 0) return
      const bumpPayload = {
        weekKey: getWarEventKey(),
        uid: firebaseUser.uid,
        liveMinutesDelta,
        syncMinutesDelta,
      }
      try {
        await bumpCityWeeklyStats(db, {
          cityNorm,
          cityLabel: currentUser?.city || cityNorm,
          ...bumpPayload,
        })
        const regional = derbyRegionalBumpTarget(currentUser?.city)
        if (regional) {
          await bumpCityWeeklyStats(db, {
            cityNorm: regional.cityNorm,
            cityLabel: regional.cityLabel,
            ...bumpPayload,
          })
        }
      } catch (e) {
        console.warn('cityWeeklyStats bump failed', e)
      }
    },
    [isDemoMode, db, firebaseUser?.uid, currentUser?.city]
  )

  // Native push notifications setup (only for real users in native APK)
  // NOTE: We no longer auto-request permission on every login to avoid unwanted prompts/crashes during "activation".
  // Users explicitly activate via the button in Profile. This effect only sets up listeners if plugin present.
  useEffect(() => {
    if (
      isDemoMode ||
      !firebaseUser?.uid ||
      !PushNotifications ||
      !isFirebaseConfigured ||
      !Capacitor.isNativePlatform()
    ) {
      return
    }
    if (pushNativeSetupUidRef.current === firebaseUser.uid) return
    pushNativeSetupUidRef.current = firebaseUser.uid;

    (async () => {
      try {
        // Use check first; only request if we want explicit user action (see requestNativePushPermission)
        let perm: any = {}
        try {
          perm = await PushNotifications.checkPermissions()
        } catch (checkErr) {
          console.warn('checkPermissions not available or failed', checkErr)
        }
        const alreadyGranted = perm && (perm.receive === 'granted' || perm.notifications === 'granted')

        if (alreadyGranted) {
          try {
            await PushNotifications.register()
            console.log('âœ… Push notifications registered (already permitted)')

            // Create high-priority channel for network red activity (Android)
            if (Capacitor.getPlatform() === 'android') {
              try {
                await PushNotifications.createChannel({
                  id: 'network_activity',
                  name: 'Actividad de tu Red (EntrenaSync)',
                  description: 'Notificaciones cuando alguien de tu red entra en vivo o inicia un sync',
                  importance: 5, // max
                  visibility: 1,
                  sound: 'default',
                  lights: true,
                  lightColor: '#FF671F',
                  vibration: true,
                })
                await PushNotifications.createChannel({
                  id: 'entrenacoach',
                  name: 'EntrenaCoach',
                  description: 'Reservas y pagos de entrenadores personales',
                  importance: 5,
                  visibility: 1,
                  sound: 'default',
                  lights: true,
                  lightColor: '#6366f1',
                  vibration: true,
                })
                console.log('âœ… network_activity channel created for red pushes')
              } catch (chErr) {
                console.warn('createChannel failed (may already exist)', chErr)
              }
            }
          } catch (regErr) {
            console.warn('register after check failed (google-services?)', regErr)
          }
        } else {
          console.log('Push permission not yet granted for native (use the button in Profile to activate)')
        }

        // Always try to attach listeners (safe if already registered; plugin de-dupes in practice)
        try {
          PushNotifications.addListener('registration', (token: any) => {
            console.log('Push registration token (send this to server for this uid):', token?.value || token)
            // FCM stub: save token for this uid (for server-side sends). In real: update profile or dedicated /userTokens collection.
            if (!isDemoMode && firebaseUser?.uid && db && token?.value) {
              void saveUserPushToken(db, firebaseUser.uid, token.value)
                .then(() => console.log('[FCM] Token saved for uid', firebaseUser.uid))
                .catch((e) => console.warn('[FCM] token save failed', e))
            }
          })

          PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
            console.log('Push received while open:', notification)
            const title = (notification && (notification.title || notification.notification?.title)) || 'Nueva notificaciÃ³n'
            const body = (notification && (notification.body || notification.notification?.body)) || 'Revisa la app'
            const data = notification && (notification.data || notification.notification?.data) || {}
            const pushKey =
              String(notification?.id || notification?.notification?.id || '') ||
              `${title}:${body}:${JSON.stringify(data)}`
            if (recentPushToastKeysRef.current.has(pushKey)) return
            recentPushToastKeysRef.current.add(pushKey)
            trimSetToMax(recentPushToastKeysRef.current, 40)
            if (Date.now() - appStartedAtRef.current < SESSION_TOAST_GRACE_MS) return

            const target = resolvePushNotificationData(data)

            if (target) {
              const isTeam = data.type === 'team_live' || data.type === 'team_sync' || data.type === 'network_live' || data.type === 'network_sync'
              const isCoach =
                data.type === 'trainer_booking_new' ||
                data.type === 'trainer_booking_update' ||
                data.type === 'trainer_dispatch_offer'
              const isSocial =
                data.type === 'message_new' ||
                data.type === 'match_new' ||
                data.type === 'like_received' ||
                data.type === 'group_message'
              toast.success(title, {
                description: body + (isTeam ? ' (tu equipo/red)' : ''),
                className:
                  isCoach
                    ? 'network-notif border-l-4 border-[#6366f1] bg-[#12121a]'
                    : isSocial
                      ? 'network-notif border-l-4 border-[#22c55e] bg-[#0f1a14]'
                      : 'network-notif border-l-4 border-[#FFD700] bg-[#1a160f]',
                duration: 6000,
                action: {
                  label: target.openTrainerCoach
                    ? target.trainerCoachTab === 'now'
                      ? 'Ver oferta'
                      : 'Ver sesiones'
                    : target.activeChat
                      ? 'Abrir chat'
                      : target.groupChatId
                        ? 'Ver chat'
                        : target.showSyncArena
                          ? 'Unirme'
                          : target.tab === 'home'
                            ? 'Ver reto'
                            : target.openProfileId
                              ? 'Ver perfil'
                              : 'Ver live',
                  onClick: () => applyNotificationNavigationRef.current?.(target, data.partnerName),
                },
              })
            } else {
              toast.info(title, { 
                description: body,
                className: 'bg-[#1C1C20] border-[#FF671F] text-white',
                duration: 5000
              })
            }
          })

          PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
            console.log('Push action performed (user tapped):', action)
            const data = action && action.notification && (action.notification.data || action.notification.notification?.data) || {}
            const target = resolvePushNotificationData(data)

            if (target) {
              applyNotificationNavigationRef.current?.(target, data.partnerName)
            } else {
              toast('NotificaciÃ³n tocada', { description: 'Abriendo app...' })
            }
          })
        } catch (listenerErr) {
          console.warn('Failed to attach some push listeners', listenerErr)
        }
      } catch (e) {
        console.warn('Native push setup failed (google-services.json may be missing or misconfigured for com.entrenamatch.app):', e)
      }
    })()

    return () => {
      pushNativeSetupUidRef.current = null
      try {
        PushNotifications?.removeAllListeners?.()
      } catch {}
    }
  }, [isDemoMode, firebaseUser?.uid])

  // Diagnostic: on native builds, loudly warn (and optionally surface UI) if the push plugin didn't load.
  // This almost always means the AAB was built without android/app/google-services.json present.
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform()
    if (isNative) {
      // Give the async loader a moment (it's a local import, usually instant)
      const t = setTimeout(() => {
        if (!PushNotifications) {
          console.error('âš ï¸ NATIVE BUILD PROBLEM: PushNotifications plugin not loaded. This AAB was almost certainly built WITHOUT google-services.json in android/app/. The app may crash or push will be broken. Rebuild after placing the json from Firebase Console (package: com.entrenamatch.app).')
          // Surface a non-fatal toast once so testers know the build they have is bad
          try {
            // Only if we have a toast lib in scope; safe no-op otherwise
            // @ts-ignore
            if (typeof toast !== 'undefined') {
              toast.error('Build de Android incompleto', { description: 'Falta google-services.json â€” notificaciones y posiblemente el inicio pueden fallar. Pide una build actualizada.' })
            }
          } catch {}
        } else {
          console.log('âœ… PushNotifications plugin loaded on native â€” google-services.json was present at build time.')
        }
      }, 800)
      return () => clearTimeout(t)
    }
  }, [])

  // On real Firebase login, request Notification + REAL GPS for realistic distances/"vivo cerca"
  useEffect(() => {
    if (!isDemoMode && firebaseUser?.uid) {
      // slight delay so UI settles
      const t = setTimeout(() => { 
        requestWebNotificationPermission()
        // Auto-request real location for realism if not set (user can deny)
        if (!userLocation) {
          requestUserLocation().catch(() => {})
        }
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [isDemoMode, firebaseUser?.uid])

  // Auto-load own muro when entering profile tab (demo + real)
  useEffect(() => {
    if (activeTab === 'profile' && effectiveUserId) {
      loadProfilePosts(effectiveUserId)
    }
  }, [activeTab, effectiveUserId])

  // Migrate demo posts keyed as 'me' â†’ real Firebase uid so muro/comments stay consistent after login
  useEffect(() => {
    if (isDemoMode || !firebaseUser?.uid) return
    setProfilePosts((prev) => {
      const legacy = prev['me']
      if (!legacy?.length) return prev
      const uid = firebaseUser.uid
      const uidPosts = prev[uid] || []
      const mergedIds = new Set(uidPosts.map((p) => p.id))
      const merged = [...uidPosts, ...legacy.filter((p) => !mergedIds.has(p.id))].slice(0, 10)
      const next = { ...prev, [uid]: merged }
      delete next['me']
      profilePostsRef.current = next
      saveProfilePosts(next, { persistLocal: true })
      return next
    })
  }, [isDemoMode, firebaseUser?.uid])

  // Auto load muro when opening full profile of someone else
  useEffect(() => {
    if (showFullProfile) {
      loadProfilePosts(showFullProfile.id)
      if (!isDemoMode && db && !isSeedProfileId(showFullProfile.id)) {
        fetchReviewsForProfile(db, showFullProfile.id)
          .then((list) => {
            if (list.length === 0) return
            setReviews((prev) => ({ ...prev, [showFullProfile!.id]: list }))
            try {
              localStorage.setItem(
                'entrenamatch_reviews',
                JSON.stringify({ ...reviews, [showFullProfile!.id]: list })
              )
            } catch {}
          })
          .catch(() => {})
        if (showFullProfile.id !== effectiveUserId) {
          fetchUserWorkouts(db, showFullProfile.id, 5)
            .then((list) => setProfileViewWorkouts(list))
            .catch(() => setProfileViewWorkouts([]))
        } else {
          setProfileViewWorkouts([])
        }
      } else {
        setProfileViewWorkouts([])
      }
    } else {
      setProfileViewWorkouts([])
      // clean comment composer when closing full profile view
      setActiveComment(null)
      setCommentDraft('')
    }
  }, [showFullProfile, effectiveUserId, isDemoMode, db])



  // Auto-load global feed when entering the Hoy tab
  useEffect(() => {
    if (activeTab === 'home' && !isDemoMode) {
      setFeedMaxProfiles(15);
      setFeedDisplayLimit(10);
      loadGlobalFeed()
    }
  }, [activeTab])

  useEffect(() => {
    if (effectiveUserId) {
      setWeekLiveDays(loadWeekLiveDays(effectiveUserId))
    }
  }, [effectiveUserId])

  const exploreProfilePoll = shouldRunBackgroundProfilePoll(
    activeTab,
    !!currentUser?.trainingNow,
    appVisible
  )

  // Fallback poll on Explore only (onSnapshot handles most tabs).
  useEffect(() => {
    if (!exploreProfilePoll || isDemoMode) return undefined
    if (!userLocation) {
      requestUserLocation().catch(() => {})
    }
    const ms = REALTIME_HUB_POLICY.backgroundProfilePollMs
    const id = setInterval(() => {
      loadRealProfiles().catch(() => {})
      if (currentUser?.trainingSyncWith) {
        loadRealProfiles().catch(() => {})
      }
      loadActiveSyncCountRef.current().catch(() => {})
    }, ms)
    return () => clearInterval(id)
  }, [exploreProfilePoll, isDemoMode, currentUser?.trainingSyncWith, userLocation])

  // Live join comments â€” only while LIVE on Home/Map/Explore.
  useEffect(() => {
    if (!currentUser?.trainingNow || !appVisible) return undefined
    if (activeTab !== 'home' && activeTab !== 'map' && activeTab !== 'explore') return undefined
    const id = setInterval(() => {
      loadProfilePosts(effectiveUserId).then(() => processIncomingLiveJoins()).catch(() => {})
    }, 60_000)
    return () => clearInterval(id)
  }, [currentUser?.trainingNow, activeTab, appVisible, effectiveUserId])

  // Clear inline comment composer when changing tabs â€” but keep it while viewing another profile or the comments modal
  useEffect(() => {
    if (activeTab === 'profile') return
    if (showFullProfile || viewingPostComments) return
    setActiveComment(null)
    setCommentDraft('')
  }, [activeTab, showFullProfile, viewingPostComments])

  const resetLocalSessionState = useCallback(() => {
    lastSuccessfulAuthRef.current = null
    syncPartnerIdRef.current = null
    if (clearProfile) clearProfile()
    clearQuickDemoSession()
    setDemoMode(false)
    clearChatOnLogout()
    setSessionUnreads({})
    seenGroupMsgIdsRef.current = {}
    seenLiveUserIdsRef.current = new Set()
    seenLiveJoinInteractionIdsRef.current = new Set()
    prevRedSyncStateRef.current = {}
    liveSessionAlertsReadyRef.current = false
    liveJoinsBootstrappedRef.current = false
    try {
      localStorage.removeItem(SEEN_LIVE_USERS_KEY)
      localStorage.removeItem(PREV_RED_SYNC_STATE_KEY)
    } catch {
      /* ignore */
    }
    purgeAccountScopedStorage()
    resetSwipeDeck()
    setRealProfiles([])
    setActiveTab('explore')
    setIsEditingProfile(false)
    setSyncPartnerId(null)
    syncPartnerIdRef.current = null
    setSyncStartedAt(null)
    setSyncActions([])
  }, [clearProfile, clearChatOnLogout, resetSwipeDeck, setDemoMode])

  // Logout â€” signOut first; Firestore live cleanup is best-effort (must not block UI).
  const handleLogout = async () => {
    if (loggingOutRef.current) return
    loggingOutRef.current = true
    setLoggingOut(true)
    const loadingToast = toast.loading('Cerrando sesiÃ³nâ€¦')

    const uid = firebaseUser?.uid
    if (uid && db && !isDemoMode) {
      void clearLivePresence(db, uid).catch((e) =>
        console.warn('logout live presence cleanup (non-fatal):', e)
      )
      void updateUserProfile(uid, {
        trainingNow: false,
        trainingNowSince: null,
        trainingSyncWith: null,
        syncStartedAt: null,
      } as any).catch((e) => console.warn('logout profile cleanup (non-fatal):', e))
    }

    try {
      await Promise.race([
        logout(),
        new Promise<void>((resolve) => window.setTimeout(resolve, 5000)),
      ])
      resetLocalSessionState()
      toast.dismiss(loadingToast)
      toast.success('SesiÃ³n cerrada correctamente')
      window.setTimeout(() => window.location.reload(), 400)
    } catch (error) {
      console.error('Error al cerrar sesiÃ³n:', error)
      resetLocalSessionState()
      toast.dismiss(loadingToast)
      toast.error('Cerramos la sesiÃ³n localmente â€” recargandoâ€¦')
      window.setTimeout(() => window.location.reload(), 600)
    } finally {
      loggingOutRef.current = false
      setLoggingOut(false)
    }
  }

  // Auto-scroll group/session chat to bottom on new messages
  useEffect(() => {
    const scrollToBottom = () => {
      const el = groupChatScrollRef.current
      if (el) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight
        })
      }
      // Extra for mobile keyboard/layout shifts
      const scrollEl = document.getElementById('group-chat-scroll')
      if (scrollEl) {
        requestAnimationFrame(() => {
          scrollEl.scrollTop = scrollEl.scrollHeight
        })
      }
    }
    if (showGroupChatModalFor) {
      scrollToBottom()
      const t = setTimeout(scrollToBottom, 120)
      const t2 = setTimeout(scrollToBottom, 300) // for mobile render/keyboard settle
      return () => { clearTimeout(t); clearTimeout(t2) }
    }
  }, [showGroupChatModalFor, sessionMessages[showGroupChatModalFor || '']?.length])

  // Load real profiles on mount and when auth changes
  useEffect(() => {
    loadRealProfiles()
  }, [firebaseUser?.uid])

  const fetchMissingMatchPartners = useCallback(async () => {
    if (isDemoMode || !db || !firebaseUser?.uid) return
    const pool = latestRealProfilesRef.current || realProfiles
    const partnerIds = [...new Set([...matchesRef.current, ...realMatchesRef.current])].filter(
      (id) => {
        if (!id || isSeedProfileId(id)) return false
        const profile = pool.find((p) => p.id === id)
        if (!profile) return true
        return isIncompleteMatchProfile(profile)
      }
    )
    if (partnerIds.length === 0) return
    try {
      const fetched = await fetchProfilesByIds(db, partnerIds, { excludeUid: firebaseUser.uid })
      if (fetched.length === 0) return
      setRealProfiles((prev) => {
        const next = mergeProfileLists(prev, fetched)
        latestRealProfilesRef.current = next
        return next
      })
      fetched.forEach((p) => {
        loadProfilePosts(p.id).catch(() => {})
      })
    } catch (e) {
      console.warn('fetchProfilesByIds (match partners)', e)
    }
  }, [isDemoMode, db, firebaseUser?.uid, realProfiles])

  // Ensure match/chat partners are loaded by UID even if outside the global snapshot.
  useEffect(() => {
    if (missingMatchPartnerIds.length === 0) return undefined
    let cancelled = false
    void (async () => {
      await fetchMissingMatchPartners()
      if (cancelled) return
    })()
    return () => {
      cancelled = true
    }
  }, [missingMatchPartnerIds, fetchMissingMatchPartners])

  // Profile hydration on login is handled exclusively by ProfileContext (never synthesize a skeleton here â€”
  // it raced with Firestore and could push empty local data over a real profile).

  // Load my previous beta feedbacks when viewing Profile (real users only)
  useEffect(() => {
    if (activeTab === 'profile' && !isDemoMode && firebaseUser?.uid) {
      loadMyFeedbacks()
    }
  }, [activeTab, isDemoMode, firebaseUser?.uid])

  // Marketplace â€” gated until VITE_PILOT_MARKETPLACE=1 (no shop UI in beta)
  useEffect(() => {
    if (!isMarketplaceUiEnabled()) {
      setMarketplaceProducts([])
      setIsMarketplaceAdmin(false)
      return undefined
    }
    if (isDemoMode || !db || !firebaseUser?.uid) {
      setMarketplaceProducts(DEMO_MARKETPLACE_PRODUCTS)
      setIsMarketplaceAdmin(false)
      return undefined
    }
    return attachMarketplaceAdminListener(db, firebaseUser.uid, setIsMarketplaceAdmin)
  }, [isDemoMode, db, firebaseUser?.uid])

  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid) {
      setAppAdminRecord(null)
      return undefined
    }
    return attachAppAdminListener(db, firebaseUser.uid, setAppAdminRecord)
  }, [isDemoMode, db, firebaseUser?.uid])

  useEffect(() => {
    if (!isMarketplaceUiEnabled() || isDemoMode || !db || !firebaseUser?.uid) return undefined
    return attachMarketplaceProductsListener(db, setMarketplaceProducts, {
      includeInactive: isMarketplaceAdmin,
    })
  }, [isDemoMode, db, firebaseUser?.uid, isMarketplaceAdmin])

  useEffect(() => {
    if (isDemoMode || !db || !isMarketplaceAdmin) {
      setAdminOrders([])
      if (!isMarketplaceAdmin) setAdminBookings([])
      return undefined
    }
    const unsubs: Array<() => void> = []
    if (isMarketplaceUiEnabled()) {
      unsubs.push(attachAllMarketplaceOrdersListener(db, setAdminOrders))
    } else {
      setAdminOrders([])
    }
    unsubs.push(attachAllTrainerBookingsListener(db, setAdminBookings))
    return () => unsubs.forEach((u) => u())
  }, [isDemoMode, db, isMarketplaceAdmin])

  useEffect(() => {
    if (!showAdminOps || !isMarketplaceAdmin || isDemoMode || !isMarketplaceUiEnabled()) return
    void fetchMpHealth()
      .then(setMpHealth)
      .catch(() => setMpHealth(null))
  }, [showAdminOps, isMarketplaceAdmin, isDemoMode])

  useEffect(() => {
    if (showOnboarding) return
    if (isE2EHarnessActive()) return
    if (isDemoMode) {
      const dismissed = demoStorage.get<boolean>(DEMO_KEYS.ACTIVATION_GUIDE_DISMISSED)
      if (!dismissed) {
        markAppFeatureTourSeen()
        setShowActivationGuide(true)
      }
      return
    }
    if (!db || !firebaseUser?.uid) return
    void shouldShowActivationGuide(db, firebaseUser.uid).then((show) => {
      if (show) {
        markAppFeatureTourSeen()
        setShowActivationGuide(true)
      }
    })
    void loadFirstStepsProgress(db, firebaseUser.uid).then(setFirstStepsProgress)
  }, [isDemoMode, db, firebaseUser?.uid, showOnboarding])

  useEffect(() => {
    if (!currentUser || profileSectionBootRef.current) return
    if (isHomeDayOneMode(currentUser)) {
      setProfileSection('red')
      profileSectionBootRef.current = true
    }
  }, [currentUser])

  const androidBackLayers = useMemo(
    () => [
      { id: 'nonHomeTab', isOpen: activeTab !== 'home', onClose: () => setActiveTab('home') },
      { id: 'syncArena', isOpen: !!showSyncArena, onClose: () => setShowSyncArena(false) },
      { id: 'filters', isOpen: showFilters, onClose: () => setShowFilters(false) },
      {
        id: 'activation',
        isOpen: showActivationGuide,
        onClose: () => setShowActivationGuide(false),
      },
      {
        id: 'featureTour',
        isOpen: showFeatureTour,
        onClose: () => {
          markAppFeatureTourSeen()
          setShowFeatureTour(false)
        },
      },
      {
        id: 'liveMapOverlay',
        isOpen: showLiveMap && activeTab !== 'map',
        onClose: () => setShowLiveMap(false),
      },
      { id: 'activeChat', isOpen: !!activeChat, onClose: () => setActiveChat(null) },
      {
        id: 'redMessages',
        isOpen: activeTab === 'red' && redSubTab === 'messages',
        onClose: () => setRedSubTab('matches'),
      },
      { id: 'marketplace', isOpen: showMarketplace, onClose: () => setShowMarketplace(false) },
      { id: 'trainerCoach', isOpen: showTrainerCoach, onClose: () => setShowTrainerCoach(false) },
      { id: 'liveModal', isOpen: showLiveModal, onClose: () => setShowLiveModal(false) },
      {
        id: 'entrenaLog',
        isOpen: showEntrenaLogModal,
        onClose: () => {
          const uid = firebaseUser?.uid
          const draft = uid ? loadWorkoutDraft(uid) : null
          if (draft?.exercises?.length) {
            setShowEntrenaLogModal(false)
            setWorkoutDraftRefresh((n) => n + 1)
          } else {
            setShowEntrenaLogModal(false)
            setEntrenaLogPrefill(null)
            setEntrenaLogSkipDraft(false)
            setEntrenaLogShareToChat(null)
            setWorkoutDraftRefresh((n) => n + 1)
          }
        },
      },
      { id: 'fuelLog', isOpen: showFuelLogModal, onClose: () => setShowFuelLogModal(false) },
      { id: 'fuelSetup', isOpen: showFuelSetupModal, onClose: () => setShowFuelSetupModal(false) },
      { id: 'report', isOpen: showReportModal, onClose: () => setShowReportModal(false) },
      { id: 'notifications', isOpen: showNotifications, onClose: () => setShowNotifications(false) },
      {
        id: 'verification',
        isOpen: showVerificationFlow,
        onClose: () => setShowVerificationFlow(false),
      },
      { id: 'editProfile', isOpen: isEditingProfile, onClose: () => setIsEditingProfile(false) },
      { id: 'matchModal', isOpen: !!showMatchModal, onClose: () => setShowMatchModal(null) },
      {
        id: 'postComments',
        isOpen: !!viewingPostComments,
        onClose: () => setViewingPostComments(null),
      },
      { id: 'feedPost', isOpen: showFeedPostModal, onClose: () => setShowFeedPostModal(false) },
      { id: 'feedPhoto', isOpen: !!feedPhotoModal, onClose: () => setFeedPhotoModal(null) },
      {
        id: 'groupChat',
        isOpen: !!showGroupChatModalFor,
        onClose: () => setShowGroupChatModalFor(null),
      },
      { id: 'fullProfile', isOpen: !!showFullProfile, onClose: () => setShowFullProfile(null) },
    ],
    [
      activeTab,
      showSyncArena,
      showFilters,
      showActivationGuide,
      showFeatureTour,
      showLiveMap,
      activeChat,
      redSubTab,
      showMarketplace,
      showTrainerCoach,
      showLiveModal,
      showEntrenaLogModal,
      showFuelLogModal,
      showFuelSetupModal,
      showReportModal,
      showNotifications,
      showVerificationFlow,
      isEditingProfile,
      showMatchModal,
      viewingPostComments,
      showFeedPostModal,
      feedPhotoModal,
      showGroupChatModalFor,
      showFullProfile,
      setShowSyncArena,
      firebaseUser?.uid,
    ]
  )
  useAndroidBackHandler(androidBackLayers)

  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid || !firstStepsProgress) return
    const patch: Partial<FirstStepsProgress> = {}
    if (currentUser?.trainingNow) patch.live = true
    if (homeTeamMembers.length > 0) patch.team = true
    if (activeSyncCount > 0) patch.sync = true
    if (homeWeeklyPactProgress.pledged) patch.pact = true
    const changed = (Object.keys(patch) as (keyof FirstStepsProgress)[]).some(
      (k) => patch[k] === true && !firstStepsProgress[k]
    )
    if (changed) {
      void saveFirstStepsProgress(db, firebaseUser.uid, patch).then(() =>
        setFirstStepsProgress((prev) => (prev ? { ...prev, ...patch, updatedAt: Date.now() } : prev))
      )
    }
  }, [
    isDemoMode,
    db,
    firebaseUser?.uid,
    firstStepsProgress,
    currentUser?.trainingNow,
    homeTeamMembers.length,
    activeSyncCount,
    homeWeeklyPactProgress.pledged,
  ])

  useEffect(() => {
    if (!isMarketplaceUiEnabled() || isDemoMode || !db || !firebaseUser?.uid) {
      setMyMarketplaceOrders([])
      return undefined
    }
    return attachMyMarketplaceOrdersListener(db, firebaseUser.uid, setMyMarketplaceOrders)
  }, [isDemoMode, db, firebaseUser?.uid])

  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid || !firebaseUser.uid) return
    void updateDoc(doc(db, 'profiles', firebaseUser.uid), {
      notifDailyPulse: notifPrefs.dailyPulse,
      notifWeeklyPact: notifPrefs.weeklyPact,
    }).catch(() => {})
  }, [isDemoMode, db, firebaseUser?.uid, notifPrefs.dailyPulse, notifPrefs.weeklyPact])

  // EntrenaCoach â€” entrenadores personales (Fase 1 MVP)
  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid) {
      setTrainerProfiles([])
      setMyTrainerProfile(null)
      setTrainerBookings([])
      return undefined
    }
    const unsubProfiles = attachTrainerProfilesListener(db, setTrainerProfiles)
    const unsubMine = attachMyTrainerProfileListener(db, firebaseUser.uid, setMyTrainerProfile)
    const unsubBookings = attachTrainerBookingsListener(db, firebaseUser.uid, setTrainerBookings)
    return () => {
      unsubProfiles()
      unsubMine()
      unsubBookings()
    }
  }, [isDemoMode, db, firebaseUser?.uid])

  const trainerProfileCoords = useMemo(() => {
    const coords: Record<string, { lat: number; lng: number }> = {}
    for (const p of realProfiles) {
      if (typeof p.lat === 'number' && typeof p.lng === 'number') {
        coords[p.id] = { lat: p.lat, lng: p.lng }
      }
    }
    return coords
  }, [realProfiles])

  // EntrenaCoach Uber-mode â€” dispatch on-demand (Fase 3)
  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid) {
      setActiveTrainerDispatch(null)
      setIncomingDispatchOffer(null)
      setClientDispatchHistory([])
      setTrainerDispatchHistory([])
      return undefined
    }
    const unsubClient = attachClientDispatchListener(db, firebaseUser.uid, setActiveTrainerDispatch)
    const unsubOffer = attachTrainerDispatchOfferListener(
      db,
      firebaseUser.uid,
      setIncomingDispatchOffer
    )
    const unsubClientHist = attachClientDispatchHistoryListener(
      db,
      firebaseUser.uid,
      setClientDispatchHistory
    )
    const unsubTrainerHist = attachTrainerDispatchHistoryListener(
      db,
      firebaseUser.uid,
      setTrainerDispatchHistory
    )
    return () => {
      unsubClient()
      unsubOffer()
      unsubClientHist()
      unsubTrainerHist()
    }
  }, [isDemoMode, db, firebaseUser?.uid])

  // Auto-run disabled to keep cold launch fast and avoid unnecessary Play Integrity API calls (which can fail on sideloaded debug APKs).
  // Users can manually verify using the ðŸ›¡ï¸ button in Profile (the checkPlayIntegrity function + UI section remain available for testers).
  // The live toggle still prompts to verify integrity first if PlayIntegrityNative is present.
  // const didAutoIntegrityRef = useRef(false)
  // useEffect(() => {
  //   if (!isDemoMode && firebaseUser?.uid && PlayIntegrityNative && !didAutoIntegrityRef.current) {
  //     didAutoIntegrityRef.current = true
  //     checkPlayIntegrity(false).then((res) => {
  //       if (res && (res.token || res.simulatedVerdict)) {
  //         console.log('[Play Integrity] Auto-checked on real native login:', res.token ? 'real token' : 'simulated')
  //       }
  //     })
  //   }
  // }, [firebaseUser?.uid, isDemoMode])

  // Load real group chat messages when opening the modal for a real session
  const loadRealGroupMessages = async (sessionId: string) => {
    if (!db || !firebaseUser?.uid) return;

    try {
      const { collection, query, orderBy, getDocs } = await import('firebase/firestore');
      const msgsRef = collection(db, groupMessagesCollectionPath(sessionId));
      const q = query(msgsRef, orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);

      const loaded: SessionMessage[] = [];
      snap.forEach(doc => {
        loaded.push(mapGroupMessageDoc(doc.id, doc.data() as Record<string, unknown>))
      });

      setSessionMessages(prev => ({
        ...prev,
        [sessionId]: mergeGroupMessages(loaded, prev[sessionId]),
      }));
      console.log(`âœ… Loaded ${loaded.length} real group messages for session ${sessionId}`);
      setLastSync(new Date());
      if (showGroupChatModalFor === sessionId) {
        setSessionUnreads(prev => { const c = { ...prev }; c[sessionId] = 0; return c })
      }
    } catch (e) {
      console.warn('Could not load real group messages:', e);
    }
  };

  // Auto-load real group messages when opening the modal
  useEffect(() => {
    if (showGroupChatModalFor && !isDemoMode && firebaseUser?.uid && db) {
      loadRealGroupMessages(showGroupChatModalFor);
    }
  }, [showGroupChatModalFor, isDemoMode, firebaseUser?.uid]);

  // Real-time onSnapshot for group chat when modal open
  useEffect(() => {
    if (!showGroupChatModalFor || isDemoMode || !firebaseUser?.uid || !db) return

    const chatId = showGroupChatModalFor
    const unsub = attachGroupMessagesListener(
      db,
      groupMessagesCollectionPath(chatId),
      {
        onMessages: (loaded) => {
          setSessionMessages(prev => ({
            ...prev,
            [chatId]: mergeGroupMessages(loaded, prev[chatId]),
          }))
        },
        onError: (err) => console.warn('Group chat live listener error:', err),
      }
    )

    return unsub
  }, [showGroupChatModalFor, isDemoMode, firebaseUser?.uid, db]);

  // Real-time squad chat when squad detail modal is open
  useEffect(() => {
    if (!selectedSquad || isDemoMode || !firebaseUser?.uid || !db) return

    loadRealGroupMessages(selectedSquad)

    const unsub = attachGroupMessagesListener(
      db,
      groupMessagesCollectionPath(selectedSquad),
      {
        onMessages: (loaded) => {
          setSessionMessages(prev => ({
            ...prev,
            [selectedSquad]: mergeGroupMessages(loaded, prev[selectedSquad]),
          }))
        },
        onError: (err) => console.warn('Squad chat listener error:', err),
      }
    )

    return unsub
  }, [selectedSquad, isDemoMode, firebaseUser?.uid, db])

  useEffect(() => {
    if (!selectedSquad) return
    const squad = squads.find((s) => s.id === selectedSquad)
    if (!squad) return
    setSquadRoutineDraft({
      label: squad.weeklyRoutine?.label || '',
      schedule: squad.weeklyRoutine?.schedule || '',
      notes: squad.weeklyRoutine?.notes || '',
    })
  }, [selectedSquad, squads])

  // Safe polling fallback for group messages (8s) while modal open - guarantees updates even if listener has rules/index hiccup
  useEffect(() => {
    if (!showGroupChatModalFor || isDemoMode || !firebaseUser?.uid || !db) return;

    const interval = setInterval(() => {
      loadRealGroupMessages(showGroupChatModalFor);
    }, 8000);

    return () => clearInterval(interval);
  }, [showGroupChatModalFor, isDemoMode, firebaseUser?.uid, db]);

  // Defensive: if self was expelled from current group session (by admin), auto-close the modal
  useEffect(() => {
    if (!showGroupChatModalFor) return;
    const currentSess = displaySessions.find(s => s.id === showGroupChatModalFor) || sessions.find(s => s.id === showGroupChatModalFor);
    if (currentSess && !currentSess.participants?.includes(effectiveUserId)) {
      setTimeout(() => setShowGroupChatModalFor(null), 50);
    }
  }, [showGroupChatModalFor, displaySessions, sessions, effectiveUserId]);

  // Background onSnapshot listeners for messages of ALL sessions the current real user participates in.
  // This makes group chat updates "instant" even if the modal is not open (state is kept fresh).
  // When you open the chat, latest messages are already in sessionMessages. Combined with sessions listener for previews.
  // Only for real mode; small number of sessions in beta so multiple listeners are fine.
  useEffect(() => {
    if (isDemoMode || !firebaseUser?.uid || !db) {
      return;
    }
    const myIds = myGroupSessionIdsKey ? myGroupSessionIdsKey.split(',').filter(Boolean) : [];

    // Cleanup listeners for sessions we are no longer part of
    Object.keys(groupMessageUnsubsRef.current).forEach((id) => {
      if (!myIds.includes(id)) {
        try { groupMessageUnsubsRef.current[id]?.(); } catch {}
        delete groupMessageUnsubsRef.current[id];
      }
    });

    myIds.forEach((sessionId) => {
      if (groupMessageUnsubsRef.current[sessionId]) return

      groupMessageUnsubsRef.current[sessionId] = attachGroupMessagesListener(
        db,
        groupMessagesCollectionPath(sessionId),
        {
          onMessages: (loaded) => {
            const preSize = seenGroupMsgIdsRef.current[sessionId]?.size ?? 0
            const newlyAddedFromOthers: { id: string; text: string; senderName: string; photo?: string }[] = []

            if (!seenGroupMsgIdsRef.current[sessionId]) {
              seenGroupMsgIdsRef.current[sessionId] = new Set()
            }
            for (const m of loaded) {
              const wasSeen = seenGroupMsgIdsRef.current[sessionId].has(m.id)
              seenGroupMsgIdsRef.current[sessionId].add(m.id)
              if (
                preSize > 0 &&
                !wasSeen &&
                m.senderId &&
                m.senderId !== firebaseUser.uid &&
                m.senderId !== effectiveUserId
              ) {
                newlyAddedFromOthers.push({
                  id: m.id,
                  text: m.text || '',
                  senderName: m.senderName || 'Participante',
                  photo: m.photo,
                })
              }
            }
            persistGroupSeenIds()

            setSessionMessages((prev) => ({
              ...prev,
              [sessionId]: mergeGroupMessages(loaded, prev[sessionId]),
            }))
            setLastSync(new Date())
            if (showGroupChatModalFor === sessionId) {
              setSessionUnreads(prev => { const c = { ...prev }; c[sessionId] = 0; return c })
            }

            if (newlyAddedFromOthers.length > 0 && showGroupChatModalFor !== sessionId) {
              const first = newlyAddedFromOthers[0]
              const sess = (realSessions || []).find((s: any) => s.id === sessionId) || displaySessions.find((s: any) => s.id === sessionId)
              const sname = first.senderName || (sess ? (sess.creatorName || 'Alguien') : 'Participante')
              triggerMessageArrivalNotification(sessionId, sname, first.text, true, first.photo)
            }
          },
          onError: (err) => {
            console.warn(`BG group chat listener error for session ${sessionId}:`, err)
          },
        }
      )
    });
  }, [myGroupSessionIdsKey, isDemoMode, firebaseUser?.uid, db, showGroupChatModalFor]);

  // Global cleanup of bg group message listeners on unmount / mode change
  useEffect(() => {
    return () => {
      Object.values(groupMessageUnsubsRef.current).forEach((u) => {
        try { u(); } catch {}
      });
      groupMessageUnsubsRef.current = {};
    };
  }, []);

  // Simulated pending verifications for demo (in real app this would come from backend)
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([
    {
      userId: 'p3',
      name: 'Valentina Soto',
      age: 24,
      city: 'ValparaÃ­so',
      idPhoto: 'https://picsum.photos/id/29/400/300',
      selfiePhoto: 'https://picsum.photos/id/1009/400/400',
      submittedAt: Date.now() - 1000 * 60 * 60 * 2
    },
    {
      userId: 'p8',
      name: 'Lucas FernÃ¡ndez',
      age: 35,
      city: 'Ciudad de MÃ©xico',
      idPhoto: 'https://picsum.photos/id/64/400/300',
      selfiePhoto: 'https://picsum.photos/id/201/400/400',
      submittedAt: Date.now() - 1000 * 60 * 60 * 5
    }
  ])

  // (All swipe/deck visual state fully extracted to ExploreTab)

  // Onboarding state has been moved inside OnboardingFlow component (aggressive refactor).
  // App.tsx no longer owns this state.

  // (consents moved inside OnboardingFlow component)

  // Load from localStorage on mount
  useEffect(() => {
    // NOTE: Profile loading is now handled by useProfile hook.
    // The old 'fitvina_user' load has been migrated.
    const savedMatches = localStorage.getItem('fitvina_matches')
    const savedMessages = localStorage.getItem('fitvina_messages')
    const savedLocation = localStorage.getItem('entrenamatch_location')

    if (isDemoMode) {
      if (savedMatches) setMatches(JSON.parse(savedMatches))
      if (savedMessages) setMessages(JSON.parse(savedMessages))
    }
    if (savedLocation) {
      setUserLocation(JSON.parse(savedLocation))
    }
    const savedSessions = localStorage.getItem('entrenamatch_sessions')
    if (savedSessions && isDemoMode) {
      setSessions(JSON.parse(savedSessions))
    } else if (isDemoMode) {
      // Seed a few example sessions for demo
      const seedSessions: TrainingSession[] = [
        {
          id: 's1',
          creatorId: 'p2',
          creatorName: 'JoaquÃ­n PÃ©rez',
          title: 'CrossFit en el parque',
          time: 'MaÃ±ana 18:30',
          location: 'Parque Forestal, Santiago',
          trainingType: 'CrossFit',
          maxParticipants: 4,
          participants: ['p2'],
          createdAt: Date.now() - 1000000
        },
        {
          id: 's2',
          creatorId: 'p5',
          creatorName: 'Isabella Mendoza',
          title: 'Carrera grupal por la costanera',
          time: 'Hoy 19:00',
          location: 'Playa ReÃ±aca',
          trainingType: 'Running',
          maxParticipants: 6,
          participants: ['p5'],
          createdAt: Date.now() - 4000000
        }
      ]
      setSessions(seedSessions)
      localStorage.setItem('entrenamatch_sessions', JSON.stringify(seedSessions))
    }

    const savedReviews = localStorage.getItem('entrenamatch_reviews')
    if (savedReviews && isDemoMode) setReviews(JSON.parse(savedReviews))

    const savedSessionMessages = localStorage.getItem('entrenamatch_session_messages')
    if (savedSessionMessages && isDemoMode) {
      // Only restore local session messages in demo mode. In real mode, group chat messages come live from Firestore subcollections.
      setSessionMessages(JSON.parse(savedSessionMessages))
    }

    const savedSquads = localStorage.getItem('entrenamatch_squads')
    if (isDemoMode) {
      if (savedSquads) {
        setSquads(JSON.parse(savedSquads))
      } else {
        // Seed a couple of example squads for demo
        const seedSquads: Squad[] = [
          {
            id: 'sq1',
            name: 'Beasts de ReÃ±aca',
            focus: 'Pesas',
            members: ['p1', 'p4', 'p12'],
            createdBy: 'p4',
            createdAt: Date.now() - 10000000
          },
          {
            id: 'sq2',
            name: 'Corredores de la Costa',
            focus: 'Running',
            members: ['p5', 'p6', 'p14'],
            createdBy: 'p5',
            createdAt: Date.now() - 5000000
          }
        ]
        setSquads(seedSquads)
        localStorage.setItem('entrenamatch_squads', JSON.stringify(seedSquads))
      }
    }

    // Load profile muro posts (demo/local only â€” real mode loads from Firestore)
    if (isDemoMode) {
      const savedPosts = localStorage.getItem('entrenamatch_profile_posts')
      if (savedPosts) {
        const parsed = JSON.parse(savedPosts)
        profilePostsRef.current = parsed
        setProfilePosts(parsed)
      }
    }

    const savedBlocked = localStorage.getItem('entrenamatch_blocked')
    if (savedBlocked) setBlockedUsers(JSON.parse(savedBlocked))

    const savedReports = localStorage.getItem('entrenamatch_reports')
    if (savedReports) setReports(JSON.parse(savedReports))

    const savedChatUnreads = localStorage.getItem('entrenamatch_chat_unreads')
    if (savedChatUnreads) setChatUnreads(JSON.parse(savedChatUnreads))

    const savedSessionUnreads = localStorage.getItem('entrenamatch_session_unreads')
    if (savedSessionUnreads) setSessionUnreads(JSON.parse(savedSessionUnreads))
  }, [])

  // Save helpers - now delegated to useProfile hook
  // (saveUser is already provided by the hook)
  // saveMatches / saveMessages from useChatSession (fase 79)
  const saveChatUnreads = (unreads: Record<string, number>) => {
    if (isDemoMode) localStorage.setItem('entrenamatch_chat_unreads', JSON.stringify(unreads))
    setChatUnreads(unreads)
  }

  const saveSessions = (newSessions: TrainingSession[]) => {
    if (isDemoMode) {
      localStorage.setItem('entrenamatch_sessions', JSON.stringify(newSessions))
    }
    setSessions(newSessions)

    // Also persist to Firestore for real multi-user visibility (primary for real mode)
    if (!isDemoMode && firebaseUser?.uid && db) {
      (async () => {
        try {
          const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
          for (const s of newSessions.slice(0, 10)) {
            if (s.creatorId === effectiveUserId || s.participants.includes(effectiveUserId)) {
              await setDoc(doc(db, 'sessions', s.id), sanitizeForFirestore({
                ...s,
                updatedAt: serverTimestamp(),
              }), { merge: true })
            }
          }
          console.log('âœ… Sessions synced to Firestore for real users')
        } catch (e) {
          console.warn('Failed to sync sessions to Firestore:', e)
        }
      })()
    }
  }

  const saveReviews = (newReviews: Record<string, TrainingReview[]>) => {
    localStorage.setItem('entrenamatch_reviews', JSON.stringify(newReviews))
    setReviews(newReviews)
  }

  const saveSessionMessages = (newMessages: Record<string, SessionMessage[]>) => {
    // In real mode, Firestore subcollections are the source of truth for group messages (cross-device).
    // Only persist to localStorage in demo mode to avoid stale browser-only data.
    if (isDemoMode) {
      localStorage.setItem('entrenamatch_session_messages', JSON.stringify(newMessages))
    }
    setSessionMessages(newMessages)
  }

  const saveSquads = (newSquads: Squad[]) => {
    if (isDemoMode) {
      localStorage.setItem('entrenamatch_squads', JSON.stringify(newSquads))
    }
    setSquads(newSquads)
  }

  const resolveMemberName = (memberId: string): string => {
    if (memberId === effectiveUserId || memberId === 'me') return currentUser?.name || 'TÃº'
    const seed = SEED_PROFILES.find(p => p.id === memberId)
    if (seed) return seed.name
    const real = realProfiles.find(p => p.id === memberId)
    return real?.name || 'Usuario'
  }

  const handleJoinSquad = async (squadId: string) => {
    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        await joinSquadInFirestore(db, squadId, firebaseUser.uid)
        toast.success('Â¡Te uniste al Squad!')
      } catch (e: any) {
        console.warn('Could not join squad in Firestore', e)
        const isPerm = e?.code === 'permission-denied' || `${e?.message || e}`.includes('permission')
        toast.error(isPerm ? 'Permisos de Firestore' : 'No se pudo unir al Squad', {
          description: isPerm
            ? 'Despliega las reglas: firebase deploy --only firestore:rules'
            : 'Revisa tu conexiÃ³n e intenta de nuevo',
        })
      }
      return
    }
    const updated = squads.map(sq =>
      sq.id === squadId ? { ...sq, members: [...sq.members, 'me'] } : sq
    )
    saveSquads(updated)
    toast.success('Â¡Te uniste al Squad!')
  }

  const handleLeaveSquad = async (squadId: string) => {
    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        await leaveSquadInFirestore(db, squadId, firebaseUser.uid)
        setSelectedSquad(null)
        toast('Saliste del Squad')
      } catch (e) {
        console.warn('Could not leave squad in Firestore', e)
        toast.error('No se pudo salir del Squad')
      }
      return
    }
    const updated = squads.map(sq =>
      sq.id === squadId ? { ...sq, members: sq.members.filter(m => m !== 'me') } : sq
    )
    saveSquads(updated)
    setSelectedSquad(null)
    toast('Saliste del Squad')
  }

  const handleSaveSquadRoutine = async (squadId: string) => {
    if (!squadRoutineDraft.label.trim() || !squadRoutineDraft.schedule.trim()) {
      toast.error('Completa el nombre de la rutina y los dÃ­as')
      return
    }
    const payload = {
      label: squadRoutineDraft.label.trim(),
      schedule: squadRoutineDraft.schedule.trim(),
      notes: squadRoutineDraft.notes.trim() || undefined,
    }
    if (isDemoMode || !firebaseUser?.uid || !db) {
      const updated = squads.map((sq) =>
        sq.id === squadId
          ? {
              ...sq,
              weeklyRoutine: {
                ...payload,
                updatedAt: Date.now(),
                updatedBy: effectiveUserId,
              },
            }
          : sq
      )
      saveSquads(updated)
      toast.success('Rutina del squad guardada')
      return
    }
    setSavingSquadRoutine(true)
    try {
      await updateSquadRoutineInFirestore(db, squadId, firebaseUser.uid, payload)
      toast.success('Rutina del squad guardada')
    } catch (e) {
      console.warn('save squad routine failed', e)
      toast.error('No se pudo guardar la rutina')
    } finally {
      setSavingSquadRoutine(false)
    }
  }

  const saveProfilePosts = (posts: Record<string, ProfilePost[]>, opts?: { persistLocal?: boolean }) => {
    profilePostsRef.current = posts
    setProfilePosts(posts)
    // Real mode: Firestore is source of truth; localStorage is optional offline cache only
    if (isDemoMode || opts?.persistLocal === true) {
      try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(posts)) } catch {}
    }
  }

  /** Normalize legacy 'me' key â†’ real Firebase uid for post lookups */
  const resolvePostOwnerId = useCallback((postUserId: string): string => {
    if (postUserId === 'me' && effectiveUserId) return effectiveUserId
    if (postUserId === 'me' && firebaseUser?.uid) return firebaseUser.uid
    return postUserId
  }, [effectiveUserId, firebaseUser?.uid])

  const applyCommentsToPost = useCallback((postId: string, remoteComments: PostComment[]) => {
    setProfilePosts((prev) => {
      let changed = false
      const next: Record<string, ProfilePost[]> = { ...prev }
      for (const uid of Object.keys(next)) {
        const posts = next[uid] || []
        const idx = posts.findIndex((p) => p.id === postId)
        if (idx < 0) continue
        const localComments = (posts[idx].comments || []) as PostComment[]
        const merged = mergeCommentLists(remoteComments, localComments)
        const same =
          merged.length === localComments.length &&
          merged.every((c, i) => c.id === localComments[i]?.id && c.text === localComments[i]?.text)
        if (same) return prev
        const updatedPosts = [...posts]
        updatedPosts[idx] = { ...posts[idx], comments: merged as ProfilePost['comments'] }
        next[uid] = updatedPosts
        changed = true
        break
      }
      if (!changed) return prev
      profilePostsRef.current = next
      if (isDemoMode) {
        try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(next)) } catch {}
      }
      return next
    })
  }, [isDemoMode])

  const ensurePostCommentsListener = useCallback((postId: string, inlineFallback?: unknown) => {
    if (isDemoMode || !db || !postId) return
    if (inlineFallback !== undefined) {
      postCommentInlineFallbackRef.current[postId] = inlineFallback
    }
    if (postCommentUnsubsRef.current[postId]) return
    const fallback = postCommentInlineFallbackRef.current[postId]
    bumpRealtimeStat('commentListeners', 1)
    postCommentUnsubsRef.current[postId] = attachPostCommentsListener(
      db,
      postId,
      (comments) => applyCommentsToPost(postId, comments),
      fallback
    )
  }, [isDemoMode, applyCommentsToPost])

  const releasePostCommentsListener = useCallback((postId: string) => {
    const unsub = postCommentUnsubsRef.current[postId]
    if (unsub) {
      unsub()
      delete postCommentUnsubsRef.current[postId]
      bumpRealtimeStat('commentListeners', -1)
    }
    delete postCommentInlineFallbackRef.current[postId]
  }, [])

  const subscribeCommentsForPosts = useCallback((posts: ProfilePost[]) => {
    if (isDemoMode || !db) return
    for (const p of posts) {
      if (p?.id) ensurePostCommentsListener(p.id, p.comments || [])
    }
  }, [isDemoMode, ensurePostCommentsListener])

  const mergeGlobalFeedPosts = useCallback((posts: ProfilePost[]) => {
    const prevStore = profilePostsRef.current
    const next = { ...prevStore }
    for (const post of posts) {
      const uid = post.userId
      if (!uid || shouldHideBetaBot(uid)) continue
      const existing = next[uid] || []
      const merged = [...existing.filter((x) => x.id !== post.id), post].sort(
        (a, b) => b.timestamp - a.timestamp
      )
      next[uid] = merged.slice(0, 10)
    }
    saveProfilePosts(next)
  }, [saveProfilePosts])

  const ensureUserPostsListener = useCallback((userId: string) => {
    if (isDemoMode || !db || !userId) return
    const resolved = resolvePostOwnerId(userId)
    if (userPostsUnsubsRef.current[resolved]) return
    bumpRealtimeStat('feedUserListeners', 1)
    userPostsUnsubsRef.current[resolved] = attachUserPostsListener(
      db,
      resolved,
      (posts) => {
        const prevStore = profilePostsRef.current
        const localForUser = prevStore[resolved] || []
        const fsIds = new Set(posts.map((p) => p.id))
        const localOnly = localForUser.filter((p) => !fsIds.has(p.id))
        const finalList = [...localOnly, ...posts].slice(0, 10)
        saveProfilePosts({ ...prevStore, [resolved]: finalList })
      },
      { maxResults: 10 }
    )
  }, [isDemoMode, resolvePostOwnerId, saveProfilePosts])

  const releaseUserPostsListener = useCallback((userId: string) => {
    const resolved = resolvePostOwnerId(userId)
    const unsub = userPostsUnsubsRef.current[resolved]
    if (unsub) {
      try {
        unsub()
      } catch {}
      delete userPostsUnsubsRef.current[resolved]
      bumpRealtimeStat('feedUserListeners', -1)
    }
  }, [resolvePostOwnerId])

  // Feed: 1 global listener on Home + own profile only (perf).
  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid) return undefined

    ensureUserPostsListener(effectiveUserId)
    if (showFullProfile?.id) ensureUserPostsListener(showFullProfile.id)

    if (activeTab === 'home' && !globalFeedUnsubRef.current) {
      bumpRealtimeStat('feedGlobalListeners', 1)
      globalFeedUnsubRef.current = attachGlobalFeedListener(db, mergeGlobalFeedPosts, {
        maxResults: 40,
      })
    }

    if (activeTab !== 'home') {
      if (globalFeedUnsubRef.current) {
        globalFeedUnsubRef.current()
        globalFeedUnsubRef.current = null
        bumpRealtimeStat('feedGlobalListeners', -1)
      }
      Object.keys(userPostsUnsubsRef.current).forEach((uid) => {
        if (uid !== effectiveUserId && uid !== showFullProfile?.id) {
          releaseUserPostsListener(uid)
        }
      })
    }

    return undefined
  }, [
    isDemoMode,
    db,
    firebaseUser?.uid,
    effectiveUserId,
    showFullProfile?.id,
    activeTab,
    ensureUserPostsListener,
    mergeGlobalFeedPosts,
    releaseUserPostsListener,
  ])

  useEffect(() => {
    return () => {
      globalFeedUnsubRef.current?.()
      globalFeedUnsubRef.current = null
      Object.values(userPostsUnsubsRef.current).forEach((u) => {
        try {
          u()
        } catch {}
      })
      userPostsUnsubsRef.current = {}
    }
  }, [])

  // Muro / Profile Posts helpers (demo + real Firestore)
  const loadProfilePosts = async (userId: string) => {
    const resolvedUserId = resolvePostOwnerId(userId)
    if (isDemoMode || !db) {
      const posts = (profilePostsRef.current[resolvedUserId] || profilePosts[resolvedUserId] || [])
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
      return posts
    }
    try {
      const { collection, query, where, getDocs, limit } = await import('firebase/firestore')
      const q = query(
        collection(db, 'profilePosts'),
        where('userId', '==', resolvedUserId),
        limit(30)
      )
      const snap = await getDocs(q)
      const posts: ProfilePost[] = []
      await Promise.all(
        snap.docs.map(async (docSnap) => {
          const d = docSnap.data() as any
          const comments = await fetchPostComments(db, docSnap.id, d.comments || [])
          posts.push({
            id: docSnap.id,
            userId: d.userId,
            text: d.text || '',
            photo: d.photo,
            timestamp: d.timestamp || Date.now(),
            likes: d.likes || [],
            pinned: !!d.pinned,
            postType: d.postType,
            workoutId: d.workoutId,
            workoutPreview: d.workoutPreview,
            nutritionPreview: d.nutritionPreview,
            reactions: d.reactions || {},
            comments: comments as ProfilePost['comments'],
          })
        })
      )
      posts.sort((a, b) => b.timestamp - a.timestamp)
      const limited = posts.slice(0, 10)
      const prevStore = profilePostsRef.current
      const localForUser = prevStore[resolvedUserId] || []
      const fsIds = new Set(limited.map((p) => p.id))
      const localOnly = localForUser.filter((p) => !fsIds.has(p.id))
      const finalList = [...localOnly, ...limited].slice(0, 10)
      saveProfilePosts({ ...prevStore, [resolvedUserId]: finalList })
      subscribeCommentsForPosts(finalList)
      ensureUserPostsListener(resolvedUserId)
      return finalList
    } catch (e) {
      console.warn('loadProfilePosts error', e)
      const posts = (profilePostsRef.current[resolvedUserId] || [])
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
      return posts
    }
  }

  loadProfilePostsRef.current = loadProfilePosts

  const createProfilePost = async (
    text: string,
    photo: string | null = null,
    postType?: ProfilePostType,
    opts?: { skipToast?: boolean }
  ): Promise<ProfilePost | null> => {
    if (!text.trim()) return null

    const optimisticId = `post${Date.now()}`
    const post: ProfilePost = {
      id: optimisticId,
      userId: effectiveUserId,
      text: text.trim(),
      photo: photo || undefined,
      timestamp: Date.now(),
      pinned: false,
      likes: [],
      comments: [],
      reactions: {},
      ...(postType ? { postType } : {}),
    }

    setHomeSubTab('feed')
    setFeedOnlyLive(false)
    setFeedShowPinnedOnly(false)
    setFeedOnlyReal(false)
    setFeedSearch('')

    // Optimistic â€” el post aparece al instante en el Muro de la Comunidad
    setProfilePosts((prev) => {
      const current = prev[effectiveUserId] || []
      const newList = [post, ...current].slice(0, 10)
      const newState = { ...prev, [effectiveUserId]: newList }
      profilePostsRef.current = newState
      return newState
    })
    setRecentlyPublishedPostId(optimisticId)
    setTimeout(() => setRecentlyPublishedPostId(null), 30_000)
    addDebugLog(`Publicado (optimista): ${post.text.slice(0, 50)}${post.photo ? ' +foto' : ''}`)

    if (!opts?.skipToast) {
      toast.success(BRAND_COPY.feed.publishedTitle, {
        description: BRAND_COPY.feed.publishedDesc,
      })
    }

    const persistToBackend = async () => {
      let finalPhoto = photo || undefined
      if (photo && photo.startsWith('data:') && firebaseUser?.uid && storage) {
        try {
          const { ref, uploadString, getDownloadURL } = await import('firebase/storage')
          const path = `posts/${effectiveUserId}/${Date.now()}.jpg`
          const storageRef = ref(storage, path)
          const snap = await uploadString(storageRef, photo, 'data_url')
          finalPhoto = await getDownloadURL(snap.ref)
        } catch (e) {
          console.warn('photo storage upload failed, using data URL fallback', e)
        }
      }

      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const data: Record<string, unknown> = {
        userId: post.userId,
        text: post.text,
        timestamp: post.timestamp,
        likes: [],
        comments: [],
        reactions: {},
        pinned: false,
        createdAt: serverTimestamp(),
      }
      if (finalPhoto) data.photo = finalPhoto
      if (post.postType) data.postType = post.postType

      const docRef = await addDoc(collection(db!, 'profilePosts'), data)
      const saved: ProfilePost = { ...post, id: docRef.id, photo: finalPhoto }
      setProfilePosts((prev) => {
        const list = (prev[effectiveUserId] || []).map((p) =>
          p.id === optimisticId ? saved : p
        )
        const newState = { ...prev, [effectiveUserId]: list }
        profilePostsRef.current = newState
        return newState
      })
      setRecentlyPublishedPostId(docRef.id)
      setTimeout(() => setRecentlyPublishedPostId(null), 30_000)
      subscribeCommentsForPosts([saved])
      void loadGlobalFeed()
    }

    if (!isDemoMode && firebaseUser?.uid && db) {
      void persistToBackend().catch((e) => {
        console.warn('createProfilePost persist failed', e)
        setProfilePosts((prev) => ({
          ...prev,
          [effectiveUserId]: (prev[effectiveUserId] || []).filter((p) => p.id !== optimisticId),
        }))
        toast.error('No se pudo guardar en el Muro', {
          description: 'Revisa tu conexiÃ³n e intÃ©ntalo de nuevo.',
        })
      })
    } else {
      saveProfilePosts(
        {
          ...profilePostsRef.current,
          [effectiveUserId]: profilePostsRef.current[effectiveUserId] || [],
        },
        { persistLocal: true }
      )
    }

    return post
  }

  useEffect(() => {
    createProfilePostRef.current = createProfilePost
  })

  const refreshEntrenoRecentWorkouts = useCallback(async () => {
    if (isDemoMode) return
    if (!db || !firebaseUser?.uid) {
      setEntrenoRecentWorkouts([])
      return
    }
    setEntrenoRecentLoading(true)
    try {
      const list = await fetchRecentWorkouts(db, effectiveUserId, 20)
      setEntrenoRecentWorkouts(list)
    } catch {
      /* ignore */
    } finally {
      setEntrenoRecentLoading(false)
    }
  }, [isDemoMode, db, firebaseUser?.uid, effectiveUserId])

  useEffect(() => {
    if (activeTab === 'profile' || activeTab === 'home' || showEntrenaLogModal) {
      void refreshEntrenoRecentWorkouts()
    }
  }, [activeTab, showEntrenaLogModal, refreshEntrenoRecentWorkouts])

  const entrenoWeekSummary = useMemo(
    () => buildWeekWorkoutSummary(entrenoRecentWorkouts),
    [entrenoRecentWorkouts]
  )

  const entrenoExerciseHighlights = useMemo(
    () =>
      getTopExerciseProgress(entrenoRecentWorkouts, 3).map((e) => ({
        name: e.name,
        bestWeightKg: e.bestWeightKg,
        trend: e.trend,
      })),
    [entrenoRecentWorkouts]
  )

  const entrenoPartnerCompare = useMemo(() => {
    const pact = (currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact
    if (!isPactForCurrentWeek(pact) || !pact?.partnerId) return null
    const partnerWeekPosts = summarizePartnerWeekFromPosts(profilePosts[pact.partnerId])
    const partnerWeekWorkouts = summarizePartnerWeekFromWorkouts(pactPartnerWorkouts)
    const useWorkouts = partnerWeekWorkouts.sessions > 0
    const partnerSessions = useWorkouts
      ? partnerWeekWorkouts.sessions
      : partnerWeekPosts.sessions
    const partnerSets = useWorkouts ? partnerWeekWorkouts.totalSets : partnerWeekPosts.totalSets
    if (entrenoWeekSummary.totalSessions === 0 && partnerSessions === 0) return null
    const partner = realProfiles.find((p) => p.id === pact.partnerId)
    return {
      partnerName: pact.partnerName || partner?.name || 'CompaÃ±ero',
      selfSessions: entrenoWeekSummary.totalSessions,
      partnerSessions,
      selfSets: entrenoWeekSummary.totalSets,
      partnerSets,
    }
  }, [
    (currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact,
    profilePosts,
    pactPartnerWorkouts,
    entrenoWeekSummary,
    realProfiles,
  ])

  const chatPactCompare = useMemo(() => {
    const pact = (currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact
    if (!activeChat || !isPactForCurrentWeek(pact) || pact?.partnerId !== activeChat) return null
    return entrenoPartnerCompare
  }, [activeChat, entrenoPartnerCompare, (currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact])

  const entrenoGymRoutines = useMemo(() => {
    if (!isGymCheckInFresh(currentUser?.gymCheckIn)) return []
    const gymId = currentUser!.gymCheckIn!.gymId
    const partner = (partnerLocations || []).find((p) => p.id === gymId)
    return mergeGymRoutineTemplates(entrenoFirestoreGymRoutines, {
      gymName: currentUser!.gymCheckIn!.gymName,
      partnerType: partner?.type,
    })
  }, [currentUser?.gymCheckIn, partnerLocations, entrenoFirestoreGymRoutines])

  useEffect(() => {
    if (!isGymCheckInFresh(currentUser?.gymCheckIn) || isDemoMode || !db) {
      setEntrenoFirestoreGymRoutines([])
      return
    }
    const gymId = currentUser!.gymCheckIn!.gymId
    fetchGymRoutinesFromFirestore(db, gymId)
      .then(setEntrenoFirestoreGymRoutines)
      .catch(() => setEntrenoFirestoreGymRoutines([]))
  }, [currentUser?.gymCheckIn?.gymId, isDemoMode, db])

  useEffect(() => {
    const pact = (currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact
    if (!isPactForCurrentWeek(pact) || !pact?.partnerId || isDemoMode || !db) {
      setPactPartnerWorkouts([])
      return
    }
    fetchUserWorkouts(db, pact.partnerId, 15)
      .then(setPactPartnerWorkouts)
      .catch(() => setPactPartnerWorkouts([]))
  }, [
    (currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact?.partnerId,
    (currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact?.weekKey,
    isDemoMode,
    db,
  ])

  const openEntrenoDeHoy = useCallback(
    (opts?: {
      title?: string
      exercises?: import('./types').WorkoutExercise[]
      type?: import('./types').WorkoutType
      durationMin?: number
      /** When set, saved workout is also sent to this chat partner */
      shareToChat?: string
      /** Abre el historial plegable para elegir un entreno pasado */
      expandPastWorkouts?: boolean
    }) => {
      if (opts?.title || opts?.exercises?.length || opts?.type || opts?.durationMin) {
        setEntrenaLogPrefill({
          title: opts.title,
          exercises: opts.exercises,
          type: opts.type,
          durationMin: opts.durationMin,
        })
        setEntrenaLogSkipDraft(true)
        setEntrenaLogExpandPastWorkouts(false)
      } else {
        setEntrenaLogPrefill(null)
        setEntrenaLogSkipDraft(false)
        setEntrenaLogExpandPastWorkouts(!!opts?.expandPastWorkouts)
      }
      setEntrenaLogShareToChat(opts?.shareToChat ?? null)
      setShowEntrenaLogModal(true)
      void refreshEntrenoRecentWorkouts()
    },
    [refreshEntrenoRecentWorkouts]
  )

  const handleRepeatYesterday = useCallback(() => {
    void openEntrenoDeHoy({ expandPastWorkouts: true })
  }, [openEntrenoDeHoy])

  const handleCopyEntrenoWorkout = useCallback(
    (w: import('./types').Workout) => {
      const tpl = workoutToTemplate(w, `Repetir Â· ${w.title}`)
      void openEntrenoDeHoy({
        title: tpl.label,
        exercises: tpl.exercises,
        type: tpl.type,
        durationMin: tpl.durationMin,
      })
      toast.success('Rutina cargada', { description: 'Edita y guarda en Entreno de Hoy' })
    },
    [openEntrenoDeHoy]
  )

  const handleDeleteEntrenoWorkout = useCallback(
    async (w: import('./types').Workout) => {
      if (!w.id) return
      if (!window.confirm(`Â¿Eliminar "${w.title}"? Se quitarÃ¡ de tu historial y del muro si estaba publicado.`)) return
      if (isDemoMode || !db) {
        setEntrenoRecentWorkouts((prev) => prev.filter((x) => x.id !== w.id))
        toast.success('Entreno eliminado')
        return
      }
      try {
        await deleteWorkoutWithLinkedPost(db, w.id, effectiveUserId)
        setEntrenoRecentWorkouts((prev) => prev.filter((x) => x.id !== w.id))
        const updated: typeof profilePosts = { ...profilePosts }
        for (const uid of Object.keys(updated)) {
          updated[uid] = (updated[uid] || []).filter((p) => p.workoutId !== w.id)
        }
        saveProfilePosts(updated, { persistLocal: false })
        loadGlobalFeed().catch(() => {})
        void refreshFuelData()
        toast.success('Entreno eliminado')
      } catch {
        toast.error('No se pudo eliminar el entreno')
      }
    },
    [isDemoMode, db, effectiveUserId, profilePosts, saveProfilePosts, loadGlobalFeed, refreshFuelData]
  )

  const handleCopyWorkoutFromPost = async (workoutId: string, title?: string) => {
    if (!workoutId) return
    if (isDemoMode || !db) {
      toast('Copiar rutina disponible con cuenta real')
      return
    }
    try {
      const w = await fetchWorkoutById(db, workoutId)
      if (!w?.exercises?.length) {
        toast.error('Rutina no encontrada')
        return
      }
      void openEntrenoDeHoy({
        title: title ? `Copia Â· ${title}` : 'Rutina copiada',
        exercises: w.exercises.map((e) => ({
          ...e,
          sets: e.sets.map((s) => ({ ...s })),
        })),
        type: w.type,
        durationMin: w.stats?.durationMin || 45,
      })
      toast.success('Rutina cargada', { description: 'Edita y guarda en Entreno de Hoy' })
    } catch {
      toast.error('No se pudo cargar la rutina')
    }
  }

  const applyEntrenoSaveSideEffects = useCallback(
    async (
      durationMin: number,
      opts?: {
        prSummary?: string
        workoutType?: import('./types').WorkoutType
        exercises?: import('./types').WorkoutExercise[]
        toastAction?: { label: string; onClick: () => void }
      }
    ) => {
      await refreshEntrenoRecentWorkouts()
      await refreshFuelData()
      if (!isDemoMode && db && firebaseUser?.uid) {
        const reward = Math.min(15, Math.max(5, Math.floor(durationMin / 10)))
        try {
          const left = await earnConstancia(
            db,
            effectiveUserId,
            reward,
            dailyPulse?.momentum ?? 0
          )
          setConstanciaBalance(left)
        } catch {
          /* non-blocking */
        }
      }
      const prLine = opts?.prSummary ? ` Â· ${opts.prSummary}` : ''
      const weightKg =
        fuelProfile?.weightKg ??
        (currentUser as { weightKg?: number })?.weightKg ??
        75
      const stats = opts?.exercises?.length
        ? computeWorkoutStats(opts.exercises, durationMin)
        : undefined
      const burn =
        opts?.workoutType && stats
          ? estimateWorkoutBurn(
              { type: opts.workoutType, stats, exercises: opts.exercises },
              weightKg
            )
          : 0
      const fuelTip = getPostWorkoutFuelTip(opts?.workoutType)
      const burnLine = burn > 0 ? `~${burn} kcal estimadas` : undefined
      const description = [burnLine, fuelTip].filter(Boolean).join(' Â· ') || 'Registrado en tu semana'
      const planHint = weeklyPlan?.headline
        ? ` Â· MaÃ±ana: ${weeklyPlan.recommendation.title} (${weeklyPlan.recommendation.durationMin} min)`
        : ''
      toast.success('Entreno de Hoy guardado', {
        description: `${description}${prLine}${planHint}`,
        duration: 8000,
        action:
          opts?.toastAction ??
          (fuelProfile
            ? {
                label: 'Abrir Fuel',
                onClick: () => {
                  setEditingFuelLog(null)
                  setShowFuelLogModal(true)
                },
              }
            : undefined),
      })
    },
    [
      refreshEntrenoRecentWorkouts,
      refreshFuelData,
      isDemoMode,
      db,
      firebaseUser?.uid,
      effectiveUserId,
      dailyPulse?.momentum,
      fuelProfile,
      currentUser,
      weeklyPlan,
    ]
  )

  /** Global live toggle â€” used by FAB, Daily home, Profile, and E2E harness. */
  const toggleLiveTraining = async (mode?: 'on' | 'off' | 'toggle') => {
    if (isTogglingLive || !currentUser) return
    const me = currentUser
    const wantOff =
      mode === 'off' || (mode !== 'on' && !!me.trainingNow)
    const wantOn = mode === 'on' || (mode !== 'off' && !me.trainingNow)

    if (wantOff && me.trainingNow) {
      setIsTogglingLive(true)
      try {
        const durationMs = me.trainingNowSince ? Date.now() - me.trainingNowSince : 30 * 60 * 1000
        const minutes = Math.max(5, Math.floor(durationMs / 60000))
        const momentumBonus = Math.floor(minutes / 3) + 5
        const xpBonus = Math.floor(minutes * 1.5)
        const currentMom = dailyPulse?.momentum ?? (me as any).momentumPoints ?? 0
        const currentXp = dailyPulse?.xp ?? (me as any).retentionXp ?? 0
        const newMom = currentMom + momentumBonus
        const newXp = Math.min(299, currentXp + xpBonus)
        const weekKey = getWeekKey()
        const nextLiveDays =
          minutes >= MIN_LIVE_MINUTES_FOR_WEEK_DAY
            ? recordWeekLiveDay(effectiveUserId)
            : weekLiveDays
        const newWeekStats = mergeWeekStats(
          me.weekStats?.weekKey === weekKey ? me.weekStats : undefined,
          weekKey,
          minutes,
          nextLiveDays.length
        )

        const updated = {
          ...me,
          trainingNow: false,
          trainingNowSince: null,
          trainingSyncWith: null,
          syncStartedAt: null,
          momentumPoints: newMom,
          retentionXp: newXp,
          weekStats: newWeekStats,
          liveMotionScore: undefined,
          liveMotionAt: undefined,
          liveMotionIdle: undefined,
          liveActivityState: undefined,
        } as CurrentUser

        if (syncPartnerId) {
          setSyncPartnerId(null)
          syncPartnerIdRef.current = null
          setSyncStartedAt(null)
          setSyncActions([])
          setSyncVibe(0)
          setSyncCombo(0)
        }
        if (dailyPulse) setDailyPulse({ ...dailyPulse, momentum: newMom, xp: newXp })

        if (postLiveSideEffectsTimerRef.current) {
          clearTimeout(postLiveSideEffectsTimerRef.current)
          postLiveSideEffectsTimerRef.current = null
        }

        pendingLiveWriteRef.current = { trainingNow: false, at: Date.now() }
        currentUserRef.current = updated
        saveUser(updated)
        setMapForceTick((t) => t + 1)
        try {
          await saveUserWithRealSync(updated)
          loadRealProfiles().catch(() => {})
        } catch (err) {
          console.warn('Live off Firestore sync failed', err)
          toast.error('Live apagado localmente', {
            description: 'No se sincronizÃ³ con el servidor â€” reintenta si sigues visible en el mapa.',
          })
        }
        syncCityStatsBump(minutes, 0).catch(() => {})
        if (minutes >= MIN_LIVE_MINUTES_FOR_WEEK_DAY) {
          setWeekLiveDays(nextLiveDays)
          toast('Entrenamiento finalizado', { description: `${minutes} min â€” cuenta para tu semana âœ“` })
        } else {
          toast('SesiÃ³n finalizada', {
            description: `${minutes} min. Entrena al menos ${MIN_LIVE_MINUTES_FOR_WEEK_DAY} min para marcar el dÃ­a.`,
          })
        }
        setPostLiveSession({
          minutes,
          gymName: isGymCheckInFresh(me.gymCheckIn) ? me.gymCheckIn!.gymName : null,
        })
        setHomeCoachBanner('post-live')
        navigateTab('home')
      } catch (err) {
        console.error('Live deactivate failed', err)
        pendingLiveWriteRef.current = null
        toast.error('No se pudo desactivar el live')
      } finally {
        setIsTogglingLive(false)
      }
      return
    }

    if (wantOn && !me.trainingNow) {
      setIsTogglingLive(true)
      try {
        await requestUserLocation().catch(() => {})
        if (!isDemoMode && PlayIntegrityNative) {
          const current = getLastIntegrityResult() || lastIntegrity
          if (!hasPositiveIntegrity(current)) {
            toast('ðŸ›¡ï¸ Verifica integridad para full visibilidad en prod', {
              description:
                'Usa el botÃ³n ðŸ›¡ï¸ Google Play Integrity arriba. El live se activa localmente de todas formas.',
            })
          }
        }
        const todayStr = new Date().toDateString()
        const lastStr = me.lastLiveDate ? new Date(me.lastLiveDate).toDateString() : null
        let newStreak = me.liveStreak || 0
        if (!lastStr || lastStr === todayStr) {
          if (!lastStr) newStreak = 1
        } else {
          const lastDate = new Date(lastStr)
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          newStreak =
            lastDate.toDateString() === yesterday.toDateString()
              ? (me.liveStreak || 0) + 1
              : 1
        }
        const streakUpdate = {
          liveStreak: newStreak,
          lastLiveDate: Date.now(),
          joinedLiveStreak:
            (me.joinedLiveStreak || 0) +
            (lastStr && lastStr !== todayStr ? 1 : lastStr ? 0 : 1),
        }
        const loc = userLocationRef.current
        let autoGymCheckIn = isGymCheckInFresh(me.gymCheckIn) ? me.gymCheckIn : undefined
        if (!autoGymCheckIn && loc && (partnerLocationsRef.current || []).length > 0) {
          const gyms = partnersForMap(partnerLocationsRef.current, isDemoMode).map((p: any) => ({
            id: p.id,
            name: p.name,
            lat: p.lat,
            lng: p.lng,
          }))
          const nearGym = findNearestGym(gyms, loc.lat, loc.lng)
          if (nearGym) {
            autoGymCheckIn = {
              gymId: nearGym.id,
              gymName: nearGym.name,
              lat: nearGym.lat,
              lng: nearGym.lng,
              checkedInAt: Date.now(),
            }
          }
        }
        let spotifyShareLive = me.spotifyShareLive
        let spotifyNowPlaying = me.spotifyNowPlaying
        const hasAnthem = !!me.gymSoundAnthem?.trackName
        const hasSpotify = isSpotifyConnected()
        if (hasSpotify || hasAnthem) {
          spotifyShareLive = true
          if (hasSpotify) {
            const token = await getValidSpotifyAccessToken()
            if (token) {
              const data = await fetchSpotifyNowPlaying(token)
              if (data) spotifyNowPlaying = toProfileNowPlaying(data)
            }
          }
        }

        const updated = {
          ...me,
          trainingNow: true,
          trainingNowSince: Date.now(),
          liveMotionScore: undefined,
          liveMotionAt: undefined,
          liveMotionIdle: false,
          liveActivityState: 'unknown' as const,
          spotifyShareLive,
          spotifyNowPlaying,
          ...(autoGymCheckIn
            ? { gymCheckIn: autoGymCheckIn, lat: autoGymCheckIn.lat, lng: autoGymCheckIn.lng }
            : loc
              ? { lat: loc.lat, lng: loc.lng }
              : {}),
          ...streakUpdate,
        } as CurrentUser

        pendingLiveWriteRef.current = { trainingNow: true, at: Date.now() }
        currentUserRef.current = updated
        saveUser(updated)
        setMapForceTick((t) => t + 1)
        void saveUserWithRealSync(updated)
          .then(() => loadRealProfiles().catch(() => {}))
          .catch((err) => console.warn('Live on Firestore sync (non-fatal):', err))
        toast('ðŸŸ¢ Â¡Entrenando Ahora (EN VIVO) activado!', {
          description: autoGymCheckIn
            ? `Check-in en ${autoGymCheckIn.gymName} â€” apareces en el mapa del gym`
            : spotifyShareLive
              ? 'ðŸŽ§ Tu mÃºsica se comparte en el mapa si estÃ¡ sonando'
              : undefined,
        })

        const isFirstLive = !me.lastLiveDate
        if (isFirstLive) {
          try {
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.65 } })
          } catch { /* ignore */ }
          toast.success(BRAND_COPY.toasts.firstLiveTitle, {
            description: BRAND_COPY.toasts.firstLiveDesc,
            duration: 6000,
          })
        }

        if (postLiveSideEffectsTimerRef.current) {
          clearTimeout(postLiveSideEffectsTimerRef.current)
        }
        postLiveSideEffectsTimerRef.current = setTimeout(() => {
          postLiveSideEffectsTimerRef.current = null
          try {
            if (!currentUserRef.current?.trainingNow) return
            const liveUser = currentUserRef.current
            checkAndUpdateDailyPulse(liveUser)
            if (dailyPulse?.currentChallenge?.type === 'solo') {
              void completeDailyChallenge(1, liveUser).catch((e) =>
                console.warn('[Live] completeDailyChallenge', e)
              )
            } else {
              awardConstancy(8, 'Ancla del Mapa LIVE', liveUser)
            }
            if (!userHasRecentAutoLivePost(effectiveUserId, profilePostsRef.current)) {
              void createProfilePost(`${pickLivePostText(Date.now())} ðŸ‹ï¸`, null, 'dailyPulse').catch(
                (e) => console.warn('[Live] createProfilePost', e)
              )
            }
          } catch (e) {
            console.warn('[Live] post-activate side effects', e)
          }
        }, 600)
      } catch (err) {
        console.error('Live activate failed', err)
        pendingLiveWriteRef.current = null
        toast.error('No se pudo activar el live')
      } finally {
        setIsTogglingLive(false)
      }
      return
    }

    if (wantOn && me.trainingNow) {
      toast('Ya estÃ¡s en LIVE', { description: 'Tu pin ya estÃ¡ visible en el mapa' })
      setMapForceTick((t) => t + 1)
    }
  }

  useLiveSessionGuard({
    enabled: !isDemoMode && !!firebaseUser?.uid && !isTogglingLive,
    trainingNow: !!currentUser?.trainingNow,
    trainingNowSince: currentUser?.trainingNowSince,
    liveMotionAt: currentUser?.liveMotionAt,
    appVisible,
    onAutoOff: async (reason) => {
      toast.info(reason, { duration: 6000 })
      await toggleLiveTraining('off')
    },
  })

  const arenaSync = useArenaSyncController({
    syncSession,
    isDemoMode,
    db,
    isFirebaseConfigured,
    firebaseUser,
    authBooting,
    effectiveUserId,
    currentUser,
    currentUserRef,
    realProfiles,
    latestRealProfilesRef,
    saveUser,
    pendingLiveWriteRef,
    activeTab,
    setActiveTab,
    navigateTab,
    showLiveMap,
    liveTrainingNow,
    isUserLive,
    userLocation,
    liveUsersActive,
    storage,
    saveUserWithRealSyncRef,
    createProfilePostRef,
    addNotificationRef,
    startSyncRef,
    setSyncBlockerPartnerName,
    setShowSyncLiveBlocker,
    setWitnessData,
    echoPins,
    setEchoPins,
    dailyPulse,
    checkAndUpdateDailyPulse,
    completeDailyChallenge,
    awardConstancy,
    openEntrenoDeHoy,
    applyEntrenoSaveSideEffects,
    weekLiveDays,
    homeLoggedSessionsCount,
    homeWeekTrainedCount,
    entrenoRecentWorkouts,
    setProfilePosts,
    profilePostsRef,
    subscribeCommentsForPosts,
    loadGlobalFeed,
    setExercisePRRecords,
    setHomeCoachBanner,
    syncCityStatsBump,
    addDebugLog,
    capacitorCamera: CapacitorCamera,
    refreshWearableDayBurn,
  })

  const {
    startSyncWith,
    endSync,
    submitSyncRating,
    tryAutoStartSync,
    witnessRipple,
    witnessEchoPin,
    handleArenaSyncAction,
    handleArenaCapturePhoto,
    startArenaVoicePing,
    persistSyncWorkoutLogToSession,
    loadActiveSyncCount,
    arenaPhotoInputRef,
    arenaPhotoResolverRef,
    isArenaVoiceRecording,
    syncDuelSummary,
    setSyncDuelSummary,
    replaySession,
    setReplaySession,
    activeSyncPairs,
    publishingSyncFeed,
    setPublishingSyncFeed,
  } = arenaSync

  useEffect(() => {
    loadActiveSyncCountRef.current = loadActiveSyncCount
  }, [loadActiveSyncCount])

  useEffect(() => {
    if (!isE2EHarnessActive()) return
    setShowOnboarding(false)
    setShowActivationGuide(false)
    setShowFeatureTour(false)
    installE2EHarness({
      enableLive: async () => {
        await toggleLiveTraining('on')
      },
      startMockSync: async (partnerId, partnerName) => {
        await startSyncWith(partnerId, partnerName)
      },
      isArenaOpen: () => !!showSyncArena,
      openMapTab: () => navigateTab('map'),
      openWorkoutModal: (opts) => {
        void openEntrenoDeHoy({
          title: 'E2E Entreno',
          type: 'push',
          durationMin: 45,
          exercises: opts?.exercises ?? [
            { name: 'Press banca', sets: [{ reps: 10, weightKg: 60 }] },
          ],
        })
      },
      isWorkoutModalOpen: () => showEntrenaLogModal,
      getGymLogSessionChipText: () => readGymLogSessionChipText(),
      getGymLogSessionChipAriaLabel: () => readGymLogSessionChipAriaLabel(),
      getGymLogSessionChipToneClass: () => readGymLogSessionChipToneClass(),
      isGymLogSessionPrToneAriaExpected: () =>
        sessionPrAriaMatchesLivePr(readGymLogSessionChipAriaLabel()),
      getGymLogFabSessionChipText: () => readGymLogFabSessionChipText(),
      getGymLogFabSessionChipAriaLabel: () => readGymLogFabSessionChipAriaLabel(),
      getGymLogFabSessionChipToneClass: () => readGymLogFabSessionChipToneClass(),
      isGymLogFabSessionPrToneAriaExpected: () =>
        fabSessionPrAriaMatchesLivePr(readGymLogFabSessionChipAriaLabel()),
      openReviewModal: (partnerId = 'p1') => {
        setShowReviewModalFor(partnerId)
        setPendingReviewBookingId(null)
      },
      isReviewModalOpen: () => !!showReviewModalFor,
      closeArena: () => setShowSyncArena(false),
      goToHomeTab: () => navigateTab('home'),
      isWorkoutSaveBannerVisible: () => workoutSaveBanner !== null,
      getWorkoutSaveBannerSessionSummary: () => workoutSaveBanner?.sessionSummary ?? null,
      getWorkoutSaveBannerFuelHint: () => workoutSaveBanner?.fuelBalanceHint ?? null,
      openFuelFromWorkoutSave: () => {
        if (workoutSaveBanner) {
          setFuelLogPrefill(buildFuelLogPrefillFromWorkoutSave(workoutSaveBanner))
        }
        setEditingFuelLog(null)
        setShowFuelLogModal(true)
        setWorkoutSaveBanner(null)
      },
      getFuelLogPrefillMacros: () => extractFuelLogPrefillMacros(fuelLogPrefill),
      isFuelLogModalOpen: () => showFuelLogModal,
      closeFuelLogModal: () => {
        setFuelLogPrefill(null)
        setShowFuelLogModal(false)
      },
      minimizeWorkoutModal: () => {
        setShowEntrenaLogModal(false)
        setWorkoutDraftRefresh((n) => n + 1)
      },
      isWorkoutFabVisible: () => {
        const uid = isDemoMode ? effectiveUserId : firebaseUser?.uid ?? null
        if (!uid || showEntrenaLogModal) return false
        const draft = loadWorkoutDraft(uid)
        return isWorkoutDraftFresh(draft)
      },
      resumeWorkoutModal: () => {
        void openEntrenoDeHoy()
      },
      goToProfileTab: () => navigateTab('profile'),
      seedDemoWorkoutHistory: () => {
        setEntrenoRecentWorkouts(buildE2EDemoWorkoutHistory(effectiveUserId))
        setEntrenoRecentLoading(false)
      },
      getWorkoutHistorySectionKicker: () => readWorkoutHistorySectionKicker(),
      getWorkoutHistoryRowSummaries: () => readWorkoutHistoryRowSummaries(),
      countWorkoutHistoryPrBadges: () => countWorkoutHistoryPrBadges(),
      getWorkoutHistorySparklineAriaLabels: () => readWorkoutHistorySparklineAriaLabels(),
      seedDemoFuelProfile: () => setFuelProfile(buildE2EDemoFuelProfile()),
      seedDemoFuelWeekLogs: (scenario = 'under-fueled') => {
        const macros = buildE2EDemoFuelWeekMacros(scenario)
        setFuelWeekMacros(macros)
        setFuelWeekDays(
          computeFuelWeekFromDates(new Set(macros.filter((d) => d.logged).map((d) => d.date)))
        )
      },
      getWeeklyPlanHistoryHint: () => readWeeklyPlanHistoryHint(),
      getWeeklyPlanHistoryAriaLabel: () => readWeeklyPlanHistoryAriaLabel(),
      getWeeklyPlanHistoryToneClass: () => readWeeklyPlanHistoryToneClass(),
      isWeeklyPlanHistoryFuelToneAriaExpected: (tone: FuelWeekHintTone) =>
        historyFuelAriaMatchesTone(readWeeklyPlanHistoryAriaLabel(), tone),
      getWeeklyPlanDetail: () => readWeeklyPlanDetail(),
      getWeeklyPlanRotationChip: () => readWeeklyPlanRotationChip(),
      getWeeklyPlanRotationAriaLabel: () => readWeeklyPlanRotationAriaLabel(),
      getWeeklyPlanRotationToneClass: () => readWeeklyPlanRotationToneClass(),
      isWeeklyPlanRotationFuelToneAriaExpected: (tone: FuelWeekHintTone) =>
        rotationFuelAriaMatchesTone(readWeeklyPlanRotationAriaLabel(), tone),
      getWeeklyPlanEnergySummaryText: () => readWeeklyPlanEnergySummaryText(),
      getWeeklyPlanEnergySummaryAriaLabel: () => readWeeklyPlanEnergySummaryAriaLabel(),
      getWeeklyPlanEnergySummaryToneClass: () => readWeeklyPlanEnergySummaryToneClass(),
      isWeeklyPlanEnergySummaryFuelToneAriaExpected: (tone: FuelWeekHintTone) =>
        energySummaryFuelAriaMatchesTone(readWeeklyPlanEnergySummaryAriaLabel(), tone),
      getWeeklyPlanFuelWeekHint: () => readWeeklyPlanFuelWeekHint(),
      getWeeklyPlanFuelWeekAriaLabel: () => readWeeklyPlanFuelWeekAriaLabel(),
      getWeeklyPlanFuelWeekToneClass: () => readWeeklyPlanFuelWeekToneClass(),
      getWeeklyPlanFuelWeekChip: () => readWeeklyPlanFuelWeekChip(),
      getWeeklyPlanFuelHeadlineChip: () => readWeeklyPlanFuelHeadlineChip(),
      getWeeklyPlanFuelHeadlineChipAriaLabel: () =>
        readWeeklyPlanFuelHeadlineChipAriaLabel(),
      getWeeklyPlanFuelHeadlineChipToneClass: () =>
        readWeeklyPlanFuelHeadlineChipToneClass(),
      getWeeklyPlanScenarioClass: () => readWeeklyPlanScenarioClass(),
      getWeeklyPlanFuelRowToneClass: () => readWeeklyPlanFuelRowToneClass(),
      getWeeklyPlanFuelToneStack: () => readWeeklyPlanFuelToneStackSnapshot(),
      isWeeklyPlanFuelToneStackAligned: () =>
        isWeeklyPlanFuelToneStackConsistent(readWeeklyPlanFuelToneStackSnapshot()),
      isWeeklyPlanFuelToneStackExpected: (tone: FuelWeekHintTone) =>
        fuelToneStackMatchesExpected(readWeeklyPlanFuelToneStackSnapshot(), tone),
      isWeeklyPlanFuelToneStackFullyExpected: (tone: FuelWeekHintTone) =>
        fuelToneStackMatchesDemoExpected(readWeeklyPlanFuelToneStackSnapshot(), tone),
      getWeeklyPlanNutritionNote: () => readWeeklyPlanNutritionNote(),
      getWeeklyPlanNutritionAriaLabel: () => readWeeklyPlanNutritionAriaLabel(),
      getWeeklyPlanNutritionToneClass: () => readWeeklyPlanNutritionToneClass(),
      getWeeklyPlanFuelRowAriaLabel: () => readWeeklyPlanFuelRowAriaLabel(),
      isWeeklyPlanFuelToneAriaAligned: (tone: FuelWeekHintTone) =>
        isWeeklyPlanFuelToneAriaStackAligned(
          {
            hint: readWeeklyPlanFuelWeekAriaLabel(),
            headline: readWeeklyPlanFuelHeadlineChipAriaLabel(),
            nutrition: readWeeklyPlanNutritionAriaLabel(),
            chip: readWeeklyPlanFuelWeekChipAriaLabel(),
            row: readWeeklyPlanFuelRowAriaLabel(),
          },
          tone
        ),
      isWeeklyPlanCardVisible: () => isWeeklyPlanCardVisible(),
      getWeeklyPlanCardAriaLabel: () => readWeeklyPlanCardAriaLabel(),
      isWeeklyPlanFuelCardToneAriaExpected: (tone: FuelWeekHintTone) =>
        fuelCardAriaMatchesTone(readWeeklyPlanCardAriaLabel(), tone),
      isWeeklyPlanFuelToneStackFullySynced: (tone: FuelWeekHintTone) =>
        isWeeklyPlanFuelToneStackDemoFullySynced(
          tone,
          readWeeklyPlanFuelToneStackSnapshot(),
          readWeeklyPlanCardAriaLabel(),
          {
            hint: readWeeklyPlanFuelWeekAriaLabel(),
            headline: readWeeklyPlanFuelHeadlineChipAriaLabel(),
            nutrition: readWeeklyPlanNutritionAriaLabel(),
            chip: readWeeklyPlanFuelWeekChipAriaLabel(),
            row: readWeeklyPlanFuelRowAriaLabel(),
          }
        ),
    })
  }, [
    showSyncArena,
    showEntrenaLogModal,
    showReviewModalFor,
    showFuelLogModal,
    fuelLogPrefill,
    workoutSaveBanner,
    navigateTab,
    startSyncWith,
    openEntrenoDeHoy,
    isDemoMode,
    effectiveUserId,
    firebaseUser?.uid,
    setShowOnboarding,
    setShowSyncArena,
    setFuelProfile,
    setFuelWeekMacros,
    setFuelWeekDays,
  ])

  useEffect(() => {
    if (isDemoMode || !firebaseUser?.uid) return
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const draft = loadWorkoutDraft(firebaseUser.uid!)
      if (isWorkoutDraftFresh(draft) && !showEntrenaLogModal) {
        setWorkoutDraftRefresh((n) => n + 1)
        toast('Recuperamos tu entreno', {
          description: 'Toca el gadget naranja para volver a Modo Entreno',
        })
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [isDemoMode, firebaseUser?.uid, showEntrenaLogModal])

  const handleEntrenaLogMinimize = useCallback(() => {
    setShowEntrenaLogModal(false)
    setWorkoutDraftRefresh((n) => n + 1)
  }, [])

  const resetEntrenaLogModalState = useCallback(() => {
    setEntrenaLogPrefill(null)
    setEntrenaLogSkipDraft(false)
    setEntrenaLogExpandPastWorkouts(false)
    setEntrenaLogShareToChat(null)
    setWorkoutDraftRefresh((n) => n + 1)
  }, [])

  const handleWorkoutQuickAddSet = useCallback(() => {
    const uid = firebaseUser?.uid
    if (!uid) return
    const result = quickAddSetToWorkoutDraft(uid)
    if (result.ok) {
      setWorkoutDraftRefresh((n) => n + 1)
      toast.success('Serie aÃ±adida', {
        description: result.exerciseName,
      })
    }
  }, [firebaseUser?.uid])

  const handleWorkoutOpenChat = useCallback(() => {
    const topUnread = Object.entries(chatUnreads)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])[0]
    setActiveTab('red')
    setRedSubTab('messages')
    if (topUnread) setActiveChat(topUnread[0])
  }, [chatUnreads])

  const handleWorkoutOpenFuel = useCallback(() => {
    setFuelLogPrefill(null)
    setEditingFuelLog(null)
    setShowFuelLogModal(true)
  }, [])

  const workoutSessionDraft = useMemo(() => {
    const uid = isDemoMode ? effectiveUserId : firebaseUser?.uid ?? null
    if (!uid || showEntrenaLogModal) return null
    const draft = loadWorkoutDraft(uid)
    return isWorkoutDraftFresh(draft) ? draft : null
  }, [isDemoMode, effectiveUserId, firebaseUser?.uid, showEntrenaLogModal, workoutDraftRefresh])

  const handleSaveEntrenaLog = async (payload: {
    title: string
    type: import('./types').WorkoutType
    exercises: import('./types').WorkoutExercise[]
    durationMin: number
  }) => {
    if (!payload.exercises.length) return
    setSavingWorkout(true)
    try {
      if (!isDemoMode && firebaseUser?.uid && db) {
        const history = await fetchRecentWorkouts(db, effectiveUserId, 20)
        const prs = detectWorkoutPRs(payload.exercises, history)
        const prSummary = formatWorkoutPRSummary(prs)
        const { workout, postId, postText } = await saveWorkoutWithPost(db, {
          userId: effectiveUserId,
          title: payload.title,
          type: payload.type,
          exercises: payload.exercises,
          durationMin: payload.durationMin,
          source: 'manual',
          prSummary: prSummary || undefined,
          prCount: prs.length || undefined,
          pinned: prs.length > 0,
        })
        if (prs.length) {
          fireWorkoutPRConfetti()
          const synced = await syncExercisePRs(db, effectiveUserId, prs, workout.id)
          if (synced.length) {
            setExercisePRRecords(topExercisePRs(await loadExercisePRs(db, effectiveUserId), 5))
          }
        }
        const preview = buildWorkoutPreview(
          workout.title,
          workout.type,
          payload.exercises,
          workout.stats,
          { prCount: prs.length || undefined }
        )
        const post: ProfilePost = {
          id: postId,
          userId: effectiveUserId,
          text: postText,
          timestamp: Date.now(),
          pinned: prs.length > 0,
          likes: [],
          comments: [],
          postType: 'workout',
          workoutId: workout.id,
          workoutPreview: preview,
          reactions: {},
        }
        setProfilePosts((prev) => {
          const current = prev[effectiveUserId] || []
          const newState = { ...prev, [effectiveUserId]: [post, ...current].slice(0, 10) }
          profilePostsRef.current = newState
          return newState
        })
        subscribeCommentsForPosts([post])
        setRecentlyPublishedPostId(postId)
        setTimeout(() => setRecentlyPublishedPostId(null), 4000)
        if (activeTab === 'home') loadGlobalFeed().catch(() => {})
        const storyOpts = {
          userName: currentUser?.name || 'Atleta',
          userPhoto: currentUser?.photo || currentUser?.photos?.[0],
          userId: effectiveUserId,
          preview,
          prSummary: prSummary || undefined,
        }
        workoutSaveShareOptsRef.current = storyOpts
        const weightKg =
          fuelProfile?.weightKg ?? (currentUser as { weightKg?: number })?.weightKg ?? 75
        const saveStats = computeWorkoutStats(payload.exercises, payload.durationMin)
        const saveBurn = estimateWorkoutBurn(
          { type: payload.type, stats: saveStats, exercises: payload.exercises },
          weightKg
        )
        const saveBurnKcal = saveBurn > 0 ? saveBurn : undefined
        setWorkoutSaveBanner({
          title: payload.title,
          prSummary: prSummary || undefined,
          burnKcal: saveBurnKcal,
          fuelTip: getPostWorkoutFuelTip(payload.type),
          sessionSummary: buildGymLogSessionChipCompact(payload.exercises),
          fuelBalanceHint: buildWorkoutSaveBannerFuelHint({
            burnKcal: saveBurnKcal,
            proteinRemainingG: fuelEnergyBalance?.remaining.proteinG,
          }),
        })
        window.setTimeout(() => {
          setWorkoutSaveBanner((prev) => (prev?.title === payload.title ? null : prev))
        }, 12000)
        await applyEntrenoSaveSideEffects(payload.durationMin, {
          prSummary: prSummary || undefined,
          workoutType: payload.type,
          exercises: payload.exercises,
          toastAction: {
            label: 'Compartir',
            onClick: () => {
              void shareWorkoutStory(storyOpts).then((outcome) =>
                toastWorkoutShareOutcome(toast, outcome)
              )
            },
          },
        })
        const shareTarget = entrenaLogShareToChat
        if (shareTarget) {
          sendMessage(postText, null, null, {
            toUserId: shareTarget,
            workoutId: workout.id,
            workoutPreview: preview,
          })
          toast.success('Entreno compartido en el chat', {
            description: `Enviado a ${chatProfile?.name?.split(' ')[0] || 'tu partner'}`,
          })
        }
      } else {
        const demoStats = computeWorkoutStats(payload.exercises, payload.durationMin)
        const demoPreview = buildWorkoutPreview(
          payload.title,
          payload.type,
          payload.exercises,
          demoStats
        )
        const demoPostText = `ðŸ‹ï¸ Entreno de Hoy Â· ${payload.title} â€” ${payload.exercises.length} ejercicios, ${payload.durationMin} min (demo)`
        await createProfilePost(demoPostText, null)
        setEntrenoRecentWorkouts((prev) => [
          buildDemoWorkoutFromSave(effectiveUserId, payload),
          ...prev,
        ].slice(0, 20))
        const demoStoryOpts = {
          userName: currentUser?.name || 'Atleta',
          userPhoto: currentUser?.photo || currentUser?.photos?.[0],
          userId: effectiveUserId,
          preview: demoPreview,
        }
        if (entrenaLogShareToChat) {
          sendMessage(demoPostText, null, null, {
            toUserId: entrenaLogShareToChat,
            workoutId: `demo-${Date.now()}`,
            workoutPreview: demoPreview,
          })
          toast.success('Entreno compartido en el chat (demo)')
        } else {
          const demoWeightKg =
            fuelProfile?.weightKg ?? (currentUser as { weightKg?: number })?.weightKg ?? 75
          const demoBurn = estimateWorkoutBurn(
            { type: payload.type, stats: demoStats, exercises: payload.exercises },
            demoWeightKg
          )
          const demoBurnKcal = demoBurn > 0 ? demoBurn : undefined
          workoutSaveShareOptsRef.current = demoStoryOpts
          setWorkoutSaveBanner({
            title: payload.title,
            burnKcal: demoBurnKcal,
            fuelTip: getPostWorkoutFuelTip(payload.type),
            sessionSummary: buildGymLogSessionChipCompact(payload.exercises),
            fuelBalanceHint: buildWorkoutSaveBannerFuelHint({
              burnKcal: demoBurnKcal,
              proteinRemainingG: fuelEnergyBalance?.remaining.proteinG,
            }),
          })
          window.setTimeout(() => {
            setWorkoutSaveBanner((prev) => (prev?.title === payload.title ? null : prev))
          }, 12000)
          toast.success('Entreno de Hoy guardado (demo)', {
            duration: 8000,
            action: {
              label: 'Compartir',
              onClick: () => {
                void shareWorkoutStory(demoStoryOpts).then((outcome) =>
                  toastWorkoutShareOutcome(toast, outcome)
                )
              },
            },
          })
        }
      }
      if (!isDemoMode && firebaseUser?.uid) {
        clearWorkoutDraft(firebaseUser.uid)
      }
      setWorkoutDraftRefresh((n) => n + 1)
      setShowEntrenaLogModal(false)
      setEntrenaLogPrefill(null)
      setEntrenaLogSkipDraft(false)
      setEntrenaLogShareToChat(null)
    } catch (e) {
      console.error('Entreno de Hoy save failed', e)
      toast.error('No se pudo guardar el entreno')
    } finally {
      setSavingWorkout(false)
    }
  }

  const { fuelEnergyBalance, fuelWeekBalanceDays } = useFuelBalancePipeline({
    isDemoMode,
    db,
    effectiveUserId,
    fuelProfile,
    fuelTodayLogs,
    fuelTodayWorkouts,
    fuelWeekMacros,
    fuelWeekWorkouts,
    currentUser,
    healthBurnBonus,
  })

  const weeklyPlanBase = useWeeklyPlan({
    fuelProfile,
    fuelWeekMacros,
    fuelWeekBalanceDays,
    fuelWeekWorkouts,
    recentWorkouts: entrenoRecentWorkouts,
    fuelEnergyBalance,
    userLevel: currentUser?.level,
  })

  const weeklyPlanBaseSigRef = useRef('')
  useEffect(() => {
    if (!weeklyPlanBase) {
      weeklyPlanBaseSigRef.current = ''
      setWeeklyPlan(null)
      setWeeklyPlanEnriching(false)
      return undefined
    }
    const sig = `${weeklyPlanBase.headline}|${weeklyPlanBase.recommendation.title}|${weeklyPlanBase.recommendation.type}`
    if (sig === weeklyPlanBaseSigRef.current) return undefined
    weeklyPlanBaseSigRef.current = sig
    setWeeklyPlan(weeklyPlanBase)
    let cancelled = false
    setWeeklyPlanEnriching(true)
    void enrichWeeklyPlanWithAi(weeklyPlanBase)
      .then((enriched) => {
        if (cancelled) return
        setWeeklyPlan(enriched)
        if (!isDemoMode && db && firebaseUser?.uid) {
          void saveWeeklyPlanCache(db, firebaseUser.uid, enriched).catch(() => {})
        }
      })
      .finally(() => {
        if (!cancelled) setWeeklyPlanEnriching(false)
      })
    return () => {
      cancelled = true
    }
  }, [weeklyPlanBase, isDemoMode, db, firebaseUser?.uid])

  useEffect(() => {
    maybeSendWeeklyPlanNotification(weeklyPlan, notifPrefs.weeklyPlan)
  }, [weeklyPlan, notifPrefs.weeklyPlan])

  const handleStartWeeklyPlan = useCallback(
    (plan: WeeklyPlanResult) => {
      const rec = plan.recommendation
      const level = currentUser?.level || 'Intermedio'
      if (rec.workoutType && (rec.type === 'strength' || rec.type === 'cardio')) {
        setEntrenaLogPrefill({
          title: rec.title,
          type: rec.workoutType,
          durationMin: rec.durationMin,
          exercises: buildPlanExercises(rec.workoutType, level),
        })
      } else {
        setEntrenaLogPrefill({
          title: rec.title,
          type: 'other',
          durationMin: rec.durationMin,
          exercises: rec.exercises.map((name) => ({
            name,
            sets: [{ reps: 10, weightKg: 0 }],
          })),
        })
      }
      setEntrenaLogSkipDraft(true)
      setEntrenaLogExpandPastWorkouts(false)
      setEntrenaLogShareToChat(null)
      setShowEntrenaLogModal(true)
    },
    [currentUser?.level]
  )

  const handlePublishWeeklyPlanToFeed = useCallback(
    async (plan: WeeklyPlanResult) => {
      const text = formatWeeklyPlanShareText(plan, currentUser?.name)
      try {
        if (isDemoMode) {
          await navigator.clipboard?.writeText(text)
          toast.success('Plan copiado')
          return
        }
        await createProfilePost(text, null)
        toast.success('Plan publicado en el Muro')
        loadGlobalFeed().catch(() => {})
      } catch {
        toast.error('No se pudo publicar el plan')
      }
    },
    [currentUser?.name, isDemoMode, createProfilePost, loadGlobalFeed]
  )

  const handleShareWeeklyPlanExternally = useCallback(
    async (plan: WeeklyPlanResult) => {
      const outcome = await shareWeeklyPlanExternally(plan, {
        userName: currentUser?.name,
        inviteUrl: buildInviteLink(effectiveUserId),
      })
      if (outcome === 'copied') toast.success('Plan copiado â€” pÃ©galo en WhatsApp o Instagram')
      else if (outcome === 'failed') toast.error('No se pudo compartir el plan')
    },
    [currentUser?.name, effectiveUserId]
  )

  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid) {
      setExercisePRRecords([])
      return
    }
    loadExercisePRs(db, effectiveUserId)
      .then((map) => setExercisePRRecords(topExercisePRs(map, 5)))
      .catch(() => setExercisePRRecords([]))
  }, [isDemoMode, db, firebaseUser?.uid, effectiveUserId, entrenoRecentWorkouts.length])

  const refreshPartnerGymStats = useCallback(async () => {
    const gymId = currentUser?.gymCheckIn?.gymId
    if (!gymId || isDemoMode || !db) {
      setPartnerGymStats(null)
      return
    }
    setPartnerGymLoading(true)
    try {
      const liveAtGym = liveTrainingNow.filter(
        (u) => u.gymCheckIn?.gymId === gymId
      ).length
      const stats = await fetchPartnerGymStats(db, gymId, liveAtGym)
      setPartnerGymStats(stats)
    } catch {
      setPartnerGymStats(null)
    } finally {
      setPartnerGymLoading(false)
    }
  }, [currentUser?.gymCheckIn?.gymId, isDemoMode, db, liveTrainingNow])

  useEffect(() => {
    refreshPartnerGymStats().catch(() => {})
  }, [refreshPartnerGymStats])

  useEffect(() => {
    if (!firebaseUser?.uid || isDemoMode || !db) return
    ensureConstanciaBalance(db, effectiveUserId, dailyPulse?.momentum ?? 0)
      .then((pts) => setConstanciaBalance(pts))
      .catch(() => setConstanciaBalance(dailyPulse?.momentum ?? 0))
  }, [firebaseUser?.uid, isDemoMode, db, effectiveUserId, dailyPulse?.momentum])

  const handleConstanciaProtect = useCallback(async () => {
    if (!dailyPulse || (constanciaBalance ?? dailyPulse.momentum ?? 0) < 50) {
      toast.error('Necesitas 50 Constancia')
      return
    }
    const t = getTodayStr()
    const nextMomentum = (dailyPulse.momentum || 0) - 50
    const pp = { ...dailyPulse, streakProtectedDate: t, momentum: nextMomentum }
    setDailyPulse(pp)
    if (!isDemoMode && db && firebaseUser?.uid) {
      try {
        const left = await spendConstancia(db, effectiveUserId, 50)
        setConstanciaBalance(left)
      } catch {
        toast.error('Saldo Constancia insuficiente')
        return
      }
    }
    if (currentUser) {
      await saveUserWithRealSync({
        ...currentUser,
        streakProtectedDate: t,
        momentumPoints: nextMomentum,
      } as CurrentUser)
    }
    toast.success('Racha protegida con Constancia')
  }, [
    dailyPulse,
    constanciaBalance,
    isDemoMode,
    db,
    firebaseUser?.uid,
    effectiveUserId,
    currentUser,
    saveUserWithRealSync,
    getTodayStr,
    setDailyPulse,
  ])

  const handleConstanciaInsurance = useCallback(async () => {
    if (!dailyPulse || (constanciaBalance ?? dailyPulse.momentum ?? 0) < 120) {
      toast.error('Necesitas 120 Constancia')
      return
    }
    const t = getTodayStr()
    const nextMomentum = (dailyPulse.momentum || 0) - 120
    const pp = { ...dailyPulse, streakInsuranceWeek: t, momentum: nextMomentum }
    setDailyPulse(pp)
    if (!isDemoMode && db && firebaseUser?.uid) {
      try {
        const left = await spendConstancia(db, effectiveUserId, 120)
        setConstanciaBalance(left)
      } catch {
        toast.error('Saldo Constancia insuficiente')
        return
      }
    }
    if (currentUser) {
      await saveUserWithRealSync({
        ...currentUser,
        streakInsuranceWeek: t,
        momentumPoints: nextMomentum,
      } as CurrentUser)
    }
    toast.success('Seguro semanal activado')
  }, [
    dailyPulse,
    constanciaBalance,
    isDemoMode,
    db,
    firebaseUser?.uid,
    effectiveUserId,
    currentUser,
    saveUserWithRealSync,
    getTodayStr,
    setDailyPulse,
  ])

  useEffect(() => {
    if (!fuelEnergyBalance || isDemoMode || !db || !firebaseUser?.uid) return
    const today = toLocalDateStr()
    saveDailyEnergyCache(
      db,
      effectiveUserId,
      today,
      fuelEnergyBalance,
      fuelTodayWorkouts.map((w) => w.id)
    ).catch(() => {})
  }, [fuelEnergyBalance, fuelTodayWorkouts, isDemoMode, db, firebaseUser?.uid, effectiveUserId])

  const squadFuelSummary = useMemo(() => {
    if (!fuelProfile) return undefined
    const weeklyKcal = fuelWeekMacros?.reduce((s, d) => s + d.kcal, 0) ?? 0
    const todayBurn =
      (fuelEnergyBalance?.workoutBurnKcal ?? 0) +
      (fuelEnergyBalance?.liveBurnKcal ?? 0) +
      (fuelEnergyBalance?.healthBurnKcal ?? 0)
    return {
      weeklyKcal: Math.round(weeklyKcal),
      weeklyBurnKcal: Math.round(todayBurn * Math.max(1, homeWeekTrainedCount)),
      targetKcal: fuelEnergyBalance?.adjustedTargetKcal ?? fuelProfile.targetKcal,
    }
  }, [fuelProfile, fuelWeekMacros, fuelEnergyBalance, homeWeekTrainedCount])

  const handleSaveFuelProfile = async (profile: Omit<FuelProfile, 'updatedAt'>) => {
    setSavingFuel(true)
    try {
      const saved = { ...profile, updatedAt: Date.now() }
      if (!isDemoMode && db && firebaseUser?.uid) {
        await saveFuelProfile(db, effectiveUserId, profile)
        toast.success('Perfil Fuel guardado', {
          description: `Target: ${profile.targetKcal} kcal/dÃ­a`,
        })
      } else {
        toast.success('Perfil Fuel guardado (demo)', {
          description: `Target: ${profile.targetKcal} kcal/dÃ­a`,
        })
      }
      setFuelProfile(saved)
      setShowFuelSetupModal(false)
      setShowFuelSetupWizard(false)
      if (!isDemoMode && db && firebaseUser?.uid) {
        void refreshFuelData()
      }
    } catch (e) {
      console.error('Fuel profile save failed', e)
      toast.error('No se pudo guardar el perfil Fuel', {
        description: e instanceof Error ? e.message : 'Revisa conexiÃ³n e inicio de sesiÃ³n',
      })
    } finally {
      setSavingFuel(false)
    }
  }

  const handleAnalyzeFood = async (imageBase64: string, mealDescription?: string) => {
    try {
      const result = await analyzeFoodWithAi({
        imageBase64: imageBase64 || undefined,
        mealDescription,
        fuelContext: buildFuelAnalyzeContext(fuelProfile, fuelTodayTotals, fuelEnergyBalance),
      })
      if (result.source === 'gemini') {
        toast.success('Fuel AI Â· Gemini', {
          description: `${result.kcal} kcal estimadas â€” revisa y guarda si cuadra.`,
        })
      } else if (result.geminiErrorMessage) {
        toast.error('Gemini no disponible', {
          description: result.geminiErrorMessage,
          duration: 8000,
        })
      } else {
        toast.message('EstimaciÃ³n aproximada', {
          description: 'Usando heurÃ­stica local. Ajusta manualmente si hace falta.',
        })
      }
      return result
    } catch (e) {
      console.warn('Fuel AI analyze failed', e)
      const fallback = estimateMacrosFromDescription(mealDescription || 'Comida')
      toast.message('Fuel AI no disponible', { description: 'Usando estimaciÃ³n local.' })
      return { ...fallback, source: 'heuristic' as const }
    }
  }

  const handleSaveFuelLog = async (payload: {
    editId?: string
    mealLabel: string
    kcal: number
    proteinG: number
    carbsG: number
    fatG: number
    photoDataUrl?: string
    source: 'manual' | 'photo_ai' | 'text_ai'
    publishToMuro: boolean
  }) => {
    setSavingFuel(true)
    try {
      if (payload.editId) {
        if (!isDemoMode && db && firebaseUser?.uid) {
          await updateFuelLog(db, payload.editId, {
            mealLabel: payload.mealLabel,
            kcal: payload.kcal,
            proteinG: payload.proteinG,
            carbsG: payload.carbsG,
            fatG: payload.fatG,
            source: payload.source,
          })
          const nextLogs = fuelTodayLogs.map((log) =>
            log.id === payload.editId
              ? {
                  ...log,
                  mealLabel: payload.mealLabel,
                  kcal: payload.kcal,
                  proteinG: payload.proteinG,
                  carbsG: payload.carbsG,
                  fatG: payload.fatG,
                  source: payload.source,
                }
              : log
          )
          syncFuelDayState(nextLogs)
          fetchFuelWeekSummary(db, effectiveUserId)
            .then(setFuelWeekDays)
            .catch(() => {})
          fetchFuelWeekMacros(db, effectiveUserId)
            .then(setFuelWeekMacros)
            .catch(() => {})
          void refreshFuelData()
        } else {
          const nextLogs = fuelTodayLogs.map((log) =>
            log.id === payload.editId
              ? {
                  ...log,
                  mealLabel: payload.mealLabel,
                  kcal: payload.kcal,
                  proteinG: payload.proteinG,
                  carbsG: payload.carbsG,
                  fatG: payload.fatG,
                  source: payload.source,
                }
              : log
          )
          syncFuelDayState(nextLogs)
        }
        toast.success('Comida actualizada')
        setEditingFuelLog(null)
        setShowFuelLogModal(false)
        return
      }

      let photoUrl: string | undefined
      if (payload.photoDataUrl?.startsWith('data:') && storage && firebaseUser?.uid && !isDemoMode) {
        try {
          const { ref, uploadString, getDownloadURL } = await import('firebase/storage')
          const path = `fuel/${effectiveUserId}/${Date.now()}.jpg`
          const storageRef = ref(storage, path)
          const snap = await uploadString(storageRef, payload.photoDataUrl, 'data_url')
          photoUrl = await getDownloadURL(snap.ref)
        } catch (e) {
          console.warn('fuel photo upload failed', e)
        }
      }

      const preview: NutritionPreview = {
        mealLabel: payload.mealLabel,
        kcal: payload.kcal,
        proteinG: payload.proteinG,
        carbsG: payload.carbsG,
        fatG: payload.fatG,
      }

      if (!isDemoMode && db && firebaseUser?.uid) {
        const entry = await saveFuelLog(db, {
          userId: effectiveUserId,
          date: toLocalDateStr(),
          mealLabel: payload.mealLabel,
          kcal: payload.kcal,
          proteinG: payload.proteinG,
          carbsG: payload.carbsG,
          fatG: payload.fatG,
          photoUrl,
          source: payload.source,
        })
        const nextLogs = [entry, ...fuelTodayLogs]
        syncFuelDayState(nextLogs)
        fetchFuelWeekSummary(db, effectiveUserId)
          .then(setFuelWeekDays)
          .catch(() => {})
        fetchFuelWeekMacros(db, effectiveUserId)
          .then(setFuelWeekMacros)
          .catch(() => {})

        let publishedToMuro = false
        if (payload.publishToMuro) {
          try {
            const postId = await createNutritionPost(db, effectiveUserId, preview, photoUrl)
            const post: ProfilePost = {
              id: postId,
              userId: effectiveUserId,
              text: `ðŸ½ Fuel check â€” ${preview.mealLabel}: ${preview.kcal} kcal Â· P${preview.proteinG} C${preview.carbsG} G${preview.fatG}`,
              photo: photoUrl,
              timestamp: Date.now(),
              pinned: false,
              likes: [],
              comments: [],
              postType: 'nutrition',
              nutritionPreview: preview,
              reactions: {},
            }
            setProfilePosts((prev) => {
              const current = prev[effectiveUserId] || []
              const newState = { ...prev, [effectiveUserId]: [post, ...current].slice(0, 10) }
              profilePostsRef.current = newState
              return newState
            })
            subscribeCommentsForPosts([post])
            setRecentlyPublishedPostId(postId)
            setTimeout(() => setRecentlyPublishedPostId(null), 4000)
            if (activeTab === 'home') loadGlobalFeed().catch(() => {})
            publishedToMuro = true
          } catch (muroErr) {
            console.warn('Fuel muro publish failed (meal saved)', muroErr)
            toast.message('Comida guardada', {
              description: 'No se pudo publicar en el muro â€” el registro Fuel sÃ­ quedÃ³.',
            })
          }
        }
        if (!payload.publishToMuro || publishedToMuro) {
          toast.success('Comida registrada', {
            description: publishedToMuro
              ? 'Publicada en el muro'
              : `${payload.kcal} kcal sumadas hoy`,
          })
        }
        void refreshFuelData()
      } else {
        const demoEntry: FuelLogEntry = {
          id: 'fuel' + Date.now(),
          userId: effectiveUserId,
          date: toLocalDateStr(),
          mealLabel: payload.mealLabel,
          kcal: payload.kcal,
          proteinG: payload.proteinG,
          carbsG: payload.carbsG,
          fatG: payload.fatG,
          source: payload.source,
          createdAt: Date.now(),
        }
        const nextLogs = [demoEntry, ...fuelTodayLogs]
        syncFuelDayState(nextLogs)
        toast.success('Comida registrada (demo)')
      }
      setEditingFuelLog(null)
      setShowFuelLogModal(false)
    } catch (e) {
      console.error('Fuel log save failed', e)
      toast.error('No se pudo guardar la comida', {
        description: e instanceof Error ? e.message : 'Revisa conexiÃ³n e inicio de sesiÃ³n',
      })
    } finally {
      setSavingFuel(false)
    }
  }

  const handleEditFuelLog = (log: FuelLogEntry) => {
    setEditingFuelLog(log)
    setShowFuelLogModal(true)
  }

  const handleDeleteFuelLog = async (logId: string) => {
    setDeletingFuelLogId(logId)
    try {
      if (!isDemoMode && db && firebaseUser?.uid) {
        await deleteFuelLog(db, logId)
        const nextLogs = fuelTodayLogs.filter((log) => log.id !== logId)
        syncFuelDayState(nextLogs)
        fetchFuelWeekSummary(db, effectiveUserId)
          .then(setFuelWeekDays)
          .catch(() => {})
        fetchFuelWeekMacros(db, effectiveUserId)
          .then(setFuelWeekMacros)
          .catch(() => {})
      } else {
        const nextLogs = fuelTodayLogs.filter((log) => log.id !== logId)
        syncFuelDayState(nextLogs)
      }
      toast.success('Comida eliminada')
    } catch (e) {
      console.error('Fuel log delete failed', e)
      toast.error('No se pudo eliminar la comida')
    } finally {
      setDeletingFuelLogId(null)
    }
  }

  const likeProfilePost = async (postId: string, postUserId: string) => {
    let posts = profilePosts[postUserId] || []
    let idx = posts.findIndex((p) => p.id === postId)
    let post = idx >= 0 ? posts[idx] : null
    let ownerId = postUserId

    if (!post && !isDemoMode && db) {
      try {
        const remote = await fetchProfilePostById(db, postId)
        if (remote) {
          post = remote
          ownerId = remote.userId
          posts = profilePosts[ownerId] || []
          idx = posts.findIndex((p) => p.id === postId)
        }
      } catch (e) {
        console.warn('likeProfilePost fetch failed', e)
      }
    }

    if (!post) return

    const hasLiked = post.likes.includes(effectiveUserId)
    const newLikes = hasLiked
      ? post.likes.filter((id) => id !== effectiveUserId)
      : [...post.likes, effectiveUserId]
    const updatedPost = { ...post, likes: newLikes }
    const newPosts = idx >= 0 ? [...posts] : [updatedPost, ...posts]
    if (idx >= 0) newPosts[idx] = updatedPost

    if (!isDemoMode && db && firebaseUser?.uid) {
      try {
        await togglePostLikeInFirestore(db, postId, effectiveUserId, hasLiked)
        setProfilePosts((prev) => {
          const newState = { ...prev, [ownerId]: newPosts.slice(0, 30) }
          profilePostsRef.current = newState
          return newState
        })
      } catch (e) {
        console.warn(e)
        toast.error('No se pudo dar like', {
          description: 'Revisa permisos o conexiÃ³n e intenta de nuevo.',
        })
        return
      }
    } else {
      const updated = { ...profilePosts, [ownerId]: newPosts.slice(0, 30) }
      saveProfilePosts(updated, { persistLocal: isDemoMode })
    }
    if (!hasLiked && ownerId !== effectiveUserId) {
      addNotification({
        type: 'message',
        title: 'Â¡Like en tu muro!',
        body: `${currentUser?.name || 'Alguien'} le gustÃ³ tu publicaciÃ³n`,
        relatedId: ownerId
      })
    }
  }

  // TOP UPDATE v0.1.7: Quick reactions on feed posts (optimistic, super attractive social boost)
  const boostReaction = async (postId: string, emoji: string, postOwnerId: string) => {
    if (!postOwnerId) postOwnerId = effectiveUserId

    let posts = profilePosts[postOwnerId] || []
    let idx = posts.findIndex((p) => p.id === postId)
    let post = idx >= 0 ? posts[idx] : null
    let ownerId = postOwnerId

    if (!post && !isDemoMode && db) {
      try {
        const remote = await fetchProfilePostById(db, postId)
        if (remote) {
          post = remote
          ownerId = remote.userId
          posts = profilePosts[ownerId] || []
          idx = posts.findIndex((p) => p.id === postId)
        }
      } catch (e) {
        console.warn('boostReaction fetch failed', e)
      }
    }

    if (!post) return

    const currentReactors = (post.reactions && post.reactions[emoji]) || []
    const hasReacted = currentReactors.includes(effectiveUserId)
    const newReactors = hasReacted
      ? currentReactors.filter((id) => id !== effectiveUserId)
      : [...currentReactors, effectiveUserId]
    const newReactions = { ...(post.reactions || {}), [emoji]: newReactors }

    const updatedPost = { ...post, reactions: newReactions }
    const newPosts = idx >= 0 ? [...posts] : [updatedPost, ...posts]
    if (idx >= 0) newPosts[idx] = updatedPost

    setProfilePosts((prev) => ({ ...prev, [ownerId]: newPosts.slice(0, 30) }))

    setFeedReactions((prev) => {
      const forPost = prev[postId] || {}
      return {
        ...prev,
        [postId]: { ...forPost, [emoji]: newReactors.length }
      }
    })

    toast.success(emoji, { duration: 600, className: 'text-lg' })
    triggerHaptic('light')

    if (!isDemoMode && db && firebaseUser?.uid) {
      try {
        await persistPostReactionsInFirestore(db, postId, newReactions)
      } catch (e) {
        console.warn('reaction persist failed', e)
        toast.error('No se pudo guardar la reacciÃ³n', {
          description: 'Revisa permisos o conexiÃ³n e intenta de nuevo.',
        })
      }
    }
  }

  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  useEffect(() => {
    latestRealProfilesRef.current = realProfiles
  }, [realProfiles])

  useEffect(() => {
    syncBondsRef.current = syncBonds
  }, [syncBonds])

  useEffect(() => {
    showFullProfileRef.current = setShowFullProfile
  }, [setShowFullProfile])

  type PostLocation = { posts: ProfilePost[]; idx: number; resolvedUserId: string }

  const findPostInProfilePosts = (postId: string, postUserId: string, source?: Record<string, ProfilePost[]>): PostLocation | null => {
    const store = source || profilePostsRef.current
    const resolved = resolvePostOwnerId(postUserId)
    const tryUser = (uid: string): PostLocation | null => {
      const posts = store[uid] || []
      const idx = posts.findIndex((p) => p.id === postId)
      return idx >= 0 ? { posts, idx, resolvedUserId: uid } : null
    }
    return tryUser(resolved) || tryUser(postUserId) || Object.keys(store).map(tryUser).find(Boolean) || null
  }

  const addCommentToPost = async (postId: string, postUserId: string, text: string): Promise<boolean> => {
    const trimmed = text.trim()
    if (!trimmed) return false

    const comment: PostComment = {
      id: createCommentId(),
      userId: effectiveUserId,
      userName: currentUser?.name || 'TÃº',
      text: trimmed,
      timestamp: Date.now(),
      _pending: !isDemoMode,
    }

    let hit = findPostInProfilePosts(postId, postUserId)
    if (!hit && !isDemoMode && db) {
      await loadProfilePosts(postUserId).catch(() => {})
      hit = findPostInProfilePosts(postId, postUserId)
    }
    if (!hit) {
      toast.error('No se encontrÃ³ la publicaciÃ³n', { description: 'Recarga el muro e intÃ©ntalo de nuevo.' })
      return false
    }

    const post = hit.posts[hit.idx]
    const newPosts = [...hit.posts]
    newPosts[hit.idx] = { ...post, comments: [...(post.comments || []), comment as ProfilePost['comments'][0]] }
    saveProfilePosts(
      { ...profilePostsRef.current, [hit.resolvedUserId]: newPosts },
      { persistLocal: isDemoMode }
    )
    ensurePostCommentsListener(postId, post.comments || [])

    if (!isDemoMode && db && firebaseUser?.uid) {
      const fsOk = await writeCommentToFirestore(db, postId, comment, sanitizeForFirestore)
      if (!fsOk) {
        toast('Comentario visible localmente', {
          description: 'No se pudo guardar en el servidor. Se reintentarÃ¡ al sincronizar.',
          duration: 3500,
        })
      }
    }

    if (hit.resolvedUserId !== effectiveUserId) {
      addNotification({
        type: 'message',
        title: 'Comentario en tu muro',
        body: `${currentUser?.name || 'Alguien'}: ${trimmed.substring(0, 60)}`,
        relatedId: hit.resolvedUserId,
      })
    }
    return true
  }

  const deleteProfilePost = async (postId: string, postUserId: string) => {
    if (postUserId !== effectiveUserId) return;
    const current = profilePosts[postUserId] || []
    const postToDelete = current.find(p => p.id === postId)
    // Optimistic delete + undo (no ugly confirm - better UX, rely on spectacular undo toast)
    if (!isDemoMode && db) {
      try {
        if (postToDelete?.workoutId) {
          await deleteWorkoutWithLinkedPost(db, postToDelete.workoutId, effectiveUserId)
          setEntrenoRecentWorkouts((prev) => prev.filter((x) => x.id !== postToDelete.workoutId))
        } else {
          const { doc, deleteDoc } = await import('firebase/firestore')
          await deleteDoc(doc(db, 'profilePosts', postId))
        }
      } catch (e) { console.warn(e) }
    }
    const newList = current.filter(p => p.id !== postId)
    const updated = { ...profilePosts, [postUserId]: newList }
    saveProfilePosts(updated, { persistLocal: isDemoMode })  // delete uses save â€” triggers AnimatePresence exit

    // Spectacular UX: undo toast for delete
    toast.success('PublicaciÃ³n eliminada', {
      description: 'Toca Deshacer para recuperar',
      action: {
        label: 'Deshacer',
        onClick: () => {
          if (postToDelete) {
            const restored = { ...profilePosts, [postUserId]: [postToDelete, ...newList].slice(0,10) }
            saveProfilePosts(restored)
            // re-add to FS if real
            if (!isDemoMode && db) {
              (async () => {
                try {
                  const { doc, setDoc } = await import('firebase/firestore')
                  await setDoc(doc(db, 'profilePosts', postId), postToDelete)
                } catch(e){}
              })()
            }
            toast.success('PublicaciÃ³n recuperada')
          }
        }
      }
    })
  }

  // Delete extra profile photo from strip (spectacular profile polish - user can curate their gallery)
  const deleteExtraPhoto = async (indexToRemove: number) => {
    if (!currentUser?.photos || currentUser.photos.length === 0) return
    if (currentUser.photos.length === 1) {
      toast.error('Debes mantener al menos una foto principal en tu perfil')
      return
    }
    // Better UX: no ugly browser confirm, immediate action with success feedback (user can re-add if mistake)
    const newPhotos = currentUser.photos.filter((_, i) => i !== indexToRemove)
    const updated = { ...currentUser, photos: newPhotos }
    await saveUserWithRealSync(updated as CurrentUser)
    setLastSync(new Date())
    toast.success('Foto eliminada', { description: 'Puedes volver a aÃ±adirla desde el editor de perfil si fue un error.' })
  }

  // Drag reorder for gallery - makes profile curation powerful and "vivo". Works with native drag (desktop + modern mobile).
  const reorderGallery = (fromIndex: number, toIndex: number) => {
    if (!currentUser?.photos || fromIndex === toIndex) return
    const photos = [...currentUser.photos]
    const [moved] = photos.splice(fromIndex, 1)
    photos.splice(toIndex, 0, moved)
    const updated = { ...currentUser, photos }
    saveUserWithRealSync(updated as any)
    setLastSync(new Date())
    toast('GalerÃ­a reordenada', { description: 'El orden se guarda en tu perfil real' })
  }

  const persistSeenLiveJoinInteractions = useCallback(() => {
    trimSetToMax(seenLiveJoinInteractionIdsRef.current, MAX_SEEN_STRING_IDS)
    const uid = firebaseUser?.uid
    if (!uid || isDemoMode) return
    try {
      localStorage.setItem(
        seenLiveJoinsStorageKey(uid),
        JSON.stringify(pruneStringIdList(Array.from(seenLiveJoinInteractionIdsRef.current)))
      )
    } catch {
      reclaimLocalStorageSpace('soft')
    }
  }, [firebaseUser?.uid, isDemoMode])

  const markLiveJoinInteractionsAsSeen = useCallback((livePosts: ProfilePost[]) => {
    livePosts.forEach((post) => {
      ;(post.comments || []).forEach((c) => {
        if (c.id) seenLiveJoinInteractionIdsRef.current.add(c.id)
      })
      ;(post.likes || []).forEach((likerId) => {
        seenLiveJoinInteractionIdsRef.current.add(`${post.id}_like_${likerId}`)
      })
    })
  }, [])

  const isRecentLiveJoinComment = useCallback((timestamp: number | undefined): boolean => {
    const ts = Number(timestamp)
    if (!Number.isFinite(ts)) return false
    return ts >= appStartedAtRef.current - 3000
  }, [])

  const canShowLiveJoinToast = useCallback((): boolean => {
    return Date.now() - appStartedAtRef.current >= SESSION_TOAST_GRACE_MS
  }, [])

  // === LIVE JOIN NOTIFS (owner side) ===
  // Called after loading own profilePosts (or updates). Scans live "Entrenando ahora" posts for *new* comments/likes
  // from other people. Fires special urgency notif + toast so the live trainer knows people are joining in real time.
  // Deduped with seenLiveJoinInteractionIdsRef + persisted per uid. No burst on login/open.
  const processIncomingLiveJoins = () => {
    if (!currentUser?.trainingNow) return
    const myId = effectiveUserId
    const myPosts = profilePosts[myId] || []
    if (myPosts.length === 0) return

    const livePosts = myPosts.filter((p) => {
      const t = (p.text || '').toLowerCase()
      return t.includes('entrenando ahora') || t.includes('live') || t.includes('entreno ahora')
    })

    // Silently mark historical joins so async comment loads never re-toast on session open.
    let sweptStale = false
    livePosts.forEach((post) => {
      ;(post.comments || []).forEach((c) => {
        if (!c.id || seenLiveJoinInteractionIdsRef.current.has(c.id)) return
        if (!isRecentLiveJoinComment(c.timestamp)) {
          seenLiveJoinInteractionIdsRef.current.add(c.id)
          sweptStale = true
        }
      })
      const postIsRecent = isRecentLiveJoinComment(post.timestamp)
      ;(post.likes || []).forEach((likerId) => {
        const likeKey = `${post.id}_like_${likerId}`
        if (seenLiveJoinInteractionIdsRef.current.has(likeKey)) return
        if (!postIsRecent) {
          seenLiveJoinInteractionIdsRef.current.add(likeKey)
          sweptStale = true
        }
      })
    })

    if (!liveJoinsBootstrappedRef.current) {
      liveJoinsBootstrappedRef.current = true
      markLiveJoinInteractionsAsSeen(livePosts)
      persistSeenLiveJoinInteractions()
      return
    }

    if (sweptStale) {
      persistSeenLiveJoinInteractions()
    }

    if (!canShowLiveJoinToast()) return

    let newJoinDetected = false
    const pendingJoinNotifs: Notification[] = []
    livePosts.forEach((post) => {
      ;(post.comments || []).forEach((c) => {
        if (!c.userId || c.userId === myId || !c.id) return
        if (seenLiveJoinInteractionIdsRef.current.has(c.id)) return
        if (!isRecentLiveJoinComment(c.timestamp)) {
          seenLiveJoinInteractionIdsRef.current.add(c.id)
          newJoinDetected = true
          return
        }
        seenLiveJoinInteractionIdsRef.current.add(c.id)
        newJoinDetected = true
        pendingJoinNotifs.push({
          id: 'notif' + Date.now() + '-' + c.id,
          type: 'session_join',
          title: 'ðŸ”¥ Â¡Alguien se uniÃ³ a tu live!',
          body: `${c.userName || 'Un compaÃ±ero'} se uniÃ³ a tu entrenamiento en vivo`,
          relatedId: c.userId,
          timestamp: Date.now(),
          read: false,
        })
        toast(`ðŸ”¥ ${c.userName || 'Alguien'} se uniÃ³ a tu live`, {
          description: 'Â¡Abre tu muro o chatea con ellos!',
          action: {
            label: 'Ver perfil',
            onClick: () => {
              const joiner = [...realProfiles, ...SEED_PROFILES].find((p) => p.id === c.userId)
              if (joiner) setShowFullProfile(joiner as any)
              else setActiveTab('home')
            },
          },
        })
      })

      if (!isRecentLiveJoinComment(post.timestamp)) return

      ;(post.likes || []).forEach((likerId) => {
        const likeKey = `${post.id}_like_${likerId}`
        if (likerId === myId || seenLiveJoinInteractionIdsRef.current.has(likeKey)) return
        seenLiveJoinInteractionIdsRef.current.add(likeKey)
        newJoinDetected = true
        const likerProfile = [...realProfiles, ...SEED_PROFILES].find((p) => p.id === likerId)
        const likerName = likerProfile?.name || 'Un compaÃ±ero'
        pendingJoinNotifs.push({
          id: 'notif' + Date.now() + '-' + likeKey,
          type: 'session_join',
          title: 'â¤ï¸ Â¡Like en tu post live!',
          body: `${likerName} le dio like a tu "Entrenando ahora"`,
          relatedId: likerId,
          timestamp: Date.now(),
          read: false,
        })
        toast(`â¤ï¸ ${likerName} se sumÃ³ a tu live`, {
          description: 'Â¡Tu post en vivo estÃ¡ generando movimiento!',
        })
      })
    })

    if (pendingJoinNotifs.length > 0) {
      saveNotifications([...pendingJoinNotifs, ...notifications])
    }

    if (newJoinDetected) {
      persistSeenLiveJoinInteractions()
    }
  }

  // Call the processor whenever own posts update while live (catches real joins via FS comments)
  useEffect(() => {
    if (!currentUser?.trainingNow) {
      liveJoinsBootstrappedRef.current = false
      return
    }
    processIncomingLiveJoins()
  }, [profilePosts, currentUser?.trainingNow])

  // Attractive inline comment composer (no more prompt dialogs on muro)
  const commentSubmittingRef = useRef(false)

  const startComment = (postId: string, postUserId: string, ownerName?: string) => {
    const hit = findPostInProfilePosts(postId, postUserId)
    setActiveComment({ postId, postUserId: hit?.resolvedUserId || resolvePostOwnerId(postUserId), ownerName })
    setCommentDraft('')
    if (hit) ensurePostCommentsListener(postId, hit.posts[hit.idx]?.comments || [])
  }
  const submitComment = async () => {
    const target = activeComment
    const text = commentDraft.trim()
    if (!target || !text || commentSubmittingRef.current) return
    commentSubmittingRef.current = true
    try {
      const ok = await addCommentToPost(target.postId, target.postUserId, text)
      if (ok) {
        setActiveComment(null)
        setCommentDraft('')
        toast.success('Comentario enviado')
      }
    } finally {
      commentSubmittingRef.current = false
    }
  }
  const cancelComment = () => {
    setActiveComment(null)
    setCommentDraft('')
  }

  // Open rich full-comments modal (spectacular thread view)
  const openFullComments = (postId: string, postUserId: string, ownerName?: string) => {
    const hit = findPostInProfilePosts(postId, postUserId)
    setViewingPostComments({
      postId,
      postUserId: hit?.resolvedUserId || resolvePostOwnerId(postUserId),
      ownerName
    })
    setModalCommentDraft('')
    setActiveComment(null)
    setCommentDraft('')
    if (hit) ensurePostCommentsListener(postId, hit.posts[hit.idx]?.comments || [])
    else ensurePostCommentsListener(postId, [])
  }

  const submitModalComment = async () => {
    const target = viewingPostComments
    const text = modalCommentDraft.trim()
    if (!target || !text || commentSubmittingRef.current) return
    commentSubmittingRef.current = true
    try {
      const ok = await addCommentToPost(target.postId, target.postUserId, text)
      if (ok) {
        setModalCommentDraft('')
        toast.success('Comentario enviado')
      }
    } finally {
      commentSubmittingRef.current = false
    }
  }

  const closeFullComments = () => {
    setViewingPostComments(null)
    setModalCommentDraft('')
  }

  // Delete own comment from post (polish for spectacular muro)
  const deleteCommentFromPost = async (postId: string, postUserId: string, commentId: string) => {
    if (!confirm('Â¿Eliminar tu comentario?')) return
    const hit = findPostInProfilePosts(postId, postUserId)
    if (!hit) return
    const post = hit.posts[hit.idx]
    const newComments = (post.comments || []).filter((c: any) => c.id !== commentId)
    const newPosts = [...hit.posts]
    newPosts[hit.idx] = { ...post, comments: newComments }
    saveProfilePosts(
      { ...profilePostsRef.current, [hit.resolvedUserId]: newPosts },
      { persistLocal: isDemoMode }
    )

    if (!isDemoMode && db && firebaseUser?.uid) {
      const ok = await deleteCommentFromFirestore(db, postId, commentId)
      if (!ok) {
        toast.error('No se pudo eliminar en el servidor')
      }
    }
    toast.success('Comentario eliminado')
  }

  // Cleanup Firestore comment listeners on unmount
  useEffect(() => {
    return () => {
      Object.keys(postCommentUnsubsRef.current).forEach((postId) => {
        postCommentUnsubsRef.current[postId]?.()
      })
      postCommentUnsubsRef.current = {}
      postCommentInlineFallbackRef.current = {}
    }
  }, [])

  // Real-time comments while modal or inline composer is open
  useEffect(() => {
    if (isDemoMode || !db) return
    if (viewingPostComments?.postId) {
      const hit = findPostInProfilePosts(viewingPostComments.postId, viewingPostComments.postUserId)
      ensurePostCommentsListener(viewingPostComments.postId, hit?.posts[hit?.idx ?? -1]?.comments || [])
    }
    if (activeComment?.postId) {
      const hit = findPostInProfilePosts(activeComment.postId, activeComment.postUserId)
      ensurePostCommentsListener(activeComment.postId, hit?.posts[hit?.idx ?? -1]?.comments || [])
    }
  }, [isDemoMode, viewingPostComments, activeComment, ensurePostCommentsListener])

  // Comment listeners: visible feed posts only on Home; prune elsewhere (perf).
  useEffect(() => {
    if (isDemoMode) return

    const keepIds = new Set<string>()
    if (viewingPostComments?.postId) keepIds.add(viewingPostComments.postId)
    if (activeComment?.postId) keepIds.add(activeComment.postId)

    if (activeTab === 'home') {
      for (const row of feedComputation.feedPosts.slice(0, feedDisplayLimit)) {
        const postId = row.id as string | undefined
        if (!postId) continue
        keepIds.add(postId)
        const ownerId = row.ownerId as string
        const hit = findPostInProfilePosts(postId, ownerId)
        ensurePostCommentsListener(postId, hit?.posts[hit.idx]?.comments || [])
      }
    } else {
      for (const p of profilePostsRef.current[effectiveUserId] || []) {
        if (p?.id) keepIds.add(p.id)
      }
      if (showFullProfile?.id) {
        for (const p of profilePostsRef.current[showFullProfile.id] || []) {
          if (p?.id) keepIds.add(p.id)
        }
      }
    }

    Object.keys(postCommentUnsubsRef.current).forEach((postId) => {
      if (!keepIds.has(postId)) releasePostCommentsListener(postId)
    })
  }, [
    isDemoMode,
    activeTab,
    feedComputation.feedPosts,
    feedDisplayLimit,
    effectiveUserId,
    showFullProfile?.id,
    viewingPostComments?.postId,
    activeComment?.postId,
    ensurePostCommentsListener,
    releasePostCommentsListener,
  ])

  // Edit own muro post (inline for spectacular UX, no prompt)
  const startEditPost = (postId: string, postUserId: string, currentText: string) => {
    if (postUserId !== effectiveUserId) return
    setEditingPost({ postId, postUserId, text: currentText })
    setEditDraft(currentText)
  }
  const saveEditPost = async () => {
    if (!editingPost || !editDraft.trim()) return
    const { postId, postUserId } = editingPost
    const newText = editDraft.trim()

    // Update local state
    setProfilePosts((prev) => {
      const posts = prev[postUserId] || []
      const updatedPosts = posts.map(p => p.id === postId ? { ...p, text: newText } : p)
      const newState = { ...prev, [postUserId]: updatedPosts }
      if (isDemoMode) {
        try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(newState)) } catch {}
      }
      return newState
    })

    if (!isDemoMode && db) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'profilePosts', postId), { text: newText })
      } catch (e) { console.warn('edit post fs', e) }
    }
    setEditingPost(null)
    setEditDraft('')
    toast.success('PublicaciÃ³n editada')
  }
  const cancelEditPost = () => {
    setEditingPost(null)
    setEditDraft('')
  }

  // Pin/unpin own post - spectacular for global feed (pinned appear first)
  const togglePinPost = async (postId: string, postUserId: string, currentPinned: boolean = false) => {
    if (postUserId !== effectiveUserId) return;
    const newPinned = !currentPinned;

    // Update local
    setProfilePosts((prev) => {
      const posts = prev[postUserId] || [];
      const updatedPosts = posts.map(p => p.id === postId ? { ...p, pinned: newPinned } : p);
      const newState = { ...prev, [postUserId]: updatedPosts };
      if (isDemoMode) {
        try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(newState)) } catch {}
      }
      return newState;
    });

    if (!isDemoMode && db) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'profilePosts', postId), { pinned: newPinned });
      } catch (e) { console.warn('pin post fs', e); }
    }

    toast.success(newPinned ? 'Post fijado en el feed' : 'Post des-fijado');
  }

  const saveBlockedUsers = async (newBlocked: string[]) => {
    localStorage.setItem('entrenamatch_blocked', JSON.stringify(newBlocked))
    setBlockedUsers(newBlocked)
    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'profiles', firebaseUser.uid), { blockedUsers: newBlocked })
      } catch (e) { console.warn(e) }
    }
  }

  const saveReports = (newReports: Report[]) => {
    localStorage.setItem('entrenamatch_reports', JSON.stringify(newReports))
    setReports(newReports)
  }

  const persistGroupSeenIds = () => {
    Object.keys(seenGroupMsgIdsRef.current).forEach((k) => {
      trimSetToMax(seenGroupMsgIdsRef.current[k], MAX_SEEN_IDS_PER_CHAT)
    })
    const groupObj: Record<string, string[]> = {}
    Object.keys(seenGroupMsgIdsRef.current).forEach((k) => {
      groupObj[k] = Array.from(seenGroupMsgIdsRef.current[k])
    })
    try {
      localStorage.setItem('entrenamatch_seen_group_msgs', JSON.stringify(pruneSeenIdMap(groupObj)))
    } catch {
      reclaimLocalStorageSpace('soft')
    }
  }

  const handleNotificationClick = useCallback(
    (notif: Notification) => {
      markNotificationRead(notif.id)

      const target = resolveNotificationTarget(notif, { sessionIds: knownSessionIds })
      if (target) {
        const partnerHint =
          target.startSyncWith && notif.relatedId
            ? realProfiles.find((p) => p.id === notif.relatedId)?.name ||
              SEED_PROFILES.find((p) => p.id === notif.relatedId)?.name
            : undefined
        applyNotificationNavigation(target, partnerHint)
      }
    },
    [markNotificationRead, knownSessionIds, realProfiles, applyNotificationNavigation]
  )

  // Request browser Notification permission for web (real users). Safe no-op on native or denied.
  const requestWebNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    // Skip if running in Capacitor native (use plugin instead)
    const isNative = typeof (window as any).Capacitor !== 'undefined'
    if (isNative) return
    if (Notification.permission === 'default') {
      try {
        const perm = await Notification.requestPermission()
        if (perm === 'granted') {
          toast.success('Notificaciones web activadas', { description: 'Te avisaremos de mensajes nuevos aunque la pestaÃ±a estÃ© oculta' })
        }
      } catch (e) {
        console.warn('Web Notification permission request failed', e)
      }
    }
  }

  // Explicit activation for native push (called from Profile button). Robust against missing config.
  const requestNativePushPermission = async () => {
    if (!Capacitor.isNativePlatform()) {
      await requestWebNotificationPermission()
      return
    }
    if (!PushNotifications) {
      toast.error('Notificaciones nativas no disponibles', {
        description: 'Esta build del APK no tiene google-services.json configurado o el plugin no cargÃ³. Revisa la consola para detalles.'
      })
      return
    }
    try {
      const perm = await PushNotifications.requestPermissions()
      const receive = perm && (perm.receive || perm.notifications || '')
      if (receive === 'granted') {
        await PushNotifications.register()
        // Ensure the red network high priority channel exists
        if (Capacitor.getPlatform() === 'android') {
          try {
            await PushNotifications.createChannel({
              id: 'network_activity',
              name: 'Actividad de tu Red (EntrenaSync)',
              description: 'Notificaciones cuando alguien de tu red entra en vivo o inicia un sync',
              importance: 5,
              visibility: 1,
              sound: 'default',
              lights: true,
              lightColor: '#FF671F',
              vibration: true,
            })
          } catch {}
        }
        toast.success('Notificaciones push nativas activadas', {
          description: 'Ahora recibirÃ¡s alertas reales en tu celular incluso con la app cerrada (mejor que web).'
        })
      } else if (receive === 'denied') {
        toast('Permiso denegado', {
          description: 'Ve a Ajustes del telÃ©fono > Apps > EntrenaMatch > Notificaciones y actÃ­valo manualmente.'
        })
      } else {
        toast('Permiso de notificaciones solicitado', {
          description: 'Si ves el diÃ¡logo del sistema, elige "Permitir".'
        })
      }
    } catch (e: any) {
      console.error('Native push activation error', e)
      toast.error('Error activando notificaciones nativas', {
        description: (e?.message || 'Revisa google-services.json y que el package sea com.entrenamatch.app') + ' â€” contacta al equipo para una build actualizada.'
      })
    }
  }

  // Central helper: show in-app toast + central notif + browser notif (if hidden) + bump unread for a message arrival.
  // Safe to call from bg listeners. name = display name of sender, chatId for 1:1 or sessionId for group.
  const triggerMessageArrivalNotification = (chatId: string, name: string, text: string, isGroup: boolean, photoUrl?: string) => {
    const short = (text || (photoUrl ? '[foto]' : 'Nuevo mensaje')).substring(0, 80)
    const title = isGroup ? `${name} en sesiÃ³n` : `Mensaje de ${name}`

    // Rich avatar + context for in-app toast (enriched for better UX)
    const avatarEl = photoUrl ? (
      <img 
        src={photoUrl} 
        alt={name} 
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-[#FF671F]/70" 
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF671F] to-[#FF4F79] text-black flex items-center justify-center text-xs font-bold flex-shrink-0 ring-1 ring-white/30">
        {name.charAt(0).toUpperCase()}
      </div>
    )

    // Enhanced attractive in-app toast for messages (more visual pop, especially for legends)
    const isNetworkMsg = !isGroup && !!syncBonds[chatId] // from your training network / red
    const toastTitle = isNetworkMsg ? `â­ Mensaje de tu Red (Fuerza del equipo) ${name}` : title
    const toastClass = isNetworkMsg ? 'network-message-toast' : '' // network msg gold for your red
    toast.info(toastTitle, {
      description: (
        <div className={`flex items-start gap-3 mt-1 ${isNetworkMsg ? 'network-toast-content' : ''}`}>
          {avatarEl}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-[#cbd5e1] truncate leading-tight font-medium">{short}</div>
            <div className="text-[10px] text-[#9CA3AF] mt-1 flex items-center gap-1.5">
              {isGroup ? 'ðŸ‘¥ Chat grupal â€¢ En vivo' : 'ðŸ’¬ Mensaje 1:1 â€¢ En vivo'}
              {isNetworkMsg && <span className="px-1.5 py-0 rounded bg-[#FFD700] text-black text-[9px] font-bold">â­ RED</span>}
            </div>
          </div>
        </div>
      ),
      action: {
        label: isNetworkMsg ? 'Responder a tu Red' : 'Ver',
        onClick: () => openMessageNotificationTarget(chatId, name, isGroup),
      },
      duration: 8000,
      className: toastClass
    })
    // Feed the existing notifications panel
    addNotification({
      type: 'message',
      title,
      body: short,
      relatedId: chatId,
      photoUrl: photoUrl
    })
    // Browser Notification if page hidden and permission granted (web only) + user pref allows messages
    if (notifPrefs.messages && typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
      try {
        const n = new Notification(title + ' â€” EntrenaMatch', {
          body: short,
          icon: photoUrl || '/entrenamatch/favicon.svg',
          tag: 'entrenamatch-msg-' + chatId // collapse duplicates
        })
        n.onclick = () => {
          window.focus()
          setTimeout(() => openMessageNotificationTarget(chatId, name, isGroup), 0)
        }
      } catch (e) {
        console.warn('Browser Notification failed', e)
      }
    }
    // Bump local unread counters (for tab + row badges)
    if (isGroup) {
      setSessionUnreads(prev => ({ ...prev, [chatId]: (prev[chatId] || 0) + 1 }))
    } else {
      setChatUnreads(prev => ({ ...prev, [chatId]: (prev[chatId] || 0) + 1 }))
    }
  }

  chatIncomingRef.current = (matchId, name, text, photo) =>
    triggerMessageArrivalNotification(matchId, name, text, false, photo)

  const submitTrainingReview = async (profileId: string) => {
    if (!currentUser) return

    const newReview: TrainingReview = {
      id: 'r' + Date.now(),
      reviewerId: firebaseUser?.uid || 'me',
      reviewerName: currentUser?.name || 'AnÃ³nimo',
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
      photo: reviewPhoto || undefined,
      timestamp: Date.now(),
      bookingId: pendingReviewBookingId || undefined,
    }

    if (!isDemoMode && db && firebaseUser?.uid) {
      try {
        newReview.id = await submitReviewToFirestore(db, profileId, {
          reviewerId: firebaseUser.uid,
          reviewerName: newReview.reviewerName,
          rating: newReview.rating,
          comment: newReview.comment,
          photo: newReview.photo,
          timestamp: newReview.timestamp,
          bookingId: newReview.bookingId,
        })
        if (pendingReviewBookingId) {
          await linkReviewToBooking(db, pendingReviewBookingId, newReview.id, newReview.rating)
        }
      } catch (e) {
        console.warn('Could not save review to Firestore', e)
      }
    }

    const existing = reviews[profileId] || []
    const updatedReviews = {
      ...reviews,
      [profileId]: [...existing, newReview]
    }

    saveReviews(updatedReviews)
    setShowReviewModalFor(null)
    setPendingReviewBookingId(null)
    setReviewComment('')
    setReviewPhoto(null)
    toast.success('Â¡ReseÃ±a enviada!', { description: 'Gracias por ayudar a la comunidad de EntrenaMatch' })
  }

  // Report a user (critical safety feature)
  const reportUser = async (userId: string, reason: string, details?: string, context: Report['context'] = 'profile', contextId?: string) => {
    if (!currentUser || userId === 'me') return

    const reportedProfile = realProfiles.find((p) => p.id === userId)
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const newReport: Report = {
      id: reportId,
      reporterId: firebaseUser?.uid || 'me',
      reportedUserId: userId,
      reporterName: currentUser.name,
      reportedUserName: reportedProfile?.name,
      reason: reason.trim() || 'Otra violaciÃ³n de las reglas de comunidad',
      details: details?.trim() || undefined,
      context,
      contextId,
      timestamp: Date.now(),
      status: 'pending',
    }

    const updatedReports = [...reports, newReport]
    saveReports(updatedReports)

    let firestoreOk = false
    if (!isDemoMode && db && firebaseUser) {
      try {
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
        await setDoc(doc(db, 'reports', reportId), {
          reporterId: firebaseUser.uid,
          reportedUserId: userId,
          reporterName: newReport.reporterName || null,
          reportedUserName: newReport.reportedUserName || null,
          reason: newReport.reason,
          details: newReport.details || null,
          context: newReport.context,
          contextId: newReport.contextId || null,
          timestamp: newReport.timestamp,
          status: 'pending',
          createdAt: serverTimestamp(),
        })
        firestoreOk = true
      } catch (e) {
        console.warn('Could not save report to FS', e)
        toast.error('No se pudo guardar el reporte en el servidor', {
          description: 'Reintenta con conexiÃ³n estable. El bloqueo local sÃ­ se aplicÃ³.',
        })
      }
    }

    // Auto-block after reporting (safety-first behavior)
    if (!blockedUsers.includes(userId)) {
      const newBlocked = [...blockedUsers, userId]
      saveBlockedUsers(newBlocked)
      if (!isDemoMode && db && firebaseUser?.uid) {
        void persistUserBlock(db, {
          blockerId: firebaseUser.uid,
          blockedId: userId,
          blockerName: currentUser?.name,
          blockedName: reportedProfile?.name,
          source: 'report',
          reportReason: newReport.reason,
          reportDetails: newReport.details,
          reportId: firestoreOk ? reportId : undefined,
        }).catch(() => {})
        try {
          const { doc, updateDoc } = await import('firebase/firestore')
          await updateDoc(doc(db, 'profiles', firebaseUser.uid), { blockedUsers: newBlocked })
        } catch { /* ignore */ }
      }
    }

    toast.success('Reporte enviado', {
      description: firestoreOk
        ? 'Gracias por reportar. El equipo Admin lo revisarÃ¡ y el usuario fue bloqueado para ti.'
        : 'Reporte guardado localmente. El usuario fue bloqueado para ti.',
    })
  }

  const openReport = (userId: string, context: Report['context'] = 'profile') => {
    setReportTargetId(userId)
    setReportContext(context)
    setReportReason('')
    setShowReportModal(true)
  }

  // Block a user
  const blockUser = async (userId: string) => {
    if (!currentUser || userId === 'me' || blockedUsers.includes(userId)) return

    const newBlocked = [...blockedUsers, userId]
    saveBlockedUsers(newBlocked)

    // Persist blocks to profile doc for real cross-device + real users
    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'profiles', firebaseUser.uid), { blockedUsers: newBlocked })
        const blockedProfile = realProfiles.find((p) => p.id === userId)
        await persistUserBlock(db, {
          blockerId: firebaseUser.uid,
          blockedId: userId,
          blockerName: currentUser?.name,
          blockedName: blockedProfile?.name,
          source: 'manual',
        })
      } catch (e) { console.warn('persist block failed', e) }
    }

    toast.success('Usuario bloqueado', { 
      description: 'No volverÃ¡s a verlo en descubrimiento, live, feed, mapa ni chats.' 
    })
  }

  // Unblock a user
  const unblockUser = async (userId: string) => {
    const newBlocked = blockedUsers.filter(id => id !== userId)
    saveBlockedUsers(newBlocked)

    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'profiles', firebaseUser.uid), { blockedUsers: newBlocked })
      } catch (e) {}
    }

    toast('Usuario desbloqueado')
  }

  // Real Authentication handlers (Phase 1)
  const handleGoogleAuth = async () => {
    if (isDemoMode || !isFirebaseConfigured) {
      setAuthError('Google Sign-In requiere Firebase real. Usa email/contraseÃ±a en demo.')
      return
    }

    setAuthLoading(true)
    setAuthError('')

    try {
      const result = await signInWithGoogle()

      if (result.mode === 'redirect') {
        toast('Redirigiendo a Googleâ€¦', { description: 'Vuelves a EntrenaMatch al terminar.' })
        return
      }

      const { profile, isNewUser } = await completeGoogleSignInProfile(result.user)
      lastSuccessfulAuthRef.current = result.user
      toast.success('SesiÃ³n iniciada con Google')

      if (profile) {
        saveUser({ ...profile, id: 'me' } as any)
      } else {
        saveUser({
          id: 'me' as any,
          name: result.user.displayName || '',
          age: 25,
          gender: 'hombre' as const,
          city: '',
          country: 'Chile',
          bio: '',
          photos: result.user.photoURL ? [result.user.photoURL] : [],
          trainingTypes: [],
          goals: [],
          level: 'Intermedio' as const,
          intensity: 'Moderado' as const,
          availability: ['Tarde'],
        } as any)
      }

      if (isNewUser) {
        setIsEditingProfile(false)
        setOnboardingStepLocal(0)
        setShowOnboarding(true)
      }
    } catch (error: unknown) {
      console.error(error)
      if (error instanceof GoogleAuthError) {
        setAuthError(error.message)
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          toast.error(error.message)
        }
      } else {
        setAuthError('No se pudo iniciar sesiÃ³n con Google')
        toast.error('No se pudo iniciar sesiÃ³n con Google')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleEmailAuth = async (isRegister: boolean) => {
    if (!authEmail || !authPassword) {
      setAuthError('Por favor completa email y contraseÃ±a')
      return
    }

    setAuthLoading(true)
    setAuthError('')

    let loggedInUser = null

    try {
      if (isDemoMode) {
        if (isRegister) {
          await signUpDemo(authEmail)
          toast.success('Cuenta creada exitosamente')
        } else {
          await signInDemo(authEmail)
          toast.success('SesiÃ³n iniciada')
        }
        loggedInUser = true // demo always "succeeds" for UI
      } else {
        if (isRegister) {
          const fbUser = await signUpWithEmail(authEmail, authPassword)
          toast.success('Cuenta creada exitosamente')
          loggedInUser = fbUser
          lastSuccessfulAuthRef.current = fbUser
        } else {
          const fbUser = await signInWithEmail(authEmail, authPassword)
          toast.success('SesiÃ³n iniciada')
          loggedInUser = fbUser
          lastSuccessfulAuthRef.current = fbUser
        }
      }
    } catch (error: any) {
      console.error(error)
      let friendlyError = 'Error en la autenticaciÃ³n'

      if (error.code === 'auth/email-already-in-use') {
        friendlyError = 'Este email ya estÃ¡ registrado.'
        // Auto-switch to login mode for better UX
        setAuthMode('login')
        // Keep the email so user doesn't have to re-type it
        setAuthEmail(authEmail)
        setAuthError('Este email ya estÃ¡ registrado. Inicia sesiÃ³n con tu contraseÃ±a.')
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        friendlyError = 'Email o contraseÃ±a incorrectos. Â¿EstÃ¡s seguro que creaste la cuenta?'
        setAuthError(friendlyError)
      } else if (error.code === 'auth/invalid-email') {
        friendlyError = 'El formato del email no es vÃ¡lido.'
        setAuthError(friendlyError)
      } else if (error.code === 'auth/weak-password') {
        friendlyError = 'La contraseÃ±a es muy dÃ©bil (mÃ­nimo 6 caracteres).'
        setAuthError(friendlyError)
      } else if (error.message) {
        setAuthError(error.message)
      } else {
        setAuthError(friendlyError)
      }
    } finally {
      setAuthLoading(false)

      // Profile hydration + onboarding gate: ProfileContext only (never wipe on login).
      if (!isDemoMode && loggedInUser && isRegister) {
        setIsEditingProfile(false)
        setOnboardingStepLocal(0)
        setShowOnboarding(true)
      } else if (isDemoMode && loggedInUser) {
        const hasLocalProfile = localStorage.getItem('fitvina_user')
        if (!hasLocalProfile) {
          setShowOnboarding(true)
        }
      }
    }
  }

  // Real password recovery using Firebase
  // This enables the "Â¿Olvidaste tu contraseÃ±a?" button to actually work for real accounts.
  // In demo mode (public web) it will show a clear message that recovery only works in the real app.
  const handleForgotPassword = async (email: string) => {
    if (!email || !email.includes('@')) {
      setAuthError('Ingresa un correo electrÃ³nico vÃ¡lido para recuperar tu contraseÃ±a')
      return
    }

    setAuthLoading(true)
    setAuthError('')

    try {
      await sendPasswordReset(email)
      toast.success('Â¡Email de recuperaciÃ³n enviado!', {
        description: `Revisa tu bandeja en ${email} (incluyendo carpeta de spam). El enlace expira en 1 hora.`
      })
      // UX nicety: switch to login mode after requesting reset
      if (authMode === 'register') {
        setAuthMode('login')
      }
    } catch (error: any) {
      console.error('Password reset failed', error)
      let friendly = 'No pudimos enviar el correo de recuperaciÃ³n en este momento.'
      if (error.message) {
        friendly = error.message
      } else if (error.code === 'auth/user-not-found') {
        friendly = 'No hay ninguna cuenta registrada con ese correo electrÃ³nico.'
      } else if (error.code === 'auth/too-many-requests') {
        friendly = 'Demasiados intentos. Espera unos minutos antes de volver a intentar.'
      }
      setAuthError(friendly)
    } finally {
      setAuthLoading(false)
    }
  }

  // === Session admin controls (for creator) - Phase 0 enhancement ===
  const closeSession = async (sessionId: string) => {
    const allSessions = [...sessions, ...realSessions]
    const session = allSessions.find(s => s.id === sessionId)
    if (!session) return

    const isCreator = session.creatorId === effectiveUserId || session.creatorId === 'me'
    if (!isCreator) {
      toast.error('Solo el creador puede cerrar la sesiÃ³n')
      return
    }
    if (!confirm('Â¿Cerrar esta sesiÃ³n? Se eliminarÃ¡ para todos los participantes y el chat grupal.')) return

    // Remove from local demo state
    const updatedLocal = sessions.filter(s => s.id !== sessionId)
    saveSessions(updatedLocal)

    // Also clean from realSessions state immediately for UI
    setRealSessions(prev => prev.filter(s => s.id !== sessionId))

    // Real: delete from Firestore
    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore')
        await deleteDoc(doc(db, 'sessions', sessionId))
        // Note: subcollection messages stay but are orphaned (fine for pre-alpha)
        console.log('âœ… Session closed by creator')
      } catch (e) {
        console.warn('Failed to delete session from Firestore:', e)
      }
    }

    // Close modal if open
    if (showGroupChatModalFor === sessionId) {
      setShowGroupChatModalFor(null)
    }

    toast.success('SesiÃ³n cerrada', { description: 'Ya no aparecerÃ¡ para nadie' })

    if (!isDemoMode) {
      loadRealSessions()
    }
  }

  const expelFromSession = async (sessionId: string, participantIdToExpel: string) => {
    const allSessions = [...sessions, ...realSessions]
    const session = allSessions.find(s => s.id === sessionId)
    if (!session) return

    const isCreator = session.creatorId === effectiveUserId || session.creatorId === 'me'
    if (!isCreator) {
      toast.error('Solo el administrador de la sesiÃ³n puede expulsar')
      return
    }
    if (participantIdToExpel === effectiveUserId) {
      toast('No puedes expulsarte a ti mismo')
      return
    }

    const nameToExpel = SEED_PROFILES.find(p => p.id === participantIdToExpel)?.name || 'el participante'
    if (!confirm(`Â¿Expulsar a ${nameToExpel} de la sesiÃ³n?`)) return

    const newParticipants = (session.participants || []).filter(p => p !== participantIdToExpel)
    const updatedSession = { ...session, participants: newParticipants }

    // Update local
    const updatedLocal = sessions.map(s => s.id === sessionId ? updatedSession : s)
    saveSessions(updatedLocal)

    // Also update in realSessions for immediate UI reflection on real users
    setRealSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s))

    // Real: persist participants update (only creator should do this)
    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
        await setDoc(doc(db, 'sessions', sessionId), {
          participants: newParticipants,
          updatedAt: serverTimestamp(),
        }, { merge: true })
        console.log('âœ… Participant expelled, persisted to Firestore')
      } catch (e) {
        console.warn('Failed to persist expel:', e)
      }
    }

    // If the group chat modal is open for this session, refresh the view
    if (showGroupChatModalFor === sessionId) {
      // Update in-memory session list for the modal header count etc.
      loadRealGroupMessages(sessionId)
    }

    toast.success('Expulsado', { description: `${nameToExpel} ya no estÃ¡ en la sesiÃ³n` })

    if (!isDemoMode) {
      loadRealSessions()
    }
  }

  const leaveSession = async (sessionId: string) => {
    const allSessions = [...sessions, ...realSessions]
    const session = allSessions.find(s => s.id === sessionId)
    if (!session) return

    const isCreator = session.creatorId === effectiveUserId || session.creatorId === 'me'
    if (isCreator) {
      toast('El creador no puede salir; usa Cerrar sesiÃ³n')
      return
    }

    const newParticipants = (session.participants || []).filter(p => p !== effectiveUserId)
    const updatedSession = { ...session, participants: newParticipants }

    const updatedLocal = sessions.map(s => s.id === sessionId ? updatedSession : s)
    saveSessions(updatedLocal)

    // Also update realSessions state immediately
    setRealSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s))

    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
        await setDoc(doc(db, 'sessions', sessionId), {
          participants: newParticipants,
          updatedAt: serverTimestamp(),
        }, { merge: true })
      } catch (e) { console.warn(e) }
    }

    if (showGroupChatModalFor === sessionId) {
      setShowGroupChatModalFor(null)
    }

    toast('Saliste de la sesiÃ³n')

    if (!isDemoMode) loadRealSessions()
  }

  const handleJoinSession = async (session: TrainingSession) => {
    const updatedSession = {
      ...session,
      participants: [...(session.participants || []), effectiveUserId],
    }
    const updatedLocal = sessions.map((s) => (s.id === session.id ? updatedSession : s))
    saveSessions(updatedLocal)

    let joinPersisted = true
    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
        await setDoc(
          doc(db, 'sessions', session.id),
          sanitizeForFirestore({
            ...updatedSession,
            updatedAt: serverTimestamp(),
          }),
          { merge: true }
        )
        console.log('âœ… Join persisted to Firestore for other users')
      } catch (e) {
        joinPersisted = false
        console.warn('Failed to persist join to Firestore:', e)
        toast.error('No se pudo guardar tu uniÃ³n en el servidor', {
          description: 'El chat se abre igual (optimista). Usa "Actualizar sesiones reales" si no ves cambios.',
        })
      }
    }

    seedInitialSessionMessages(updatedSession)

    if (!isDemoMode) {
      loadRealSessions()
    }

    if (session.creatorId && session.creatorId !== effectiveUserId) {
      addNotification({
        type: 'session_join',
        title: 'Â¡Alguien se uniÃ³ a tu sesiÃ³n!',
        body: `${currentUser?.name || 'Alguien'} se uniÃ³ a "${session.title}"`,
        relatedId: session.id,
      })
    }

    toast.success('Â¡Te uniste!', {
      description: joinPersisted ? 'Abriendo chat grupal...' : 'Abriendo (puede tardar en sincronizar para otros)',
    })
    setShowGroupChatModalFor(session.id)
  }

  // Moderation actions
  const reviewVerification = (userId: string, approve: boolean) => {
    // Remove from pending
    setPendingVerifications(prev => prev.filter(v => v.userId !== userId))

    if (approve) {
      // In a real app we would update the user's profile on the backend.
      // For demo, we'll just show a toast. If the user views that profile, we can fake it.
      toast.success('VerificaciÃ³n aprobada', { description: `El perfil de ${SEED_PROFILES.find(p => p.id === userId)?.name} ahora estÃ¡ verificado.` })
      
      // Optional: If we want to make it visible, we can store approved verifications
      // For now, just log it
    } else {
      toast.error('VerificaciÃ³n rechazada')
    }
  }



  // Multi-step verification â€” Gemini compares profile photo vs selfie
  const submitVerification = async () => {
    if (!currentUser || verificationSubmitting) return
    if (!verificationSelfie) {
      toast.error('Falta selfie', { description: 'Captura tu rostro con la cÃ¡mara frontal para verificar.' })
      return
    }
    if (!currentUser.photos?.length) {
      toast.error('Falta foto de perfil', { description: 'Agrega al menos una foto en tu perfil antes de verificar.' })
      return
    }

    if (isDemoMode || !firebaseUser?.uid) {
      toast('VerificaciÃ³n IA requiere cuenta real', {
        description: 'Entra con Google o email para comparar tu selfie con tu foto de perfil.',
      })
      return
    }

    setVerificationSubmitting(true)
    const capturedSelfie = verificationSelfie
    try {
      const {
        verifyIdentityWithAi,
        uploadVerificationImage,
        imageRefToDataUrl,
        compressImageDataUrl,
        persistVerificationToProfile,
      } = await import('./services/identityVerification')
      const { resolveVerificationStatusFromAi } = await import('./utils/identityVerification')

      const profilePhoto = currentUser.photos[0]
      let profilePhotoBase64 = profilePhoto.startsWith('data:')
        ? profilePhoto
        : await imageRefToDataUrl(profilePhoto)
      if (profilePhotoBase64) {
        profilePhotoBase64 = await compressImageDataUrl(profilePhotoBase64)
      }

      const selfieForAi = await compressImageDataUrl(capturedSelfie)

      const verdict = await verifyIdentityWithAi({
        profilePhotoBase64: profilePhotoBase64 || undefined,
        profilePhotoUrl: profilePhotoBase64 ? undefined : profilePhoto,
        selfieBase64: selfieForAi,
        displayName: currentUser.name,
        age: currentUser.age,
      })

      const verificationStatus = resolveVerificationStatusFromAi(verdict)
      const updated = {
        ...currentUser,
        verificationStatus,
        verificationDate: Date.now(),
        verificationDocuments: {
          selfiePhoto: capturedSelfie,
        },
      }

      currentUserRef.current = updated as CurrentUser
      saveUser(updated as CurrentUser)
      setShowVerificationFlow(false)
      setVerificationSelfie(null)
      setVerificationStep(1)

      if (firebaseUser?.uid && !isDemoMode) {
        try {
          await saveUserWithRealSync(updated as CurrentUser)
        } catch (syncErr) {
          console.warn('[verify] saveUserWithRealSync failed, fallback persist', syncErr)
          await persistVerificationToProfile(
            firebaseUser.uid,
            verificationStatus,
            undefined
          )
        }
        void (async () => {
          try {
            let selfieUrl = capturedSelfie
            if (storage && capturedSelfie.startsWith('data:')) {
              try {
                selfieUrl = await uploadVerificationImage(
                  storage,
                  effectiveUserId,
                  selfieForAi,
                  'selfie'
                )
              } catch (e) {
                console.warn('[verify] storage upload failed', e)
              }
            }
            if (!selfieUrl.startsWith('data:')) {
              const withUrl = {
                ...updated,
                verificationDocuments: { selfiePhoto: selfieUrl },
              }
              currentUserRef.current = withUrl as CurrentUser
              saveUser(withUrl as CurrentUser)
              await saveUserWithRealSync(withUrl as CurrentUser)
            }
          } catch (e) {
            console.warn('[verify] background selfie persist failed', e)
          }
        })()
      }

      if (verificationStatus === 'verified') {
        addNotification({
          type: 'verification',
          title: 'Â¡Perfil verificado!',
          body: verdict.reason || 'La IA confirmÃ³ que tu selfie coincide con tu foto de perfil.',
        })
        toast.success('Â¡VerificaciÃ³n completada!', {
          description: verdict.reason || 'Tu badge âœ“ VERIFICADO ya es visible.',
        })
      } else if (verificationStatus === 'pending') {
        addNotification({
          type: 'verification',
          title: 'VerificaciÃ³n en revisiÃ³n',
          body: verdict.reason || 'Revisaremos tus fotos manualmente si hace falta.',
        })
        toast('En revisiÃ³n', {
          description: verdict.reason || 'La IA no tuvo certeza suficiente â€” te avisamos pronto.',
        })
      } else {
        toast.error('No pudimos verificar', {
          description:
            verdict.reason ||
            'Usa buena luz, mira a la cÃ¡mara y pon como foto principal un retrato claro de tu rostro.',
        })
      }
    } catch (e: any) {
      console.error('submitVerification failed', e)
      toast.error('Error en verificaciÃ³n', {
        description: e?.message || 'Revisa tu conexiÃ³n e intenta de nuevo.',
      })
    } finally {
      setVerificationSubmitting(false)
    }
  }

  // Send message to a session group chat (supports text + optional photo)
  const sendSessionMessage = (sessionId: string, text: string, photo?: string | null, voice?: {voiceUrl: string, voiceDuration: number} | null) => {
    if (!currentUser || (!text.trim() && !photo && !voice)) return

    const isRealSession = !isDemoMode && firebaseUser?.uid && db

    const newMsg: any = {
      id: 'sm' + Date.now(),
      senderId: effectiveUserId,
      senderName: currentUser?.name || 'TÃº',
      text: text.trim() || '',
      timestamp: Date.now(),
      reactions: {}
    }
    if (photo) {
      newMsg.photo = photo
    }
    if (voice) {
      newMsg.voiceUrl = voice.voiceUrl
      newMsg.voiceDuration = voice.voiceDuration
    }

    if (isRealSession) {
      // Real group chat - write to Firestore subcollection
      ;(async () => {
        try {
          const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
          const msgData: any = {
            senderId: effectiveUserId,
            senderName: currentUser?.name || 'TÃº',
            text: newMsg.text,
            timestamp: newMsg.timestamp,
            createdAt: serverTimestamp(),
          }
          if (newMsg.photo) {
            msgData.photo = newMsg.photo
          }
          if (newMsg.voiceUrl) {
            msgData.voiceUrl = newMsg.voiceUrl
            msgData.voiceDuration = newMsg.voiceDuration
          }
          await addDoc(collection(db, groupMessagesCollectionPath(sessionId)), msgData)
          console.log('âœ… Real group message sent')

          // Update parent session doc (not squads) with last activity for live preview in sessions list
          if (!isSquadChatId(sessionId)) {
            try {
              const { doc, setDoc, serverTimestamp: ts } = await import('firebase/firestore')
              await setDoc(doc(db, 'sessions', sessionId), {
                lastMessagePreview: newMsg.text ? newMsg.text.substring(0, 80) : (photo ? '[foto]' : (voice ? `[nota de voz ${voice.voiceDuration || 0}s]` : '')),
                lastMessageAt: ts(),
                updatedAt: ts(),
              }, { merge: true })
            } catch (e) { /* non critical */ }
          }

          // Force reload to sync the authoritative server list (prevents optimistic message from disappearing before snapshot arrives)
          loadRealGroupMessages(sessionId)
          // sending counts as reading
          setSessionUnreads(prev => { const c = { ...prev }; c[sessionId] = 0; return c })
        } catch (e) {
          console.warn('Failed to send real session message:', e)
          // Show user-friendly error
          toast.error('Error al enviar mensaje real', { description: 'No se pudo guardar en el servidor (posible problema de red o permisos). El mensaje se ve solo para ti por ahora.' })
          // Optimistic update already added it locally; other users won't see it until sync. No duplicate add.
        }
      })()

      // Optimistic local update
      const current = sessionMessages[sessionId] || []
      const updated = { ...sessionMessages, [sessionId]: [...current, newMsg] }
      saveSessionMessages(updated)
    } else {
      // Demo / local
      const current = sessionMessages[sessionId] || []
      const updated = { ...sessionMessages, [sessionId]: [...current, newMsg] }
      saveSessionMessages(updated)
    }

    setGroupChatPhoto(null)

    // Auto scroll - robust for mobile (after send, keyboard may shift layout)
    const doScroll = () => {
      const scrollEl = document.getElementById('group-chat-scroll')
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight
      const squadScroll = document.getElementById('squad-chat-scroll')
      if (squadScroll) squadScroll.scrollTop = squadScroll.scrollHeight
      const el = groupChatScrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    }
    requestAnimationFrame(doScroll)
    setTimeout(doScroll, 50)
    setTimeout(doScroll, 200)

    // Simulate reply only in demo mode
    if (!isRealSession && !photo && Math.random() > 0.6) {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const otherParticipants = sessions.find(s => s.id === sessionId)?.participants.filter(p => p !== 'me') || []
        if (otherParticipants.length > 0) {
          const randomId = otherParticipants[Math.floor(Math.random() * otherParticipants.length)]
          const randomName = SEED_PROFILES.find(p => p.id === randomId)?.name || 'Alguien'
          const replies = ['Â¡Buena idea!', 'Yo llego 5 min antes', 'Â¿Llevas agua?', 'Perfecto ðŸ”¥', 'Nos vemos allÃ¡']
          const replyMsg: SessionMessage = {
            id: 'sm' + Date.now(),
            senderId: randomId,
            senderName: randomName,
            text: replies[Math.floor(Math.random() * replies.length)],
            timestamp: Date.now(),
            reactions: {}
          }
          const withReply = {
            ...sessionMessages,
            [sessionId]: [...(sessionMessages[sessionId] || []), replyMsg]
          }
          saveSessionMessages(withReply)
          setTimeout(() => {
            const scrollEl = document.getElementById('group-chat-scroll')
            if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight
          }, 50)
        }
      }, 1400)
    }
  }

  // Helper to render message text with clickable links (for long URLs like affiliate/supplement links in training chats)
  const renderMessageText = (text: string) => {
    if (!text) return null
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline text-[#FF671F] break-all hover:text-[#E55A1A]"
          >
            {part}
          </a>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  // Seed some initial messages when user joins a session for the first time (contextual by type)
  const seedInitialSessionMessages = (session: TrainingSession) => {
    if (sessionMessages[session.id]?.length > 0) return
    if (!isDemoMode) return // In real mode, messages come from Firestore subcollection (no fake local seeds)

    const type = session.trainingType.toLowerCase()
    let messages: SessionMessage[] = []

    if (type.includes('running') || type.includes('correr')) {
      messages = [
        { id: 'sm1', senderId: session.creatorId, senderName: session.creatorName, text: `Â¡Hola! Nos vemos ${session.time.toLowerCase()} en ${session.location}. Llevo agua extra.`, timestamp: Date.now() - 1000*60*12 },
        { id: 'sm2', senderId: 'p-seed', senderName: 'MarÃ­a', text: 'Yo llego 5 min antes. Â¿Alguien trae gel?', timestamp: Date.now() - 1000*60*7 },
      ]
    } else if (type.includes('pesas') || type.includes('gym')) {
      messages = [
        { id: 'sm1', senderId: session.creatorId, senderName: session.creatorName, text: `Â¡Listos para ${session.trainingType}! Nos vemos en ${session.location}.`, timestamp: Date.now() - 1000*60*14 },
        { id: 'sm2', senderId: 'p-seed', senderName: 'Diego', text: 'Llevo correas y straps por si alguien necesita.', timestamp: Date.now() - 1000*60*9 },
      ]
    } else if (type.includes('crossfit')) {
      messages = [
        { id: 'sm1', senderId: session.creatorId, senderName: session.creatorName, text: `WOD del dÃ­a en ${session.location}. Traigan rodilleras.`, timestamp: Date.now() - 1000*60*11 },
        { id: 'sm2', senderId: 'p-seed', senderName: 'Laura', text: 'Â¿Alguien tiene magnesio extra?', timestamp: Date.now() - 1000*60*6 },
      ]
    } else {
      messages = [
        { id: 'sm1', senderId: session.creatorId, senderName: session.creatorName, text: `Â¡Hola! Nos vemos ${session.time.toLowerCase()} en ${session.location}.`, timestamp: Date.now() - 1000*60*13 },
        { id: 'sm2', senderId: 'p-seed', senderName: 'Carlos', text: 'Perfecto, yo llego puntual.', timestamp: Date.now() - 1000*60*5 },
      ]
    }

    const updated = { ...sessionMessages, [session.id]: messages }
    saveSessionMessages(updated)
  }

  const readCachedLocation = (): { lat: number; lng: number } | null => {
    try {
      const raw = localStorage.getItem('entrenamatch_location')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Number.isFinite(parsed?.lat) && Number.isFinite(parsed?.lng)) {
          return { lat: parsed.lat, lng: parsed.lng }
        }
      }
    } catch {}
    const u = currentUserRef.current ?? currentUser
    if (u && Number.isFinite(Number(u.lat)) && Number.isFinite(Number(u.lng))) {
      return { lat: Number(u.lat), lng: Number(u.lng) }
    }
    return null
  }

  const applyUserLocation = async (loc: { lat: number; lng: number }, opts?: { silent?: boolean }) => {
    setUserLocation(loc)
    userLocationRef.current = loc
    localStorage.setItem('entrenamatch_location', JSON.stringify(loc))

    const u = currentUserRef.current ?? currentUser
    if (!u) {
      if (!opts?.silent) {
        toast.success('UbicaciÃ³n activada', { description: 'Distancias y mapa usan esta posiciÃ³n' })
      }
      return
    }

    const updated = { ...u, lat: loc.lat, lng: loc.lng }
    await saveUserWithRealSync(updated as CurrentUser)
    if (!opts?.silent) {
      toast.success('UbicaciÃ³n real activada', { description: 'Distancias y "vivo cerca" usan tu GPS ahora' })
    }
  }

  // Request REAL user GPS location (native Capacitor first for APK realism, fallback to browser)
  const requestUserLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    if (isGettingLocationRef.current) return readCachedLocation()
    isGettingLocationRef.current = true
    try {
      let loc: { lat: number; lng: number } | null = null

      if (GeolocationNative && Capacitor.isNativePlatform()) {
        const perm = await GeolocationNative.requestPermissions()
        if (perm?.location !== 'granted' && perm?.coarseLocation !== 'granted') {
          toast.error('Permiso de ubicaciÃ³n denegado', { description: 'ActÃ­valo en Ajustes del telÃ©fono para distancias reales' })
          loc = readCachedLocation()
          if (loc) await applyUserLocation(loc, { silent: true })
          return loc
        }
        let position
        try {
          position = await GeolocationNative.getCurrentPosition({ enableHighAccuracy: true, timeout: 20000 })
        } catch (highErr) {
          console.warn('High accuracy GPS failed, trying low accuracy:', highErr)
          position = await GeolocationNative.getCurrentPosition({
            enableHighAccuracy: false,
            timeout: 25000,
            maximumAge: 600000,
          })
        }
        loc = { lat: position.coords.latitude, lng: position.coords.longitude }
      } else if (navigator.geolocation) {
        const tryWebPosition = (opts: PositionOptions) =>
          new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, opts)
          })

        try {
          const position = await tryWebPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
          loc = { lat: position.coords.latitude, lng: position.coords.longitude }
        } catch (highErr: any) {
          const code = highErr?.code
          console.warn('High accuracy web geolocation failed, trying low accuracy / cache:', highErr)
          try {
            const position = await tryWebPosition({
              enableHighAccuracy: false,
              timeout: 25000,
              maximumAge: 600000,
            })
            loc = { lat: position.coords.latitude, lng: position.coords.longitude }
          } catch (lowErr) {
            console.warn('Low accuracy web geolocation failed:', lowErr)
            loc = readCachedLocation()
            if (loc) {
              const reason = code === 3 ? 'GPS tardÃ³ demasiado' : code === 1 ? 'Permiso denegado' : 'GPS no disponible'
              toast('Usando Ãºltima ubicaciÃ³n conocida', {
                description: `${reason}. Live y mapa siguen activos con tu posiciÃ³n guardada.`,
              })
            }
          }
        }
      } else {
        loc = readCachedLocation()
        if (!loc) toast.error('GeolocalizaciÃ³n no soportada en este navegador')
        return loc
      }

      if (loc) {
        await applyUserLocation(loc)
        return loc
      }

      toast.error('No pudimos obtener ubicaciÃ³n', { description: 'Revisa permisos de ubicaciÃ³n o intenta en otro navegador.' })
      return null
    } catch (e: any) {
      console.warn('Real geolocation failed:', e)
      const fallback = readCachedLocation()
      if (fallback) {
        await applyUserLocation(fallback, { silent: true })
        toast('Usando Ãºltima ubicaciÃ³n conocida', { description: 'El GPS no respondiÃ³ a tiempo; live y mapa usan tu posiciÃ³n guardada.' })
        return fallback
      }
      toast.error('No pudimos obtener ubicaciÃ³n real', { description: 'Activa permisos de ubicaciÃ³n en el navegador o dispositivo.' })
      return null
    } finally {
      isGettingLocationRef.current = false
    }
  }


  const persistSeenLiveUsers = () => {
    trimSetToMax(seenLiveUserIdsRef.current, MAX_SEEN_STRING_IDS)
    try {
      localStorage.setItem(
        SEEN_LIVE_USERS_KEY,
        JSON.stringify(pruneStringIdList(Array.from(seenLiveUserIdsRef.current)))
      )
    } catch {
      reclaimLocalStorageSpace('soft')
    }
  }

  const bootstrapLiveSessionAlerts = (users: any[]) => {
    if (liveSessionAlertsReadyRef.current || !users?.length) return false
    liveSessionAlertsReadyRef.current = true
    users.forEach((u: any) => {
      seenLiveUserIdsRef.current.add(u.id)
      if (syncBonds[u.id]) {
        prevRedSyncStateRef.current[u.id] = u.trainingSyncWith || null
      }
    })
    persistSeenLiveUsers()
    savePersistedRedSyncState(prevRedSyncStateRef.current)
    return true
  }

  // Fase 121 â€” alertas LIVE: equipo + alguien cerca (â‰¤8 km) si tienes ubicaciÃ³n.
  const NEARBY_LIVE_KM = 8
  useEffect(() => {
    if (!liveTrainingNow || liveTrainingNow.length === 0) return
    if (bootstrapLiveSessionAlerts(liveTrainingNow)) return

    let addedNew = false
    liveTrainingNow.forEach((liveUser: any) => {
      if (liveUser.id === effectiveUserId) return
      if (seenLiveUserIdsRef.current.has(liveUser.id)) return
      seenLiveUserIdsRef.current.add(liveUser.id)
      addedNew = true

      const inMyTeam = isTeamMemberId(liveUser.id, syncBonds, teamMatchIds)
      const isBond = !!syncBonds[liveUser.id]
      const dist = typeof liveUser.distance === 'number' ? liveUser.distance : null
      const firstName = String(liveUser.name || 'Alguien').split(' ')[0]

      if (inMyTeam) {
        addNotification({
          type: 'session_join',
          title: isBond ? `${firstName} estÃ¡ en vivo` : `${firstName} de tu equipo estÃ¡ entrenando`,
          body: isBond
            ? 'Tu socio de sync activÃ³ live â€” Ãºnete desde Hoy.'
            : `Match activo a ${(dist ?? 0).toFixed(1)}km â€” Â¿te sumas?`,
          relatedId: liveUser.id,
          photoUrl: liveUser.photos?.[0],
          isNetwork: isBond,
        } as any)
        toast(`${isBond ? 'ðŸ”¥' : 'ðŸŸ¢'} ${firstName} estÃ¡ en vivo`, {
          description: isBond
            ? 'Tu equipo â€” toca para unirte al sync'
            : `Match Â· ${(dist ?? 0).toFixed(1)}km`,
          action: {
            label: isBond ? 'Unirme' : 'Ver',
            onClick: () =>
              isBond ? startSyncWith(liveUser.id, liveUser.name) : setShowFullProfile(liveUser as any),
          },
        })
        return
      }

      if (
        userLocation &&
        !currentUser?.trainingSyncWith &&
        dist != null &&
        dist > 0 &&
        dist <= NEARBY_LIVE_KM
      ) {
        addNotification({
          type: 'live_nearby',
          title: BRAND_COPY.nearbyLive.notifTitle(firstName),
          body: BRAND_COPY.nearbyLive.notifBody(dist),
          relatedId: liveUser.id,
          photoUrl: liveUser.photos?.[0],
        } as any)
        toast(`ðŸŸ¢ ${BRAND_COPY.nearbyLive.notifTitle(firstName)}`, {
          description: BRAND_COPY.nearbyLive.notifBody(dist),
          action: {
            label: BRAND_COPY.nearbyLive.toastAction,
            onClick: () => navigateTab('map'),
          },
        })
      }
    })
    if (addedNew) persistSeenLiveUsers()
  }, [
    liveTrainingNow,
    addNotification,
    syncBonds,
    teamMatchIds,
    effectiveUserId,
    userLocation,
    currentUser?.trainingSyncWith,
    navigateTab,
  ])

  // Fase 121 â€” notificaciÃ³n al iniciar Sync Hour (una vez por ventana).
  useEffect(() => {
    const tick = () => {
      if (!shouldFireSyncHourNotif()) return
      addNotification({
        type: 'session_join',
        title: BRAND_COPY.syncHour.notifTitle,
        body: BRAND_COPY.syncHour.notifBody,
      } as any)
      toast(BRAND_COPY.syncHour.notifTitle, {
        description: BRAND_COPY.syncHour.notifBody,
        action: {
          label: BRAND_COPY.syncHour.cta,
          onClick: () => navigateTab('map'),
        },
      })
    }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [addNotification, navigateTab])

  // Phase B: sync-start alerts â€” team bonds only (matches get live alert above).
  useEffect(() => {
    if (!liveTrainingNow || liveTrainingNow.length === 0) return
    if (!liveSessionAlertsReadyRef.current) return

    const currentRedSyncs: Record<string, string | null> = {}
    liveTrainingNow.forEach((u: any) => {
      if (syncBonds[u.id]) {
        currentRedSyncs[u.id] = u.trainingSyncWith || null
      }
    })
    Object.keys(currentRedSyncs).forEach(uid => {
      const prev = prevRedSyncStateRef.current[uid]
      const now = currentRedSyncs[uid]
      if (prev === now) return
      if (now && !prev) {
        const partner = liveTrainingNow.find((x: any) => x.id === uid)
        if (partner) {
          addNotification({
            type: 'session_join',
            title: `${partner.name.split(' ')[0]} activÃ³ EntrenaSync`,
            body: 'Tu socio de sync estÃ¡ entrenando en pareja â€” Ãºnete desde Hoy.',
            relatedId: uid,
            photoUrl: partner.photos?.[0],
            isNetwork: true,
          } as any)
          toast.success(`${partner.name.split(' ')[0]} en EntrenaSync`, {
            description: 'Tu equipo â€” toca para unirte',
            action: { label: 'Unirme', onClick: () => startSyncWith(uid, partner.name) },
          })
        }
      }
    })
    prevRedSyncStateRef.current = { ...prevRedSyncStateRef.current, ...currentRedSyncs }
    savePersistedRedSyncState(prevRedSyncStateRef.current)
  }, [liveTrainingNow, syncBonds, addNotification])

  // ==================== SWIPE LOGIC ====================
  const celebrateNewMatch = (profile: Profile, isReal = false) => {
    const profileId = profile.id
    justMatchedLocallyRef.current.add(profileId)

    if (!matches.includes(profileId) && !realMatches.includes(profileId)) {
      saveMatches([...matches, profileId])
    }
    if (isReal) {
      setRealMatches((prev) => (prev.includes(profileId) ? prev : [...prev, profileId]))
    }

    const openers = CHAT_OPENERS[profileId] || ['Â¡Hola! Vi tu perfil y me tinca entrenar juntos ðŸ’ª']
    const firstMsg: Message = {
      id: Date.now().toString(36),
      from: 'them',
      text: openers[0],
      timestamp: Date.now(),
    }
    saveMessages({ ...messages, [profileId]: [firstMsg] })

    addNotification({
      type: 'match',
      title: 'Â¡Nuevo Match!',
      body: `Hiciste match con ${profile.name}`,
      relatedId: profileId,
    })

    bumpPwaEngagement()
    setShowMatchModal(profile)
    triggerConfetti()
    const isFirstRealMatch =
      isReal && !realMatches.includes(profileId) && realMatches.length === 0

    toast.success(`Â¡Match con ${profile.name}!`, {
      description: isReal ? 'Â¡Ambos se dieron like!' : 'Tienen ganas de entrenar juntos ðŸ”¥',
    })

    if (isFirstRealMatch) {
      try {
        if (!localStorage.getItem('em_invite_nudge_shown')) {
          localStorage.setItem('em_invite_nudge_shown', '1')
          const inviteUrl = buildInviteLink(effectiveUserId)
          const inviteText = `Ãšnete a EntrenaMatch â€” entrena en sync con gente de ${currentUser?.city || 'tu ciudad'}`
          setTimeout(() => {
            toast('Â¿Alguien de tu gym?', {
              description: 'InvÃ­talo al piloto para entrenar juntos',
              action: {
                label: 'Compartir',
                onClick: () => {
                  void (async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({ title: 'EntrenaMatch', text: inviteText, url: inviteUrl })
                      } else {
                        await navigator.clipboard.writeText(`${inviteText}\n${inviteUrl}`)
                        toast.success('InvitaciÃ³n copiada')
                      }
                    } catch {
                      toast.error('No se pudo compartir')
                    }
                  })()
                },
              },
            })
          }, 2500)
        }
      } catch {
        /* ignore storage */
      }
    }
  }

  const handleSwipe = (profileId: string, direction: 'left' | 'right') => {
    // Support both seed profiles and real Firestore profiles
    const profile = [...SEED_PROFILES, ...realProfiles].find(p => p.id === profileId)
    if (!profile) return

    if (direction === 'right') {
      const alreadyLiked = likedIds.includes(profileId)

      if (!alreadyLiked) {
      const newLiked = [...likedIds, profileId]
      startTransition(() => {
        saveLiked(newLiked)
      })

      // Network Power priority in action: swiping right on your red gives immediate feedback that the graph is strengthening
      if (syncBonds[profileId]) {
        const bond = syncBonds[profileId]
        toast.success(`â­ Tu red â€¢ ${profile.name}`, {
          description: `LV${bond.bondLevel || 1} â€¢ Fuerza del equipo reforzada. Re-sync pronto para +rendimiento compartido y mÃ¡s visibilidad.`
        })
      }

      const isRealProfile = !profileId.startsWith('p') && realProfiles.some(r => r.id === profileId)
      const alreadyMatched = matches.includes(profileId) || realMatches.includes(profileId)

      if (isRealProfile && !isDemoMode && firebaseUser?.uid && db) {
        if (alreadyMatched) {
          toast('Like enviado', { description: `Ya tienes match con ${profile.name}` })
        } else {
          ;(async () => {
            try {
              const result = await processLikeAndMaybeMatch(db, firebaseUser.uid, profileId)
              if (result === 'matched') {
                celebrateNewMatch(profile, true)
                await loadRealMatches()
              } else {
                toast('Like enviado', {
                  description: `Si ${profile.name} tambiÃ©n te da like, harÃ¡n match`,
                })
              }
            } catch (e: any) {
              console.warn('Could not process real like/match:', e)
              const isPerm = e?.code === 'permission-denied' || `${e?.message || e}`.includes('permission')
              toast.error(
                isPerm ? 'Permisos de Firestore' : 'No se pudo enviar el like',
                {
                  description: isPerm
                    ? 'Las reglas de likes/matches deben desplegarse (firebase deploy --only firestore:rules).'
                    : 'Revisa tu conexiÃ³n',
                }
              )
            }
          })()
        }
      } else {
        // Demo / perfiles seed: match simulado (auto-match ids o probabilidad)
        const isAutoMatch = AUTO_MATCH_IDS.includes(profileId)
        const randomMatch = Math.random() < 0.28
        if (!alreadyMatched && (isAutoMatch || randomMatch)) {
          celebrateNewMatch(profile, false)
        } else {
          toast('Like enviado', { description: `A ${profile.name} le avisaremos si hay match` })
        }
      }
      }

      // === KILLER LIVE FEATURE: "someone joined my live" flow ===
      // When swiping right (Unirme) on a person who is trainingNow, auto-interact with their live muro post.
      // This makes the post "alive" with real join comments (visible in their muro + feed teasers).
      // For real: direct FS arrayUnion on their latest profilePost so cross-device owners see the join in thread.
      // Owner will get notified via our processor (below) when they load/refresh their posts.
      if (isUserLive(profileId)) {
        (async () => {
          try {
            const joinText = 'Â¡Me uno al live ahora mismo! ðŸ”¥ Â¿DÃ³nde estÃ¡s entrenando?'
            if (!joiningSyncWith) setJoiningSyncWith(profileId)
            tryAutoStartSync(profileId)
            if (!isDemoMode && firebaseUser?.uid && db) {
              const { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, arrayUnion } = await import('firebase/firestore')
              const postsCol = collection(db, 'profilePosts')
              const q = query(postsCol, where('userId', '==', profileId), orderBy('timestamp', 'desc'), limit(1))
              const snap = await getDocs(q)
              if (!snap.empty) {
                const postId = snap.docs[0].id
                const joinComment = {
                  id: createCommentId(),
                  userId: firebaseUser.uid,
                  userName: currentUser?.name || 'Un compaÃ±ero live',
                  text: joinText,
                  timestamp: Date.now(),
                }
                await writeCommentToFirestore(db, postId, joinComment, sanitizeForFirestore)
                await updateDoc(doc(db, 'profilePosts', postId), {
                  likes: arrayUnion(firebaseUser.uid),
                })
                ensurePostCommentsListener(postId, [joinComment])
                setProfilePosts(prev => {
                  const targetPosts = prev[profileId] || []
                  const updatedPosts = targetPosts.map((p: any) =>
                    p.id === postId
                      ? { ...p, comments: [...(p.comments || []), joinComment], likes: [...(p.likes || []), firebaseUser.uid] }
                      : p
                  )
                  return { ...prev, [profileId]: updatedPosts }
                })
              }
            } else {
              // Demo: ensure posts loaded then use the existing spectacular comment/like (updates local + LS)
              await loadProfilePosts(profileId)
              const theirPosts = profilePosts[profileId] || []
              const livePost = theirPosts.find((p: any) => (p.text || '').toLowerCase().includes('entrenando ahora')) || theirPosts[0]
              if (livePost) {
                await addCommentToPost(livePost.id, profileId, joinText)
                await likeProfilePost(livePost.id, profileId)
              }
            }
          } catch (e) {
            console.warn('live join post auto-interact failed (non fatal)', e)
          }
        })()

        // Immediate UX feedback for the joiner (the "Unirme ya" action)
        // If both were live, the tryAutoStartSync already set loader + will auto-nav to the rich attractive sync panel
        toast.success(`Â¡Unido al live de ${profile.name}!`, {
          description: isUserLive(profileId) && currentUser?.trainingNow 
            ? 'Â¡EntrenaSync iniciado! Estado compartido + acciones conjuntas en vivo. Te llevamos al panel.' 
            : 'DejÃ© un comentario en su muro en vivo â€” Â¡ellos lo verÃ¡n!'
        })

        // Update joiner's live participation stats/streaks (killer for retention - both hosting and joining count)
        const todayStr = new Date().toDateString()
        const lastPartStr = currentUser.lastLiveDate ? new Date(currentUser.lastLiveDate).toDateString() : null
        let newJoinedStreak = currentUser.joinedLiveStreak || 0
        let newJoinsCount = (currentUser.liveJoins || 0) + 1
        if (!lastPartStr || lastPartStr === todayStr) {
          // already participated today
        } else {
          const lastDate = new Date(lastPartStr)
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          if (lastDate.toDateString() === yesterday.toDateString()) {
            newJoinedStreak = (currentUser.joinedLiveStreak || 0) + 1
          } else {
            newJoinedStreak = 1
          }
        }
        const joinerStatsUpdate = {
          ...currentUser,
          liveJoins: newJoinsCount,
          joinedLiveStreak: newJoinedStreak,
          lastLiveDate: Date.now()
        }
        saveUserWithRealSync(joinerStatsUpdate as CurrentUser)
      }
    } else {
      const newPassed = [...passedIds, profileId]
      startTransition(() => {
        savePassed(newPassed)
      })
      const isRealProfile = !profileId.startsWith('p') && realProfiles.some(r => r.id === profileId)
      if (isRealProfile && !isDemoMode && firebaseUser?.uid && db) {
        writePass(db, firebaseUser.uid, profileId).catch((e) =>
          console.warn('Could not persist pass to Firestore', e)
        )
      }
    }

    // Advance deck (index + drag state now live inside ExploreTab)
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 180,
      spread: 70,
      origin: { y: 0.6 }
    })
    setTimeout(() => {
      confetti({ particleCount: 120, angle: 60, spread: 55, origin: { x: 0.1, y: 0.7 } })
    }, 180)
  }

  useEffect(() => {
    triggerConfettiRef.current = triggerConfetti
  })

  // Manual button actions
  // (swipeLeft, swipeRight, handleDragEnd fully moved into ExploreTab)

  // ==================== CHAT ====================
  const openChat = (profileId: string) => {
    setActiveChat(profileId)
    navigateTab('red')
    setRedSubTab('messages')
    // mark as read when opening the conversation
    setChatUnreads(prev => { const c = { ...prev }; c[profileId] = 0; return c })

    // Extra guarantee scroll to bottom (latest msgs) when opening from perfiles list
    setTimeout(() => {
      const el = chatScrollRef.current
      if (el) {
        el.scrollTop = el.scrollHeight
      }
      // also try the id
      const byId = document.getElementById('chat-scroll')
      if (byId) byId.scrollTop = byId.scrollHeight
    }, 180)
  }

  const sendMessage = (
    text: string,
    voice?: { voiceUrl: string; voiceDuration: number } | null,
    photoUrl?: string | null,
    extras?: {
      toUserId?: string
      workoutId?: string
      workoutPreview?: import('./types').WorkoutPreview
    }
  ) => {
    const chatId = extras?.toUserId || activeChat
    const hasWorkout = !!(extras?.workoutId && extras?.workoutPreview)
    if (!chatId || (!text.trim() && !voice && !photoUrl && !hasWorkout)) return

    const isRealChat = isRealChatId(chatId)

    if (isRealChat) {
      const clientId = `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
      const newMsg: Message = {
        id: clientId,
        clientId,
        from: 'me',
        text: text.trim() || '',
        timestamp: Date.now(),
        sendStatus: 'sending',
        ...(voice ? { voiceUrl: voice.voiceUrl, voiceDuration: voice.voiceDuration } : {}),
        ...(photoUrl ? { photoUrl } : {}),
        ...(extras?.workoutId ? { workoutId: extras.workoutId } : {}),
        ...(extras?.workoutPreview ? { workoutPreview: extras.workoutPreview } : {}),
      }

      const patchOutgoing = (patch: Partial<Message>) => {
        const matchId = (m: Message) => m.id === clientId || m.clientId === clientId
        setRealChatMessages((prev) => prev.map((m) => (matchId(m) ? { ...m, ...patch } : m)))
        setMessages((prev) => {
          const chat = prev[chatId] || []
          const next = chat.map((m) => (matchId(m) ? { ...m, ...patch } : m))
          const updated = { ...prev, [chatId]: next }
          if (isDemoMode) {
            try {
              localStorage.setItem('fitvina_messages', JSON.stringify(updated))
            } catch {}
          }
          return updated
        })
      }

      const currentChat = messages[chatId] || []
      saveMessages({ ...messages, [chatId]: [...currentChat, newMsg] })
      if (chatId === activeChat) {
        setRealChatMessages((prev) => [...prev, newMsg])
      }

      void sendRealMessage(text || '', chatId, voice, photoUrl, {
        clientId,
        workoutId: extras?.workoutId,
        workoutPreview: extras?.workoutPreview,
        onAck: (serverId) => {
          patchOutgoing({ id: serverId, clientId, sendStatus: 'sent' })
        },
        onFail: () => {
          patchOutgoing({ sendStatus: 'failed' })
        },
      })
      return
    }

    // Demo / seed chat (existing behavior)
    const newMsg: Message = {
      id: Date.now().toString(36) + Math.random(),
      from: 'me',
      text: text.trim() || '',
      timestamp: Date.now(),
      ...(voice ? { voiceUrl: voice.voiceUrl, voiceDuration: voice.voiceDuration } : {}),
      ...(photoUrl ? { photoUrl } : {}),
      ...(extras?.workoutId ? { workoutId: extras.workoutId } : {}),
      ...(extras?.workoutPreview ? { workoutPreview: extras.workoutPreview } : {}),
    }

    const currentChat = messages[chatId] || []
    const updated = { ...messages, [chatId]: [...currentChat, newMsg] }
    saveMessages(updated)

    // Simulate realistic reply sometimes (only for seeds)
    setTimeout(() => {
      const profile = SEED_PROFILES.find(p => p.id === activeChat)
      if (!profile) return
      const shouldReply = Math.random() > 0.3
      if (shouldReply) {
        const replies = [
          'Â¡Buena idea! Â¿QuÃ© dÃ­a te tinca?',
          'Jajaja yo tambiÃ©n, Â¿a quÃ© hora?',
          'Me encanta la idea. Â¿En ReÃ±aca o en la 5ta?',
          'Dale, avÃ­same el dÃ­a y nos juntamos.',
          'Perfecto, yo tambiÃ©n necesito esa motivaciÃ³n extra ðŸ”¥'
        ]
        const replyText = replies[Math.floor(Math.random() * replies.length)]
        const reply: Message = {
          id: Date.now().toString(36),
          from: 'them',
          text: replyText,
          timestamp: Date.now()
        }
        const newChat = [...(updated[chatId] || []), reply]
        const final = { ...updated, [chatId]: newChat }
        saveMessages(final)
      }
    }, 850 + Math.random() * 600)
  }

  const fetchTodayWorkoutsForShare = useCallback(async () => {
    if (isDemoMode || !db || !firebaseUser?.uid) return []
    return fetchWorkoutsForDate(db, effectiveUserId, toLocalDateStr())
  }, [isDemoMode, db, firebaseUser?.uid, effectiveUserId])

  const handleShareWorkoutToChat = useCallback(
    async (workout: import('./types').Workout, chatId: string) => {
      const preview = workoutToPreview(workout)
      const text = workoutShareText(workout)
      sendMessage(text, null, null, {
        toUserId: chatId,
        workoutId: workout.id,
        workoutPreview: preview,
      })
      const name =
        matchProfiles.find((p) => p.id === chatId)?.name?.split(' ')[0] ||
        'tu partner'
      toast.success('Entreno compartido en el chat', { description: `Enviado a ${name}` })
    },
    [sendMessage, matchProfiles]
  )

  // ==================== MATCH MODAL ACTIONS ====================
  const closeMatchModal = (goToChat = false) => {
    const profile = showMatchModal
    setShowMatchModal(null)
    if (goToChat && profile) {
      setTimeout(() => openChat(profile.id), 180)
    }
  }

  // ==================== FILTERS ====================
  const toggleFilterTraining = (type: string) => {
    setFilters(f => ({
      ...f,
      trainingTypes: f.trainingTypes.includes(type)
        ? f.trainingTypes.filter(t => t !== type)
        : [...f.trainingTypes, type]
    }))
  }
  const toggleFilterAvailability = (time: string) => {
    setFilters(f => ({
      ...f,
      availability: f.availability.includes(time)
        ? f.availability.filter(t => t !== time)
        : [...f.availability, time]
    }))
  }
  // resetFilters is now provided by useFilters hook
  // Keeping a fallback for compatibility during refactor
  const resetFilters = resetFiltersHook || (() => {
    setFilters({ minAge: 18, maxAge: 70, gender: 'todos', trainingTypes: [], availability: [], maxDistanceKm: 100, onlyAvailableToday: false, onlyLiveTraining: false })
  })

  // Auth gate lives in RootApp â†’ PublicAuthPage; App only renders for authenticated users.

  // For real users or demo users without full profile, show onboarding/creation flow.
  // Incomplete Firestore profiles are forced via ProfileContext (fase 162).
  const shouldShowOnboarding = showOnboarding

  const closeOnboarding = (show: boolean) => {
    setShowOnboarding(show)
    if (!show) setIsEditingProfile(false)
  }

  const openProfileEditor = () => {
    setOnboardingStepLocal(0)
    setIsEditingProfile(true)
    setShowOnboarding(true)
  }

  if (shouldShowOnboarding && isEditingProfile) {
    return (
      <ErrorBoundary>
        <ProfileEditFlow
          currentUser={currentUser}
          saveUser={saveUserWithRealSync}
          onClose={() => closeOnboarding(false)}
          requestUserLocation={requestUserLocation}
          triggerHaptic={triggerHaptic}
          uploadPhotoIfNeeded={uploadProfilePhotoIfNeeded}
        />
      </ErrorBoundary>
    )
  }

  if (shouldShowOnboarding) {
    return (
      <ErrorBoundary>
        <OnboardingFlow
          onboardingStep={onboardingStep}
          setOnboardingStep={setOnboardingStepLocal}
          currentUser={currentUser}
          saveUser={saveUserWithRealSync}
          setShowOnboarding={closeOnboarding}
          requestUserLocation={requestUserLocation}
          consents={{ is18: false, isForTraining: false, sharesLocation: false }}
          setConsents={() => {}}
          triggerHaptic={triggerHaptic}
          uploadPhotoIfNeeded={uploadProfilePhotoIfNeeded}
          mode="create"
          isDemoMode={isDemoMode}
          onExitToLogin={handleLogout}
        />
      </ErrorBoundary>
    )
  }

  // Post-onboarding guidance moved to early unconditional useEffect below (see "exceptional onboarding guidance effect").

  const inFullScreenChat = activeTab === 'red' && redSubTab === 'messages' && !!activeChat

  return (
    <ErrorBoundary>
      <div className={`bg-[#0D0D10] text-white flex flex-col overflow-hidden relative app-container em-visual-v2${inFullScreenChat ? ' app-container--chat-active' : ''}`}>
      {/* PREMIUM TOP BAR â€” hidden in 1:1 chat (WhatsApp-style full bleed) */}
      {!inFullScreenChat && (
      <div className="em-v2-topbar flex items-center justify-between px-4 py-2 text-[10px] font-medium">
        <div className="flex items-center gap-2 min-w-0">
          <span className="em-v2-topbar__logo shrink-0">EntrenaMatch</span>
          {liveTrainingNow.length > 0 && (
            <button
              type="button"
              onClick={() => { try { triggerHaptic('light') } catch {}; navigateTab('map'); }}
              className="em-v2-live-chip-btn min-w-0"
              title={`Ver ${BRAND_COPY.liveMapLabel}`}
            >
              <span
                className="em-v2-live-chip"
                style={{ animation: 'live-pulse-green 2.2s ease-in-out infinite' }}
              >
                ðŸŸ¢ {liveCountForUI} en {BRAND_COPY.liveMapLabel}
              </span>
              {(currentUser?.trainingNow && currentUser.liveStreak) || syncPartnerId || activeSyncCount > 0 ? (
                <span className="em-v2-live-chip__meta">
                  {currentUser?.trainingNow && currentUser.liveStreak ? `ðŸ”¥ ${currentUser.liveStreak}d racha` : ''}
                  {syncPartnerId ? `${currentUser?.trainingNow && currentUser.liveStreak ? ' Â· ' : ''}ðŸ”„ Sync activo` : ''}
                  {activeSyncCount > 0 ? `${syncPartnerId || (currentUser?.trainingNow && currentUser.liveStreak) ? ' Â· ' : ''}ðŸ”„ ${activeSyncCount} pares` : ''}
                </span>
              ) : null}
            </button>
          )}
        </div>

        {(currentUser || firebaseUser) ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowNotifications(true)}
              className={`em-v2-topbar-icon-btn ${ (unreadNotifications + totalChatUnreads + totalSessionUnreads) > 0 ? 'em-v2-topbar-icon-btn--alert' : '' }`}
              aria-label="Notificaciones"
            >
              <Bell size={15} />
              {(unreadNotifications + totalChatUnreads + totalSessionUnreads) > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 text-[8px] font-bold rounded-full flex items-center justify-center ${unreadNotifications > 0 ? 'bg-[#FF4F79] text-black animate-pulse' : 'bg-[#FF671F] text-black'}`}>
                  {Math.min(9, unreadNotifications + totalChatUnreads + totalSessionUnreads)}
                </span>
              )}
            </button>
            {!isDemoMode && typeof window !== 'undefined' && typeof (window as any).Capacitor === 'undefined' && (
              <button
                type="button"
                onClick={() => { 
                  localStorage.removeItem('entrenamatch_pwa_dismissed');
                  setShowPwaInstall(true); 
                  bumpPwaEngagement(); 
                }}
                className="em-v2-topbar-pwa active:scale-[0.985] flex-shrink-0"
                title="Instalar como app en pantalla de inicio"
              >
                ðŸ“± Instalar
              </button>
            )}
          </div>
        ) : (
          <div className="text-[10px] opacity-90 font-medium shrink-0">Inicia sesiÃ³n para probar</div>
        )}
      </div>
      )}

      {isDemoMode && currentUser && !showOnboarding && !inFullScreenChat && (
        <div
          className="sticky top-0 z-[48] bg-[#FFD700]/12 border-b border-[#FFD700]/35 px-3 py-1.5 text-center text-[10px] text-[#FFD700] font-semibold flex-shrink-0"
          role="status"
        >
          Modo prueba â€” datos locales; no cruzan con cuentas reales ni otros dispositivos
        </div>
      )}

      {/* PWA INSTALL BANNER - attractive, non-nagging. Shows reliably now (5s or on engagement). Exhaustive visual + functional review done. */}
      <AnimatePresence>
        {showPwaInstall && !pwaInstallDismissed && !Capacitor.isNativePlatform() && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -8 }}
            className="sticky top-0 bg-[#1C1C20] border-b border-[#FF671F]/40 px-3 py-2 text-xs flex items-center gap-2 z-50 flex-shrink-0"
          >
            <div className="flex items-center gap-1.5 text-[#FF671F]">
              <Download size={15} />
              <span className="font-medium hidden xs:inline">App lista</span>
            </div>
            <div className="flex-1 text-[#cbd5e1] leading-tight pr-1">
              {deferredInstallPrompt 
                ? 'InstÃ¡lala para abrir rÃ¡pido desde tu pantalla de inicio + notificaciones nativas.'
                : 'Usa el menÃº del navegador (â‹¯ o Compartir) > "AÃ±adir a pantalla de inicio" para instalar como app.'}
            </div>
            {deferredInstallPrompt ? (
              <button 
                onClick={handleInstallPwa} 
                className="px-3.5 py-1 bg-[#FF671F] text-black rounded-2xl font-semibold text-[11px] active:bg-[#E55A1A] active:scale-[0.985] transition whitespace-nowrap"
              >
                Instalar
              </button>
            ) : (
              <button 
                onClick={dismissPwaInstall} 
                className="text-[#FF671F] px-2 py-0.5 text-[11px] font-semibold"
              >
                Entendido
              </button>
            )}
            <button 
              onClick={dismissPwaInstall} 
              className="text-[#9CA3AF] hover:text-white px-1.5 text-base leading-none"
              aria-label="Cerrar"
            >
              Ã—
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div className="app-main flex-1 overflow-hidden relative flex flex-col min-h-0">
        {/* Global offline indicator - visible on all tabs for good UX when no connectivity (Firebase queues + cache) */}
        {isOffline && !inFullScreenChat && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-yellow-900/90 text-yellow-200 text-[10px] px-3 py-1 text-center border-b border-yellow-800/60 z-20 flex items-center justify-center gap-2"
          >
            <span>ðŸ“¡</span>
            <span>Sin conexiÃ³n â€¢ usando cachÃ© â€¢ cambios se guardan y sincronizan al reconectar</span>
          </motion.div>
        )}
        {/* ===== MAP tab (full) vs EXPLORE live banner only â€” separate mounts so Leaflet never bleeds into swipe deck ===== */}
        {activeTab === 'explore' && (
          <MapExplorePanelMount
            dedicatedMapTab={false}
            cityActiveCount={firestoreCityStats?.participantCount ?? homeCityChallengeMerged?.participants ?? 0}
            cityLabel={currentUser?.city || 'tu zona'}
            liveCountForUI={liveCountForUI}
            liveTrainingNow={liveTrainingNow}
            syncBonds={syncBonds}
            dailyPulse={dailyPulse}
            activeSyncCount={activeSyncCount}
            currentUser={currentUser}
            userLocation={userLocation}
            joiningSyncWith={joiningSyncWith}
            setShowFullProfile={setShowFullProfile}
            handleSwipe={handleSwipe}
            setShowLiveMap={setShowLiveMap}
            setActiveTab={navigateTab}
            setShowLiveModal={setShowLiveModal}
            triggerHaptic={triggerHaptic}
            showLiveMap={showLiveMap}
            networkStats={networkStats}
            gymPulseMapRef={gymPulseMapRef}
            mapLiveTrainingNow={mapLiveTrainingNow}
            effectiveUserId={effectiveUserId}
            syncRipples={syncRipples}
            setSyncRipples={setSyncRipples}
            partnerLocations={partnerLocations}
            mapPartnerLocations={mapPartnerLocations}
            echoPins={echoPins}
            mapNearOnly={mapNearOnly}
            selectedMapZone={selectedMapZone}
            showOnlyNetwork={showOnlyNetwork}
            showPartners={showPartners}
            mapMyGymOnly={mapMyGymOnly}
            mapMyGymId={mapMyGymId}
            mapForceTick={mapForceTick}
            isDeveloper={isDeveloper}
            isPlacingPartner={isPlacingPartner}
            isQuickAddPartner={isQuickAddPartner}
            setMapNearOnly={setMapNearOnly}
            setSelectedMapZone={setSelectedMapZone}
            setShowOnlyNetwork={setShowOnlyNetwork}
            setShowPartners={setShowPartners}
            setMapForceTick={setMapForceTick}
            setMapMyGymOnly={setMapMyGymOnly}
            openAddPartner={openAddPartner}
            openManagePartners={openManagePartners}
            setIsQuickAddPartner={setIsQuickAddPartner}
            logoutDeveloper={logoutDeveloper}
            addPartnerAtCurrentCenter={addPartnerAtCurrentCenter}
            reloadPartners={reloadPartners}
            spawnDevTestLives={spawnDevTestLives}
            clearDevTestLives={clearDevTestLives}
            startSyncWith={startSyncWith}
            handleGymCheckIn={handleGymCheckIn}
            witnessEchoPin={witnessEchoPin}
            witnessRipple={witnessRipple}
            isQuickAddPartnerRef={isQuickAddPartnerRef}
            isDemoMode={isDemoMode}
            db={db}
            setPartnerLocations={setPartnerLocations}
            startEditPartner={startEditPartner}
            setPartnerFormLat={setPartnerFormLat}
            setPartnerFormLng={setPartnerFormLng}
            setIsPlacingPartner={setIsPlacingPartner}
            devTestLives={devTestLives}
            toast={toast}
            partnerFormLat={partnerFormLat}
            partnerFormLng={partnerFormLng}
            handlePartnerEditFromMap={handlePartnerEditFromMap}
            cancelPartnerForm={cancelPartnerForm}
            partnerFormName={partnerFormName}
            partnerFormType={partnerFormType}
            partnerFormAddress={partnerFormAddress}
            setPartnerFormName={setPartnerFormName}
            setPartnerFormType={setPartnerFormType}
            setPartnerFormAddress={setPartnerFormAddress}
            showAddPartnerForm={showAddPartnerForm}
            editingPartnerId={editingPartnerId}
            setEditingPartnerId={setEditingPartnerId}
            setShowAddPartnerForm={setShowAddPartnerForm}
            partnerLocationsRef={partnerLocationsRef}
            requestUserLocation={requestUserLocation}
            showDevLogin={showDevLogin}
            setShowDevLogin={setShowDevLogin}
            devPassword={devPassword}
            setDevPassword={setDevPassword}
            loginAsDeveloper={loginAsDeveloper}
            showManagePartners={showManagePartners}
            setShowManagePartners={setShowManagePartners}
            partnerLogoPreview={partnerLogoPreview}
            partnerLogoFile={partnerLogoFile}
            setPartnerLogoFile={setPartnerLogoFile}
            setPartnerLogoPreview={setPartnerLogoPreview}
            handlePartnerLogoSelect={handlePartnerLogoSelect}
            CapacitorCamera={CapacitorCamera}
            uploadPartnerLogoIfNeeded={uploadPartnerLogoIfNeeded}
            onActivateLive={() => void toggleLiveTraining('on')}
          />
        )}

        {activeTab === 'map' && (
          <EmV2TabShell variant="map">
          <TabErrorBoundary tabName="Mapa LIVE">
          <MapExplorePanelMount
            dedicatedMapTab={true}
            liveCountForUI={liveCountForUI}
            liveTrainingNow={liveTrainingNow}
            syncBonds={syncBonds}
            dailyPulse={dailyPulse}
            activeSyncCount={activeSyncCount}
            currentUser={currentUser}
            userLocation={userLocation}
            joiningSyncWith={joiningSyncWith}
            setShowFullProfile={setShowFullProfile}
            handleSwipe={handleSwipe}
            setShowLiveMap={setShowLiveMap}
            setActiveTab={navigateTab}
            setShowLiveModal={setShowLiveModal}
            triggerHaptic={triggerHaptic}
            showLiveMap={showLiveMap}
            networkStats={networkStats}
            gymPulseMapRef={gymPulseMapRef}
            mapLiveTrainingNow={mapLiveTrainingNow}
            effectiveUserId={effectiveUserId}
            syncRipples={syncRipples}
            setSyncRipples={setSyncRipples}
            partnerLocations={partnerLocations}
            mapPartnerLocations={mapPartnerLocations}
            echoPins={echoPins}
            mapNearOnly={mapNearOnly}
            selectedMapZone={selectedMapZone}
            showOnlyNetwork={showOnlyNetwork}
            showPartners={showPartners}
            mapMyGymOnly={mapMyGymOnly}
            mapMyGymId={mapMyGymId}
            mapForceTick={mapForceTick}
            isDeveloper={isDeveloper}
            isPlacingPartner={isPlacingPartner}
            isQuickAddPartner={isQuickAddPartner}
            setMapNearOnly={setMapNearOnly}
            setSelectedMapZone={setSelectedMapZone}
            setShowOnlyNetwork={setShowOnlyNetwork}
            setShowPartners={setShowPartners}
            setMapForceTick={setMapForceTick}
            setMapMyGymOnly={setMapMyGymOnly}
            openAddPartner={openAddPartner}
            openManagePartners={openManagePartners}
            setIsQuickAddPartner={setIsQuickAddPartner}
            logoutDeveloper={logoutDeveloper}
            addPartnerAtCurrentCenter={addPartnerAtCurrentCenter}
            reloadPartners={reloadPartners}
            spawnDevTestLives={spawnDevTestLives}
            clearDevTestLives={clearDevTestLives}
            startSyncWith={startSyncWith}
            handleGymCheckIn={handleGymCheckIn}
            witnessEchoPin={witnessEchoPin}
            witnessRipple={witnessRipple}
            isQuickAddPartnerRef={isQuickAddPartnerRef}
            isDemoMode={isDemoMode}
            db={db}
            setPartnerLocations={setPartnerLocations}
            startEditPartner={startEditPartner}
            setPartnerFormLat={setPartnerFormLat}
            setPartnerFormLng={setPartnerFormLng}
            setIsPlacingPartner={setIsPlacingPartner}
            devTestLives={devTestLives}
            toast={toast}
            partnerFormLat={partnerFormLat}
            partnerFormLng={partnerFormLng}
            handlePartnerEditFromMap={handlePartnerEditFromMap}
            cancelPartnerForm={cancelPartnerForm}
            partnerFormName={partnerFormName}
            partnerFormType={partnerFormType}
            partnerFormAddress={partnerFormAddress}
            setPartnerFormName={setPartnerFormName}
            setPartnerFormType={setPartnerFormType}
            setPartnerFormAddress={setPartnerFormAddress}
            showAddPartnerForm={showAddPartnerForm}
            editingPartnerId={editingPartnerId}
            setEditingPartnerId={setEditingPartnerId}
            setShowAddPartnerForm={setShowAddPartnerForm}
            partnerLocationsRef={partnerLocationsRef}
            requestUserLocation={requestUserLocation}
            showDevLogin={showDevLogin}
            setShowDevLogin={setShowDevLogin}
            devPassword={devPassword}
            setDevPassword={setDevPassword}
            loginAsDeveloper={loginAsDeveloper}
            showManagePartners={showManagePartners}
            setShowManagePartners={setShowManagePartners}
            partnerLogoPreview={partnerLogoPreview}
            partnerLogoFile={partnerLogoFile}
            setPartnerLogoFile={setPartnerLogoFile}
            setPartnerLogoPreview={setPartnerLogoPreview}
            handlePartnerLogoSelect={handlePartnerLogoSelect}
            CapacitorCamera={CapacitorCamera}
            uploadPartnerLogoIfNeeded={uploadPartnerLogoIfNeeded}
            onActivateLive={() => void toggleLiveTraining('on')}
            onCityChallengeCta={() => {
              if (currentUser?.trainingNow) {
                navigateTab('home')
                toast('Cada minuto LIVE suma al reto de tu ciudad')
              } else {
                void toggleLiveTraining('on')
              }
            }}
            cityChallenge={
              homeCityChallengeMerged
                ? {
                    cityLabel: homeCityChallengeMerged.cityLabel,
                    progressPct: homeCityChallengeMerged.progressPct,
                    currentMinutes: homeCityChallengeMerged.currentMinutes,
                    targetMinutes: homeCityChallengeMerged.targetMinutes,
                  }
                : null
            }
            cityDerby={homeCityDerby}
          />
          </TabErrorBoundary>
          </EmV2TabShell>
        )}

        {activeTab === 'explore' && (
          <EmV2TabShell>
          <TabErrorBoundary tabName="Explorar">
          <PullToRefresh
            className="pull-to-refresh--explore flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden relative z-10 isolate bg-[#0D0D10]"
            disabled={isDemoMode}
            onRefresh={async () => {
              await silentRefreshReal()
            }}
          >
          <Suspense fallback={TAB_LOADING}>
          <LazyExploreTab
            compactHeader={liveCountForUI > 0 || liveTrainingNow.length > 0}
            deck={deck}
            visibleCards={visibleCards}
            userLocation={userLocation}
            filters={filters}
            currentUser={currentUser}
            setShowFilters={setShowFilters}
            resetDeck={async () => {
              try {
                const { clearedSwipes } = await resetSwipeDeck()
                await loadRealProfiles()
                if (clearedSwipes > 0) {
                  toast.success(
                    `Deck reiniciado â€” ${clearedSwipes} perfil${clearedSwipes === 1 ? '' : 'es'} desbloqueado${clearedSwipes === 1 ? '' : 's'}`,
                    { description: 'Si no ves tarjetas, prueba ampliar filtros con el botÃ³n de abajo' }
                  )
                } else {
                  toast.success('Deck reiniciado', {
                    description: 'Si sigue vacÃ­o, amplÃ­a filtros o invita a alguien de tu gym',
                  })
                }
              } catch {
                toast.error('No se pudo reiniciar el deck', {
                  description: 'Revisa tu conexiÃ³n e intÃ©ntalo de nuevo',
                })
              }
            }}
            isResettingDeck={isResettingDeck}
            requestUserLocation={requestUserLocation}
            isLoadingProfiles={!discoveryReady && !isDemoMode && realProfiles.length === 0}
            onSwipe={(direction, profileId) => {
              if (direction === 'right') {
                handleSwipe(profileId, 'right');
              } else {
                handleSwipe(profileId, 'left');
              }
            }}
            onShowProfile={setShowFullProfile}
            onReport={(id) => {
              openReport(id, 'explore_rec')
            }}
            realProfiles={realProfiles}
            lastSync={lastSync}
            profilePosts={profilePosts}
            syncBonds={syncBonds}
            networkPower={networkStats.networkPower}
            poolSize={remainingProfiles.length}
            isDemoMode={isDemoMode}
            db={db}
            firebaseUid={firebaseUser?.uid ?? null}
            onActivateLive={() => void toggleLiveTraining('on')}
            liveCountForUI={liveCountForUI}
            onOpenMap={() => navigateTab('map')}
            onRelaxFilters={() => {
              setFilters((f) => ({
                ...f,
                minAge: 18,
                maxAge: 70,
                gender: 'todos',
                trainingTypes: [],
                availability: [],
                maxDistanceKm: 100,
                onlyAvailableToday: false,
                onlyLiveTraining: false,
              }))
              toast.success('Filtros ampliados â€” todos visibles, mÃ¡s cerca primero')
            }}
          />
          </Suspense>
          </PullToRefresh>
          </TabErrorBoundary>
          </EmV2TabShell>
        )}

        {/* FULL LIVE MODAL â€” Fase 393 LiveNearModalMount */}
        <LiveNearModalMount
          open={showLiveModal}
          liveCountForUI={liveCountForUI}
          liveTrainingNow={liveTrainingNow}
          currentUser={currentUser}
          syncBonds={syncBonds}
          search={liveModalSearch}
          sort={liveModalSort}
          joiningSyncWith={joiningSyncWith}
          effectiveUserId={effectiveUserId}
          matches={matches}
          realMatches={realMatches}
          sessions={sessions}
          isDemoMode={isDemoMode}
          db={db}
          firebaseUid={firebaseUser?.uid}
          onClose={() => setShowLiveModal(false)}
          onSearchChange={setLiveModalSearch}
          onSortChange={setLiveModalSort}
          onOpenProfile={(user) => setShowFullProfile(user)}
          onStartSync={startSyncWith}
          onSwipeRight={(userId) => handleSwipe(userId, 'right')}
          onOpenChat={openChat}
          isUserLive={isUserLive}
          onNavigateMap={() => navigateTab('map')}
          onNavigateProfile={() => setActiveTab('profile')}
          onNavigateSessions={() => setActiveTab('sesiones')}
          onSessionsUpdate={setSessions}
          saveSessions={saveSessions}
        />

        {/* ===== HOME â€” DailyHome + Muro (HomeTab) ===== */}
        {activeTab === 'home' && (
          <EmV2TabShell>
          <TabErrorBoundary tabName="Inicio">
          <Suspense fallback={TAB_LOADING}>
          <LazyHomeTab
            currentUser={currentUser}
            homeWeekDays={homeWeekDays}
            homeWeekTrainedCount={homeWeekTrainedCount}
            homeTeamMembers={homeTeamMembers}
            liveCountForUI={liveCountForUI}
            activeSyncCount={activeSyncCount}
            isTogglingLive={isTogglingLive}
            toggleLiveTraining={toggleLiveTraining}
            setActiveTab={navigateTab}
            setShowLiveMap={setShowLiveMap}
            startSyncWith={startSyncWith}
            setActiveChat={(id) => {
              setActiveChat(id)
              setRedSubTab('messages')
            }}
            setShowEntrenaLogModal={setShowEntrenaLogModal}
            onOpenEntrenoDeHoy={() => void openEntrenoDeHoy()}
            workoutDraftUserId={!isDemoMode && firebaseUser?.uid ? firebaseUser.uid : null}
            workoutDraftRefresh={workoutDraftRefresh}
            onResumeWorkoutDraft={() => void openEntrenoDeHoy()}
            onDiscardWorkoutDraft={() => {
              if (firebaseUser?.uid) clearWorkoutDraft(firebaseUser.uid)
              setWorkoutDraftRefresh((n) => n + 1)
            }}
            entrenoWeekSummary={!isDemoMode ? entrenoWeekSummary : null}
            entrenoExerciseHighlights={entrenoExerciseHighlights}
            entrenoPactProgress={homeWeeklyPactProgress.pledged ? homeWeeklyPactProgress : null}
            entrenoPartnerCompare={entrenoPartnerCompare}
            entrenoRecentWorkouts={entrenoRecentWorkouts}
            onRepeatYesterday={handleRepeatYesterday}
            onOpenPactWizard={() => setShowPactWizard(true)}
            fuelProfile={fuelProfile}
            fuelTodayTotals={fuelTodayTotals}
            fuelTodayLogs={fuelTodayLogs}
            fuelWeekDays={fuelWeekDays}
            fuelWeekMacros={fuelWeekMacros}
            fuelPostWorkoutTip={fuelPostWorkoutTip}
            fuelEnergyBalance={fuelEnergyBalance}
            fuelWeekBalanceDays={fuelWeekBalanceDays}
            openFuelWizard={() => setShowFuelSetupWizard(true)}
            setShowFuelSetupModal={setShowFuelSetupModal}
            exercisePRRecords={exercisePRRecords}
            openFuelLogModal={() => {
              setEditingFuelLog(null)
              setShowFuelLogModal(true)
            }}
            onEditFuelLog={handleEditFuelLog}
            onDeleteFuelLog={handleDeleteFuelLog}
            deletingFuelLogId={deletingFuelLogId}
            homeCityChallengeMerged={homeCityChallengeV2 ?? homeCityChallengeMerged}
            homeLocalLeaderboard={homeLocalLeaderboard}
            homeGymLeaderboard={homeGymLeaderboard}
            homeMyLeaderboardRank={homeMyLeaderboardRank}
            homeCityLiveCount={homeCityLiveCount}
            homeNearestGym={homeNearestGym}
            homeGymLiveCount={homeGymLiveCount}
            handleToggleLeaderboard={handleToggleLeaderboard}
            handleGymCheckIn={handleGymCheckIn}
            mapMyGymId={mapMyGymId}
            handleOpenGymMap={handleOpenGymMap}
            setShowFeedPostModal={setShowFeedPostModal}
            feedSearch={feedSearch}
            setFeedSearch={setFeedSearch}
            feedOnlyReal={feedOnlyReal}
            setFeedOnlyReal={setFeedOnlyReal}
            feedOnlyLive={feedOnlyLive}
            setFeedOnlyLive={setFeedOnlyLive}
            feedShowPinnedOnly={feedShowPinnedOnly}
            setFeedShowPinnedOnly={setFeedShowPinnedOnly}
            feedMaxProfiles={feedMaxProfiles}
            setFeedMaxProfiles={setFeedMaxProfiles}
            feedDisplayLimit={feedDisplayLimit}
            setFeedDisplayLimit={setFeedDisplayLimit}
            loadGlobalFeed={loadGlobalFeed}
            isDemoMode={isDemoMode}
            pilotDb={db}
            pilotInviteLink={buildInviteLink(effectiveUserId)}
            cityDerby={homeCityDerby}
            onOpenDerbyMap={() => navigateTab('map')}
            loadRealProfiles={loadRealProfiles}
            isLoadingFeed={isLoadingFeed}
            activeSyncPairs={activeSyncPairs}
            liveTrainingNow={liveTrainingNow}
            syncBonds={syncBonds}
            triggerHaptic={triggerHaptic}
            showFeedPublishSuccess={showFeedPublishSuccess}
            feedPublishing={feedPublishing}
            feedComputation={feedComputation}
            hasMoreGlobalFeed={hasMoreGlobalFeed}
            effectiveUserId={effectiveUserId}
            setShowFullProfile={setShowFullProfile}
            boostReaction={boostReaction}
            openFullComments={openFullComments}
            startComment={startComment}
            activeComment={activeComment}
            commentDraft={commentDraft}
            setCommentDraft={setCommentDraft}
            submitComment={submitComment}
            cancelComment={cancelComment}
            realProfiles={realProfiles}
            recentlyPublishedPostId={recentlyPublishedPostId}
            setFeedPhotoModal={setFeedPhotoModal}
            getRelativeTime={getRelativeTime}
            handleCopyWorkoutFromPost={handleCopyWorkoutFromPost}
            togglePinPost={togglePinPost}
            deleteProfilePost={deleteProfilePost}
            likeProfilePost={likeProfilePost}
            feedReactions={feedReactions}
            userLocation={userLocation}
            toast={toast}
            weeklyPact={(currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact}
            weeklyPactProgress={homeWeeklyPactProgress}
            onPledgeWeeklyPact={handleWeeklyPactPledge}
            weeklyPlan={weeklyPlan}
            weeklyPlanEnriching={weeklyPlanEnriching}
            onStartWeeklyPlan={handleStartWeeklyPlan}
            onPublishWeeklyPlanToFeed={handlePublishWeeklyPlanToFeed}
            onShareWeeklyPlanExternally={handleShareWeeklyPlanExternally}
            homeCoachBanner={homeCoachBanner}
            onDismissCoachBanner={() => setHomeCoachBanner(null)}
            postLiveSession={postLiveSession}
            postLivePublishing={postLivePublishing}
            onPublishPostLive={async (text: string) => {
              setPostLivePublishing(true)
              setHomeSubTab('feed')
              try {
                await createProfilePost(text, null, undefined, { skipToast: true })
                toast.success(BRAND_COPY.feed.publishedTitle, {
                  description: BRAND_COPY.feed.liveSessionDesc,
                })
                setPostLiveSession(null)
                void loadGlobalFeed()
              } catch {
                toast.error('No se pudo publicar')
              } finally {
                setPostLivePublishing(false)
              }
            }}
            onPostLiveWithPhoto={() => {
              const text = buildPostLiveFeedText(
                postLiveSession?.minutes ?? 45,
                postLiveSession?.gymName
              )
              setFeedPostText(text)
              setShowFeedPostModal(true)
            }}
            onPostLiveEntrenoLog={() => {
              void openEntrenoDeHoy({
                durationMin: postLiveSession?.minutes ?? 45,
                title: postLiveSession?.gymName
                  ? `SesiÃ³n en ${postLiveSession.gymName}`
                  : 'SesiÃ³n live',
                type: 'strength',
              })
              setPostLiveSession(null)
            }}
            onDismissPostLive={() => setPostLiveSession(null)}
            workoutSaveBanner={workoutSaveBanner}
            onDismissWorkoutSaveBanner={() => setWorkoutSaveBanner(null)}
            onShareWorkoutSave={() => {
              const opts = workoutSaveShareOptsRef.current
              if (opts) {
                void shareWorkoutStory(opts).then((outcome) =>
                  toastWorkoutShareOutcome(toast, outcome)
                )
              }
            }}
            onOpenFuelFromWorkoutSave={() => {
              if (workoutSaveBanner) {
                setFuelLogPrefill(buildFuelLogPrefillFromWorkoutSave(workoutSaveBanner))
              }
              setEditingFuelLog(null)
              setShowFuelLogModal(true)
              setWorkoutSaveBanner(null)
            }}
            pactReminderDismissed={pactReminderDismissed}
            onDismissPactReminder={() => setPactReminderDismissed(true)}
            onOpenTrainerCoach={() => {
              setTrainerCoachInitialTab('explore')
              setShowTrainerCoach(true)
            }}
            marketplaceOrders={myMarketplaceOrders}
            marketplaceProducts={marketplaceProducts}
            showShopBanner={
              showHomeShopBanner &&
              !shouldHideCoachAndMarketplace(currentUser, Object.keys(syncBonds || {}).length)
            }
            onDismissShopBanner={() => setShowHomeShopBanner(false)}
            onOpenMarketplace={
              isMarketplaceUiEnabled()
                ? () => {
                    setMarketplaceScreenMode('shop')
                    setShowMarketplace(true)
                  }
                : undefined
            }
            onOpenMarketplaceOrders={
              isMarketplaceUiEnabled()
                ? () => {
                    setMarketplaceScreenMode('orders')
                    setShowMarketplace(true)
                  }
                : undefined
            }
            showPactWizard={showPactWizard}
            profilePostsFeed={(profilePosts[effectiveUserId] || []).concat(
              Object.values(profilePosts).flat().filter((p: any) => p.postType === 'workout')
            ).slice(0, 20)}
            onQuickFeedTemplate={(text) => {
              setFeedPostText(text)
              setShowFeedPostModal(true)
            }}
            homeSubTab={homeSubTab}
            onHomeSubTabChange={setHomeSubTab}
            onImportHealthBurn={handleImportHealthBurn}
            healthImportHint={healthImportHint}
            wearableActivity={Capacitor.isNativePlatform() ? wearableActivity : undefined}
            wearableSyncing={Capacitor.isNativePlatform() ? wearableSyncing : undefined}
            onRefreshWearableActivity={
              Capacitor.isNativePlatform() ? syncWearableNow : undefined
            }
            onOpenWearableConnect={
              Capacitor.isNativePlatform() ? () => setActiveTab('profile') : undefined
            }
          />
          </Suspense>
          </TabErrorBoundary>
          </EmV2TabShell>
        )}

        {activeTab === 'home' && (
          <HomeFeedOverlays
            showComposer={showFeedPostModal}
            text={feedPostText}
            photo={feedPostPhoto}
            photoUploading={feedPhotoUploading}
            photoUploadProgress={feedPhotoUploadProgress}
            publishing={feedPublishing}
            onCloseComposer={() => {
              setShowFeedPostModal(false)
              setFeedPostText('')
              setFeedPostPhoto(null)
            }}
            onTextChange={setFeedPostText}
            onPhotoRemove={() => setFeedPostPhoto(null)}
            onPhotoPreview={(url) => setFeedPhotoModal({ url })}
            onPhotoFile={handleFeedPhotoFile}
            onPickNativePhoto={handlePickFeedNativePhoto}
            photoInputRef={feedPhotoInputRef}
            onPublish={() => {
              if (!feedPostText.trim() || feedPublishing || feedPhotoUploading) return
              const text = feedPostText.trim()
              const photo = feedPostPhoto
              setFeedPostText('')
              setFeedPostPhoto(null)
              setShowFeedPostModal(false)
              openCommunityMuro()
              setFeedPublishing(true)
              void (async () => {
                try {
                  await createProfilePost(text, photo, undefined, { skipToast: true })
                  setShowFeedPublishSuccess(true)
                  setTimeout(() => setShowFeedPublishSuccess(false), 4200)
                  toast.success(BRAND_COPY.feed.publishedTitle, {
                    description: BRAND_COPY.feed.publishedDesc,
                  })
                  try {
                    confetti({ particleCount: 140, spread: 70, origin: { y: 0.65 } })
                  } catch {}
                } catch {
                  toast.error('Error al publicar', { description: 'IntÃ©ntalo de nuevo.' })
                } finally {
                  setFeedPublishing(false)
                }
              })()
            }}
          />
        )}

        {feedPhotoModal && (
          <FeedPhotoLightbox
            url={feedPhotoModal.url}
            onClose={() => setFeedPhotoModal(null)}
          />
        )}

        {activeTab === 'squads' && (
          <Suspense fallback={TAB_LOADING}>
          <LazySquadsTab
            squads={squads}
            isDemoMode={isDemoMode}
            effectiveUserId={effectiveUserId}
            isUserLive={isUserLive}
            resolveMemberName={resolveMemberName}
            onCreateSquad={() => {
              setSquadNameDraft(suggestedSquadName(currentUser?.city))
              setShowCreateSquad(true)
            }}
            onJoinSquad={handleJoinSquad}
            onOpenSquad={setSelectedSquad}
            onOpenSessions={() => navigateTab('sesiones')}
            sessionUnreads={totalSessionUnreads}
            userCity={currentUser?.city}
            onCreateSquadWithName={(name) => {
              setSquadNameDraft(name)
              setShowCreateSquad(true)
            }}
            squadFuelSummary={squadFuelSummary}
          />
          </Suspense>
        )}

        {activeTab === 'sesiones' && (
          <Suspense fallback={TAB_LOADING}>
          <LazySessionsTab
            sessions={displaySessions}
            effectiveUserId={effectiveUserId}
            isDemoMode={isDemoMode}
            isLoadingSessions={isLoadingSessions}
            lastSync={lastSync}
            isCreatorLive={(creatorId) => liveTrainingNow.some((u) => u.id === creatorId)}
            getCreatorDistanceKm={(creatorId) => {
              const creatorProfile = SEED_PROFILES.find((p) => p.id === creatorId)
              return userLocation && creatorProfile
                ? getDistanceKm(
                    userLocation.lat,
                    userLocation.lng,
                    creatorProfile.lat || 0,
                    creatorProfile.lng || 0
                  )
                : null
            }}
            onCreateSession={() => setShowCreateSession(true)}
            onRefreshSessions={async () => {
              setIsLoadingSessions(true)
              try {
                await loadRealSessions()
              } finally {
                setIsLoadingSessions(false)
              }
            }}
            onJoinSession={handleJoinSession}
            onOpenGroupChat={(sessionId) => {
              setShowGroupChatModalFor(sessionId)
              setChatInputValue('')
            }}
            onCloseSession={closeSession}
            onLeaveSession={leaveSession}
            onReviewCreator={(creatorId) => setShowReviewModalFor(creatorId)}
          />
          </Suspense>
        )}

        {activeTab === 'red' && (
          <EmV2TabShell>
          <RedTab
            subTab={redSubTab}
            hideSubNav={redSubTab === 'messages' && !!activeChat}
            onSubTabChange={(sub) => {
              setRedSubTab(sub)
              if (sub === 'matches') setActiveChat(null)
            }}
            chatUnreads={totalChatUnreads}
          >
        {redSubTab === 'matches' && (
          <PullToRefresh
            className="flex-1 flex flex-col min-h-0 overflow-auto"
            disabled={isDemoMode}
            onRefresh={async () => {
              await silentRefreshReal()
            }}
          >
          <TabErrorBoundary tabName="Matches">
          <Suspense fallback={TAB_LOADING}>
          <LazyMatchesTab
            matchProfiles={matchProfiles}
            blockedUsers={blockedUsers}
            syncBonds={syncBonds}
            realProfiles={realProfiles}
            currentUser={currentUser}
            userLocation={userLocation}
            reviews={reviews}
            squads={squads}
            effectiveUserId={effectiveUserId}
            profilePosts={profilePosts}
            isDemoMode={isDemoMode}
            isLoadingMatches={isLoadingMatches}
            loadingPartnerIds={missingMatchPartnerIds}
            lastSync={lastSync}
            onExplore={() => navigateTab('explore')}
            onOpenChat={openChat}
            onOpenSquads={() => navigateTab('squads')}
          />
          </Suspense>
          </TabErrorBoundary>
          </PullToRefresh>
        )}

        {redSubTab === 'messages' && (
          <RedMessagesPanel
            activeChat={activeChat}
            isDemoMode={isDemoMode}
            matchProfiles={matchProfiles}
            blockedUsers={blockedUsers}
            messages={messages}
            chatUnreads={chatUnreads}
            syncBonds={syncBonds}
            userLocation={userLocation}
            isLoadingChats={isLoadingChats}
            lastSync={lastSync}
            getRelativeTime={getRelativeTime}
            onSelectChat={(id) => {
              setActiveChat(id)
              setChatUnreads((prev) => {
                const c = { ...prev }
                c[id] = 0
                return c
              })
            }}
            onOpenExplore={() => navigateTab('explore')}
            onRefreshList={async () => {
              await silentRefreshReal({ includeChats: true })
            }}
            chatProfile={chatProfile}
            isRealMatch={!!activeChat && realMatches.includes(activeChat)}
            chatMessages={
              activeChat
                ? realChatMessages.length > 0
                  ? realChatMessages
                  : messages[activeChat] || []
                : []
            }
            syncBond={activeChat ? syncBonds[activeChat] : undefined}
            workoutSessionDraft={workoutSessionDraft}
            entrenoRecentWorkouts={entrenoRecentWorkouts}
            showEntrenaLogModal={showEntrenaLogModal}
            onResumeWorkout={() => void openEntrenoDeHoy()}
            onQuickAddSet={handleWorkoutQuickAddSet}
            onOpenChatFromFab={handleWorkoutOpenChat}
            onOpenFuelFromFab={handleWorkoutOpenFuel}
            totalChatUnreads={totalChatUnreads}
            chatViewProps={{
              playingVoiceId,
              voicePlayProgress,
              pendingVoice,
              isUploadingVoice,
              voiceUploadProgress,
              pendingPhoto: pendingChatPhoto ? { url: pendingChatPhoto.url } : null,
              isUploadingPhoto: isUploadingChatPhoto,
              photoUploadProgress: chatPhotoUploadProgress,
              isRecordingVoice,
              recordingTime,
              recordingLevels,
              chatInputValue,
              partnerTyping: chatPartnerTyping,
              chatScrollRef,
              renderMessageText,
              onBack: () => setActiveChat(null),
              onShowProfile: () => chatProfile && setShowFullProfile(chatProfile),
              onRefreshChat: async () => {
                if (!activeChat) return
                setIsLoadingChats(true)
                try {
                  await loadRealChatMessages(activeChat)
                  setLastSync(new Date())
                  setChatUnreads((prev) => {
                    const c = { ...prev }
                    c[activeChat] = 0
                    return c
                  })
                  toast.success('Chat actualizado')
                } finally {
                  setIsLoadingChats(false)
                }
              },
              onStartSync: () =>
                activeChat && startSyncWith(activeChat, chatProfile?.name || ''),
              onReport: () =>
                activeChat &&
                setSafetySheetTarget({ id: activeChat, name: chatProfile?.name || 'Usuario' }),
              onBlock: async () => {
                if (!activeChat) return
                await blockUser(activeChat)
                setActiveChat(null)
              },
              currentUser,
              voiceStreak: dailyPulse?.voiceStreak || 0,
              pactCompare: chatPactCompare,
              onOpenEntrenoLog: () =>
                void openEntrenoDeHoy(activeChat ? { shareToChat: activeChat } : undefined),
              fetchTodayWorkouts: fetchTodayWorkoutsForShare,
              onShareWorkoutToChat: activeChat
                ? (workout) => handleShareWorkoutToChat(workout, activeChat)
                : undefined,
              onCopyWorkout: (workoutId, title) => handleCopyWorkoutFromPost(workoutId, title),
              onOpenExplore: () => {
                setActiveChat(null)
                navigateTab('explore')
              },
              onShowReviewModal: () => {
                if (!activeChat) return
                setShowReviewModalFor(activeChat)
                setReviewRating(5)
                setReviewComment('')
              },
              onToggleVoicePlay: toggleVoicePlay,
              onSendMessage: sendMessage,
              onSendBondTemplate: (tpl) => {
                sendMessage(tpl)
                createProfilePost(`En chat con mi socio de EntrenaSync: ${tpl}`, null).catch(() => {})
              },
              onPreviewPendingVoice: () => {
                try {
                  triggerHaptic('medium')
                } catch {}
                if (pendingVoice) new Audio(pendingVoice.url).play().catch(() => {})
              },
              onCancelPendingVoice: () => {
                if (voicePreviewUrlRef.current) URL.revokeObjectURL(voicePreviewUrlRef.current)
                voicePreviewUrlRef.current = null
                setPendingVoice(null)
              },
              onReRecordVoice: () => {
                if (voicePreviewUrlRef.current) URL.revokeObjectURL(voicePreviewUrlRef.current)
                voicePreviewUrlRef.current = null
                setPendingVoice(null)
                setTimeout(() => startVoiceRecording(), 50)
              },
              onSendPendingVoice: () => {
                if (pendingVoice && activeChat) sendVoiceNote(activeChat, false)
              },
              onCancelUpload: () => {
                setPendingVoice(null)
                setIsUploadingVoice(false)
                setVoiceUploadProgress(0)
              },
              onPickPhoto: () => {
                void pickChatPhoto()
              },
              onCancelPendingPhoto: () => {
                if (chatPhotoPreviewRef.current) URL.revokeObjectURL(chatPhotoPreviewRef.current)
                chatPhotoPreviewRef.current = null
                setPendingChatPhoto(null)
              },
              onSendPendingPhoto: () => {
                if (activeChat) void sendChatPhoto(activeChat)
              },
              onChatInputChange: (value) => {
                setChatInputValue(value)
                if (isDemoMode || !db || !firebaseUser?.uid || !activeChat) return
                if (chatTypingTimerRef.current) clearTimeout(chatTypingTimerRef.current)
                void setChatTyping(db, firebaseUser.uid, activeChat, value.trim().length > 0)
                chatTypingTimerRef.current = setTimeout(() => {
                  void setChatTyping(db, firebaseUser.uid, activeChat, false)
                }, 4000)
              },
              onSubmitForm: (e) => {
                e.preventDefault()
                if (!activeChat) return
                if (pendingChatPhoto) {
                  void sendChatPhoto(activeChat)
                  return
                }
                if (pendingVoice) {
                  sendVoiceNote(activeChat, false)
                  return
                }
                if (chatInputValue.trim()) sendMessage(chatInputValue)
                setChatInputValue('')
              },
              onStartVoiceRecording: startVoiceRecording,
              onStopVoiceRecording: stopVoiceRecording,
              onCancelVoiceRecording: cancelVoiceRecording,
            }}
          />
        )}
          </RedTab>
          </EmV2TabShell>
        )}

        {/* ===== PROFILE - Premium Pre-Alpha experience (self-contained to prevent black screens) */}
        {activeTab === 'profile' && currentUser && (
          <EmV2TabShell>
          <TabErrorBoundary tabName="Perfil">
          <Suspense fallback={TAB_LOADING}>
          <LazyProfileTab
            currentUser={currentUser}
            showDailyPulseBanner={showDailyPulseBanner}
            dailyPulse={dailyPulse}
            triggerHaptic={triggerHaptic}
            setShowDailyPulseBanner={setShowDailyPulseBanner}
            isDemoMode={isDemoMode}
            isSyncingProfile={isSyncingProfile}
            setIsSyncingProfile={setIsSyncingProfile}
            loadRealProfiles={loadRealProfiles}
            loadRealSessions={loadRealSessions}
            loadMyFeedbacks={loadMyFeedbacks}
            firebaseUser={firebaseUser}
            getUserProfile={getUserProfile}
            saveUser={saveUser}
            setLastSync={setLastSync}
            lastSync={lastSync}
            handleLogout={handleLogout}
            openProfileEditor={openProfileEditor}
            profileSection={profileSection}
            setProfileSection={setProfileSection}
            networkStats={networkStats}
            syncBonds={syncBonds}
            setMapForceTick={setMapForceTick}
            saveUserWithRealSync={saveUserWithRealSync}
            onGymSoundSave={handleGymSoundProfileSave}
            setActiveTab={setActiveTab}
            openCommunityMuro={openCommunityMuro}
            setShowLiveModal={setShowLiveModal}
            matches={matches}
            squads={squads}
            liveCountForUI={liveCountForUI}
            liveTrainingNow={liveTrainingNow}
            profilePosts={profilePosts}
            effectiveUserId={effectiveUserId}
            getUnlockedGadgets={getUnlockedGadgets}
            getTodayStr={getTodayStr}
            setDailyPulse={setDailyPulse}
            debugLogsRef={debugLogsRef}
            SEED_PROFILES={SEED_PROFILES}
            realProfiles={realProfiles}
            startSyncWith={startSyncWith}
            tryAutoStartSync={tryAutoStartSync}
            setShowFullProfile={setShowFullProfile}
            refreshDailyPulse={refreshDailyPulse}
            completeDailyChallenge={completeDailyChallenge}
            getNextGadget={getNextGadget}
            muroComposerRef={muroComposerRef}
            muroPhotoInputRef={muroPhotoInputRef}
            loadingPersonalMuro={loadingPersonalMuro}
            setLoadingPersonalMuro={setLoadingPersonalMuro}
            loadProfilePosts={loadProfilePosts}
            processIncomingLiveJoins={processIncomingLiveJoins}
            muroComposerText={muroComposerText}
            setMuroComposerText={setMuroComposerText}
            muroComposerPhoto={muroComposerPhoto}
            setMuroComposerPhoto={setMuroComposerPhoto}
            muroPhotoUploading={muroPhotoUploading}
            muroPhotoUploadProgress={muroPhotoUploadProgress}
            muroPublishing={muroPublishing}
            setMuroPublishing={setMuroPublishing}
            createProfilePost={createProfilePost}
            handleMuroPhotoFile={handleMuroPhotoFile}
            deleteProfilePost={deleteProfilePost}
            togglePinPost={togglePinPost}
            likeProfilePost={likeProfilePost}
            boostReaction={boostReaction}
            feedReactions={feedReactions}
            activeComment={activeComment}
            commentDraft={commentDraft}
            setCommentDraft={setCommentDraft}
            openFullComments={openFullComments}
            submitComment={submitComment}
            cancelComment={cancelComment}
            deleteCommentFromPost={deleteCommentFromPost}
            editingPost={editingPost}
            editDraft={editDraft}
            setEditDraft={setEditDraft}
            startEditPost={startEditPost}
            saveEditPost={saveEditPost}
            cancelEditPost={cancelEditPost}
            recentlyPublishedPostId={recentlyPublishedPostId}
            setFeedPhotoModal={setFeedPhotoModal}
            getRelativeTime={getRelativeTime}
            isEditingBio={isEditingBio}
            setIsEditingBio={setIsEditingBio}
            testIntegrityNonce={testIntegrityNonce}
            setTestIntegrityNonce={setTestIntegrityNonce}
            checkPlayIntegrity={checkPlayIntegrity}
            integrityChecking={integrityChecking}
            lastIntegrity={lastIntegrity}
            toggleLiveTraining={toggleLiveTraining}
            isTogglingLive={isTogglingLive}
            syncPartnerId={syncPartnerId}
            showSyncArena={showSyncArena}
            setShowSyncArena={setShowSyncArena}
            syncVibe={syncVibe}
            syncStartedAt={syncStartedAt}
            setShowLegal={setShowLegal}
            setShowVerificationFlow={setShowVerificationFlow}
            setVerificationStep={setVerificationStep}
            feedbackType={feedbackType}
            setFeedbackType={setFeedbackType}
            feedbackRating={feedbackRating}
            setFeedbackRating={setFeedbackRating}
            feedbackText={feedbackText}
            setFeedbackText={setFeedbackText}
            myFeedbacks={myFeedbacks}
            loadingMyFeedbacks={loadingMyFeedbacks}
            db={db}
            storage={storage}
            requestWebNotificationPermission={requestWebNotificationPermission}
            requestNativePushPermission={requestNativePushPermission}
            PushNotifications={PushNotifications}
            CapacitorCamera={CapacitorCamera}
            notifPrefs={notifPrefs}
            setNotifPrefs={setNotifPrefs}
            setShowPwaInstall={setShowPwaInstall}
            reorderGallery={reorderGallery}
            deleteExtraPhoto={deleteExtraPhoto}
            uploadProfilePhotoIfNeeded={uploadProfilePhotoIfNeeded}
            onOpenMarketplace={
              isMarketplaceUiEnabled()
                ? () => {
                    setMarketplaceScreenMode('shop')
                    setShowMarketplace(true)
                  }
                : undefined
            }
            onOpenTrainerCoach={() => {
              setTrainerCoachPreselect(null)
              setShowTrainerCoach(true)
            }}
            isMarketplaceAdmin={isMarketplaceAdmin}
            onOpenAdminOps={() => setShowAdminOps(true)}
            appAdminRecord={appAdminRecord}
            onOpenCommunityAdmin={() => setShowCommunityAdmin(true)}
            partnerGymStats={partnerGymStats}
            partnerGymLoading={partnerGymLoading}
            constanciaBalance={constanciaBalance}
            onConstanciaProtect={handleConstanciaProtect}
            onConstanciaInsurance={handleConstanciaInsurance}
            onImportHealthBurn={handleImportHealthBurn}
            entrenoRecentWorkouts={entrenoRecentWorkouts}
            entrenoRecentLoading={entrenoRecentLoading}
            onOpenEntrenoDeHoy={() => void openEntrenoDeHoy()}
            onCopyEntrenoWorkout={handleCopyEntrenoWorkout}
            onDeleteEntrenoWorkout={(w) => void handleDeleteEntrenoWorkout(w)}
          />
          </Suspense>
          </TabErrorBoundary>
          </EmV2TabShell>
        )}
            {/* DUPLICATE ORPHAN PROFILE JSX REMOVED â€” all rich Profile UI now lives cleanly inside the activeTab==='profile' conditional (prevents black screens, duplicate renders, and JSX imbalance) */}

      </div>

      {/* Spectacular full comments modal for muro - rich thread view with live updates */}
      <AnimatePresence>
        {viewingPostComments && (() => {
          const hit = findPostInProfilePosts(viewingPostComments.postId, viewingPostComments.postUserId)
          const livePost = hit
            ? hit.posts[hit.idx]
            : ({ id: viewingPostComments.postId, text: '', comments: [], likes: [] } as ProfilePost)
          const comments = (livePost.comments || []).slice().sort((a: any, b: any) => a.timestamp - b.timestamp)
          return (
            <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80" onClick={closeFullComments}>
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.05, duration: 0.25 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-[420px] bg-[#1C1C20] rounded-t-3xl border border-[#2F2F35] shadow-2xl overflow-hidden"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2F2F35] bg-[#161618]">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-sm font-semibold">Comentarios en el muro</div>
                      <div className="text-[10px] text-[#9CA3AF] truncate max-w-[260px]">{viewingPostComments.ownerName ? `de ${viewingPostComments.ownerName}` : ''}</div>
                    </div>
                    {/* Like the post from comments modal - spectacular interaction */}
                    <button 
                      onClick={() => likeProfilePost(viewingPostComments.postId, viewingPostComments.postUserId)}
                      className="text-sm flex items-center gap-1 text-[#9CA3AF] active:text-[#FF671F] px-2 py-0.5 rounded hover:bg-[#FF671F]/10"
                    >
                      â¤ï¸ <span className="text-xs">{(livePost.likes || []).length}</span>
                    </button>
                  </div>
                  <button onClick={closeFullComments} className="text-xl px-2 text-[#9CA3AF] active:text-white">Ã—</button>
                </div>

                {/* Scrollable thread */}
                <div className="max-h-[52vh] overflow-y-auto p-4 space-y-3 text-sm bg-[#161618]">
                  {livePost.text && (
                    <div className="text-xs text-[#9CA3AF] mb-2 italic border-l-2 border-[#FF671F]/40 pl-2">
                      {livePost.pinned && 'ðŸ“Œ '}"{livePost.text.length > 120 ? livePost.text.slice(0,120) + '...' : livePost.text}"
                    </div>
                  )}
                  {comments.length > 0 ? (
                    comments.map((c: any) => (
                      <div key={c.id} className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#2F2F35] flex-shrink-0 text-[10px] flex items-center justify-center mt-0.5">ðŸ‘¤</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-medium text-white/90 text-sm">{c.userName}</span>
                            <span className="text-[10px] text-[#9CA3AF]">{getRelativeTime(c.timestamp)}</span>
                            {c.userId === effectiveUserId && (
                              <button 
                                onClick={() => deleteCommentFromPost(viewingPostComments.postId, viewingPostComments.postUserId, c.id)}
                                className="ml-auto text-red-400 text-[10px] active:text-red-500"
                                title="Eliminar comentario"
                              >
                                Ã—
                              </button>
                            )}
                          </div>
                          <div className="text-[#E5E7EB] leading-snug break-words">{c.text}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-[#9CA3AF] py-4">SÃ© el primero en comentar este post.</div>
                  )}
                </div>

                {/* Composer at bottom of modal */}
                <div className="p-3 border-t border-[#2F2F35] bg-[#1C1C20] flex items-center gap-2">
                  <input 
                    type="text" 
                    value={modalCommentDraft} 
                    onChange={e => setModalCommentDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitModalComment() } }}
                    placeholder={viewingPostComments.ownerName ? `Comentar en el muro de ${viewingPostComments.ownerName}...` : 'Escribe un comentario...'}
                    className="flex-1 form-input text-sm py-2"
                    maxLength={200}
                  />
                  <button 
                    type="button"
                    onClick={submitModalComment} 
                    disabled={!modalCommentDraft.trim() || commentSubmittingRef.current} 
                    className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
                <div className="h-[env(safe-area-inset-bottom)]" />
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>

      {/* Floating GuÃ­a and Reportar removed per request (clutter at bottom, interferes with profile selection in Explore). 
         Report/feedback still available in Profile tab (structured form + history), chat headers, and legal links.
         Welcome guide modal can still be triggered if needed via other means or first-load. */}

      {/* Bottom Navigation - Premium, energetic feel (polished aesthetics) */}
      {isMarketplaceUiEnabled() && (
        <MarketplaceViewMount
          open={showMarketplace}
          onClose={() => {
            setShowMarketplace(false)
            setMarketplaceScreenMode('shop')
          }}
          screenMode={marketplaceScreenMode}
          products={marketplaceProducts}
          isAdmin={isMarketplaceAdmin}
          isDemoMode={isDemoMode}
          userUid={firebaseUser?.uid}
          userEmail={firebaseUser?.email ?? undefined}
          myOrders={myMarketplaceOrders}
          db={db}
        />
      )}
      <CommunityAdminPanelMount
        open={showCommunityAdmin}
        onClose={() => setShowCommunityAdmin(false)}
        db={db}
        admin={appAdminRecord}
        realProfiles={realProfiles}
      />
      <AdminOpsPanelMount
        open={showAdminOps}
        onClose={() => setShowAdminOps(false)}
        db={db}
        orders={adminOrders}
        bookings={adminBookings}
        trainers={trainerProfiles}
        realProfiles={realProfiles}
        mpHealth={mpHealth}
        liveNowTotal={liveCountForUI}
      />
      <SyncLiveBlockerModal
        open={showSyncLiveBlocker}
        partnerName={syncBlockerPartnerName}
        onClose={() => setShowSyncLiveBlocker(false)}
        onActivateLive={() => void toggleLiveTraining('on')}
        onGoHome={() => navigateTab('home')}
      />
      <CityChallengeCelebrationModal
        open={showCityCelebration}
        cityLabel={homeCityChallengeMerged?.cityLabel || currentUser?.city || 'Tu ciudad'}
        targetMinutes={homeCityChallengeMerged?.targetMinutes || 500}
        gender={currentUser?.gender}
        onClose={() => setShowCityCelebration(false)}
      />
      <SafetyActionSheetMount
        target={safetySheetTarget}
        onClose={() => setSafetySheetTarget(null)}
        onReport={(userId) => openReport(userId, '1v1_chat')}
        onBlock={(userId) => void blockUser(userId).then(() => setActiveChat(null))}
      />
      <ActivationGuideMount
        open={showActivationGuide}
        isLive={!!currentUser?.trainingNow}
        isDemoMode={isDemoMode}
        hasTeam={homeTeamMembers.length > 0}
        hasPact={homeWeeklyPactProgress.pledged}
        cityLabel={currentUser?.city}
        effectiveUserId={effectiveUserId}
        db={db}
        firebaseUid={firebaseUser?.uid}
        onClose={() => setShowActivationGuide(false)}
        onMarkFeatureTourSeen={markAppFeatureTourSeen}
        onDismissDemo={() => demoStorage.set(DEMO_KEYS.ACTIVATION_GUIDE_DISMISSED, true)}
        onFirstStepsDismissed={() =>
          setFirstStepsProgress((prev) =>
            prev ? { ...prev, dismissed: true, updatedAt: Date.now() } : prev
          )
        }
        onNavigateTab={(tab) => {
          if (tab === 'map') navigateTab('map')
          else setActiveTab(tab)
        }}
        onToggleLive={toggleLiveTraining}
        onOpenPactWizard={() => setShowPactWizard(true)}
      />
      <TrainerCoachViewMount
        open={showTrainerCoach}
        onClose={() => {
          setShowTrainerCoach(false)
          setTrainerCoachPreselect(null)
          setTrainerCoachInitialTab(undefined)
        }}
        onDispatchMatched={() => setTrainerCoachInitialTab('sessions')}
        trainers={trainerProfiles}
        myTrainerProfile={myTrainerProfile}
        bookings={trainerBookings}
        userUid={firebaseUser?.uid}
        userName={currentUser?.name || firebaseUser?.email?.split('@')[0]}
        isDemoMode={isDemoMode}
        preselectedTrainerId={trainerCoachPreselect}
        initialTab={trainerCoachInitialTab}
        userLat={userLocation?.lat}
        userLng={userLocation?.lng}
        profileCoords={trainerProfileCoords}
        activeDispatch={activeTrainerDispatch}
        incomingDispatchOffer={incomingDispatchOffer}
        clientDispatchHistory={clientDispatchHistory}
        trainerDispatchHistory={trainerDispatchHistory}
        clientFuelBalance={fuelEnergyBalance}
        clientWeeklyPlan={weeklyPlan}
        userLocation={userLocation}
        db={db}
        onRequestLocation={requestUserLocation}
        onRequestReview={(trainerId, bookingId) => {
          setPendingReviewBookingId(bookingId)
          setShowTrainerCoach(false)
          setShowReviewModalFor(trainerId)
        }}
        onStartSync={startSyncWith}
      />
      <EntrenoDeHoyModalMount
        open={showEntrenaLogModal}
        onClose={() => {
          setShowEntrenaLogModal(false)
          resetEntrenaLogModalState()
        }}
        onMinimize={handleEntrenaLogMinimize}
        onDiscardSession={() => {
          if (firebaseUser?.uid) clearWorkoutDraft(firebaseUser.uid)
          setShowEntrenaLogModal(false)
          resetEntrenaLogModalState()
        }}
        onSave={handleSaveEntrenaLog}
        userId={isDemoMode ? effectiveUserId : firebaseUser?.uid ?? null}
        skipDraftRestore={entrenaLogSkipDraft}
        saving={savingWorkout}
        prefill={entrenaLogPrefill}
        expandPastWorkouts={entrenaLogExpandPastWorkouts}
        recentWorkouts={entrenoRecentWorkouts}
        gymRoutineTemplates={entrenoGymRoutines}
        currentUser={currentUser}
        shareToChatId={entrenaLogShareToChat}
        chatPartnerName={chatProfile?.name}
        matchProfiles={matchProfiles}
        onGymSoundSave={handleGymSoundProfileSave}
      />
      <FuelOverlaysMount
        showFuelSetupWizard={showFuelSetupWizard}
        showFuelSetupModal={showFuelSetupModal}
        showFuelLogModal={showFuelLogModal}
        onCloseFuelSetupWizard={() => setShowFuelSetupWizard(false)}
        onCloseFuelSetupModal={() => setShowFuelSetupModal(false)}
        onCloseFuelLogModal={() => {
          setFuelLogPrefill(null)
          setEditingFuelLog(null)
          setShowFuelLogModal(false)
        }}
        fuelLogPrefill={fuelLogPrefill}
        onOpenAdvancedFuelSetup={() => {
          setShowFuelSetupWizard(false)
          setShowFuelSetupModal(true)
        }}
        fuelProfile={fuelProfile}
        editingFuelLog={editingFuelLog}
        currentUser={currentUser}
        homeWeekTrainedCount={homeWeekTrainedCount}
        onSaveFuelProfile={handleSaveFuelProfile}
        onSaveFuelLog={handleSaveFuelLog}
        onAnalyzeFood={handleAnalyzeFood}
        savingFuel={savingFuel}
      />
      <WeeklyPactSetupSheet
        open={showPactWizard}
        partnerName={
          homeTeamMembers.find((m) => m.isBond)?.name || homeTeamMembers[0]?.name
        }
        onClose={() => setShowPactWizard(false)}
        onPledge={handleWeeklyPactPledge}
      />
      {workoutSessionDraft &&
        !(activeTab === 'red' && redSubTab === 'messages' && !!activeChat) && (
        <WorkoutSessionFab
          draft={workoutSessionDraft}
          recentWorkouts={entrenoRecentWorkouts}
          onResume={() => void openEntrenoDeHoy()}
          onQuickAddSet={handleWorkoutQuickAddSet}
          onOpenChat={handleWorkoutOpenChat}
          onOpenFuel={handleWorkoutOpenFuel}
          chatUnreadCount={totalChatUnreads}
          onToggleLive={() => toggleLiveTraining()}
          isLive={!!currentUser?.trainingNow}
          isTogglingLive={isTogglingLive}
          bottomClass={
            activeTab === 'map'
              ? 'bottom-[calc(7.5rem+env(safe-area-inset-bottom))]'
              : undefined
          }
          hidden={
            !currentUser ||
            showSyncArena ||
            showOnboarding ||
            authBooting ||
            showEntrenaLogModal
          }
        />
      )}
      <LiveToggleFab
        isLive={!!currentUser?.trainingNow}
        isTogglingLive={isTogglingLive}
        liveCount={liveCountForUI}
        onToggle={() => toggleLiveTraining()}
        bottomClass={
          activeTab === 'map'
            ? 'bottom-[calc(7.5rem+env(safe-area-inset-bottom))]'
            : undefined
        }
        hidden={
          !currentUser ||
          showSyncArena ||
          showOnboarding ||
          !!workoutSessionDraft ||
          (activeTab === 'red' && redSubTab === 'messages' && !!activeChat)
        }
      />
      <FeatureTourMount
        open={showFeatureTour}
        onClose={() => setShowFeatureTour(false)}
        onGoToTab={(tab) => navigateTab(tab as typeof activeTab)}
      />
      <PerfOverlay />
      {!inFullScreenChat && (
      <BottomNav
        activeTab={activeTab}
        liveCountForUI={liveCountForUI}
        currentUserIsLive={!!currentUser?.trainingNow}
        currentUserLiveStreak={currentUser?.liveStreak}
        chatUnreads={totalChatUnreads}
        openSessionsCount={displaySessions.length}
        onNavigate={(tab) => {
          navigateTab(tab)
          setActiveChat(null)
          if (tab === 'sesiones' && !isDemoMode) loadRealSessions()
        }}
        onRedNavigate={() => {
          setRedSubTab('matches')
          navigateTab('red')
          bumpPwaEngagement()
        }}
        compactNav={isProfileProgressiveMode(currentUser)}
      />
      )}

      <ExploreFiltersSheetMount
        open={showFilters}
        filters={filters}
        deckCount={deck.length}
        liveTrainingCount={liveTrainingNow.length}
        userLocation={userLocation}
        onClose={() => setShowFilters(false)}
        onReset={resetFilters}
        onSetFilters={setFilters}
        onToggleTraining={toggleFilterTraining}
        onToggleAvailability={toggleFilterAvailability}
        onRequestLocation={requestUserLocation}
      />

      {/* CREATE SQUAD MODAL */}
      <AnimatePresence>
        {showCreateSquad && (
          <div className="em-v2-form-sheet__overlay absolute inset-0 z-[95] flex items-end" onClick={() => setShowCreateSquad(false)}>
            <div onClick={e => e.stopPropagation()} className="em-v2-form-sheet w-full p-6 pb-8">
              <div className="em-v2-form-sheet__title mb-1">Crear un Squad</div>
              <form onSubmit={async (e) => {
                e.preventDefault()
                const form = e.currentTarget
                const name = (form.elements.namedItem('name') as HTMLInputElement).value
                const focus = (form.elements.namedItem('focus') as HTMLInputElement).value

                if (!isDemoMode && firebaseUser?.uid && db) {
                  try {
                    await createSquadInFirestore(db, firebaseUser.uid, name, focus)
                    setShowCreateSquad(false)
                    toast.success('Squad creado')
                  } catch (err) {
                    console.warn('Could not create squad in Firestore', err)
                    toast.error('No se pudo crear el Squad')
                  }
                  return
                }

                const newSquad: Squad = {
                  id: 'sq' + Date.now(),
                  name,
                  focus,
                  members: ['me'],
                  createdBy: 'me',
                  createdAt: Date.now()
                }
                saveSquads([newSquad, ...squads])
                setShowCreateSquad(false)
                toast.success('Squad creado')
              }}>
                <input name="name" placeholder="Nombre del Squad (ej: Beasts de ViÃ±a)" required className="form-input w-full mb-3" defaultValue={squadNameDraft} key={squadNameDraft} />
                <input name="focus" placeholder="Enfoque (Pesas, Running, Calistenia...)" required className="form-input w-full mb-4" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowCreateSquad(false)} className="em-v2-cta-secondary flex-1">Cancelar</button>
                  <button type="submit" className="em-v2-hero-card__cta flex-1">Crear Squad</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* SQUAD DETAIL MODAL + CHAT */}
      <AnimatePresence>
        {selectedSquad && (
          <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col" onClick={() => setSelectedSquad(null)}>
            <div onClick={e => e.stopPropagation()} className="flex-1 flex flex-col max-w-[420px] mx-auto w-full bg-[#0D0D10] mt-[42px] rounded-t-3xl overflow-hidden border border-[#2F2F35]">
              {(() => {
                const squad = squads.find(s => s.id === selectedSquad)
                if (!squad) return null
                const isMember = squad.members.includes(effectiveUserId)

                return (
                  <>
                    <div className="p-4 border-b border-[#2F2F35] flex justify-between items-center bg-[#1C1C20]">
                      <div>
                        <div className="font-bold text-xl">{squad.name}</div>
                        <div className="text-[#FF671F] text-sm">{squad.focus} â€¢ {squad.members.length}/4 miembros</div>
                      </div>
                      <button onClick={() => setSelectedSquad(null)} className="text-2xl text-[#9CA3AF]">Ã—</button>
                    </div>

                    <div className="p-4">
                      <div className="text-sm text-[#9CA3AF] mb-2">Miembros</div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {squad.members.map(mid => {
                          const memberProfile = SEED_PROFILES.find(p => p.id === mid) || realProfiles.find(p => p.id === mid)
                          const displayName = resolveMemberName(mid)

                          return (
                            <div 
                              key={mid} 
                              className="chip text-xs cursor-pointer active:bg-[#FF671F] active:text-black"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (memberProfile) {
                                  setSelectedSquad(null)
                                  setShowFullProfile(memberProfile)
                                } else if (mid === effectiveUserId || mid === 'me') {
                                  setSelectedSquad(null)
                                }
                              }}
                            >
                              {displayName}
                            </div>
                          )
                        })}
                        {squad.members.length < 4 && isMember && (
                          <div className="text-xs text-[#9CA3AF] px-3 py-1">Espacio disponible</div>
                        )}
                      </div>

                      {!isMember && squad.members.length < 4 && (
                        <button 
                          onClick={() => handleJoinSquad(squad.id)}
                          className="btn-primary w-full mb-4"
                        >
                          Unirme a este Squad
                        </button>
                      )}

                      {isMember && (
                        <>
                          <div className="em-v2-card mb-4">
                            <div className="text-sm font-bold text-white mb-2">Rutina semanal del squad</div>
                            <p className="text-[10px] text-[#9CA3AF] mb-3 leading-snug">
                              Plan compartido para entrenar juntos â€” visible para todos los miembros.
                            </p>
                            <input
                              type="text"
                              value={squadRoutineDraft.label}
                              onChange={(e) =>
                                setSquadRoutineDraft((d) => ({ ...d, label: e.target.value }))
                              }
                              placeholder="Ej. Push + core"
                              className="w-full mb-2 px-3 py-2 rounded-xl bg-[#1C1C20] border border-[#2F2F35] text-sm text-white placeholder:text-[#6B7280]"
                            />
                            <input
                              type="text"
                              value={squadRoutineDraft.schedule}
                              onChange={(e) =>
                                setSquadRoutineDraft((d) => ({ ...d, schedule: e.target.value }))
                              }
                              placeholder="DÃ­as: Lun, MiÃ©, Vie Â· 19:00"
                              className="w-full mb-2 px-3 py-2 rounded-xl bg-[#1C1C20] border border-[#2F2F35] text-sm text-white placeholder:text-[#6B7280]"
                            />
                            <textarea
                              value={squadRoutineDraft.notes}
                              onChange={(e) =>
                                setSquadRoutineDraft((d) => ({ ...d, notes: e.target.value }))
                              }
                              placeholder="Notas opcionales (ejercicios clave, progresiÃ³nâ€¦)"
                              rows={2}
                              className="w-full mb-2 px-3 py-2 rounded-xl bg-[#1C1C20] border border-[#2F2F35] text-sm text-white placeholder:text-[#6B7280] resize-none"
                            />
                            <button
                              type="button"
                              disabled={savingSquadRoutine}
                              onClick={() => handleSaveSquadRoutine(squad.id)}
                              className="w-full py-2 rounded-xl bg-[#FF671F]/15 border border-[#FF671F]/35 text-[#FF671F] text-sm font-bold active:bg-[#FF671F]/25 disabled:opacity-60"
                            >
                              {savingSquadRoutine ? 'Guardandoâ€¦' : 'Guardar rutina'}
                            </button>
                            {squad.weeklyRoutine?.label && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const label = squad.weeklyRoutine!.label
                                  const sched = squad.weeklyRoutine!.schedule
                                  sendSessionMessage(
                                    squad.id,
                                    `ðŸ‹ï¸ Rutina del squad: ${label}${sched ? ` (${sched})` : ''} â€” Â¡voy en live!`
                                  )
                                  if (!currentUser?.trainingNow) {
                                    await toggleLiveTraining('on')
                                  }
                                  toast.success('Rutina activada', {
                                    description: 'Live encendido y aviso enviado al squad',
                                  })
                                }}
                                className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black text-sm font-extrabold active:scale-[0.985]"
                              >
                                ðŸŸ¢ Entrenar rutina ahora
                              </button>
                            )}
                          </div>

                          <button 
                            onClick={() => {
                              // Pre-create a session linked to this squad
                              const newSession: TrainingSession = {
                                id: 's' + Date.now(),
                                creatorId: effectiveUserId,
                                creatorName: currentUser?.name || 'TÃº',
                                title: `SesiÃ³n del Squad: ${squad.name}`,
                                time: 'MaÃ±ana 19:00',
                                location: squad.focus === 'Running' ? 'Playa ReÃ±aca' : 'Gym cercano',
                                trainingType: squad.focus,
                                maxParticipants: Math.min(6, squad.members.length + 2),
                                participants: [...squad.members.filter(m => m !== effectiveUserId && m !== 'me'), effectiveUserId],
                                createdAt: Date.now()
                              }
                              const updatedSessions = [newSession, ...sessions]
                              saveSessions(updatedSessions)
                              setSelectedSquad(null)
                              setActiveTab('sesiones')

                              if (!isDemoMode && firebaseUser?.uid && db) {
                                (async () => {
                                  try {
                                    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
                                    await setDoc(doc(db, 'sessions', newSession.id), sanitizeForFirestore({
                                      ...newSession,
                                      updatedAt: serverTimestamp(),
                                    }), { merge: true })
                                  } catch (e) {}
                                })()
                              }

                              if (!isDemoMode) {
                                loadRealSessions()
                              }
                              toast.success('SesiÃ³n creada para el Squad', { description: 'Ve a la pestaÃ±a Sesiones' })
                            }}
                            className="w-full mb-3 text-sm border border-[#FF671F] text-[#FF671F] py-2 rounded-2xl"
                          >
                            Crear SesiÃ³n del Squad
                          </button>

                          {squad.createdBy !== effectiveUserId && squad.createdBy !== 'me' && (
                            <button 
                              onClick={() => handleLeaveSquad(squad.id)}
                              className="w-full text-sm text-red-400 py-2"
                            >
                              Dejar el Squad
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {isMember && (
                      <div className="flex-1 flex flex-col border-t border-[#2F2F35]">
                        <div className="p-3 text-sm font-medium text-[#FF671F] border-b border-[#2F2F35]">Chat del Squad</div>
                        <div className="flex-1 overflow-auto p-4 space-y-2 text-sm" id="squad-chat-scroll">
                          {(sessionMessages[squad.id] || []).length === 0 ? (
                            <div className="text-[#9CA3AF] text-center text-xs mt-6">AÃºn no hay mensajes. Â¡Empieza la coordinaciÃ³n!</div>
                          ) : (
                            (sessionMessages[squad.id] || []).map((msg, i) => (
                              <div key={i} className={`flex ${msg.senderId === effectiveUserId || msg.senderId === 'me' ? 'justify-end' : ''}`}>
                                <div className={`max-w-[75%] px-3 py-1.5 rounded-2xl break-words overflow-hidden ${msg.senderId === effectiveUserId || msg.senderId === 'me' ? 'bg-[#FF671F] text-black' : 'bg-[#25252A]'}`}>
                                  <div className="text-[10px] opacity-70">{msg.senderName}</div>
                                  {renderMessageText(msg.text)}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="p-3 border-t border-[#2F2F35]">
                          <form onSubmit={(e) => {
                            e.preventDefault()
                            const input = (e.currentTarget.elements[0] as HTMLInputElement)
                            if (input.value.trim()) {
                              sendSessionMessage(squad.id, input.value)
                              input.value = ''
                            }
                          }} className="flex gap-2">
                            <input type="text" placeholder="Mensaje al squad..." className="flex-1 bg-[#1C1C20] border border-[#2F2F35] rounded-3xl px-4 py-2 text-sm" />
                            <button type="submit" className="bg-[#FF671F] text-black px-4 rounded-3xl text-sm">Enviar</button>
                          </form>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE SESSION MODAL - Unique feature */}
      <AnimatePresence>
        {showCreateSession && (
          <div className="em-v2-form-sheet__overlay absolute inset-0 z-[95] flex items-end" onClick={closeCreateSession}>
            <div onClick={e => e.stopPropagation()} className="em-v2-form-sheet w-full p-6 pb-8">
              <div className="em-v2-form-sheet__title mb-4">Crear sesiÃ³n de entrenamiento</div>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                // trainingType is now from a hidden input we control with chips, or fallback to select if needed
                const newSession: TrainingSession = {
                  id: 's' + Date.now(),
                  creatorId: effectiveUserId,
                  creatorName: currentUser?.name || 'TÃº',
                  title: (form.elements.namedItem('title') as HTMLInputElement).value,
                  time: (form.elements.namedItem('time') as HTMLInputElement).value,
                  location: (form.elements.namedItem('location') as HTMLInputElement).value,
                  trainingType: selectedTrainingType,
                  maxParticipants: parseInt((form.elements.namedItem('max') as HTMLInputElement).value),
                  participants: [effectiveUserId],
                  createdAt: Date.now()
                }
                const updated = [newSession, ...sessions]
                saveSessions(updated)
                closeCreateSession()

                // Write directly to Firestore for real users (more reliable cross-device)
                if (!isDemoMode && firebaseUser?.uid && db) {
                  (async () => {
                    try {
                      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
                      await setDoc(doc(db, 'sessions', newSession.id), sanitizeForFirestore({
                        ...newSession,
                        updatedAt: serverTimestamp(),
                      }), { merge: true })
                      console.log('âœ… New session written directly to Firestore')

                      // Also write the creator welcome message to the messages subcollection so joiners see it on server
                      try {
                        const { collection, addDoc, serverTimestamp: ts } = await import('firebase/firestore')
                        await addDoc(collection(db, `sessions/${newSession.id}/messages`), {
                          senderId: effectiveUserId,
                          senderName: currentUser?.name || 'TÃº',
                          text: `Â¡Hola! CreÃ© esta sesiÃ³n para ${newSession.trainingType.toLowerCase()}. Â¿QuiÃ©n se anima?`,
                          timestamp: Date.now(),
                          createdAt: ts(),
                        })
                        console.log('âœ… Creator welcome message written to session subcollection')
                      } catch (e) {
                        console.warn('Could not seed welcome message to subcollection:', e)
                      }
                    } catch (e) {
                      console.warn('Direct session write failed:', e)
                    }
                  })()
                }

                // Refresh for immediate local view
                if (!isDemoMode) {
                  loadRealSessions()
                }

                // Seed initial message from creator
                const creatorMsg: SessionMessage = {
                  id: 'sm_create',
                  senderId: 'me',
                  senderName: currentUser?.name || 'TÃº',
                  text: `Â¡Hola! CreÃ© esta sesiÃ³n para ${newSession.trainingType.toLowerCase()}. Â¿QuiÃ©n se anima?`,
                  timestamp: Date.now()
                }
                const withInitial = {
                  ...sessionMessages,
                  [newSession.id]: [creatorMsg]
                }
                saveSessionMessages(withInitial)

                toast.success('SesiÃ³n creada', { description: 'Ya puedes chatear con quienes se unan' })
              }}>
                <div className="space-y-4">
                  <input name="title" placeholder="TÃ­tulo (ej: Running costanera + mate)" required className="form-input w-full" />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input name="time" placeholder="Horario (19:00)" required className="form-input" />
                    <input name="location" placeholder="Lugar (ReÃ±aca)" required className="form-input" />
                  </div>

                  <div>
                    <div className="text-xs text-[#9CA3AF] mb-1.5">Tipo de entrenamiento</div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {TRAINING_OPTIONS.map(t => (
                        <button 
                          type="button"
                          key={t}
                          onClick={() => setSelectedTrainingType(t)}
                          className={`px-3 py-1 text-xs rounded-2xl border active:bg-[#25252A] ${selectedTrainingType === t ? 'border-[#FF671F] bg-[#FF671F]/10 text-[#FF671F]' : 'border-[#2F2F35] bg-[#1C1C20] hover:border-[#3a3f48]'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <input type="hidden" name="trainingType" value={selectedTrainingType} />
                  </div>

                  <div>
                    <div className="text-xs text-[#9CA3AF] mb-1">MÃ¡ximo participantes</div>
                    <input name="max" type="number" min="2" max="12" defaultValue="5" required className="form-input w-full" />
                  </div>
                </div>

                <div className="mt-2 mb-3 text-[10px] text-[#FF671F] text-center">Otros testers reales la verÃ¡n y podrÃ¡n unirse al instante</div>
                <div className="text-[10px] text-center text-[#9CA3AF] mb-2">
                  Al publicar aceptas nuestros <a href="/entrenamatch/terms.html" target="_blank" className="underline">TÃ©rminos</a>.
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={closeCreateSession} className="em-v2-cta-secondary flex-1">Cancelar</button>
                  <button type="submit" className="em-v2-hero-card__cta flex-1">Publicar sesiÃ³n</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      <TrainingReviewModalMount
        open={!!showReviewModalFor}
        partnerName={SEED_PROFILES.find((p) => p.id === showReviewModalFor)?.name || 'tu partner'}
        rating={reviewRating}
        comment={reviewComment}
        photo={reviewPhoto}
        onRatingChange={setReviewRating}
        onCommentChange={setReviewComment}
        onPhotoChange={setReviewPhoto}
        onClose={() => {
          setShowReviewModalFor(null)
          setReviewPhoto(null)
          setPendingReviewBookingId(null)
        }}
        onSubmit={() => {
          if (showReviewModalFor) void submitTrainingReview(showReviewModalFor)
        }}
      />

      <MatchCelebrationMount
        profile={showMatchModal}
        currentUser={currentUser}
        userLocation={userLocation}
        chatOpeners={CHAT_OPENERS}
        onClose={(openChat) => closeMatchModal(openChat)}
      />

      <FullProfileSheetMount
        profile={showFullProfile}
        realProfiles={realProfiles as Profile[]}
        userLocation={userLocation}
        currentUser={currentUser}
        effectiveUserId={effectiveUserId}
        profilePosts={profilePosts}
        profileViewWorkouts={profileViewWorkouts}
        syncBonds={syncBonds}
        reviews={reviews}
        trainerProfiles={trainerProfiles}
        squads={squads}
        matches={matches}
        realMatches={realMatches}
        feedReactions={feedReactions}
        activeComment={activeComment}
        commentDraft={commentDraft}
        getRelativeTime={getRelativeTime}
        onClose={() => setShowFullProfile(null)}
        onLoadPosts={(profileId) => loadProfilePosts(profileId)}
        onOpenHomeFeed={() => openCommunityMuro()}
        onTrainTogether={(p) => {
          setShowFullProfile(null)
          if (currentUser?.trainingNow && isUserLive(p.id)) {
            startSyncWith(p.id, p.name)
          } else {
            handleSwipe(p.id, 'right')
          }
        }}
        onOpenChat={(profileId) => {
          setShowFullProfile(null)
          openChat(profileId)
        }}
        onSwipeLeft={(profileId) => {
          setShowFullProfile(null)
          handleSwipe(profileId, 'left')
        }}
        onSwipeRight={(profileId) => {
          setShowFullProfile(null)
          handleSwipe(profileId, 'right')
        }}
        onBookTrainer={(trainerUserId) => {
          setTrainerCoachPreselect(trainerUserId)
          setShowFullProfile(null)
          setShowTrainerCoach(true)
        }}
        onOpenSquad={(squadId) => {
          setSelectedSquad(squadId)
          setShowFullProfile(null)
          setActiveTab('squads')
        }}
        onReport={(profileId) => {
          openReport(profileId, 'profile')
          setShowFullProfile(null)
        }}
        onBlock={async (p) => {
          if (confirm(`Â¿Bloquear a ${p.name}? No volverÃ¡s a verlo en ningÃºn lado.`)) {
            await blockUser(p.id)
            setShowFullProfile(null)
          }
        }}
        onBoostReaction={(postId, emo, profileId) => boostReaction(postId, emo, profileId)}
        onCopyWorkout={(workoutId, title) => handleCopyWorkoutFromPost(workoutId, title)}
        onLikePost={(postId, profileId) => likeProfilePost(postId, profileId)}
        onOpenComments={(postId, profileId, ownerName) =>
          openFullComments(postId, profileId, ownerName)
        }
        onDeleteComment={(postId, profileId, commentId) =>
          deleteCommentFromPost(postId, profileId, commentId)
        }
        onCommentDraftChange={setCommentDraft}
        onSubmitComment={submitComment}
        onCancelComment={cancelComment}
      />

      <LegalPagesMount page={showLegal} onClose={() => setShowLegal(null)} />

      <ReportModalMount
        open={showReportModal}
        targetId={reportTargetId}
        reason={reportReason}
        details={reportDetails}
        context={reportContext}
        onReasonChange={setReportReason}
        onDetailsChange={setReportDetails}
        onClose={() => setShowReportModal(false)}
        onOpenCommunityRules={() => {
          setShowReportModal(false)
          setShowLegal('community')
        }}
        onSubmit={async () => {
          if (reportTargetId) {
            await reportUser(
              reportTargetId,
              reportReason || 'Otra violación de las reglas de comunidad',
              reportDetails.trim() || undefined,
              reportContext
            )
            setShowReportModal(false)
            setReportTargetId(null)
            setReportReason('')
            setReportDetails('')
          }
        }}
      />

      {currentUser && (
        <VerificationFlowMount
          open={showVerificationFlow}
          currentUser={currentUser}
          step={verificationStep}
          selfie={verificationSelfie}
          submitting={verificationSubmitting}
          capacitorCamera={CapacitorCamera}
          onClose={() => setShowVerificationFlow(false)}
          onStepChange={setVerificationStep}
          onSelfieChange={setVerificationSelfie}
          onSubmit={submitVerification}
        />
      )}

      <ModerationPanelMount
        open={showModerationPanel}
        tab={moderationTab}
        reports={reports}
        pendingVerifications={pendingVerifications}
        blockedUsers={blockedUsers}
        onClose={() => setShowModerationPanel(false)}
        onTabChange={setModerationTab}
        onReviewVerification={reviewVerification}
        onUnblockUser={unblockUser}
      />

      {/* GROUP CHAT MODAL - Full featured for sessions */}
      <AnimatePresence>
        {showGroupChatModalFor && currentUser && (
          <div className="absolute inset-0 z-[120] flex items-end md:items-center justify-center bg-black/90 p-0 md:p-6" onClick={() => setShowGroupChatModalFor(null)}>
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-[420px] bg-[#0b141a] rounded-t-2xl md:rounded-3xl overflow-hidden flex flex-col h-[92dvh] md:h-[620px] max-h-[92dvh] border border-[#2a3942] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="chat-wa-header px-3 py-2.5 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="section-header text-lg truncate pr-2 tracking-tight">
                    {sessions.find(s => s.id === showGroupChatModalFor)?.title || 'SesiÃ³n grupal'}
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-[#FF671F] font-medium">Chat grupal en vivo</span>
                    <span className="text-[#9CA3AF]">â€¢</span>
                    <span className="text-[#cbd5e1]">{(sessions.find(s => s.id === showGroupChatModalFor)?.participants || displaySessions.find(s => s.id === showGroupChatModalFor)?.participants || []).length} participantes</span>
                    {(() => {
                      const cs = displaySessions.find(s => s.id === showGroupChatModalFor) || sessions.find(s => s.id === showGroupChatModalFor)
                      const isC = cs?.creatorId === effectiveUserId || cs?.creatorId === 'me'
                      return isC ? <span className="ml-1 px-1.5 py-px bg-red-500/20 text-red-400 rounded text-[9px] font-bold">ADMIN</span> : null
                    })()}
                    {!isDemoMode && firebaseUser?.uid && (
                      <span className="ml-1 px-1.5 py-px bg-[#FF671F] text-black rounded text-[9px] font-extrabold tracking-wide">REAL</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  {!isDemoMode && firebaseUser?.uid && (
                    <button onClick={async () => { setIsLoadingChats(true); try { await loadRealGroupMessages(showGroupChatModalFor); setLastSync(new Date()); setSessionUnreads(prev => { const c = { ...prev }; if (showGroupChatModalFor) c[showGroupChatModalFor] = 0; return c }); toast.success('Chat actualizado'); } finally { setIsLoadingChats(false); } }} disabled={isLoadingChats} className="text-[9px] md:text-[10px] px-1.5 md:px-2.5 py-0.5 md:py-1 border border-[#2F2F35] rounded-xl text-[#FF671F] active:bg-[#25252A] disabled:opacity-60" title="Actualizar">
                      {isLoadingChats ? '...' : <RefreshCw size={14} />}
                    </button>
                  )}
                  {(() => {
                    const cs = displaySessions.find(s => s.id === showGroupChatModalFor) || sessions.find(s => s.id === showGroupChatModalFor)
                    const isC = cs?.creatorId === effectiveUserId || cs?.creatorId === 'me'
                    return isC && showGroupChatModalFor ? (
                      <button 
                        onClick={() => closeSession(showGroupChatModalFor)} 
                        className="text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1 bg-red-500/10 text-red-400 rounded-xl active:bg-red-500/20"
                        title="Cerrar sesiÃ³n (admin)"
                      >
                        Cerrar
                      </button>
                    ) : null
                  })()}
                  <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hidden sm:inline text-[9px] md:text-[10px] text-[#8696a0] underline">Privacidad</a>
                  <button onClick={() => {
                    if (confirm('Â¿Reportar problema en esta sesiÃ³n?')) {
                      if (showGroupChatModalFor && db) {
                        (async () => {
                          try {
                            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
                            await addDoc(collection(db, 'betaFeedback'), {
                              userId: firebaseUser?.uid || 'demo',
                              type: 'other',
                              rating: 3,
                              text: `SesiÃ³n ${showGroupChatModalFor}: Problema reportado por usuario`,
                              platform: (typeof window !== 'undefined' && (window as any).Capacitor) ? 'android' : 'web',
                              appVersion: APP_VERSION,
                              context: 'group-chat',
                              createdAt: serverTimestamp(),
                            });
                            toast.success('Reporte enviado (ver en Perfil > Feedback)');
                          } catch {}
                        })();
                      }
                    }
                  }} className="text-[10px] text-red-400 underline">Reportar</button>
                  <button onClick={() => setShowGroupChatModalFor(null)} className="text-3xl leading-none text-[#9CA3AF] hover:text-white px-1">Ã—</button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
                {/* Participants Sidebar - hidden on mobile to give full width to chat messages and input (prevents "pushed right" cramped layout on phones) */}
                <div className="hidden md:block w-28 border-r border-[#2F2F35] bg-[#1C1C20] p-2 overflow-auto text-xs">
                  <div className="text-[#9CA3AF] text-[10px] px-1 mb-1.5 font-medium">PARTICIPANTES</div>
                  {(() => {
                    const currentSess = displaySessions.find(s => s.id === showGroupChatModalFor) || sessions.find(s => s.id === showGroupChatModalFor)
                    const isThisCreator = currentSess?.creatorId === effectiveUserId || currentSess?.creatorId === 'me'
                    const parts = currentSess?.participants || (sessions.find(s => s.id === showGroupChatModalFor)?.participants || [])
                    return parts.map((pid, idx) => {
                      const isCurrent = pid === effectiveUserId
                      const seedUser = SEED_PROFILES.find(p => p.id === pid)
                      const name = isCurrent ? (currentUser?.name || 'TÃº') : (seedUser?.name || 'Participante')
                      return (
                        <button 
                          key={idx}
                          onClick={() => {
                            const mention = `@${(name||'U').split(' ')[0]} `
                            setChatInputValue(prev => prev + mention)
                          }}
                          className="block w-full text-left px-2 py-1 hover:bg-[#25252A] rounded text-[#cbd5e1] truncate flex items-center justify-between"
                        >
                          <span>{name}{isCurrent ? ' (tÃº)' : ''}</span>
                          {isThisCreator && !isCurrent && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation()
                                if (showGroupChatModalFor) expelFromSession(showGroupChatModalFor, pid)
                              }}
                              className="ml-1 text-red-400 hover:text-red-500 text-[11px] px-0.5"
                              title="Expulsar (solo tÃº como admin)"
                            >
                              âœ•
                            </span>
                          )}
                        </button>
                      )
                    })
                  })()}
                  {(() => {
                    const currentSess = displaySessions.find(s => s.id === showGroupChatModalFor) || sessions.find(s => s.id === showGroupChatModalFor)
                    const isThisCreator = currentSess?.creatorId === effectiveUserId || currentSess?.creatorId === 'me'
                    if (isThisCreator) {
                      return <div className="text-[9px] text-[#FF671F] mt-2 px-1">Eres admin â€¢ toca âœ• para expulsar</div>
                    }
                    return null
                  })()}
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Compact participants bar for mobile - polished */}
                  <div className="md:hidden px-3 py-1.5 border-b border-[#2F2F35] bg-[#1C1C20] text-[10px] flex items-center gap-1.5 overflow-x-auto text-[#9CA3AF]">
                    <span className="font-semibold text-[#FF671F] mr-1 flex-shrink-0 tracking-wide">PARTICIPANTES</span>
                    {(() => {
                      const currentSess = displaySessions.find(s => s.id === showGroupChatModalFor) || sessions.find(s => s.id === showGroupChatModalFor)
                      const parts = currentSess?.participants || []
                      return parts.slice(0, 6).map((pid, idx) => {
                        const seed = SEED_PROFILES.find(p => p.id === pid)
                        const isSelf = pid === effectiveUserId
                        const nm = isSelf ? 'TÃº' : (seed?.name?.split(' ')[0] || 'P')
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (!isSelf) {
                                const mention = `@${nm} `
                                setChatInputValue(prev => (prev.trim() ? prev.trimEnd() + ' ' : '') + mention)
                                setTimeout(() => {
                                  groupChatInputRef.current?.focus()
                                  const scrollEl = document.getElementById('group-chat-scroll')
                                  if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight
                                }, 0)
                              }
                            }}
                            className={`px-2 py-0.5 bg-[#25252A] rounded-lg text-[#cbd5e1] whitespace-nowrap active:bg-[#FF671F] active:text-black transition text-xs font-medium ${isSelf ? 'opacity-60' : 'hover:bg-[#FF671F]/10'}`}
                            disabled={isSelf}
                          >
                            {nm}
                          </button>
                        )
                      })
                    })()}
                    {(() => {
                      const currentSess = displaySessions.find(s => s.id === showGroupChatModalFor) || sessions.find(s => s.id === showGroupChatModalFor)
                      const parts = currentSess?.participants || []
                      return parts.length > 6 ? <span className="text-[#FF671F] flex-shrink-0 text-xs">+{parts.length-6}</span> : null
                    })()}
                  </div>

                  <div ref={groupChatScrollRef} className="chat-wa-thread flex-1 overflow-auto p-3 sm:p-4 space-y-1 text-sm w-full" id="group-chat-scroll">
                    {(sessionMessages[showGroupChatModalFor] || []).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-[#9CA3AF] px-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#1C1C20] flex items-center justify-center mb-4 text-3xl">ðŸ’¬</div>
                        <div className="font-medium text-white">AÃºn no hay mensajes en el grupo</div>
                        <div className="text-xs mt-1.5 max-w-[240px]">SÃ© el primero en romper el hielo. { !isDemoMode ? 'Los mensajes son reales (creador puede expulsar/administrar) y se ven en todos los dispositivos.' : 'Los mensajes se ven en todos los dispositivos del grupo.' }</div>
                        {!isDemoMode && <div className="mt-3 text-[10px] text-[#FF671F]">SincronizaciÃ³n en vivo vÃ­a Firebase</div>}
                      </div>
                    ) : (
                      (sessionMessages[showGroupChatModalFor] || []).map((msg, i) => {
                        const isMe = msg.senderId === effectiveUserId
                        const session = sessions.find(s => s.id === showGroupChatModalFor)
                        const isCreator = session?.creatorId === msg.senderId
                        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''
                        return (
                          <div key={i} className={`chat-wa-row ${isMe ? 'chat-wa-row--me' : 'chat-wa-row--them'} group`}>
                            <div className={`max-w-[85%] sm:max-w-[78%] ${isMe ? '' : ''} w-full`}>
                              {!isMe && (
                                <div className="text-[10px] text-[#8696a0] mb-0.5 px-1 flex items-center gap-1 leading-tight">
                                  {isCreator && <span className="text-[#FF671F]">â˜… </span>}
                                  <span className="font-semibold text-[#aebac1]">{msg.senderName}</span>
                                </div>
                              )}
                              <div className={`chat-wa-bubble ${isMe ? 'chat-wa-bubble--sent chat-wa-bubble--sent-last' : 'chat-wa-bubble--recv chat-wa-bubble--recv-last'}`}>
                                {msg.text ? <div className="chat-wa-text">{renderMessageText(msg.text)}</div> : null}
                                {msg.photo && (
                                  <button type="button" className="chat-wa-photo">
                                    <img src={msg.photo} alt="Foto grupal" loading="lazy" />
                                  </button>
                                )}
                                {msg.voiceUrl && !msg.voiceUrl.startsWith('blob:') ? (
                                  <div className={`voice-bubble mt-1 ${isMe ? 'sent' : 'received'}`}>
                                    <button 
                                      onClick={() => toggleVoicePlay(msg)}
                                      className={`voice-play-btn ${playingVoiceId === msg.id ? 'playing' : ''}`}
                                      title={playingVoiceId === msg.id ? "Pausar nota de voz" : "Reproducir nota de voz de tu EntrenaPartner"}
                                    >
                                      {playingVoiceId === msg.id ? <Pause size={15} /> : <Play size={15} />}
                                    </button>
                                    <div className="voice-wave-container">
                                      <div className={`voice-wave ${playingVoiceId === msg.id ? 'playing' : ''}`}>
                                        {[4,6,3,8,5,9,4,7,3,6,5,8].map((h, idx) => (
                                          <div key={idx} className="voice-bar" style={{ height: `${h * 1.6}px`, animationDelay: `${(idx % 7) * -140}ms` }} />
                                        ))}
                                      </div>
                                      {playingVoiceId === msg.id && (
                                        <div className="voice-progress" style={{ width: `${voicePlayProgress}%`, transition: 'width 80ms linear' }} />
                                      )}
                                    </div>
                                    <span className="voice-duration">ðŸŽ™ï¸ {msg.voiceDuration || '?'}s</span>
                                  </div>
                                ) : msg.voiceUrl && msg.voiceUrl.startsWith('blob:') ? (
                                  <span className="text-[10px] text-red-400">Nota de voz no disponible en esta sesiÃ³n</span>
                                ) : null}
                                {time && (
                                  <div className="chat-wa-meta">
                                    <time>{time}</time>
                                  </div>
                                )}
                              </div>

                              {/* Reactions row - align with bubble side */}
                              <div className={`flex gap-1 mt-1 text-xs ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {['ðŸ‘', 'ðŸ”¥', 'ðŸ’ª', 'ðŸ‘'].map(emoji => {
                                  const reactors = msg.reactions?.[emoji] || []
                                  const hasReacted = reactors.includes(currentUser?.name || '')
                                  return (
                                    <button key={emoji} onClick={() => {
                                      const updated = { ...sessionMessages }
                                      const msgs = updated[showGroupChatModalFor] || []
                                      const targetMsg = { ...msgs[i] }
                                      targetMsg.reactions = { ...(targetMsg.reactions || {}) }
                                      if (!targetMsg.reactions[emoji]) targetMsg.reactions[emoji] = []
                                      const safeName = currentUser?.name || 'TÃº'
                                      targetMsg.reactions[emoji] = hasReacted 
                                        ? targetMsg.reactions[emoji].filter(n => n !== safeName)
                                        : [...targetMsg.reactions[emoji], safeName]
                                      msgs[i] = targetMsg
                                      saveSessionMessages(updated)
                                    }} className={`px-1.5 py-px rounded ${hasReacted ? 'bg-[#FF671F]/30 text-[#FF671F]' : 'hover:bg-[#25252A] text-[#9CA3AF]'}`}>
                                      {emoji}{reactors.length > 0 ? ` ${reactors.length}` : ''}
                                    </button>
                                  )
                                })}
                                {/* Delete only for session creator - fixed to use effectiveUserId for cross-device. More visible on mobile touch */}
                                {(session?.creatorId === effectiveUserId || session?.creatorId === 'me') && (
                                  <button onClick={() => {
                                    const updated = { ...sessionMessages }
                                    updated[showGroupChatModalFor] = updated[showGroupChatModalFor].filter((_, idx) => idx !== i)
                                    saveSessionMessages(updated)
                                  }} className="text-[10px] text-[#ef4444] opacity-70 md:opacity-0 group-hover:opacity-100 ml-2 active:opacity-100">eliminar</button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}

                    {isTyping && (
                      <div className="flex items-center gap-2 text-[#9CA3AF] text-xs px-2 mt-1">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                        <span>Alguien estÃ¡ escribiendo...</span>
                      </div>
                    )}
                  </div>

                  {/* Input area */}
                  <div className="chat-wa-composer">
                    {groupChatPhoto && (
                      <div className="mb-2 flex items-center gap-2 bg-[#0D0D10] p-2 rounded-2xl border border-[#2F2F35]">
                        <img src={groupChatPhoto} className="w-10 h-10 object-cover rounded-xl" />
                        <div className="flex-1 text-xs text-[#9CA3AF]">Foto lista para enviar</div>
                        <button onClick={() => setGroupChatPhoto(null)} className="text-xs px-2 py-1 text-red-400 hover:text-red-500">Quitar</button>
                      </div>
                    )}
                    {pendingVoice && !isUploadingVoice && (
                      <div className="voice-preview mb-2 ring-1 ring-[#FF671F]/30">
                        <button 
                          onClick={() => { 
                            try { triggerHaptic('medium') } catch {}
                            const a = new Audio(pendingVoice.url); 
                            a.play().catch(()=>{}); 
                          }}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF671F] to-[#E55A1A] flex items-center justify-center text-black active:scale-90 shadow flex-shrink-0"
                          title="Escuchar preview antes de enviar al squad"
                        >
                          <Play size={18} />
                        </button>
                        <div className="voice-wave-container" style={{height:'18px'}}>
                          <div className="voice-wave">
                            {[5,8,4,10,6,9,5,7,4,8].map((h,i) => <div key={i} className="voice-bar" style={{height: `${h}px`, background: 'linear-gradient(#FF671F, #FDBA74)'}} />)}
                          </div>
                        </div>
                        <div className="meta">
                          <div className="title">ðŸŽ™ï¸ NOTA DE VOZ LISTA PARA TU SQUAD</div>
                          <div className="sub">{pendingVoice.duration}s â€¢ +1 Voice Streak â€¢ para tu squad</div>
                        </div>
                        <div className="actions flex-col gap-1 items-end">
                          <button 
                            onClick={() => { 
                              if (voicePreviewUrlRef.current) URL.revokeObjectURL(voicePreviewUrlRef.current); 
                              voicePreviewUrlRef.current = null; 
                              setPendingVoice(null) 
                            }} 
                            className="text-[9px] px-2 py-0.5 text-red-400 hover:text-red-500 border border-red-400/40 rounded active:bg-red-500/10 flex items-center gap-0.5" 
                            title="Descartar"
                          >
                            <X size={11}/> Cancelar
                          </button>
                          <button 
                            onClick={() => { 
                              if (voicePreviewUrlRef.current) URL.revokeObjectURL(voicePreviewUrlRef.current); 
                              voicePreviewUrlRef.current = null; 
                              setPendingVoice(null); 
                              setTimeout(() => startVoiceRecording(), 60) 
                            }} 
                            className="text-[9px] px-2 py-0.5 text-[#EAB308] hover:text-[#FCD34D] border border-[#EAB308]/40 rounded active:bg-[#EAB308]/10 flex items-center gap-0.5" 
                            title="Grabar otra"
                          >
                            <RotateCcw size={11}/> Re-grabar
                          </button>
                          <button 
                            onClick={() => {
                              if (showGroupChatModalFor && pendingVoice) {
                                sendVoiceNote(showGroupChatModalFor, true)
                              }
                            }}
                            className="text-[11px] px-5 py-1.5 bg-[#FF671F] text-black rounded-2xl font-extrabold active:bg-[#E55A1A] shadow flex items-center gap-1.5 active:scale-[0.985]"
                          >
                            ENVIAR AL SQUAD <Send size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                    {isUploadingVoice && (
                      <div className="voice-uploading mb-2">
                        <div className="label">TRANSMITIENDO AL SQUAD...</div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${voiceUploadProgress || 10}%` }} />
                        </div>
                        <div className="text-[10px] tabular-nums text-[#FF671F] font-mono w-8 text-right">{voiceUploadProgress || 0}%</div>
                        <button 
                          onClick={() => { setPendingVoice(null); setIsUploadingVoice(false); setVoiceUploadProgress(0) }}
                          className="text-[9px] px-1.5 py-0.5 text-red-400 hover:text-red-500 ml-1"
                        >
                          cancelar
                        </button>
                      </div>
                    )}

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault()
                        if ((chatInputValue.trim() || groupChatPhoto || pendingVoice) && showGroupChatModalFor) {
                          if (pendingVoice) {
                            sendVoiceNote(showGroupChatModalFor, true)
                            // sendVoiceNote handles upload, send, cleanup, toast
                          } else {
                            sendSessionMessage(showGroupChatModalFor, chatInputValue, groupChatPhoto)
                          }
                          setChatInputValue('')
                          setGroupChatPhoto(null)
                        }
                      }}
                      className="chat-wa-composer-row"
                    >
                      <input 
                        ref={groupChatInputRef}
                        type="text" 
                        value={chatInputValue}
                        onChange={(e) => setChatInputValue(e.target.value)}
                        placeholder={pendingVoice ? "Nota lista â€” ENVIAR AL SQUAD" : "Mensaje al grupo..."}
                        enterKeyHint="send"
                        className="chat-wa-input" 
                      />

                      <label className="chat-wa-composer-btn cursor-pointer text-lg">ðŸ“·
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = () => setGroupChatPhoto(reader.result as string)
                            reader.readAsDataURL(file)
                          }
                        }} />
                      </label>

                      {/* PREMIUM live recording for squad â€” clearer stop to send flow */}
                      {isRecordingVoice ? (
                        <div className="voice-recording" style={{minWidth: 168, padding: '4px 8px 4px 10px'}}>
                          <div className="dot" />
                          <div className="flex-1 min-w-0">
                            <div className="text-red-400 text-[9px] font-extrabold tracking-[0.5px]">GRABANDO NOTA DE VOZ</div>
                            <div className="flex items-baseline gap-1">
                              <span className="timer">{recordingTime}s <span className="opacity-60">/60</span></span>
                              <span className="text-[8px] text-red-400/70 font-medium">â€¢ PARAR para preview y enviar</span>
                            </div>
                          </div>
                          {/* LIVE bars synced to mic */}
                          <div className="flex gap-[1.5px] items-end h-[17px] mx-0.5 px-0.5 bg-black/30 rounded">
                            {recordingLevels.map((h, i) => (
                              <div key={i} className="w-[2.5px] bg-red-400 rounded transition-all duration-75" style={{height: `${h}px`}} />
                            ))}
                          </div>
                          <button 
                            onClick={stopVoiceRecording} 
                            className="ml-1 px-3.5 py-1 text-[10px] bg-red-600 text-white rounded-full active:bg-red-700 font-extrabold shadow active:scale-95"
                            title="Parar: luego escuchas y envÃ­as al squad"
                          >
                            PARAR
                          </button>
                          <button onClick={cancelVoiceRecording} className="ml-0.5 text-red-400/80 hover:text-red-400 px-1 text-lg leading-none" title="Cancelar grabaciÃ³n">Ã—</button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={startVoiceRecording}
                          className="chat-wa-composer-btn chat-wa-composer-btn--mic"
                          title="Grabar nota de voz para tu squad"
                        >
                          <Mic size={19} />
                        </button>
                      )}

                      <button type="submit" disabled={!chatInputValue.trim() && !groupChatPhoto && !pendingVoice} title={pendingVoice ? 'Enviar la nota de voz grabada al squad' : 'Enviar mensaje'} className="chat-wa-send disabled:opacity-40" aria-label="Enviar">
                        <Send size={18} />
                      </button>
                    </form>
                    <div className="text-center text-[9px] text-[#6B7280] mt-1.5">Los mensajes se sincronizan en tiempo real entre todos los participantes</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NotificationsPanel
        open={showNotifications}
        notifications={notifications}
        unreadNotifications={unreadNotifications}
        totalChatUnreads={totalChatUnreads}
        totalSessionUnreads={totalSessionUnreads}
        syncBonds={syncBonds}
        onClose={() => setShowNotifications(false)}
        onClearRead={clearReadNotifications}
        onMarkAllRead={markAllNotificationsRead}
        onNotificationClick={handleNotificationClick}
      />

    </div>

      {/* EntrenaSync end rating - disruptive accountability */}
      {syncDuelSummary && (
        <SyncDuelSummary
          open
          selfName={currentUser.name || 'TÃº'}
          selfPhoto={currentUser.photos?.[0]}
          selfGender={currentUser.gender}
          partnerName={syncDuelSummary.partnerName}
          partnerPhoto={syncDuelSummary.partnerPhoto}
          partnerGender={
            realProfiles.find((p) => p.id === syncDuelSummary.partnerId)?.gender ||
            SEED_PROFILES.find((p) => p.id === syncDuelSummary.partnerId)?.gender
          }
          partnerId={syncDuelSummary.partnerId}
          effectiveUserId={effectiveUserId}
          minutes={syncDuelSummary.minutes}
          elapsedSec={syncDuelSummary.elapsedSec}
          vibe={syncDuelSummary.vibe}
          witnessCount={syncDuelSummary.witnessCount}
          setsLogged={syncDuelSummary.setsLogged}
          actions={syncDuelSummary.actions}
          isNetworkBond={syncDuelSummary.isNetworkBond}
            bondLevel={syncDuelSummary.bondLevel}
            weeklyMetaComplete={syncDuelSummary.weeklyMetaComplete}
            weeklyMetaLine={syncDuelSummary.weeklyMetaLine}
            onClose={() => setSyncDuelSummary(null)}
          onResync={(partnerId) => {
            setSyncDuelSummary(null)
            tryAutoStartSync(partnerId)
          }}
          onReplay={() => {
            setReplaySession({
              partnerName: syncDuelSummary.partnerName,
              minutes: syncDuelSummary.minutes,
              vibe: syncDuelSummary.vibe,
              actions: syncDuelSummary.actions,
              rating: null,
            })
            setSyncDuelSummary(null)
          }}
          onRate={(rating, rateOpts) => {
            submitSyncRating(rating, {
              partnerId: syncDuelSummary.partnerId,
              partnerName: syncDuelSummary.partnerName,
              minutes: syncDuelSummary.minutes,
              vibe: syncDuelSummary.vibe,
              actions: syncDuelSummary.actions,
              publishToFeed: rateOpts?.publishToFeed,
            })
          }}
          onShareSkip={() => {
            void recordSyncShareMetric(db, {
              uid: effectiveUserId,
              kind: 'skip',
              city: currentUser?.city,
              isDemoMode,
            })
          }}
          onShareOptOutChange={(optOut) => {
            if (optOut) {
              void recordSyncShareMetric(db, {
                uid: effectiveUserId,
                kind: 'opt_out',
                city: currentUser?.city,
                isDemoMode,
              })
            }
          }}
          shareInviteUrl={buildInviteLink(effectiveUserId)}
          db={db}
          userCity={currentUser?.city}
          isDemoMode={isDemoMode}
          onInviteSquad={(_partnerId, partnerName) => {
            const first = partnerName.split(' ')[0] || 'tu compaÃ±ero'
            const inviteUrl = buildInviteLink(effectiveUserId)
            setSyncDuelSummary(null)
            void (async () => {
              const outcome = await shareNativeMessage({
                title: 'Invitar a Squad Â· EntrenaMatch',
                text: `Acabamos de hacer EntrenaSync. Â¿Te sumas a nuestro Squad con ${first}?`,
                url: inviteUrl,
              })
              if (outcome === 'copied') toast.success('InvitaciÃ³n copiada â€” envÃ­asela a tu compaÃ±ero')
              else if (outcome === 'failed') toast.error('No se pudo compartir la invitaciÃ³n')
              setSquadNameDraft(`Squad ${first}`)
              navigateTab('squads')
              setShowCreateSquad(true)
            })()
          }}
          fuelBurnKcal={
            syncDuelSummary.fuelBurnKcal ??
            estimateSyncSessionBurn(
              fuelProfile?.weightKg ?? 75,
              syncDuelSummary.minutes ||
                Math.max(1, Math.ceil((syncDuelSummary.elapsedSec || 0) / 60))
            )
          }
          weightKg={fuelProfile?.weightKg ?? 75}
          workoutCompare={syncDuelSummary.workoutCompare}
          selfWearable={syncDuelSummary.selfWearable}
          partnerWearable={syncDuelSummary.partnerWearable}
          publishingFeed={publishingSyncFeed}
          onPublishToFeed={async () => {
            if (!syncDuelSummary || !currentUser) return
            setPublishingSyncFeed(true)
            try {
              const dataUrl = await syncStoryToDataUrl({
                selfName: currentUser.name || 'TÃº',
                partnerName: syncDuelSummary.partnerName,
                minutes: syncDuelSummary.minutes,
                vibe: syncDuelSummary.vibe,
                setsLogged: syncDuelSummary.setsLogged,
                selfPhoto: currentUser.photos?.[0],
                partnerPhoto: syncDuelSummary.partnerPhoto,
                witnessCount: syncDuelSummary.witnessCount,
                isNetworkBond: syncDuelSummary.isNetworkBond,
              })
              const text = buildSyncPostText({
                selfName: currentUser.name || 'TÃº',
                partnerName: syncDuelSummary.partnerName,
                minutes: syncDuelSummary.minutes,
                vibe: syncDuelSummary.vibe,
              })
              await createProfilePost(text, dataUrl)
              void recordSyncShareMetric(db, {
                uid: effectiveUserId,
                kind: 'publish',
                city: currentUser?.city,
                isDemoMode,
              })
              toast.success('Historia EntrenaSync en tu muro')
            } catch {
              toast.error('No se pudo publicar la historia')
            } finally {
              setPublishingSyncFeed(false)
            }
          }}
        />
      )}

      {pendingSyncRating && (
        <div className="em-v2-sync-memory__overlay fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={() => setPendingSyncRating(null)}>
          <div className="em-v2-sync-memory__card em-v2-sync-memory__card--live max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-2">HANDSHAKE</div>
            <div className="font-bold text-xl mb-1">How was the EntrenaSync with {pendingSyncRating.partnerName}?</div>
            <div className="text-sm text-[#9CA3AF] mb-4">{pendingSyncRating.minutes} minutes together - Your feedback helps matching</div>
            <div className="flex justify-center gap-2 mb-4">
              {[1,2,3,4,5].map(r => (
                <button key={r} onClick={() => submitSyncRating(r)} className="text-3xl p-1.5 active:scale-90 transition text-[#FF671F] hover:text-white">{'â˜…'.repeat(r)}</button>
              ))}
            </div>
            <button onClick={() => setPendingSyncRating(null)} className="text-xs text-[#9CA3AF]">Skip for now</button>
          </div>
        </div>
      )}

      {/* NEVER-SEEN: Replay modal for a finished EntrenaSync session.
          Plays back the shared ritual as a beautiful memory. This persistence of "we trained together" is pure magic and 100% unique. */}
      {replaySession && (
        <div className="em-v2-sync-memory__overlay fixed inset-0 z-[120] flex items-center justify-center p-4" onClick={() => setReplaySession(null)}>
          <div className="em-v2-sync-memory__card em-v2-sync-memory__card--live max-w-sm w-full" onClick={e=>e.stopPropagation()}>
            <div className="text-center mb-3">
              <div className="text-[#22c55e] text-xs tracking-[2px]">{SYNC_REPLAY_COPY.modalEyebrow}</div>
              <div className="font-bold text-xl">{SYNC_REPLAY_COPY.modalTitle(replaySession.partnerName)}</div>
              <div className="text-sm text-[#9CA3AF]">
                {SYNC_REPLAY_COPY.modalStats(
                  replaySession.minutes,
                  replaySession.vibe,
                  replaySession.rating
                )}
              </div>
            </div>

            <div className="em-v2-sync-memory__timeline mb-3 min-h-[132px] relative overflow-hidden">
              <p className="text-[9px] text-[#9CA3AF] mb-2 text-center">Lo que hicieron juntos en la sesiÃ³n</p>
              <AnimatePresence>
                {(replaySession.actions || []).map((a: any, idx: number) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -12, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: Math.min(idx * 0.18, 1.6), duration: 0.26 }}
                    className="flex items-center gap-2 py-1 text-sm"
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <span>{a.label}{a.combo ? <span className="ml-1 text-[#FF671F] font-black">x{a.combo}</span> : ''}</span>
                    {a.photoUrl && <img src={a.photoUrl} className="w-8 h-8 rounded object-cover border border-[#22c55e]/30 ml-1" />}
                    <span className="ml-auto text-[10px] text-[#9CA3AF] tabular-nums">{idx + 1}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {(!replaySession.actions || replaySession.actions.length === 0) && (
                <div className="text-[#9CA3AF] text-xs text-center py-6">{SYNC_REPLAY_COPY.emptyActions}</div>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setReplaySession(null); if (replaySession.partnerName) { const p = realProfiles.find(pp => pp.name?.includes(replaySession.partnerName.split(' ')[0])); if (p) tryAutoStartSync(p.id) } }} className="em-v2-sync-memory__cta em-v2-sync-memory__cta--live flex-1">
                ðŸ”„ {SYNC_REPLAY_COPY.resync(replaySession.partnerName?.split(' ')[0] || 'tu partner')}
              </button>
              <button onClick={() => setReplaySession(null)} className="em-v2-cta-secondary flex-1">Cerrar</button>
            </div>
            <div className="text-center text-[9px] text-[#9CA3AF] mt-2">{SYNC_REPLAY_COPY.modalFooter}</div>
          </div>
        </div>
      )}

      {/* WITNESS MODE: Short replay of the epic high-vibe moment that generated a Ritual Ripple.
          Anyone who sees the wave on the map (or receives the notification) can witness what actually happened in the Arena.
          This turns private legendary syncs into community-shared cultural moments. Never-seen-before social layer. */}
      {witnessData && (
        <div className="em-v2-sync-memory__overlay fixed inset-0 z-[130] flex items-center justify-center p-4" onClick={() => setWitnessData(null)}>
          <div className="em-v2-sync-memory__card em-v2-sync-memory__card--witness max-w-sm w-full" onClick={e=>e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="text-[#FF671F] text-xs tracking-[2.5px] font-bold">{SYNC_REPLAY_COPY.witnessEyebrow}</div>
              <div className="font-black text-2xl mt-1">{SYNC_REPLAY_COPY.modalTitle(witnessData.partnerName)}</div>
              <div className="text-sm text-[#9CA3AF]">
                {witnessData.minutes} min Â· {formatSyncVibeLabel(witnessData.vibe)}
              </div>
              <div className="text-[10px] text-[#FF671F]/80 mt-1">{SYNC_REPLAY_COPY.witnessSubtitle}</div>
            </div>

            <div className="em-v2-sync-memory__timeline mb-4 border border-[#FF671F]/20">
              {(witnessData.actions || []).slice(0,5).map((a: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 py-1 text-sm border-b border-white/10 last:border-none">
                  <span className="text-xl">{a.emoji}</span>
                  <span className="flex-1 text-white/90">{a.label}{a.combo ? <span className="text-[#FF671F] font-bold"> Ã—{a.combo}</span> : ''}</span>
                  {a.photoUrl && <img src={a.photoUrl} className="w-7 h-7 rounded object-cover border border-white/20" />}
                </div>
              ))}
              {(!witnessData.actions || witnessData.actions.length === 0) && (
                <div className="text-[#9CA3AF] text-xs py-4 text-center">{SYNC_REPLAY_COPY.witnessEmpty}</div>
              )}
            </div>

            {witnessData.workoutPreview && (
              <div className="mb-4">
                <WorkoutPostCard preview={witnessData.workoutPreview} compact />
                {witnessData.loggedSets > 0 && (
                  <p className="text-[10px] text-center text-[#22c55e] mt-2 font-medium">
                    {witnessData.loggedSets} sets en Entreno de Hoy
                  </p>
                )}
              </div>
            )}

            {witnessData.photoUrl && (
              <div className="mb-4">
                <img src={witnessData.photoUrl} className="w-full rounded-2xl border border-[#FF671F]/30" alt="Momento Ã©pico" />
                <div className="text-[10px] text-center text-[#9CA3AF] mt-1">Foto del pico de energÃ­a</div>
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={() => { 
                  setWitnessData(null); 
                  toast('Activa LIVE o invita a alguien a un EntrenaSync desde el mapa');
                }} 
                className="em-v2-sync-memory__cta em-v2-sync-memory__cta--brand flex-1"
              >
                ðŸ”¥ {SYNC_REPLAY_COPY.witnessCreate}
              </button>
              <button 
                onClick={() => {
                  const echoText = buildWitnessEchoPostText({
                    partnerName: witnessData.partnerName,
                    minutes: witnessData.minutes,
                    vibe: witnessData.vibe,
                    actions: witnessData.actions,
                  })
                  createProfilePost(echoText, witnessData.photoUrl).then(() => {
                    toast.success(SYNC_REPLAY_COPY.witnessToast, {
                      description: SYNC_REPLAY_COPY.witnessToastDesc,
                    })
                    setWitnessData(null)
                  }).catch(() => {
                    toast('Guardado localmente â€” se sincronizarÃ¡ al Muro')
                    setWitnessData(null)
                  })
                }} 
                className="em-v2-sync-memory__cta em-v2-sync-memory__cta--gold flex-1"
              >
                ðŸ“Œ {SYNC_REPLAY_COPY.witnessSave}
              </button>
              <button onClick={() => setWitnessData(null)} className="em-v2-cta-secondary flex-1">Cerrar</button>
            </div>
            <div className="text-center text-[8px] text-[#9CA3AF]/60 mt-2">{SYNC_REPLAY_COPY.witnessFooter}</div>
          </div>
        </div>
      )}

      <SyncArenaHost
        syncPartnerId={syncPartnerId}
        showSyncArena={showSyncArena}
        showTrainerCoach={showTrainerCoach}
        showMarketplace={showMarketplace}
        showEntrenaLogModal={showEntrenaLogModal}
        currentUser={currentUser}
        effectiveUserId={effectiveUserId}
        firebaseUserUid={firebaseUser?.uid}
        realProfiles={realProfiles}
        userLocation={userLocation}
        syncStartedAt={syncStartedAt}
        syncVibe={syncVibe}
        syncCombo={syncCombo}
        syncActions={syncActions}
        syncBonds={syncBonds}
        syncRealWitnessCount={syncRealWitnessCount}
        syncWitnessIds={syncWitnessIds}
        syncPartnerLiveState={syncPartnerLiveState}
        syncRestUntil={syncRestUntil}
        syncRestStartedBy={syncRestStartedBy}
        syncWorkoutLog={syncWorkoutLog}
        liveTrainingNow={liveTrainingNow}
        arenaWaveCount={arenaWaveCount}
        activeSyncPairs={activeSyncPairs}
        homeWeeklyPactProgress={homeWeeklyPactProgress}
        activeTab={activeTab}
        redSubTab={redSubTab}
        activeChat={activeChat}
        isArenaVoiceRecording={isArenaVoiceRecording}
        isUserLive={isUserLive}
        onMinimizeArena={() => setShowSyncArena(false)}
        onOpenArena={() => setShowSyncArena(true)}
        onEndSync={endSync}
        onSyncAction={handleArenaSyncAction}
        onCapturePhoto={handleArenaCapturePhoto}
        onVoicePing={startArenaVoicePing}
        onWorkoutLogChange={(patch) => setSyncWorkoutLog((prev) => ({ ...prev, ...patch }))}
        persistSyncWorkoutLogToSession={persistSyncWorkoutLogToSession}
        arenaPhotoInputRef={arenaPhotoInputRef}
        arenaPhotoResolverRef={arenaPhotoResolverRef}
      />

    </ErrorBoundary>
  )
}

// ErrorBoundary restaurado (fue eliminado accidentalmente durante limpieza de cÃ³digo muerto del mapa).
// Envuelve secciones crÃ­ticas (Auth, Onboarding y el shell principal) para que crashes no dejen la app en blanco.
// Integra con el sistema de debug logs expuesto en window.__addEntrenaDebugLog.

// Types moved inline to avoid TSX parsing issues in this file section.
;interface ErrorBoundaryState { hasError: boolean }
class ErrorBoundary extends Component<any, ErrorBoundaryState> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App crashed:', error, errorInfo)
    try {
      ;(window as any).__addEntrenaDebugLog?.(`CRASH: ${error.message} ${errorInfo?.componentStack || ''}`)
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0D10] text-white flex items-center justify-center p-6">
          <div className="text-center max-w-xs">
            <div className="text-2xl mb-4">Algo saliÃ³ mal</div>
            <p className="text-[#9CA3AF] mb-6 text-sm">
              La aplicaciÃ³n tuvo un error. Tus datos en Firebase siguen seguros.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-2.5"
            >
              Recargar la pÃ¡gina
            </button>
            <div className="mt-4 text-[10px] text-[#9CA3AF]/60">
              Si persiste, avÃ­sanos en el feedback del perfil.
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default App

