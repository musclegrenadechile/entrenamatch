export interface Profile {
  id: string
  name: string
  age: number
  gender: 'hombre' | 'mujer'
  city: string
  country: string
  lat: number
  lng: number
  bio: string
  photos: string[]
  trainingTypes: string[]
  goals: string[]
  level: 'Principiante' | 'Intermedio' | 'Avanzado'
  availability: string[]
  availableToday?: boolean
  intensity?: 'Relajado' | 'Moderado' | 'Intenso'
  verificationStatus?: 'unverified' | 'pending' | 'verified'
  verificationDate?: number
  verificationDocuments?: {
    idPhoto?: string
    selfiePhoto?: string
  }
  trainingNow?: boolean
  trainingNowSince?: number
  liveStreak?: number // consecutive days hosting live training (killer retention)
  lastLiveDate?: number
  liveJoins?: number // total times joined others' live
  joinedLiveStreak?: number // consecutive days participating in live training (join or host)
  // EntrenaSync (dedicated collection + profile pointer for discovery)
  trainingSyncWith?: string
  syncStreak?: number
  syncStartedAt?: number
  /** Weekly live stats for local leaderboard (Phase 4). */
  weekStats?: WeekStats
  /** Opt-in for city leaderboard; default visible when unset. */
  showOnLeaderboard?: boolean
  /** Last gym partner check-in (shown on map when live). */
  gymCheckIn?: GymCheckIn
  /** Weekly goal — closes Home loop (Meta semanal, Phase D4). */
  weeklyPact?: WeeklyPact
}

export interface WeeklyPact {
  weekKey: string
  liveDaysTarget: number
  syncSessionsTarget: number
  partnerId?: string
  partnerName?: string
  pledgedAt: number
}

export interface WeekStats {
  weekKey: string
  liveMinutes: number
  /** EntrenaSync minutes — counts toward city challenge + leaderboard. */
  syncMinutes?: number
  liveDays: number
  updatedAt: number
}

export interface GymCheckIn {
  gymId: string
  gymName: string
  lat: number
  lng: number
  checkedInAt: number
}

export interface Message {
  id: string
  from: 'me' | 'them'
  text: string
  timestamp: number
  voiceUrl?: string
  voiceDuration?: number
  read?: boolean
  readAt?: number
}

export interface TrainingSession {
  id: string
  creatorId: string
  creatorName: string
  title: string
  description?: string
  time: string
  location: string
  trainingType: string
  maxParticipants: number
  participants: string[]
  createdAt: number
}

export interface TrainingReview {
  id: string
  reviewerId: string
  reviewerName: string
  rating: number
  comment?: string
  photo?: string
  timestamp: number
  bookingId?: string
}

export interface SessionMessage {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: number
  photo?: string
  voiceUrl?: string
  voiceDuration?: number
  reactions?: Record<string, string[]>
}

export interface SquadWeeklyChallenge {
  weekKey: string
  targetSessions: number
  progressSessions: number
  label: string
  updatedAt: number
}

export interface Squad {
  id: string
  name: string
  focus: string
  members: string[]
  createdBy: string
  createdAt: number
  city?: string
  /** Shared weekly training plan (Phase 4). */
  weeklyRoutine?: SquadWeeklyRoutine
  weeklyChallenge?: SquadWeeklyChallenge
}

export interface SquadWeeklyRoutine {
  label: string
  schedule: string
  notes?: string
  updatedAt: number
  updatedBy: string
}

export interface Report {
  id: string
  reporterId: string
  reportedUserId: string
  reason: string
  details?: string
  context: 'profile' | '1v1_chat' | 'group_chat' | 'session' | 'squad'
  contextId?: string
  timestamp: number
  status: 'pending' | 'reviewed' | 'resolved'
}

export interface Notification {
  id: string
  type: 'match' | 'session_join' | 'squad_join' | 'sync_invite' | 'verification' | 'group_message' | 'report' | 'message' | 'daily_pulse'
  title: string
  body: string
  timestamp: number
  read: boolean
  relatedId?: string
  photoUrl?: string
}

export interface CurrentUser extends Omit<Profile, 'id'> {
  id: 'me'
  availableToday?: boolean
  trainingNow?: boolean
  trainingNowSince?: number
  liveStreak?: number // consecutive days hosting live training (killer retention)
  lastLiveDate?: number
  liveJoins?: number // total times joined others' live
  joinedLiveStreak?: number // consecutive days participating in live training (join or host)
  trainingSyncWith?: string
  syncStreak?: number
  syncStartedAt?: number
  verificationStatus?: 'unverified' | 'pending' | 'verified'
  verificationDate?: number
  verificationDocuments?: {
    idPhoto?: string
    selfiePhoto?: string
  }
  legalConsents?: {
    acceptedAt: number
    termsVersion: string
    privacyVersion: string
    communityVersion: string
    is18: boolean
    isForTraining: boolean
    sharesLocation: boolean
  }
}

export type Tab =
  | 'home'
  | 'explore'
  | 'red'
  | 'squads'
  | 'sesiones'
  | 'matches'
  | 'messages'
  | 'profile'

export type WorkoutType = 'push' | 'pull' | 'legs' | 'full' | 'cardio' | 'other'

export type ProfilePostType = 'text' | 'workout' | 'dailyPulse' | 'nutrition' | 'sync' | 'video'

export type FuelGoal = 'lose' | 'maintain' | 'gain' | 'muscle'

export interface FuelProfile {
  weightKg: number
  heightCm: number
  age: number
  gender: 'hombre' | 'mujer'
  goal: FuelGoal
  activityLevel: 'light' | 'moderate' | 'active' | 'very_active'
  restrictions?: string
  tdee: number
  targetKcal: number
  targetProteinG: number
  targetCarbsG: number
  targetFatG: number
  updatedAt?: number
}

export interface FuelLogEntry {
  id: string
  userId: string
  date: string
  mealLabel: string
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  photoUrl?: string
  source: 'manual' | 'photo_ai' | 'text_ai'
  createdAt: number
}

export interface FuelDayTotals {
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
  entryCount: number
}

export interface NutritionPreview {
  mealLabel: string
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface WorkoutSet {
  reps: number
  weightKg: number
}

export interface WorkoutExercise {
  name: string
  sets: WorkoutSet[]
}

export interface WorkoutStats {
  totalSets: number
  totalVolumeKg: number
  durationMin: number
  exerciseCount: number
}

export interface Workout {
  id: string
  userId: string
  title: string
  type: WorkoutType
  startedAt: number
  endedAt: number
  exercises: WorkoutExercise[]
  stats: WorkoutStats
  source: 'manual' | 'arena' | 'sync' | 'template'
  syncSessionId?: string
  partnerId?: string
  participantIds?: string[]
}

export interface WorkoutPreview {
  title: string
  type: WorkoutType
  exerciseCount: number
  totalSets: number
  volumeLabel: string
  durationMin: number
  exercises?: Array<{ name: string; setCount: number; topWeightKg?: number }>
}

export interface ProfilePost {
  id: string
  userId: string
  text: string
  photo?: string
  videoUrl?: string
  timestamp: number
  pinned?: boolean
  likes: string[] // list of userIds who liked
  postType?: ProfilePostType
  workoutId?: string
  workoutPreview?: WorkoutPreview
  nutritionPreview?: NutritionPreview
  reactions?: Record<string, string[]>
  comments: Array<{
    id: string
    userId: string
    userName: string
    text: string
    timestamp: number
  }>
}

export type MarketplaceCategory = 'suplemento' | 'ropa' | 'equipo' | 'digital' | 'otro'

export interface MarketplaceProduct {
  id: string
  title: string
  description: string
  priceClp: number
  imageUrl?: string
  paymentUrl: string
  category: MarketplaceCategory
  active: boolean
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface MarketplaceShippingInfo {
  fullName: string
  email: string
  phone: string
  altPhone?: string
  address: string
  city: string
  region: string
}

export type MarketplaceOrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface MarketplaceOrder {
  id: string
  userId: string
  productId: string
  productTitle: string
  priceClp: number
  category: MarketplaceCategory
  shipping: MarketplaceShippingInfo
  status: MarketplaceOrderStatus
  createdAt: number
}

export type TrainerSpecialty =
  | 'fuerza'
  | 'hipertrofia'
  | 'cardio'
  | 'funcional'
  | 'crossfit'
  | 'rehab'
  | 'nutricion'
  | 'otro'

export type TrainerPaymentMethod = 'card' | 'cash'

/** Día de la semana 0=Dom … 6=Sáb, minutos desde medianoche. */
export interface TrainerAvailabilitySlot {
  dow: number
  startMin: number
  endMin: number
}

export interface TrainerSessionPackage {
  id: string
  sessions: number
  discountPercent: number
  label?: string
}

export interface TrainerProfile {
  userId: string
  displayName: string
  bio: string
  specialties: TrainerSpecialty[]
  hourlyRateClp: number
  sessionDurationMin: number
  city: string
  region: string
  zones: string[]
  paymentMethods: TrainerPaymentMethod[]
  paymentUrl?: string
  /** Set by admin (marketplaceAdmins) — badge Entrenador verificado */
  verified?: boolean
  mpCollectorId?: string
  /** Modo Uber — recibe ofertas en vivo cerca de su ubicación */
  availableForDispatch?: boolean
  dispatchLat?: number
  dispatchLng?: number
  /** Horarios semanales en los que acepta reservas */
  availabilitySlots?: TrainerAvailabilitySlot[]
  /** Paquetes multi-sesión con descuento */
  packages?: TrainerSessionPackage[]
  active: boolean
  avgRating: number
  reviewCount: number
  createdAt: number
  updatedAt: number
}

export type TrainerBookingStatus =
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'paid_cash'
  | 'paid_card'

export interface TrainerBooking {
  id: string
  trainerId: string
  trainerName: string
  clientId: string
  clientName: string
  scheduledAt: number
  durationMin: number
  locationNote: string
  priceClp: number
  paymentMethod: TrainerPaymentMethod
  status: TrainerBookingStatus
  clientMessage?: string
  reviewId?: string
  syncSessionId?: string
  mpPreferenceId?: string
  mpPaymentId?: string
  platformFeeClp?: number
  packageId?: string
  packageSessions?: number
  packageDiscountPercent?: number
  createdAt: number
  updatedAt: number
}

export interface TrainerProfileInput {
  bio: string
  specialties: TrainerSpecialty[]
  hourlyRateClp: number
  sessionDurationMin: number
  city: string
  region: string
  zones: string
  paymentMethods: TrainerPaymentMethod[]
  paymentUrl?: string
  active: boolean
  availableForDispatch?: boolean
  availabilitySlots?: TrainerAvailabilitySlot[]
  packages?: TrainerSessionPackage[]
}

export interface TrainerBookingInput {
  scheduledAt: number
  locationNote: string
  paymentMethod: TrainerPaymentMethod
  clientMessage?: string
  packageId?: string
}

export type TrainerDispatchStatus =
  | 'searching'
  | 'offering'
  | 'matched'
  | 'en_route'
  | 'no_trainers'
  | 'cancelled'
  | 'expired'

export interface TrainerDispatchRequest {
  id: string
  clientId: string
  clientName: string
  specialty: TrainerSpecialty
  durationMin: number
  lat: number
  lng: number
  locationNote: string
  paymentMethod: TrainerPaymentMethod
  marketPriceClp: number
  offerPriceClp: number
  surgeFactor: number
  platformFeeClp: number
  status: TrainerDispatchStatus
  candidateTrainerIds: string[]
  passedTrainerIds: string[]
  currentTrainerId?: string
  currentTrainerName?: string
  offerExpiresAt?: number
  matchedTrainerId?: string
  bookingId?: string
  etaMin?: number
  createdAt: number
  updatedAt: number
}

export interface TrainerDispatchInput {
  specialty: TrainerSpecialty
  durationMin: number
  lat: number
  lng: number
  locationNote: string
  paymentMethod: TrainerPaymentMethod
}

export interface TrainerDispatchPriceEstimate {
  marketPriceClp: number
  offerPriceClp: number
  surgeFactor: number
  nearbyCount: number
  platformFeeClp: number
}

export type {
  DailyChallenge,
  DailyPulseState,
  NetworkStats,
  RetentionGadget,
  SyncBond,
} from './profilePulse'
