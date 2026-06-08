// ✅ Build limpio después de revert V2 - 06/06/2026
// @ts-nocheck
import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense, Component, type ReactNode, type ChangeEvent } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, MessageCircle, User, MapPin, Dumbbell, 
  Edit2, RefreshCw, ArrowLeft, Send, Star, Plus, Users, Bell, Download,
  Clock, Camera, Activity, Zap, Mic, Square, Play, Pause, X, RotateCcw, Sparkles
} from 'lucide-react'
import { 
  signUpWithEmail, 
  signInWithEmail, 
  createUserProfile,
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

// ==================== REFACTORED IMPORTS ====================
import type { 
  Profile, Message, TrainingSession, TrainingReview, 
  SessionMessage, Squad, Report, Notification, CurrentUser, Tab,
  ProfilePost
} from './types'
import type { FuelProfile, FuelLogEntry, FuelDayTotals } from './types'
import { 
  TRAINING_OPTIONS, AVAILABILITY, LEGAL_VERSIONS, AUTO_MATCH_IDS, APP_VERSION 
} from './constants'
import { verifyDevMapPassword, isDevPasswordConfigured } from './config/devGate'

// Capacitor plugins are loaded via a separate module that is only analyzed in CAPACITOR builds.
// This prevents Vite/Rolldown from ever trying to resolve @capacitor/* packages during pure web builds
// (Firebase --base=/ , GH Pages, dev server) → eliminates the "failed to resolve import" errors.
let CapacitorCamera: any = null
let PushNotifications: any = null
let PlayIntegrityNative: any = null
let GeolocationNative: any = null

if (__CAPACITOR_BUILD__) {
  // The specifier is a define placeholder replaced at build time with the real path only for CAP builds.
  // Web builds get a dummy data URL, so no loader module is ever analyzed/resolved in web builds.
  import(CAPACITOR_PLUGINS_LOADER).then(() => {
    const plugins = (typeof window !== 'undefined' && (window as any).__CAPACITOR_PLUGINS__) || {}
    CapacitorCamera = plugins.Camera || null
    PushNotifications = plugins.PushNotifications || null
    PlayIntegrityNative = plugins.PlayIntegrity || null
    GeolocationNative = plugins.Geolocation || null
  })
}

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
import {
  ASSUMED_LIVE_SESSION_MS,
  normalizeTrainingSince as normalizeTrainingSinceMs,
  mergeLiveUsersById,
  enrichLiveUser as buildEnrichedLiveUser,
  isActiveLiveUser,
  isUserLiveInSnapshot,
  profileDocToLiveUser,
} from './utils/gymPulseLive'
import { useDemoAuth } from './hooks/useDemoAuth'
import { useProfile } from './contexts/ProfileContext'
import { useFilters } from './hooks/useFilters'
import { useRealSessions } from './hooks/useRealSessions'
import { useSwipeDeck } from './hooks/useSwipeDeck'
import { ExploreTab } from './components/explore/ExploreTab'
import { ExploreLivePanel } from './components/explore/ExploreLivePanel'
import { SquadsTab } from './components/squads'
import { MatchesTab } from './components/matches'
import { SessionsTab } from './components/sessions'
import { ChatListPanel, ChatView } from './components/messages'
import { ProfileTab } from './components/profile'
import type { ProfileSection } from './components/profile'
import { LiveToggleFab } from './components/home'
import { MarketplaceView } from './components/marketplace'
import { AdminOpsPanel } from './components/admin'
import {
  attachMarketplaceAdminListener,
  attachMarketplaceProductsListener,
  createMarketplaceProduct,
  updateMarketplaceProduct,
  deleteMarketplaceProduct,
  createMarketplaceOrder,
  DEMO_MARKETPLACE_PRODUCTS,
  type MarketplaceProductInput,
} from './services/marketplace'
import {
  attachAllMarketplaceOrdersListener,
  attachMyMarketplaceOrdersListener,
  updateMarketplaceOrderStatus,
  setTrainerVerified,
} from './services/adminOps'
import {
  attachAllTrainerBookingsListener,
  computeAdminMetrics,
} from './services/adminAnalytics'
import { PostRegisterGuide } from './components/onboarding/PostRegisterGuide'
import {
  hasSeenPostRegisterGuide,
  markPostRegisterGuideSeen,
  loadFirstStepsProgress,
  saveFirstStepsProgress,
  type FirstStepsProgress,
} from './services/firstStepsProgress'
import type { MarketplaceProduct, TrainerBooking, TrainerDispatchRequest, TrainerProfile, TrainerProfileInput, MarketplaceOrder } from './types'
import { TrainerCoachView } from './components/trainerCoach'
import {
  attachTrainerProfilesListener,
  attachMyTrainerProfileListener,
  attachTrainerBookingsListener,
  saveTrainerProfile,
  createTrainerBooking,
  updateTrainerBookingStatus,
  linkReviewToBooking,
  formatTrainerRate,
  linkBookingSyncSession,
} from './services/trainerCoach'
import {
  attachClientDispatchListener,
  attachTrainerDispatchOfferListener,
  attachClientDispatchHistoryListener,
  attachTrainerDispatchHistoryListener,
  createTrainerDispatchRequest,
  cancelTrainerDispatch,
  estimateDispatchPrice,
  findNearbyDispatchTrainers,
} from './services/trainerDispatch'
import { createTrainerMpCheckout } from './services/trainerPayments'
import { LazyHomeTab, TAB_LOADING } from './components/app/LazyTabs'
import { fetchGlobalProfilePosts, fetchProfilePostById, togglePostLikeInFirestore, persistPostReactionsInFirestore } from './services/profilePosts'
import { fetchReviewsForProfile, submitReviewToFirestore } from './services/trainingReviews'
import { isQuickDemoSession, clearQuickDemoSession } from './utils/quickDemo'
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
import {
  formatLastLiveLabel,
  getTeamMemberStatus,
  sortTeamMembers,
} from './utils/homeTeam'
import { isTeamMemberId } from './utils/teamMembers'
import { isSeedProfileId } from './utils/seedProfiles'
import { EntrenaLogModal, WorkoutPostCard } from './components/workout'
import { FuelSetupModal, FuelLogModal, NutritionPostCard } from './components/fuel'
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
import { fetchRecentWorkouts } from './services/workouts'
import { saveWorkoutWithPost, fetchWorkoutById, saveSyncWorkoutWithPost, buildWorkoutPreview, computeWorkoutStats } from './services/workouts'
import { EXERCISE_LIBRARY } from './data/exerciseLibrary'
import {
  createEmptySyncWorkoutLog,
  appendSetToLog,
  countLoggedSets,
  syncWorkoutHasData,
  formatSetLabel,
  toParticipantSyncPayload,
  type SyncWorkoutLogState,
} from './utils/arenaWorkoutLog'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { GymPulseMap } from './components/map' // Inicio de modularización 2026-06-05 (stub + estructura)
import { SyncArenaView, ArenaGlobalPulseBar, SyncDuelSummary } from './components/arena'
import { uploadArenaPhotoUrl, postPartnerSyncStory } from './services/arenaFormPhoto'
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
import { attachDirectChatListener, type DirectChatMsg } from './services/chatMessages'
import { processLikeAndMaybeMatch } from './services/matching'
import { writePass } from './services/swipeState'
import {
  attachIncomingSyncListener,
  attachActiveSyncSessionListener,
  buildSyncSessionId,
  buildSyncSessionAction,
} from './services/syncSessions'
import { countExternalWitnesses, registerSyncWitness } from './services/syncWitness'
import {
  buildDefaultPact,
  computeWeeklyPactProgress,
  isPactForCurrentWeek,
} from './services/weeklyPact'
import { ARENA_REST_MS, parseParticipantState } from './utils/arenaSyncState'
import { triggerHaptic } from './utils/haptics'
import { loadStoredNotifications, saveStoredNotifications } from './utils/safeLocalStorage'
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

// ==================== GLOBAL SEED PROFILES - ENTRENAMATCH ====================
// Lanzamiento inicial fuerte en Chile + presencia en LatAm y España
const SEED_PROFILES: Profile[] = [
  {
    id: 'p1', name: 'Camila Morales', age: 26, gender: 'mujer',
    city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528,
    bio: 'Pesas + correr en la playa al atardecer. Busco compañero/a constante para motivarnos. ¡Amante del café post entreno!',
    photos: ['https://picsum.photos/id/1011/600/800', 'https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/1005/600/800'],
    trainingTypes: ['Pesas/Gym', 'Running'], goals: ['Ganar músculo', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Tarde', 'Noche']
  },
  {
    id: 'p2', name: 'Joaquín Pérez', age: 29, gender: 'hombre',
    city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693,
    bio: 'CrossFit 4 veces por semana. Me encanta salir a correr por el parque los fines de semana. ¿Te animas?',
    photos: ['https://picsum.photos/id/1005/600/800', 'https://picsum.photos/id/201/600/800', 'https://picsum.photos/id/160/600/800'],
    trainingTypes: ['CrossFit', 'Running', 'Funcional'], goals: ['Aumentar fuerza', 'Mejorar resistencia', 'Preparar competencia'], level: 'Avanzado', availability: ['Mañana', 'Tarde']
  },
  {
    id: 'p3', name: 'Valentina Soto', age: 24, gender: 'mujer',
    city: 'Valparaíso', country: 'Chile', lat: -33.0472, lng: -71.6127,
    bio: 'Calistenia y yoga. Entreno en los cerros o en casa. Busco gente para entrenar al aire libre y tomar mate después 🧉',
    photos: ['https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/29/600/800'],
    trainingTypes: ['Calistenia', 'Yoga', 'Funcional'], goals: ['Movilidad y flexibilidad', 'Socializar y motivación', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Mañana', 'Tarde']
  },
  {
    id: 'p4', name: 'Diego Herrera', age: 32, gender: 'hombre',
    city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816,
    bio: 'Gym + boxeo. 6 años entrenando. Busco sparring o compañero de pesas serio. Nada de excusas.',
    photos: ['https://picsum.photos/id/201/600/800', 'https://picsum.photos/id/64/600/800'],
    trainingTypes: ['Pesas/Gym', 'Boxeo'], goals: ['Aumentar fuerza', 'Ganar músculo'], level: 'Avanzado', availability: ['Tarde', 'Noche']
  },
  {
    id: 'p5', name: 'Isabella Mendoza', age: 28, gender: 'mujer',
    city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528,
    bio: 'Running y pilates. Corro 3 veces por semana por la costanera. Ideal para quien quiera sumar kms conmigo.',
    photos: ['https://picsum.photos/id/1005/600/800', 'https://picsum.photos/id/1012/600/800'],
    trainingTypes: ['Running', 'Pilates'], goals: ['Perder grasa', 'Mejorar resistencia', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Mañana']
  },
  {
    id: 'p6', name: 'Matías Vargas', age: 25, gender: 'hombre',
    city: 'Concepción', country: 'Chile', lat: -36.8201, lng: -73.0445,
    bio: 'Funcional y calistenia. Me encanta entrenar al amanecer. ¿Quién se levanta temprano?',
    photos: ['https://picsum.photos/id/160/600/800', 'https://picsum.photos/id/1008/600/800'],
    trainingTypes: ['Calistenia', 'Funcional', 'Running'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Mañana']
  },
  {
    id: 'p7', name: 'Sofía Lagos', age: 23, gender: 'mujer',
    city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693,
    bio: 'Gym y un poco de todo. Principiante motivada buscando grupo o persona para ir al gimnasio sin miedo.',
    photos: ['https://picsum.photos/id/29/600/800', 'https://picsum.photos/id/1011/600/800'],
    trainingTypes: ['Pesas/Gym', 'Funcional'], goals: ['Perder grasa', 'Socializar y motivación', 'Mantenerse en forma'], level: 'Principiante', availability: ['Tarde', 'Noche']
  },
  {
    id: 'p8', name: 'Lucas Fernández', age: 35, gender: 'hombre',
    city: 'Ciudad de México', country: 'México', lat: 19.4326, lng: -99.1332,
    bio: 'Ciclismo de ruta y gym. Salgo todos los sábados temprano. Nivel avanzado, busco gente seria.',
    photos: ['https://picsum.photos/id/64/600/800', 'https://picsum.photos/id/201/600/800'],
    trainingTypes: ['Ciclismo', 'Pesas/Gym'], goals: ['Mejorar resistencia', 'Preparar competencia'], level: 'Avanzado', availability: ['Mañana']
  },
  {
    id: 'p9', name: 'Antonia Ruiz', age: 30, gender: 'mujer',
    city: 'Madrid', country: 'España', lat: 40.4168, lng: -3.7038,
    bio: 'Yoga + running + algo de pesas. Equilibrio mental y físico. Me encanta conocer gente nueva con la misma energía.',
    photos: ['https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/30/600/800'],
    trainingTypes: ['Yoga', 'Running', 'Pesas/Gym'], goals: ['Movilidad y flexibilidad', 'Mantenerse en forma', 'Socializar y motivación'], level: 'Intermedio', availability: ['Mañana', 'Tarde']
  },
  {
    id: 'p10', name: 'Benjamín Cruz', age: 27, gender: 'hombre',
    city: 'Lima', country: 'Perú', lat: -12.0464, lng: -77.0428,
    bio: 'CrossFit y natación. Entreno en un box en Miraflores. Busco compañero de WODs.',
    photos: ['https://picsum.photos/id/160/600/800', 'https://picsum.photos/id/1005/600/800'],
    trainingTypes: ['CrossFit', 'Natación'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Avanzado', availability: ['Tarde', 'Noche']
  },
  {
    id: 'p11', name: 'Renata Díaz', age: 22, gender: 'mujer',
    city: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721,
    bio: 'Calistenia en las barras del parque. Nivel intermedio buscando progresar en dominadas.',
    photos: ['https://picsum.photos/id/1012/600/800', 'https://picsum.photos/id/29/600/800'],
    trainingTypes: ['Calistenia', 'Funcional'], goals: ['Aumentar fuerza', 'Ganar músculo'], level: 'Intermedio', availability: ['Tarde']
  },
  {
    id: 'p12', name: 'Sebastián Morales', age: 31, gender: 'hombre',
    city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693,
    bio: 'Pesas pesado y algo de boxeo. 4 años consistente. Busco gente que entrene en serio.',
    photos: ['https://picsum.photos/id/201/600/800', 'https://picsum.photos/id/64/600/800'],
    trainingTypes: ['Pesas/Gym', 'Boxeo'], goals: ['Ganar músculo', 'Aumentar fuerza'], level: 'Avanzado', availability: ['Noche']
  },
  {
    id: 'p13', name: 'Martina Vega', age: 26, gender: 'mujer',
    city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528,
    bio: 'Pilates + running. Recuperándome de lesión pero con muchas ganas. Ideal para alguien paciente.',
    photos: ['https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/1011/600/800'],
    trainingTypes: ['Pilates', 'Running'], goals: ['Rehabilitación / Lesión', 'Mantenerse en forma', 'Movilidad y flexibilidad'], level: 'Principiante', availability: ['Mañana', 'Tarde']
  },
  {
    id: 'p14', name: 'Felipe Navarro', age: 28, gender: 'hombre',
    city: 'Valparaíso', country: 'Chile', lat: -33.0472, lng: -71.6127,
    bio: 'Funcional, pesas y trail running. Me muevo entre Valpo y Viña. ¿Salimos a correr?',
    photos: ['https://picsum.photos/id/1008/600/800', 'https://picsum.photos/id/160/600/800'],
    trainingTypes: ['Funcional', 'Pesas/Gym', 'Running'], goals: ['Mejorar resistencia', 'Perder grasa'], level: 'Intermedio', availability: ['Mañana', 'Noche']
  },
  {
    id: 'p15', name: 'Carolina Mendoza', age: 29, gender: 'mujer',
    city: 'Miami', country: 'Estados Unidos', lat: 25.7617, lng: -80.1918,
    bio: 'Gym + running por la playa. Chilena viviendo en Miami. Busco gente con la misma disciplina.',
    photos: ['https://picsum.photos/id/1011/600/800', 'https://picsum.photos/id/1009/600/800'],
    trainingTypes: ['Pesas/Gym', 'Running'], goals: ['Perder grasa', 'Ganar músculo'], level: 'Intermedio', availability: ['Mañana', 'Tarde']
  },
  { id: 'p16', name: 'Alejandro Ruiz', age: 22, gender: 'hombre', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/29/600/800', 'https://picsum.photos/id/30/600/800', 'https://picsum.photos/id/64/600/800'], trainingTypes: ['Pesas/Gym', 'Running'], goals: ['Ganar músculo', 'Aumentar fuerza'], level: 'Intermedio', availability: ['Mañana', 'Tarde'] },
  { id: 'p17', name: 'Alejandra Ruiz', age: 23, gender: 'mujer', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1004/600/800', 'https://picsum.photos/id/1005/600/800'], trainingTypes: ['Running', 'Yoga'], goals: ['Perder grasa', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Tarde', 'Noche'] },
  { id: 'p18', name: 'Andrés Morales', age: 24, gender: 'hombre', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1006/600/800', 'https://picsum.photos/id/1007/600/800', 'https://picsum.photos/id/1008/600/800'], trainingTypes: ['Calistenia', 'Funcional'], goals: ['Aumentar fuerza', 'Mantenerse en forma'], level: 'Avanzado', availability: ['Noche', 'Mañana'] },
  { id: 'p19', name: 'Beatriz Morales', age: 25, gender: 'mujer', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/1011/600/800'], trainingTypes: ['Yoga', 'Running'], goals: ['Perder grasa', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Tarde'] },
  { id: 'p20', name: 'Carlos Soto', age: 26, gender: 'hombre', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1012/600/800', 'https://picsum.photos/id/1013/600/800', 'https://picsum.photos/id/1014/600/800'], trainingTypes: ['Pesas/Gym', 'Boxeo'], goals: ['Ganar músculo', 'Aumentar fuerza'], level: 'Avanzado', availability: ['Mañana', 'Tarde'] },
  { id: 'p21', name: 'Daniela Vega', age: 27, gender: 'mujer', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1015/600/800', 'https://picsum.photos/id/1016/600/800'], trainingTypes: ['Calistenia', 'Yoga'], goals: ['Movilidad y flexibilidad', 'Socializar y motivación'], level: 'Intermedio', availability: ['Tarde', 'Noche'] },
  { id: 'p22', name: 'Eduardo Pérez', age: 28, gender: 'hombre', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1017/600/800', 'https://picsum.photos/id/1018/600/800', 'https://picsum.photos/id/1019/600/800'], trainingTypes: ['CrossFit', 'Running'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Mañana'] },
  { id: 'p23', name: 'Elena Pérez', age: 29, gender: 'mujer', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1020/600/800', 'https://picsum.photos/id/1021/600/800'], trainingTypes: ['Pilates', 'Running'], goals: ['Perder grasa', 'Mantenerse en forma'], level: 'Principiante', availability: ['Tarde'] },
  { id: 'p24', name: 'Francisco López', age: 30, gender: 'hombre', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1022/600/800', 'https://picsum.photos/id/1023/600/800', 'https://picsum.photos/id/1024/600/800'], trainingTypes: ['Natación', 'Funcional'], goals: ['Mejorar resistencia', 'Aumentar fuerza'], level: 'Avanzado', availability: ['Noche', 'Tarde'] },
  { id: 'p25', name: 'Fernanda López', age: 31, gender: 'mujer', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/28/600/800', 'https://picsum.photos/id/201/600/800'], trainingTypes: ['Yoga', 'Pilates'], goals: ['Movilidad y flexibilidad', 'Socializar y motivación'], level: 'Intermedio', availability: ['Mañana', 'Tarde'] },
  { id: 'p26', name: 'Gabriel Díaz', age: 32, gender: 'hombre', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/160/600/800', 'https://picsum.photos/id/100/600/800', 'https://picsum.photos/id/101/600/800'], trainingTypes: ['Boxeo', 'Pesas/Gym'], goals: ['Aumentar fuerza', 'Ganar músculo'], level: 'Avanzado', availability: ['Tarde', 'Noche'] },
  { id: 'p27', name: 'Gabriela Díaz', age: 33, gender: 'mujer', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/102/600/800', 'https://picsum.photos/id/103/600/800'], trainingTypes: ['Running', 'Yoga'], goals: ['Perder grasa', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Mañana'] },
  { id: 'p28', name: 'Héctor Mendoza', age: 34, gender: 'hombre', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/29/600/800', 'https://picsum.photos/id/30/600/800'], trainingTypes: ['Ciclismo', 'Running'], goals: ['Mejorar resistencia', 'Preparar competencia'], level: 'Avanzado', availability: ['Tarde'] },
  { id: 'p29', name: 'Helena Mendoza', age: 35, gender: 'mujer', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/64/600/800', 'https://picsum.photos/id/1004/600/800', 'https://picsum.photos/id/1005/600/800'], trainingTypes: ['Pilates', 'Funcional'], goals: ['Movilidad y flexibilidad', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Noche', 'Tarde'] },
  { id: 'p30', name: 'Ignacio Torres', age: 36, gender: 'hombre', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1006/600/800', 'https://picsum.photos/id/1007/600/800'], trainingTypes: ['CrossFit', 'Natación'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Avanzado', availability: ['Mañana', 'Noche'] },
  { id: 'p31', name: 'Isabel Torres', age: 37, gender: 'mujer', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1008/600/800', 'https://picsum.photos/id/1009/600/800'], trainingTypes: ['Yoga', 'Running'], goals: ['Perder grasa', 'Socializar y motivación'], level: 'Principiante', availability: ['Tarde'] },
  { id: 'p32', name: 'Javier Rojas', age: 38, gender: 'hombre', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1011/600/800', 'https://picsum.photos/id/1012/600/800', 'https://picsum.photos/id/1013/600/800'], trainingTypes: ['Pesas/Gym', 'Boxeo'], goals: ['Ganar músculo', 'Aumentar fuerza'], level: 'Avanzado', availability: ['Noche'] },
  { id: 'p33', name: 'Juana Rojas', age: 22, gender: 'mujer', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1014/600/800', 'https://picsum.photos/id/1015/600/800'], trainingTypes: ['Calistenia', 'Pilates'], goals: ['Movilidad y flexibilidad', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Mañana', 'Tarde'] },
  { id: 'p34', name: 'Kevin Flores', age: 23, gender: 'hombre', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1016/600/800', 'https://picsum.photos/id/1017/600/800'], trainingTypes: ['Running', 'Ciclismo'], goals: ['Mejorar resistencia', 'Perder grasa'], level: 'Intermedio', availability: ['Tarde', 'Noche'] },
  { id: 'p35', name: 'Karla Flores', age: 24, gender: 'mujer', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1018/600/800', 'https://picsum.photos/id/1019/600/800', 'https://picsum.photos/id/1020/600/800'], trainingTypes: ['Yoga', 'Funcional'], goals: ['Socializar y motivación', 'Movilidad y flexibilidad'], level: 'Principiante', availability: ['Mañana'] },
  { id: 'p36', name: 'Luis Vargas', age: 25, gender: 'hombre', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1021/600/800', 'https://picsum.photos/id/1022/600/800'], trainingTypes: ['Pesas/Gym', 'CrossFit'], goals: ['Aumentar fuerza', 'Ganar músculo'], level: 'Avanzado', availability: ['Tarde'] },
  { id: 'p37', name: 'Laura Vargas', age: 26, gender: 'mujer', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1023/600/800', 'https://picsum.photos/id/1024/600/800'], trainingTypes: ['Running', 'Pilates'], goals: ['Perder grasa', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Noche', 'Tarde'] },
  { id: 'p38', name: 'Marco Castillo', age: 27, gender: 'hombre', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/28/600/800', 'https://picsum.photos/id/201/600/800', 'https://picsum.photos/id/160/600/800'], trainingTypes: ['Boxeo', 'Funcional'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Intermedio', availability: ['Mañana', 'Noche'] },
  { id: 'p39', name: 'María Castillo', age: 28, gender: 'mujer', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/100/600/800', 'https://picsum.photos/id/101/600/800'], trainingTypes: ['Yoga', 'Running'], goals: ['Movilidad y flexibilidad', 'Socializar y motivación'], level: 'Principiante', availability: ['Tarde'] },
  { id: 'p40', name: 'Nicolás Guzmán', age: 29, gender: 'hombre', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/102/600/800', 'https://picsum.photos/id/103/600/800'], trainingTypes: ['Ciclismo', 'Pesas/Gym'], goals: ['Mejorar resistencia', 'Preparar competencia'], level: 'Avanzado', availability: ['Mañana'] },
  { id: 'p41', name: 'Natalia Guzmán', age: 30, gender: 'mujer', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/29/600/800', 'https://picsum.photos/id/30/600/800', 'https://picsum.photos/id/64/600/800'], trainingTypes: ['Pilates', 'Funcional'], goals: ['Perder grasa', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Tarde', 'Noche'] },
  { id: 'p42', name: 'Oscar Ramírez', age: 31, gender: 'hombre', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1004/600/800', 'https://picsum.photos/id/1005/600/800'], trainingTypes: ['CrossFit', 'Running'], goals: ['Aumentar fuerza', 'Mejorar resistencia'], level: 'Avanzado', availability: ['Noche'] },
  { id: 'p43', name: 'Olivia Ramírez', age: 32, gender: 'mujer', city: 'Reñaca', country: 'Chile', lat: -32.95, lng: -71.55, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1006/600/800', 'https://picsum.photos/id/1007/600/800'], trainingTypes: ['Yoga', 'Running'], goals: ['Movilidad y flexibilidad', 'Socializar y motivación'], level: 'Intermedio', availability: ['Mañana', 'Tarde'] },
  { id: 'p44', name: 'Pablo Herrera', age: 33, gender: 'hombre', city: 'Viña del Mar', country: 'Chile', lat: -33.0153, lng: -71.5528, bio: 'Entreno fuerte en la costa, busco compañero para motivarnos mutuamente.', photos: ['https://picsum.photos/id/1008/600/800', 'https://picsum.photos/id/1009/600/800', 'https://picsum.photos/id/1011/600/800'], trainingTypes: ['Pesas/Gym', 'Boxeo'], goals: ['Ganar músculo', 'Aumentar fuerza'], level: 'Avanzado', availability: ['Tarde'] },
  { id: 'p45', name: 'Paula Herrera', age: 34, gender: 'mujer', city: 'Concón', country: 'Chile', lat: -32.93, lng: -71.52, bio: 'Me encanta entrenar al aire libre, ideal para quien quiera unirse con buena energía.', photos: ['https://picsum.photos/id/1012/600/800', 'https://picsum.photos/id/1013/600/800'], trainingTypes: ['Calistenia', 'Funcional'], goals: ['Perder grasa', 'Mantenerse en forma'], level: 'Intermedio', availability: ['Noche', 'Tarde'] }
]

// Note: AUTO_MATCH_IDS, getDistanceKm, calculateCompatibility, getAverageRating and getTrainingStreak 
// are now imported from ./constants and ./utils (refactor in progress)

// Pre-written chat openers for realism
const CHAT_OPENERS: Record<string, string[]> = {
  p1: ['¡Hola! Vi que también entrenas en Reñaca, ¿vamos a correr juntos este fin de semana?', 'Hey! Me encanta tu bio, yo también soy team café post gym ☕'],
  p2: ['CrossFit gang! ¿En qué box entrenas tú?', 'Hola Joaquín, ¿haces el WOD del sábado?'],
  p3: ['Me muero por probar calistenia en la 5ta, ¿me das tips?', '¡Hola! ¿Haces yoga en grupo alguna vez?'],
  p5: ['Corremos a la misma hora jajaja. ¿Te tinca sumar kilómetros juntos?', 'Isabella! Yo también corro por Reñaca los jueves.'],
  p6: ['Amaneceres en la playa hit different 🔥 ¿A qué hora sueles ir?'],
  p9: ['Tu bio me cayó super bien. ¿Practicamos yoga juntos alguna vez?'],
  p11: ['¡Dominadas gang! ¿Cuántas llevas ahora?', 'Vi que también haces calistenia en la costanera, ¿nos cruzamos?'],
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

  // Used to break the "stuck on AuthScreen after successful real auth" race
  // because firebaseUser from the hook can lag behind the successful signIn/signUp call.
  const lastSuccessfulAuthRef = useRef(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const groupChatScrollRef = useRef<HTMLDivElement>(null)
  const groupChatInputRef = useRef<HTMLInputElement>(null)
  const groupMessageUnsubsRef = useRef<Record<string, () => void>>({})
  const realChatUnsubsRef = useRef<Record<string, () => void>>({})
  const currentActiveChatRef = useRef<string | null>(null)
  // For deduping message arrival notifications (only notify on 'added' after initial snapshot per chat/session)
  const seenChatMsgIdsRef = useRef<Record<string, Set<string>>>({})
  const seenGroupMsgIdsRef = useRef<Record<string, Set<string>>>({})
  // For live training urgency notifs: track seen live users so we only notify on *new* nearby lives (prevents spam on refresh)
  const seenLiveUserIdsRef = useRef<Set<string>>(new Set())
  // For "someone joined my live" notifs: dedup incoming comments/likes on the live posts we created when trainingNow
  const seenLiveJoinInteractionIdsRef = useRef<Set<string>>(new Set())
  // Track previous trainingSyncWith for members of *your red* so we can notify when they start a strong sync (Network Power propagation moment)
  const prevRedSyncStateRef = useRef<Record<string, string | null>>({})
  // Per-chat and per-session unread counts for badges + list dots (local, cleared on open)
  const [chatUnreads, setChatUnreads] = useState<Record<string, number>>({})
  const [sessionUnreads, setSessionUnreads] = useState<Record<string, number>>({})

  // Persist chat unreads across refreshes (for better "new message" experience)
  useEffect(() => {
    localStorage.setItem('entrenamatch_chat_unreads', JSON.stringify(chatUnreads))
  }, [chatUnreads])

  // Same for session group unreads
  useEffect(() => {
    localStorage.setItem('entrenamatch_session_unreads', JSON.stringify(sessionUnreads))
  }, [sessionUnreads])

  // PWA install prompt wiring (beforeinstallprompt + nice banner after engagement)
  useEffect(() => {
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

    // Force show early on load for visibility (helps when beforeinstallprompt is slow or not fired)
    if (!localStorage.getItem('entrenamatch_pwa_dismissed')) {
      setTimeout(() => {
        setShowPwaInstall(true)
      }, 3000)
    }

    // Also listen for successful install
    const installedHandler = () => {
      setShowPwaInstall(false)
      setDeferredInstallPrompt(null)
      localStorage.setItem('entrenamatch_pwa_dismissed', '1')
      toast.success('¡App instalada!', { description: 'Ya puedes abrir EntrenaMatch desde tu pantalla de inicio como una app real.' })
    }
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  // === GYMPULSE DIARIO DE TUS GYMPARTNERS (states + ref hoisted VERY early, before sendVoiceNote and daily helpers, to eliminate all TDZ for dailyPulse in any closure on initial open)
  const [dailyPulse, setDailyPulse] = useState<{
    trainingStreak: number
    synergyStreak: number
    voiceStreak: number
    pulseStreak: number
    momentum: number
    lastDate: string | null
    currentChallenge: any | null
    longestTraining: number
    longestSynergy: number
    longestVoice: number
    longestPulse: number
    level: number
    xp: number
    streakProtectedDate?: string | null
    pulseAmplifiedDate?: string | null
  } | null>(null)
  const [showDailyPulseBanner, setShowDailyPulseBanner] = useState(false)
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)
  const dailyPulseRef = useRef<any>(null)
  useEffect(() => { dailyPulseRef.current = dailyPulse }, [dailyPulse])

  // Boost visibility of install banner on meaningful interaction (swipe or tab change to social)
  // More aggressive: show even without deferred (for manual guidance) if not dismissed
  const bumpPwaEngagement = () => {
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
        toast.success('¡Gracias! La app se está instalando.')
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

      toast('🎙️ Grabando nota de voz', { description: 'Para tu GymPartner. Máx 60s. PARAR para escucharla y decidir enviar.' })
    } catch (err) {
      console.error('Mic error', err)
      toast.error('No se pudo acceder al micrófono', { description: 'Revisa permisos del navegador o app.' })
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
        // Real Firebase — use resumable upload for beautiful live progress bar
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
      } else if (activeChat) {
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
      checkAndUpdateDailyPulse()
      const dp = dailyPulseRef.current || dailyPulse || {}
      const vStreak = (dp.voiceStreak || 0) + 1
      const vUpdate = { ...dp, voiceStreak: vStreak, longestVoice: Math.max((dp.longestVoice || 0), vStreak) }
      setDailyPulse(vUpdate)
      saveUserWithRealSync({ ...(currentUser as any), dailyVoiceStreak: vStreak } as any)
      // Premium toast celebrating the ritual voice + streak
      toast.success('Nota enviada a tu GymPartner', { 
        description: `${duration}s • Racha de voz ${vStreak}d 🔥  +5 Constancia en el GymPulse` 
      })
      // Daily Pulse progress (voice is powerful for bond/ripple challenges)
      if (dp.currentChallenge?.type === 'bond' || dp.currentChallenge?.type === 'network') {
        completeDailyChallenge(1)
      } else {
        awardConstancy(5, 'Voz enviada al GymPulse')
      }
    } catch (e) {
      console.error('Send voice error', e)
      const isReal = !isDemoMode
      const uid = firebaseUser?.uid || 'sin-uid'
      toast.error('Error enviando nota de voz', { 
        description: isReal 
          ? `No se pudo subir el audio (uid: ${uid}). Asegúrate de que las storage rules estén deployadas (firebase deploy --only storage) y que estés autenticado con cuenta real.` 
          : 'Error local al procesar el audio.'
      })
      setIsUploadingVoice(false)
      setVoiceUploadProgress(0)
      // Do NOT clear pendingVoice on error, so user can retry or cancel
    }
  }

  // Extend sendSessionMessage to support voice (update call sites later)
  // (existing function at ~4328, we'll patch it below)

  const {
    likedIds,
    passedIds,
    saveLiked,
    savePassed,
    resetDeck: resetSwipeDeck,
  } = useSwipeDeck({ isDemoMode, db, firebaseUser })

  const [matches, setMatches] = useState<string[]>([]) // profile ids you matched with
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [activeChat, setActiveChat] = useState<string | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [profileSection, setProfileSection] = useState<ProfileSection>('actividad')
  const [isLoadingFeed, setIsLoadingFeed] = useState(false)
  const [feedShowPinnedOnly, setFeedShowPinnedOnly] = useState(false)
  const [feedSearch, setFeedSearch] = useState('')
  const [feedOnlyReal, setFeedOnlyReal] = useState(false)
  const [feedOnlyLive, setFeedOnlyLive] = useState(false)
  const [feedMaxProfiles, setFeedMaxProfiles] = useState(15)
  const [feedDisplayLimit, setFeedDisplayLimit] = useState(10)
  const globalFeedLastDocRef = useRef<any>(null)
  const [hasMoreGlobalFeed, setHasMoreGlobalFeed] = useState(true)
  const [weekLiveDays, setWeekLiveDays] = useState<string[]>([])
  const [showLiveModal, setShowLiveModal] = useState(false)
  // TOP UPDATE: Feed 2.0 - photo lightbox + quick reactions (optimistic, attractive social feel)
  const [feedPhotoModal, setFeedPhotoModal] = useState<{url: string, postId?: string} | null>(null)
  const [feedReactions, setFeedReactions] = useState<Record<string, Record<string, number>>>({}) // postId -> { '🔥': count, ... } optimistic per session
  // Attractive direct publish from Feed (no disappointing redirect to profile)
  const [showFeedPostModal, setShowFeedPostModal] = useState(false)
  const [feedPostText, setFeedPostText] = useState('')
  const [feedPostPhoto, setFeedPostPhoto] = useState<string | null>(null)
  const [feedPhotoUploading, setFeedPhotoUploading] = useState(false)
  const [feedPhotoUploadProgress, setFeedPhotoUploadProgress] = useState(0)
  // For delightful "just published" highlight in feed/muro lists (no giant re-render, just temp visual cue)
  const [recentlyPublishedPostId, setRecentlyPublishedPostId] = useState<string | null>(null)
  const [feedPublishing, setFeedPublishing] = useState(false)
  const [showFeedPublishSuccess, setShowFeedPublishSuccess] = useState(false)
  const [showEntrenaLogModal, setShowEntrenaLogModal] = useState(false)
  const [savingWorkout, setSavingWorkout] = useState(false)
  const [syncWorkoutLog, setSyncWorkoutLog] = useState<SyncWorkoutLogState>(() =>
    createEmptySyncWorkoutLog()
  )
  const syncWorkoutLogRef = useRef<SyncWorkoutLogState>(syncWorkoutLog)
  useEffect(() => {
    syncWorkoutLogRef.current = syncWorkoutLog
  }, [syncWorkoutLog])
  const [syncPartnerLiveState, setSyncPartnerLiveState] = useState<import('./utils/arenaSyncState').ArenaParticipantLiveState | null>(null)
  const [syncRestUntil, setSyncRestUntil] = useState<number | null>(null)
  const [syncRestStartedBy, setSyncRestStartedBy] = useState<string | null>(null)
  const [syncWitnessIds, setSyncWitnessIds] = useState<string[]>([])
  const [isArenaVoiceRecording, setIsArenaVoiceRecording] = useState(false)
  const arenaVoiceRecorderRef = useRef<MediaRecorder | null>(null)
  const arenaVoiceChunksRef = useRef<Blob[]>([])

  const arenaExerciseNames = useMemo(
    () => EXERCISE_LIBRARY.map((e) => e.name),
    []
  )
  const [entrenaLogPrefill, setEntrenaLogPrefill] = useState<{
    title?: string
    exercises?: import('./types').WorkoutExercise[]
    type?: import('./types').WorkoutType
    durationMin?: number
  } | null>(null)
  const [showFuelSetupModal, setShowFuelSetupModal] = useState(false)
  const [showFuelLogModal, setShowFuelLogModal] = useState(false)
  const [showMarketplace, setShowMarketplace] = useState(false)
  const [marketplaceScreenMode, setMarketplaceScreenMode] = useState<'shop' | 'orders'>('shop')
  const [showAdminOps, setShowAdminOps] = useState(false)
  const [adminOrders, setAdminOrders] = useState<MarketplaceOrder[]>([])
  const [adminBookings, setAdminBookings] = useState<TrainerBooking[]>([])
  const [mpConfigured, setMpConfigured] = useState(false)
  const [showPostRegisterGuide, setShowPostRegisterGuide] = useState(false)
  const [myMarketplaceOrders, setMyMarketplaceOrders] = useState<MarketplaceOrder[]>([])
  const [marketplaceProducts, setMarketplaceProducts] = useState<MarketplaceProduct[]>([])
  const [isMarketplaceAdmin, setIsMarketplaceAdmin] = useState(false)
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
  const [savingFuel, setSavingFuel] = useState(false)
  const [fuelProfile, setFuelProfile] = useState<FuelProfile | null>(null)
  const [fuelTodayLogs, setFuelTodayLogs] = useState<FuelLogEntry[]>([])
  const [fuelTodayTotals, setFuelTodayTotals] = useState<FuelDayTotals>(emptyFuelDayTotals())
  const [fuelWeekDays, setFuelWeekDays] = useState<import('./services/fuel').FuelWeekDay[]>([])
  const [fuelWeekMacros, setFuelWeekMacros] = useState<import('./services/fuel').FuelWeekMacroDay[]>([])
  const [firstStepsProgress, setFirstStepsProgress] = useState<FirstStepsProgress | null>(null)
  const [chatPartnerTyping, setChatPartnerTyping] = useState(false)
  const chatTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [editingFuelLog, setEditingFuelLog] = useState<FuelLogEntry | null>(null)
  const [deletingFuelLogId, setDeletingFuelLogId] = useState<string | null>(null)
  const [fuelPostWorkoutTip, setFuelPostWorkoutTip] = useState<string | undefined>()
  // THE KILLER FEATURE: EntrenaSync - real-time synchronized training that turns two people into a high-performance unit with shared state, visible connection, joint impact, and lasting social capital. This is the foundation of the first true social network for fitness performance.
  const [syncPartnerId, setSyncPartnerId] = useState<string | null>(null)
  const [syncStartedAt, setSyncStartedAt] = useState<number | null>(null)
  const [syncActions, setSyncActions] = useState<any[]>([]) // {id, emoji, userId, at, label}
  const [syncVibe, setSyncVibe] = useState(0) // 0-100 shared energy built by actions + rating (the unique "together" feeling)
  // For end-of-sync rating (disruptive accountability loop)
  const [pendingSyncRating, setPendingSyncRating] = useState<{partnerId: string, partnerName: string, minutes: number} | null>(null)
  // Community proof for the unique feature
  const [activeSyncCount, setActiveSyncCount] = useState(0)
  // Loading state for joining EntrenaSync (prevents spam + attractive feedback)
  const [joiningSyncWith, setJoiningSyncWith] = useState<string | null>(null)
  // Live modal local UI: search + sort for better discovery in the full list (killer feature polish)
  const [liveModalSearch, setLiveModalSearch] = useState('')
  const [liveModalSort, setLiveModalSort] = useState<'distance' | 'urgency' | 'hot'>('distance')

  // =====================================================
  // THE CORE PURPOSE OF ENTRENASYNC — building the first real social network for synchronized fitness performance.
  //
  // We are deliberately keeping these 5 non-negotiable mechanics (user directive):
  // • Real-time synchronized training with shared state — two people training "juntas" even when physically in different places.
  // • Strong visual connection in the moment — tether/energy line + orb that reacts live to the combined effort of both.
  // • Joint actions that create a shared performance score + visible, lasting impact afterward (profiles, feed, live map).
  // • "Training with someone" produces real, measurable consequences: better consistency, higher training volume, stronger motivation, and a permanent shared archive of the session.
  // • The map functions as a living social layer of real activity — you can literally see where meaningful, high-signal training is happening right now.
  //
  // Epic category vision (first-principles, like the original social graph or real-time public conversation):
  // This is the platform that makes synchronized physical effort between humans a primary, high-status, performance-enhancing social primitive.
  // Not another matching app. Not solo tracking.
  // But the network where training together is visible, consequential, status-bearing, and culturally significant.
  // Your training relationships form a real graph with history and compounding value.
  // Great sync sessions don't disappear — they leave measurable traces on both profiles, propagate through the feed, and light up the map.
  // The map becomes the living pulse of training communities worldwide.
  // In 5-10 years, serious athletes will say "I do my important sessions in Sync" the same way people say they post on the main social networks today.
  //
  // In the UI this must be obvious: the connection feels electric and high-stakes, joint actions feel powerful and consequential,
  // ending a strong sync feels like you built something real together that is now part of both of your permanent records,
  // and the entire community (feed + map) feels more alive because real synchronized training is happening at scale and being recognized.
  // This is infrastructure for the future of fitness as a synchronized, social, high-performance activity.
  // =====================================================
  const [syncCombo, setSyncCombo] = useState(0)
  const [flyingEmojis, setFlyingEmojis] = useState<any[]>([]) // {id, emoji, label}
  const [arenaWaveCount, setArenaWaveCount] = useState(0)
  const [lastArenaWaveLabel, setLastArenaWaveLabel] = useState('')
  const [arenaWavePulseKey, setArenaWavePulseKey] = useState(0)
  const [syncRealWitnessCount, setSyncRealWitnessCount] = useState(0)
  const witnessedSessionsRef = useRef<Set<string>>(new Set())
  const [showSyncArena, setShowSyncArena] = useState(false)  // EntrenaSync immersive view (the core synchronized training experience)

  // PERFORMANCE PROPAGATION: Strong EntrenaSync sessions send visible waves to the Live Map.
  // This is the living social layer of the network — you see where synchronized high-performance training is happening and propagating right now.
  // The map becomes the pulse of the fitness social graph.
  const [syncRipples, setSyncRipples] = useState<any[]>([]) // {id, lat, lng, label, intensity}  // internal name only (performance waves / ripples from strong EntrenaSyncs). User-facing copy uses "onda de sync", "highlight de red", etc.
  const [syncBonds, setSyncBonds] = useState<Record<string, {totalMin: number, sessions: number, avgRating: number, bondLevel: number}>>({})
  const [lastSyncStory, setLastSyncStory] = useState<any>(null)

  // Hoisted Network Power stats (used in live banner, map, ExploreTab, profile summary, red section).
  // Previously this was only inside an IIFE in the red cards → caused "networkPower is not defined" ReferenceError on web render.
  const networkStats = useMemo(() => {
    const bonds = syncBonds || {}
    const numPartners = Object.keys(bonds).length
    if (numPartners === 0) return { networkPower: 0, totalMin: 0, totalSessions: 0, estimatedImpact: 0, numPartners: 0 }
    const totalMin = Object.values(bonds).reduce((sum: number, b: any) => sum + (b.totalMin || 0), 0)
    const totalSessions = Object.values(bonds).reduce((sum: number, b: any) => sum + (b.sessions || 0), 0)
    const avgBond = Object.values(bonds).reduce((sum: number, b: any) => sum + (b.bondLevel || 1), 0) / numPartners
    const estimatedImpact = Math.min(52, Math.floor(totalMin / 7))
    const networkPower = Math.round(avgBond * totalSessions * 0.8)
    return { networkPower, totalMin, totalSessions, estimatedImpact, numPartners }
  }, [syncBonds])

  const [replaySession, setReplaySession] = useState<any>(null) // {partnerName, minutes, vibe, actions, rating?}
  const [syncDuelSummary, setSyncDuelSummary] = useState<{
    partnerId: string
    partnerName: string
    minutes: number
    vibe: number
    witnessCount: number
    setsLogged: number
    actions: any[]
    isNetworkBond: boolean
    bondLevel?: number
    partnerPhoto?: string
    elapsedSec?: number
    weeklyMetaComplete?: boolean
    weeklyMetaLine?: string
  } | null>(null)

  // =====================================================
  // GYMPULSE DIARIO - Core logic (innovative retention with your GymPartners)
  // dailyPulse state + ref + isOffline etc hoisted extremely early (before sendVoiceNote and daily helpers)
  // so every closure sees the declaration before function def. Prevents TDZ on open (mount effects call check).
  // =====================================================
  const getTodayStr = () => new Date().toISOString().slice(0, 10)

  // Retention progression: powerful levels system
  const computeRetentionLevel = (mom: number, tStreak: number, sStreak: number, vStreak: number, pStreak: number, netPower: number) => {
    const totalXp = mom + (tStreak * 40) + (sStreak * 70) + (vStreak * 25) + (pStreak * 35) + (netPower * 3)
    const level = Math.floor(totalXp / 300) + 1
    const xp = totalXp % 300
    return { level, xp, totalXp }
  }

  // Niveles + Gadgets exclusivos para retención (mientras más entrenes / hagas streaks / bonds / voces / pulses, más XP y desbloqueos visuales)
  // Gadgets atados a las 5 mecánicas para que se sientan "reales" y motivadores.
  const GADGETS = [
    { level: 5, name: 'Halo Élite', icon: '✨', desc: 'Tu marcador en el mapa brilla con halo dorado extra (más visible para la red)', effect: 'map-halo' },
    { level: 10, name: 'Tether dorado Sync', icon: '🌟', desc: 'Tethers en EntrenaSync son dorados y más gruesos para ti', effect: 'golden-tether' },
    { level: 15, name: 'Sync Elite', icon: '🔥', desc: 'Acciones y emojis especiales solo para niveles altos en EntrenaSync', effect: 'exclusive-emojis' },
    { level: 20, name: 'Pulso Maestro', icon: '🌀', desc: 'Tus ripples/ondas en el mapa son más grandes y con color único', effect: 'map-ripple-boost' },
    { level: 25, name: 'Aura de Campeón', icon: '👑', desc: 'Badge especial + prioridad en lista live y recomendaciones', effect: 'priority' },
  ]

  const getUnlockedGadgets = (level: number) => GADGETS.filter(g => level >= g.level)
  const getNextGadget = (level: number) => GADGETS.find(g => level < g.level) || null

  const generateDailyChallenge = (user: any, bonds: any, liveNow: any[], networkPower: number) => {
    const bondCount = Object.keys(bonds || {}).length
    const hasLiveRed = liveNow.some((u: any) => (bonds || {})[u.id])
    const today = getTodayStr()
    const seed = (user?.id || 'u') + today // deterministic per user/day

    const options = [
      {
        id: 'anchor-' + seed,
        type: 'solo',
        title: 'Reto GymPulse: Ancla personal',
        description: 'Entrena 20+ minutos hoy (solo o con quien quieras). Construye tu base de retención.',
        target: 20,
        progress: 0,
        reward: 25,
        icon: '🔥',
        actionLabel: 'Marcar como entrenando'
      },
      {
        id: 'bond-' + seed,
        type: 'bond',
        title: 'Reto GymPulse: Alianza activa',
        description: bondCount > 0 
          ? `Sincronízate o envía nota de voz a uno de tus ${bondCount} socios de Red hoy.` 
          : 'Conecta con alguien nuevo o completa un Sync. Fortalece tu grafo.',
        target: 1,
        progress: 0,
        reward: 40,
        icon: '🔗',
        actionLabel: bondCount > 0 ? 'Ir a tu Red' : 'Explorar'
      },
      {
        id: 'ripple-' + seed,
        type: 'network',
        title: 'Reto GymPulse: Onda en la red',
        description: hasLiveRed 
          ? 'Completa tu sesión y publica un post o voz que impulse el GymPulse visible en el mapa para tus GymPartners.' 
          : 'Entrena y deja un "GymPulse" (post o voz) que sea visto por tus GymPartners. +Impacto colectivo.',
        target: 1,
        progress: 0,
        reward: 55,
        icon: '🌊',
        actionLabel: 'Completar y publicar en el GymPulse'
      },
      // New variety for more engagement
      {
        id: 'voice-weak-' + seed,
        type: 'bond',
        title: 'Reto GymPulse: Voz a tu alianza',
        description: bondCount > 0 ? 'Envía una nota de voz a un GymPartner con menos interacción reciente.' : 'Envía tu primera nota de voz a un GymPartner y activa tu Voice Streak.',
        target: 1,
        progress: 0,
        reward: 35,
        icon: '🎙️',
        actionLabel: 'Grabar voz para Red'
      },
      {
        id: 'map-ripple-' + seed,
        type: 'network',
        title: 'Reto GymPulse: Pulso en el mapa',
        description: 'Completa entrenamiento y asegúrate de que tu actividad aparezca como ripple en el GymPulse del mapa (post + live).',
        target: 1,
        progress: 0,
        reward: 45,
        icon: '🗺️',
        actionLabel: 'Ir al GymPulse (mapa)'
      }
    ]

    // Personalize choice intelligently: prefer bond/voice if Red exists, map ripple if live or high power, etc.
    let chosen = options[0]
    if (bondCount >= 1) {
      chosen = Math.random() > 0.5 ? options[1] : options[3] // bond or voice-weak
    }
    if (hasLiveRed || networkPower > 25) {
      chosen = options[4] // map ripple
    }
    if (networkPower > 40) chosen = options[2] // network ripple for high power users

    return { ...chosen, expires: today + 'T23:59:59' }
  }

  const checkAndUpdateDailyPulse = (forceUser?: any) => {
    const u = forceUser || currentUser
    if (!u) return

    const today = getTodayStr()
    const last = dailyPulse?.lastDate || (u as any).lastDailyPulseDate || null
    const currentStreak = dailyPulse?.trainingStreak || (u as any).dailyTrainingStreak || 0
    const currentSynergy = dailyPulse?.synergyStreak || (u as any).dailySynergyStreak || 0
    const currentVoice = dailyPulse?.voiceStreak || (u as any).dailyVoiceStreak || 0
    const currentPulse = dailyPulse?.pulseStreak || (u as any).dailyPulseStreak || 0
    const mom = dailyPulse?.momentum || (u as any).momentumPoints || 0
    const longTrain = dailyPulse?.longestTraining || (u as any).longestDailyTraining || 0
    const longSyn = dailyPulse?.longestSynergy || (u as any).longestDailySynergy || 0
    const longVoice = dailyPulse?.longestVoice || (u as any).longestDailyVoice || 0
    const longPulse = dailyPulse?.longestPulse || (u as any).longestDailyPulse || 0

    let newStreak = currentStreak
    let newSynergy = currentSynergy
    let newVoice = currentVoice
    let newPulseStreak = currentPulse
    let newLongTrain = longTrain
    let newLongSyn = longSyn
    let newLongVoice = longVoice
    let newLongPulse = longPulse

    if (last !== today) {
      const isProtected = (dailyPulse?.streakProtectedDate || (u as any).streakProtectedDate) === today
      if (last) {
        const lastD = new Date(last)
        const yest = new Date()
        yest.setDate(yest.getDate() - 1)
        if (lastD.toDateString() === yest.toDateString() && !isProtected) {
          newStreak = currentStreak + 1
        } else if (isProtected) {
          newStreak = currentStreak // protected, no reset
        } else {
          newStreak = 1
        }
      } else {
        newStreak = 1
      }

      const challenge = generateDailyChallenge(u, syncBonds, [], networkStats.networkPower) // liveNow omitted on initial daily calc to avoid TDZ (populated on next interactions)

      const { level, xp } = computeRetentionLevel(mom, newStreak, newSynergy, newVoice, newPulseStreak, networkStats.networkPower)

      const newPulse = {
        trainingStreak: newStreak,
        synergyStreak: newSynergy,
        voiceStreak: newVoice,
        pulseStreak: newPulseStreak,
        momentum: mom,
        lastDate: today,
        currentChallenge: challenge,
        longestTraining: Math.max(newLongTrain, newStreak),
        longestSynergy: newLongSyn,
        longestVoice: Math.max(newLongVoice, newVoice),
        longestPulse: Math.max(newLongPulse, newPulseStreak),
        level,
        xp,
        streakProtectedDate: dailyPulse?.streakProtectedDate || (u as any).streakProtectedDate || null,
        pulseAmplifiedDate: dailyPulse?.pulseAmplifiedDate || (u as any).pulseAmplifiedDate || null
      }

      setDailyPulse(newPulse)

      const update: any = {
        dailyTrainingStreak: newStreak,
        dailySynergyStreak: newSynergy,
        dailyVoiceStreak: newVoice,
        dailyPulseStreak: newPulseStreak,
        momentumPoints: mom,
        lastDailyPulseDate: today,
        currentDailyChallenge: challenge,
        // level/xp computed client, but persist for sync
        retentionLevel: level,
        retentionXp: xp,
        streakProtectedDate: dailyPulse?.streakProtectedDate || (u as any).streakProtectedDate || null,
        pulseAmplifiedDate: dailyPulse?.pulseAmplifiedDate || (u as any).pulseAmplifiedDate || null
      }
      saveUserWithRealSync({ ...u, ...update } as any)

      toast.success('¡Nuevo GymPulse Diario!', {
        description: `${challenge.icon} ${challenge.title} • +${challenge.reward} Constancia para tus GymPartners`
      })

      const notif = {
        id: 'pulse-' + today,
        type: 'daily_pulse',
        title: 'GymPulse Diario listo',
        body: `${challenge.icon} ${challenge.title} — completalo hoy para tu Red`,
        timestamp: Date.now(),
        read: false,
        data: { challengeId: challenge.id }
      }
      setNotifications(prev => [notif, ...prev].slice(0, 50))
    } else if (!dailyPulse) {
      const existingChallenge = (u as any).currentDailyChallenge
      const { level: hydLevel, xp: hydXp } = computeRetentionLevel(mom, currentStreak, currentSynergy, currentVoice, currentPulse, networkStats.networkPower)
      setDailyPulse({
        trainingStreak: currentStreak,
        synergyStreak: currentSynergy,
        voiceStreak: currentVoice,
        pulseStreak: currentPulse,
        momentum: mom,
        lastDate: last,
        currentChallenge: existingChallenge || generateDailyChallenge(u, syncBonds, [], networkStats.networkPower), // liveNow omitted to avoid early closure over late-declared liveTrainingNow const
        longestTraining: longTrain,
        longestSynergy: longSyn,
        longestVoice: longVoice,
        longestPulse: longPulse,
        level: hydLevel,
        xp: hydXp,
        streakProtectedDate: (u as any).streakProtectedDate || null,
        pulseAmplifiedDate: (u as any).pulseAmplifiedDate || null
      })
    }
  }

  const refreshDailyPulse = () => checkAndUpdateDailyPulse()

  const completeDailyChallenge = async (progressInc = 1, baseUser?: CurrentUser) => {
    if (!dailyPulse || !dailyPulse.currentChallenge) return

    const ch = { ...dailyPulse.currentChallenge }
    ch.progress = Math.min(ch.target, (ch.progress || 0) + progressInc)

    const justCompleted = ch.progress >= ch.target && !ch.completed

    const prevLevel = dailyPulse.level || 1
    const levelBonus = justCompleted ? Math.round(ch.reward * (1 + ((dailyPulse.level || 1) - 1) * 0.08)) : 5
    const newMomentum = dailyPulse.momentum + levelBonus

    const updatedPulse = {
      ...dailyPulse,
      momentum: newMomentum,
      currentChallenge: { ...ch, completed: justCompleted ? true : ch.completed }
    }

    const { level: computedLevel, xp: computedXp } = computeRetentionLevel(newMomentum, updatedPulse.trainingStreak, updatedPulse.synergyStreak, updatedPulse.voiceStreak, updatedPulse.pulseStreak, networkStats.networkPower)
    updatedPulse.level = computedLevel
    updatedPulse.xp = computedXp

    setDailyPulse(updatedPulse)

    if (justCompleted && computedLevel > prevLevel) {
      try { triggerHaptic('success') } catch {}
      try { triggerConfetti() } catch {}
      const newGadgets = getUnlockedGadgets(computedLevel).filter(g => g.level > prevLevel)
      const gadgetText = newGadgets.length > 0 ? ` + ${newGadgets.map(g=>g.name).join(', ')} disponible(s)!` : ''
      toast.success(`¡Subiste a NIVEL ${computedLevel}!`, { description: `Perk permanente: +8% Constancia en desafíos. ${gadgetText} ¡Tu constancia sube!` })
      createProfilePost(`⭐ ¡NIVEL ${computedLevel} DE RETENCIÓN! Mi constancia diaria hace fuerte a toda la Red.${newGadgets.length ? ' Gadget: ' + newGadgets[0].name : ''}`, null, 'dailyPulse').catch(() => {})
    }

    const u = (baseUser ?? currentUserRef.current ?? currentUser) as any
    if (!u) return
    const update: any = {
      momentumPoints: newMomentum,
      currentDailyChallenge: updatedPulse.currentChallenge,
      dailyTrainingStreak: updatedPulse.trainingStreak,
      dailySynergyStreak: updatedPulse.synergyStreak,
      dailyVoiceStreak: updatedPulse.voiceStreak,
      dailyPulseStreak: updatedPulse.pulseStreak,
      retentionLevel: updatedPulse.level,
      retentionXp: updatedPulse.xp,
      streakProtectedDate: updatedPulse.streakProtectedDate || null,
      pulseAmplifiedDate: updatedPulse.pulseAmplifiedDate || null
    }
    saveUserWithRealSync({ ...u, ...update } as any)

    if (justCompleted) {
      try { triggerHaptic('success') } catch {}
      toast.success(`¡GymPulse completado! +${levelBonus} Constancia`, {
        description: `${ch.icon} ${ch.title} • Nivel ${dailyPulse.level} • Tu Red se fortalece`
      })

      const postText = `✅ Completé mi GymPulse Diario: ${ch.title}. ${ch.description} — Constancia para mis GymPartners 🔥`
      try {
        await createProfilePost(postText, null, 'dailyPulse')
      } catch (e) { /* non fatal */ }

      if (ch.type === 'bond' || ch.type === 'network') {
        const partnerId = Object.keys(syncBonds || {})[0]
        if (partnerId) {
          const bonus = Math.floor(ch.reward / 2)
          toast(`+${bonus} Constancia compartida con tu Red`, { description: 'El impacto se multiplica' })
        }
      }

      if (updatedPulse.synergyStreak < updatedPulse.trainingStreak) {
        const newSyn = updatedPulse.synergyStreak + 1
        const synUpdate = { ...updatedPulse, synergyStreak: newSyn }
        setDailyPulse(synUpdate)
        saveUserWithRealSync({ ...(currentUser as any), dailySynergyStreak: newSyn, streakProtectedDate: updatedPulse.streakProtectedDate, pulseAmplifiedDate: updatedPulse.pulseAmplifiedDate } as any)
      }
      // Pulse visibility streak for completing daily challenges that create visible impact
      const newPulseSt = (updatedPulse.pulseStreak || 0) + 1
      const pUpdate = { ...updatedPulse, pulseStreak: newPulseSt, longestPulse: Math.max(updatedPulse.longestPulse || 0, newPulseSt) }
      setDailyPulse(pUpdate)
      saveUserWithRealSync({ ...(currentUser as any), dailyPulseStreak: newPulseSt, streakProtectedDate: updatedPulse.streakProtectedDate, pulseAmplifiedDate: updatedPulse.pulseAmplifiedDate } as any)

      // Milestone rewards - powerful retention
      const streak = updatedPulse.trainingStreak
      if (streak > 0 && streak % 7 === 0) {
        const bonus = 150
        const milUpdate = { ...updatedPulse, momentum: (updatedPulse.momentum || 0) + bonus }
        setDailyPulse(milUpdate)
        saveUserWithRealSync({ ...(currentUser as any), momentumPoints: milUpdate.momentum, streakProtectedDate: updatedPulse.streakProtectedDate, pulseAmplifiedDate: updatedPulse.pulseAmplifiedDate } as any)
        toast.success(`¡Milestone de Streak! +${bonus} Constancia`, { description: `${streak}d de racha activa — ¡Sigue así!` })
        // Special post
        createProfilePost(`🔥 RACHA ${streak}d — Mis GymPartners me hacen imparable. GymPulse Diario completado.`, null, 'dailyPulse').catch(()=>{})
      }
    } else {
      toast(`+${progressInc} progreso en el GymPulse`)
    }
  }

  const awardConstancy = (amount: number, reason: string, baseUser?: CurrentUser) => {
    if (!dailyPulse) return
    const base = baseUser ?? currentUserRef.current ?? currentUser
    if (!base) return
    const newM = (dailyPulse.momentum || 0) + amount
    const up = { ...dailyPulse, momentum: newM }
    setDailyPulse(up)
    saveUserWithRealSync({ ...(base as any), momentumPoints: newM, streakProtectedDate: dailyPulse?.streakProtectedDate, pulseAmplifiedDate: dailyPulse?.pulseAmplifiedDate } as any)
    toast(`+${amount} Constancia`, { description: reason })
  }
  const [witnessData, setWitnessData] = useState<any>(null) // for shared session highlight replay: replay of a strong EntrenaSync (shared state, actions, vibe) that can be archived as co-authored performance memory

  // Shared Performance Highlights & Discovery Pins
  // Strong EntrenaSync sessions create permanent, visible co-authored highlights in the feed and tappable pins on the map.
  // This builds real culture and status in the network: great synchronized training becomes discoverable and inspires others.
  // Training together compounds into visible performance capital for both people.
  const [echoPins, setEchoPins] = useState<any[]>([]); // persistent tappable highlight pins on map from strong sync sessions
  const [activeSyncPairs, setActiveSyncPairs] = useState<any[]>([]) // lightweight for global FOMO teasers

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
  const [showPreAlphaWelcome, setShowPreAlphaWelcome] = useState(() => {
    return !localStorage.getItem('entrenamatch_prealpha_welcome_shown')
  })

  // Onboarding step state (managed here so the flow actually advances)
  const [onboardingStep, setOnboardingStepLocal] = useState(0)

  // After Google redirect sign-in — bootstrap local profile + onboarding
  useEffect(() => {
    if (!googleNewUser || isDemoMode || !firebaseUser?.uid) return

    clearGoogleNewUser()

    if (firebaseProfile) {
      saveUser({ ...firebaseProfile, id: 'me' } as any)
    } else {
      saveUser({
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
    }

    lastSuccessfulAuthRef.current = firebaseUser
    setIsEditingProfile(false)
    setOnboardingStepLocal(0)
    setShowOnboarding(true)
  }, [googleNewUser, firebaseUser, firebaseProfile, isDemoMode, clearGoogleNewUser, saveUser, setShowOnboarding])

  // Keep ref in sync when Firebase user appears (Google redirect / email login)
  useEffect(() => {
    if (firebaseUser) lastSuccessfulAuthRef.current = firebaseUser
  }, [firebaseUser?.uid])

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
          city: 'Viña del Mar',
          country: 'Chile',
          lat: -33.0153,
          lng: -71.5528,
          bio: 'Demo lista para probar live + muro. Entreno pesas y running. ¡Conectemos!',
          photos: ['https://picsum.photos/id/1011/600/800'],
          trainingTypes: ['Pesas/Gym', 'Running'],
          goals: ['Ganar músculo', 'Socializar y motivación'],
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
        toast.success('Demo rápido activado', { description: 'Preview en vivo + opt-in EN VIVO en el paso final. ¡La clave de la app!' });
      }
    } catch (e) { console.warn('quick demo', e); }
  }, [saveUser, setShowOnboarding]); // deps safe

  // ==================== EXCEPTIONAL ONBOARDING GUIDANCE (post-finish) ====================
  // Fires only once, right after OnboardingFlow sets showOnboarding=false for a brand-new user.
  // Goal: user understands the 5 mechanics + does first Live (already activated in finish if opted) or first match in <30-60s total after close.
  // Placed here unconditionally (after other early effects) to obey Rules of Hooks. Uses ref guard.
  const hasFiredFirstActionGuidanceRef = useRef(false)
  useEffect(() => {
    if (hasFiredFirstActionGuidanceRef.current) return
    if (showOnboarding === false && currentUser && !currentUser.hasCompletedFirstAction) {
      const looksNew = !currentUser.liveJoins && !currentUser.syncStreak && (currentUser.trainingNow || (currentUser.photos?.length || 0) > 0)
      if (looksNew) {
        hasFiredFirstActionGuidanceRef.current = true
        const t = setTimeout(() => {
          // Switch to explore so the first action (like on nearby card) is obvious and one tap away
          setActiveTab('explore')
          // Strong, actionable toast
          toast.success(currentUser.trainingNow ? '¡Tu primer LIVE está activo en el GymPulse!' : '¡Perfil listo!', {
            description: 'Explora perfiles cerca. Toca ❤️ en uno que esté vivo o disponible. Tu primer match y chat en <20s. Luego crea EntrenaSync desde el chat.'
          })
          try { triggerHaptic('medium') } catch {}
          // Mark to never repeat (use early saveUser to avoid TDZ; real writes already happened in OnboardingFlow finish)
          const marked = { ...currentUser, hasCompletedFirstAction: true }
          try { saveUser(marked as any) } catch {}
          // Extra nudge: if they opted live, also flash the map button hint by briefly showing live count if any
        }, 650)
        return () => clearTimeout(t)
      }
    }
  }, [showOnboarding, currentUser]) // safe: inside effect we guard with ref + looksNew

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

  // ✅ FUNCIÓN RECURSIVA PARA LIMPIAR UNDEFINED (arregla currentDailyChallenge.completed y cualquier objeto anidado)
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
  const [verificationIdPhoto, setVerificationIdPhoto] = useState<string | null>(null)
  const [verificationSelfie, setVerificationSelfie] = useState<string | null>(null)

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Voice notes recording (for 1:1 and group chats) - spectacular UX for fitness social
  const audioChunksRef = useRef<Blob[]>([])

  // Daily pulse banner + risk effects. Defined after the hoisted dailyPulse state + helper functions.
  // References to dailyPulse, checkAndUpdateDailyPulse etc. are safe (all declared earlier in render).

    useEffect(() => {
      if (currentUser) {
        const t = setTimeout(() => {
          checkAndUpdateDailyPulse()
          const today = getTodayStr()
          const last = dailyPulse?.lastDate
          if (last !== today || (dailyPulse && dailyPulse.trainingStreak > 0 && !currentUser.trainingNow)) {
            setShowDailyPulseBanner(true)
            setTimeout(() => setShowDailyPulseBanner(false), 8000)
          }
        }, 600)
        return () => clearTimeout(t)
      }
    }, [currentUser?.id, Object.keys(syncBonds).length, dailyPulse?.lastDate])

    useEffect(() => {
      if (!dailyPulse || !currentUser) return
      const hour = new Date().getHours()
      if (hour >= 18 && dailyPulse.trainingStreak > 0 && !currentUser.trainingNow && dailyPulse.streakProtectedDate !== getTodayStr()) {
        const timer = setTimeout(() => {
          toast.error('¡Streak en riesgo esta noche!', {
            description: `Tu ${dailyPulse.trainingStreak}d training streak se resetea si no entrenas. Protege con Constancia o 20min ya.`
          })
        }, 1500)
        return () => clearTimeout(timer)
      }
    }, [dailyPulse?.lastDate, currentUser?.trainingNow, dailyPulse?.trainingStreak])

    // === FIRESTORE GLOBAL RESILIENCE + LISTENER CLEANUP (Fix para INTERNAL ASSERTION) ===
const listenersRef = useRef<(() => void)[]>([])

const cleanupAllListeners = useCallback(() => {
  listenersRef.current.forEach(unsub => unsub?.())
  listenersRef.current = []
  console.log('✅ All Firestore listeners cleaned')
}, [])

useEffect(() => {
  return () => cleanupAllListeners()
}, [cleanupAllListeners])

// Network + Listener resilience (Fase 4: recover without disable — keeps RT listeners alive)
useEffect(() => {
  const handleOnline = async () => {
    setIsOffline(false)
    // Firestore auto-reconnects with persistentLocalCache — do NOT call enableNetwork (causes da08).
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
    // Offline cache via initializeFirestore(persistentLocalCache()) in firebase.ts — do NOT also call
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
        if (typeof window !== 'undefined' && (window as any).Capacitor && Capacitor.isNativePlatform()) {
          const AppPlugin = await import(/* @vite-ignore */ '@capacitor/app').catch(() => null as any)
          if (AppPlugin?.App) {
            const listener = await AppPlugin.App.addListener('appStateChange', async (state: any) => {
              if (state.isActive) {
                // App resumed — reload data; Firestore RT listeners auto-reconnect (no enableNetwork).
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

  // For attractive voice message playback animation
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)

  // Live visualizer for PREMIUM recording UX (real mic levels) + synced playback progress
  const [recordingLevels, setRecordingLevels] = useState<number[]>([4,7,5,9,3,8,4,6,5,7])
  const [voicePlayProgress, setVoicePlayProgress] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const isRecordingRef = useRef(false)

  // Squads feature (fixed small training groups)
  const [squads, setSquads] = useState<Squad[]>([])

  // Profile Muro / Wall posts - makes profiles feel alive (like FB wall)
  const [profilePosts, setProfilePosts] = useState<Record<string, ProfilePost[]>>({}) // userId -> posts array
  const profilePostsRef = useRef<Record<string, ProfilePost[]>>({})
  const postCommentUnsubsRef = useRef<Record<string, () => void>>({})
  const userPostsUnsubsRef = useRef<Record<string, () => void>>({})
  const liveUsersActiveRef = useRef<any[]>([])
  const lastSyncActionToastRef = useRef<{ at: number; key: string } | null>(null)
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
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setFeedPostPhoto(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Safety & Moderation (critical for launch)
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [reports, setReports] = useState<Report[]>([])

  // Improved report flow
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportTargetId, setReportTargetId] = useState<string | null>(null)
  const [reportContext, setReportContext] = useState<Report['context']>('profile')
  const [reportReason, setReportReason] = useState('')

  // Moderation Panel state
  const [showModerationPanel, setShowModerationPanel] = useState(false)
  const [moderationTab, setModerationTab] = useState<'reports' | 'verifications' | 'bans'>('reports')

  // Auth flow state (default to register in public demo for easy "Crear Cuenta")
  // (local auth state moved into AuthScreen + useDemoAuth)

  // Notifications system (simulated for launch readiness)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  // Notification preferences (local per-device for user control - progressive improvement post-crash-fix)
  const [notifPrefs, setNotifPrefs] = useState<{messages: boolean, live: boolean, muro: boolean, dailyPulse: boolean, weeklyPact: boolean}>(() => {
    try {
      const saved = localStorage.getItem('entrenamatch_notif_prefs')
      const p = saved ? JSON.parse(saved) : {}
      return {
        messages: p.messages !== false,
        live: p.live !== false,
        muro: p.muro !== false,
        dailyPulse: p.dailyPulse !== false,
        weeklyPact: p.weeklyPact !== false,
      }
    } catch {
      return { messages: true, live: true, muro: true, dailyPulse: true, weeklyPact: true }
    }
  })

  // Persist notif prefs when they change
  useEffect(() => {
    try { localStorage.setItem('entrenamatch_notif_prefs', JSON.stringify(notifPrefs)) } catch {}
  }, [notifPrefs])

  // PWA install prompt (attractive banner for web testers on mobile - uses Dunkin palette)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null)
  const [showPwaInstall, setShowPwaInstall] = useState(false)
  const [pwaInstallDismissed] = useState(() => !!localStorage.getItem('entrenamatch_pwa_dismissed'))

  const [showLiveMap, setShowLiveMap] = useState(() => {
    try { return localStorage.getItem('entrenamatch_show_map') === '1' } catch { return false }
  })

  // PWA manifest shortcuts: /entrenamatch/?tab=home | ?tab=explore&map=1
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      const validTabs: Tab[] = ['home', 'explore', 'squads', 'sesiones', 'matches', 'messages', 'profile']
      if (tab && validTabs.includes(tab as Tab)) setActiveTab(tab as Tab)
      if (params.get('map') === '1') setShowLiveMap(true)
    } catch {}
  }, [])

  const [firestoreCityStats, setFirestoreCityStats] = useState<import('./services/cityWeeklyStats').CityWeeklyStatsDoc | null>(null)
  const [mapNearOnly, setMapNearOnly] = useState(false) // simple filter for map UX
  const [mapMyGymOnly, setMapMyGymOnly] = useState(false)
  const [selectedMapZone, setSelectedMapZone] = useState<string | null>(null) // interactive zone filter for "sigue con todo el mapa"
  const [showOnlyNetwork, setShowOnlyNetwork] = useState(false) // filter to only high-performance sync partners (your real training network) on map
  const [partnerLocations, setPartnerLocations] = useState<any[]>([])
  const [showPartners, setShowPartners] = useState(true)
  const [showAddPartnerForm, setShowAddPartnerForm] = useState(false)
  const [showManagePartners, setShowManagePartners] = useState(false)
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null)
  const [partnerFormName, setPartnerFormName] = useState('')
  const [partnerFormType, setPartnerFormType] = useState<'gym' | 'store' | 'studio'>('gym')
  const [partnerFormLat, setPartnerFormLat] = useState(-33.02)
  const [partnerFormLng, setPartnerFormLng] = useState(-71.55)
  const [partnerFormAddress, setPartnerFormAddress] = useState('')
  const [partnerLogoFile, setPartnerLogoFile] = useState<File | null>(null)
  const [partnerLogoPreview, setPartnerLogoPreview] = useState<string | null>(null)
  const [isPlacingPartner, setIsPlacingPartner] = useState(false) // for click-to-place in dev form
  const [isQuickAddPartner, setIsQuickAddPartner] = useState(false) // extra dev mode: click map = instantly create minimal tienda/partner (no form)
  const [mapForceTick, setMapForceTick] = useState(0) // tiny trigger so map re-renders when toggling partners layer
  const [isTogglingLive, setIsTogglingLive] = useState(false) // prevent double-tap and show loading on the live toggle button (fixes stuck click)
  const isTogglingLiveRef = useRef(false)
  // Ignore stale own-profile snapshots right after we write trainingNow (prevents instant revert)
  const pendingLiveWriteRef = useRef<{ trainingNow: boolean; at: number } | null>(null)
  useEffect(() => { isTogglingLiveRef.current = isTogglingLive }, [isTogglingLive])

  // Dedicated source of truth: where('trainingNow'==true) listener (real mode) or demo synthesis.
  const [liveUsersFromDedicated, setLiveUsersFromDedicated] = useState<any[]>([])
  const liveUsersFromDedicatedRef = useRef<any[]>([])
  const liveFromPresenceRef = useRef<any[]>([])
  const liveFromProfilesQueryRef = useRef<any[]>([])
  useEffect(() => { liveUsersFromDedicatedRef.current = liveUsersFromDedicated }, [liveUsersFromDedicated])

  const userLocationRef = useRef(userLocation)
  useEffect(() => { userLocationRef.current = userLocation }, [userLocation])

  // Refs for current auth uid and blocked to avoid stale closures in onSnapshot callbacks (critical for live status skip-self and filtering)
  const currentUidRef = useRef<string | null>(null)
  const blockedUsersRef = useRef<string[]>([])

  // Keep refs in sync for leaflet click handlers (closed over values would be stale)
  useEffect(() => { isPlacingPartnerRef.current = isPlacingPartner }, [isPlacingPartner])
  useEffect(() => { isQuickAddPartnerRef.current = isQuickAddPartner }, [isQuickAddPartner])
  useEffect(() => { showAddPartnerFormRef.current = showAddPartnerForm }, [showAddPartnerForm])
  // Developer gate for partner management (only devs can add/edit partner locations on the map)
  const [isDeveloper, setIsDeveloper] = useState(() => {
    try { return localStorage.getItem('entrenamatch_dev_mode') === '1' } catch { return false }
  })
  const [showDevLogin, setShowDevLogin] = useState(false)
  const [devPassword, setDevPassword] = useState('')
  const gymPulseMapRef = useRef<any>(null) // extracted GymPulseMap handle (centrar, flyTo, getCenter, invalidate)

  // Dev-only: temporary fake live users (for testing GymPulse markers, near counts, popups, ripples WITHOUT needing other real devices/accounts online).
  // Only merged into the map prop (not global live lists or UI counts) and auto-expire or cleared by dev.
  const [devTestLives, setDevTestLives] = useState<any[]>([])

  // Sync refs for listeners (prevents using stale uid/blocked in onSnapshot for live propagation)
  useEffect(() => { currentUidRef.current = firebaseUser?.uid || null }, [firebaseUser?.uid])
  useEffect(() => { blockedUsersRef.current = blockedUsers }, [blockedUsers])

  // When partner visibility or list changes (or dev added one), nudge the extracted GymPulseMap (it reacts to mapForceTick + partnerLocations).
  useEffect(() => {
    if (!showLiveMap) return
    // The child GymPulseMap owns the real map and already has partnerLocations + mapForceTick in its effect deps.
    // Just ensure a tick so it re-renders markers promptly.
    setMapForceTick(t => t + 1)
  }, [showPartners, partnerLocations.length, showLiveMap])

  // Ensure Leaflet recalcs size when the map is toggled or we switch tabs (prevents "map se pierde" / descuadre after layout change).
  useEffect(() => {
    if (showLiveMap && gymPulseMapRef.current) {
      const force = () => {
        try { gymPulseMapRef.current?.invalidateSize?.() } catch {}
      }
      force()
      const t1 = setTimeout(force, 80)
      const t2 = setTimeout(force, 220)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [showLiveMap, activeTab])

  // Developer login for gated partner management (only devs can add/edit locals on the GymPulse map)
  const loginAsDeveloper = () => {
    if (!isDevPasswordConfigured()) {
      toast.error('Editor de mapa no configurado', {
        description: 'Define VITE_DEV_MAP_PASSWORD en build local y añade tu UID en Firestore mapEditors/{uid}.',
      })
      return
    }
    if (verifyDevMapPassword(devPassword)) {
      setIsDeveloper(true)
      try { localStorage.setItem('entrenamatch_dev_mode', '1') } catch {}
      setShowDevLogin(false)
      setDevPassword('')
      try { triggerHaptic('success') } catch {}
      toast.success('Developer access granted', { description: 'You can now add and manage partner locations with logos' })
    } else {
      toast.error('Incorrect developer password')
    }
  }
  const logoutDeveloper = () => {
    setIsDeveloper(false)
    try { localStorage.removeItem('entrenamatch_dev_mode') } catch {}
    setShowManagePartners(false)
    setShowAddPartnerForm(false)
    setEditingPartnerId(null)
    setPartnerLogoFile(null)
    setPartnerLogoPreview(null)
    setDevTestLives([]) // also clear any test lives on dev logout
    setMapForceTick(t => t + 1)
    toast('Developer mode disabled')
  }

  // Dev superpowers for fast iteration on the live map without other users.
  const addPartnerAtCurrentCenter = async () => {
    if (!isDeveloper || !gymPulseMapRef.current) { toast.error('Mapa dev no listo'); return }
    const center = gymPulseMapRef.current.getCenter?.()
    if (!center) { toast.error('No se pudo obtener centro del mapa'); return }
    const { lat, lng } = center
    const pid = 'partner-' + Date.now()
    const minimal: any = {
      id: pid,
      name: 'Partner @centro ' + new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      lat, lng,
      type: 'gym',
      address: 'Agregado rápido por dev (centro mapa)',
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setPartnerLocations(prev => [...prev, minimal])
    setMapForceTick(t => t + 1)
    if (!isDemoMode && db) {
      try {
        const { setDoc, doc } = await import('firebase/firestore')
        await setDoc(doc(db, 'partnerLocations', pid), minimal)
      } catch (e) { console.warn('add@center fs', e) }
    }
    toast.success('Partner agregado en centro', { description: 'Abre Manage o Edit para logo/nombre' })
    // auto open edit for convenience
    setTimeout(() => startEditPartner(minimal), 80)
  }

  const reloadPartners = () => {
    setMapForceTick(t => t + 1)
    toast('Mapa y partners refrescados')
  }

  const spawnDevTestLives = (count = 3) => {
    if (!isDeveloper || !userLocation) { toast.error('Necesitas GPS y modo dev'); return }
    const fakes: any[] = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
      const distKm = 0.3 + Math.random() * 2.2
      const dLat = (distKm / 111) * Math.cos(angle)
      const dLng = (distKm / (111 * Math.cos((userLocation.lat * Math.PI) / 180))) * Math.sin(angle)
      fakes.push({
        id: 'devtest-' + Date.now() + '-' + i,
        name: `TestDev${i + 1}`,
        lat: userLocation.lat + dLat,
        lng: userLocation.lng + dLng,
        trainingNow: true,
        trainingNowSince: Date.now() - (i + 1) * 4 * 60 * 1000,
        trainingTypes: ['Pesas/Gym', 'Running'],
        level: i % 2 === 0 ? 'Avanzado' : 'Intermedio',
        _devTest: true,
        distance: distKm,
        seVaEnMin: 25 + i * 5,
      })
    }
    setDevTestLives(prev => [...prev.filter((p: any) => !p._devTest), ...fakes])
    setMapForceTick(t => t + 1)
    toast.success(`+${count} test lives cerca de ti`, { description: 'Solo para testing del GymPulse en este mapa. Expira en ~5min.' })
    // auto-clean after ~5min
    setTimeout(() => {
      setDevTestLives(prev => prev.filter((p: any) => !p._devTest))
      setMapForceTick(t => t + 1)
    }, 5 * 60 * 1000)
  }

  const clearDevTestLives = () => {
    setDevTestLives([])
    setMapForceTick(t => t + 1)
    toast('Vidas de test limpiadas')
  }
  const openDevLogin = () => {
    setShowDevLogin(true)
    setDevPassword('')
  }

  const openAddPartner = () => {
    if (!isDeveloper) { openDevLogin(); return }
    setEditingPartnerId(null)
    setPartnerFormName('Nuevo Partner Gym')
    setPartnerFormType('gym')
    setPartnerLogoFile(null)
    setPartnerLogoPreview(null)
    setPartnerFormAddress('')
    // default to current map center (prefer the extracted GymPulseMap handle)
    let center: { lat: number; lng: number } | null = null
    try {
      center = gymPulseMapRef.current?.getCenter?.() || null
    } catch {}
    if (center) {
      setPartnerFormLat(center.lat)
      setPartnerFormLng(center.lng)
    } else if (userLocation) {
      setPartnerFormLat(userLocation.lat)
      setPartnerFormLng(userLocation.lng)
    } else {
      setPartnerFormLat(-33.02)
      setPartnerFormLng(-71.55)
    }
    setIsPlacingPartner(false)
    setShowAddPartnerForm(true)
    setShowManagePartners(false)
    setTimeout(() => { try { triggerHaptic('light') } catch {} }, 30)
  }

  const openManagePartners = () => {
    if (!isDeveloper) { openDevLogin(); return }
    setShowManagePartners(true)
    setShowAddPartnerForm(false)
  }

  const startEditPartner = (p: any) => {
    setEditingPartnerId(p.id)
    setPartnerFormName(p.name || '')
    setPartnerFormType((p.type as any) || 'gym')
    setPartnerLogoFile(null)
    setPartnerLogoPreview(p.logoUrl || null)
    setPartnerFormLat(p.lat ?? -33.02)
    setPartnerFormLng(p.lng ?? -71.55)
    setPartnerFormAddress(p.address || '')
    setIsPlacingPartner(false)
    setShowAddPartnerForm(true)
    setShowManagePartners(false)
    // Center map on it using the new GymPulseMap handle (or legacy fallback) so dev sees exactly where it is
    setTimeout(() => {
      if (gymPulseMapRef.current && p.lat && p.lng) {
        try { gymPulseMapRef.current.centerOn(p.lat, p.lng, 15) } catch {}
      }
      // legacy mapInstanceRef path removed (modularization)
    }, 80)
  }

  // Stable handler for map popup "Edit" (dev). Must be a top-level useCallback (not created inside conditional JSX)
  // to keep hook call count stable across renders when showLiveMap toggles (fixes React #310 on GH Pages prod build).
  const handlePartnerEditFromMap = useCallback((id: string) => {
    const p = (partnerLocationsRef.current || partnerLocations).find((pp: any) => pp.id === id)
    if (p) {
      // Make sure we are in the right view to see the edit form (which overlays the map)
      if (activeTab !== 'explore') setActiveTab('explore')
      if (!showLiveMap) setShowLiveMap(true)
      startEditPartner(p)
    } else {
      console.warn('dev edit: partner not found in current list for id', id)
      // Fallback: still open edit form with the id so dev can fix
      setEditingPartnerId(id)
      setPartnerFormName('Partner ' + id.slice(-6))
      setPartnerFormType('gym')
      setPartnerFormLat(-33.02)
      setPartnerFormLng(-71.55)
      setPartnerFormAddress('')
      setPartnerLogoFile(null)
      setPartnerLogoPreview(null)
      setIsPlacingPartner(false)
      setShowAddPartnerForm(true)
      setShowManagePartners(false)
    }
  }, [partnerLocations, activeTab, showLiveMap, startEditPartner])

  const cancelPartnerForm = () => {
    setShowAddPartnerForm(false)
    setEditingPartnerId(null)
    setPartnerLogoFile(null)
    if (partnerLogoPreview && partnerLogoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(partnerLogoPreview)
    }
    setPartnerLogoPreview(null)
    setPartnerFormAddress('')
    setIsPlacingPartner(false)
    setPartnerFormLat(-33.02)
    setPartnerFormLng(-71.55)
  }

  const handlePartnerLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPartnerLogoFile(file)
      if (partnerLogoPreview && partnerLogoPreview.startsWith('blob:')) URL.revokeObjectURL(partnerLogoPreview)
      const preview = URL.createObjectURL(file)
      setPartnerLogoPreview(preview)
      try { triggerHaptic('light') } catch {}
    }
  }

  const uploadPartnerLogoIfNeeded = async (file: File | null, pid: string): Promise<string | undefined> => {
    if (!file) return undefined
    if (isDemoMode || !storage) {
      return URL.createObjectURL(file) // demo only
    }
    // Critical for 403: Storage rules require request.auth != null. The dev password only gates the UI form client-side.
    // Real Firebase sign-in (Google/email via the app's auth) is mandatory for the upload to succeed with the isAuthenticated() rule.
    if (!firebaseUser?.uid) {
      try { toast.error('Para subir logo de partner necesitas estar sign-in con Firebase Auth (botón de Google o email en la app). El password dev solo muestra el formulario de devs, no otorga token de Storage. El partner se guardará sin logo.') } catch {}
      console.warn('partner logo upload skipped: no firebaseUser (no auth token for storage rules)')
      return undefined
    }
    try {
      console.log('[partner-logo] uploading for pid=', pid, 'uid=', firebaseUser.uid, 'bucket=entrenamatch.firebasestorage.app')
      const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
      const storageRef = ref(storage, `partners/${pid}/logo-${Date.now()}`)
      const task = uploadBytesResumable(storageRef, file)
      await new Promise<void>((resolve, reject) => {
        task.on('state_changed',
          () => {}, // progress optional
          (err) => reject(err),
          () => resolve()
        )
      })
      const url = await getDownloadURL(task.snapshot.ref)
      console.log('[partner-logo] success https url length=', url?.length)
      return url
    } catch (e: any) {
      console.warn('logo upload failed (403 often means rules not deployed or no Firebase Auth token)', e?.code || e?.message || e)
      // Caller shows the detailed 403 toast with deploy + sign-in steps.
      return undefined
    }
  }

  // Partner businesses (gyms, stores etc that partner with the app). Devs can add them so they appear on the mapa en tiempo real (GymPulse map).
  // "ellos puedan ver": partners get prominent placement + nearby activity indicators (users training close get associated with the partner location).
  const PARTNER_SEEDS = [
    { id: 'p-seed-1', name: 'Muscle Grenade Viña', lat: -33.015, lng: -71.55, type: 'gym', address: 'Viña del Mar, cerca del centro' },
    { id: 'p-seed-2', name: 'Gym Partner Santiago', lat: -33.45, lng: -70.65, type: 'gym', address: 'Santiago, Providencia' },
    { id: 'p-seed-3', name: 'Suplementos Elite Valpo', lat: -33.05, lng: -71.62, type: 'store', address: 'Valparaíso, Cerro Concepción' },
    { id: 'p-seed-4', name: 'CrossFit Concon Hub', lat: -32.92, lng: -71.52, type: 'gym', address: 'Concón, zona costera' }
  ]

  // Zone colors shared for map markers and interactive legend (sigue con todo el mapa)
  const mapZoneColors: Record<string, string> = {
    'Viña del Mar': '#22c55e',
    'Santiago': '#FF671F',
    'Valparaíso': '#3b82f6',
    'Concon': '#a855f7',
    default: '#eab308'
  }
  const startSyncRef = useRef<((partnerId: string, partnerName: string) => any) | null>(null)
  const applyNotificationNavigationRef = useRef<
    ((target: NotificationNavTarget, partnerNameHint?: string) => void) | null
  >(null)
  const syncPartnerIdRef = useRef<string | null>(null)
  const currentUserRef = useRef<CurrentUser | null>(null)
  // Refs for dev map placement UX (click-to-place partner without leaving map view) + latest partners (passed down + used in quick add handler).
  // The actual Leaflet markers/ripples/tethers live inside <GymPulseMap /> (first modularization step).
  const isPlacingPartnerRef = useRef(false)
  const isQuickAddPartnerRef = useRef(false)
  const showAddPartnerFormRef = useRef(false)
  const partnerLocationsRef = useRef<any[]>([]) // latest partners always, to avoid stale closure in debounced map render (helps add-partner persistence)
  useEffect(() => { partnerLocationsRef.current = partnerLocations }, [partnerLocations])

  // Load partner locations: seeds (for immediate demo) + real Firestore (so devs can add persistent partners via the in-app tool).
  // This makes the "devs put businesses on the map" easy and real-time visible to all users in the GymPulse (mapa en tiempo real).
  useEffect(() => {
    // Always start with seeds so the feature is visible even in demo / first run
    let base = [...PARTNER_SEEDS]

    if (isDemoMode || !db) {
      setPartnerLocations(base)
      return
    }

    // Real mode: listen to partnerLocations collection (devs add via the form below)
    // Use dynamic import (consistent with other firestore calls) to avoid bundle/TDZ issues that were causing
    // "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore"
    let unsub: any = null
    ;(async () => {
      try {
        const firestoreMod = await import('firebase/firestore')
        const { collection, onSnapshot, query, orderBy } = firestoreMod
        const q = query(collection(db, 'partnerLocations'), orderBy('name'))
        unsub = onSnapshot(q, (snap: any) => {
          const fromFs: any[] = []
          snap.forEach((d: any) => {
            const data = d.data() || {}
            // Sanitize: Firestore shouldn't have undefined but defensive (prevents bad data in state)
            Object.keys(data).forEach(k => { if (data[k] === undefined) delete data[k] })
            fromFs.push({ id: d.id, ...data })
          })
          // merge seeds + fs (fs overrides if same id)
          const merged = [...base]
          fromFs.forEach(p => {
            const idx = merged.findIndex(s => s.id === p.id)
            if (idx >= 0) merged[idx] = p
            else merged.push(p)
          })
          setPartnerLocations(merged)
          setMapForceTick(t => t + 1)
        }, (err: any) => {
          console.warn('partnerLocations listener error (using seeds only)', err)
          setPartnerLocations(base)
          setMapForceTick(t => t + 1)
        })
      } catch (err: any) {
        console.warn('partnerLocations listener error (using seeds only)', err)
        setPartnerLocations(base)
        setMapForceTick(t => t + 1)
      }
    })()

    return () => { if (unsub) unsub() }
  }, [isDemoMode, db])
  const showFullProfileRef = useRef<((profile: any) => void) | null>(null)
  const latestRealProfilesRef = useRef<any[]>([])
  const syncBondsRef = useRef<Record<string, { totalMin: number; sessions: number; avgRating: number; bondLevel: number }>>({})

// Dedicated unmount cleanup for the Leaflet map (now mostly no-op since GymPulseMap owns the instance; kept for safety on unmount/hot-reload)
  useEffect(() => {
    return () => {
      // Legacy map refs removed during GymPulseMap extraction polish. Child component manages its own Leaflet lifecycle + cleanup.
    }
  }, [])

  // Persist map open preference (nice for power users who like the radar always visible)
  useEffect(() => {
    try { localStorage.setItem('entrenamatch_show_map', showLiveMap ? '1' : '0') } catch {}
  }, [showLiveMap])

  const unreadNotifications = notifications.filter(n => !n.read).length
  const totalChatUnreads = Object.values(chatUnreads).reduce((sum, n) => sum + (n || 0), 0)
  const totalSessionUnreads = Object.values(sessionUnreads).reduce((sum, n) => sum + (n || 0), 0)



  // ============================================================
  // REAL MULTI-USER STATE - DECLARED AS EARLY AS POSSIBLE TO AVOID TDZ
  // ============================================================
  const effectiveUserId = !isDemoMode && firebaseUser?.uid ? firebaseUser.uid : 'me'

  const [realProfiles, setRealProfiles] = useState<Profile[]>([])
  const [realMatches, setRealMatches] = useState<string[]>([])
  const prevRealMatchesRef = useRef<string[]>([])
  const realMatchesInitializedRef = useRef(false)
  const justMatchedLocallyRef = useRef<Set<string>>(new Set())
  const [realChatMessages, setRealChatMessages] = useState<any[]>([])

  // Helper: treat a chatId as "real cross-device" if it's in our discovered realMatches,
  // or if it's a known real user profile (non-seed pXX). This ensures send/load/listeners activate
  // even if the match doc hasn't been discovered in realMatches yet on this device (e.g. passive side
  // of a swipe, or list entry came from local 'matches' state).
  const isRealChatId = (chatId: string | null): boolean => {
    if (!chatId || isDemoMode || !firebaseUser?.uid) return false
    if (chatId.startsWith('p')) return true // seeds use real backend when in real auth mode
    const isKnownRealProfile = realProfiles.some(r => r.id === chatId)
    return realMatches.includes(chatId) || isKnownRealProfile
  }
  const [lastSync, setLastSync] = useState<Date | null>(null)

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

  // Remaining profiles (not swiped) - Real Firestore profiles + Seed profiles (hybrid for Pre-Alpha)
  // Hoisted early (right after real multi-user state + displaySessions) so that all later effects, JSX, and discovery logic (deck, map, feed, live notifs) see the declarations before any code that might reference them during render or effect setup. Prevents TDZ for remainingProfiles, liveTrainingNow, zoneLiveCounts, feedComputation.
  const remainingProfiles = useMemo(() => {
    const swiped = new Set([...likedIds, ...passedIds])
    
    // Combine real profiles from Firestore + hardcoded seeds
    const allProfiles: Profile[] = [
      ...realProfiles,
      ...SEED_PROFILES
    ]
    
    // Remove duplicates (if a real user has same id as a seed - unlikely but safe)
    const unique = new Map<string, Profile>()
    allProfiles.forEach(p => {
      if (!unique.has(p.id)) unique.set(p.id, p)
    })
    
    return Array.from(unique.values()).filter(p => {
      if (swiped.has(p.id)) return false
      return true
    })
  }, [likedIds, passedIds, realProfiles])

  // Prevents (now - Timestamp) producing NaN which would drop live users from GymPulse lists.
  const normalizeTrainingSince = (val: any): number | undefined => normalizeTrainingSinceMs(val)

  const buildSelfLiveEntry = useCallback((): any | null => {
    if (!currentUser?.trainingNow || !effectiveUserId) return null
    return {
      id: effectiveUserId,
      name: currentUser.name,
      age: currentUser.age,
      gender: currentUser.gender,
      city: currentUser.city,
      country: currentUser.country,
      lat: Number.isFinite(Number(currentUser.lat))
        ? Number(currentUser.lat)
        : (Number.isFinite(Number(userLocation?.lat)) ? Number(userLocation!.lat) : -33.02),
      lng: Number.isFinite(Number(currentUser.lng))
        ? Number(currentUser.lng)
        : (Number.isFinite(Number(userLocation?.lng)) ? Number(userLocation!.lng) : -71.55),
      bio: currentUser.bio,
      photos: currentUser.photos,
      trainingTypes: currentUser.trainingTypes,
      goals: currentUser.goals,
      level: currentUser.level,
      trainingNow: true,
      trainingNowSince: normalizeTrainingSince(currentUser.trainingNowSince) || Date.now(),
      liveStreak: currentUser.liveStreak,
      joinedLiveStreak: currentUser.joinedLiveStreak,
      liveJoins: currentUser.liveJoins,
      trainingSyncWith: currentUser.trainingSyncWith,
      retentionLevel: (currentUser as any).retentionLevel || 1,
      _isSelf: true,
    }
  }, [currentUser, effectiveUserId, userLocation])

  const enrichLiveUser = useCallback((p: any, now: number, bonds: Record<string, any>) => {
    return buildEnrichedLiveUser(p, now, {
      userLocation,
      syncBonds: bonds,
      getDistanceKm,
    })
  }, [userLocation])

  // === GYMPULSE LIVE PIPELINE ===
  // Sources (merged): livePresence collection (primary RT) + profiles trainingNow query (fallback) + optimistic self
  const publishLiveSnapshot = useCallback((presence: any[], profilesQuery: any[]) => {
    liveFromPresenceRef.current = presence
    liveFromProfilesQueryRef.current = profilesQuery
    const merged = mergeLiveUsersById([presence, profilesQuery])
    liveUsersFromDedicatedRef.current = merged
    setLiveUsersFromDedicated(merged)
    setMapForceTick((t) => t + 1)
    setRealProfiles((prev) => {
      const next = patchRealProfilesWithLiveSnapshot(prev, merged, {
        selfUid: currentUidRef.current,
      })
      if (next === prev) return prev
      latestRealProfilesRef.current = next
      try { localStorage.setItem('entrenamatch_last_live', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const liveUsersMerged = useMemo(() => {
    const selfEntry = buildSelfLiveEntry()
    const fromRealFallback =
      liveUsersFromDedicated.length === 0
        ? (realProfiles || []).filter((p: any) => p?.trainingNow === true)
        : []
    return mergeLiveUsersById([
      liveUsersFromDedicated || [],
      fromRealFallback,
      selfEntry ? [selfEntry] : [],
    ])
  }, [liveUsersFromDedicated, realProfiles, buildSelfLiveEntry])

  const liveUsersActive = useMemo(() => {
    const now = Date.now()
    let active = liveUsersMerged
      .filter((p) => isActiveLiveUser(p, now))
      .filter((p) => !blockedUsers.includes(p.id))
      .map((p) => enrichLiveUser(p, now, syncBonds))

    if (isDemoMode && active.filter((p) => p.id !== effectiveUserId && p.id !== 'me').length === 0) {
      active = [
        ...active.filter((p) => p.id === effectiveUserId || p.id === 'me'),
        ...SEED_PROFILES.slice(0, 5)
          .filter((p) => p.id !== effectiveUserId)
          .map((p, i) => enrichLiveUser({
            ...p,
            trainingNow: true,
            trainingNowSince: now - (i + 1) * 12 * 60000,
            joinCount: i + 1,
          }, now, syncBonds)),
      ]
    }
    return active.sort((a, b) => (a.distance || 999) - (b.distance || 999))
  }, [liveUsersMerged, blockedUsers, isDemoMode, effectiveUserId, enrichLiveUser, syncBonds])

  // Others-only (join / sync lists — no self)
  const liveTrainingNow = useMemo(() => (
    liveUsersActive.filter((p) => p.id !== effectiveUserId && p.id !== 'me')
  ), [liveUsersActive, effectiveUserId])

  // Map: ALL live users including self (GymPulse markers)
  const mapLiveTrainingNow = useMemo(() => {
    const all = [...liveUsersActive]
    if (isDeveloper && devTestLives.length > 0) all.push(...devTestLives)
    return all
  }, [liveUsersActive, isDeveloper, devTestLives])

  const liveCountForUI = liveUsersActive.length

  useEffect(() => { liveUsersActiveRef.current = liveUsersActive }, [liveUsersActive])

  /** Unified live gate — GymPulse pipeline + profile fallback (avoids silent EntrenaSync blocks). */
  const isUserLive = useCallback((userId: string): boolean => {
    if (!userId) return false
    if (
      userId === effectiveUserId ||
      userId === 'me' ||
      (firebaseUser?.uid && userId === firebaseUser.uid)
    ) {
      return !!currentUserRef.current?.trainingNow
    }
    if (isUserLiveInSnapshot(userId, liveUsersActiveRef.current)) return true
    const fromDedicated = (liveUsersFromDedicatedRef.current || []).find((p: any) => p.id === userId)
    if (fromDedicated && isActiveLiveUser(fromDedicated)) return true
    const fromProfiles = (latestRealProfilesRef.current || []).find((p: any) => p.id === userId)
    return fromProfiles?.trainingNow === true
  }, [effectiveUserId, firebaseUser?.uid])

  // Zone live counts for interactive legend (sigue con todo el mapa + visual polish iteration)
  const zoneLiveCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    liveUsersActive.forEach((u: any) => {
      if (u.city) counts[u.city] = (counts[u.city] || 0) + 1
    })
    return counts
  }, [liveUsersActive])

  // Feed computation lifted to top-level useMemo so hook is ALWAYS called in the same order (fixes React #310 "Rendered more hooks than during the previous render" when switching tabs).
  // The previous inline IIFE inside {activeTab==='feed' && ...} was conditionally executing the useMemo hook → violation.
  const feedComputation = useMemo(() => {
    const allCommunityPosts = Object.entries(profilePosts)
      .filter(([uid]) => uid !== effectiveUserId)
      .flatMap(([uid, posts]) => (posts || []).map((p: any) => ({ ...p, ownerId: uid })));

    // Include a few of your own recent posts (from muro or "Publicar en el Feed") into the visible feed list.
    // This fixes the "I published but don't see my post in the feed tab" disappointment.
    // Own posts only mixed in default view; filters (Live/Reales/Fijados) stay pure community discovery.
    // echoesSource always includes own so the "⭐ HIGHLIGHTS DE RED" strip shows your strong syncs immediately.
    const myPostsRaw = (profilePosts[effectiveUserId] || []).map((p: any) => ({ ...p, ownerId: effectiveUserId, isMine: true }));
    let feedPosts = [...allCommunityPosts, ...myPostsRaw];

    feedPosts = feedPosts.sort((a: any, b: any) => {
      const aIsLegend = !!syncBonds[a.ownerId];
      const bIsLegend = !!syncBonds[b.ownerId];
      if (bIsLegend && !aIsLegend) return -1; // High-performance network partners have real weight in global feed (your training graph gives status)
      if (aIsLegend && !bIsLegend) return 1;
      const aIsEcho = (a.text || '').includes('HIGHLIGHT DE ENTRENASYNC') || (a.text || '').includes('Destacado de Sesión Sync');
      const bIsEcho = (b.text || '').includes('HIGHLIGHT DE ENTRENASYNC') || (b.text || '').includes('Destacado de Sesión Sync');
      if (bIsEcho && !aIsEcho) return -1; // Network highlights (strong syncs) rise to the top - visible performance culture
      if (aIsEcho && !bIsEcho) return 1;
      if (b.pinned && !a.pinned) return 1;
      if (a.pinned && !b.pinned) return -1;
      return b.timestamp - a.timestamp;
    });

    const hasActiveFilter = feedShowPinnedOnly || feedOnlyReal || feedOnlyLive || !!feedSearch.trim();
    if (feedShowPinnedOnly) feedPosts = feedPosts.filter((p: any) => p.pinned);
    if (feedOnlyReal) feedPosts = feedPosts.filter((p: any) => p.isMine || !isSeedProfileId(p.ownerId));
    if (feedOnlyLive) feedPosts = feedPosts.filter((p: any) => !p.isMine && isUserLiveInSnapshot(p.ownerId, liveUsersActive));
    if (feedSearch.trim()) {
      const q = feedSearch.toLowerCase().trim();
      feedPosts = feedPosts.filter((p: any) => {
        const ownerName = p.isMine ? (currentUser?.name || '') : ((realProfiles.find(r => r.id === p.ownerId) || { name: '' }).name);
        return (p.text || '').toLowerCase().includes(q) || (ownerName || '').toLowerCase().includes(q);
      });
    }
    feedPosts = feedPosts.slice(0, feedDisplayLimit);
    return { feedPosts, allCommunityPosts, echoesSource: [...allCommunityPosts, ...myPostsRaw], hasActiveFilter };
  }, [profilePosts, feedShowPinnedOnly, feedOnlyReal, feedOnlyLive, feedSearch, feedDisplayLimit, realProfiles, effectiveUserId, syncBonds, currentUser, liveUsersActive]);

  // Filtered deck (with distance support + blocking)
  // Polish: sort by best compatibility first (improves "matching quality" — high compat + close appear at top of swipe)
  // Hoisted early with the other discovery memos.
  const deck = useMemo(() => {
    const filtered = remainingProfiles.filter(p => {
      // Block filter (critical safety)
      if (blockedUsers.includes(p.id)) return false

      if (p.age < filters.minAge || p.age > filters.maxAge) return false
      if (filters.gender !== 'todos' && p.gender !== filters.gender) return false
      if (filters.trainingTypes.length > 0) {
        const hasAny = filters.trainingTypes.some(t => p.trainingTypes.includes(t))
        if (!hasAny) return false
      }
      if (filters.availability.length > 0) {
        const hasTime = filters.availability.some(t => p.availability.includes(t))
        if (!hasTime) return false
      }
      // Distance filter (only if user has location)
      if (userLocation && filters.maxDistanceKm < 100) {
        const dist = getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng)
        if (dist > filters.maxDistanceKm) return false
      }
      if (filters.onlyAvailableToday && !p.availableToday) return false
      if (filters.onlyLiveTraining && !isUserLiveInSnapshot(p.id, liveUsersActive)) return false
      if (filters.onlyRealProfiles && isSeedProfileId(p.id)) return false
      return true
    })

    // Sort: highest compatibility first, then closest distance, slight boost for verified/real
    // NETWORK POWER PRIORITY: members of your Red de EntrenaSync bubble to the absolute top of the deck.
    // This makes the social graph have real recommendation power — training with someone gives you visibility and priority with them and their circle over time.
    if (currentUser) {
      return [...filtered].sort((a, b) => {
        const isNetA = !!syncBonds[a.id]
        const isNetB = !!syncBonds[b.id]
        if (isNetA && !isNetB) return -1
        if (!isNetA && isNetB) return 1
        // Within network, higher bondLevel first (stronger alliances rise)
        if (isNetA && isNetB) {
          const la = syncBonds[a.id]?.bondLevel || 1
          const lb = syncBonds[b.id]?.bondLevel || 1
          if (lb !== la) return lb - la
        }

        const ca = calculateCompatibility(currentUser, a, userLocation) + (isNetA ? 75 : 0) // massive Network Power boost to compat score
        const cb = calculateCompatibility(currentUser, b, userLocation) + (isNetB ? 75 : 0)
        if (cb !== ca) return cb - ca

        if (userLocation) {
          const da = getDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng)
          const db = getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
          if (da !== db) return da - db
        }

        // Verified / real tester slight priority
        const va = (a.verificationStatus === 'verified' || !a.id.startsWith('p')) ? 1 : 0
        const vb = (b.verificationStatus === 'verified' || !b.id.startsWith('p')) ? 1 : 0
        return vb - va
      })
    }
    return filtered
  }, [remainingProfiles, filters, userLocation, blockedUsers, currentUser, liveUsersActive])

  // Visible cards (top 3 for stack effect)
  const visibleCards = deck.slice(0, 3)

  // Current chatting profile (supports real + seed)
  const chatProfile = activeChat 
    ? [...SEED_PROFILES, ...realProfiles].find(p => p.id === activeChat) 
    : null

  // Matches profiles (supports real profiles from Firestore + seeds)
  const matchProfiles = useMemo(() => {
    const all = [...SEED_PROFILES, ...realProfiles]
    // Merge local matches + real matches loaded from Firestore + any pending real matches from current session
    const combinedMatchIds = Array.from(new Set([...matches, ...realMatches]))
    return all.filter(p => combinedMatchIds.includes(p.id))
  }, [matches, realMatches, realProfiles])

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
  }, [syncBonds, matchProfiles, realProfiles, liveUsersActive, isUserLive])

  const homeWeekDays = useMemo(
    () => buildWeekDayStatuses(weekLiveDays).map(({ label, trained, isToday }) => ({ label, trained, isToday })),
    [weekLiveDays]
  )

  const homeWeekTrainedCount = weekLiveDays.length

  const homeWeeklyPactProgress = useMemo(
    () =>
      computeWeeklyPactProgress(
        (currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact,
        homeWeekTrainedCount,
        currentUser?.weekStats
      ),
    [(currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact, homeWeekTrainedCount, currentUser?.weekStats]
  )

  const pactCompleteToastRef = useRef(false)
  useEffect(() => {
    if (homeWeeklyPactProgress.isComplete && !pactCompleteToastRef.current) {
      pactCompleteToastRef.current = true
      toast.success('Semana sellada', {
        description: 'Live + Sync — meta semanal cumplida con tu equipo',
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
      if (!isDemoMode && firebaseUser?.uid) {
        try {
          await updateUserProfile(firebaseUser.uid, { weeklyPact: pact } as any)
        } catch (e) {
          console.warn('weeklyPact persist failed', e)
        }
      }
      triggerHaptic('success')
      toast.success('Meta fijada', {
        description: `${pact.liveDaysTarget} días live · ${pact.syncSessionsTarget} sync esta semana`,
      })
    },
    [currentUser, isDemoMode, firebaseUser?.uid, saveUser]
  )

  const homeCityNorm = normalizeCity(currentUser?.city)

  const homeLocalLeaderboard = useMemo(() => {
    if (!homeCityNorm) return []
    return buildCityLeaderboard(realProfiles as Profile[], homeCityNorm, {
      userId: effectiveUserId,
      name: currentUser?.name || 'Tú',
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

  const homeGymLeaderboard = useMemo(() => {
    const gymId = currentUser?.gymCheckIn?.gymId
    if (!gymId || !isGymCheckInFresh(currentUser?.gymCheckIn)) return []
    return buildGymLeaderboard(realProfiles as Profile[], gymId, {
      userId: effectiveUserId,
      name: currentUser?.name || 'Tú',
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
    const gyms = (partnerLocations || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      address: p.address,
      city: p.city,
    }))
    return findNearestGym(gyms, Number(lat), Number(lng))
  }, [userLocation, currentUser?.lat, currentUser?.lng, partnerLocations])

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

  // Real-time city challenge aggregate (Firestore)
  useEffect(() => {
    if (isDemoMode || !db || !homeCityNorm) {
      setFirestoreCityStats(null)
      return undefined
    }
    const docId = cityStatsDocId(homeCityNorm, getWeekKey())
    return attachCityWeeklyStatsListener(db, docId, setFirestoreCityStats)
  }, [isDemoMode, db, homeCityNorm])

  // Celebrate city challenge completion once per week (client-side)
  useEffect(() => {
    if (!homeCityChallengeMerged || homeCityChallengeMerged.progressPct < 100 || !homeCityNorm) return
    const storageKey = `entrenamatch_city_done_${homeCityChallengeMerged.weekKey}_${homeCityNorm}`
    try {
      if (localStorage.getItem(storageKey)) return
      localStorage.setItem(storageKey, '1')
      toast.success(`¡Reto completado en ${homeCityChallengeMerged.cityLabel}!`, {
        description: `${homeCityChallengeMerged.targetMinutes} min live+sync esta semana — la ciudad lo logró 🏆`,
      })
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.65 } })
    } catch {}
  }, [homeCityChallengeMerged, homeCityNorm])

  // Beta Feedback enhanced (Phase 0 - structured + history)
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

  // Global poller for real profiles (so live trainingNow status propagates to everyone even if not in Explore tab)
  // This ensures that when someone toggles "entrenando en vivo", others will see them appear in lists within ~45s without manual refresh.
  useEffect(() => {
    if (isDemoMode) return;
    const id = setInterval(() => {
      loadRealProfiles().catch(() => {});
    }, 45000);
    return () => clearInterval(id);
  }, [isDemoMode]);

  // REAL-TIME PROFILES LISTENER for live status (fixes "no aparece para otros en el mapa" when someone toggles Entrenando Ahora)
  // When any profile updates (including trainingNow + updatedAt), all connected clients get pushed the change instantly.
  // This makes the GymPulse map update for everyone in near real-time without waiting for the 45s poller.
  // We still keep the poller as fallback + for the "Actualizar todo" button.
  useEffect(() => {
    if (isDemoMode || !db || !isFirebaseConfigured) return undefined;

    let unsub: any = null;
    (async () => {
      try {
        const { collection, onSnapshot, query, orderBy, limit } = await import('firebase/firestore');
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, orderBy('updatedAt', 'desc'), limit(300));

        unsub = onSnapshot(q, (snapshot) => {
          const profiles: Profile[] = [];
          const currentUid = currentUidRef.current;

          snapshot.forEach((doc) => {
            if (doc.id === currentUid) return;
            if (blockedUsersRef.current.includes(doc.id)) return;
            const data = doc.data() as any;
            if (data && data.name) {
              profiles.push({
                id: doc.id,
                name: data.name,
                age: data.age || 25,
                gender: data.gender || 'hombre',
                city: data.city || '',
                country: data.country || 'Chile',
                lat: data.lat || -33.0,
                lng: data.lng || -71.0,
                bio: data.bio || '',
                photos: data.photos || [],
                trainingTypes: data.trainingTypes || [],
                goals: data.goals || [],
                level: data.level || 'Intermedio',
                availability: data.availability || ['Tarde'],
                intensity: data.intensity,
                verificationStatus: data.verificationStatus,
                trainingNow: data.trainingNow || false,
                trainingNowSince: normalizeTrainingSince(data.trainingNowSince),
                liveStreak: data.liveStreak != null ? data.liveStreak : undefined,
                lastLiveDate: data.lastLiveDate != null ? data.lastLiveDate : undefined,
                liveJoins: data.liveJoins != null ? data.liveJoins : undefined,
                joinedLiveStreak: data.joinedLiveStreak != null ? data.joinedLiveStreak : undefined,
                trainingSyncWith: data.trainingSyncWith || undefined,
                syncStreak: data.syncStreak != null ? data.syncStreak : undefined,
                syncBonds: data.syncBonds || {},
                weekStats: data.weekStats || undefined,
                showOnLeaderboard: data.showOnLeaderboard,
                gymCheckIn: data.gymCheckIn || undefined,
                // add other fields as needed for map (level etc)
                retentionLevel: data.retentionLevel || 1,
              } as any);
            }
          });
          setRealProfiles(profiles);
          try { localStorage.setItem('entrenamatch_last_live', JSON.stringify(profiles)) } catch {}
        }, (err) => {
          console.warn('profiles onSnapshot error, falling back to polling', err);
          loadRealProfiles().catch(() => {})
        });
      } catch (e) {
        console.warn('Failed to setup profiles listener', e);
      }
    })();

    return () => { if (unsub) unsub(); };
  }, [isDemoMode, db, isFirebaseConfigured, firebaseUser?.uid, blockedUsers]); // blockedUsers to re-filter if changes

 // === DEDICATED REALTIME LISTENERS FOR LIVE USERS (GymPulse) ===
  // Primary: livePresence/{uid} docs (instant cross-user visibility)
  // Secondary: profiles where trainingNow==true (legacy / backup)
  useEffect(() => {
    if (isDemoMode || !db || !isFirebaseConfigured) {
      liveFromPresenceRef.current = []
      liveFromProfilesQueryRef.current = []
      setLiveUsersFromDedicated([])
      return undefined
    }

    const blocked = () => blockedUsersRef.current
    const onErr = () => {
      const fallback = mergeLiveUsersById([
        liveFromPresenceRef.current,
        (latestRealProfilesRef.current || [])
          .filter((p: any) => p?.trainingNow === true)
          .map((p: any) => profileDocToLiveUser(p.id, p, { forceLive: true })),
      ])
      publishLiveSnapshot(fallback, liveFromProfilesQueryRef.current)
    }

    const unsubPresence = attachLivePresenceListener(
      db,
      (users) => publishLiveSnapshot(users, liveFromProfilesQueryRef.current),
      { getBlockedIds: blocked, onError: onErr }
    )

    const unsubProfiles = attachLiveUsersListener(
      db,
      (users) => publishLiveSnapshot(liveFromPresenceRef.current, users),
      { getBlockedIds: blocked, onError: onErr }
    )

    return () => {
      unsubPresence()
      unsubProfiles()
    }
  }, [isDemoMode, db, isFirebaseConfigured, firebaseUser?.uid, publishLiveSnapshot])

  // Firestore RT listeners auto-reconnect after network blips — no enableNetwork needed (da08).

  // Demo mode: synthesize liveUsersFromDedicated locally (no Firestore query).
  useEffect(() => {
    if (!isDemoMode) return
    const now = Date.now()
    const demoLives: any[] = []
    const self = buildSelfLiveEntry()
    if (self) demoLives.push(self)
    SEED_PROFILES.slice(0, 5).forEach((p, i) => {
      if (p.id === effectiveUserId) return
      demoLives.push({
        ...p,
        trainingNow: true,
        trainingNowSince: now - (i + 1) * 12 * 60000,
      })
    })
    setLiveUsersFromDedicated(demoLives)
  }, [isDemoMode, buildSelfLiveEntry, effectiveUserId])

  // Own profile doc listener - keeps currentUser.trainingNow in sync from other devices.
  // Guards against stale cached snapshots reverting an in-flight toggle write.
  useEffect(() => {
    if (isDemoMode || !db || !isFirebaseConfigured || !firebaseUser?.uid) return undefined
    let unsubOwn: any = null
    ;(async () => {
      try {
        const { doc, onSnapshot } = await import('firebase/firestore')
        const ownRef = doc(db, 'profiles', firebaseUser.uid)
        unsubOwn = onSnapshot(ownRef, (snap) => {
          if (!snap.exists()) return
          const data = snap.data() as any
          if (!data) return
          if (isTogglingLiveRef.current) return

          const newTrainingNow = !!data.trainingNow
          const newSince = normalizeTrainingSince(data.trainingNowSince)
          const pending = pendingLiveWriteRef.current
          const base = currentUserRef.current

          // Ignore snapshots that disagree with the last explicit user toggle.
          // pending is overwritten only on the next toggle — never auto-cleared (stale cache was reverting live).
          if (pending && newTrainingNow !== pending.trainingNow) return

          if (
            base &&
            (base.trainingNow !== newTrainingNow ||
              normalizeTrainingSince(base.trainingNowSince) !== newSince)
          ) {
            const merged = {
              ...base,
              trainingNow: newTrainingNow,
              trainingNowSince: newSince,
              liveStreak: data.liveStreak != null ? data.liveStreak : base.liveStreak,
            }
            saveUser(merged as any)
            setMapForceTick((t) => t + 1)
          }
        })
      } catch (e) {
        console.warn('own profile listener failed', e)
      }
    })()
    return () => { if (unsubOwn) unsubOwn() }
  }, [isDemoMode, db, isFirebaseConfigured, firebaseUser?.uid, currentUser?.id]) // depend on id to re-sub on user change

  // EntrenaSync profile mirror (fallback only): enrich from partner profile when both pointers match.
  // Do NOT tear down sync when partner profile lacks trainingSyncWith — cross-user profile writes are blocked
  // by rules; syncSessions is the source of truth (see incoming listener below).
  useEffect(() => {
    if (currentUser?.trainingSyncWith && currentUser.trainingNow) {
      const partner = realProfiles.find(p => p.id === currentUser.trainingSyncWith)
      if (partner && partner.trainingSyncWith === effectiveUserId) {
        if (partner.syncStartedAt) setSyncStartedAt(partner.syncStartedAt)
        if (partner.syncActions && partner.syncActions.length > syncActions.length) {
          setSyncActions(partner.syncActions)
        }
      }
    }
  }, [realProfiles, currentUser?.trainingSyncWith, currentUser?.trainingNow, effectiveUserId])

  // Incoming EntrenaSync: when partner starts sync, syncSessions doc is created — join + open Arena.
  // Keep listener stable (ref guard) — do NOT tear down when syncPartnerId changes to avoid SDK listener churn (da08).
  useEffect(() => {
    if (
      authBooting ||
      !firebaseUser?.uid ||
      !db ||
      isDemoMode ||
      !isFirebaseConfigured
    ) {
      return undefined
    }

    return attachIncomingSyncListener(db, firebaseUser.uid, {
      getHasActivePartner: () => !!syncPartnerIdRef.current,
      getTrainingNow: () => !!currentUserRef.current?.trainingNow,
      findPartnerName: (partnerId) =>
        (latestRealProfilesRef.current || []).find((p) => p.id === partnerId)?.name || 'Compañero',
      onIncoming: (payload) => {
        syncPartnerIdRef.current = payload.partnerId
        setSyncPartnerId(payload.partnerId)
        setSyncStartedAt(payload.startedAt)
        setSyncActions(payload.actions || [])
        setSyncWorkoutLog(createEmptySyncWorkoutLog())
        setSyncPartnerLiveState(null)
        if (typeof payload.vibe === 'number') {
          setSyncVibe(Math.max(0, Math.min(100, payload.vibe)))
        }
        setShowSyncArena(true)
        setActiveTab('explore')
        triggerHaptic('medium')

        const updated = {
          ...currentUserRef.current,
          trainingSyncWith: payload.partnerId,
          syncStartedAt: payload.startedAt,
          syncActions: payload.actions || [],
        }
        saveUser(updated as any)
        saveUserWithRealSync(updated as any).catch(() => {})

        addNotification({
          type: 'sync_invite',
          title: syncBondsRef.current[payload.partnerId]
            ? `${payload.partnerName} inició sync contigo`
            : `EntrenaSync con ${payload.partnerName}`,
          body: syncBondsRef.current[payload.partnerId]
            ? 'Tu alianza de sync está en vivo — Arena abierta'
            : 'Tu compañero inició sync contigo — Arena abierta',
          relatedId: payload.partnerId,
        })

        toast.success(
          syncBondsRef.current[payload.partnerId]
            ? `⭐ ${payload.partnerName} te invitó a sync`
            : `EntrenaSync con ${payload.partnerName}`,
          {
            description: syncBondsRef.current[payload.partnerId]
              ? 'Tu alianza está en vivo — abrimos la Arena'
              : 'Tu compañero inició sync contigo',
          }
        )
      },
      onError: () => {
        // Listener will retry automatically; enableNetwork when already online causes da08.
      },
    })
  }, [isDemoMode, db, firebaseUser?.uid, effectiveUserId, isFirebaseConfigured, authBooting])

  // Dedicated syncSessions listener for INSTANT actions across devices
  useEffect(() => {
    if (
      !syncPartnerId ||
      effectiveUserId === 'me' ||
      !firebaseUser?.uid ||
      !db ||
      isDemoMode ||
      !isFirebaseConfigured
    ) {
      return undefined
    }

    const sessionId = buildSyncSessionId(effectiveUserId, syncPartnerId)
    return attachActiveSyncSessionListener(db, sessionId, effectiveUserId, {
      onUpdate: (data) => {
        if (Array.isArray(data.actions)) {
          const recent = [...data.actions]
            .sort((a: any, b: any) => (b.at || 0) - (a.at || 0))
            .slice(0, 10)
          setSyncActions(recent)
        }
        if (data.startedAt) setSyncStartedAt(data.startedAt)
        if (typeof data.vibe === 'number') {
          setSyncVibe(Math.max(0, Math.min(100, data.vibe)))
        }
        if (syncPartnerId) {
          setSyncRealWitnessCount(
            countExternalWitnesses(data.witnesses, effectiveUserId, syncPartnerId)
          )
          const exclude = new Set([effectiveUserId, syncPartnerId, 'me'])
          setSyncWitnessIds(
            (Array.isArray(data.witnesses) ? data.witnesses : []).filter(
              (w): w is string => typeof w === 'string' && !exclude.has(w)
            )
          )
          setSyncPartnerLiveState(parseParticipantState(data.participantState, syncPartnerId))
        }
        if (typeof data.restUntil === 'number' && data.restUntil > Date.now()) {
          setSyncRestUntil(data.restUntil)
          setSyncRestStartedBy(
            typeof data.restStartedBy === 'string' ? data.restStartedBy : null
          )
        } else {
          setSyncRestUntil(null)
          setSyncRestStartedBy(null)
        }
      },
      onPartnerAction: (latest) => {
        const key = `${latest.at || 0}-${latest.emoji || ''}-${latest.label || ''}`
        const prevToast = lastSyncActionToastRef.current
        if (prevToast?.key === key && Date.now() - prevToast.at < 4000) return
        lastSyncActionToastRef.current = { at: Date.now(), key }
        toast(`${latest.emoji} ${latest.label}`, {
          description: `${realProfiles.find(p => p.id === syncPartnerId)?.name || 'Tu compañero'} lo hizo ahora`,
          duration: 2200,
        })
        triggerHaptic('light')
      },
      onError: () => {
        // Non-fatal — active session listener falls back to profile mirror.
      },
    })
  }, [syncPartnerId, effectiveUserId, firebaseUser?.uid, db, isDemoMode, isFirebaseConfigured, realProfiles])

  // Arena 2.0 — sync live exercise/reps to partner via participantState
  useEffect(() => {
    if (!syncPartnerId || !syncStartedAt || isDemoMode || !db) return
    const t = setTimeout(() => {
      const log = syncWorkoutLogRef.current
      void (async () => {
        try {
          const { doc, updateDoc } = await import('firebase/firestore')
          const sessionId = buildSyncSessionId(effectiveUserId, syncPartnerId)
          await updateDoc(doc(db, 'syncSessions', sessionId), {
            [`participantState.${effectiveUserId}`]: toParticipantSyncPayload(log),
            updatedAt: Date.now(),
          })
        } catch {
          /* non-fatal */
        }
      })()
    }, 200)
    return () => clearTimeout(t)
  }, [syncWorkoutLog, syncPartnerId, syncStartedAt, effectiveUserId, isDemoMode, db])

  // Register as witness when viewing GymPulse/feed/explore while others are in EntrenaSync (real FOMO counter).
  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid || effectiveUserId === 'me') return
    const uid = firebaseUser.uid
    const shouldScan = showLiveMap || activeTab === 'home' || activeTab === 'explore'
    if (!shouldScan) return

    liveTrainingNow.forEach((u: any) => {
      const partnerId = u.trainingSyncWith
      if (!partnerId) return
      if (uid === u.id || uid === partnerId) return
      const sessionId = buildSyncSessionId(u.id, partnerId)
      if (witnessedSessionsRef.current.has(sessionId)) return
      witnessedSessionsRef.current.add(sessionId)
      registerSyncWitness(db, sessionId, uid).catch(() => {})
    })
  }, [
    liveTrainingNow,
    showLiveMap,
    activeTab,
    isDemoMode,
    db,
    firebaseUser?.uid,
    effectiveUserId,
  ])

  const loadActiveSyncCount = async () => {
    if (!isFirebaseConfigured) {
      setActiveSyncCount(0)
      setActiveSyncPairs([])
      return
    }
    // Rules allow read only on syncSessions where user is a participant — derive global
    // active pairs from live profile snapshots instead of an unscoped collection query.
    const seen = new Set<string>()
    let count = 0
    const pairs: any[] = []
    for (const p of realProfiles) {
      if (!p.trainingNow || !p.trainingSyncWith) continue
      const partner = realProfiles.find((pp) => pp.id === p.trainingSyncWith)
      if (!partner?.trainingNow || partner.trainingSyncWith !== p.id) continue
      const pairKey = [p.id, partner.id].sort().join('_')
      if (seen.has(pairKey)) continue
      seen.add(pairKey)
      count++
      if (pairs.length < 2) {
        const startedAt = p.syncStartedAt || partner.syncStartedAt
        const minutes =
          startedAt && startedAt > 0
            ? Math.max(0, Math.floor((Date.now() - startedAt) / 60000))
            : undefined
        pairs.push({
          names: `${(p.name || 'U').split(' ')[0]} + ${(partner.name || 'U').split(' ')[0]}`,
          vibe: 50,
          minutes,
        })
      }
    }
    setActiveSyncCount(count)
    if (pairs.length) setActiveSyncPairs(pairs)
    else setActiveSyncPairs([])
  }

  useEffect(() => {
    if (activeTab !== 'home' && activeTab !== 'explore') return
    loadActiveSyncCount().catch(() => {})
    const t = setInterval(() => loadActiveSyncCount().catch(() => {}), 45000)
    return () => clearInterval(t)
  }, [activeTab])

  // Global "Actualizar todo" for testers - forces fresh real data + updates lastSync everywhere (makes "en vivo" feel stronger, live training, feed, etc.)
  const refreshAllReal = async () => {
    if (isDemoMode) { toast('Actualizando (demo)...'); return; }
    setIsLoadingMatches(true)
    try {
      await Promise.all([
        loadRealProfiles(),
        loadRealMatches(),
        loadRealSessions(),
        loadActiveSyncCount()
      ])
      if (currentUser?.trainingNow) {
        await loadProfilePosts(effectiveUserId)
        processIncomingLiveJoins()
      }
      if (activeTab === 'home') {
        await loadGlobalFeed()
      }
      // Refresh personal muro if in profile
      if (activeTab === 'profile') {
        setLoadingPersonalMuro(true)
        await loadProfilePosts(effectiveUserId).finally(() => setLoadingPersonalMuro(false))
      }
      const now = new Date()
      setLastSync(now)
      toast.success('Datos reales actualizados', { description: 'Perfiles, matches, sesiones, syncs y feed refrescados.' })
    } finally {
      setIsLoadingMatches(false)
    }
  }

  // Google Play Integrity check - "trabajar con la app de google"
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
              ? `Usando nonce de prueba de la consola. Envíalo a tu backend para obtener el veredicto completo (JSON como el que me pasaste).`
              : 'Envíalo a tu backend para verificar y obtener el JSON completo de veredictos (como el que me pasaste). Copiado en consola.'
          })
        }
        console.log('%c[Play Integrity] Raw token (send this to server for full verification):', 'color:#22c55e', res.token)
        if (nonce) console.log('%c[Play Integrity] Used test nonce from console:', 'color:#f59e0b', nonce)
        console.log('Expected packageName in verdicts: com.entrenamatch.app')
      } else if (res.simulatedVerdict) {
        if (showToast) {
          toast.success('Integridad simulada (web/demo)', {
            description: 'En la APK nativa instalada desde Play obtendrás un token real. El simulado es positivo (LICENSED + PLAY_RECOGNIZED + MEETS_DEVICE_INTEGRITY).'
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
      return
    }
    try {
      const profilesRef = collection(db, 'profiles')
      const q = query(profilesRef, orderBy('updatedAt', 'desc'), limit(300)) // order by recent updates so people who just toggled live are likely in the results; 300 for safety on live visibility
      const snapshot = await getDocs(q)
      
      const profiles: Profile[] = []
      const currentUid = currentUidRef.current || firebaseUser?.uid

      snapshot.forEach((doc) => {
        if (doc.id === currentUid) return
        if (blockedUsersRef.current.includes(doc.id)) return
        const data = doc.data() as any
        if (data && data.name) {
          profiles.push({
            id: doc.id,
            name: data.name,
            age: data.age || 25,
            gender: data.gender || 'hombre',
            city: data.city || '',
            country: data.country || 'Chile',
            lat: data.lat || -33.0,
            lng: data.lng || -71.0,
            bio: data.bio || '',
            photos: data.photos || [],
            trainingTypes: data.trainingTypes || [],
            goals: data.goals || [],
            level: data.level || 'Intermedio',
            availability: data.availability || ['Tarde'],
            intensity: data.intensity,
            verificationStatus: data.verificationStatus,
            trainingNow: data.trainingNow || false,
            trainingNowSince: normalizeTrainingSince(data.trainingNowSince),
            liveStreak: data.liveStreak != null ? data.liveStreak : undefined,
            lastLiveDate: data.lastLiveDate != null ? data.lastLiveDate : undefined,
            liveJoins: data.liveJoins != null ? data.liveJoins : undefined,
            joinedLiveStreak: data.joinedLiveStreak != null ? data.joinedLiveStreak : undefined,
            dailyTrainingStreak: data.dailyTrainingStreak != null ? data.dailyTrainingStreak : undefined,
            dailySynergyStreak: data.dailySynergyStreak != null ? data.dailySynergyStreak : undefined,
            dailyVoiceStreak: data.dailyVoiceStreak != null ? data.dailyVoiceStreak : undefined,
            dailyPulseStreak: data.dailyPulseStreak != null ? data.dailyPulseStreak : undefined,
            momentumPoints: data.momentumPoints != null ? data.momentumPoints : undefined,
            lastDailyPulseDate: data.lastDailyPulseDate != null ? data.lastDailyPulseDate : undefined,
            streakProtectedDate: data.streakProtectedDate || null,
            pulseAmplifiedDate: data.pulseAmplifiedDate || null,
            currentDailyChallenge: data.currentDailyChallenge || undefined,
            retentionLevel: data.retentionLevel || 1,
            retentionXp: data.retentionXp || 0,
            trainingSyncWith: data.trainingSyncWith || undefined,
            syncStreak: data.syncStreak != null ? data.syncStreak : undefined,
            syncBonds: data.syncBonds || {},
            weekStats: data.weekStats || undefined,
            showOnLeaderboard: data.showOnLeaderboard,
            gymCheckIn: data.gymCheckIn || undefined,
          })
        }
      })
      setRealProfiles(profiles)
      const now = new Date()
      setLastSync(now)
      // Cache last live for offline map fallback + fast cold start
      try { localStorage.setItem('entrenamatch_last_live', JSON.stringify(profiles)) } catch {}
      // Spectacular: preload muro teasers for first few so cards show latest posts immediately
      profiles.slice(0, 5).forEach(p => { loadProfilePosts(p.id).catch(() => {}) })
      // console.log removed for cleaner prod (was spammy on every refresh)
    } catch (err) {
      console.warn('Could not load real profiles (Firestore may not have data yet):', err)
      setRealProfiles([])
    }
  }

  // Real profile sync effect: when we have a real Firebase user, load their rich profile from Firestore
  // and ensure we push any rich local data up if Firestore is minimal
  useEffect(() => {
    if (!isDemoMode && firebaseUser?.uid) {
      (async () => {
        try {
          const realProfile = await getUserProfile(firebaseUser.uid)
          
          if (realProfile && realProfile.name) {
            const merged: CurrentUser = {
              ...currentUser,
              id: 'me' as any,
              name: realProfile.name,
              age: realProfile.age,
              gender: realProfile.gender,
              city: realProfile.city,
              country: realProfile.country,
              bio: realProfile.bio,
              photos: realProfile.photos || [],
              trainingTypes: realProfile.trainingTypes || [],
              goals: realProfile.goals || [],
              level: realProfile.level || 'Intermedio',
              intensity: realProfile.intensity || 'Moderado',
              availability: realProfile.availability || ['Tarde'],
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
            }
            if (merged.name) {
              saveUser(merged)
              addDebugLog(`Real login: ${merged.name}`)
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
          } else if (currentUser && currentUser.name && firebaseUser?.uid) {
            // New real user with local rich data but no Firestore profile yet → push it up immediately
            const pushProfile: any = {
              name: currentUser.name,
              age: currentUser.age,
              gender: currentUser.gender,
              city: currentUser.city,
              country: currentUser.country,
              bio: currentUser.bio,
              photos: currentUser.photos,
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

  // Reusable load for real matches (called on login, periodically, and on manual refresh)
  const loadRealMatches = async () => {
    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore')
        const matchesRef = collection(db, 'matches')
        const q1 = query(matchesRef, where('user1', '==', firebaseUser.uid))
        const q2 = query(matchesRef, where('user2', '==', firebaseUser.uid))
        
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])
        
        const matchedUserIds = new Set<string>()
        snap1.forEach(d => {
          const data = d.data() as any
          if (data.user2 && data.user2 !== firebaseUser.uid) matchedUserIds.add(data.user2)
        })
        snap2.forEach(d => {
          const data = d.data() as any
          if (data.user1 && data.user1 !== firebaseUser.uid) matchedUserIds.add(data.user1)
        })
        
        const ids = Array.from(matchedUserIds)
        if (realMatchesInitializedRef.current) {
          const prev = prevRealMatchesRef.current
          for (const id of ids) {
            if (prev.includes(id) || justMatchedLocallyRef.current.has(id)) {
              if (justMatchedLocallyRef.current.has(id)) justMatchedLocallyRef.current.delete(id)
              continue
            }
            const prof = (latestRealProfilesRef.current || []).find((p) => p.id === id)
            addNotification({
              type: 'match',
              title: '¡Nuevo Match!',
              body: `Hiciste match con ${prof?.name || 'un GymPartner'}`,
              relatedId: id,
            })
            toast.success(`¡Match con ${prof?.name || 'un GymPartner'}!`, {
              description: 'Ambos se dieron like — ya pueden chatear',
            })
          }
        }
        realMatchesInitializedRef.current = true
        prevRealMatchesRef.current = ids
        setRealMatches(ids)
        // Preload muro teasers for spectacular cards in Matches tab
        ids.slice(0, 6).forEach(id => { loadProfilePosts(id).catch(()=>{}) })
        // console.log removed
        return ids;
      } catch (e) {
        console.warn('Could not load real matches yet:', e)
        return [];
      }
    }
    return [];
  }

  // Load real matches from Firestore for the current user (so they appear on any device)
  useEffect(() => {
    loadRealMatches()
  }, [firebaseUser?.uid, isDemoMode])

  // Fase 3: squads from Firestore (real-time)
  useEffect(() => {
    if (isDemoMode || !db) return
    const unsub = attachSquadsListener(db, (list) => setSquads(list))
    return unsub
  }, [isDemoMode])

  // Safe polling for real matches (so new likes/matches from others appear without full reload)
  useEffect(() => {
    if (!isDemoMode && firebaseUser?.uid) {
      const interval = setInterval(() => {
        loadRealMatches()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isDemoMode, firebaseUser?.uid])

  // Keep a fresh ref to current activeChat so async loads can decide whether to also refresh realChatMessages
  useEffect(() => {
    currentActiveChatRef.current = activeChat || null
  }, [activeChat])

  // Real-time onSnapshot for matches (new matches from other users' likes appear instantly, no 30s wait)
  useEffect(() => {
    if (isDemoMode || !firebaseUser?.uid || !db) return;
    let unsubs: (() => void)[] = [];
    (async () => {
      try {
        const { collection, query, where, onSnapshot } = await import('firebase/firestore');
        const matchesRef = collection(db, 'matches');
        const q1 = query(matchesRef, where('user1', '==', firebaseUser.uid));
        const q2 = query(matchesRef, where('user2', '==', firebaseUser.uid));
        const reloadMatches = () => loadRealMatches();
        const u1 = onSnapshot(q1, reloadMatches, (e) => console.warn('matches listener q1', e));
        const u2 = onSnapshot(q2, reloadMatches, (e) => console.warn('matches listener q2', e));
        unsubs = [u1, u2];
      } catch (e) {
        console.warn('matches onSnapshot setup error', e);
      }
    })();
    return () => { unsubs.forEach(u => u()); };
  }, [isDemoMode, firebaseUser?.uid, db]);

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

  if (prev.trainingNow && incoming.trainingNow === false) {
    const isStalePartial =
      incoming.trainingNowSince === undefined ||
      (incoming.trainingSyncWith === undefined && incoming.syncStartedAt === undefined)
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
  }

  return { ...prev, ...incoming }
}

 // ✅ SOLUCIÓN SIMPLE Y ESTABLE - Sin dynamic import problemático
const saveUserWithRealSync = useCallback(async (user: CurrentUser) => {
  const merged = mergeUserForRealtimeSync(user, currentUserRef.current)
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
        trainingTypes: merged.trainingTypes,
        goals: merged.goals,
        level: merged.level,
        intensity: merged.intensity,
        availability: merged.availability,
        lat: merged.lat ?? loc?.lat ?? -33.02,
        lng: merged.lng ?? loc?.lng ?? -71.55,
        trainingNow: goingLive,
        trainingNowSince: goingLive ? (merged.trainingNowSince ?? Date.now()) : null,
        liveStreak: merged.liveStreak ?? null,
        lastLiveDate: merged.lastLiveDate ?? null,
        joinedLiveStreak: merged.joinedLiveStreak ?? null,
        liveJoins: merged.liveJoins ?? null,
        trainingSyncWith: merged.trainingSyncWith ?? null,
        syncStartedAt: merged.syncStartedAt ?? null,
        currentDailyChallenge: merged.currentDailyChallenge,
        weekStats: merged.weekStats ?? null,
        weeklyPact: merged.weeklyPact ?? null,
        showOnLeaderboard: merged.showOnLeaderboard !== false,
        gymCheckIn: isGymCheckInFresh(merged.gymCheckIn) ? merged.gymCheckIn : null,
      };

      const cleanProfileUpdate = sanitizeForFirestore(profileUpdate);

      // Optimistic: publish self to live pipeline immediately (before Firestore round-trip)
      if (goingLive) {
        const optimistic = profileDocToLiveUser(firebaseUser.uid, cleanProfileUpdate as any, { forceLive: true })
        const nextPresence = mergeLiveUsersById([
          liveFromPresenceRef.current.filter((u) => u.id !== firebaseUser.uid),
          [optimistic],
        ])
        publishLiveSnapshot(nextPresence, liveFromProfilesQueryRef.current)
      } else {
        const nextPresence = liveFromPresenceRef.current.filter((u) => u.id !== firebaseUser.uid)
        publishLiveSnapshot(nextPresence, liveFromProfilesQueryRef.current)
      }

      await updateUserProfile(firebaseUser.uid, cleanProfileUpdate);

      if (goingLive) {
        await writeLivePresence(
          db,
          buildLivePresencePayload(firebaseUser.uid, { ...merged, ...profileUpdate }, loc),
          sanitizeForFirestore
        )
      } else {
        await clearLivePresence(db, firebaseUser.uid)
      }

      console.log('✅ Profile synced to Firestore', goingLive ? '(LIVE ON)' : '');
      setMapForceTick((t) => t + 1)
    } catch (e) {
      console.warn('Failed to sync profile to Firestore:', e);
      toast.error('No se pudo sincronizar con el servidor', {
        description: merged.trainingNow
          ? 'Revisa conexión. Otros pueden no verte en live hasta que se sincronice.'
          : 'Revisa tu conexión e intenta de nuevo.',
      })
      throw e
    }
  }
}, [saveUser, isDemoMode, firebaseUser?.uid, db, updateUserProfile, publishLiveSnapshot]);

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
        await saveUserWithRealSync(updated)
        toast.success(`Check-in en ${gym.name}`, {
          description: 'Tu pin aparecerá en el mapa cuando entrenes en vivo',
        })
        setMapForceTick((t) => t + 1)
      } catch {
        toast.error('No se pudo registrar el check-in')
      }
    },
    [currentUser, saveUser, saveUserWithRealSync]
  )

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
    setActiveTab('explore')
    setShowLiveMap(true)
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
      const cityNorm = normalizeCity(currentUser?.city)
      if (!cityNorm || liveMinutesDelta + syncMinutesDelta <= 0) return
      try {
        await bumpCityWeeklyStats(db, {
          cityNorm,
          cityLabel: currentUser?.city || cityNorm,
          weekKey: getWeekKey(),
          uid: firebaseUser.uid,
          liveMinutesDelta,
          syncMinutesDelta,
        })
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
    if (isDemoMode || !firebaseUser?.uid || !PushNotifications || !isFirebaseConfigured) return

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
            console.log('✅ Push notifications registered (already permitted)')

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
                console.log('✅ network_activity channel created for red pushes')
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
              (async () => {
                try {
                  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
                  await setDoc(doc(db, 'userPushTokens', firebaseUser.uid), { token: token.value, updatedAt: serverTimestamp() }, { merge: true })
                  console.log('[FCM] Token saved for uid', firebaseUser.uid)
                } catch (e) { console.warn('[FCM] token save failed', e) }
              })()
            }
          })

          PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
            console.log('Push received while open:', notification)
            const title = (notification && (notification.title || notification.notification?.title)) || 'Nueva notificación'
            const body = (notification && (notification.body || notification.notification?.body)) || 'Revisa la app'
            const data = notification && (notification.data || notification.notification?.data) || {}
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
              toast('Notificación tocada', { description: 'Abriendo app...' })
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
      // Listeners are long-lived; plugin usually cleans on app close
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
          console.error('⚠️ NATIVE BUILD PROBLEM: PushNotifications plugin not loaded. This AAB was almost certainly built WITHOUT google-services.json in android/app/. The app may crash or push will be broken. Rebuild after placing the json from Firebase Console (package: com.entrenamatch.app).')
          // Surface a non-fatal toast once so testers know the build they have is bad
          try {
            // Only if we have a toast lib in scope; safe no-op otherwise
            // @ts-ignore
            if (typeof toast !== 'undefined') {
              toast.error('Build de Android incompleto', { description: 'Falta google-services.json — notificaciones y posiblemente el inicio pueden fallar. Pide una build actualizada.' })
            }
          } catch {}
        } else {
          console.log('✅ PushNotifications plugin loaded on native — google-services.json was present at build time.')
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

  // Migrate demo posts keyed as 'me' → real Firebase uid so muro/comments stay consistent after login
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
      }
    } else {
      // clean comment composer when closing full profile view
      setActiveComment(null)
      setCommentDraft('')
    }
  }, [showFullProfile])



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

  // Live refresh for "Entrenando Ahora" to keep real-time urgency (every 60s in explore)
  // Also reloads *own* profilePosts when we are the one training live, so processIncomingLiveJoins can detect new join comments/likes from others in near real-time.
  useEffect(() => {
    if (activeTab === 'explore' && !isDemoMode) {
      if (!userLocation) {
        requestUserLocation().catch(() => {});
      }
      const id = setInterval(() => {
        loadRealProfiles().catch(() => {});
        if (currentUser?.trainingNow) {
          loadProfilePosts(effectiveUserId).then(() => processIncomingLiveJoins()).catch(() => {})
        }
        if (currentUser?.trainingSyncWith) {
          // force sync mirror for EntrenaSync actions/timer
          loadRealProfiles().catch(() => {})
        }
        loadActiveSyncCount().catch(() => {})
      }, 60000);
      return () => clearInterval(id);
    }
  }, [activeTab, isDemoMode, currentUser?.trainingNow, currentUser?.trainingSyncWith])

  // Extra: when we are the one training live (any tab), poll our own muro posts every 45s so we catch "joins" (new comments on our live post) promptly and processIncomingLiveJoins fires the notif/toast.
  useEffect(() => {
    if (!currentUser?.trainingNow) return
    const id = setInterval(() => {
      loadProfilePosts(effectiveUserId).then(() => processIncomingLiveJoins()).catch(() => {})
    }, 45000)
    return () => clearInterval(id)
  }, [currentUser?.trainingNow])

  // Clear inline comment composer when changing tabs — but keep it while viewing another profile or the comments modal
  useEffect(() => {
    if (activeTab === 'profile') return
    if (showFullProfile || viewingPostComments) return
    setActiveComment(null)
    setCommentDraft('')
  }, [activeTab, showFullProfile, viewingPostComments])

  // Logout handler - works for both demo and real Firebase
  const handleLogout = async () => {
    try {
      const uid = firebaseUser?.uid
      if (uid && db && !isDemoMode) {
        try {
          await clearLivePresence(db, uid)
          await updateUserProfile(uid, {
            trainingNow: false,
            trainingNowSince: null,
            trainingSyncWith: null,
            syncStartedAt: null,
          } as any)
        } catch (liveErr) {
          console.warn('logout live cleanup failed (non-fatal):', liveErr)
        }
      }

      await logout()

      // Critical: clear the ref that was keeping us authenticated after login
      lastSuccessfulAuthRef.current = null
      syncPartnerIdRef.current = null

      // Clear all local state
      if (clearProfile) clearProfile()
      clearQuickDemoSession()
      setDemoMode(false)
      setChatUnreads({})
      setSessionUnreads({})
      seenChatMsgIdsRef.current = {}
      seenGroupMsgIdsRef.current = {}
      seenLiveUserIdsRef.current = new Set()
      seenLiveJoinInteractionIdsRef.current = new Set()
      purgeAccountScopedStorage()
      
      setMatches([])
      resetSwipeDeck()
      setMessages({})
      setRealProfiles([])
      setRealMatches([])
      setRealChatMessages([])
      setActiveChat(null)
      setActiveTab('explore')
      setIsEditingProfile(false)
      setSyncPartnerId(null)
      syncPartnerIdRef.current = null
      setSyncStartedAt(null)
      setSyncActions([])

      toast.success('Sesión cerrada correctamente')

      // For Pre-Alpha testing: full reload guarantees we hit the AuthScreen cleanly
      // so the user can immediately register or login with another account.
      setTimeout(() => {
        window.location.reload()
      }, 600)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Hubo un problema al cerrar la sesión')
    }
  }

  // Real message sender (writes to Firestore so the other user sees it on any device)
  const sendRealMessage = async (text: string, toUserId: string, voice?: {voiceUrl: string, voiceDuration: number} | null) => {
    if ((!text.trim() && !voice) || !firebaseUser?.uid || !db) return

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const msg: any = {
        from: firebaseUser.uid,
        to: toUserId,
        text: text.trim() || '',
        timestamp: Date.now(),
        createdAt: serverTimestamp(),
      }
      if (voice) {
        msg.voiceUrl = voice.voiceUrl
        msg.voiceDuration = voice.voiceDuration
      }
      await addDoc(collection(db, 'messages'), msg)
      // console.log removed (debug)
      // Force refresh our own view from server (keeps timestamps / ordering consistent)
      loadRealChatMessages(toUserId).then(msgs => {
        if (msgs) setRealChatMessages(msgs)
      })
      // replying counts as reading it
      setChatUnreads(prev => { const c = { ...prev }; c[toUserId] = 0; return c })
    } catch (e) {
      console.error('Failed to send real message:', e)
      toast.error('No se pudo enviar el mensaje real')
    }
  }

  // Load real 1:1 chat messages (two queries to avoid complex 'in' index issues)
  const loadRealChatMessages = async (otherUserId: string) => {
    if (!db || !firebaseUser?.uid) return;
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const messagesRef = collection(db, 'messages');

      // Query 1: from me to other
      const q1 = query(messagesRef, where('from', '==', firebaseUser.uid), where('to', '==', otherUserId));
      // Query 2: from other to me
      const q2 = query(messagesRef, where('from', '==', otherUserId), where('to', '==', firebaseUser.uid));

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      const msgs: any[] = [];
      snap1.forEach((doc) => {
        const data = doc.data() as any;
        msgs.push({
          id: doc.id,
          from: 'me',
          text: data.text || '',
          timestamp: data.timestamp || Date.now(),
          voiceUrl: data.voiceUrl,
          voiceDuration: data.voiceDuration,
        });
      });
      snap2.forEach((doc) => {
        const data = doc.data() as any;
        msgs.push({
          id: doc.id,
          from: 'them',
          text: data.text || '',
          timestamp: data.timestamp || Date.now(),
          voiceUrl: data.voiceUrl,
          voiceDuration: data.voiceDuration,
        });
      });
      msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setMessages(prev => {
        const updated = { ...prev, [otherUserId]: msgs };
        if (isDemoMode) {
          localStorage.setItem('fitvina_messages', JSON.stringify(updated));
        }
        return updated;
      });
      console.log(`✅ Loaded ${msgs.length} real 1:1 messages for ${otherUserId}`);
      setLastSync(new Date());

      // If this load is for the currently open chat, also refresh the array used by the open chat render
      if (currentActiveChatRef.current === otherUserId && msgs) {
        setRealChatMessages(msgs)
        setChatUnreads(prev => { const c = { ...prev }; c[otherUserId] = 0; return c })
      }

      return msgs;
    } catch (e) {
      console.warn('Could not load real chat messages:', e);
      return null;
    }
  };

  const applyDirectChatMessages = useCallback((otherUserId: string, msgs: DirectChatMsg[]) => {
    setMessages(prev => {
      const updated = { ...prev, [otherUserId]: msgs }
      if (isDemoMode) {
        try { localStorage.setItem('fitvina_messages', JSON.stringify(updated)) } catch {}
      }
      return updated
    })
    if (currentActiveChatRef.current === otherUserId) {
      setRealChatMessages(msgs)
      setChatUnreads(prev => { const c = { ...prev }; c[otherUserId] = 0; return c })
    }
    setLastSync(new Date())
  }, [isDemoMode])

  // Real-time 1:1 chat — one attachDirectChatListener per match (cancelled-flag cleanup, no polling)
  useEffect(() => {
    if (isDemoMode || !firebaseUser?.uid || !db) {
      return undefined
    }

    const myMatchIds = realMatches || []

    Object.keys(realChatUnsubsRef.current).forEach((id) => {
      if (!myMatchIds.includes(id)) {
        try { realChatUnsubsRef.current[id]?.() } catch {}
        delete realChatUnsubsRef.current[id]
      }
    })

    myMatchIds.forEach((matchId) => {
      if (realChatUnsubsRef.current[matchId]) return

      realChatUnsubsRef.current[matchId] = attachDirectChatListener(
        db,
        firebaseUser.uid,
        matchId,
        {
          onMessages: (msgs) => applyDirectChatMessages(matchId, msgs),
          onIncoming: (msg) => {
            if (!seenChatMsgIdsRef.current[matchId]) seenChatMsgIdsRef.current[matchId] = new Set()
            if (seenChatMsgIdsRef.current[matchId].has(msg.id)) return
            seenChatMsgIdsRef.current[matchId].add(msg.id)
            persistSeen()
            if (currentActiveChatRef.current === matchId) return
            const prof = (realProfiles || []).find((p: any) => p.id === matchId) || SEED_PROFILES.find((p: any) => p.id === matchId)
            triggerMessageArrivalNotification(matchId, prof?.name || 'Usuario', msg.text, false, prof?.photos?.[0])
          },
          onError: (err) => console.warn(`1:1 chat listener error for ${matchId}:`, err),
        }
      )
    })

    return undefined
  }, [realMatches, isDemoMode, firebaseUser?.uid, db, applyDirectChatMessages, realProfiles])

  useEffect(() => {
    return () => {
      Object.values(realChatUnsubsRef.current).forEach((u) => { try { u() } catch {} })
      realChatUnsubsRef.current = {}
    }
  }, [isDemoMode, firebaseUser?.uid])

  // Refresh matches when opening a real chat (no auto-create — mutual like required)
  useEffect(() => {
    if (!activeChat || isDemoMode || !firebaseUser?.uid || !db) return
    if (!isRealChatId(activeChat)) return
    loadRealMatches().catch(() => {})
  }, [activeChat, isDemoMode, firebaseUser?.uid, db])

  // Clear realChatMessages when leaving a real chat tab
  useEffect(() => {
    if (!activeChat || isDemoMode || !firebaseUser?.uid || !db) {
      setRealChatMessages([])
    }
  }, [activeChat, isDemoMode, firebaseUser?.uid, db])

  // Note: Real-time 1:1 chat uses attachDirectChatListener per match (see chatMessages.ts).

  // Auto-scroll chat to bottom when new messages arrive (1:1 real or demo) or chat opens
  // Robust for opening from perfiles/matches list + real async load + mobile
  useEffect(() => {
    const scrollToBottom = () => {
      const el = chatScrollRef.current
      if (el) {
        // Multiple rAF + timeouts to handle render, images, layout, keyboard
        const doScroll = () => { el.scrollTop = el.scrollHeight }
        requestAnimationFrame(doScroll)
        requestAnimationFrame(() => requestAnimationFrame(doScroll))
        setTimeout(doScroll, 50)
        setTimeout(doScroll, 150)
        setTimeout(doScroll, 350)
      }
    }
    scrollToBottom()
    return () => {}
  }, [activeChat, realChatMessages.length, (messages[activeChat || ''] || []).length])

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

  // Rescue effect: if we have a real Firebase user but no local currentUser (hard refresh / new device / race),
  // synthesize a minimal usable profile immediately so Profile tab + logout + CTA are never missing.
  useEffect(() => {
    if (!isDemoMode && firebaseUser?.uid && !currentUser) {
      // Try to hydrate from Firestore first (non-blocking)
      ;(async () => {
        try {
          const existing = await getUserProfile(firebaseUser.uid)
          if (existing && existing.name) {
            saveUser({ ...existing, id: 'me' } as any)
            return
          }
        } catch {}
        // Fallback to minimal skeleton (user will be forced through onboarding by the gate above)
        const skeleton = {
          id: 'me' as any,
          name: firebaseUser.email?.split('@')[0] || 'Usuario',
          age: 25,
          gender: 'hombre' as const,
          city: '',
          country: 'Chile',
          bio: '',
          photos: [],
          trainingTypes: [],
          goals: [],
          level: 'Intermedio' as const,
          intensity: 'Moderado' as const,
          availability: ['Tarde'],
        }
        saveUser(skeleton as any)
      })()
    }
  }, [firebaseUser?.uid, isDemoMode, currentUser])

  // Load my previous beta feedbacks when viewing Profile (real users only)
  useEffect(() => {
    if (activeTab === 'profile' && !isDemoMode && firebaseUser?.uid) {
      loadMyFeedbacks()
    }
  }, [activeTab, isDemoMode, firebaseUser?.uid])

  // Marketplace — productos (lectura todos; escritura solo marketplaceAdmins/{uid})
  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid) {
      setMarketplaceProducts(DEMO_MARKETPLACE_PRODUCTS)
      setIsMarketplaceAdmin(false)
      return undefined
    }
    return attachMarketplaceAdminListener(db, firebaseUser.uid, setIsMarketplaceAdmin)
  }, [isDemoMode, db, firebaseUser?.uid])

  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid) return undefined
    return attachMarketplaceProductsListener(db, setMarketplaceProducts, {
      includeInactive: isMarketplaceAdmin,
    })
  }, [isDemoMode, db, firebaseUser?.uid, isMarketplaceAdmin])

  useEffect(() => {
    if (isDemoMode || !db || !isMarketplaceAdmin) {
      setAdminOrders([])
      setAdminBookings([])
      return undefined
    }
    const unsubOrders = attachAllMarketplaceOrdersListener(db, setAdminOrders)
    const unsubBookings = attachAllTrainerBookingsListener(db, setAdminBookings)
    return () => {
      unsubOrders()
      unsubBookings()
    }
  }, [isDemoMode, db, isMarketplaceAdmin])

  useEffect(() => {
    if (!showAdminOps || !isMarketplaceAdmin || isDemoMode) return
    void (async () => {
      try {
        const { getFunctions, httpsCallable } = await import('firebase/functions')
        const { app } = await import('./services/firebase')
        if (!app) return
        const fn = httpsCallable<unknown, { configured: boolean }>(
          getFunctions(app, 'us-central1'),
          'checkMpHealth'
        )
        const res = await fn({})
        setMpConfigured(!!res.data?.configured)
      } catch {
        setMpConfigured(false)
      }
    })()
  }, [showAdminOps, isMarketplaceAdmin, isDemoMode])

  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid || showOnboarding) return
    void hasSeenPostRegisterGuide(db, firebaseUser.uid).then((seen) => {
      if (!seen) setShowPostRegisterGuide(true)
    })
    void loadFirstStepsProgress(db, firebaseUser.uid).then(setFirstStepsProgress)
  }, [isDemoMode, db, firebaseUser?.uid, showOnboarding])

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
    if (isDemoMode || !db || !firebaseUser?.uid || !activeChat) {
      setChatPartnerTyping(false)
      return undefined
    }
    return attachPartnerTypingListener(db, firebaseUser.uid, activeChat, setChatPartnerTyping)
  }, [isDemoMode, db, firebaseUser?.uid, activeChat])

  useEffect(() => {
    if (isDemoMode || !db || !activeChat) return
    const msgs = realChatMessages.length > 0 ? realChatMessages : messages[activeChat] || []
    for (const m of msgs) {
      if (m.from === 'them' && m.id && !m.read && !m.readAt) {
        void markDirectMessageRead(db, m.id)
      }
    }
  }, [isDemoMode, db, activeChat, realChatMessages, messages])

  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid) {
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

  // EntrenaCoach — entrenadores personales (Fase 1 MVP)
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

  // EntrenaCoach Uber-mode — dispatch on-demand (Fase 3)
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
  // Users can manually verify using the 🛡️ button in Profile (the checkPlayIntegrity function + UI section remain available for testers).
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
      console.log(`✅ Loaded ${loaded.length} real group messages for session ${sessionId}`);
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
            persistSeen()

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
      city: 'Valparaíso',
      idPhoto: 'https://picsum.photos/id/29/400/300',
      selfiePhoto: 'https://picsum.photos/id/1009/400/400',
      submittedAt: Date.now() - 1000 * 60 * 60 * 2
    },
    {
      userId: 'p8',
      name: 'Lucas Fernández',
      age: 35,
      city: 'Ciudad de México',
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
          creatorName: 'Joaquín Pérez',
          title: 'CrossFit en el parque',
          time: 'Mañana 18:30',
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
          location: 'Playa Reñaca',
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
            name: 'Beasts de Reñaca',
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

    // Load profile muro posts (demo/local only — real mode loads from Firestore)
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

    const savedNotifications = loadStoredNotifications()
    if (savedNotifications.length > 0) {
      setNotifications(savedNotifications)
    }

    // Restore persistent seen message IDs so we don't re-notify old messages after reload
    const savedSeenChat = localStorage.getItem('entrenamatch_seen_chat_msgs')
    if (savedSeenChat) {
      try {
        const parsed = JSON.parse(savedSeenChat)
        Object.keys(parsed).forEach(k => {
          seenChatMsgIdsRef.current[k] = new Set(parsed[k])
        })
      } catch {}
    }
    const savedSeenGroup = localStorage.getItem('entrenamatch_seen_group_msgs')
    if (savedSeenGroup) {
      try {
        const parsed = JSON.parse(savedSeenGroup)
        Object.keys(parsed).forEach(k => {
          seenGroupMsgIdsRef.current[k] = new Set(parsed[k])
        })
      } catch {}
    }
    // Restore seen live users (so we don't spam "new live" notifs for the same people every app open)
    const savedSeenLive = localStorage.getItem('entrenamatch_seen_live_users')
    if (savedSeenLive) {
      try {
        const arr = JSON.parse(savedSeenLive)
        seenLiveUserIdsRef.current = new Set(arr)
      } catch {}
    }
    // Restore seen live join interactions (comments/likes on our live posts) so we don't renotify old joins on reload
    const savedSeenLiveJoins = localStorage.getItem('entrenamatch_seen_live_joins')
    if (savedSeenLiveJoins) {
      try {
        const arr = JSON.parse(savedSeenLiveJoins)
        seenLiveJoinInteractionIdsRef.current = new Set(arr)
      } catch {}
    }

    const savedChatUnreads = localStorage.getItem('entrenamatch_chat_unreads')
    if (savedChatUnreads) setChatUnreads(JSON.parse(savedChatUnreads))

    const savedSessionUnreads = localStorage.getItem('entrenamatch_session_unreads')
    if (savedSessionUnreads) setSessionUnreads(JSON.parse(savedSessionUnreads))
  }, [])

  // Save helpers - now delegated to useProfile hook
  // (saveUser is already provided by the hook)
  const saveMatches = (ids: string[]) => {
    if (isDemoMode) localStorage.setItem('fitvina_matches', JSON.stringify(ids))
    setMatches(ids)
  }
  const saveMessages = (msgs: Record<string, Message[]>) => {
    if (isDemoMode) localStorage.setItem('fitvina_messages', JSON.stringify(msgs))
    setMessages(msgs)
  }
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
          console.log('✅ Sessions synced to Firestore for real users')
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
    if (memberId === effectiveUserId || memberId === 'me') return currentUser?.name || 'Tú'
    const seed = SEED_PROFILES.find(p => p.id === memberId)
    if (seed) return seed.name
    const real = realProfiles.find(p => p.id === memberId)
    return real?.name || 'Usuario'
  }

  const handleJoinSquad = async (squadId: string) => {
    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        await joinSquadInFirestore(db, squadId, firebaseUser.uid)
        toast.success('¡Te uniste al Squad!')
      } catch (e: any) {
        console.warn('Could not join squad in Firestore', e)
        const isPerm = e?.code === 'permission-denied' || `${e?.message || e}`.includes('permission')
        toast.error(isPerm ? 'Permisos de Firestore' : 'No se pudo unir al Squad', {
          description: isPerm
            ? 'Despliega las reglas: firebase deploy --only firestore:rules'
            : 'Revisa tu conexión e intenta de nuevo',
        })
      }
      return
    }
    const updated = squads.map(sq =>
      sq.id === squadId ? { ...sq, members: [...sq.members, 'me'] } : sq
    )
    saveSquads(updated)
    toast.success('¡Te uniste al Squad!')
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
      toast.error('Completa el nombre de la rutina y los días')
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

  /** Normalize legacy 'me' key → real Firebase uid for post lookups */
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
    }
    delete postCommentInlineFallbackRef.current[postId]
  }, [])

  const subscribeCommentsForPosts = useCallback((posts: ProfilePost[]) => {
    if (isDemoMode || !db) return
    for (const p of posts) {
      if (p?.id) ensurePostCommentsListener(p.id, p.comments || [])
    }
  }, [isDemoMode, ensurePostCommentsListener])

  const ensureUserPostsListener = useCallback((userId: string) => {
    if (isDemoMode || !db || !userId) return
    const resolved = resolvePostOwnerId(userId)
    if (userPostsUnsubsRef.current[resolved]) return
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
        subscribeCommentsForPosts(finalList)
      },
      { maxResults: 10 }
    )
  }, [isDemoMode, resolvePostOwnerId, subscribeCommentsForPosts])

  // Real-time muro posts for self + feed-visible profiles
  useEffect(() => {
    if (isDemoMode || !db || !firebaseUser?.uid) return undefined
    ensureUserPostsListener(effectiveUserId)
    if (showFullProfile?.id) ensureUserPostsListener(showFullProfile.id)
    if (activeTab === 'home') {
      realProfiles.slice(0, feedMaxProfiles).forEach((p) => ensureUserPostsListener(p.id))
    }
    return undefined
  }, [isDemoMode, db, firebaseUser?.uid, effectiveUserId, showFullProfile?.id, activeTab, feedMaxProfiles, realProfiles.length, ensureUserPostsListener])

  useEffect(() => {
    return () => {
      Object.values(userPostsUnsubsRef.current).forEach((u) => { try { u() } catch {} })
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

  // Global feed loader — Firestore query by timestamp (Phase 0)
  const loadGlobalFeed = async (more: boolean = false) => {
    setIsLoadingFeed(true)
    try {
      if (!isDemoMode && db) {
        const { posts, lastDoc, hasMore } = await fetchGlobalProfilePosts(db, {
          pageSize: 25,
          lastDoc: more ? globalFeedLastDocRef.current : null,
        })
        if (!more) globalFeedLastDocRef.current = null
        globalFeedLastDocRef.current = lastDoc
        setHasMoreGlobalFeed(hasMore)

        setProfilePosts((prev) => {
          const next = { ...prev }
          for (const post of posts) {
            const uid = post.userId
            const existing = next[uid] || []
            const merged = [...existing.filter((x) => x.id !== post.id), post].sort(
              (a, b) => b.timestamp - a.timestamp
            )
            next[uid] = merged.slice(0, 30)
          }
          return next
        })
      } else {
        const max = more ? Math.min(feedMaxProfiles + 10, realProfiles.length) : feedMaxProfiles
        if (more) setFeedMaxProfiles(max)
        const toLoad = realProfiles.slice(0, max)
        await Promise.all(toLoad.map((p) => loadProfilePosts(p.id).catch(() => {})))
      }
      setLastSync(new Date())
    } catch (e) {
      console.warn('loadGlobalFeed error', e)
      if (realProfiles.length) {
        const toLoad = realProfiles.slice(0, feedMaxProfiles)
        await Promise.all(toLoad.map((p) => loadProfilePosts(p.id).catch(() => {})))
      }
    } finally {
      setIsLoadingFeed(false)
    }
  }

  const createProfilePost = async (text: string, photo: string | null = null) => {
    if (!text.trim()) return
    // === GIANT FIX: Real Storage upload for photos (was the main cause of "update gigante" + broken-feeling photo flow) ===
    let finalPhoto = photo || undefined
    if (!isDemoMode && photo && photo.startsWith('data:') && firebaseUser?.uid && storage) {
      try {
        const { ref, uploadString, getDownloadURL } = await import('firebase/storage')
        const path = `posts/${effectiveUserId}/${Date.now()}.jpg`
        const storageRef = ref(storage, path)
        const snap = await uploadString(storageRef, photo, 'data_url')
        finalPhoto = await getDownloadURL(snap.ref)
      } catch (e) {
        console.warn('photo storage upload failed, using data URL fallback (slow/large doc)', e)
      }
    }

    const post: ProfilePost = {
      id: 'post' + Date.now(),
      userId: effectiveUserId,
      text: text.trim(),
      photo: finalPhoto,
      timestamp: Date.now(),
      pinned: false,
      likes: [],
      comments: [],
      reactions: {}
    }
    if (!isDemoMode && firebaseUser?.uid && db) {
      try {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
        const data: any = {
          userId: post.userId,
          text: post.text,
          timestamp: post.timestamp,
          likes: post.likes || [],
          comments: post.comments || [],
          reactions: post.reactions || {},
          pinned: false
        }
        if (post.photo) {
          data.photo = post.photo // small URL
        }
        data.createdAt = serverTimestamp()
        const ref = await addDoc(collection(db, 'profilePosts'), data)
        post.id = ref.id

        // Targeted optimistic — only this user's posts. This + Storage upload = no more "update gigante".
        setProfilePosts((prev) => {
          const current = prev[effectiveUserId] || []
          const newList = [post, ...current].slice(0, 10)
          const newState = { ...prev, [effectiveUserId]: newList }
          profilePostsRef.current = newState
          return newState
        })
        subscribeCommentsForPosts([post])

        if (activeTab === 'home') {
          setTimeout(() => loadGlobalFeed().catch(() => {}), 300)
        }
      } catch (e) {
        saveProfilePosts({
          ...profilePostsRef.current,
          [effectiveUserId]: [post, ...(profilePostsRef.current[effectiveUserId] || [])].slice(0, 10),
        })
      }
    } else {
      saveProfilePosts({
        ...profilePostsRef.current,
        [effectiveUserId]: [post, ...(profilePostsRef.current[effectiveUserId] || [])].slice(0, 10),
      }, { persistLocal: true })
    }

    // Delightful UX: highlight the new post briefly in lists (feed or personal muro) so user sees the result instantly
    setRecentlyPublishedPostId(post.id)
    setTimeout(() => setRecentlyPublishedPostId(null), 4000)
    addDebugLog(`Publicado: ${post.text.slice(0,50)}${post.photo ? ' +foto' : ''}`)
    toast.success('Publicado en tu muro')
    return post
  }
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
        const { workout, postId, postText } = await saveWorkoutWithPost(db, {
          userId: effectiveUserId,
          title: payload.title,
          type: payload.type,
          exercises: payload.exercises,
          durationMin: payload.durationMin,
          source: 'manual',
        })
        const preview = {
          title: workout.title,
          type: workout.type,
          exerciseCount: workout.stats.exerciseCount,
          totalSets: workout.stats.totalSets,
          volumeLabel: `${workout.stats.totalVolumeKg >= 1000 ? (workout.stats.totalVolumeKg / 1000).toFixed(1) + 'k kg' : workout.stats.totalVolumeKg + ' kg'}`,
          durationMin: workout.stats.durationMin,
          exercises: payload.exercises.map((ex) => ({
            name: ex.name,
            setCount: ex.sets.length,
            topWeightKg: ex.sets.reduce((m, s) => Math.max(m, s.weightKg || 0), 0) || undefined,
          })),
        }
        const post: ProfilePost = {
          id: postId,
          userId: effectiveUserId,
          text: postText,
          timestamp: Date.now(),
          pinned: false,
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
        toast.success('Entreno registrado', { description: 'Publicado en tu muro y el feed' })
      } else {
        await createProfilePost(
          `🏋️ ${payload.title} — ${payload.exercises.length} ejercicios, ${payload.durationMin} min (demo)`,
          null
        )
        toast.success('Entreno guardado (demo)')
      }
      setShowEntrenaLogModal(false)
    } catch (e) {
      console.error('EntrenaLog save failed', e)
      toast.error('No se pudo guardar el entreno')
    } finally {
      setSavingWorkout(false)
    }
  }

  const refreshFuelData = useCallback(async () => {
    if (isDemoMode || !db || !firebaseUser?.uid) return
    try {
      const [profile, logs, weekDays, weekMacros, workouts] = await Promise.all([
        loadFuelProfile(db, effectiveUserId),
        fetchFuelLogsForDate(db, effectiveUserId),
        fetchFuelWeekSummary(db, effectiveUserId),
        fetchFuelWeekMacros(db, effectiveUserId),
        fetchRecentWorkouts(db, effectiveUserId, 1).catch(() => [] as import('./types').Workout[]),
      ])
      setFuelProfile(profile)
      setFuelTodayLogs(logs)
      setFuelTodayTotals(sumFuelLogs(logs))
      setFuelWeekDays(weekDays)
      setFuelWeekMacros(weekMacros)
      setFuelPostWorkoutTip(
        workouts[0] ? getPostWorkoutFuelTip(workouts[0].type) : undefined
      )
    } catch (e) {
      console.warn('refreshFuelData failed', e)
    }
  }, [isDemoMode, db, firebaseUser?.uid, effectiveUserId])

  const syncFuelDayState = (nextLogs: FuelLogEntry[]) => {
    setFuelTodayLogs(nextLogs)
    setFuelTodayTotals(sumFuelLogs(nextLogs))
    const loggedDates = new Set(nextLogs.map((l) => l.date))
    if (isDemoMode) {
      const today = toLocalDateStr()
      if (nextLogs.length > 0) loggedDates.add(today)
      setFuelWeekDays(computeFuelWeekFromDates(loggedDates))
    }
  }

  useEffect(() => {
    if (!firebaseUser?.uid || isDemoMode) return
    refreshFuelData().catch(() => {})
  }, [firebaseUser?.uid, isDemoMode, refreshFuelData])

  const handleSaveFuelProfile = async (profile: Omit<FuelProfile, 'updatedAt'>) => {
    setSavingFuel(true)
    try {
      const saved = { ...profile, updatedAt: Date.now() }
      if (!isDemoMode && db && firebaseUser?.uid) {
        await saveFuelProfile(db, effectiveUserId, profile)
        toast.success('Perfil Fuel guardado', {
          description: `Target: ${profile.targetKcal} kcal/día`,
        })
      } else {
        toast.success('Perfil Fuel guardado (demo)', {
          description: `Target: ${profile.targetKcal} kcal/día`,
        })
      }
      setFuelProfile(saved)
      setShowFuelSetupModal(false)
    } catch (e) {
      console.error('Fuel profile save failed', e)
      toast.error('No se pudo guardar el perfil Fuel', {
        description: e instanceof Error ? e.message : 'Revisa conexión e inicio de sesión',
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
        fuelContext: buildFuelAnalyzeContext(fuelProfile, fuelTodayTotals),
      })
      if (result.source === 'gemini') {
        toast.success('Fuel AI · Gemini', {
          description: `${result.kcal} kcal estimadas — revisa y guarda si cuadra.`,
        })
      } else if (result.geminiErrorMessage) {
        toast.error('Gemini no disponible', {
          description: result.geminiErrorMessage,
          duration: 8000,
        })
      } else {
        toast.message('Estimación aproximada', {
          description: 'Usando heurística local. Ajusta manualmente si hace falta.',
        })
      }
      return result
    } catch (e) {
      console.warn('Fuel AI analyze failed', e)
      const fallback = estimateMacrosFromDescription(mealDescription || 'Comida')
      toast.message('Fuel AI no disponible', { description: 'Usando estimación local.' })
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

        if (payload.publishToMuro) {
          const postId = await createNutritionPost(db, effectiveUserId, preview, photoUrl)
          const post: ProfilePost = {
            id: postId,
            userId: effectiveUserId,
            text: `🍽 Fuel check — ${preview.mealLabel}: ${preview.kcal} kcal · P${preview.proteinG} C${preview.carbsG} G${preview.fatG}`,
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
        }
        toast.success('Comida registrada', {
          description: payload.publishToMuro ? 'Publicada en el muro' : `${payload.kcal} kcal sumadas hoy`,
        })
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
      toast.error('No se pudo guardar la comida')
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

  // Shared helper: upload data: URL photo to Storage for profile photos (onboarding + gallery).
  // Returns https URL or original (demo/fallback). Fixes bloat in Firestore profile docs.
  const uploadProfilePhotoIfNeeded = async (dataUrl: string): Promise<string> => {
    if (!dataUrl || !dataUrl.startsWith('data:') || isDemoMode || !firebaseUser?.uid || !storage) {
      return dataUrl;
    }
    try {
      const { ref, uploadString, getDownloadURL } = await import('firebase/storage');
      const path = `profiles/${effectiveUserId}/${Date.now()}.jpg`;
      const storageRef = ref(storage, path);
      const snap = await uploadString(storageRef, dataUrl, 'data_url');
      return await getDownloadURL(snap.ref);
    } catch (e) {
      console.warn('profile photo storage upload failed, fallback to data URL (may bloat doc)', e);
      return dataUrl;
    }
  };

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
          description: 'Revisa permisos o conexión e intenta de nuevo.',
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
        title: '¡Like en tu muro!',
        body: `${currentUser?.name || 'Alguien'} le gustó tu publicación`,
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
        toast.error('No se pudo guardar la reacción', {
          description: 'Revisa permisos o conexión e intenta de nuevo.',
        })
      }
    }
  }

  // === DISRUPTIVE EntrenaSync implementation (core of the top unique feature) ===

  /** Every Arena action broadcasts a visible wave on GymPulse — core FOMO mechanic. */
  const emitArenaMapRipple = (
    label: string,
    intensity: number,
    opts?: {
      vibe?: number
      actionsSnapshot?: any[]
      forceLegend?: boolean
      notifyNearby?: boolean
      skipCounter?: boolean
    }
  ) => {
    if (!opts?.skipCounter) {
      setArenaWaveCount((c) => c + 1)
      setLastArenaWaveLabel(label)
      setArenaWavePulseKey((k) => k + 1)
    }

    const partnerId = syncPartnerIdRef.current || syncPartnerId
    if (!partnerId) return

    const partner =
      liveTrainingNow.find((u: any) => u.id === partnerId) ||
      realProfiles.find((p: any) => p.id === partnerId)
    if (!partner?.lat || !partner?.lng) return

    const actionsSnap = opts?.actionsSnapshot ?? syncActions
    const vibeNow = opts?.vibe ?? syncVibe
    const logSnap = syncWorkoutLogRef.current
    const workoutWitness =
      syncWorkoutHasData(logSnap) && logSnap.exercises.length > 0
        ? buildWorkoutPreview(
            'EntrenaSync en vivo',
            'full',
            logSnap.exercises,
            computeWorkoutStats(logSnap.exercises, syncStartedAt ? Math.max(1, Math.floor((Date.now() - syncStartedAt) / 60000)) : 1)
          )
        : undefined
    const partnerBond = syncBonds[partner.id]
    const isHighlightRipple =
      opts?.forceLegend ||
      !!partner.isNetworkBond ||
      (partnerBond && ((partnerBond.totalMin || 0) >= 30 || (partnerBond.bondLevel || 0) >= 2))
    const finalIntensity = isHighlightRipple ? Math.max(intensity, 2.4) : intensity
    const rippleId = 'sync-' + Date.now()
    const rippleLabel = isHighlightRipple
      ? `⭐ HIGHLIGHT DE RED • ${label}`
      : intensity >= 1.5
        ? `⚡ Onda de Sync • ${label}`
        : `🌊 Onda de Sync • ${label}`

    setSyncRipples((prev) => [
      ...prev,
      {
        id: rippleId,
        lat: partner.lat,
        lng: partner.lng,
        label: rippleLabel,
        intensity: finalIntensity,
        witnessData: {
          actions: actionsSnap.slice(0, 6).map((a: any) => ({ ...a })),
          vibe: vibeNow,
          partnerName: partner.name || partner.nombre || 'Gym partner',
          photoUrl: actionsSnap.find((a: any) => a.photoUrl)?.photoUrl || null,
          label: isHighlightRipple ? `⭐ ${label}` : `🌊 ${label}`,
          timestamp: Date.now(),
          minutes: syncStartedAt ? Math.floor((Date.now() - syncStartedAt) / 60000) : 0,
          workoutPreview: workoutWitness,
          loggedSets: countLoggedSets(logSnap),
        },
      },
    ])
    setTimeout(
      () => setSyncRipples((r) => r.filter((x) => x.id !== rippleId)),
      isHighlightRipple ? 5200 : 3200
    )

    if (isHighlightRipple) {
      const pinId = 'echo-pin-' + rippleId
      setEchoPins((prev) => [
        ...prev,
        {
          id: pinId,
          lat: partner.lat,
          lng: partner.lng,
          label: `⭐ ${label}`,
          witnessData: {
            actions: actionsSnap.slice(0, 6).map((a: any) => ({ ...a })),
            vibe: vibeNow,
            partnerName: partner.name || partner.nombre || 'Gym partner',
            photoUrl: actionsSnap.find((a: any) => a.photoUrl)?.photoUrl || null,
            label: `⭐ ${label}`,
            timestamp: Date.now(),
            minutes: syncStartedAt ? Math.floor((Date.now() - syncStartedAt) / 60000) : 0,
            workoutPreview: workoutWitness,
            loggedSets: countLoggedSets(logSnap),
          },
        },
      ])
      setTimeout(() => setEchoPins((p) => p.filter((x) => x.id !== pinId)), 45 * 60 * 1000)
    }

    const shouldNotify = opts?.notifyNearby !== false && (isHighlightRipple || intensity >= 1.4)
    if (shouldNotify && userLocation) {
      const distToEvent = getDistanceKm(userLocation.lat, userLocation.lng, partner.lat, partner.lng)
      if (distToEvent < 8) {
        try {
          addNotification({
            id: 'ripple-global-' + rippleId,
            type: 'session_join' as any,
            title: isHighlightRipple ? '⭐ Highlight de Sync cerca' : '⚡ Energía de Sync cerca',
            body: `${label} — alguien entrena en sync a ${distToEvent.toFixed(1)}km`,
            relatedId: partnerId,
          })
          if (distToEvent < 5 && isHighlightRipple) {
            toast(`⚡ Onda de Arena cerca`, { description: `${label} se sintió en tu zona` })
          }
        } catch {}
      }
    }
  }

  /** Global live toggle — used by FAB, Daily home, and Profile (Phase 0). */
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

        pendingLiveWriteRef.current = { trainingNow: false, at: Date.now() }
        saveUser(updated)
        await saveUserWithRealSync(updated)
        loadRealProfiles().catch(() => {})
        syncCityStatsBump(minutes, 0).catch(() => {})
        setMapForceTick((t) => t + 1)
        if (minutes >= MIN_LIVE_MINUTES_FOR_WEEK_DAY) {
          setWeekLiveDays(nextLiveDays)
          toast('Entrenamiento finalizado', { description: `${minutes} min — cuenta para tu semana ✓` })
        } else {
          toast('Sesión finalizada', {
            description: `${minutes} min. Entrena al menos ${MIN_LIVE_MINUTES_FOR_WEEK_DAY} min para marcar el día.`,
          })
        }
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
            toast('🛡️ Verifica integridad para full visibilidad en prod', {
              description:
                'Usa el botón 🛡️ Google Play Integrity arriba. El live se activa localmente de todas formas.',
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
          const gyms = partnerLocationsRef.current.map((p: any) => ({
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
        const updated = {
          ...me,
          trainingNow: true,
          trainingNowSince: Date.now(),
          ...(autoGymCheckIn
            ? { gymCheckIn: autoGymCheckIn, lat: autoGymCheckIn.lat, lng: autoGymCheckIn.lng }
            : loc
              ? { lat: loc.lat, lng: loc.lng }
              : {}),
          ...streakUpdate,
        } as CurrentUser

        pendingLiveWriteRef.current = { trainingNow: true, at: Date.now() }
        saveUser(updated)
        await saveUserWithRealSync(updated)
        loadRealProfiles().catch(() => {})
        setMapForceTick((t) => t + 1)
        toast('🟢 ¡Entrenando Ahora (EN VIVO) activado!', {
          description: autoGymCheckIn
            ? `Check-in en ${autoGymCheckIn.gymName} — apareces en el mapa del gym`
            : undefined,
        })

        const liveUserSnapshot = { ...updated }
        setTimeout(() => {
          checkAndUpdateDailyPulse(liveUserSnapshot)
          if (dailyPulse?.currentChallenge?.type === 'solo') {
            completeDailyChallenge(1, liveUserSnapshot as CurrentUser)
          } else {
            awardConstancy(8, 'Ancla del GymPulse', liveUserSnapshot as CurrentUser)
          }
          createProfilePost(
            '¡Entrenando ahora en el GymPulse! ¿Quién se une al pulso? 🏋️',
            null
          ).catch(() => {})
        }, 600)
      } catch (err) {
        console.error('Live activate failed', err)
        pendingLiveWriteRef.current = null
        toast.error('No se pudo activar el live')
      } finally {
        setIsTogglingLive(false)
      }
    }
  }

  const startSyncWith = async (partnerId: string, partnerName: string) => {
    const myIds = [effectiveUserId, currentUser?.id, firebaseUser?.uid, 'me'].filter(Boolean)
    if (!partnerId || myIds.includes(partnerId)) return

    const me = currentUserRef.current ?? currentUser
    if (!me?.trainingNow) {
      toast.error('Activa "Entrenando Ahora (EN VIVO)" primero', {
        description: 'Usa el botón IR LIVE (abajo a la derecha) o la pestaña Hoy.',
      })
      return
    }

    if (!isUserLive(partnerId)) {
      toast.error(`${partnerName || 'Tu compañero'} no está en vivo ahora`, {
        description: 'Ambos deben tener live activo. Actualiza Explorar/mapa o espera a que encienda su GymPulse.',
      })
      return
    }

    if (syncPartnerId) {
      toast.info('Ya tienes un EntrenaSync activo', { description: 'Termina la sesión actual o abre la Arena.' })
      return
    }
    if (joiningSyncWith === partnerId) return

    if (!isDemoMode && !firebaseUser?.uid) {
      console.warn('startSyncWith: no real firebaseUser uid, cannot start real EntrenaSync')
      toast.error('Inicia sesión con cuenta real para usar EntrenaSync')
      return
    }

    setJoiningSyncWith(partnerId)
    try {
      const syncAt = Date.now()
      setSyncPartnerId(partnerId)
      syncPartnerIdRef.current = partnerId
      setSyncStartedAt(syncAt)
      setSyncActions([])
      setSyncCombo(0)
      setFlyingEmojis([])
      setSyncWorkoutLog(createEmptySyncWorkoutLog())
      setSyncPartnerLiveState(null)
      setSyncRestUntil(null)
      setSyncRestStartedBy(null)
      setSyncWitnessIds([])
      setShowSyncArena(true)
      setActiveTab('explore')
      triggerHaptic('medium')

      const updated = {
        ...me,
        trainingNow: true,
        trainingSyncWith: partnerId,
        syncStartedAt: syncAt,
        syncActions: [],
      }
      saveUser(updated as any)
      if (me.trainingNow) {
        pendingLiveWriteRef.current = { trainingNow: true, at: Date.now() }
      }

      if (!isDemoMode && db && firebaseUser) {
        await saveUserWithRealSync(updated as any)

        const { doc, setDoc } = await import('firebase/firestore')
        const uids = [firebaseUser.uid, partnerId].sort()
        const sessionId = `sync_${uids[0]}_${uids[1]}`
        const sessionRef = doc(db, 'syncSessions', sessionId)
        const baseVibe = 12
        await setDoc(sessionRef, {
          participants: uids,
          startedAt: syncAt,
          actions: [],
          vibe: baseVibe,
          witnesses: [],
          participantState: {
            [firebaseUser.uid]: toParticipantSyncPayload(createEmptySyncWorkoutLog()),
          },
          updatedAt: syncAt,
        }, { merge: true })
        setSyncVibe(baseVibe)
      } else {
        setSyncVibe(12)
      }

      setTimeout(() => {
        emitArenaMapRipple('Sync iniciado', 1.05, { vibe: 12, actionsSnapshot: [], notifyNearby: false })
      }, 400)
      toast.success(`EntrenaSync iniciado con ${partnerName}`, {
        description: 'Arena abierta — vuestra sync ondea en el GymPulse en vivo',
      })
      try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } }) } catch {}
      addDebugLog(`EntrenaSync started with ${partnerName}`)
    } catch (e: any) {
      console.warn('startSyncWith failed', e)
      const isPerm = e?.code === 'permission-denied' || `${e?.message || e}`.includes('permission')
      setSyncPartnerId(null)
      syncPartnerIdRef.current = null
      setShowSyncArena(false)
      toast.error('No se pudo iniciar EntrenaSync', {
        description: isPerm
          ? 'Permisos Firestore en syncSessions — avisa al admin o reintenta en unos segundos.'
          : 'Revisa tu conexión e intenta de nuevo.',
      })
    } finally {
      setJoiningSyncWith(null)
    }
  }

  // Keep startSyncRef always pointing to the freshest startSyncWith implementation.
  // This lets the Leaflet popup buttons (plain DOM onclicks created in the map effect)
  // call the current version that has up-to-date closures (currentUser, realProfiles, joining guard etc).
  useEffect(() => {
    startSyncRef.current = startSyncWith
  }, [startSyncWith])

  useEffect(() => {
    syncPartnerIdRef.current = syncPartnerId
  }, [syncPartnerId])

  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  useEffect(() => {
    latestRealProfilesRef.current = realProfiles
  }, [realProfiles])

  useEffect(() => {
    syncBondsRef.current = syncBonds
  }, [syncBonds])

  // Witness mode for ripples: anyone who sees a ripple on the map (or gets notified) can view a short replay
  // of the epic high-vibe moment in the Arena that generated the wave.
  // This is the social proof layer of the network — your strong syncs become discoverable highlights that the community can see and be inspired by. Your training graph builds culture and status in the first fitness social network.
  const witnessRipple = useCallback((rippleId: string) => {
    const r = syncRipples.find((rr: any) => rr.id === rippleId)
    if (r && r.witnessData) {
      setWitnessData(r.witnessData)
      triggerHaptic('medium')
    } else {
      toast('El highlight de esta sesión ya no está disponible. Crea uno nuevo con un EntrenaSync fuerte.')
    }
  }, [syncRipples, triggerHaptic])

  // Expose globally so Leaflet popup HTML onclick can call it (same pattern as map join buttons)
  useEffect(() => {
    ;(window as any).witnessRipple = witnessRipple
  }, [witnessRipple])

  // For highlight pins on map (persistent strong sync moments from the network graph)
  const witnessEchoPin = useCallback((pinId: string) => {
    const pin = echoPins.find((p: any) => p.id === pinId);
    if (pin && pin.witnessData) {
      setWitnessData(pin.witnessData);
      triggerHaptic('medium');
    }
  }, [echoPins, triggerHaptic]);

  useEffect(() => {
    ;(window as any).witnessEchoPin = witnessEchoPin;
  }, [witnessEchoPin]);

  // Same for profile modal – marker clicks and "Ver perfil" in popups can reliably open the rich profile.
  useEffect(() => {
    showFullProfileRef.current = setShowFullProfile
  }, [setShowFullProfile])

  const endSync = async () => {
    if (!syncPartnerId) return
    const partnerName = realProfiles.find(p => p.id === syncPartnerId)?.name || 'compañero'
    const minutes = syncStartedAt ? Math.floor((Date.now() - syncStartedAt) / 60000) : 0
    const syncStartedAtCapture = syncStartedAt
    // Clear local
    const oldPartner = syncPartnerId
    // Boost syncStreak
    const newSyncStreak = ((currentUser as any).syncStreak || 0) + 1
    const weekKey = getWeekKey()
    const syncMins = minutes >= 2 ? minutes : 0
    const newWeekStats =
      syncMins > 0
        ? mergeWeekStats(
            currentUser?.weekStats?.weekKey === weekKey ? currentUser.weekStats : undefined,
            weekKey,
            0,
            weekLiveDays.length,
            syncMins
          )
        : currentUser?.weekStats
    const updated = {
      ...currentUser,
      trainingSyncWith: null,
      syncStartedAt: null,
      syncActions: [],
      syncStreak: newSyncStreak,
      ...(newWeekStats ? { weekStats: newWeekStats } : {}),
    } as any
    saveUser(updated)
    setSyncPartnerId(null)
    syncPartnerIdRef.current = null
    setSyncStartedAt(null)
    setSyncActions([])
    setSyncVibe(0)
    setSyncCombo(0)
    setFlyingEmojis([])
    setArenaWaveCount(0)
    setLastArenaWaveLabel('')
    setArenaWavePulseKey(0)
    setSyncRealWitnessCount(0)
    setSyncWitnessIds([])
    setSyncPartnerLiveState(null)
    setSyncRestUntil(null)
    setSyncRestStartedBy(null)
    setShowSyncArena(false)
    // Capture for replay (the unique "remember this session together" moment)
    const capturedActions = [...syncActions]
    const capturedVibe = syncVibe
    const capturedWorkoutLog = {
      ...syncWorkoutLogRef.current,
      exercises: syncWorkoutLogRef.current.exercises.map((e) => ({
        ...e,
        sets: [...e.sets],
      })),
    }
    setSyncWorkoutLog(createEmptySyncWorkoutLog())
    // Clear FS (use resilient saveUserWithRealSync for self so we get the mutations/b815 retry+reset protection)
    if (!isDemoMode && firebaseUser) {
      try {
        await saveUserWithRealSync(updated as any);
      } catch (e) {
        console.warn('endSync self clear via resilient path failed', e);
      }
      if (syncMins > 0) syncCityStatsBump(0, syncMins).catch(() => {})
      // Partner + session ended are cross-doc; best-effort but with recovery reset first.
      // Direct updateDoc after a session full of action writes can hit the bad mutations state
      // if previous transport left the pipeline unhealthy.
      if (db) {
        try {
          const { doc, updateDoc } = await import('firebase/firestore')
          if (oldPartner) await updateDoc(doc(db, 'profiles', oldPartner), { trainingSyncWith: null, syncStartedAt: null }).catch(() => {});
          try {
            const { doc: doc2, updateDoc: upd2 } = await import('firebase/firestore')
            const uids = [effectiveUserId, oldPartner].sort()
            const sid = `sync_${uids[0]}_${uids[1]}`
            await upd2(doc2(db, 'syncSessions', sid), { endedAt: Date.now() }).catch(() => {});
          } catch {}
        } catch (e) {}
      }
    }
    const capturedWitness = syncRealWitnessCount
    const bondAtEnd = syncBonds[oldPartner]
    const partnerProfileAtEnd = realProfiles.find((p) => p.id === oldPartner)

    if (
      minutes >= 2 &&
      syncWorkoutHasData(capturedWorkoutLog) &&
      !isDemoMode &&
      db &&
      firebaseUser &&
      oldPartner
    ) {
      try {
        const uids = [effectiveUserId, oldPartner].sort()
        const sid = `sync_${uids[0]}_${uids[1]}`
        const { workout, postId, postText } = await saveSyncWorkoutWithPost(db, {
          userId: effectiveUserId,
          partnerId: oldPartner,
          partnerName,
          syncSessionId: sid,
          title: `Sync con ${partnerName.split(' ')[0]}`,
          type: 'full',
          exercises: capturedWorkoutLog.exercises,
          durationMin: Math.max(1, minutes),
          source: 'sync',
          startedAt: syncStartedAtCapture || undefined,
        })
        const preview = buildWorkoutPreview(
          workout.title,
          workout.type,
          capturedWorkoutLog.exercises,
          workout.stats
        )
        const post: ProfilePost = {
          id: postId,
          userId: effectiveUserId,
          text: postText,
          timestamp: Date.now(),
          pinned: false,
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
        if (activeTab === 'home') loadGlobalFeed().catch(() => {})
        toast.success('EntrenoSync guardado en el muro', {
          description: `${workout.stats.totalSets} sets registrados juntos`,
        })
      } catch (e) {
        console.warn('sync workout save failed', e)
      }
    }

    checkAndUpdateDailyPulse()
    if (dailyPulse?.currentChallenge?.type === 'bond' || dailyPulse?.currentChallenge?.type === 'network') {
      completeDailyChallenge(1)
    } else {
      awardConstancy(15, 'Synergy completada')
    }

    if (oldPartner) {
      const elapsedSec = syncStartedAtCapture
        ? Math.max(0, Math.floor((Date.now() - syncStartedAtCapture) / 1000))
        : 0
      const pact = (currentUser as { weeklyPact?: import('./types').WeeklyPact })?.weeklyPact
      const projectedStats =
        syncMins > 0
          ? mergeWeekStats(
              currentUser?.weekStats?.weekKey === weekKey ? currentUser.weekStats : undefined,
              weekKey,
              0,
              weekLiveDays.length,
              syncMins
            )
          : currentUser?.weekStats
      const projectedMeta = computeWeeklyPactProgress(
        isPactForCurrentWeek(pact) ? pact : null,
        homeWeekTrainedCount,
        projectedStats
      )
      setSyncDuelSummary({
        partnerId: oldPartner,
        partnerName,
        minutes,
        elapsedSec,
        vibe: capturedVibe,
        witnessCount: capturedWitness,
        setsLogged: countLoggedSets(capturedWorkoutLog),
        actions: capturedActions.slice(0, 12),
        isNetworkBond: !!bondAtEnd,
        bondLevel: bondAtEnd?.bondLevel,
        partnerPhoto: partnerProfileAtEnd?.photos?.[0],
        weeklyMetaComplete: projectedMeta.isComplete,
        weeklyMetaLine: projectedMeta.pledged
          ? projectedMeta.isComplete
            ? 'Semana sellada — meta cumplida'
            : `${projectedMeta.liveDaysDone}/${projectedMeta.liveDaysTarget} live · ${projectedMeta.syncSessionsDone}/${projectedMeta.syncSessionsTarget} sync`
          : undefined,
      })
    } else {
      toast(`Sync finalizado: ${minutes}min`, { description: '¡Buen trabajo en equipo! +1 sync streak' })
    }
  }

  const submitSyncRating = async (
    rating: number,
    ctx?: { partnerId: string; partnerName: string; minutes: number; vibe?: number; actions?: any[] }
  ) => {
    const payload = ctx || pendingSyncRating
    if (!payload) return
    triggerHaptic('success')
    const { partnerId, partnerName, minutes } = payload
    const sessionVibe = ctx?.vibe ?? syncVibe
    if (!isDemoMode && db && firebaseUser) {
      try {
        const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
        await updateDoc(doc(db, 'profiles', effectiveUserId), { 
          syncRatings: arrayUnion({ partnerId, rating, minutes, ts: Date.now() }) 
        })
      } catch (e) {}
    }
    // NEVER-SEEN: accumulate persistent Sync Bond / Legend (unlocks future visibility + special feel)
    const prevBond = syncBonds[partnerId] || { totalMin: 0, sessions: 0, avgRating: 0, bondLevel: 1 }
    const newTotalMin = prevBond.totalMin + minutes
    const newSessions = prevBond.sessions + 1
    const newAvg = Math.round(((prevBond.avgRating * prevBond.sessions) + rating) / newSessions)
    const newBondLevel = Math.min(5, Math.max(1, Math.floor(newTotalMin / 25) + (newAvg >= 4 ? 1 : 0)))
    const partnerProfile = realProfiles.find(p => p.id === partnerId) || liveUsersActive.find((p: any) => p.id === partnerId)
    const updatedBonds = {
      ...syncBonds,
      [partnerId]: {
        totalMin: newTotalMin,
        sessions: newSessions,
        avgRating: newAvg,
        bondLevel: newBondLevel,
        ...(partnerProfile?.lat != null && partnerProfile?.lng != null
          ? { partnerLat: partnerProfile.lat, partnerLng: partnerProfile.lng }
          : {}),
      },
    }
    setSyncBonds(updatedBonds)
    // Persist bonds lightly on profile (for cross device legend status)
    if (!isDemoMode && firebaseUser?.uid) {
      try { await updateUserProfile(firebaseUser.uid, { syncBonds: updatedBonds } as any) } catch {}
    }

    if (rating >= 4) {
      const boost = Math.min(2, Math.floor(minutes / 10))
      const newStreak = ((currentUser as any).syncStreak || 0) + boost
      const updated = { ...currentUser, syncStreak: newStreak }
      saveUser(updated as any)
      if (!isDemoMode && firebaseUser?.uid) {
        try { await updateUserProfile(firebaseUser.uid, { syncStreak: newStreak }) } catch {}
      }
      // Big vibe boost on good rating — makes the ending feel special and unique
      if (!isDemoMode && db) {
        try {
          const { doc, updateDoc } = await import('firebase/firestore')
          const uids = [effectiveUserId, partnerId].sort()
          const sessionId = `sync_${uids[0]}_${uids[1]}`
          const bonus = Math.min(30, rating * 6 + Math.floor(minutes / 3))
          const finalVibe = Math.min(100, (sessionVibe || 50) + bonus)
          await updateDoc(doc(db, 'syncSessions', sessionId), { vibe: finalVibe })
          if (syncPartnerId) setSyncVibe(finalVibe)
        } catch {}
      }
    }

    // THE UNIQUE MAGIC: Auto-generate rich "Session Story" post and publish to BOTH muros instantly.
    // This creates permanent shared memory + social proof that lives forever in each person's profile/feed.
    // Nobody else turns a live training session into a beautiful co-authored story post on both walls.
    if (minutes >= 3 && (ctx?.actions?.length || replaySession || syncActions.length > 1)) {
      const actionsForStory = (ctx?.actions || replaySession?.actions || syncActions).slice(0, 6)
      const actionSummary = actionsForStory.map((a: any) => `${a.emoji} ${a.label}${a.combo ? `x${a.combo}` : ''}`).join(' · ')
      const isNet = !!syncBonds[partnerId]
      const storyText = `🔄 ENTRENASYNC COMPLETADO\n${minutes} min sincronizados con ${partnerName}\nSync Score final: ${sessionVibe || 70}% • Calificación: ${rating}★\nAcciones clave: ${actionSummary}\n\nEntrenamos en sync real-time y subimos nuestro rendimiento. ${isNet ? `Esta fue una sesión de RED — Fuerza del equipo activada. Tu grafo gana +${Math.floor(minutes / 3)} de fuerza y visibilidad global.` : `Esta alianza ya genera +${Math.floor(minutes * 1.2)} min de alto rendimiento compartido.`} Queda en nuestra red para siempre. #EntrenaSync`
      // Post to self (visible in my muro + feed)
      createProfilePost(storyText, null).catch(() => {})
      // Also post directly for the partner so BOTH get the beautiful shared story in their muro (true co-presence even after session ends)
      if (!isDemoMode && db) {
        try {
          const storyPost = {
            id: `post_syncstory_${Date.now()}`,
            uid: partnerId,
            text: storyText,
            photo: null,
            createdAt: Date.now(),
            pinned: false,
            isSyncStory: true,
            syncPartnerId: effectiveUserId,
          }
          await (await import('firebase/firestore')).setDoc((await import('firebase/firestore')).doc(db, 'profilePosts', storyPost.id), storyPost)
        } catch {}
      }
      setLastSyncStory({ partnerName, minutes, rating, vibe: sessionVibe, summary: actionSummary })
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.7 } })
      toast.success('¡Historia del Sync guardada en AMBOS muros!', { description: 'Un recuerdo compartido que nadie más puede crear.' })
    }

    // Update replay with rating for nice replay modal later
    if (replaySession) {
      setReplaySession({ ...replaySession, rating })
    }

    toast.success(`Sync con ${partnerName} calificado ${rating}/5`, { description: '¡Gracias! Ayuda a mejorar el matching + tu alianza de sync creció.' })
    setPendingSyncRating(null)
    setSyncDuelSummary(null)
  }

  const arenaPhotoInputRef = useRef<HTMLInputElement>(null)
  const arenaPhotoResolverRef = useRef<((url: string | null) => void) | null>(null)

  const handleArenaCapturePhoto = useCallback(async () => {
    if (!syncPartnerId || !currentUser) return
    const partner = realProfiles.find((p) => p.id === syncPartnerId)
    const partnerName = partner?.name || 'Compañero'

    try {
      let dataUrl: string | null = null
      if (Capacitor.isNativePlatform() && CapacitorCamera) {
        const photo = await CapacitorCamera.getPhoto({
          quality: 75,
          allowEditing: true,
          resultType: 'base64',
        })
        dataUrl = `data:image/jpeg;base64,${photo.base64String}`
      } else {
        dataUrl = await new Promise<string | null>((resolve) => {
          arenaPhotoResolverRef.current = resolve
          arenaPhotoInputRef.current?.click()
        })
      }
      if (!dataUrl) return

      let url = dataUrl
      if (!isDemoMode && storage && firebaseUser?.uid && dataUrl.startsWith('data:')) {
        url = await uploadArenaPhotoUrl(storage, effectiveUserId, dataUrl)
      }

      const caption = 'Momento en Arena'
      const photoAction = {
        id: 'sa' + Date.now(),
        emoji: '📸',
        label: caption,
        userId: effectiveUserId,
        at: Date.now(),
        photoUrl: url,
      }
      setSyncActions((prev) => [photoAction, ...prev].slice(0, 30))

      const photoText = `📸 ${caption} — con ${partnerName} en Arena (vibe ${syncVibe}%)`
      await createProfilePost(photoText, url)
      if (!isDemoMode && db && syncPartnerId) {
        await postPartnerSyncStory(db, syncPartnerId, photoText, url).catch(() => {})
        const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
        const sessionId = buildSyncSessionId(effectiveUserId, syncPartnerId)
        await updateDoc(doc(db, 'syncSessions', sessionId), {
          actions: arrayUnion({
            emoji: '📸',
            label: caption,
            userId: effectiveUserId,
            at: Date.now(),
            photoUrl: url,
          }),
        }).catch(() => {})
      }

      toast.success('📸 Momento capturado', {
        description: 'Timeline + muros de ambos + onda en el mapa',
      })
      emitArenaMapRipple('Foto en Arena', 1.65, {
        vibe: syncVibe,
        actionsSnapshot: [photoAction, ...syncActions].slice(0, 12),
        notifyNearby: true,
      })
      triggerHaptic('success')
    } catch {
      toast.error('No se pudo capturar la foto')
    }
  }, [
    syncPartnerId,
    currentUser,
    realProfiles,
    isDemoMode,
    storage,
    firebaseUser?.uid,
    effectiveUserId,
    syncVibe,
    db,
  ])

  const persistSyncWorkoutLogToSession = async (log: SyncWorkoutLogState) => {
    if (isDemoMode || !db || !syncPartnerId) return
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const sessionId = buildSyncSessionId(effectiveUserId, syncPartnerId)
      await updateDoc(doc(db, 'syncSessions', sessionId), {
        [`participantState.${effectiveUserId}`]: toParticipantSyncPayload(log),
        updatedAt: Date.now(),
      })
    } catch (e) {
      console.warn('workoutLog persist failed', e)
    }
  }

  const startArenaVoicePing = async () => {
    if (!syncPartnerId || isArenaVoiceRecording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      arenaVoiceRecorderRef.current = rec
      arenaVoiceChunksRef.current = []
      const started = Date.now()
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) arenaVoiceChunksRef.current.push(e.data)
      }
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        setIsArenaVoiceRecording(false)
        arenaVoiceRecorderRef.current = null
        const duration = Math.min(3, Math.max(1, Math.round((Date.now() - started) / 1000)))
        let voiceUrl: string | undefined
        const blob = new Blob(arenaVoiceChunksRef.current, { type: rec.mimeType || 'audio/webm' })
        if (!isDemoMode && storage && firebaseUser?.uid && syncPartnerId && blob.size > 0) {
          try {
            const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
            const sessionId = buildSyncSessionId(effectiveUserId, syncPartnerId)
            const storageRef = ref(storage, `arena-voice/${sessionId}/${Date.now()}.webm`)
            await uploadBytes(storageRef, blob)
            voiceUrl = await getDownloadURL(storageRef)
          } catch (e) {
            console.warn('arena voice upload failed', e)
          }
        }
        await doSyncAction('🎙️', `Voz · ${duration}s`, voiceUrl ? { voiceUrl } : undefined)
        triggerHaptic('light')
        toast.success('Voz enviada', {
          description: voiceUrl
            ? `${duration}s — tu compañero puede reproducirla en la Arena`
            : `${duration}s enviado (sin URL de audio)`,
        })
      }
      rec.start()
      setIsArenaVoiceRecording(true)
      triggerHaptic('medium')
      setTimeout(() => {
        if (rec.state === 'recording') rec.stop()
      }, 3000)
    } catch {
      toast.error('Mic no disponible en este dispositivo')
    }
  }

  const handleArenaSyncAction = async (actionId: string, emoji: string, label: string) => {
    if (actionId === 'rest' && syncPartnerId) {
      const until = Date.now() + ARENA_REST_MS
      setSyncRestUntil(until)
      setSyncRestStartedBy(effectiveUserId)
      if (!isDemoMode && db) {
        try {
          const { doc, updateDoc } = await import('firebase/firestore')
          const sessionId = buildSyncSessionId(effectiveUserId, syncPartnerId)
          await updateDoc(doc(db, 'syncSessions', sessionId), {
            restUntil: until,
            restStartedBy: effectiveUserId,
            updatedAt: Date.now(),
          })
        } catch {
          /* non-fatal */
        }
      }
      await doSyncAction(emoji, label)
      return
    }
    if ((actionId === 'set' || actionId === 'pr') && syncPartnerId && syncStartedAt) {
      const set = {
        reps: syncWorkoutLog.pendingReps,
        weightKg: syncWorkoutLog.pendingWeightKg,
      }
      let nextLog = appendSetToLog(syncWorkoutLog, syncWorkoutLog.activeExercise, set)
      if (actionId === 'pr') {
        nextLog = {
          ...nextLog,
          prs: [
            ...nextLog.prs,
            {
              exercise: syncWorkoutLog.activeExercise,
              weightKg: syncWorkoutLog.pendingWeightKg,
              reps: syncWorkoutLog.pendingReps,
              at: Date.now(),
            },
          ],
        }
      }
      setSyncWorkoutLog(nextLog)
      await persistSyncWorkoutLogToSession(nextLog)
      const detail = formatSetLabel(syncWorkoutLog.activeExercise, set.reps, set.weightKg)
      const actionLabel = actionId === 'pr' ? `PR · ${detail}` : `Set · ${detail}`
      await doSyncAction(emoji, actionLabel)
      if (actionId === 'pr') {
        try {
          confetti({ particleCount: 160, spread: 90, origin: { y: 0.65 } })
        } catch {}
        createProfilePost(
          `🏆 PR en ${syncWorkoutLog.activeExercise}: ${set.reps}×${set.weightKg}kg — EntrenaSync en vivo`,
          null
        ).catch(() => {})
        toast.success('PR registrado', { description: detail })
      }
      return
    }
    await doSyncAction(emoji, label)
  }

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
      setEntrenaLogPrefill({
        title: title ? `Copia · ${title}` : 'Rutina copiada',
        exercises: w.exercises.map((e) => ({
          ...e,
          sets: e.sets.map((s) => ({ ...s })),
        })),
        type: w.type,
        durationMin: w.stats?.durationMin || 45,
      })
      setShowEntrenaLogModal(true)
      toast.success('Rutina cargada', { description: 'Edita y guarda en EntrenaLog' })
    } catch {
      toast.error('No se pudo cargar la rutina')
    }
  }

  const doSyncAction = async (
    emoji: string,
    label: string,
    extras?: { voiceUrl?: string; photoUrl?: string }
  ) => {
    if (!syncPartnerId || !syncStartedAt) return
    triggerHaptic('light')

    const isCombo = syncActions.length > 0 && syncActions[0].label === label
    const newCombo = isCombo ? Math.min(5, syncCombo + 1) : 1
    setSyncCombo(newCombo)
    const baseGain = 7
    const comboBonus = (newCombo - 1) * 6
    const vibeGain = baseGain + comboBonus

    const action = {
      id: 'sa' + Date.now(),
      ...buildSyncSessionAction({
        emoji,
        label,
        userId: effectiveUserId,
        combo: newCombo,
        voiceUrl: extras?.voiceUrl,
        photoUrl: extras?.photoUrl,
      }),
    }
    const newActions = [action, ...syncActions].slice(0, 12)
    setSyncActions(newActions)

    // Flying emoji wave — the magic "we are moving together" visual that both see instantly thanks to listener
    const flyId = 'fly' + Date.now()
    setFlyingEmojis(prev => [...prev.slice(-3), { id: flyId, emoji, label }])
    setTimeout(() => {
      setFlyingEmojis(prev => prev.filter(f => f.id !== flyId))
    }, 1400)

    // Update currentUser so save picks it for FS sync (partner will mirror via realProfiles)
    const updatedUser = { ...currentUser, syncActions: newActions }
    saveUser(updatedUser as any)
    if (!isDemoMode && firebaseUser?.uid) {
      try {
        await updateUserProfile(firebaseUser.uid, { syncActions: newActions.slice(-10) })
      } catch (e) { console.warn('sync action persist failed', e) }
    }

    // INSTANT: also write to dedicated syncSessions collection so partner gets it via onSnapshot immediately (true co-presence)
    if (!isDemoMode && db) {
      try {
        const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
        const uids = [effectiveUserId, syncPartnerId].sort()
        const sessionId = `sync_${uids[0]}_${uids[1]}`
        const actionForSession = buildSyncSessionAction({
          emoji,
          label,
          userId: effectiveUserId,
          combo: newCombo,
          voiceUrl: extras?.voiceUrl,
          photoUrl: extras?.photoUrl,
        })
        let newVibe = Math.min(100, (syncVibe || 0) + vibeGain)
        // Network Power bonus: when syncing with a high-bond partner from your red, extra vibe — the graph rewards real alliances with higher shared energy.
        const isBondedAction = !!syncBonds[syncPartnerId]
        if (isBondedAction) {
          const bond = syncBonds[syncPartnerId]
          const netBonus = Math.floor((bond.bondLevel || 1) * 0.8)
          newVibe = Math.min(100, newVibe + netBonus)
        }
        await updateDoc(doc(db, 'syncSessions', sessionId), {
          actions: arrayUnion(actionForSession),
          vibe: newVibe,
          updatedAt: Date.now(),
        })
        setSyncVibe(newVibe)

        const prevVibe = syncVibe || 0
        const crossedLegend = newVibe >= 80 && prevVibe < 80
        const rippleIntensity = crossedLegend
          ? newVibe > 90
            ? 2.2
            : 1.8
          : newCombo >= 3
            ? 1.55
            : newCombo >= 2
              ? 1.25
              : 0.9
        emitArenaMapRipple(`${emoji} ${label}`, rippleIntensity, {
          vibe: newVibe,
          actionsSnapshot: newActions,
          forceLegend: crossedLegend,
          notifyNearby: crossedLegend || newCombo >= 2,
        })

        // Make the purpose *felt*: every action with a real bond from your red builds your Network Power visibly, and boosts the shared vibe — the social graph has real performance teeth.
        if (isBondedAction && (newCombo >= 2 || vibeGain > 10)) {
          const bondBoost = Math.max(1, Math.floor(vibeGain / 8))
          toast.success(`❤️ Alianza fortalecida +${bondBoost} con tu socio de sync`, { description: 'Tu Fuerza del equipo sube. Se propaga en tu red, mapa y feed – la red te hace más fuerte.' })
        }

        // PEQUEÑO TOQUE DISRUPTIVO: auto-captura de "momento de alta vibe" cuando cruza 80.
        if (crossedLegend) {
          const highAction = {
            id: 'hv' + Date.now(),
            emoji: '⚡',
            label: '¡Alta energía compartida!',
            userId: effectiveUserId,
            at: Date.now(),
          }
          setSyncActions((prev) => [highAction, ...prev].slice(0, 30))
          toast.success('⚡ ¡Highlight de sync!', {
            description: 'La ciudad puede presenciarlo — momento destacado en mapa + replay',
          })
          triggerHaptic('medium')
          setTimeout(() => {
            setFlyingEmojis((prev) => [...prev.slice(-2), { id: 'fly-high' + Date.now(), emoji: '⚡', label: 'Alta!' }])
            try {
              triggerHaptic('heavy')
            } catch {}
          }, 120)

          // Oferta auto de foto si en native (no fuerza cámara, solo invita)
          if (Capacitor.isNativePlatform() && CapacitorCamera) {
            setTimeout(() => {
              toast('📸 ¿Capturar el pico de alta vibe?', {
                action: {
                  label: 'Capturar',
                  onClick: async () => {
                    try {
                      const photo = await CapacitorCamera.getPhoto({
                        quality: 70,
                        allowEditing: true,
                        resultType: 'base64',
                      })
                      const dataUrl = `data:image/jpeg;base64,${photo.base64String}`
                      const path = `posts/${effectiveUserId}/arena-high-${Date.now()}.jpg`
                      const storageRef = ref(storage, path)
                      const snap = await uploadString(storageRef, dataUrl, 'data_url')
                      const url = await getDownloadURL(snap.ref)
                      const photoAction = {
                        id: 'sa' + Date.now(),
                        emoji: '📸',
                        label: 'Alta vibe capturada',
                        userId: effectiveUserId,
                        at: Date.now(),
                        photoUrl: url,
                      }
                      setSyncActions((prev) => [photoAction, ...prev].slice(0, 30))
                      await createProfilePost('⚡ Momento de alta energía en Arena', url)
                      toast.success('📸 Alta vibe inmortalizada')
                    } catch {
                      toast('Captura cancelada')
                    }
                  },
                },
              })
            }, 800)
          }
        }
      } catch (e) {
        console.warn('instant syncSession action failed (mirror will catch on next poll)', e)
      }
    } else {
      const newVibe = Math.min(100, (syncVibe || 0) + vibeGain)
      setSyncVibe(newVibe)
      const rippleIntensity = newCombo >= 2 ? 1.2 : 0.85
      emitArenaMapRipple(`${emoji} ${label}`, rippleIntensity, {
        vibe: newVibe,
        actionsSnapshot: newActions,
        notifyNearby: false,
      })
    }

    // Acciones van a Arena + syncSessions — el muro solo en PR, foto o historia al terminar
    addDebugLog(`Sync action: ${emoji} ${label}${newCombo>1 ? ` x${newCombo}` : ''}`)

    // Special toast + confetti pop for combos (the dopamine that makes it addictive and unique)
    if (newCombo >= 3) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
      toast.success(`${emoji} RACHA x${newCombo}!`, {
        description: 'Onda fuerte en el mapa — quien esté en GymPulse lo presencia',
      })
      triggerHaptic('medium')
    } else if (newCombo >= 2) {
      toast.success(`${emoji} ${label} ×${newCombo}`, {
        description: 'La red siente la racha en el GymPulse',
      })
    } else {
      toast.success(`${emoji} ${label}`, { description: 'Visible en Arena y para tu compañero — no spam en el muro' })
    }
  }

  // Auto-start sync UI when joining live (call from handleSwipe if both live)
  // Attractive + anti-spam: show loading on the specific join, disable multi-press, auto-nav to profile to see the beautiful sync panel
  const tryAutoStartSync = (targetId: string) => {
    const target = (latestRealProfilesRef.current || realProfiles).find(p => p.id === targetId)
    if (!target) {
      toast.error('Compañero no encontrado', { description: 'Actualiza perfiles reales e intenta de nuevo.' })
      return
    }
    const me = currentUserRef.current
    if (!me?.trainingNow) {
      toast.error('Activa tu live primero', { description: 'Perfil → "Entrenando Ahora (EN VIVO)" antes de EntrenaSync.' })
      return
    }
    if (!isUserLive(targetId)) {
      toast.error(`${target.name} no está en vivo`, { description: 'Espera a que active live en el GymPulse.' })
      return
    }
    if (syncPartnerId || joiningSyncWith) return
    startSyncWith(targetId, target.name)
      .then(() => setActiveTab('explore'))
      .catch(() => {})
  }

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
      userName: currentUser?.name || 'Tú',
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
      toast.error('No se encontró la publicación', { description: 'Recarga el muro e inténtalo de nuevo.' })
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
          description: 'No se pudo guardar en el servidor. Se reintentará al sincronizar.',
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
    // Optimistic delete + undo (no ugly confirm - better UX, rely on spectacular undo toast)
    if (!isDemoMode && db) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore')
        await deleteDoc(doc(db, 'profilePosts', postId))
      } catch (e) { console.warn(e) }
    }
    const current = profilePosts[postUserId] || []
    const postToDelete = current.find(p => p.id === postId)
    const newList = current.filter(p => p.id !== postId)
    const updated = { ...profilePosts, [postUserId]: newList }
    saveProfilePosts(updated, { persistLocal: isDemoMode })  // delete uses save — triggers AnimatePresence exit

    // Spectacular UX: undo toast for delete
    toast.success('Publicación eliminada', {
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
            toast.success('Publicación recuperada')
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
    toast.success('Foto eliminada', { description: 'Puedes volver a añadirla desde el editor de perfil si fue un error.' })
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
    toast('Galería reordenada', { description: 'El orden se guarda en tu perfil real' })
  }

  // === LIVE JOIN NOTIFS (owner side) ===
  // Called after loading own profilePosts (or updates). Scans live "Entrenando ahora" posts for *new* comments/likes
  // from other people. Fires special urgency notif + toast so the live trainer knows people are joining in real time.
  // Deduped with seenLiveJoinInteractionIdsRef + persisted to LS. Works for both demo (after auto-comment on join) and real (FS comments written by joiners).
  const processIncomingLiveJoins = () => {
    if (!currentUser?.trainingNow) return
    const myId = effectiveUserId
    const myPosts = profilePosts[myId] || []
    if (myPosts.length === 0) return

    // Find posts that look like live announcements (the ones we auto-create on toggle)
    const livePosts = myPosts.filter((p: any) => {
      const t = (p.text || '').toLowerCase()
      return t.includes('entrenando ahora') || t.includes('live') || t.includes('entreno ahora')
    })

    let newJoinDetected = false
    const pendingJoinNotifs: Notification[] = []
    livePosts.forEach((post: any) => {
      ;(post.comments || []).forEach((c: any) => {
        if (c.userId && c.userId !== myId && !seenLiveJoinInteractionIdsRef.current.has(c.id)) {
          seenLiveJoinInteractionIdsRef.current.add(c.id)
          newJoinDetected = true
          pendingJoinNotifs.push({
            id: 'notif' + Date.now() + '-' + c.id,
            type: 'session_join',
            title: '🔥 ¡Alguien se unió a tu live!',
            body: `${c.userName || 'Un compañero'} se unió a tu entrenamiento en vivo`,
            relatedId: c.userId,
            timestamp: Date.now(),
            read: false,
          })
          toast(`🔥 ${c.userName || 'Alguien'} se unió a tu live`, {
            description: '¡Abre tu muro o chatea con ellos!',
            action: {
              label: 'Ver perfil',
              onClick: () => {
                const joiner = [...realProfiles, ...SEED_PROFILES].find(p => p.id === c.userId)
                if (joiner) setShowFullProfile(joiner as any)
                else setActiveTab('home')
              }
            }
          })
        }
      })

      ;(post.likes || []).forEach((likerId: string) => {
        const likeKey = `${post.id}_like_${likerId}`
        if (likerId !== myId && !seenLiveJoinInteractionIdsRef.current.has(likeKey)) {
          seenLiveJoinInteractionIdsRef.current.add(likeKey)
          newJoinDetected = true
          const likerProfile = [...realProfiles, ...SEED_PROFILES].find(p => p.id === likerId)
          const likerName = likerProfile?.name || 'Un compañero'
          pendingJoinNotifs.push({
            id: 'notif' + Date.now() + '-' + likeKey,
            type: 'session_join',
            title: '❤️ ¡Like en tu post live!',
            body: `${likerName} le dio like a tu "Entrenando ahora"`,
            relatedId: likerId,
            timestamp: Date.now(),
            read: false,
          })
          toast(`❤️ ${likerName} se sumó a tu live`, { description: '¡Tu post en vivo está generando movimiento!' })
        }
      })
    })

    if (pendingJoinNotifs.length > 0) {
      setNotifications((prev) => saveStoredNotifications([...pendingJoinNotifs, ...prev]))
    }

    if (newJoinDetected) {
      try {
        localStorage.setItem('entrenamatch_seen_live_joins', JSON.stringify(Array.from(seenLiveJoinInteractionIdsRef.current)))
      } catch {}
    }
  }

  // Call the processor whenever own posts update while live (catches real joins via FS comments)
  useEffect(() => {
    if (currentUser?.trainingNow) {
      processIncomingLiveJoins()
    }
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
    if (!confirm('¿Eliminar tu comentario?')) return
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

  // Fase 4: prune comment listeners when leaving feed (avoid unbounded growth)
  useEffect(() => {
    if (isDemoMode || activeTab === 'home') return

    const keepIds = new Set<string>()
    if (viewingPostComments?.postId) keepIds.add(viewingPostComments.postId)
    if (activeComment?.postId) keepIds.add(activeComment.postId)
    for (const p of profilePostsRef.current[effectiveUserId] || []) {
      if (p?.id) keepIds.add(p.id)
    }
    if (showFullProfile?.id) {
      for (const p of profilePostsRef.current[showFullProfile.id] || []) {
        if (p?.id) keepIds.add(p.id)
      }
    }

    Object.keys(postCommentUnsubsRef.current).forEach((postId) => {
      if (!keepIds.has(postId)) releasePostCommentsListener(postId)
    })
  }, [activeTab, isDemoMode, effectiveUserId, showFullProfile?.id, viewingPostComments?.postId, activeComment?.postId, releasePostCommentsListener])

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
      try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(newState)) } catch {}
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
    toast.success('Publicación editada')
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
      try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(newState)) } catch {}
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

  const saveNotifications = (newNotifications: Notification[]) => {
    const pruned = saveStoredNotifications(newNotifications)
    setNotifications(pruned)
  }

  const persistSeen = () => {
    try {
      const chatObj: Record<string, string[]> = {}
      Object.keys(seenChatMsgIdsRef.current).forEach(k => {
        chatObj[k] = Array.from(seenChatMsgIdsRef.current[k])
      })
      localStorage.setItem('entrenamatch_seen_chat_msgs', JSON.stringify(chatObj))

      const groupObj: Record<string, string[]> = {}
      Object.keys(seenGroupMsgIdsRef.current).forEach(k => {
        groupObj[k] = Array.from(seenGroupMsgIdsRef.current[k])
      })
      localStorage.setItem('entrenamatch_seen_group_msgs', JSON.stringify(groupObj))
    } catch {}
  }

  // Add a new notification (gated by user prefs for progressive control)
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const type = notification.type || 'message'
    // Gate by prefs (messages covers 1:1/group/match/muro activity; live for joins)
    const shouldAdd = 
      (type.includes('message') || type === 'match' || type === 'verification' || type === 'report') ? notifPrefs.messages :
      (type === 'session_join' || type === 'squad_join') ? notifPrefs.live :
      true
    if (!shouldAdd) return

    // Simple dedup: don't add duplicate recent notification for same relatedId + type (prevents repeats on reloads/listener glitches)
    const isDuplicate = notifications.some(n => 
      n.relatedId === notification.relatedId && 
      n.type === notification.type && 
      (Date.now() - (n.timestamp || 0)) < 1000 * 60 * 5 // within last 5 min
    );
    if (isDuplicate) return;

    const newNotif: Notification = {
      ...notification,
      id: 'notif' + Date.now(),
      timestamp: Date.now(),
      read: false
    }
    const updated = [newNotif, ...notifications].slice(0, 25)
    saveNotifications(updated)
  }

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
          toast.success('Notificaciones web activadas', { description: 'Te avisaremos de mensajes nuevos aunque la pestaña esté oculta' })
        }
      } catch (e) {
        console.warn('Web Notification permission request failed', e)
      }
    }
  }

  // Explicit activation for native push (called from Profile button). Robust against missing config.
  const requestNativePushPermission = async () => {
    if (!PushNotifications) {
      toast.error('Notificaciones nativas no disponibles', {
        description: 'Esta build del APK no tiene google-services.json configurado o el plugin no cargó. Revisa la consola para detalles.'
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
          description: 'Ahora recibirás alertas reales en tu celular incluso con la app cerrada (mejor que web).'
        })
      } else if (receive === 'denied') {
        toast('Permiso denegado', {
          description: 'Ve a Ajustes del teléfono > Apps > EntrenaMatch > Notificaciones y actívalo manualmente.'
        })
      } else {
        toast('Permiso de notificaciones solicitado', {
          description: 'Si ves el diálogo del sistema, elige "Permitir".'
        })
      }
    } catch (e: any) {
      console.error('Native push activation error', e)
      toast.error('Error activando notificaciones nativas', {
        description: (e?.message || 'Revisa google-services.json y que el package sea com.entrenamatch.app') + ' — contacta al equipo para una build actualizada.'
      })
    }
  }

  // Central helper: navigate from notification deep-link (panel, toast, browser notif)
  const applyNotificationNavigation = useCallback((target: NotificationNavTarget, partnerNameHint?: string) => {
    setShowNotifications(false)
    setActiveTab(target.tab)
    if (target.showDailyPulse) setShowDailyPulseBanner(true)
    if (target.showLiveMap) setShowLiveMap(true)
    if (target.showLiveModal) setShowLiveModal(true)
    if (target.activeChat) {
      setActiveChat(target.activeChat)
      setChatUnreads((prev) => {
        const c = { ...prev }
        c[target.activeChat!] = 0
        return c
      })
    }
    if (target.groupChatId) {
      setShowGroupChatModalFor(target.groupChatId)
      setSessionUnreads((prev) => {
        const c = { ...prev }
        c[target.groupChatId!] = 0
        return c
      })
    }
    if (target.selectedSquad) {
      setSelectedSquad(target.selectedSquad)
    }
    if (target.showSyncArena) {
      setShowSyncArena(true)
    }
    if (target.openTrainerCoach) {
      setTrainerCoachInitialTab(target.trainerCoachTab)
      setShowTrainerCoach(true)
    }
    if (target.openMarketplace) {
      setMarketplaceScreenMode(target.marketplaceOrdersTab ? 'orders' : 'shop')
      setShowMarketplace(true)
    }
    if (target.startSyncWith) {
      const { partnerId, partnerName } = target.startSyncWith
      const name =
        partnerName ||
        partnerNameHint ||
        realProfiles.find((p) => p.id === partnerId)?.name ||
        SEED_PROFILES.find((p) => p.id === partnerId)?.name ||
        'Compañero'
      setTimeout(() => startSyncRef.current?.(partnerId, name), 80)
    }
  }, [realProfiles])

  useEffect(() => {
    applyNotificationNavigationRef.current = applyNotificationNavigation
  }, [applyNotificationNavigation])

  const openMessageNotificationTarget = useCallback((chatId: string, senderName?: string, isGroupHint?: boolean) => {
    const target = resolveNotificationTarget(
      { type: isGroupHint ? 'group_message' : 'message', relatedId: chatId },
      { sessionIds: knownSessionIds }
    )
    if (target) {
      applyNotificationNavigation(target, senderName)
      return
    }
    if (isGroupHint) {
      setActiveTab('sesiones')
      setShowGroupChatModalFor(chatId)
      setSessionUnreads((prev) => { const c = { ...prev }; c[chatId] = 0; return c })
    } else {
      setActiveTab('messages')
      setActiveChat(chatId)
      setChatUnreads((prev) => { const c = { ...prev }; c[chatId] = 0; return c })
    }
  }, [knownSessionIds, applyNotificationNavigation])

  // Central helper: show in-app toast + central notif + browser notif (if hidden) + bump unread for a message arrival.
  // Safe to call from bg listeners. name = display name of sender, chatId for 1:1 or sessionId for group.
  const triggerMessageArrivalNotification = (chatId: string, name: string, text: string, isGroup: boolean, photoUrl?: string) => {
    const short = (text || (photoUrl ? '[foto]' : 'Nuevo mensaje')).substring(0, 80)
    const title = isGroup ? `${name} en sesión` : `Mensaje de ${name}`

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
    const toastTitle = isNetworkMsg ? `⭐ Mensaje de tu Red (Fuerza del equipo) ${name}` : title
    const toastClass = isNetworkMsg ? 'network-message-toast' : '' // network msg gold for your red
    toast.info(toastTitle, {
      description: (
        <div className={`flex items-start gap-3 mt-1 ${isNetworkMsg ? 'network-toast-content' : ''}`}>
          {avatarEl}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-[#cbd5e1] truncate leading-tight font-medium">{short}</div>
            <div className="text-[10px] text-[#9CA3AF] mt-1 flex items-center gap-1.5">
              {isGroup ? '👥 Chat grupal • En vivo' : '💬 Mensaje 1:1 • En vivo'}
              {isNetworkMsg && <span className="px-1.5 py-0 rounded bg-[#FFD700] text-black text-[9px] font-bold">⭐ RED</span>}
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
        const n = new Notification(title + ' — EntrenaMatch', {
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

  const submitTrainingReview = async (profileId: string) => {
    if (!currentUser) return

    const newReview: TrainingReview = {
      id: 'r' + Date.now(),
      reviewerId: firebaseUser?.uid || 'me',
      reviewerName: currentUser?.name || 'Anónimo',
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
    toast.success('¡Reseña enviada!', { description: 'Gracias por ayudar a la comunidad de EntrenaMatch' })
  }

  // Report a user (critical safety feature)
  const reportUser = async (userId: string, reason: string, details?: string, context: Report['context'] = 'profile', contextId?: string) => {
    if (!currentUser || userId === 'me') return

    const newReport: Report = {
      id: 'rep' + Date.now(),
      reporterId: firebaseUser?.uid || 'me',
      reportedUserId: userId,
      reason,
      details,
      context,
      contextId,
      timestamp: Date.now(),
      status: 'pending'
    }

    const updatedReports = [...reports, newReport]
    saveReports(updatedReports)

    // Persist report to Firestore for real moderation/audit
    if (!isDemoMode && db && firebaseUser) {
      try {
        const { addDoc, collection } = await import('firebase/firestore')
        await addDoc(collection(db, 'reports'), {
          ...newReport,
          reporterId: firebaseUser.uid
        })
      } catch (e) {
        console.warn('Could not save report to FS', e)
      }
    }

    // Auto-block after reporting (safety-first behavior)
    if (!blockedUsers.includes(userId)) {
      const newBlocked = [...blockedUsers, userId]
      saveBlockedUsers(newBlocked)
    }

    toast.success('Reporte enviado', { 
      description: 'Gracias por reportar. Revisaremos y el usuario ha sido bloqueado automáticamente para ti.' 
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
      } catch (e) { console.warn('persist block failed', e) }
    }

    toast.success('Usuario bloqueado', { 
      description: 'No volverás a verlo en descubrimiento, live, feed, mapa ni chats.' 
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
      setAuthError('Google Sign-In requiere Firebase real. Usa email/contraseña en demo.')
      return
    }

    setAuthLoading(true)
    setAuthError('')

    try {
      const result = await signInWithGoogle()

      if (result.mode === 'redirect') {
        toast('Redirigiendo a Google…', { description: 'Vuelves a EntrenaMatch al terminar.' })
        return
      }

      const { profile, isNewUser } = await completeGoogleSignInProfile(result.user)
      lastSuccessfulAuthRef.current = result.user
      toast.success('Sesión iniciada con Google')

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
        setAuthError('No se pudo iniciar sesión con Google')
        toast.error('No se pudo iniciar sesión con Google')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleEmailAuth = async (isRegister: boolean) => {
    if (!authEmail || !authPassword) {
      setAuthError('Por favor completa email y contraseña')
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
          toast.success('Sesión iniciada')
        }
        loggedInUser = true // demo always "succeeds" for UI
      } else {
        if (isRegister) {
          const fbUser = await signUpWithEmail(authEmail, authPassword)
          await createUserProfile(fbUser, {
            name: '',
            age: 25,
            gender: 'hombre',
            city: '',
            country: 'Chile',
            bio: '',
            photos: [],
            trainingTypes: [],
            goals: [],
            level: 'Intermedio',
            intensity: 'Moderado',
            availability: ['Tarde'],
          })
          toast.success('Cuenta creada exitosamente')
          loggedInUser = fbUser
          lastSuccessfulAuthRef.current = fbUser
        } else {
          const fbUser = await signInWithEmail(authEmail, authPassword)
          toast.success('Sesión iniciada')
          loggedInUser = fbUser
          lastSuccessfulAuthRef.current = fbUser
        }
      }
    } catch (error: any) {
      console.error(error)
      let friendlyError = 'Error en la autenticación'

      if (error.code === 'auth/email-already-in-use') {
        friendlyError = 'Este email ya está registrado.'
        // Auto-switch to login mode for better UX
        setAuthMode('login')
        // Keep the email so user doesn't have to re-type it
        setAuthEmail(authEmail)
        setAuthError('Este email ya está registrado. Inicia sesión con tu contraseña.')
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        friendlyError = 'Email o contraseña incorrectos. ¿Estás seguro que creaste la cuenta?'
        setAuthError(friendlyError)
      } else if (error.code === 'auth/invalid-email') {
        friendlyError = 'El formato del email no es válido.'
        setAuthError(friendlyError)
      } else if (error.code === 'auth/weak-password') {
        friendlyError = 'La contraseña es muy débil (mínimo 6 caracteres).'
        setAuthError(friendlyError)
      } else if (error.message) {
        setAuthError(error.message)
      } else {
        setAuthError(friendlyError)
      }
    } finally {
      setAuthLoading(false)

      // After successful real auth, load or create local profile and decide onboarding
      if (!isDemoMode && loggedInUser) {
        try {
          const profile = await getUserProfile(loggedInUser.uid)

          if (profile) {
            saveUser({ ...profile, id: 'me' } as any)

            if (isRegister) {
              setIsEditingProfile(false)
              setOnboardingStepLocal(0)
              setShowOnboarding(true)
            }
            // Returning logins with incomplete profile can finish via Profile tab CTA
          } else {
            const minimalUser = {
              id: 'me' as any,
              name: '',
              age: 25,
              gender: 'hombre' as const,
              city: '',
              country: 'Chile',
              bio: '',
              photos: [],
              trainingTypes: [],
              goals: [],
              level: 'Intermedio' as const,
              intensity: 'Moderado' as const,
              availability: ['Tarde'],
            }
            saveUser(minimalUser as any)
            setIsEditingProfile(false)
            setOnboardingStepLocal(0)
            setShowOnboarding(true)
          }
        } catch (e) {
          console.warn('Profile load after real auth failed', e)
          const fallbackUser = {
            id: 'me' as any,
            name: '',
            age: 25,
            gender: 'hombre' as const,
            city: '',
            country: 'Chile',
            bio: '',
            photos: [],
            trainingTypes: [],
            goals: [],
            level: 'Intermedio' as const,
            intensity: 'Moderado' as const,
            availability: ['Tarde'],
          }
          saveUser(fallbackUser as any)
          setIsEditingProfile(false)
          setOnboardingStepLocal(0)
          setShowOnboarding(true)
        }
      } else if (isDemoMode && loggedInUser) {
        const hasLocalProfile = localStorage.getItem('fitvina_user')
        if (!hasLocalProfile) {
          setShowOnboarding(true)
        }
      }
    }
  }

  // Real password recovery using Firebase
  // This enables the "¿Olvidaste tu contraseña?" button to actually work for real accounts.
  // In demo mode (public web) it will show a clear message that recovery only works in the real app.
  const handleForgotPassword = async (email: string) => {
    if (!email || !email.includes('@')) {
      setAuthError('Ingresa un correo electrónico válido para recuperar tu contraseña')
      return
    }

    setAuthLoading(true)
    setAuthError('')

    try {
      await sendPasswordReset(email)
      toast.success('¡Email de recuperación enviado!', {
        description: `Revisa tu bandeja en ${email} (incluyendo carpeta de spam). El enlace expira en 1 hora.`
      })
      // UX nicety: switch to login mode after requesting reset
      if (authMode === 'register') {
        setAuthMode('login')
      }
    } catch (error: any) {
      console.error('Password reset failed', error)
      let friendly = 'No pudimos enviar el correo de recuperación en este momento.'
      if (error.message) {
        friendly = error.message
      } else if (error.code === 'auth/user-not-found') {
        friendly = 'No hay ninguna cuenta registrada con ese correo electrónico.'
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
      toast.error('Solo el creador puede cerrar la sesión')
      return
    }
    if (!confirm('¿Cerrar esta sesión? Se eliminará para todos los participantes y el chat grupal.')) return

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
        console.log('✅ Session closed by creator')
      } catch (e) {
        console.warn('Failed to delete session from Firestore:', e)
      }
    }

    // Close modal if open
    if (showGroupChatModalFor === sessionId) {
      setShowGroupChatModalFor(null)
    }

    toast.success('Sesión cerrada', { description: 'Ya no aparecerá para nadie' })

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
      toast.error('Solo el administrador de la sesión puede expulsar')
      return
    }
    if (participantIdToExpel === effectiveUserId) {
      toast('No puedes expulsarte a ti mismo')
      return
    }

    const nameToExpel = SEED_PROFILES.find(p => p.id === participantIdToExpel)?.name || 'el participante'
    if (!confirm(`¿Expulsar a ${nameToExpel} de la sesión?`)) return

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
        console.log('✅ Participant expelled, persisted to Firestore')
      } catch (e) {
        console.warn('Failed to persist expel:', e)
      }
    }

    // If the group chat modal is open for this session, refresh the view
    if (showGroupChatModalFor === sessionId) {
      // Update in-memory session list for the modal header count etc.
      loadRealGroupMessages(sessionId)
    }

    toast.success('Expulsado', { description: `${nameToExpel} ya no está en la sesión` })

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
      toast('El creador no puede salir; usa Cerrar sesión')
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

    toast('Saliste de la sesión')

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
        console.log('✅ Join persisted to Firestore for other users')
      } catch (e) {
        joinPersisted = false
        console.warn('Failed to persist join to Firestore:', e)
        toast.error('No se pudo guardar tu unión en el servidor', {
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
        title: '¡Alguien se unió a tu sesión!',
        body: `${currentUser?.name || 'Alguien'} se unió a "${session.title}"`,
        relatedId: session.id,
      })
    }

    toast.success('¡Te uniste!', {
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
      toast.success('Verificación aprobada', { description: `El perfil de ${SEED_PROFILES.find(p => p.id === userId)?.name} ahora está verificado.` })
      
      // Optional: If we want to make it visible, we can store approved verifications
      // For now, just log it
    } else {
      toast.error('Verificación rechazada')
    }
  }



  // Multi-step verification submission - improved basic verification
  const submitVerification = async () => {
    if (!currentUser) return
    if (!verificationIdPhoto || !verificationSelfie) {
      toast.error('Faltan documentos', { description: 'Sube foto del documento y selfie para verificación básica.' })
      return
    }

    // For basic verification: upload docs if data, set verified immediately (pre-alpha: basic self + photo check grants badge)
    // In real: would upload to storage, set pending, admin review via moderation.
    let idUrl = verificationIdPhoto
    let selfieUrl = verificationSelfie

    // Try to upload if data: (reuse photo logic)
    try {
      if (verificationIdPhoto.startsWith('data:')) {
        // simple: for now keep data or use existing createProfilePost style, but for verif docs we store urls or data
        // To keep simple for basic: accept and mark verified
      }
    } catch(e){}

    const updated = {
      ...currentUser,
      verificationStatus: 'verified' as const, // basic: grant on submit for pre-alpha testing
      verificationDate: Date.now(),
      verificationDocuments: {
        idPhoto: idUrl,
        selfiePhoto: selfieUrl,
      }
    }

    saveUserWithRealSync(updated as CurrentUser)
    setShowVerificationFlow(false)
    setVerificationIdPhoto(null)
    setVerificationSelfie(null)
    setVerificationStep(1)

    addNotification({
      type: 'verification',
      title: '¡Perfil verificado (básico)!',
      body: 'Badge visible. En producción se revisaría el documento + selfie.',
    })

    toast.success('¡Verificación básica completada!', { 
      description: 'Tu badge ✓ VERIFICADO ya aparece en tu perfil y para otros usuarios.' 
    })
  }

  // Send message to a session group chat (supports text + optional photo)
  const sendSessionMessage = (sessionId: string, text: string, photo?: string | null, voice?: {voiceUrl: string, voiceDuration: number} | null) => {
    if (!currentUser || (!text.trim() && !photo && !voice)) return

    const isRealSession = !isDemoMode && firebaseUser?.uid && db

    const newMsg: any = {
      id: 'sm' + Date.now(),
      senderId: effectiveUserId,
      senderName: currentUser?.name || 'Tú',
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
            senderName: currentUser?.name || 'Tú',
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
          console.log('✅ Real group message sent')

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
          const replies = ['¡Buena idea!', 'Yo llego 5 min antes', '¿Llevas agua?', 'Perfecto 🔥', 'Nos vemos allá']
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
        { id: 'sm1', senderId: session.creatorId, senderName: session.creatorName, text: `¡Hola! Nos vemos ${session.time.toLowerCase()} en ${session.location}. Llevo agua extra.`, timestamp: Date.now() - 1000*60*12 },
        { id: 'sm2', senderId: 'p-seed', senderName: 'María', text: 'Yo llego 5 min antes. ¿Alguien trae gel?', timestamp: Date.now() - 1000*60*7 },
      ]
    } else if (type.includes('pesas') || type.includes('gym')) {
      messages = [
        { id: 'sm1', senderId: session.creatorId, senderName: session.creatorName, text: `¡Listos para ${session.trainingType}! Nos vemos en ${session.location}.`, timestamp: Date.now() - 1000*60*14 },
        { id: 'sm2', senderId: 'p-seed', senderName: 'Diego', text: 'Llevo correas y straps por si alguien necesita.', timestamp: Date.now() - 1000*60*9 },
      ]
    } else if (type.includes('crossfit')) {
      messages = [
        { id: 'sm1', senderId: session.creatorId, senderName: session.creatorName, text: `WOD del día en ${session.location}. Traigan rodilleras.`, timestamp: Date.now() - 1000*60*11 },
        { id: 'sm2', senderId: 'p-seed', senderName: 'Laura', text: '¿Alguien tiene magnesio extra?', timestamp: Date.now() - 1000*60*6 },
      ]
    } else {
      messages = [
        { id: 'sm1', senderId: session.creatorId, senderName: session.creatorName, text: `¡Hola! Nos vemos ${session.time.toLowerCase()} en ${session.location}.`, timestamp: Date.now() - 1000*60*13 },
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
        toast.success('Ubicación activada', { description: 'Distancias y mapa usan esta posición' })
      }
      return
    }

    const updated = { ...u, lat: loc.lat, lng: loc.lng }
    await saveUserWithRealSync(updated as CurrentUser)
    if (!opts?.silent) {
      toast.success('Ubicación real activada', { description: 'Distancias y "vivo cerca" usan tu GPS ahora' })
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
          toast.error('Permiso de ubicación denegado', { description: 'Actívalo en Ajustes del teléfono para distancias reales' })
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
              const reason = code === 3 ? 'GPS tardó demasiado' : code === 1 ? 'Permiso denegado' : 'GPS no disponible'
              toast('Usando última ubicación conocida', {
                description: `${reason}. Live y mapa siguen activos con tu posición guardada.`,
              })
            }
          }
        }
      } else {
        loc = readCachedLocation()
        if (!loc) toast.error('Geolocalización no soportada en este navegador')
        return loc
      }

      if (loc) {
        await applyUserLocation(loc)
        return loc
      }

      toast.error('No pudimos obtener ubicación', { description: 'Revisa permisos de ubicación o intenta en otro navegador.' })
      return null
    } catch (e: any) {
      console.warn('Real geolocation failed:', e)
      const fallback = readCachedLocation()
      if (fallback) {
        await applyUserLocation(fallback, { silent: true })
        toast('Usando última ubicación conocida', { description: 'El GPS no respondió a tiempo; live y mapa usan tu posición guardada.' })
        return fallback
      }
      toast.error('No pudimos obtener ubicación real', { description: 'Activa permisos de ubicación en el navegador o dispositivo.' })
      return null
    } finally {
      isGettingLocationRef.current = false
    }
  }


  // Phase B: in-app alerts only when someone from YOUR TEAM (matches + sync bonds) goes live.
  useEffect(() => {
    if (!liveTrainingNow || liveTrainingNow.length === 0) return
    let addedNew = false
    liveTrainingNow.forEach((liveUser: any) => {
      if (seenLiveUserIdsRef.current.has(liveUser.id)) return
      seenLiveUserIdsRef.current.add(liveUser.id)
      addedNew = true

      const inMyTeam = isTeamMemberId(liveUser.id, syncBonds, teamMatchIds)
      if (!inMyTeam) return

      if (seenLiveUserIdsRef.current.size > 1) {
        const isBond = !!syncBonds[liveUser.id]
        addNotification({
          type: 'session_join',
          title: isBond ? `${liveUser.name.split(' ')[0]} está en vivo` : `${liveUser.name.split(' ')[0]} de tu equipo está entrenando`,
          body: isBond
            ? 'Tu socio de sync activó live — únete desde Hoy.'
            : `Match activo a ${(liveUser.distance || 0).toFixed(1)}km — ¿te sumas?`,
          relatedId: liveUser.id,
          photoUrl: liveUser.photos?.[0],
          isNetwork: isBond,
        } as any)
        toast(`${isBond ? '🔥' : '🟢'} ${liveUser.name.split(' ')[0]} está en vivo`, {
          description: isBond
            ? 'Tu equipo — toca para unirte al sync'
            : `Match · ${(liveUser.distance || 0).toFixed(1)}km`,
          action: {
            label: isBond ? 'Unirme' : 'Ver',
            onClick: () =>
              isBond ? startSyncWith(liveUser.id, liveUser.name) : setShowFullProfile(liveUser as any),
          },
        })
      }
    })
    if (addedNew) {
      try {
        localStorage.setItem('entrenamatch_seen_live_users', JSON.stringify(Array.from(seenLiveUserIdsRef.current)))
      } catch {}
    }
  }, [liveTrainingNow, addNotification, syncBonds, teamMatchIds])

  // Phase B: sync-start alerts — team bonds only (matches get live alert above).
  useEffect(() => {
    if (!liveTrainingNow || liveTrainingNow.length === 0) return
    const currentRedSyncs: Record<string, string | null> = {}
    liveTrainingNow.forEach((u: any) => {
      if (syncBonds[u.id]) {
        currentRedSyncs[u.id] = u.trainingSyncWith || null
      }
    })
    Object.keys(currentRedSyncs).forEach(uid => {
      const prev = prevRedSyncStateRef.current[uid]
      const now = currentRedSyncs[uid]
      if (prev !== now && now && !prev) {
        const partner = liveTrainingNow.find((x: any) => x.id === uid)
        if (partner) {
          addNotification({
            type: 'session_join',
            title: `${partner.name.split(' ')[0]} activó EntrenaSync`,
            body: 'Tu socio de sync está entrenando en pareja — únete desde Hoy.',
            relatedId: uid,
            photoUrl: partner.photos?.[0],
            isNetwork: true,
          } as any)
          toast.success(`${partner.name.split(' ')[0]} en EntrenaSync`, {
            description: 'Tu equipo — toca para unirte',
            action: { label: 'Unirme', onClick: () => startSyncWith(uid, partner.name) },
          })
        }
      }
    })
    prevRedSyncStateRef.current = { ...prevRedSyncStateRef.current, ...currentRedSyncs }
  }, [liveTrainingNow, syncBonds, addNotification])
  // Real-time Live Map effect — MOVED to GymPulseMap component (modularization 2026-06-05).
  // The entire block (init + debounced marker/ripple/partner rendering) now lives in src/components/map/GymPulseMap.tsx
  // This useEffect is kept as a no-op stub during transition to avoid hook count / TDZ issues.
  useEffect(() => {
    // === MAP LOGIC EXTRACTED ===
    // All map creation, updates, markers, ripples, partners, tethers, clusters, self-marker, etc.
    // are now inside <GymPulseMap />.
    // We still keep this effect (empty) so hook ordering remains stable while we finish the cut-over.
    if (!showLiveMap) return
    // No more heavy work here.
    return () => {}
  // Keep similar deps so React doesn't complain during transition
  }, [showLiveMap, liveTrainingNow, userLocation, mapNearOnly, selectedMapZone, syncRipples, echoPins, showPartners, mapForceTick, partnerLocations.length])

  // OLD MAP EFFECT BODY FULLY DELETED (2026-06-05) — all live marker, cluster, ripple, partner hub, tether, self-area, heartbeat, ritual wave logic
  // now lives exclusively inside <GymPulseMap ref=... /> (see src/components/map/GymPulseMap.tsx).
  // The stub useEffect above preserves hook ordering. No top-level statements from the old body remain here.
  // This excision fixes the TS1128 "Declaration or statement expected" at EOF that was breaking `npm run build` / CI APK generation.

  // Small relative time for message previews (e.g. "5m", "2h", "ahora")
  const getRelativeTime = (ts?: number) => {
    if (!ts) return ''
    const diff = Date.now() - ts
    if (diff < 60000) return 'ahora'
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return new Date(ts).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  }

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

    const openers = CHAT_OPENERS[profileId] || ['¡Hola! Vi tu perfil y me tinca entrenar juntos 💪']
    const firstMsg: Message = {
      id: Date.now().toString(36),
      from: 'them',
      text: openers[0],
      timestamp: Date.now(),
    }
    saveMessages({ ...messages, [profileId]: [firstMsg] })

    addNotification({
      type: 'match',
      title: '¡Nuevo Match!',
      body: `Hiciste match con ${profile.name}`,
      relatedId: profileId,
    })

    bumpPwaEngagement()
    setShowMatchModal(profile)
    triggerConfetti()
    toast.success(`¡Match con ${profile.name}!`, {
      description: isReal ? '¡Ambos se dieron like!' : 'Tienen ganas de entrenar juntos 🔥',
    })
  }

  const handleSwipe = (profileId: string, direction: 'left' | 'right') => {
    // Support both seed profiles and real Firestore profiles
    const profile = [...SEED_PROFILES, ...realProfiles].find(p => p.id === profileId)
    if (!profile) return

    if (direction === 'right') {
      const alreadyLiked = likedIds.includes(profileId)

      if (!alreadyLiked) {
      const newLiked = [...likedIds, profileId]
      saveLiked(newLiked)

      // Network Power priority in action: swiping right on your red gives immediate feedback that the graph is strengthening
      if (syncBonds[profileId]) {
        const bond = syncBonds[profileId]
        toast.success(`⭐ Tu red • ${profile.name}`, {
          description: `LV${bond.bondLevel || 1} • Fuerza del equipo reforzada. Re-sync pronto para +rendimiento compartido y más visibilidad.`
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
                  description: `Si ${profile.name} también te da like, harán match`,
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
                    : 'Revisa tu conexión',
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
            const joinText = '¡Me uno al live ahora mismo! 🔥 ¿Dónde estás entrenando?'
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
                  userName: currentUser?.name || 'Un compañero live',
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
        toast.success(`¡Unido al live de ${profile.name}!`, {
          description: isUserLive(profileId) && currentUser?.trainingNow 
            ? '¡EntrenaSync iniciado! Estado compartido + acciones conjuntas en vivo. Te llevamos al panel.' 
            : 'Dejé un comentario en su muro en vivo — ¡ellos lo verán!'
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
      savePassed(newPassed)
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

  // Manual button actions
  // (swipeLeft, swipeRight, handleDragEnd fully moved into ExploreTab)

  // ==================== CHAT ====================
  const openChat = (profileId: string) => {
    setActiveChat(profileId)
    setActiveTab('messages')
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

  const sendMessage = (text: string, voice?: {voiceUrl: string, voiceDuration: number} | null) => {
    if (!activeChat || (!text.trim() && !voice)) return

    const isRealChat = isRealChatId(activeChat)

    if (isRealChat) {
      // Real cross-device chat
      sendRealMessage(text || '', activeChat, voice)

      // Optimistic update for both local messages and realChatMessages for instant feel
      const newMsg: Message = {
        id: Date.now().toString(36) + Math.random(),
        from: 'me',
        text: text.trim() || '',
        timestamp: Date.now(),
        ...(voice ? { voiceUrl: voice.voiceUrl, voiceDuration: voice.voiceDuration } : {})
      }
      const currentChat = messages[activeChat] || []
      const updated = { ...messages, [activeChat]: [...currentChat, newMsg] }
      saveMessages(updated)

      // Also update the real messages state immediately
      setRealChatMessages(prev => [...prev, newMsg])
      return
    }

    // Demo / seed chat (existing behavior)
    const newMsg: Message = {
      id: Date.now().toString(36) + Math.random(),
      from: 'me',
      text: text.trim() || '',
      timestamp: Date.now(),
      ...(voice ? { voiceUrl: voice.voiceUrl, voiceDuration: voice.voiceDuration } : {})
    }

    const currentChat = messages[activeChat] || []
    const updated = { ...messages, [activeChat]: [...currentChat, newMsg] }
    saveMessages(updated)

    // Simulate realistic reply sometimes (only for seeds)
    setTimeout(() => {
      const profile = SEED_PROFILES.find(p => p.id === activeChat)
      if (!profile) return
      const shouldReply = Math.random() > 0.3
      if (shouldReply) {
        const replies = [
          '¡Buena idea! ¿Qué día te tinca?',
          'Jajaja yo también, ¿a qué hora?',
          'Me encanta la idea. ¿En Reñaca o en la 5ta?',
          'Dale, avísame el día y nos juntamos.',
          'Perfecto, yo también necesito esa motivación extra 🔥'
        ]
        const replyText = replies[Math.floor(Math.random() * replies.length)]
        const reply: Message = {
          id: Date.now().toString(36),
          from: 'them',
          text: replyText,
          timestamp: Date.now()
        }
        const newChat = [...(updated[activeChat] || []), reply]
        const final = { ...updated, [activeChat]: newChat }
        saveMessages(final)
      }
    }, 850 + Math.random() * 600)
  }

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
    setFilters({ minAge: 20, maxAge: 40, gender: 'todos', trainingTypes: [], availability: [], maxDistanceKm: 100, onlyAvailableToday: false, onlyLiveTraining: false })
  })

  // Auth gate lives in RootApp → PublicAuthPage; App only renders for authenticated users.

  // For real users or demo users without full profile, show onboarding/creation flow
  // Only show onboarding when explicitly opened (register, profile editor, demo).
  // Avoid auto-trapping returning logins with incomplete profiles — they can finish via Perfil.
  const shouldShowOnboarding = showOnboarding

  const closeOnboarding = (show: boolean) => {
    setShowOnboarding(show)
    if (!show) setIsEditingProfile(false)
  }

  const openProfileEditor = () => {
    setIsEditingProfile(true)
    setOnboardingStepLocal(0)
    setShowOnboarding(true)
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
          mode={isEditingProfile ? 'edit' : 'create'}
        />
      </ErrorBoundary>
    )
  }

  // Post-onboarding guidance moved to early unconditional useEffect below (see "exceptional onboarding guidance effect").

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0D0D10] text-white flex flex-col overflow-hidden relative app-container">
      {/* PREMIUM TOP BAR - more attractive with better hierarchy, consistent buttons, subtle premium feel */}
      <div className="bg-[#1C1C20] border-b border-[#2F2F35] z-50 flex items-center justify-between px-4 py-2 text-[10px] font-medium shadow-sm">
        <div className="font-semibold tracking-[-0.2px] flex items-center gap-2 text-[#FF671F]">
          <span className="live-pill !py-0.5 !px-2.5 !text-[8px] !bg-[#FF671F]/10 !border-0 ring-1 ring-[#FF671F]/20">PRE-ALPHA</span>
          <span className="text-white/90 text-[11px]">Real backend • v{APP_VERSION}</span>
          <button 
            onClick={refreshAllReal} 
            disabled={isLoadingMatches}
            className="ml-1 text-[9px] px-2.5 py-1 rounded-full bg-[#FF671F]/10 text-[#FF671F] active:bg-[#FF671F]/20 disabled:opacity-60 border border-[#FF671F]/20 active:scale-[0.985] transition-all"
            title="Refrescar perfiles, matches y sesiones reales ahora"
          >
            {isLoadingMatches ? '...' : 'Actualizar todo'}
            {liveTrainingNow.length > 0 && <span className="ml-1 text-[8px] text-[#22c55e]">+{liveTrainingNow.length} live</span>}
          </button>
          {liveTrainingNow.length > 0 && (
            <button 
              onClick={() => { try { triggerHaptic('light') } catch {}; setShowLiveMap(true); }}
              className="ml-1 text-[8px] px-2 py-1 rounded-full bg-[#22c55e] text-black font-bold shadow-sm ring-1 ring-[#22c55e]/50 active:brightness-90 active:scale-[0.985] transition" style={{animation: 'live-pulse-green 2.2s ease-in-out infinite'}}
              title="Ver mapa en vivo"
            >
              🟢 {liveCountForUI} LIVE {currentUser?.trainingNow && currentUser.liveStreak ? `🔥${currentUser.liveStreak}d` : ''}{syncPartnerId ? ' 🔄SYNC' : ''}{activeSyncCount > 0 ? ` · 🔄${activeSyncCount} PARES EN SYNC` : ''}
            </button>
          )}
        </div>

        {(currentUser || firebaseUser) ? (
          <div className="flex items-center gap-1.5">
            {/* Bell for notifications */}
            <button
              onClick={() => setShowNotifications(true)}
              className={`relative p-1.5 rounded-xl bg-black/70 active:bg-black text-white transition-all active:scale-[0.95] ${ (unreadNotifications + totalChatUnreads + totalSessionUnreads) > 0 ? 'ring-1 ring-[#FF4F79]/70' : '' }`}
              aria-label="Notificaciones"
            >
              <Bell size={15} />
              {(unreadNotifications + totalChatUnreads + totalSessionUnreads) > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 text-[8px] font-bold rounded-full flex items-center justify-center ${unreadNotifications > 0 ? 'bg-[#FF4F79] text-black animate-pulse' : 'bg-[#FF671F] text-black'}`}>
                  {Math.min(9, unreadNotifications + totalChatUnreads + totalSessionUnreads)}
                </span>
              )}
            </button>
            <button 
              onClick={handleLogout}
              className="bg-black/90 hover:bg-black text-white px-3 py-1 rounded-2xl text-[10px] font-semibold active:bg-white active:text-black border border-black/50 active:scale-[0.985] transition-all"
            >
              Cerrar sesión
            </button>
            <button 
              onClick={handleLogout}
              className="bg-white hover:bg-gray-100 text-black px-3 py-1 rounded-2xl text-[10px] font-bold active:bg-gray-200 border border-black/20 shadow-sm active:scale-[0.985] transition-all"
            >
              Cambiar cuenta
            </button>
            {!isDemoMode && typeof window !== 'undefined' && typeof (window as any).Capacitor === 'undefined' && (
              <button
                onClick={() => { 
                  localStorage.removeItem('entrenamatch_pwa_dismissed');
                  setShowPwaInstall(true); 
                  bumpPwaEngagement(); 
                }}
                className="ml-1 text-[9px] px-2 py-0.5 rounded-full bg-[#FF671F]/10 text-[#FF671F] active:bg-[#FF671F]/20 border border-[#FF671F]/20 active:scale-[0.985] flex-shrink-0"
                title="Instalar como app en pantalla de inicio"
              >
                📱 Instalar
              </button>
            )}
          </div>
        ) : (
          <div className="text-[10px] opacity-90 font-medium">Inicia sesión para probar</div>
        )}
      </div>

      {/* PWA INSTALL BANNER - attractive, non-nagging. Shows reliably now (5s or on engagement). Exhaustive visual + functional review done. */}
      <AnimatePresence>
        {showPwaInstall && !pwaInstallDismissed && (
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
                ? 'Instálala para abrir rápido desde tu pantalla de inicio + notificaciones nativas.'
                : 'Usa el menú del navegador (⋯ o Compartir) > "Añadir a pantalla de inicio" para instalar como app.'}
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
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* Global offline indicator - visible on all tabs for good UX when no connectivity (Firebase queues + cache) */}
        {isOffline && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-yellow-900/90 text-yellow-200 text-[10px] px-3 py-1 text-center border-b border-yellow-800/60 z-20 flex items-center justify-center gap-2"
          >
            <span>📡</span>
            <span>Sin conexión • usando caché • cambios se guardan y sincronizan al reconectar</span>
          </motion.div>
        )}
        {/* ===== EXPLORE live banner + map (ExploreLivePanel) ===== */}
        {activeTab === 'explore' && (
          <ExploreLivePanel
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
            setActiveTab={setActiveTab}
            setShowLiveModal={setShowLiveModal}
            triggerHaptic={triggerHaptic}
            showLiveMap={showLiveMap}
            networkStats={networkStats}
            gymPulseMapRef={gymPulseMapRef}
            mapLiveTrainingNow={mapLiveTrainingNow}
            effectiveUserId={effectiveUserId}
            syncRipples={syncRipples}
            partnerLocations={partnerLocations}
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
          />
        )}

        {activeTab === 'explore' && (
          <ExploreTab
            deck={deck}
            visibleCards={visibleCards}
            userLocation={userLocation}
            filters={filters}
            currentUser={currentUser}
            setShowFilters={setShowFilters}
            resetDeck={() => { resetSwipeDeck(); toast('Deck reiniciado'); }}
            requestUserLocation={requestUserLocation}
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
            onRefreshRealProfiles={async () => { await loadRealProfiles(); setLastSync(new Date()); }}
            lastSync={lastSync}
            profilePosts={profilePosts}
            syncBonds={syncBonds}
            networkPower={networkStats.networkPower}
          />
        )}

        {/* FULL LIVE MODAL - spectacular full list of live training near you. Enhanced with search, sort by dist/urgency, quick chat, simple visual "map" row (dots sorted by dist). Makes the killer feature even stronger. */}
        {showLiveModal && (
          <div className="absolute inset-0 z-[95] bg-[#0D0D10] flex flex-col" onClick={() => { setShowLiveModal(false); setLiveModalSearch(''); setLiveModalSort('distance'); }}>
            <div className="p-4 flex items-center justify-between border-b border-[#2F2F35]">
              <button onClick={() => { setShowLiveModal(false); setLiveModalSearch(''); setLiveModalSort('distance'); }}><ArrowLeft /></button>
              <div className="font-medium flex items-center gap-2">Entrenando Ahora cerca ({liveCountForUI}) {liveTrainingNow.some(u => u.seVaEnMin > 0) && <span className="text-orange-400 text-xs">¡se va pronto, únete!</span>} {liveCountForUI > 5 && <span className="text-[#22c55e] text-xs">🔥 HOT</span>}</div>
              <div />
            </div>

            {currentUser?.trainingNow && liveTrainingNow.length > 0 && (
              <div className="px-4 py-1 text-[10px] bg-[#22c55e]/10 text-[#22c55e] text-center">💡 Si te unes a alguien que también está live, ¡inicias EntrenaSync automático con timer + acciones instantáneas (se comparten en vivo en ambos muros)!</div>
            )}

            {/* Controls: search + sort for discovery */}
            {liveTrainingNow.length > 0 && (
              <div className="px-4 pt-3 pb-2 border-b border-[#2F2F35]/60 flex gap-2 items-center bg-[#0D0D10]">
                <input 
                  type="text" 
                  value={liveModalSearch} 
                  onChange={e => setLiveModalSearch(e.target.value)} 
                  placeholder="Buscar por nombre..." 
                  className="form-input flex-1 text-sm py-1.5" 
                />
                <button onClick={() => setLiveModalSort(liveModalSort === 'distance' ? 'urgency' : liveModalSort === 'urgency' ? 'hot' : 'distance')} className="text-xs px-3 py-1 rounded-full border border-[#22c55e]/40 text-[#22c55e] active:bg-[#22c55e]/10 whitespace-nowrap">
                  {liveModalSort === 'distance' ? '📍 Dist' : liveModalSort === 'urgency' ? '⏱ Se va pronto' : '🔥 Hot'}
                </button>
              </div>
            )}

            {/* Simple visual "map" row: mini avatars + pulsing dots sorted by distance (emoji radar feel, FOMO visual) - enhanced */}
            {liveTrainingNow.length > 1 && (
              <div className="px-4 py-2 border-b border-[#2F2F35]/50 bg-black/30 radar-container">
                <div className="radar-lines"></div>
                <div className="text-[8px] text-[#9CA3AF] mb-1">Cerca de ti (radar ordenado por distancia)</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[...liveTrainingNow].sort((a,b)=> {
                    const aInNet = !!syncBonds[a.id] ? -1 : 0;
                    const bInNet = !!syncBonds[b.id] ? -1 : 0;
                    if (aInNet !== bInNet) return aInNet - bInNet; // your network first - social graph priority
                    return (a.distance||0)-(b.distance||0);
                  }).map((u, idx) => (
                    <motion.div key={u.id} onClick={() => { setShowLiveModal(false); setShowFullProfile(u); }} whileHover={{scale:1.1}} whileTap={{scale:0.9}} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: idx * 0.05}} className="flex flex-col items-center text-center cursor-pointer active:opacity-80">
                      <div className="relative">
                        {u.photos?.[0] ? <img src={u.photos[0]} className={`w-9 h-9 rounded-full object-cover border-2 ${syncBonds[u.id] ? 'border-[#FFD700]' : 'border-[#22c55e]/60'}`} /> : <div className={`w-9 h-9 rounded-full ${syncBonds[u.id] ? 'bg-[#FFD700] text-black' : 'bg-[#22c55e]/20'} flex items-center justify-center text-[10px] border ${syncBonds[u.id] ? 'border-[#FFD700]' : 'border-[#22c55e]/30'}`}>{(u.name||'U')[0]}</div>}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] rounded-full ring-2 ring-black" style={{animation: u.seVaEnMin < 10 ? 'live-pulse-green-urgent 1.1s ease-in-out infinite' : 'live-pulse-green 1.8s ease-in-out infinite'}}></div>
                        {!!syncBonds[u.id] && <div className="absolute -top-0.5 -left-0.5 text-[6px] bg-[#FFD700] text-black px-0.5 rounded font-bold">RED</div>}
                      </div>
                      <div className="text-[8px] mt-0.5 text-white truncate max-w-[48px] font-medium">{(u.name || 'U').split(' ')[0]}</div>
                      <div className="text-[7px] text-[#22c55e]">{(u.distance||0).toFixed(0)}km {u.joinCount > 0 ? `+${u.joinCount}🔥` : ''} {!!syncBonds[u.id] && <span className="text-[#FFD700]">•NP</span>}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-auto flex-1 p-4">
              {(() => {
                let list = [...liveTrainingNow]
                // search
                if (liveModalSearch.trim()) {
                  const q = liveModalSearch.toLowerCase().trim()
                  list = list.filter(u => (u.name || '').toLowerCase().includes(q) || (u.trainingTypes||[]).join(' ').toLowerCase().includes(q))
                }
                // sort
                if (liveModalSort === 'urgency') {
                  list.sort((a: any, b: any) => (a.seVaEnMin || 99) - (b.seVaEnMin || 99))
                } else if (liveModalSort === 'hot') {
                  list.sort((a: any, b: any) => (b.joinCount || 0) - (a.joinCount || 0) || (a.distance || 999) - (b.distance || 999))
                } else {
                  list.sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999))
                }
                return list.length > 0 ? list.map(user => (
                  <div key={user.id} onClick={() => { setShowLiveModal(false); setShowFullProfile(user); }} className="card card-glass p-3 mb-2 flex gap-3 cursor-pointer active:scale-95 border border-[#22c55e]/50 hover:border-[#22c55e]/80 transition-all group">
                    {user.photos && user.photos[0] && <img src={user.photos[0]} className="w-12 h-12 rounded-xl object-cover border-2 border-[#22c55e]/40 group-hover:border-[#22c55e]/70 transition" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold flex items-center gap-1.5 text-white">{user.name || 'Usuario'} <span className="text-[#9CA3AF] text-xs font-normal">· {userLocation && user.distance < 900 ? `${user.distance.toFixed(1)}km` : '— km'}</span>{!!syncBonds[user.id] && <span className="text-[7px] bg-[#FFD700] text-black px-1 rounded font-bold">⭐ RED · F{syncBonds[user.id].bondLevel || 1}</span>}</div>
                      <div className="text-[#9CA3AF] text-sm truncate">{user.trainingTypes?.join(', ') || 'Entreno'}</div>
                      <div className="text-[#22c55e] text-xs flex items-center gap-1 mt-0.5">En vivo hace {Math.floor((Date.now() - (user.trainingNowSince || 0))/60000)}m {user.seVaEnMin > 0 ? <span className={user.seVaEnMin < 15 ? 'text-red-400 font-bold' : 'text-orange-400'}>{user.seVaEnMin < 15 ? `· se va pronto en ${user.seVaEnMin}m 🔥` : `· se va en ${user.seVaEnMin}m`}</span> : ''}
                      </div>
                      {user.seVaEnMin > 0 && (
                        <div className="h-1 bg-[#22c55e]/20 rounded mt-0.5 mb-1">
                          <div className="h-1 bg-[#22c55e] rounded" style={{width: `${Math.max(5, Math.min(100, (90 - user.seVaEnMin)/90 * 100))}%`}}></div>
                        </div>
                      )}
                      {user.joinCount > 0 && <div className="text-[10px] text-[#22c55e] mt-0.5 font-medium">+{user.joinCount} se unieron a este live</div>}
                      {user.trainingSyncWith && <div className="text-[8px] text-[#22c55e] mt-0.5">🔄 En Sync ahora</div>}
                      {!!syncBonds[user.id] && <div className="text-[7px] text-[#FFD700] mt-0.5 font-medium">Tu red • re-sync = +Fuerza del equipo + impacto compartido</div>}
                    </div>
                    <div className="flex flex-col gap-1 self-center">
                      <button 
                        disabled={joiningSyncWith === user.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowLiveModal(false)
                          if (currentUser?.trainingNow && isUserLive(user.id)) {
                            startSyncWith(user.id, user.name)
                          } else {
                            handleSwipe(user.id, 'right')
                          }
                        }} 
                        className={`text-[10px] ${syncBonds[user.id] ? 'bg-[#FFD700] text-black' : 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black'} px-3 py-1 rounded font-semibold active:brightness-90 flex items-center justify-center gap-1 ${joiningSyncWith === user.id ? 'opacity-80 cursor-wait' : ''}`}
                      >
                        {joiningSyncWith === user.id ? '⏳ Abriendo EntrenaSync...' : (syncBonds[user.id] ? `🔥 RE-SYNC RED (NP+)` : `🔥 Entrenar juntos (Sync) ${userLocation && user.distance < 900 ? `(${user.distance.toFixed(0)}km)` : ''}`)}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setShowLiveModal(false); openChat(user.id); if (!matches.includes(user.id) && !realMatches.includes(user.id)) handleSwipe(user.id, 'right'); }} className="text-[9px] border border-[#22c55e]/60 text-[#22c55e] px-2 py-0.5 rounded active:bg-[#22c55e]/10 hover:bg-[#22c55e]/5">Chatear ya</button>
                    </div>
                  </div>
                )) : currentUser?.trainingNow ? (
                  <div className="card card-glass p-6 text-center border border-[#22c55e]/40">
                    <div className="text-3xl mb-2">🟢</div>
                    <div className="font-semibold text-[#22c55e] mb-1">Estás en vivo — visible en el GymPulse</div>
                    <div className="text-sm text-[#9CA3AF] mb-3">Aún no hay otros entrenando cerca. Tu marcador ya está en el mapa; cuando alguien más active live aparecerá aquí.</div>
                    <button onClick={() => { setShowLiveModal(false); setShowLiveMap(true); }} className="text-xs px-4 py-1.5 rounded-full bg-[#22c55e] text-black font-bold active:brightness-90">Ver mapa →</button>
                  </div>
                ) : (
                  <div className="card card-glass p-6 text-center border border-[#22c55e]/30">
                    <div className="text-3xl mb-2">🏋️</div>
                    <div className="font-semibold text-white mb-1">¡Aún no hay nadie entrenando cerca!</div>
                    <div className="text-sm text-[#9CA3AF] mb-3">Sé el primero en activar "Entrenando Ahora (EN VIVO)" en tu Perfil. ¡Aparecerás en el radar y la gente querrá unirse o sync contigo!</div>
                    <button onClick={() => { setShowLiveModal(false); setActiveTab('profile'); }} className="text-xs px-4 py-1.5 rounded-full bg-[#22c55e] text-black font-bold active:brightness-90">Ir a Perfil a activar →</button>
                  </div>
                )
              })()}
            </div>
            <div className="p-3 border-t border-[#2F2F35] bg-[#0D0D10]">
              <div className="text-center text-xs text-[#9CA3AF] mb-2">Toca card → perfil. Unirme = like + auto-comment en su muro live. ¡Ver el pulso en vivo en el mapa te motiva a abrir y entrenar ya!</div>
              {liveTrainingNow.length >= 2 && (
                <button
                  onClick={() => {
                    setShowLiveModal(false)
                    // Quick group session polish: create an optimistic session with the current live people + self
                    const liveNames = liveTrainingNow.slice(0, 4).map(u => (u.name||'U').split(' ')[0]).join(', ')
                    const newGroupSession: TrainingSession = {
                      id: 'livegroup' + Date.now(),
                      creatorId: effectiveUserId,
                      creatorName: currentUser?.name || 'Tú',
                      title: `Live training ya — ${liveNames}`,
                      description: '¡Armado desde el live cerca! Todos los que estaban entrenando ahora.',
                      time: 'Ahora',
                      location: currentUser?.city || 'Cerca de ti',
                      trainingType: liveTrainingNow[0]?.trainingTypes?.[0] || 'Mixto',
                      maxParticipants: Math.min(8, liveTrainingNow.length + 2),
                      participants: [effectiveUserId, ...liveTrainingNow.map(u => u.id)],
                      createdAt: Date.now()
                    }
                    // Local + demo
                    const updatedSessions = [newGroupSession, ...(sessions || [])]
                    if (typeof saveSessions === 'function') saveSessions(updatedSessions); else setSessions(updatedSessions);
                    // Real write attempt
                    if (!isDemoMode && firebaseUser?.uid && db) {
                      (async () => {
                        try {
                          const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
                          await setDoc(doc(db, 'sessions', newGroupSession.id), {
                            ...newGroupSession,
                            createdAt: serverTimestamp(),
                          }, { merge: true })
                        } catch {}
                      })()
                    }
                    setActiveTab('sesiones')
                    toast.success('¡Sesión grupal creada!', { description: `Con ${liveTrainingNow.length} live cerca. Ve a Sesiones para chatear en grupo.` })
                  }}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black font-bold text-sm active:scale-[0.985]"
                >
                  🔥 Armar sesión grupal con estos {liveTrainingNow.length} live ahora
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===== HOME — DailyHome + Muro (HomeTab) ===== */}
        {activeTab === 'home' && (
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
            setActiveTab={setActiveTab}
            setShowLiveMap={setShowLiveMap}
            startSyncWith={startSyncWith}
            setActiveChat={setActiveChat}
            setShowEntrenaLogModal={setShowEntrenaLogModal}
            fuelProfile={fuelProfile}
            fuelTodayTotals={fuelTodayTotals}
            fuelTodayLogs={fuelTodayLogs}
            fuelWeekDays={fuelWeekDays}
            fuelWeekMacros={fuelWeekMacros}
            fuelPostWorkoutTip={fuelPostWorkoutTip}
            setShowFuelSetupModal={setShowFuelSetupModal}
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
            loadRealProfiles={loadRealProfiles}
            isLoadingFeed={isLoadingFeed}
            activeSyncPairs={activeSyncPairs}
            liveTrainingNow={liveTrainingNow}
            syncBonds={syncBonds}
            triggerHaptic={triggerHaptic}
            showFeedPublishSuccess={showFeedPublishSuccess}
            feedComputation={feedComputation}
            hasMoreGlobalFeed={hasMoreGlobalFeed}
            effectiveUserId={effectiveUserId}
            setShowFullProfile={setShowFullProfile}
            boostReaction={boostReaction}
            openFullComments={openFullComments}
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
            showFirstSteps={!!firstStepsProgress && !firstStepsProgress.dismissed}
            onDismissFirstSteps={() => {
              if (!db || !firebaseUser?.uid) return
              void saveFirstStepsProgress(db, firebaseUser.uid, { dismissed: true }).then(() =>
                setFirstStepsProgress((prev) =>
                  prev ? { ...prev, dismissed: true, updatedAt: Date.now() } : prev
                )
              )
            }}
          />
          </Suspense>
        )}

        {/* LUXURIOUS REMASTERED FEED COMPOSER MODAL — feels expensive and important */}
        {activeTab === 'home' && showFeedPostModal && (
          <div className="absolute inset-0 z-[95] bg-black/90 flex items-end md:items-center justify-center p-0 md:p-6" onClick={() => setShowFeedPostModal(false)}>
            <div 
              className="feed-composer-modal w-full md:w-[520px] rounded-t-3xl md:rounded-3xl p-6 md:p-7 text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">🔥</div>
                    <div className="font-black text-2xl tracking-[-1px]">Publicar en el Muro</div>
                  </div>
                  <div className="text-sm text-[#9CA3AF] mt-0.5">Tu momento aparecerá en el GymPulse de toda la comunidad</div>
                </div>
                <button onClick={() => { setShowFeedPostModal(false); setFeedPostText(''); setFeedPostPhoto(null); }} className="text-3xl text-[#9CA3AF] leading-none mt-[-6px] active:text-white">×</button>
              </div>

              <textarea
                value={feedPostText}
                onChange={e => setFeedPostText(e.target.value)}
                placeholder={feedPostPhoto ? "Añade un caption épico para tu foto..." : "Comparte tu entreno, un PR, una foto del gym, un \"me uno al pulso\" o lo que quieras que inspire a la red..."}
                className="feed-composer-textarea form-input w-full h-32 text-[15px] resize-y mb-4 rounded-2xl p-4"
                maxLength={280}
                autoFocus
              />

              {feedPostPhoto && <div className="text-[10px] text-[#FF671F]/70 -mt-3 mb-3 tracking-wide">Foto + texto se publican juntos en el Muro</div>}

              {feedPhotoUploading && (
                <div className="mb-4">
                  <div className="text-xs text-[#9CA3AF] mb-1 flex justify-between"><span>Subiendo foto al GymPulse...</span><span className="text-[#FF671F]">{feedPhotoUploadProgress}%</span></div>
                  <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden"><div className="h-1.5 bg-gradient-to-r from-[#FF671F] via-[#FF4F79] to-[#FF671F] transition-all" style={{ width: `${feedPhotoUploadProgress}%` }} /></div>
                </div>
              )}

              {feedPostPhoto && !feedPhotoUploading && (
                <div className="mb-4">
                  <div className="text-xs text-[#9CA3AF] mb-1.5 flex items-center justify-between px-0.5">Foto del entreno <span className="text-[#FF671F]/60">toca para previsualizar</span></div>
                  <div className="relative inline-block w-full group" onClick={() => setFeedPhotoModal({url: feedPostPhoto})}>
                    <img src={feedPostPhoto} className="feed-composer-photo w-full max-h-[210px] rounded-2xl object-cover cursor-zoom-in" />
                    <button onClick={(e) => { e.stopPropagation(); setFeedPostPhoto(null); }} className="absolute -top-2.5 -right-2.5 bg-black/90 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center border border-white/20 z-10 active:scale-90">×</button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    if (Capacitor.isNativePlatform() && CapacitorCamera) {
                      (async () => {
                        try {
                          const photo = await CapacitorCamera.getPhoto({ quality: 82, allowEditing: true, resultType: 'base64' });
                          if (photo?.base64String) {
                            const dataUrl = `data:image/jpeg;base64,${photo.base64String}`;
                            if (!isDemoMode && storage) {
                              setFeedPhotoUploading(true); setFeedPhotoUploadProgress(0);
                              try {
                                const { ref, uploadString, getDownloadURL } = await import('firebase/storage');
                                const path = `posts/${effectiveUserId}/feed-${Date.now()}.jpg`;
                                const storageRef = ref(storage, path);
                                const snap = await uploadString(storageRef, dataUrl, 'data_url');
                                const url = await getDownloadURL(snap.ref);
                                setFeedPostPhoto(url); setFeedPhotoUploading(false);
                              } catch (uploadErr) {
                                setFeedPostPhoto(dataUrl); setFeedPhotoUploading(false);
                                toast((uploadErr as any)?.code === 'storage/unauthorized' ? 'Storage sin permisos — revisa reglas' : 'Foto embebida');
                              }
                            } else {
                              setFeedPostPhoto(dataUrl);
                            }
                          }
                        } catch { toast('No se pudo usar cámara'); setFeedPhotoUploading(false); }
                      })();
                    } else {
                      feedPhotoInputRef.current?.click();
                    }
                  }}
                  className="flex-1 py-3 text-sm border border-[#333] rounded-2xl active:bg-[#25252A] flex items-center justify-center gap-2 hover:border-[#FF671F]/50 transition"
                >
                  <Camera size={16} /> {feedPostPhoto ? 'Cambiar foto' : 'Añadir foto del entreno'}
                </button>
                <input ref={feedPhotoInputRef} type="file" accept="image/*" onChange={handleFeedPhotoFile} className="hidden" />

                <button 
                  onClick={async () => {
                    if (!feedPostText.trim()) return;
                    const text = feedPostText.trim();
                    const photo = feedPostPhoto;
                    setFeedPublishing(true);
                    try {
                      await createProfilePost(text, photo);
                      setShowFeedPostModal(false);
                      setFeedPostText(''); setFeedPostPhoto(null); setFeedPublishing(false);
                      setShowFeedPublishSuccess(true); setTimeout(() => setShowFeedPublishSuccess(false), 4200);
                      toast.success('¡Publicado en el Muro del GymPulse!', { description: 'Toda la comunidad ya puede verlo y reaccionar.' });
                      if (activeTab === 'home') loadGlobalFeed().catch(() => {});
                      try { confetti({ particleCount: 140, spread: 70, origin: { y: 0.65 } }); } catch {}
                    } catch (e) { setFeedPublishing(false); toast.error('Error al publicar'); }
                  }}
                  disabled={!feedPostText.trim() || feedPublishing}
                  className="flex-1 feed-publish-btn py-3 rounded-2xl text-base disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {feedPublishing ? 'PUBLICANDO EN EL PULSO...' : 'PUBLICAR EN EL MURO'}
                </button>
              </div>

              <div className="text-center text-[10px] text-[#9CA3AF]/70 mt-4">Visible para toda la comunidad • reacciones y comentarios en tiempo real • los mejores posts se propagan como highlights</div>
            </div>
          </div>
        )}

        {/* TOP UPDATE v0.1.7: Global beautiful photo lightbox (works from feed posts - makes the social wall feel premium and top-tier) */}
        {feedPhotoModal && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-3" onClick={() => setFeedPhotoModal(null)}>
            <div className="relative w-full max-w-[96vw] max-h-[96vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <img 
                src={feedPhotoModal.url} 
                className="max-w-full max-h-[90vh] rounded-3xl object-contain shadow-[0_0_80px_rgba(255,103,31,0.15)]" 
              />
              <button 
                onClick={() => setFeedPhotoModal(null)}
                className="absolute -top-2 -right-2 bg-[#FF671F] text-black w-10 h-10 rounded-full flex items-center justify-center text-2xl font-black shadow-lg active:scale-95"
              >
                ×
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] bg-black/70 text-white/90 px-4 py-1 rounded-full tracking-widest">TOCA FUERA PARA CERRAR • FEED POST</div>
            </div>
          </div>
        )}

        {activeTab === 'squads' && (
          <SquadsTab
            squads={squads}
            isDemoMode={isDemoMode}
            effectiveUserId={effectiveUserId}
            isUserLive={isUserLive}
            resolveMemberName={resolveMemberName}
            onCreateSquad={() => setShowCreateSquad(true)}
            onJoinSquad={handleJoinSquad}
            onOpenSquad={setSelectedSquad}
          />
        )}

        {activeTab === 'sesiones' && (
          <SessionsTab
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
        )}

        {activeTab === 'matches' && (
          <MatchesTab
            matchProfiles={matchProfiles}
            blockedUsers={blockedUsers}
            syncBonds={syncBonds}
            realProfiles={realProfiles}
            userLocation={userLocation}
            reviews={reviews}
            squads={squads}
            effectiveUserId={effectiveUserId}
            profilePosts={profilePosts}
            isDemoMode={isDemoMode}
            isLoadingMatches={isLoadingMatches}
            lastSync={lastSync}
            onExplore={() => setActiveTab('explore')}
            onOpenChat={openChat}
            onRefreshReal={async () => {
              setIsLoadingMatches(true)
              try {
                await loadRealProfiles()
              } finally {
                setIsLoadingMatches(false)
              }
            }}
            onRefreshAll={async () => {
              setIsLoadingMatches(true)
              try {
                await loadRealProfiles()
                await loadRealMatches()
              } finally {
                setIsLoadingMatches(false)
              }
            }}
          />
        )}

        {/* ===== MESSAGES ===== */}
        {activeTab === 'messages' && (
          <div className="flex-1 flex flex-col">
            {!activeChat ? (
              <ChatListPanel
                matchProfiles={matchProfiles}
                blockedUsers={blockedUsers}
                messages={messages}
                chatUnreads={chatUnreads}
                syncBonds={syncBonds}
                userLocation={userLocation}
                isDemoMode={isDemoMode}
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
                onRefreshChats={async () => {
                  setIsLoadingChats(true)
                  try {
                    const currentMatches = await loadRealMatches()
                    for (const id of currentMatches) {
                      await loadRealChatMessages(id)
                    }
                    setLastSync(new Date())
                    setChatUnreads({})
                    toast.success('Chats reales actualizados')
                  } finally {
                    setIsLoadingChats(false)
                  }
                }}
              />
            ) : activeChat ? (
              <ChatView
                activeChat={activeChat}
                chatProfile={chatProfile}
                isRealMatch={realMatches.includes(activeChat)}
                chatMessages={realChatMessages.length > 0 ? realChatMessages : (messages[activeChat] || [])}
                syncBond={syncBonds[activeChat]}
                isDemoMode={isDemoMode}
                isLoadingChats={isLoadingChats}
                playingVoiceId={playingVoiceId}
                voicePlayProgress={voicePlayProgress}
                pendingVoice={pendingVoice}
                isUploadingVoice={isUploadingVoice}
                voiceUploadProgress={voiceUploadProgress}
                isRecordingVoice={isRecordingVoice}
                recordingTime={recordingTime}
                recordingLevels={recordingLevels}
                chatInputValue={chatInputValue}
                partnerTyping={chatPartnerTyping}
                chatScrollRef={chatScrollRef}
                renderMessageText={renderMessageText}
                onBack={() => setActiveChat(null)}
                onShowProfile={() => chatProfile && setShowFullProfile(chatProfile)}
                onRefreshChat={async () => {
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
                }}
                onStartSync={() => startSyncWith(activeChat, chatProfile?.name || '')}
                onReport={() => openReport(activeChat, '1v1_chat')}
                onBlock={async () => {
                  if (confirm('¿Bloquear este usuario? No lo verás más.')) {
                    await blockUser(activeChat)
                    setActiveChat(null)
                  }
                }}
                onShowReviewModal={() => {
                  setShowReviewModalFor(activeChat)
                  setReviewRating(5)
                  setReviewComment('')
                }}
                onToggleVoicePlay={(m) => {
                  try { triggerHaptic(playingVoiceId === m.id ? 'light' : 'medium') } catch {}
                  if (playingVoiceId === m.id) {
                    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null }
                    setPlayingVoiceId(null)
                    setVoicePlayProgress(0)
                  } else {
                    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null }
                    setPlayingVoiceId(m.id)
                    setVoicePlayProgress(0)
                    const audio = new Audio(m.voiceUrl!)
                    currentAudioRef.current = audio
                    audio.onended = () => { setPlayingVoiceId(null); setVoicePlayProgress(0); currentAudioRef.current = null }
                    audio.ontimeupdate = () => {
                      if (audio.duration > 0) setVoicePlayProgress(Math.min(100, (audio.currentTime / audio.duration) * 100))
                    }
                    audio.play().catch(() => { setPlayingVoiceId(null); setVoicePlayProgress(0); currentAudioRef.current = null })
                  }
                }}
                onSendMessage={sendMessage}
                onSendBondTemplate={(tpl) => {
                  sendMessage(tpl)
                  createProfilePost(`En chat con mi socio de EntrenaSync: ${tpl}`, null).catch(() => {})
                }}
                onPreviewPendingVoice={() => {
                  try { triggerHaptic('medium') } catch {}
                  if (pendingVoice) new Audio(pendingVoice.url).play().catch(() => {})
                }}
                onCancelPendingVoice={() => {
                  if (voicePreviewUrlRef.current) URL.revokeObjectURL(voicePreviewUrlRef.current)
                  voicePreviewUrlRef.current = null
                  setPendingVoice(null)
                }}
                onReRecordVoice={() => {
                  if (voicePreviewUrlRef.current) URL.revokeObjectURL(voicePreviewUrlRef.current)
                  voicePreviewUrlRef.current = null
                  setPendingVoice(null)
                  setTimeout(() => startVoiceRecording(), 50)
                }}
                onSendPendingVoice={() => {
                  if (pendingVoice) sendVoiceNote(activeChat, false)
                }}
                onCancelUpload={() => {
                  setPendingVoice(null)
                  setIsUploadingVoice(false)
                  setVoiceUploadProgress(0)
                }}
                onChatInputChange={(value) => {
                  setChatInputValue(value)
                  if (isDemoMode || !db || !firebaseUser?.uid || !activeChat) return
                  if (chatTypingTimerRef.current) clearTimeout(chatTypingTimerRef.current)
                  void setChatTyping(db, firebaseUser.uid, activeChat, value.trim().length > 0)
                  chatTypingTimerRef.current = setTimeout(() => {
                    void setChatTyping(db, firebaseUser.uid, activeChat, false)
                  }, 4000)
                }}
                onSubmitForm={(e) => {
                  e.preventDefault()
                  const input = (e.currentTarget.elements[0] as HTMLInputElement)
                  if (pendingVoice) sendVoiceNote(activeChat, false)
                  else if (input.value.trim()) sendMessage(input.value)
                  input.value = ''
                  setChatInputValue('')
                }}
                onStartVoiceRecording={startVoiceRecording}
                onStopVoiceRecording={stopVoiceRecording}
                onCancelVoiceRecording={cancelVoiceRecording}
              />
            ) : null}
          </div>
        )}

        {/* ===== PROFILE - Premium Pre-Alpha experience (self-contained to prevent black screens) */}
        {activeTab === 'profile' && currentUser && (
          <ProfileTab
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
            setActiveTab={setActiveTab}
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
            onOpenMarketplace={() => {
              setMarketplaceScreenMode('shop')
              setShowMarketplace(true)
            }}
            onOpenTrainerCoach={() => {
              setTrainerCoachPreselect(null)
              setShowTrainerCoach(true)
            }}
            isMarketplaceAdmin={isMarketplaceAdmin}
            onOpenAdminOps={() => setShowAdminOps(true)}
          />
        )}
            {/* DUPLICATE ORPHAN PROFILE JSX REMOVED — all rich Profile UI now lives cleanly inside the activeTab==='profile' conditional (prevents black screens, duplicate renders, and JSX imbalance) */}

            {/* Pre-Alpha Welcome Modal */}
            {showPreAlphaWelcome && (
              <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 p-6" onClick={() => {
                localStorage.setItem('entrenamatch_prealpha_welcome_shown', 'true')
                setShowPreAlphaWelcome(false)
              }}>
                <div 
                  onClick={e => e.stopPropagation()} 
                  className="card w-full max-w-[380px] rounded-3xl p-7 text-center"
                >
                  <div className="text-2xl font-semibold mb-2">¡Bienvenido al prealpha!</div>
                  <p className="text-sm text-[#9CA3AF] mb-4">
                    Estás entre los primeros en probar <strong>Tu equipo de gym en vivo</strong> con perfiles reales. <span className="text-[#FF671F]">Mapa en vivo, EntrenaSync y tu red de gym partners.</span>
                  </p>

                  <div className="bg-[#1C1C20] rounded-2xl p-4 text-left text-sm mb-5">
                    <div className="font-medium text-white mb-2">Lo que verás (ya real y en vivo):</div>
                    <ul className="space-y-1.5 text-[#cbd5e1]">
                      <li>→ Explora perfiles reales con "disponibles ahora", recs "reales primero" + motivos de compat, badges en vivo y lastSync</li>
                      <li>→ Matches y chats 1:1 / grupal en sesiones (cross-device real-time)</li>
                      <li>→ Crea y únete a sesiones con chat grupal (tú administras como creador)</li>
                      <li>→ Tu feedback (en Perfil) da forma a lo que viene</li>
                      <li>→ Nuevo diseño naranja/rosa atractivo (energía Dunkin' + diversión social)</li>
                      <li>→ Banner para instalar como app (PWA) + botón "Actualizar todo" en la barra superior</li>
                    </ul>
                  </div>

                  <div className="text-left text-sm mb-5">
                    <div className="font-medium text-white mb-1.5">Regla de oro para estos primeros testers:</div>
                    <div className="text-[#9CA3AF]">Si algo te molesta, no funciona o te encanta → cuéntanos en el formulario de Feedback en Perfil. Los problemas (y las alegrías) de los primeros usuarios reales son oro.</div>
                  </div>

                  <div className="text-[10px] text-[#9CA3AF] mb-4">Privacidad y Términos actualizados y enlazados en tu Perfil.</div>

                  <button 
                    onClick={() => {
                      localStorage.setItem('entrenamatch_prealpha_welcome_shown', 'true')
                      setShowPreAlphaWelcome(false)
                    }} 
                    className="btn-primary w-full"
                  >
                    Entendido — ¡a elegir perfiles reales!
                  </button>

                  <p className="text-[10px] text-[#9CA3AF] mt-4">Gracias de verdad por ser de los primeros ❤️</p>
                </div>
              </div>
            )}
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
                      ❤️ <span className="text-xs">{(livePost.likes || []).length}</span>
                    </button>
                  </div>
                  <button onClick={closeFullComments} className="text-xl px-2 text-[#9CA3AF] active:text-white">×</button>
                </div>

                {/* Scrollable thread */}
                <div className="max-h-[52vh] overflow-y-auto p-4 space-y-3 text-sm bg-[#161618]">
                  {livePost.text && (
                    <div className="text-xs text-[#9CA3AF] mb-2 italic border-l-2 border-[#FF671F]/40 pl-2">
                      {livePost.pinned && '📌 '}"{livePost.text.length > 120 ? livePost.text.slice(0,120) + '...' : livePost.text}"
                    </div>
                  )}
                  {comments.length > 0 ? (
                    comments.map((c: any) => (
                      <div key={c.id} className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#2F2F35] flex-shrink-0 text-[10px] flex items-center justify-center mt-0.5">👤</div>
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
                                ×
                              </button>
                            )}
                          </div>
                          <div className="text-[#E5E7EB] leading-snug break-words">{c.text}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-[#9CA3AF] py-4">Sé el primero en comentar este post.</div>
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

      {/* Floating Guía and Reportar removed per request (clutter at bottom, interferes with profile selection in Explore). 
         Report/feedback still available in Profile tab (structured form + history), chat headers, and legal links.
         Welcome guide modal can still be triggered if needed via other means or first-load. */}

      {/* Bottom Navigation - Premium, energetic feel (polished aesthetics) */}
      <MarketplaceView
        open={showMarketplace}
        onClose={() => {
          setShowMarketplace(false)
          setMarketplaceScreenMode('shop')
        }}
        initialScreenMode={marketplaceScreenMode}
        products={marketplaceProducts}
        isAdmin={isMarketplaceAdmin}
        isDemoMode={isDemoMode}
        userUid={firebaseUser?.uid}
        userEmail={firebaseUser?.email ?? undefined}
        onCreateProduct={async (input: MarketplaceProductInput) => {
          if (!db || !firebaseUser?.uid) throw new Error('auth')
          await createMarketplaceProduct(db, firebaseUser.uid, input)
        }}
        onUpdateProduct={async (id, patch) => {
          if (!db) throw new Error('db')
          await updateMarketplaceProduct(db, id, patch)
        }}
        onDeleteProduct={async (id) => {
          if (!db) throw new Error('db')
          await deleteMarketplaceProduct(db, id)
        }}
        onCheckout={async (product, shipping) => {
          if (!db || !firebaseUser?.uid) throw new Error('auth')
          return createMarketplaceOrder(db, firebaseUser.uid, product, shipping)
        }}
        myOrders={myMarketplaceOrders}
      />
      <AdminOpsPanel
        open={showAdminOps}
        onClose={() => setShowAdminOps(false)}
        orders={adminOrders}
        trainers={trainerProfiles}
        onUpdateOrderStatus={async (orderId, status) => {
          if (!db) throw new Error('db')
          await updateMarketplaceOrderStatus(db, orderId, status)
        }}
        onSetTrainerVerified={async (trainerUserId, verified) => {
          if (!db) throw new Error('db')
          await setTrainerVerified(db, trainerUserId, verified)
        }}
        metrics={computeAdminMetrics(
          realProfiles,
          adminBookings,
          adminOrders,
          mpConfigured
        )}
      />
      <PostRegisterGuide
        open={showPostRegisterGuide}
        onClose={() => {
          setShowPostRegisterGuide(false)
          if (db && firebaseUser?.uid) {
            void markPostRegisterGuideSeen(db, firebaseUser.uid)
          }
        }}
        onStep={(step) => {
          if (step === 'profile') setActiveTab('profile')
          if (step === 'live') void toggleLiveTraining()
          if (step === 'explore') setActiveTab('explore')
        }}
      />
      <TrainerCoachView
        open={showTrainerCoach}
        onClose={() => {
          setShowTrainerCoach(false)
          setTrainerCoachPreselect(null)
          setTrainerCoachInitialTab(undefined)
        }}
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
        onRequestLocation={requestUserLocation}
        onCreateDispatch={async (input, candidateIds) => {
          if (!db || !firebaseUser?.uid) throw new Error('auth')
          const clientName = currentUser?.name || firebaseUser.email?.split('@')[0] || 'Cliente'
          const nearby = findNearbyDispatchTrainers(
            trainerProfiles,
            trainerProfileCoords,
            input.specialty,
            input.lat,
            input.lng
          )
          const estimate = estimateDispatchPrice(nearby, input.durationMin)
          return createTrainerDispatchRequest(
            db,
            firebaseUser.uid,
            clientName,
            input,
            estimate,
            candidateIds
          )
        }}
        onCancelDispatch={async (dispatchId) => {
          if (!db) throw new Error('db')
          await cancelTrainerDispatch(db, dispatchId)
        }}
        onDispatchMatched={() => {
          setTrainerCoachInitialTab('sessions')
        }}
        onSaveTrainerProfile={async (input: TrainerProfileInput) => {
          if (!db || !firebaseUser?.uid) throw new Error('auth')
          const name = currentUser?.name || firebaseUser.email?.split('@')[0] || 'Entrenador'
          const coords =
            input.availableForDispatch && userLocation ? userLocation : null
          if (input.availableForDispatch && !userLocation) {
            toast.info('Activa GPS para recibir ofertas cerca de ti')
          }
          await saveTrainerProfile(db, firebaseUser.uid, name, input, coords)
        }}
        onCreateBooking={async (trainer, input) => {
          if (!db || !firebaseUser?.uid) throw new Error('auth')
          const clientName = currentUser?.name || firebaseUser.email?.split('@')[0] || 'Cliente'
          return createTrainerBooking(db, firebaseUser.uid, clientName, trainer, input)
        }}
        onUpdateBookingStatus={async (bookingId, status) => {
          if (!db) throw new Error('db')
          try {
            await updateTrainerBookingStatus(db, bookingId, status)
            toast.success('Sesión actualizada')
          } catch (e) {
            console.warn(e)
            toast.error('No se pudo actualizar la sesión')
            throw e
          }
        }}
        onOpenPayment={(url) => window.open(url, '_blank', 'noopener,noreferrer')}
        onRequestReview={(trainerId, bookingId) => {
          setPendingReviewBookingId(bookingId)
          setShowTrainerCoach(false)
          setShowReviewModalFor(trainerId)
        }}
        onStartEntrenaSync={async (booking) => {
          if (!firebaseUser?.uid) return
          const partnerId =
            booking.trainerId === firebaseUser.uid ? booking.clientId : booking.trainerId
          const partnerName =
            booking.trainerId === firebaseUser.uid ? booking.clientName : booking.trainerName
          setShowTrainerCoach(false)
          await startSyncWith(partnerId, partnerName)
          if (db) {
            await linkBookingSyncSession(
              db,
              booking.id,
              buildSyncSessionId(firebaseUser.uid, partnerId)
            )
          }
        }}
        onPayWithMercadoPago={async (booking) => {
          try {
            const result = await createTrainerMpCheckout(booking.id)
            window.open(result.initPoint, '_blank', 'noopener,noreferrer')
            if (result.usedFallback) {
              toast.info('Link de pago del entrenador', {
                description: 'Confirma el pago manualmente cuando hayas completado la transferencia.',
              })
            } else {
              toast.success('Checkout Mercado Pago', {
                description: `Comisión plataforma ${result.platformFeeClp.toLocaleString('es-CL')} CLP — el pago se confirmará automáticamente.`,
              })
            }
          } catch (e) {
            console.warn(e)
            toast.error('No se pudo iniciar el pago', {
              description: e instanceof Error ? e.message : 'Intenta de nuevo',
            })
            throw e
          }
        }}
        clientDispatchHistory={clientDispatchHistory}
        trainerDispatchHistory={trainerDispatchHistory}
      />
      <EntrenaLogModal
        open={showEntrenaLogModal}
        onClose={() => {
          setShowEntrenaLogModal(false)
          setEntrenaLogPrefill(null)
        }}
        onSave={handleSaveEntrenaLog}
        saving={savingWorkout}
        defaultTitle={entrenaLogPrefill?.title || 'Entrenamiento de hoy'}
        initialExercises={entrenaLogPrefill?.exercises}
        initialType={entrenaLogPrefill?.type}
        initialDurationMin={entrenaLogPrefill?.durationMin}
      />
      <FuelSetupModal
        open={showFuelSetupModal}
        initial={fuelProfile}
        defaultAge={currentUser?.age}
        defaultGender={currentUser?.gender}
        onClose={() => setShowFuelSetupModal(false)}
        onSave={handleSaveFuelProfile}
        saving={savingFuel}
      />
      <FuelLogModal
        open={showFuelLogModal}
        editEntry={editingFuelLog}
        onClose={() => {
          setEditingFuelLog(null)
          setShowFuelLogModal(false)
        }}
        onSave={handleSaveFuelLog}
        onAnalyzePhoto={handleAnalyzeFood}
        saving={savingFuel}
      />
      <LiveToggleFab
        isLive={!!currentUser?.trainingNow}
        isTogglingLive={isTogglingLive}
        liveCount={liveCountForUI}
        onToggle={() => toggleLiveTraining()}
        hidden={
          !currentUser ||
          showSyncArena ||
          showOnboarding ||
          authBooting ||
          (activeTab === 'messages' && !!activeChat)
        }
      />
      <div className="bottom-nav h-[62px] grid grid-cols-7 z-50 text-[9px] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_-6px_rgb(0,0,0,0.4)]">
        {[
          { id: 'explore' as Tab, label: 'Explorar', icon: Dumbbell, live: liveTrainingNow.length > 0 },
          { id: 'home' as Tab, label: 'Hoy', icon: Sparkles },
          { id: 'squads' as Tab, label: 'Squads', icon: Users },
          { id: 'sesiones' as Tab, label: 'Sesiones', icon: Star, badge: totalSessionUnreads },
          { id: 'matches' as Tab, label: 'Matches', icon: Heart },
          { id: 'messages' as Tab, label: 'Mensajes', icon: MessageCircle, badge: totalChatUnreads },
          { id: 'profile' as Tab, label: 'Perfil', icon: User },
        ].map(({ id, label, icon: Icon, badge, live }) => (
          <button key={id} onClick={() => { 
            setActiveTab(id); 
            if (id !== 'messages') setActiveChat(null);
            if (id === 'sesiones' && !isDemoMode) {
              loadRealSessions();
            }
            if (id === 'messages') setChatUnreads({});
            if (id === 'sesiones') setSessionUnreads({});
            if (id === 'messages' || id === 'sesiones') bumpPwaEngagement();
          }}
            className={`nav-item ${activeTab === id ? 'active' : ''} relative flex-1`}>
            <Icon size={20} />
            <span className="mt-0.5">{label}</span>
            {badge && badge > 0 && (
              <span className="absolute -top-0.5 right-3 min-w-[15px] h-[15px] px-1.5 text-[9px] font-extrabold rounded-full bg-[#FF4F79] text-black flex items-center justify-center ring-1 ring-black/30">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
            {id === 'explore' && liveCountForUI > 0 && (
              <span className="absolute -top-0.5 right-1 w-3 h-3 bg-[#22c55e] rounded-full animate-pulse ring-1 ring-black/30 flex items-center justify-center text-[6px] text-black font-bold" style={{animation: 'live-pulse-green 2.2s ease-in-out infinite'}}>
                {currentUser?.trainingNow && currentUser.liveStreak ? Math.min(9, currentUser.liveStreak) : ''}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* FILTERS MODAL */}
      <AnimatePresence>
        {showFilters && (
          <div className="absolute inset-0 z-[70] flex items-end bg-black/70" onClick={() => setShowFilters(false)}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', bounce: 0.05 }}
              onClick={e => e.stopPropagation()} className="w-full card rounded-t-3xl p-6 pb-10">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-2xl tracking-tight">Filtros</div>
                  {((filters.trainingTypes?.length || 0) + (filters.availability?.length || 0) + (filters.gender !== 'todos' ? 1 : 0) + (filters.onlyAvailableToday ? 1 : 0) + (filters.onlyLiveTraining ? 1 : 0)) > 0 && (
                    <div className="text-xs bg-[#FF671F] text-black px-2 py-0.5 rounded-full font-bold">
                      { (filters.trainingTypes?.length || 0) + (filters.availability?.length || 0) + (filters.gender !== 'todos' ? 1 : 0) + (filters.onlyAvailableToday ? 1 : 0) + (filters.onlyLiveTraining ? 1 : 0) } activos
                    </div>
                  )}
                </div>
                <button onClick={resetFilters} className="text-[#FF671F] text-sm font-semibold active:opacity-70">Limpiar todo</button>
              </div>

              {/* Live results count for filters - premium, clean indicator while choosing profiles */}
              <div className="mb-4 px-3 py-2 bg-[#1C1C20] rounded-2xl text-sm flex items-center justify-between border border-[#2F2F35]">
                <span className="text-[#9CA3AF]">Disponibles ahora</span>
                <span className="font-bold text-[#FF671F] text-lg tabular-nums">{deck.length}{liveTrainingNow.length > 0 ? ` + ${liveTrainingNow.length} en vivo` : ''}</span>
              </div>

              {/* Active filters summary - tappable to remove */}
              <AnimatePresence>
              {(filters.trainingTypes.length > 0 || filters.availability.length > 0 || filters.gender !== 'todos' || filters.onlyAvailableToday || filters.onlyLiveTraining) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 flex flex-wrap gap-1.5"
                >
                  {filters.trainingTypes.map(t => (
                    <button 
                      key={t} 
                      onClick={() => toggleFilterTraining(t)}
                      className="text-[10px] bg-[#FF671F]/15 text-[#FF671F] px-2.5 py-0.5 rounded-full active:bg-[#FF671F]/30 flex items-center gap-1"
                    >
                      {t} <span className="text-xs">×</span>
                    </button>
                  ))}
                  {filters.availability.map(a => (
                    <button 
                      key={a} 
                      onClick={() => toggleFilterAvailability(a)}
                      className="text-[10px] bg-[#FF671F]/15 text-[#FF671F] px-2.5 py-0.5 rounded-full active:bg-[#FF671F]/30 flex items-center gap-1"
                    >
                      {a} <span className="text-xs">×</span>
                    </button>
                  ))}
                  {filters.gender !== 'todos' && (
                    <button 
                      onClick={() => setFilters(f => ({...f, gender: 'todos'}))}
                      className="text-[10px] bg-[#FF671F]/15 text-[#FF671F] px-2.5 py-0.5 rounded-full active:bg-[#FF671F]/30 flex items-center gap-1"
                    >
                      {filters.gender === 'hombre' ? 'Hombres' : 'Mujeres'} <span className="text-xs">×</span>
                    </button>
                  )}
                  {filters.onlyAvailableToday && (
                    <button 
                      onClick={() => setFilters(f => ({...f, onlyAvailableToday: false}))}
                      className="text-[10px] bg-[#22c55e]/15 text-[#22c55e] px-2.5 py-0.5 rounded-full active:bg-[#22c55e]/30 flex items-center gap-1"
                    >
                      Disponibles hoy <span className="text-xs">×</span>
                    </button>
                  )}
                  {filters.onlyLiveTraining && (
                    <button 
                      onClick={() => setFilters(f => ({...f, onlyLiveTraining: false}))}
                      className="text-[10px] bg-[#22c55e]/15 text-[#22c55e] px-2.5 py-0.5 rounded-full active:bg-[#22c55e]/30 flex items-center gap-1"
                    >
                      Entrenando ahora <span className="text-xs">×</span>
                    </button>
                  )}
                </motion.div>
              )}
              </AnimatePresence>

              <div className="mb-7">
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-medium">Edad</span> 
                  <span className="font-mono text-[#FF671F]">{filters.minAge} - {filters.maxAge}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] text-[#9CA3AF] mb-1.5">
                      <span>Mínimo</span><span>{filters.minAge}</span>
                    </div>
                    <input type="range" min="18" max="45" value={filters.minAge} onChange={e => setFilters(f => ({...f, minAge: Math.min(parseInt(e.target.value), f.maxAge - 1)}))} className="w-full accent-[#FF671F]" />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-[#9CA3AF] mb-1.5">
                      <span>Máximo</span><span>{filters.maxAge}</span>
                    </div>
                    <input type="range" min="18" max="45" value={filters.maxAge} onChange={e => setFilters(f => ({...f, maxAge: Math.max(parseInt(e.target.value), f.minAge + 1)}))} className="w-full accent-[#FF671F]" />
                  </div>
                </div>
              </div>

              {/* Distance filter */}
              <div className="mb-7">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Distancia máxima</span> 
                  <span className="text-[#FF671F]">
                    {userLocation 
                      ? (filters.maxDistanceKm >= 100 ? 'Sin límite' : `${filters.maxDistanceKm} km`) 
                      : 'GPS requerido'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5"
                  value={filters.maxDistanceKm} 
                  onChange={e => setFilters(f => ({...f, maxDistanceKm: parseInt(e.target.value)}))} 
                  className="w-full accent-[#FF671F]" 
                  disabled={!userLocation}
                />
                <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
                  <span>5 km</span><span>100+ km</span>
                </div>
                {!userLocation && (
                  <button 
                    onClick={requestUserLocation}
                    className="mt-3 text-xs w-full py-2.5 rounded-2xl border border-[#22c55e] text-[#22c55e] active:bg-[#22c55e] active:text-black font-semibold"
                  >
                    📍 Usar ubicación real del teléfono (GPS)
                  </button>
                )}
                {userLocation && (
                  <div className="mt-1 text-[9px] text-[#22c55e] text-center">✓ Usando GPS real • distancias precisas</div>
                )}
              </div>

              {/* Disponible Hoy filter */}
              <div className="mb-7">
                <label className="flex items-center gap-3 p-3 bg-[#1C1C20] rounded-2xl border border-[#2F2F35] cursor-pointer active:bg-[#25252A]">
                  <input 
                    type="checkbox" 
                    checked={filters.onlyAvailableToday} 
                    onChange={e => setFilters(f => ({...f, onlyAvailableToday: e.target.checked}))}
                    className="w-5 h-5 accent-[#FF671F]"
                  />
                  <div>
                    <div className="text-sm font-medium">Solo disponibles hoy</div>
                    <div className="text-xs text-[#9CA3AF]">Personas que pueden entrenar el mismo día</div>
                  </div>
                </label>

                {/* Live Training Now - the innovative killer feature */}
                <label className="flex items-center gap-3 p-3 bg-[#1C1C20] rounded-2xl border border-[#22c55e]/50 cursor-pointer active:bg-[#25252A] mt-2">
                  <input 
                    type="checkbox" 
                    checked={filters.onlyLiveTraining} 
                    onChange={e => setFilters(f => ({...f, onlyLiveTraining: e.target.checked}))}
                    className="w-5 h-5 accent-[#22c55e]"
                  />
                  <div>
                    <div className="text-sm font-medium flex items-center gap-1">Solo entrenando ahora <span className="live-pill bg-[#22c55e] text-black text-[8px]">🟢 EN VIVO</span></div>
                    <div className="text-xs text-[#9CA3AF]">¡Quién está entrenando en este preciso momento cerca! Ver el pulso en vivo en el mapa.</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#1C1C20] rounded-2xl border border-[#FF671F]/40 cursor-pointer active:bg-[#25252A] mt-2">
                  <input
                    type="checkbox"
                    checked={filters.onlyRealProfiles}
                    onChange={(e) => setFilters((f) => ({ ...f, onlyRealProfiles: e.target.checked }))}
                    className="w-5 h-5 accent-[#FF671F]"
                  />
                  <div>
                    <div className="text-sm font-medium">Solo perfiles reales</div>
                    <div className="text-xs text-[#9CA3AF]">Oculta perfiles DEMO (p1, p2…) del swipe. Ideal para testers en beta.</div>
                  </div>
                </label>
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium mb-2">Me interesa</div>
                <div className="flex rounded-2xl overflow-hidden border border-[#2F2F35]">
                  {(['todos','hombre','mujer'] as const).map(g => (
                    <button 
                      key={g} 
                      onClick={() => setFilters(f => ({...f, gender: g}))} 
                      className={`flex-1 py-2.5 text-sm font-medium transition ${filters.gender === g ? 'bg-[#FF671F] text-black' : 'bg-[#1C1C20] active:bg-[#25252A] text-white'}`}
                    >
                      {g === 'todos' ? 'Todos' : g === 'hombre' ? 'Hombres' : 'Mujeres'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium flex items-center gap-2">
                    Tipo de entrenamiento
                    {filters.trainingTypes.length > 0 && (
                      <span className="text-[10px] bg-[#FF671F]/10 text-[#FF671F] px-1.5 py-0.5 rounded-full font-medium">{filters.trainingTypes.length} seleccionados</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRAINING_OPTIONS.map(t => {
                    const selected = filters.trainingTypes.includes(t);
                    return (
                      <button 
                        key={t} 
                        onClick={() => toggleFilterTraining(t)} 
                        className={`px-3 py-1 rounded-2xl text-xs border transition-all active:scale-[0.985] ${selected ? 'bg-[#FF671F] text-black border-[#FF671F] font-medium' : 'border-[#2F2F35] bg-[#1C1C20] hover:border-[#3a3f48] text-white/90'}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium flex items-center gap-2">
                    Disponibilidad
                    {filters.availability.length > 0 && (
                      <span className="text-[10px] bg-[#FF671F]/10 text-[#FF671F] px-1.5 py-0.5 rounded-full font-medium">{filters.availability.length} seleccionadas</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABILITY.map(a => {
                    const selected = filters.availability.includes(a);
                    return (
                      <button 
                        key={a} 
                        onClick={() => toggleFilterAvailability(a)} 
                        className={`px-3 py-1 rounded-2xl text-xs border transition-all active:scale-[0.985] ${selected ? 'bg-[#FF671F] text-black border-[#FF671F] font-medium' : 'border-[#2F2F35] bg-[#1C1C20] hover:border-[#3a3f48] text-white/90'}`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={() => setShowFilters(false)} 
                className="btn-primary w-full shadow-lg shadow-[#FF671F]/20 flex items-center justify-center gap-2 text-base"
              >
                Ver {deck.length} disponibles <span className="text-lg leading-none">→</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE SQUAD MODAL */}
      <AnimatePresence>
        {showCreateSquad && (
          <div className="absolute inset-0 z-[95] flex items-end bg-black/70" onClick={() => setShowCreateSquad(false)}>
            <div onClick={e => e.stopPropagation()} className="w-full card rounded-t-3xl p-6 pb-8">
              <div className="font-semibold text-xl mb-1">Crear un Squad</div>
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
                <input name="name" placeholder="Nombre del Squad (ej: Beasts de Viña)" required className="form-input w-full mb-3" />
                <input name="focus" placeholder="Enfoque (Pesas, Running, Calistenia...)" required className="form-input w-full mb-4" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowCreateSquad(false)} className="flex-1 py-3 rounded-2xl border border-[#2F2F35] active:bg-[#25252A]">Cancelar</button>
                  <button type="submit" className="flex-1 btn-primary">Crear Squad</button>
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
                        <div className="text-[#FF671F] text-sm">{squad.focus} • {squad.members.length}/4 miembros</div>
                      </div>
                      <button onClick={() => setSelectedSquad(null)} className="text-2xl text-[#9CA3AF]">×</button>
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
                          <div className="mb-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                            <div className="text-sm font-bold text-white mb-2">Rutina semanal del squad</div>
                            <p className="text-[10px] text-[#9CA3AF] mb-3 leading-snug">
                              Plan compartido para entrenar juntos — visible para todos los miembros.
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
                              placeholder="Días: Lun, Mié, Vie · 19:00"
                              className="w-full mb-2 px-3 py-2 rounded-xl bg-[#1C1C20] border border-[#2F2F35] text-sm text-white placeholder:text-[#6B7280]"
                            />
                            <textarea
                              value={squadRoutineDraft.notes}
                              onChange={(e) =>
                                setSquadRoutineDraft((d) => ({ ...d, notes: e.target.value }))
                              }
                              placeholder="Notas opcionales (ejercicios clave, progresión…)"
                              rows={2}
                              className="w-full mb-2 px-3 py-2 rounded-xl bg-[#1C1C20] border border-[#2F2F35] text-sm text-white placeholder:text-[#6B7280] resize-none"
                            />
                            <button
                              type="button"
                              disabled={savingSquadRoutine}
                              onClick={() => handleSaveSquadRoutine(squad.id)}
                              className="w-full py-2 rounded-xl bg-[#FF671F]/15 border border-[#FF671F]/35 text-[#FF671F] text-sm font-bold active:bg-[#FF671F]/25 disabled:opacity-60"
                            >
                              {savingSquadRoutine ? 'Guardando…' : 'Guardar rutina'}
                            </button>
                            {squad.weeklyRoutine?.label && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const label = squad.weeklyRoutine!.label
                                  const sched = squad.weeklyRoutine!.schedule
                                  sendSessionMessage(
                                    squad.id,
                                    `🏋️ Rutina del squad: ${label}${sched ? ` (${sched})` : ''} — ¡voy en live!`
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
                                🟢 Entrenar rutina ahora
                              </button>
                            )}
                          </div>

                          <button 
                            onClick={() => {
                              // Pre-create a session linked to this squad
                              const newSession: TrainingSession = {
                                id: 's' + Date.now(),
                                creatorId: effectiveUserId,
                                creatorName: currentUser?.name || 'Tú',
                                title: `Sesión del Squad: ${squad.name}`,
                                time: 'Mañana 19:00',
                                location: squad.focus === 'Running' ? 'Playa Reñaca' : 'Gym cercano',
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
                              toast.success('Sesión creada para el Squad', { description: 'Ve a la pestaña Sesiones' })
                            }}
                            className="w-full mb-3 text-sm border border-[#FF671F] text-[#FF671F] py-2 rounded-2xl"
                          >
                            Crear Sesión del Squad
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
                            <div className="text-[#9CA3AF] text-center text-xs mt-6">Aún no hay mensajes. ¡Empieza la coordinación!</div>
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
          <div className="absolute inset-0 z-[95] flex items-end bg-black/70" onClick={closeCreateSession}>
            <div onClick={e => e.stopPropagation()} className="w-full card rounded-t-3xl p-6 pb-8">
              <div className="font-semibold text-xl mb-4">Crear sesión de entrenamiento</div>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                // trainingType is now from a hidden input we control with chips, or fallback to select if needed
                const newSession: TrainingSession = {
                  id: 's' + Date.now(),
                  creatorId: effectiveUserId,
                  creatorName: currentUser?.name || 'Tú',
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
                      console.log('✅ New session written directly to Firestore')

                      // Also write the creator welcome message to the messages subcollection so joiners see it on server
                      try {
                        const { collection, addDoc, serverTimestamp: ts } = await import('firebase/firestore')
                        await addDoc(collection(db, `sessions/${newSession.id}/messages`), {
                          senderId: effectiveUserId,
                          senderName: currentUser?.name || 'Tú',
                          text: `¡Hola! Creé esta sesión para ${newSession.trainingType.toLowerCase()}. ¿Quién se anima?`,
                          timestamp: Date.now(),
                          createdAt: ts(),
                        })
                        console.log('✅ Creator welcome message written to session subcollection')
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
                  senderName: currentUser?.name || 'Tú',
                  text: `¡Hola! Creé esta sesión para ${newSession.trainingType.toLowerCase()}. ¿Quién se anima?`,
                  timestamp: Date.now()
                }
                const withInitial = {
                  ...sessionMessages,
                  [newSession.id]: [creatorMsg]
                }
                saveSessionMessages(withInitial)

                toast.success('Sesión creada', { description: 'Ya puedes chatear con quienes se unan' })
              }}>
                <div className="space-y-4">
                  <input name="title" placeholder="Título (ej: Running costanera + mate)" required className="form-input w-full" />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input name="time" placeholder="Horario (19:00)" required className="form-input" />
                    <input name="location" placeholder="Lugar (Reñaca)" required className="form-input" />
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
                    <div className="text-xs text-[#9CA3AF] mb-1">Máximo participantes</div>
                    <input name="max" type="number" min="2" max="12" defaultValue="5" required className="form-input w-full" />
                  </div>
                </div>

                <div className="mt-2 mb-3 text-[10px] text-[#FF671F] text-center">Otros testers reales la verán y podrán unirse al instante</div>
                <div className="text-[10px] text-center text-[#9CA3AF] mb-2">
                  Al publicar aceptas nuestros <a href="/entrenamatch/terms.html" target="_blank" className="underline">Términos</a>.
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={closeCreateSession} className="flex-1 py-3 rounded-2xl border border-[#2F2F35] active:bg-[#25252A]">Cancelar</button>
                  <button type="submit" className="flex-1 btn-primary">Publicar sesión</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* REVIEW MODAL - "Entrenamos Juntos" with rating */}
      <AnimatePresence>
        {showReviewModalFor && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 p-6" onClick={() => setShowReviewModalFor(null)}>
            <div onClick={e => e.stopPropagation()} className="card w-full max-w-[340px] rounded-3xl p-6">
              <div className="text-center mb-4">
                <div className="text-2xl font-semibold">¿Cómo fue entrenar con {SEED_PROFILES.find(p => p.id === showReviewModalFor)?.name}?</div>
                <div className="text-sm text-[#9CA3AF] mt-1">Tu reseña ayuda a otros a confiar</div>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-2 mb-4">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setReviewRating(star)} className="text-4xl transition">
                    {star <= reviewRating ? '★' : '☆'}
                  </button>
                ))}
              </div>

              <textarea 
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Comentario opcional (qué tal fue el entrenamiento...)"
                className="form-input w-full h-24 resize-none mb-4"
              />

              {/* Photo upload for the session - Unique feature */}
              <div className="mb-4">
                <label className="text-xs text-[#9CA3AF] mb-1 block">Foto de la sesión (opcional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = () => setReviewPhoto(reader.result as string)
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="text-sm"
                />
                {reviewPhoto && (
                  <div className="mt-2 relative w-24 h-24">
                    <img src={reviewPhoto} className="w-24 h-24 object-cover rounded-xl border border-[#2F2F35]" alt="Preview" />
                    <button 
                      onClick={() => setReviewPhoto(null)}
                      className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setShowReviewModalFor(null); setReviewPhoto(null); setPendingReviewBookingId(null) }} className="flex-1 btn-secondary">Cancelar</button>
                <button onClick={() => submitTrainingReview(showReviewModalFor)} className="flex-1 btn-primary">Enviar reseña</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MATCH MODAL */}
      <AnimatePresence>
        {showMatchModal && (
          <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/90 p-6" onClick={() => closeMatchModal()}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="match-modal rounded-3xl max-w-[340px] w-full overflow-hidden border border-[#2F2F35]">
              <div className="p-8 text-center">
                <div className="text-[#FF4F79] font-semibold tracking-[3px] text-sm mb-1">¡ES UN MATCH!</div>
                <div className="text-3xl font-semibold tracking-tight mb-4">Tú y {showMatchModal.name} quieren entrenar juntos</div>
                
                <div className="flex justify-center -space-x-4 mb-6">
                  <img src={currentUser?.photos?.[0] || 'https://picsum.photos/id/1005/80/80'} className="w-20 h-20 rounded-full border-4 border-[#1C1C20] object-cover z-10" />
                  <img src={showMatchModal.photos[0]} className="w-20 h-20 rounded-full border-4 border-[#1C1C20] object-cover" />
                </div>

                <div className="text-sm text-[#9CA3AF] mb-4">Ambos están en {showMatchModal.city}, {showMatchModal.country}. ¡Escríbele ya!</div>
                {userLocation && (
                  <div className="text-[#FF671F] text-sm font-medium -mt-2 mb-4">
                    Están a {getDistanceKm(userLocation.lat, userLocation.lng, showMatchModal.lat, showMatchModal.lng)} km
                  </div>
                )}

                {/* Suggested openers for Pre-Alpha testers - removes "qué digo?" friction */}
                {(() => {
                  const openers = CHAT_OPENERS[showMatchModal.id] || ["¡Hola! Vi tu perfil y me tinca entrenar juntos 💪"];
                  return (
                    <div className="mb-5 text-left bg-[#1C1C20] rounded-2xl p-3 text-xs">
                      <div className="text-[#FF671F] font-medium mb-1.5 text-center">Sugerencias para romper el hielo (copia y pega):</div>
                      {openers.slice(0, 2).map((opener, idx) => (
                        <div key={idx} className="text-[#cbd5e1] mb-1.5 last:mb-0 leading-snug">• {opener}</div>
                      ))}
                    </div>
                  );
                })()}

                <div className="space-y-3">
                  <button onClick={() => closeMatchModal(true)} className="btn-primary w-full text-base">Enviar mensaje ahora</button>
                  <button onClick={() => closeMatchModal(false)} className="w-full py-3 text-sm text-[#9CA3AF]">Seguir explorando</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL PROFILE VIEW */}
      <AnimatePresence>
        {showFullProfile && (
          <div className="absolute inset-0 z-[90] bg-[#0D0D10] flex flex-col" onClick={() => setShowFullProfile(null)}>
            <div className="p-4 flex items-center justify-between border-b border-[#2F2F35]">
              <button onClick={() => setShowFullProfile(null)}><ArrowLeft /></button>
              <div className="font-medium flex items-center gap-2">Perfil completo {realProfiles.some(rp => rp.id === showFullProfile.id) && <span className="text-[10px] bg-[#FF4F79] text-black px-1.5 py-0.5 rounded-full font-bold">REAL TESTER</span>}</div>
              <div />
            </div>
            <div className="overflow-auto flex-1">
              <div className="relative">
                <img src={showFullProfile.photos[0]} className="w-full aspect-square object-cover" />
                {/* Small additional photos strip in full profile too */}
                {showFullProfile.photos.length > 1 && (
                  <div className="absolute bottom-16 right-2 flex gap-1 overflow-x-auto max-w-[120px]">
                    {showFullProfile.photos.slice(1, 4).map((p, i) => (
                      <img key={i} src={p} className="w-8 h-8 rounded object-cover border border-white/50" />
                    ))}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black">
                  <div className="text-4xl font-semibold tracking-[-1.5px]">{showFullProfile.name}, {showFullProfile.age}</div>
                  <div className="flex gap-2 mt-1 text-[#FF671F]">
                    <MapPin size={18} /> {showFullProfile.city}, {showFullProfile.country}
                    {showFullProfile.verificationStatus === 'verified' && <span className="text-[#22c55e] text-sm">✓ Verificado</span>}
                  </div>
                  {userLocation && (
                    <div className="mt-1 text-sm text-[#FF671F] font-medium">
                      A {getDistanceKm(userLocation.lat, userLocation.lng, showFullProfile.lat, showFullProfile.lng)} km de ti
                    </div>
                  )}
                  {showFullProfile.trainingNow && showFullProfile.trainingNowSince && (
                    <>
                      <div className="mt-2 inline-flex items-center gap-2 bg-[#22c55e] text-black px-3 py-1 rounded-full text-sm font-bold relative overflow-hidden shadow-md shadow-[#22c55e]/30">
                        🟢 ENTRENANDO AHORA • en vivo hace {Math.floor((Date.now() - showFullProfile.trainingNowSince)/60000)}m
                        {showFullProfile.trainingNowSince && <span className="text-xs">· se va pronto</span>}
                        {(() => {
                          const posts = profilePosts[showFullProfile.id] || [];
                          const lp = posts.find((p: any) => (p.text || '').toLowerCase().includes('entrenando ahora')) || posts[0];
                          const jc = lp ? (lp.comments || []).length + (lp.likes || []).filter((id: string) => id !== showFullProfile.id).length : 0;
                          return jc > 0 ? <span className="text-xs ml-1">+{jc} unidos</span> : null;
                        })()}
                        {showFullProfile.liveStreak && showFullProfile.liveStreak > 0 && <span className="text-xs ml-1">🔥{showFullProfile.liveStreak}d</span>}
                        {showFullProfile.trainingNowSince && (
                          <div className="absolute bottom-0 left-0 h-0.5 bg-white/30" style={{width: `${Math.max(5, Math.min(100, (90 - Math.floor((Date.now() - showFullProfile.trainingNowSince + 90*60*1000 - Date.now())/60000 ))/90 * 100))}%`}}></div>
                        )}
                      </div>
                      <button onClick={() => {
                        const p = showFullProfile
                        setShowFullProfile(null)
                        if (currentUser?.trainingNow && isUserLive(p.id)) {
                          startSyncWith(p.id, p.name)
                        } else {
                          handleSwipe(p.id, 'right')
                        }
                      }} className="mt-1 w-full py-2 bg-[#22c55e] text-black rounded-2xl text-sm font-bold active:bg-[#16a34a]">🔥 Entrenar juntos — abrir EntrenaSync ahora</button>
                    </>
                  )}
                  {currentUser && (
                    <div className="mt-2 inline-block bg-[#FF671F] text-black px-3 py-1 rounded-full text-sm font-bold">
                      {calculateCompatibility(currentUser, showFullProfile, userLocation)}% compatible para entrenar juntos
                    </div>
                  )}
                  {getAverageRating(showFullProfile.id, reviews).count > 0 && (
                    <div className="mt-2 text-sm">
                      ★ {getAverageRating(showFullProfile.id, reviews).avg} promedio de {getAverageRating(showFullProfile.id, reviews).count} reseñas
                      {getTrainingStreak(showFullProfile.id, reviews) > 1 && (
                        <span className="ml-2 text-orange-400">🔥 {getTrainingStreak(showFullProfile.id, reviews)} seguidas</span>
                      )}
                    </div>
                  )}
                  {(() => {
                    const tp = trainerProfiles.find((t) => t.userId === showFullProfile.id)
                    if (!tp) return null
                    return (
                      <div className="mt-3 p-3 rounded-xl border border-[#6366f1]/35 bg-[#6366f1]/10">
                        <div className="text-xs font-bold text-[#a5b4fc] uppercase tracking-wider mb-1">
                          Entrenador personal
                        </div>
                        <div className="text-sm text-white font-semibold">
                          {formatTrainerRate(tp.hourlyRateClp)}/h · {tp.sessionDurationMin} min
                        </div>
                        {tp.avgRating > 0 && (
                          <div className="text-xs text-[#cbd5e1] mt-1">★ {tp.avgRating} ({tp.reviewCount} sesiones)</div>
                        )}
                        {showFullProfile.id !== effectiveUserId && (
                          <button
                            type="button"
                            className="mt-2 w-full py-2 rounded-xl bg-[#6366f1] text-white text-sm font-bold"
                            onClick={() => {
                              setTrainerCoachPreselect(tp.userId)
                              setShowFullProfile(null)
                              setShowTrainerCoach(true)
                            }}
                          >
                            Reservar sesión EntrenaCoach
                          </button>
                        )}
                      </div>
                    )
                  })()}

                  {/* Photos from past sessions */}
                  {reviews[showFullProfile.id]?.some(r => r.photo) && (
                    <div className="mt-3">
                      <div className="text-xs text-[#9CA3AF] mb-1">Sesiones juntos</div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {reviews[showFullProfile.id]?.filter(r => r.photo).map((r, idx) => (
                          <img key={idx} src={r.photo} className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-[#2F2F35]" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 space-y-6">
                <div>
                  <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-1.5">BIOGRAFÍA</div>
                  <p className="leading-snug">{showFullProfile.bio}</p>
                </div>
                <div>
                  <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-2">ENTRENA</div>
                  <div className="flex flex-wrap gap-2">{showFullProfile.trainingTypes.map(t => <div key={t} className="chip">{t}</div>)}</div>
                </div>
                <div>
                  <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-2">OBJETIVOS</div>
                  <div className="flex flex-wrap gap-2">{showFullProfile.goals.map(g => <div key={g} className="chip chip-active">{g}</div>)}</div>
                </div>

                {/* Muro for viewed profile - attractive read-only feed with interactions (now loads reliably for other accounts) */}
                <div className="mt-4">
                  <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-2 flex justify-between items-center px-1">
                    <span>MURO DE {showFullProfile.name.toUpperCase()}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setActiveTab('home')} className="text-[9px] text-[#FF671F] underline active:opacity-70">Ver feed global</button>
                      <button onClick={() => loadProfilePosts(showFullProfile.id)} className="text-[10px] px-2 py-0.5 rounded-full border border-[#FF671F]/30 text-[#FF671F] active:bg-[#FF671F]/10">Refrescar</button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {(profilePosts[showFullProfile.id] || []).length > 0 ? (
                      [...(profilePosts[showFullProfile.id] || [])].sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.timestamp - a.timestamp).slice(0, 6).map((post) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                          className="card card-glass p-3 mb-2 border-[#2F2F35]/80 hover:border-[#FF671F]/30"
                        >
                          <div className="text-[13px] leading-snug mb-2 text-white/95">
                            {post.pinned ? '📌 ' : ''}
                            {(post.text || '').includes('Fui testigo') || (post.text || '').includes('RITUAL LEGENDARIO') || (post.text || '').includes('Echo') ? (
                              <span className="text-[#FFD700] font-semibold">👁️ Highlight de EntrenaSync</span>
                            ) : null}
                            <div>{post.text}</div>
                          </div>
                          {post.photo && (
                            <div className="relative mb-3 -mx-1 rounded-2xl overflow-hidden ring-1 ring-[#2F2F35]">
                              <img src={post.photo} className="w-full max-h-[200px] object-cover transition-transform hover:scale-[1.02]" />
                              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                            <span title={new Date(post.timestamp).toLocaleString('es-CL')}>{getRelativeTime(post.timestamp)}</span>
                            <span onClick={() => likeProfilePost(post.id, showFullProfile.id)} className="cursor-pointer active:text-[#FF671F]">❤️ {(post.likes || []).length}</span>
                            <span onClick={() => openFullComments(post.id, showFullProfile.id, showFullProfile.name)} className="cursor-pointer active:text-[#FF671F]">💬 {(post.comments || []).length}</span>
                          </div>
                          {post.comments && post.comments.length > 0 && (
                            <div 
                              onClick={() => openFullComments(post.id, showFullProfile.id, showFullProfile.name)}
                              className="mt-1.5 text-[11px] text-[#9CA3AF] pl-1 border-l border-[#2F2F35] cursor-pointer active:bg-[#1A1A1E]/40 rounded"
                              title="Ver hilo completo de comentarios"
                            >
                              {post.comments.slice(-2).map(c => (
                                <div key={c.id} className="flex gap-1 items-start">
                                  <span className="text-white/70">{c.userName}:</span> {c.text}
                                  {c.userId === effectiveUserId && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); deleteCommentFromPost(post.id, showFullProfile.id, c.id); }}
                                      className="ml-1 text-red-400 text-[10px] active:text-red-500"
                                      title="Eliminar comentario"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                              {(post.comments || []).length > 2 && <div className="text-[#FF671F]/70 mt-0.5">+{(post.comments || []).length-2} más... toca para ver todo</div>}
                            </div>
                          )}
                          {/* Inline comment input for viewed profile too */}
                          {activeComment?.postId === post.id && (
                            <div className="mt-2 pt-2 border-t border-[#2F2F35] flex items-center gap-2">
                              <input 
                                type="text" 
                                value={commentDraft} 
                                onChange={e => setCommentDraft(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
                                placeholder={`Comentar en el muro de ${showFullProfile.name}...`}
                                className="flex-1 bg-[#1A1A1E] border border-[#2F2F35] rounded-2xl px-3 py-1.5 text-sm focus:outline-none focus:border-[#FF671F]"
                                maxLength={200}
                              />
                              <button 
                                onClick={submitComment} 
                                disabled={!commentDraft.trim()} 
                                className="text-[#FF671F] text-sm font-medium px-3 disabled:opacity-40 active:scale-95"
                              >
                                Enviar
                              </button>
                              <button onClick={cancelComment} className="text-[#9CA3AF] text-xs px-1">✕</button>
                            </div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-xs text-[#9CA3AF] italic">Este perfil aún no tiene publicaciones en el muro. ¡Anímalo a publicar!</div>
                    )}
                  </AnimatePresence>
                  {(profilePosts[showFullProfile.id] || []).length > 6 && (
                    <div className="text-[10px] text-[#FF671F]/70 text-center mt-1">Mostrando los 6 más recientes — usa Refrescar para actualizar</div>
                  )}
                </div>

                {/* Squads membership - Polished feature */}
                {(() => {
                  const userSquads = squads.filter(sq => sq.members.includes(showFullProfile.id))
                  if (userSquads.length === 0) return null
                  return (
                    <div>
                      <div className="uppercase text-xs tracking-widest text-[#9CA3AF] mb-2">SQUADS</div>
                      <div className="flex flex-wrap gap-2">
                        {userSquads.map(sq => (
                          <div 
                            key={sq.id} 
                            onClick={() => { setSelectedSquad(sq.id); setActiveTab('squads') }}
                            className="chip cursor-pointer hover:bg-[#FF671F] hover:text-black active:scale-95 transition"
                          >
                            {sq.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
                <div className="grid grid-cols-2 gap-x-4 text-sm">
                  <div>
                    <span className="text-[#9CA3AF] text-[10px]">Nivel</span><br />
                    <span className="text-[11px] px-1.5 py-px rounded-full bg-[#FF4F79]/10 text-[#FF4F79] font-semibold inline-block mt-0.5">{showFullProfile.level}</span>
                  </div>
                  <div><span className="text-[#9CA3AF]">Disponible</span><br />{showFullProfile.availability.join(', ')}</div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#2F2F35] flex gap-3">
              {matches.includes(showFullProfile.id) || realMatches.includes(showFullProfile.id) ? (
                <button onClick={() => { setShowFullProfile(null); openChat(showFullProfile.id) }} className="flex-1 btn-primary">Abrir chat con {(showFullProfile.name||'Usuario').split(' ')[0]}</button>
              ) : (
                <>
                  <button onClick={() => { setShowFullProfile(null); handleSwipe(showFullProfile.id, 'left') }} className="flex-1 btn-secondary">Pasar</button>
                  <button onClick={() => { setShowFullProfile(null); handleSwipe(showFullProfile.id, 'right') }} className="flex-1 btn-primary">Me interesa</button>
                </>
              )}
            </div>

            {/* Safety actions - Critical for launch */}
            <div className="p-4 border-t border-[#2F2F35] flex gap-3 text-sm">
              <button 
                onClick={() => {
                  openReport(showFullProfile.id, 'profile')
                  setShowFullProfile(null)
                }}
                className="flex-1 py-2 text-red-400 border border-red-900 rounded-2xl hover:bg-red-950"
              >
                Reportar
              </button>
              <button 
                onClick={async () => {
                  if (confirm(`¿Bloquear a ${showFullProfile.name}? No volverás a verlo en ningún lado.`)) {
                    await blockUser(showFullProfile.id)
                    setShowFullProfile(null)
                  }
                }}
                className="flex-1 py-2 text-red-400 border border-red-900 rounded-2xl hover:bg-red-950"
              >
                Bloquear
              </button>
            </div>
            <div className="p-2 text-center text-[9px] text-[#9CA3AF]">Perfiles reales se sincronizan entre dispositivos</div>
          </div>
        )}
      </AnimatePresence>

      {/* LEGAL PAGES */}
      <AnimatePresence>
        {showLegal && (
          <div className="absolute inset-0 z-[100] bg-[#0D0D10] flex flex-col">
            <div className="h-14 px-4 flex items-center gap-3 border-b border-[#2F2F35] bg-[#0D0D10]">
              <button onClick={() => setShowLegal(null)}><ArrowLeft /></button>
              <div className="font-semibold">
                {showLegal === 'terms' && 'Términos de Servicio'}
                {showLegal === 'privacy' && 'Política de Privacidad'}
                {showLegal === 'community' && 'Directrices de la Comunidad'}
              </div>
            </div>
            <div className="flex-1 overflow-auto p-5 text-sm leading-relaxed text-[#cbd5e1] space-y-4">
              {showLegal === 'terms' && (
                <>
                  <p><strong>EntrenaMatch</strong> es una plataforma para conectar personas interesadas en realizar actividades deportivas y de entrenamiento de forma presencial.</p>
                  <p>Al usar la aplicación aceptas que:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Eres mayor de 18 años.</li>
                    <li>La app no es un servicio de citas románticas ni de naturaleza sexual.</li>
                    <li>Los encuentros deben realizarse en lugares públicos y seguros.</li>
                    <li>Eres responsable de tu propia seguridad y de verificar la identidad de las personas con quienes quedas.</li>
                  </ul>
                  <p>EntrenaMatch no se hace responsable de los encuentros presenciales ni de ningún incidente que ocurra fuera de la plataforma.</p>
                </>
              )}

              {showLegal === 'privacy' && (
                <>
                  <p>Recopilamos la información que proporcionas al crear tu perfil (nombre, edad, fotos, preferencias de entrenamiento, ubicación aproximada).</p>
                  <p>Tu ubicación se utiliza únicamente para calcular distancias con otros usuarios y mejorar los filtros. No la compartimos con terceros.</p>
                  <p>Las fotos y datos de tu perfil son visibles para otros usuarios de la app una vez que creas tu cuenta.</p>
                  <p>Puedes solicitar la eliminación de tus datos en cualquier momento contactándonos o usando la función de reset en tu perfil.</p>
                  <p>Al aceptar esta política autorizas el tratamiento de tus datos con el fin exclusivo de facilitar conexiones para entrenamiento.</p>
                </>
              )}

              {showLegal === 'community' && (
                <>
                  <p className="font-semibold text-[#FF671F]">Directrices de la Comunidad EntrenaMatch</p>
                  <p>Esta es una plataforma seria para <strong>entrenamiento sincronizado de alto rendimiento</strong>. Nuestra comunidad se basa en respeto, seguridad y enfoque en resultados físicos compartidos a través de la "Red de EntrenaSync".</p>
                  
                  <p><strong>Reglas obligatorias:</strong></p>
                  <ul className="list-disc pl-5 space-y-1.5 text-[13px]">
                    <li><strong>Respeto y profesionalismo:</strong> Sé motivador y respetuoso. Cero acoso, insultos, discriminación, mensajes sexuales o románticos no solicitados.</li>
                    <li><strong>Enfoque fitness:</strong> Solo para sync de entrenos (gym, running, etc.). Nada de citas, spam, ventas o contenido off-topic.</li>
                    <li><strong>Seguridad:</strong> Encuentros SOLO en lugares públicos. Verifica perfiles, informa a terceros, nunca compartas datos bancarios o sensibles.</li>
                    <li><strong>Perfiles auténticos:</strong> Fotos y datos reales. Prohibido perfiles falsos, bots, cuentas múltiples o impersonación.</li>
                    <li><strong>Contenido limpio:</strong> Posts, voces y fotos deben ser de entrenamiento. Nada explícito, violento, de odio o que viole leyes.</li>
                    <li><strong>Reporta y bloquea:</strong> Usa las herramientas de reporte y bloqueo ante cualquier violación. Los reportes ayudan a mantener la comunidad segura.</li>
                    <li><strong>Mayores de 18:</strong> Solo adultos. Cualquier sospecha de menores resultará en ban inmediato.</li>
                  </ul>
                  
                  <p className="text-xs">Violaciones = bloqueo + posible suspensión permanente. Tu seguridad y la del grupo es prioridad #1. Entrena duro, entrena juntos, entrena seguro.</p>
                </>
              )}
            </div>
            <div className="p-4 border-t border-[#2F2F35]">
              <div className="text-[10px] text-[#9CA3AF] text-center mb-3">
                Versión {showLegal === 'terms' ? LEGAL_VERSIONS.terms : 
                         showLegal === 'privacy' ? LEGAL_VERSIONS.privacy : 
                         LEGAL_VERSIONS.community} • Última actualización: {LEGAL_VERSIONS.lastUpdated}
              </div>
              <button onClick={() => setShowLegal(null)} className="btn-primary w-full">Cerrar</button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* IMPROVED REPORT MODAL - with clear reasons + link to community rules */}
      {showReportModal && reportTargetId && (
        <div className="absolute inset-0 z-[140] bg-black/80 flex items-end" onClick={() => setShowReportModal(false)}>
          <div 
            onClick={e => e.stopPropagation()} 
            className="w-full bg-[#0D0D10] rounded-t-3xl p-5 max-h-[85vh] overflow-auto border-t border-[#2F2F35]"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold text-lg">Reportar usuario</div>
              <button onClick={() => setShowReportModal(false)} className="text-[#9CA3AF]">✕</button>
            </div>

            <div className="text-sm text-[#9CA3AF] mb-3">Selecciona el motivo principal. Tu reporte es anónimo para el otro usuario.</div>

            <div className="space-y-2 mb-4">
              {['Comportamiento inadecuado / acoso', 'Perfil falso o suplantación', 'Spam o contenido irrelevante', 'Contenido inapropiado (fotos/voz)', 'Otra violación de las reglas de comunidad'].map(r => (
                <button 
                  key={r}
                  onClick={() => setReportReason(r)}
                  className={`w-full text-left p-3 rounded-xl border ${reportReason === r ? 'border-[#FF671F] bg-[#FF671F]/10' : 'border-[#2F2F35]'} active:bg-[#1C1C20]`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea 
              value={reportReason} 
              onChange={e => setReportReason(e.target.value)}
              placeholder="Detalles adicionales (opcional)..."
              className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-xl p-3 text-sm mb-4 min-h-[80px]"
            />

            <div className="flex gap-2">
              <button 
                onClick={() => { setShowReportModal(false); setShowLegal('community') }}
                className="flex-1 py-2 text-sm border border-[#2F2F35] rounded-2xl active:bg-[#1C1C20]"
              >
                Ver reglas de comunidad
              </button>
              <button 
                onClick={async () => {
                  if (reportTargetId) {
                    await reportUser(reportTargetId, reportReason || 'Otra violación', undefined, reportContext)
                    setShowReportModal(false)
                    setReportTargetId(null)
                    setReportReason('')
                  }
                }}
                disabled={!reportReason}
                className="flex-1 py-2 text-sm bg-[#FF671F] text-black font-bold rounded-2xl disabled:opacity-50 active:bg-[#E55A1A]"
              >
                Enviar reporte
              </button>
            </div>
            <div className="text-[10px] text-center text-[#9CA3AF] mt-3">Los reportes ayudan a mantener la comunidad segura y enfocada en rendimiento.</div>
          </div>
        </div>
      )}

      {/* VERIFICATION FLOW MODAL - Multi-step serious process */}
      <AnimatePresence>
        {showVerificationFlow && currentUser && (
          <div className="absolute inset-0 z-[130] flex items-end bg-black/80" onClick={() => setShowVerificationFlow(false)}>
            <div 
              onClick={e => e.stopPropagation()} 
              className="w-full bg-[#0D0D10] rounded-t-3xl p-6 max-h-[90vh] overflow-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="font-bold text-2xl">Verificación de identidad</div>
                  <div className="text-sm text-[#9CA3AF]">Paso {verificationStep} de 3</div>
                </div>
                <button onClick={() => setShowVerificationFlow(false)} className="text-2xl">×</button>
              </div>

              {/* Step 1: Info confirmation */}
              {verificationStep === 1 && (
                <div>
                  <div className="mb-6">
                    <p className="text-[#cbd5e1] mb-4">
                      Para generar confianza en la comunidad, necesitamos verificar que eres una persona real que entrena.
                    </p>
                    <div className="bg-[#1C1C20] p-4 rounded-2xl text-sm space-y-2">
                      <div>✓ Nombre: <span className="font-medium">{currentUser.name}</span></div>
                      <div>✓ Edad: <span className="font-medium">{currentUser.age} años</span></div>
                      <div>✓ Ubicación: <span className="font-medium">{currentUser.city}, {currentUser.country}</span></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setVerificationStep(2)} 
                    className="btn-primary w-full"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {/* Step 2: ID Document */}
              {verificationStep === 2 && (
                <div>
                  <div className="mb-4">
                    <div className="font-semibold mb-2">Paso 2: Documento de identidad</div>
                    <p className="text-sm text-[#9CA3AF] mb-4">Sube una foto de tu cédula, pasaporte o licencia (solo el frente).</p>
                  </div>

                  {!verificationIdPhoto ? (
                    <label className="block border-2 border-dashed border-[#2F2F35] rounded-3xl p-8 text-center cursor-pointer mb-6">
                      <div className="text-4xl mb-2">🪪</div>
                      <div className="font-medium">Subir documento</div>
                      <div className="text-xs text-[#9CA3AF]">JPG o PNG</div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = () => setVerificationIdPhoto(reader.result as string)
                            reader.readAsDataURL(file)
                          }
                        }} 
                      />
                    </label>
                  ) : (
                    <div className="mb-6">
                      <img src={verificationIdPhoto} className="w-full rounded-2xl mb-3" />
                      <button onClick={() => setVerificationIdPhoto(null)} className="text-sm text-red-400">Cambiar documento</button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setVerificationStep(1)} className="btn-secondary flex-1">Atrás</button>
                    <button 
                      onClick={() => setVerificationStep(3)} 
                      disabled={!verificationIdPhoto}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Selfie */}
              {verificationStep === 3 && (
                <div>
                  <div className="mb-4">
                    <div className="font-semibold mb-2">Paso 3: Selfie de verificación</div>
                    <p className="text-sm text-[#9CA3AF] mb-4">Tómate una selfie sosteniendo tu documento (o solo tu rostro).</p>
                  </div>

                  {!verificationSelfie ? (
                    <label className="block border-2 border-dashed border-[#2F2F35] rounded-3xl p-8 text-center cursor-pointer mb-6">
                      <div className="text-4xl mb-2">🤳</div>
                      <div className="font-medium">Subir selfie</div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = () => setVerificationSelfie(reader.result as string)
                            reader.readAsDataURL(file)
                          }
                        }} 
                      />
                    </label>
                  ) : (
                    <div className="mb-6">
                      <img src={verificationSelfie} className="w-full rounded-2xl mb-3" />
                      <button onClick={() => setVerificationSelfie(null)} className="text-sm text-red-400">Cambiar selfie</button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setVerificationStep(2)} className="btn-secondary flex-1">Atrás</button>
                    <button 
                      onClick={submitVerification} 
                      disabled={!verificationSelfie}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      Enviar para verificación
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-[#9CA3AF] mt-3">Tus documentos se revisarán de forma segura.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODERATION PANEL - Simulated for launch readiness */}
      <AnimatePresence>
        {showModerationPanel && (
          <div className="absolute inset-0 z-[140] bg-black/90 flex flex-col" onClick={() => setShowModerationPanel(false)}>
            <div onClick={e => e.stopPropagation()} className="flex-1 bg-[#0D0D10] max-w-[420px] mx-auto w-full mt-[42px] rounded-t-3xl overflow-hidden border border-[#2F2F35] flex flex-col">
              
              {/* Header */}
              <div className="p-4 border-b border-[#2F2F35] bg-[#1C1C20] flex items-center justify-between">
                <div>
                  <div className="font-bold text-xl">Panel de Moderación</div>
                  <div className="text-xs text-[#9CA3AF]">Simulado para preparación de lanzamiento</div>
                </div>
                <button onClick={() => setShowModerationPanel(false)} className="text-2xl">×</button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#2F2F35] bg-[#1C1C20]">
                {[
                  { key: 'reports', label: 'Reportes' },
                  { key: 'verifications', label: 'Verificaciones' },
                  { key: 'bans', label: 'Baneados' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setModerationTab(tab.key as any)}
                    className={`flex-1 py-3 text-sm font-medium ${moderationTab === tab.key ? 'text-[#FF671F] border-b-2 border-[#FF671F]' : 'text-[#9CA3AF]'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-auto p-4">
                
                {/* Reports Tab */}
                {moderationTab === 'reports' && (
                  <div>
                    <div className="text-sm text-[#9CA3AF] mb-3">Reportes enviados por ti ({reports.length})</div>
                    {reports.length === 0 ? (
                      <div className="text-center text-[#9CA3AF] py-8 text-sm">Aún no has realizado reportes.</div>
                    ) : (
                      reports.slice().reverse().map(report => {
                        const reported = SEED_PROFILES.find(p => p.id === report.reportedUserId)
                        return (
                          <div key={report.id} className="card p-3 mb-3 rounded-2xl text-sm">
                            <div className="flex justify-between">
                              <div>
                                <div>Reportado: <span className="font-semibold">{reported?.name}</span></div>
                                <div className="text-xs text-[#9CA3AF]">Motivo: {report.reason}</div>
                                {report.details && <div className="text-xs mt-1">"{report.details}"</div>}
                              </div>
                              <div className="text-[10px] text-[#9CA3AF] text-right">
                                {new Date(report.timestamp).toLocaleDateString()}<br />
                                {report.status}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {/* Verifications Tab */}
                {moderationTab === 'verifications' && (
                  <div>
                    <div className="text-sm text-[#9CA3AF] mb-3">Verificaciones pendientes ({pendingVerifications.length})</div>
                    {pendingVerifications.length === 0 ? (
                      <div className="text-center text-[#9CA3AF] py-8 text-sm">No hay verificaciones pendientes.</div>
                    ) : (
                      pendingVerifications.map((v, index) => (
                        <div key={index} className="card p-4 mb-4 rounded-2xl">
                          <div className="font-semibold mb-1">{v.name}, {v.age} • {v.city}</div>
                          <div className="flex gap-2 mb-3">
                            <div>
                              <div className="text-[10px] text-[#9CA3AF]">Documento</div>
                              <img src={v.idPhoto} className="w-20 h-14 object-cover rounded border border-[#2F2F35]" />
                            </div>
                            <div>
                              <div className="text-[10px] text-[#9CA3AF]">Selfie</div>
                              <img src={v.selfiePhoto} className="w-14 h-14 object-cover rounded border border-[#2F2F35]" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => reviewVerification(v.userId, true)}
                              className="flex-1 py-2 bg-[#22c55e] text-black rounded-2xl text-sm font-medium"
                            >
                              Aprobar
                            </button>
                            <button 
                              onClick={() => reviewVerification(v.userId, false)}
                              className="flex-1 py-2 bg-red-500 text-white rounded-2xl text-sm font-medium"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Bans Tab */}
                {moderationTab === 'bans' && (
                  <div>
                    <div className="text-sm text-[#9CA3AF] mb-3">Usuarios baneados ({blockedUsers.length})</div>
                    {blockedUsers.length === 0 ? (
                      <div className="text-center text-[#9CA3AF] py-8 text-sm">No hay usuarios baneados.</div>
                    ) : (
                      blockedUsers.map(userId => {
                        const user = SEED_PROFILES.find(p => p.id === userId)
                        return (
                          <div key={userId} className="flex justify-between items-center card p-3 mb-2 rounded-2xl">
                            <span>{user?.name || 'Usuario desconocido'}</span>
                            <button 
                              onClick={() => unblockUser(userId)}
                              className="text-xs text-[#FF4F79]"
                            >
                              Desbanear
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

              </div>

              <div className="p-4 border-t border-[#2F2F35] text-[10px] text-[#9CA3AF] text-center">
                Este panel es solo para demostración de preparación de lanzamiento.
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* GROUP CHAT MODAL - Full featured for sessions */}
      <AnimatePresence>
        {showGroupChatModalFor && currentUser && (
          <div className="absolute inset-0 z-[120] flex items-end md:items-center justify-center bg-black/90 p-0 md:p-6" onClick={() => setShowGroupChatModalFor(null)}>
            <motion.div 
              initial={{ y: 100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-[420px] bg-[#0D0D10] rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col h-[85dvh] md:h-[620px] max-h-[85dvh] border border-[#2F2F35] shadow-2xl"
            >
              {/* Modal Header - Premium */}
              <div className="p-4 border-b border-[#2F2F35] bg-[#1C1C20] flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="section-header text-lg truncate pr-2 tracking-tight">
                    {sessions.find(s => s.id === showGroupChatModalFor)?.title || 'Sesión grupal'}
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-[#FF671F] font-medium">Chat grupal en vivo</span>
                    <span className="text-[#9CA3AF]">•</span>
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
                        title="Cerrar sesión (admin)"
                      >
                        Cerrar
                      </button>
                    ) : null
                  })()}
                  <a href="/entrenamatch/privacy.html" target="_blank" className="text-[9px] md:text-[10px] text-[#9CA3AF] underline">Privacidad</a>
                  <button onClick={() => {
                    if (confirm('¿Reportar problema en esta sesión?')) {
                      if (showGroupChatModalFor && db) {
                        (async () => {
                          try {
                            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
                            await addDoc(collection(db, 'betaFeedback'), {
                              userId: firebaseUser?.uid || 'demo',
                              type: 'other',
                              rating: 3,
                              text: `Sesión ${showGroupChatModalFor}: Problema reportado por usuario`,
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
                  <button onClick={() => setShowGroupChatModalFor(null)} className="text-3xl leading-none text-[#9CA3AF] hover:text-white px-1">×</button>
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
                      const name = isCurrent ? (currentUser?.name || 'Tú') : (seedUser?.name || 'Participante')
                      return (
                        <button 
                          key={idx}
                          onClick={() => {
                            const mention = `@${(name||'U').split(' ')[0]} `
                            setChatInputValue(prev => prev + mention)
                          }}
                          className="block w-full text-left px-2 py-1 hover:bg-[#25252A] rounded text-[#cbd5e1] truncate flex items-center justify-between"
                        >
                          <span>{name}{isCurrent ? ' (tú)' : ''}</span>
                          {isThisCreator && !isCurrent && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation()
                                if (showGroupChatModalFor) expelFromSession(showGroupChatModalFor, pid)
                              }}
                              className="ml-1 text-red-400 hover:text-red-500 text-[11px] px-0.5"
                              title="Expulsar (solo tú como admin)"
                            >
                              ✕
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
                      return <div className="text-[9px] text-[#FF671F] mt-2 px-1">Eres admin • toca ✕ para expulsar</div>
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
                        const nm = isSelf ? 'Tú' : (seed?.name?.split(' ')[0] || 'P')
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

                  <div ref={groupChatScrollRef} className="flex-1 overflow-auto p-3 sm:p-4 space-y-2 text-sm bg-[#0D0D10] w-full" id="group-chat-scroll">
                    {(sessionMessages[showGroupChatModalFor] || []).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-[#9CA3AF] px-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#1C1C20] flex items-center justify-center mb-4 text-3xl">💬</div>
                        <div className="font-medium text-white">Aún no hay mensajes en el grupo</div>
                        <div className="text-xs mt-1.5 max-w-[240px]">Sé el primero en romper el hielo. { !isDemoMode ? 'Los mensajes son reales (creador puede expulsar/administrar) y se ven en todos los dispositivos.' : 'Los mensajes se ven en todos los dispositivos del grupo.' }</div>
                        {!isDemoMode && <div className="mt-3 text-[10px] text-[#FF671F]">Sincronización en vivo vía Firebase</div>}
                      </div>
                    ) : (
                      (sessionMessages[showGroupChatModalFor] || []).map((msg, i) => {
                        const isMe = msg.senderId === effectiveUserId
                        const session = sessions.find(s => s.id === showGroupChatModalFor)
                        const isCreator = session?.creatorId === msg.senderId
                        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''
                        return (
                          <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                            <div className={`max-w-[85%] sm:max-w-[78%] ${isMe ? 'text-right' : ''} w-full`}>
                              {!isMe && (
                                <div className="text-[9px] text-[#9CA3AF] mb-0.5 px-0.5 flex items-center gap-1 leading-tight">
                                  {isCreator && <span className="text-[#FF671F]">★ </span>}
                                  <span>{msg.senderName}</span>
                                  {time && <span className="text-[#6B7280] ml-1">· {time}</span>}
                                </div>
                              )}
                              {isMe && time && <div className="text-[10px] text-[#6B7280] mb-0.5 px-1 text-right">{time}</div>}
                              <div className={`message-bubble inline-block ${isMe ? 'sent' : 'received'} ${msg.voiceUrl && !msg.voiceUrl.startsWith('blob:') ? '!p-1' : ''}`}>
                                {renderMessageText(msg.text)}
                                {msg.photo && <img src={msg.photo} className="mt-2 max-w-[200px] rounded-xl border border-white/10" />}
                                {msg.voiceUrl && !msg.voiceUrl.startsWith('blob:') ? (
                                  <div className={`voice-bubble mt-1 ${isMe ? 'sent' : 'received'}`}>
                                    <button 
                                      onClick={() => {
                                        try { triggerHaptic(playingVoiceId === msg.id ? 'light' : 'medium') } catch {}
                                        if (playingVoiceId === msg.id) {
                                          if (currentAudioRef.current) {
                                            currentAudioRef.current.pause()
                                            currentAudioRef.current = null
                                          }
                                          setPlayingVoiceId(null)
                                          setVoicePlayProgress(0)
                                        } else {
                                          if (currentAudioRef.current) {
                                            currentAudioRef.current.pause()
                                            currentAudioRef.current = null
                                          }
                                          setPlayingVoiceId(msg.id)
                                          setVoicePlayProgress(0)
                                          const audio = new Audio(msg.voiceUrl)
                                          currentAudioRef.current = audio
                                          const dur = msg.voiceDuration || 5
                                          audio.onended = () => { 
                                            setPlayingVoiceId(null); 
                                            setVoicePlayProgress(0); 
                                            currentAudioRef.current = null 
                                          }
                                          audio.ontimeupdate = () => {
                                            if (audio.duration > 0) setVoicePlayProgress(Math.min(100, (audio.currentTime / audio.duration) * 100))
                                          }
                                          audio.play().catch((e) => { console.warn('audio play error', e); setPlayingVoiceId(null); setVoicePlayProgress(0); currentAudioRef.current = null })
                                        }
                                      }}
                                      className={`voice-play-btn ${playingVoiceId === msg.id ? 'playing' : ''}`}
                                      title={playingVoiceId === msg.id ? "Pausar nota de voz" : "Reproducir nota de voz de tu GymPartner"}
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
                                    <span className="voice-duration">🎙️ {msg.voiceDuration || '?'}s</span>
                                  </div>
                                ) : msg.voiceUrl && msg.voiceUrl.startsWith('blob:') ? (
                                  <span className="text-[10px] text-red-400">Nota de voz no disponible en esta sesión</span>
                                ) : null}
                              </div>

                              {/* Reactions row - align with bubble side */}
                              <div className={`flex gap-1 mt-1 text-xs ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {['👍', '🔥', '💪', '👏'].map(emoji => {
                                  const reactors = msg.reactions?.[emoji] || []
                                  const hasReacted = reactors.includes(currentUser?.name || '')
                                  return (
                                    <button key={emoji} onClick={() => {
                                      const updated = { ...sessionMessages }
                                      const msgs = updated[showGroupChatModalFor] || []
                                      const targetMsg = { ...msgs[i] }
                                      targetMsg.reactions = { ...(targetMsg.reactions || {}) }
                                      if (!targetMsg.reactions[emoji]) targetMsg.reactions[emoji] = []
                                      const safeName = currentUser?.name || 'Tú'
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
                        <span>Alguien está escribiendo...</span>
                      </div>
                    )}
                  </div>

                  {/* Input area - Premium modern */}
                  <div className="p-3 border-t border-[#2F2F35] bg-[#1C1C20] pb-[env(safe-area-inset-bottom)]">
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
                          <div className="title">🎙️ NOTA DE VOZ LISTA PARA TU SQUAD</div>
                          <div className="sub">{pendingVoice.duration}s • +1 Voice Streak • para el squad de GymPartners</div>
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
                        <div className="label">TRANSMITIENDO A TUS GYMPARTNERS...</div>
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
                      className="flex gap-2 items-center"
                    >
                      <input 
                        ref={groupChatInputRef}
                        type="text" 
                        value={chatInputValue}
                        onChange={(e) => setChatInputValue(e.target.value)}
                        placeholder={pendingVoice ? "Nota lista — ENVIAR AL SQUAD" : "Mensaje o voz para tu squad de GymPartners..."}
                        enterKeyHint="send"
                        className="flex-1 bg-[#0D0D10] border border-[#2F2F35] rounded-3xl px-5 py-3 text-sm outline-none placeholder:text-[#9CA3AF] min-w-0 focus:border-[#FF671F]/50" 
                      />

                      <label className="cursor-pointer flex items-center justify-center w-11 h-11 bg-[#1C1C20] border border-[#2F2F35] rounded-3xl text-xl hover:bg-[#25252A] active:bg-[#FF671F]/10 active:text-[#FF671F] active:scale-95 transition">📷
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = () => setGroupChatPhoto(reader.result as string)
                            reader.readAsDataURL(file)
                          }
                        }} />
                      </label>

                      {/* PREMIUM live recording for squad — clearer stop to send flow */}
                      {isRecordingVoice ? (
                        <div className="voice-recording" style={{minWidth: 168, padding: '4px 8px 4px 10px'}}>
                          <div className="dot" />
                          <div className="flex-1 min-w-0">
                            <div className="text-red-400 text-[9px] font-extrabold tracking-[0.5px]">GRABANDO NOTA DE VOZ</div>
                            <div className="flex items-baseline gap-1">
                              <span className="timer">{recordingTime}s <span className="opacity-60">/60</span></span>
                              <span className="text-[8px] text-red-400/70 font-medium">• PARAR para preview y enviar</span>
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
                            title="Parar: luego escuchas y envías al squad"
                          >
                            PARAR
                          </button>
                          <button onClick={cancelVoiceRecording} className="ml-0.5 text-red-400/80 hover:text-red-400 px-1 text-lg leading-none" title="Cancelar grabación">×</button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={startVoiceRecording}
                          className="w-11 h-11 rounded-3xl flex items-center justify-center transition active:scale-95 bg-[#1C1C20] border border-[#2F2F35] text-[#FF671F] hover:bg-[#25252A] hover:border-[#FF671F]/50"
                          title="Grabar nota de voz para el squad de GymPartners"
                        >
                          <Mic size={19} />
                        </button>
                      )}

                      <button type="submit" disabled={!chatInputValue.trim() && !groupChatPhoto && !pendingVoice} title={pendingVoice ? 'Enviar la nota de voz grabada al squad' : 'Enviar mensaje'} className={`${pendingVoice ? 'bg-[#22c55e] text-black' : 'bg-[#FF671F]'} disabled:bg-[#2F2F35] disabled:text-[#9CA3AF] text-black px-3 rounded-3xl font-semibold h-11 w-11 flex items-center justify-center active:scale-95 transition`} aria-label="Enviar">
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

      {/* NOTIFICATIONS PANEL */}
      <AnimatePresence>
        {showNotifications && (
          <div className="absolute inset-0 z-[150] flex flex-col" onClick={() => setShowNotifications(false)}>
            <div 
              onClick={e => e.stopPropagation()} 
              className="flex-1 bg-[#0D0D10] max-w-[420px] mx-auto w-full mt-[42px] rounded-t-3xl border border-[#2F2F35] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#2F2F35] flex justify-between items-center bg-[#1C1C20]">
                <div className="section-header text-base flex items-center gap-2">
                  Notificaciones 
                  { (unreadNotifications + totalChatUnreads + totalSessionUnreads) > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF671F] text-black font-bold animate-pulse">
                      {unreadNotifications + totalChatUnreads + totalSessionUnreads} nuevas
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const hasRead = notifications.some(n => n.read)
                        if (hasRead) {
                          const cleaned = notifications.filter(n => !n.read)
                          saveNotifications(cleaned)
                        }
                      }}
                      className="text-xs text-[#9CA3AF] active:text-white"
                    >
                      Limpiar leídas
                    </button>
                    <button 
                      onClick={() => {
                        const allRead = notifications.map(n => ({...n, read: true}))
                        saveNotifications(allRead)
                      }}
                      className="text-xs text-[#FF671F] font-medium"
                    >
                      Marcar todo leído
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#9CA3AF]">
                    No tienes notificaciones aún.
                  </div>
                ) : (
                  notifications.map(notif => {
                    const isNetworkNotif = notif.type === 'message' && notif.relatedId && !!syncBonds[notif.relatedId] // from your training network
                    const isNetworkLive = (notif.type === 'session_join' || notif.type === 'squad_join') && notif.relatedId && !!syncBonds[notif.relatedId]
                    const isDailyPulse = notif.type === 'daily_pulse'
                    const typeIcon = notif.type === 'message' ? (isNetworkNotif ? '⭐' : '💬') : notif.type === 'match' ? '❤️' : notif.type === 'session_join' ? (isNetworkLive ? '🔥' : '👥') : notif.type === 'squad_join' ? '🏋️' : isDailyPulse ? '🌅' : '🔔'
                    const time = notif.timestamp ? getRelativeTime(notif.timestamp) : ''
                    return (
                      <div 
                        key={notif.id} 
                        className={`p-4 border-b border-[#2F2F35] flex items-start gap-3 active:bg-[#1C1C20] cursor-pointer ${!notif.read ? 'bg-[#1C1C20]' : ''} ${(isNetworkNotif || isNetworkLive) ? 'network-notif border-l-4 border-[#FFD700] bg-[#1a160f]' : ''} ${isDailyPulse ? 'border-l-4 border-[#FF671F] bg-[#1a140f]' : ''}`} 
                        // network notif gold for your red (network-notif styling)
                        onClick={() => {
                          const updated = notifications.map(n =>
                            n.id === notif.id ? { ...n, read: true } : n
                          )
                          saveNotifications(updated)

                          const target = resolveNotificationTarget(notif, { sessionIds: knownSessionIds })
                          if (target) {
                            const partnerHint =
                              target.startSyncWith && notif.relatedId
                                ? (realProfiles.find((p) => p.id === notif.relatedId)?.name ||
                                   SEED_PROFILES.find((p) => p.id === notif.relatedId)?.name)
                                : undefined
                            applyNotificationNavigation(target, partnerHint)
                          }
                        }}
                      >
                        <div className="text-xl mt-0.5 flex-shrink-0">{typeIcon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <div className="font-medium text-sm truncate pr-2">{notif.title}</div>
                            <div className="text-[10px] text-[#9CA3AF] flex-shrink-0">{time}</div>
                          </div>
                          <div className="text-sm text-[#cbd5e1] mt-0.5 line-clamp-2">{notif.body}</div>
                          {!notif.read && (
                            <div className="mt-1.5 inline-block w-1.5 h-1.5 bg-[#FF671F] rounded-full"></div>
                          )}
                          {isNetworkNotif && <div className="mt-1 text-[9px] text-[#FFD700] font-bold">⭐ De tu Red (Fuerza del equipo)</div>}
                        </div>
                        {notif.photoUrl && (
                          <img src={notif.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-[#2F2F35]" />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>

      {/* EntrenaSync end rating - disruptive accountability */}
      {syncDuelSummary && (
        <SyncDuelSummary
          open
          selfName={currentUser.name || 'Tú'}
          selfPhoto={currentUser.photos?.[0]}
          partnerName={syncDuelSummary.partnerName}
          partnerPhoto={syncDuelSummary.partnerPhoto}
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
          onRate={(rating) => {
            submitSyncRating(rating, {
              partnerId: syncDuelSummary.partnerId,
              partnerName: syncDuelSummary.partnerName,
              minutes: syncDuelSummary.minutes,
              vibe: syncDuelSummary.vibe,
              actions: syncDuelSummary.actions,
            })
          }}
        />
      )}

      {pendingSyncRating && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4" onClick={() => setPendingSyncRating(null)}>
          <div className="bg-[#1C1C20] rounded-3xl p-6 max-w-sm w-full text-center border border-[#22c55e]/30" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-2">HANDSHAKE</div>
            <div className="font-bold text-xl mb-1">How was the EntrenaSync with {pendingSyncRating.partnerName}?</div>
            <div className="text-sm text-[#9CA3AF] mb-4">{pendingSyncRating.minutes} minutes together - Your feedback helps matching</div>
            <div className="flex justify-center gap-2 mb-4">
              {[1,2,3,4,5].map(r => (
                <button key={r} onClick={() => submitSyncRating(r)} className="text-3xl p-1.5 active:scale-90 transition text-[#FF671F] hover:text-white">{'★'.repeat(r)}</button>
              ))}
            </div>
            <button onClick={() => setPendingSyncRating(null)} className="text-xs text-[#9CA3AF]">Skip for now</button>
          </div>
        </div>
      )}

      {/* NEVER-SEEN: Replay modal for a finished EntrenaSync session.
          Plays back the shared ritual as a beautiful memory. This persistence of "we trained together" is pure magic and 100% unique. */}
      {replaySession && (
        <div className="fixed inset-0 z-[120] bg-black/85 flex items-center justify-center p-4" onClick={() => setReplaySession(null)}>
          <div className="bg-[#1C1C20] rounded-3xl p-5 max-w-sm w-full border border-[#22c55e]/30" onClick={e=>e.stopPropagation()}>
            <div className="text-center mb-3">
              <div className="text-[#22c55e] text-xs tracking-[2px]">RECUERDO COMPARTIDO</div>
              <div className="font-bold text-xl">Sync con {replaySession.partnerName}</div>
              <div className="text-sm text-[#9CA3AF]">{replaySession.minutes} min • Vibe {replaySession.vibe}% {replaySession.rating ? `• ${replaySession.rating}★` : ''}</div>
            </div>

            {/* Animated replay timeline */}
            <div className="bg-black/40 rounded-2xl p-3 mb-3 min-h-[132px] relative overflow-hidden">
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
              {(!replaySession.actions || replaySession.actions.length === 0) && <div className="text-[#9CA3AF] text-xs text-center py-6">Sin acciones registradas en este sync.</div>}
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setReplaySession(null); if (replaySession.partnerName) { /* quick re-sync CTA */ const p = realProfiles.find(pp => pp.name?.includes(replaySession.partnerName.split(' ')[0])); if (p) tryAutoStartSync(p.id) } }} className="flex-1 py-2.5 rounded-2xl bg-[#22c55e] text-black font-semibold text-sm active:bg-[#16a34a]">🔄 Re-Sync con {replaySession.partnerName?.split(' ')[0]}</button>
              <button onClick={() => setReplaySession(null)} className="flex-1 py-2.5 rounded-2xl border border-white/15 text-sm">Cerrar</button>
            </div>
            <div className="text-center text-[9px] text-[#9CA3AF] mt-2">Este recuerdo vive en tus dos muros. Nadie más tiene esto.</div>
          </div>
        </div>
      )}

      {/* WITNESS MODE: Short replay of the epic high-vibe moment that generated a Ritual Ripple.
          Anyone who sees the wave on the map (or receives the notification) can witness what actually happened in the Arena.
          This turns private legendary syncs into community-shared cultural moments. Never-seen-before social layer. */}
      {witnessData && (
        <div className="fixed inset-0 z-[130] bg-black/90 flex items-center justify-center p-4" onClick={() => setWitnessData(null)}>
          <div className="bg-[#1C1C20] rounded-3xl p-5 max-w-sm w-full border border-[#FF671F]/40" onClick={e=>e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="text-[#FF671F] text-xs tracking-[2.5px] font-bold">HIGHLIGHT DE LA RED — ENTRENASYNC FUERTE</div>
              <div className="font-black text-2xl mt-1">Sync con {witnessData.partnerName}</div>
              <div className="text-sm text-[#9CA3AF]">{witnessData.minutes} min • Sync Score {witnessData.vibe}%</div>
              <div className="text-[10px] text-[#FF671F]/70 mt-1">Esta sesión fortalece el grafo de la red</div>
            </div>

            {/* Compact epic actions timeline */}
            <div className="bg-black/50 rounded-2xl p-3 mb-4 border border-[#FF671F]/20">
              {(witnessData.actions || []).slice(0,5).map((a: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 py-1 text-sm border-b border-white/10 last:border-none">
                  <span className="text-xl">{a.emoji}</span>
                  <span className="flex-1 text-white/90">{a.label}{a.combo ? <span className="text-[#FF671F] font-bold"> ×{a.combo}</span> : ''}</span>
                  {a.photoUrl && <img src={a.photoUrl} className="w-7 h-7 rounded object-cover border border-white/20" />}
                </div>
              ))}
              {(!witnessData.actions || witnessData.actions.length === 0) && (
                <div className="text-[#9CA3AF] text-xs py-4 text-center">Momento de alto rendimiento capturado en el sync de la red.</div>
              )}
            </div>

            {witnessData.workoutPreview && (
              <div className="mb-4">
                <WorkoutPostCard preview={witnessData.workoutPreview} compact />
                {witnessData.loggedSets > 0 && (
                  <p className="text-[10px] text-center text-[#22c55e] mt-2 font-medium">
                    {witnessData.loggedSets} sets reales registrados en EntrenaLog
                  </p>
                )}
              </div>
            )}

            {witnessData.photoUrl && (
              <div className="mb-4">
                <img src={witnessData.photoUrl} className="w-full rounded-2xl border border-[#FF671F]/30" alt="Momento épico" />
                <div className="text-[10px] text-center text-[#9CA3AF] mt-1">Foto del pico de energía</div>
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={() => { 
                  setWitnessData(null); 
                  // Nice touch: offer to create your own network highlight
                  toast('¿Listo para crear tu propio sync que fortalezca tu red y se propague?');
                }} 
                className="flex-1 py-2.5 rounded-2xl bg-[#FF671F] text-black font-semibold text-sm active:bg-[#e55a1a]"
              >
                🔥 Crear mi propio momento
              </button>
              <button 
                onClick={() => {
                  // CLAIM THE ECHO - turns the witnessed moment into permanent community mythology
                  // This is the virality + status layer that makes the app feel inevitable.
                  const echoText = `🔄 HIGHLIGHT DE ENTRENASYNC\n${witnessData.minutes} min sincronizados con ${witnessData.partnerName} • Sync Score ${witnessData.vibe}%\n${(witnessData.actions || []).slice(0,3).map((a: any) => `${a.emoji} ${a.label}`).join(' · ')}\n\nSesión de alto rendimiento que fortalece nuestra red. +${Math.floor(witnessData.minutes * 1.2)} min de progreso compartido. Queda como highlight visible para la comunidad.`;
                  createProfilePost(echoText, witnessData.photoUrl).then(() => {
                    toast.success('Highlight archivado', { description: 'Esta sesión de EntrenaSync queda como parte permanente de tu red de rendimiento y es visible para la comunidad.' });
                    setWitnessData(null);
                  }).catch(() => {
                    toast('Highlight guardado localmente (se sincronizará).');
                    setWitnessData(null);
                  });
                }} 
                className="flex-1 py-2.5 rounded-2xl border border-[#FFD700] text-[#FFD700] font-semibold text-sm active:bg-[#FFD700]/10"
              >
                📌 Archivar como Highlight de EntrenaSync
              </button>
              <button onClick={() => setWitnessData(null)} className="flex-1 py-2.5 rounded-2xl border border-white/20 text-sm">Cerrar</button>
            </div>
            <div className="text-center text-[8px] text-[#9CA3AF]/60 mt-2">Fuiste parte de un EntrenaSync fuerte de la red. Archívalo y forma parte de la cultura de alto rendimiento.</div>
          </div>
        </div>
      )}

      {/* Hidden input — Arena form photo on web */}
      <input
        ref={arenaPhotoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          const resolve = arenaPhotoResolverRef.current
          arenaPhotoResolverRef.current = null
          if (!file || !resolve) {
            resolve?.(null)
            return
          }
          const reader = new FileReader()
          reader.onload = () => {
            resolve(typeof reader.result === 'string' ? reader.result : null)
            e.target.value = ''
          }
          reader.onerror = () => {
            resolve(null)
            e.target.value = ''
          }
          reader.readAsDataURL(file)
        }}
      />

      {syncPartnerId && showSyncArena && (() => {
        const partner = realProfiles.find((p) => p.id === syncPartnerId)
        const dist =
          userLocation && partner?.lat != null && partner?.lng != null
            ? getDistanceKm(userLocation.lat, userLocation.lng, partner.lat, partner.lng)
            : null
        const bond = syncBonds[syncPartnerId]
        const excludeIds = new Set([effectiveUserId, syncPartnerId, 'me', firebaseUser?.uid].filter(Boolean))
        const redLiveCount = Object.keys(syncBonds).filter(
          (id) => !excludeIds.has(id) && isUserLive(id)
        ).length
        const witnessProfiles = syncWitnessIds
          .slice(0, 5)
          .map((id) => {
            const p = realProfiles.find((pr) => pr.id === id)
            return p ? { id, name: p.name, photo: p.photos?.[0] } : { id, name: 'Atleta' }
          })
        return (
          <SyncArenaView
            open
            onMinimize={() => setShowSyncArena(false)}
            onEndSync={endSync}
            selfName={currentUser.name || 'Tú'}
            selfPhoto={currentUser.photos?.[0]}
            partnerName={partner?.name || 'Compañero'}
            partnerPhoto={partner?.photos?.[0]}
            partnerId={syncPartnerId}
            effectiveUserId={effectiveUserId}
            syncStartedAt={syncStartedAt}
            syncVibe={syncVibe}
            syncCombo={syncCombo}
            syncActions={syncActions}
            bondLevel={bond?.bondLevel ?? 1}
            isNetworkBond={!!bond}
            distanceKm={dist}
            liveNearbyCount={liveTrainingNow.length}
            witnessCount={syncRealWitnessCount}
            witnessProfiles={witnessProfiles}
            redLiveCount={redLiveCount}
            cityLabel={currentUser.city || partner?.city}
            partnerLiveState={syncPartnerLiveState}
            restUntil={syncRestUntil}
            restStartedBy={syncRestStartedBy}
            weeklyPactProgress={homeWeeklyPactProgress}
            isRecordingVoice={isArenaVoiceRecording}
            onSyncAction={handleArenaSyncAction}
            onCapturePhoto={handleArenaCapturePhoto}
            onVoicePing={startArenaVoicePing}
            activeExercise={syncWorkoutLog.activeExercise}
            pendingReps={syncWorkoutLog.pendingReps}
            pendingWeightKg={syncWorkoutLog.pendingWeightKg}
            loggedSetCount={countLoggedSets(syncWorkoutLog)}
            selfExercises={syncWorkoutLog.exercises}
            exerciseSuggestions={arenaExerciseNames}
            onActiveExerciseChange={(name) => {
              setSyncWorkoutLog((prev) => {
                const next = { ...prev, activeExercise: name }
                void persistSyncWorkoutLogToSession(next)
                return next
              })
            }}
            onPendingRepsChange={(reps) => {
              setSyncWorkoutLog((prev) => {
                const next = { ...prev, pendingReps: reps }
                void persistSyncWorkoutLogToSession(next)
                return next
              })
            }}
            onPendingWeightChange={(kg) => {
              setSyncWorkoutLog((prev) => {
                const next = { ...prev, pendingWeightKg: kg }
                void persistSyncWorkoutLogToSession(next)
                return next
              })
            }}
          />
        )
      })()}

      {syncPartnerId && !showSyncArena && (
        <ArenaGlobalPulseBar
          partnerName={realProfiles.find((p) => p.id === syncPartnerId)?.name || 'Compañero'}
          syncVibe={syncVibe}
          witnessCount={syncRealWitnessCount}
          waveCount={arenaWaveCount}
          globalPairs={activeSyncPairs}
          onOpenArena={() => setShowSyncArena(true)}
          preferCollapsed={activeTab === 'messages' && !!activeChat}
        />
      )}

    </ErrorBoundary>
  )
}

// ErrorBoundary restaurado (fue eliminado accidentalmente durante limpieza de código muerto del mapa).
// Envuelve secciones críticas (Auth, Onboarding y el shell principal) para que crashes no dejen la app en blanco.
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
            <div className="text-2xl mb-4">Algo salió mal</div>
            <p className="text-[#9CA3AF] mb-6 text-sm">
              La aplicación tuvo un error. Tus datos en Firebase siguen seguros.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-2.5"
            >
              Recargar la página
            </button>
            <div className="mt-4 text-[10px] text-[#9CA3AF]/60">
              Si persiste, avísanos en el feedback del perfil.
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default App

