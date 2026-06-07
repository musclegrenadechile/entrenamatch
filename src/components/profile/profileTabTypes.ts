import type { ChangeEvent, Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react'
import type { User } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import type {
  CurrentUser,
  Profile,
  ProfilePost,
  Squad,
  Tab,
  DailyPulseState,
  SyncBond,
  NetworkStats,
  RetentionGadget,
} from '../../types'
import type { ProfileSection } from './ProfileSectionNav'

export type LegalPage = 'terms' | 'privacy' | 'community' | null

export type FeedbackType = 'bug' | 'idea' | 'ux' | 'other'

export type {
  DailyChallenge,
  DailyPulseState,
  SyncBond,
  NetworkStats,
  RetentionGadget,
} from '../../types/profilePulse'

export interface BetaFeedbackItem {
  id?: string
  type: FeedbackType
  rating: number
  text: string
  platform?: string
  createdAt: number | Date
}

export interface PlayIntegrityResult {
  token?: string
  simulatedVerdict?: boolean
  error?: string
}

export interface ActiveCommentTarget {
  postId: string
  postUserId: string
  ownerName?: string
}

export interface EditingPostTarget {
  postId: string
  postUserId: string
  text: string
}

export interface FeedPhotoModalState {
  url: string
  postId?: string
}

export interface NotifPrefs {
  messages: boolean
  live: boolean
  muro: boolean
}

/** Props wired from App into ProfileTab and its sub-sections */
export interface ProfileTabProps {
  currentUser: CurrentUser
  showDailyPulseBanner: boolean
  dailyPulse: DailyPulseState | null
  triggerHaptic: (style?: 'light' | 'medium' | 'success') => void
  setShowDailyPulseBanner: Dispatch<SetStateAction<boolean>>
  isDemoMode: boolean
  isSyncingProfile: boolean
  setIsSyncingProfile: Dispatch<SetStateAction<boolean>>
  loadRealProfiles: () => void | Promise<void>
  loadRealSessions: () => void | Promise<void>
  loadMyFeedbacks: () => void | Promise<void>
  firebaseUser: User | null | undefined
  getUserProfile: (uid: string) => Promise<Partial<Profile> | null>
  saveUser: (user: CurrentUser) => void
  setLastSync: Dispatch<SetStateAction<Date | null>>
  lastSync: Date | null
  handleLogout: () => void | Promise<void>
  openProfileEditor: () => void
  profileSection: ProfileSection
  setProfileSection: Dispatch<SetStateAction<ProfileSection>>
  networkStats: NetworkStats
  syncBonds: Record<string, SyncBond>
  setMapForceTick: Dispatch<SetStateAction<number>>
  saveUserWithRealSync: (user: CurrentUser) => Promise<void>
  setActiveTab: Dispatch<SetStateAction<Tab>>
  setShowLiveModal: Dispatch<SetStateAction<boolean>>
  matches: string[]
  squads: Squad[]
  liveCountForUI: number
  liveTrainingNow: Profile[]
  profilePosts: Record<string, ProfilePost[]>
  effectiveUserId: string
  getUnlockedGadgets: (level: number) => RetentionGadget[]
  getTodayStr: () => string
  setDailyPulse: Dispatch<SetStateAction<DailyPulseState | null>>
  debugLogsRef: MutableRefObject<string[]>
  SEED_PROFILES: Profile[]
  realProfiles: Profile[]
  startSyncWith: (partnerId: string, partnerName: string) => void
  tryAutoStartSync: (partnerId: string, partnerName: string) => void
  setShowFullProfile: Dispatch<SetStateAction<Profile | null>>
  refreshDailyPulse: () => void
  completeDailyChallenge: (amount?: number) => void
  getNextGadget: (level: number) => RetentionGadget | null | undefined
  muroComposerRef: RefObject<HTMLTextAreaElement | HTMLInputElement | null>
  muroPhotoInputRef: RefObject<HTMLInputElement | null>
  loadingPersonalMuro: boolean
  setLoadingPersonalMuro: Dispatch<SetStateAction<boolean>>
  loadProfilePosts: (userId: string) => void | Promise<void>
  processIncomingLiveJoins: () => void
  muroComposerText: string
  setMuroComposerText: Dispatch<SetStateAction<string>>
  muroComposerPhoto: string | null
  setMuroComposerPhoto: Dispatch<SetStateAction<string | null>>
  muroPhotoUploading: boolean
  muroPhotoUploadProgress: number
  muroPublishing: boolean
  setMuroPublishing: Dispatch<SetStateAction<boolean>>
  createProfilePost: (text: string, photo?: string | null) => Promise<void>
  handleMuroPhotoFile: (e: ChangeEvent<HTMLInputElement>) => void
  deleteProfilePost: (postId: string, postUserId: string) => Promise<void>
  togglePinPost: (postId: string, postUserId: string, currentPinned?: boolean) => Promise<void>
  likeProfilePost: (postId: string, postUserId: string) => Promise<void>
  boostReaction: (postId: string, emoji: string, postOwnerId: string) => Promise<void>
  feedReactions: Record<string, Record<string, number>>
  activeComment: ActiveCommentTarget | null
  commentDraft: string
  setCommentDraft: Dispatch<SetStateAction<string>>
  openFullComments: (postId: string, postUserId: string, ownerName?: string) => void
  submitComment: () => void | Promise<void>
  cancelComment: () => void
  deleteCommentFromPost: (postId: string, postUserId: string, commentId: string) => void | Promise<void>
  editingPost: EditingPostTarget | null
  editDraft: string
  setEditDraft: Dispatch<SetStateAction<string>>
  startEditPost: (postId: string, postUserId: string, currentText: string) => void
  saveEditPost: () => void | Promise<void>
  recentlyPublishedPostId: string | null
  setFeedPhotoModal: Dispatch<SetStateAction<FeedPhotoModalState | null>>
  getRelativeTime: (ts?: number) => string
  isEditingBio: boolean
  setIsEditingBio: Dispatch<SetStateAction<boolean>>
  testIntegrityNonce: string
  setTestIntegrityNonce: Dispatch<SetStateAction<string>>
  checkPlayIntegrity: (showToast?: boolean) => Promise<PlayIntegrityResult | null | undefined>
  integrityChecking: boolean
  lastIntegrity: PlayIntegrityResult | null
  toggleLiveTraining: (mode?: 'on' | 'off') => void | Promise<void>
  isTogglingLive: boolean
  syncPartnerId: string | null
  showSyncArena: boolean
  setShowSyncArena: Dispatch<SetStateAction<boolean>>
  syncVibe: number
  syncStartedAt: number | null
  setShowLegal: Dispatch<SetStateAction<LegalPage>>
  setShowVerificationFlow: Dispatch<SetStateAction<boolean>>
  setVerificationStep: Dispatch<SetStateAction<number>>
  feedbackType: FeedbackType
  setFeedbackType: Dispatch<SetStateAction<FeedbackType>>
  feedbackRating: number
  setFeedbackRating: Dispatch<SetStateAction<number>>
  feedbackText: string
  setFeedbackText: Dispatch<SetStateAction<string>>
  myFeedbacks: BetaFeedbackItem[]
  loadingMyFeedbacks: boolean
  db: Firestore | null | undefined
  storage: import('firebase/storage').FirebaseStorage | null | undefined
  requestWebNotificationPermission: () => void
  requestNativePushPermission: () => void
  PushNotifications: { register: () => Promise<void>; checkPermissions: () => Promise<{ receive: string }> } | null
  CapacitorCamera: {
    getPhoto: (options: Record<string, unknown>) => Promise<{ base64String?: string; dataUrl?: string }>
  } | null
  notifPrefs: NotifPrefs
  setNotifPrefs: Dispatch<SetStateAction<NotifPrefs>>
  setShowPwaInstall: Dispatch<SetStateAction<boolean>>
  reorderGallery: (fromIndex: number, toIndex: number) => void
  deleteExtraPhoto: (indexToRemove: number) => void | Promise<void>
  uploadProfilePhotoIfNeeded: (dataUrl: string) => Promise<string>
}
