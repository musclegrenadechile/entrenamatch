// @ts-nocheck
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, MessageCircle, User, MapPin, Dumbbell, 
  Edit2, RefreshCw, ArrowLeft, Send, Star, Plus, Users 
} from 'lucide-react'
import { 
  signUpWithEmail, 
  signInWithEmail, 
  createUserProfile
} from './services/auth'
import { useAuth } from './contexts/AuthContext'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

// ==================== REFACTORED IMPORTS ====================
import type { 
  Profile, Message, TrainingSession, TrainingReview, 
  SessionMessage, Squad, Report, Notification, CurrentUser, Tab 
} from './types'
import { 
  TRAINING_OPTIONS, AVAILABILITY, LEGAL_VERSIONS, AUTO_MATCH_IDS 
} from './constants'
import { 
  getDistanceKm, 
  calculateCompatibility, 
  getTrainingStreak, 
  getAverageRating 
} from './utils'
import { useDemoAuth } from './hooks/useDemoAuth'
import { useProfile } from './hooks/useProfile'
import { useFilters } from './hooks/useFilters'
import { useSquads } from './hooks/useSquads'
import { ExploreTab } from './components/explore/ExploreTab'

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
  }
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
    setShowOnboarding 
  } = useProfile()

  const { 
    squads: _squadsFromHook, 
    createSquad: _createSquad, 
    joinSquad: _joinSquad, 
    leaveSquad: _leaveSquad 
  } = useSquads()
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [passedIds, setPassedIds] = useState<string[]>([])
  const [matches, setMatches] = useState<string[]>([]) // profile ids you matched with
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [activeChat, setActiveChat] = useState<string | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>('explore')
  const [showFilters, setShowFilters] = useState(false)
  const [showMatchModal, setShowMatchModal] = useState<Profile | null>(null)
  const [showFullProfile, setShowFullProfile] = useState<Profile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

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

  // Training Sessions (unique feature)
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [showCreateSession, setShowCreateSession] = useState(false)

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

  // Squads feature (fixed small training groups)
  const [squads, setSquads] = useState<Squad[]>([])
  const [showCreateSquad, setShowCreateSquad] = useState(false)
  const [selectedSquad, setSelectedSquad] = useState<string | null>(null) // for detail view

  // Safety & Moderation (critical for launch)
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])
  const [reports, setReports] = useState<Report[]>([])

  // Moderation Panel state
  const [showModerationPanel, setShowModerationPanel] = useState(false)
  const [moderationTab, setModerationTab] = useState<'reports' | 'verifications' | 'bans'>('reports')

  // Auth flow state (default to register in public demo for easy "Crear Cuenta")
  // (local auth state moved into AuthScreen + useDemoAuth)

  // Notifications system (simulated for launch readiness)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  const unreadNotifications = notifications.filter(n => !n.read).length

  // Real Auth from Firebase + Demo Auth
  const { currentUser: firebaseUser, userProfile: firebaseProfile, isDemoMode } = useAuth()
  const { 
    signInDemo, 
    signUpDemo, 
    isAuthenticated: isDemoAuthenticated 
  } = useDemoAuth()

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
    const savedLiked = localStorage.getItem('fitvina_liked')
    const savedPassed = localStorage.getItem('fitvina_passed')
    const savedMatches = localStorage.getItem('fitvina_matches')
    const savedMessages = localStorage.getItem('fitvina_messages')
    const savedLocation = localStorage.getItem('entrenamatch_location')

    if (savedLiked) setLikedIds(JSON.parse(savedLiked))
    if (savedPassed) setPassedIds(JSON.parse(savedPassed))
    if (savedMatches) setMatches(JSON.parse(savedMatches))
    if (savedMessages) setMessages(JSON.parse(savedMessages))
    if (savedLocation) {
      setUserLocation(JSON.parse(savedLocation))
    }
    const savedSessions = localStorage.getItem('entrenamatch_sessions')
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    } else {
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
    if (savedReviews) setReviews(JSON.parse(savedReviews))

    const savedSessionMessages = localStorage.getItem('entrenamatch_session_messages')
    if (savedSessionMessages) {
      setSessionMessages(JSON.parse(savedSessionMessages))
    }

    const savedSquads = localStorage.getItem('entrenamatch_squads')
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

    const savedBlocked = localStorage.getItem('entrenamatch_blocked')
    if (savedBlocked) setBlockedUsers(JSON.parse(savedBlocked))

    const savedReports = localStorage.getItem('entrenamatch_reports')
    if (savedReports) setReports(JSON.parse(savedReports))

    const savedNotifications = localStorage.getItem('entrenamatch_notifications')
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
  }, [])

  // Save helpers - now delegated to useProfile hook
  // (saveUser is already provided by the hook)
  const saveLiked = (ids: string[]) => { localStorage.setItem('fitvina_liked', JSON.stringify(ids)); setLikedIds(ids) }
  const savePassed = (ids: string[]) => { localStorage.setItem('fitvina_passed', JSON.stringify(ids)); setPassedIds(ids) }
  const saveMatches = (ids: string[]) => { localStorage.setItem('fitvina_matches', JSON.stringify(ids)); setMatches(ids) }
  const saveMessages = (msgs: Record<string, Message[]>) => { localStorage.setItem('fitvina_messages', JSON.stringify(msgs)); setMessages(msgs) }

  const saveSessions = (newSessions: TrainingSession[]) => {
    localStorage.setItem('entrenamatch_sessions', JSON.stringify(newSessions))
    setSessions(newSessions)
  }

  const saveReviews = (newReviews: Record<string, TrainingReview[]>) => {
    localStorage.setItem('entrenamatch_reviews', JSON.stringify(newReviews))
    setReviews(newReviews)
  }

  const saveSessionMessages = (newMessages: Record<string, SessionMessage[]>) => {
    localStorage.setItem('entrenamatch_session_messages', JSON.stringify(newMessages))
    setSessionMessages(newMessages)
  }

  const saveSquads = (newSquads: Squad[]) => {
    localStorage.setItem('entrenamatch_squads', JSON.stringify(newSquads))
    setSquads(newSquads)
  }

  const saveBlockedUsers = (newBlocked: string[]) => {
    localStorage.setItem('entrenamatch_blocked', JSON.stringify(newBlocked))
    setBlockedUsers(newBlocked)
  }

  const saveReports = (newReports: Report[]) => {
    localStorage.setItem('entrenamatch_reports', JSON.stringify(newReports))
    setReports(newReports)
  }

  const saveNotifications = (newNotifications: Notification[]) => {
    localStorage.setItem('entrenamatch_notifications', JSON.stringify(newNotifications))
    setNotifications(newNotifications)
  }

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notification,
      id: 'notif' + Date.now(),
      timestamp: Date.now(),
      read: false
    }
    const updated = [newNotif, ...notifications].slice(0, 50) // keep last 50
    saveNotifications(updated)
  }

  const submitTrainingReview = (profileId: string) => {
    if (!currentUser) return

    const newReview: TrainingReview = {
      id: 'r' + Date.now(),
      reviewerId: 'me',
      reviewerName: currentUser.name,
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
      photo: reviewPhoto || undefined,
      timestamp: Date.now()
    }

    const existing = reviews[profileId] || []
    const updatedReviews = {
      ...reviews,
      [profileId]: [...existing, newReview]
    }

    saveReviews(updatedReviews)
    setShowReviewModalFor(null)
    setReviewComment('')
    setReviewPhoto(null)
    toast.success('¡Reseña enviada!', { description: 'Gracias por ayudar a la comunidad de EntrenaMatch' })
  }

  // Report a user (critical safety feature)
  const reportUser = (userId: string, reason: string, details?: string, context: Report['context'] = 'profile', contextId?: string) => {
    if (!currentUser || userId === 'me') return

    const newReport: Report = {
      id: 'rep' + Date.now(),
      reporterId: 'me',
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

    // Auto-block after reporting (safety-first behavior)
    if (!blockedUsers.includes(userId)) {
      const newBlocked = [...blockedUsers, userId]
      saveBlockedUsers(newBlocked)
    }

    toast.success('Reporte enviado', { 
      description: 'Gracias por reportar. El usuario ha sido bloqueado automáticamente.' 
    })
  }

  // Block a user
  const blockUser = (userId: string) => {
    if (!currentUser || userId === 'me' || blockedUsers.includes(userId)) return

    const newBlocked = [...blockedUsers, userId]
    saveBlockedUsers(newBlocked)

    toast.success('Usuario bloqueado', { 
      description: 'No volverás a verlo en descubrimiento ni matches.' 
    })
  }

  // Unblock a user
  const unblockUser = (userId: string) => {
    const newBlocked = blockedUsers.filter(id => id !== userId)
    saveBlockedUsers(newBlocked)
    toast('Usuario desbloqueado')
  }

  // Real Authentication handlers (Phase 1)
  const handleEmailAuth = async (isRegister: boolean) => {
    if (!authEmail || !authPassword) {
      setAuthError('Por favor completa email y contraseña')
      return
    }

    setAuthLoading(true)
    setAuthError('')

    try {
      if (isDemoMode) {
        // Use the new useDemoAuth hook
        if (isRegister) {
          await signUpDemo(authEmail)
          toast.success('Cuenta creada exitosamente')
        } else {
          await signInDemo(authEmail)
          toast.success('Sesión iniciada')
        }
      } else {
        // Real Firebase path
        if (isRegister) {
          const firebaseUser = await signUpWithEmail(authEmail, authPassword)
          await createUserProfile(firebaseUser, {
            name: authEmail.split('@')[0],
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
        } else {
          await signInWithEmail(authEmail, authPassword)
          toast.success('Sesión iniciada')
        }
      }
    } catch (error: any) {
      console.error(error)
      setAuthError(error.message || 'Error en la autenticación')
    } finally {
      setAuthLoading(false)

      // In demo mode, after successful auth, decide next step
      if (isDemoMode) {
        const hasLocalProfile = localStorage.getItem('fitvina_user')
        if (!hasLocalProfile) {
          setShowOnboarding(true)
        }
      }
    }
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



  // Multi-step verification submission
  const submitVerification = () => {
    if (!currentUser) return

    const updated = {
      ...currentUser,
      verificationStatus: 'pending' as const,
      verificationDocuments: {
        idPhoto: verificationIdPhoto || undefined,
        selfiePhoto: verificationSelfie || undefined,
      }
    }

    saveUser(updated as CurrentUser)
    setShowVerificationFlow(false)

    // Simulate review process (in real app this would go to backend)
    toast.success('Documentos enviados', { 
      description: 'Tu verificación está en revisión. Te notificaremos en las próximas horas.' 
    })

    // For demo purposes, auto-approve after 8 seconds
    setTimeout(() => {
      if (currentUser.verificationStatus === 'pending') {
        const approved = {
          ...currentUser,
          verificationStatus: 'verified' as const,
          verificationDate: Date.now(),
          verificationDocuments: {
            idPhoto: verificationIdPhoto || undefined,
            selfiePhoto: verificationSelfie || undefined,
          }
        }
        saveUser(approved as CurrentUser)

        addNotification({
          type: 'verification',
          title: '¡Perfil verificado!',
          body: 'Tu verificación fue aprobada. El badge ya está visible.',
        })

        toast.success('¡Perfil verificado!', { 
          description: 'Tu badge de verificación ya está visible para todos.' 
        })
      }
    }, 8000)
  }

  // Send message to a session group chat (supports text + optional photo)
  const sendSessionMessage = (sessionId: string, text: string, photo?: string | null) => {
    if (!currentUser || (!text.trim() && !photo)) return

    const newMsg: SessionMessage = {
      id: 'sm' + Date.now(),
      senderId: 'me',
      senderName: currentUser.name,
      text: text.trim() || '',
      timestamp: Date.now(),
      photo: photo || undefined,
      reactions: {}
    }

    const current = sessionMessages[sessionId] || []
    const updated = {
      ...sessionMessages,
      [sessionId]: [...current, newMsg]
    }

    saveSessionMessages(updated)
    setGroupChatPhoto(null)

    // Auto scroll to bottom
    setTimeout(() => {
      const scrollEl = document.getElementById('group-chat-scroll')
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight
    }, 50)

    // Simulate reply (only if it was a text message)
    if (!photo && Math.random() > 0.6) {
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
            [sessionId]: [...(updated[sessionId] || []), replyMsg]
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

  // Seed some initial messages when user joins a session for the first time (contextual by type)
  const seedInitialSessionMessages = (session: TrainingSession) => {
    if (sessionMessages[session.id]?.length > 0) return

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

  // Request user GPS location
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude }
        setUserLocation(loc)
        localStorage.setItem('entrenamatch_location', JSON.stringify(loc))
        toast.success('Ubicación activada', { description: 'Ahora verás la distancia real a cada persona' })
      },
      (error) => {
        console.warn('Geolocation error:', error)
        toast.error('No pudimos obtener tu ubicación', { description: 'Puedes seguir usando la app con distancias aproximadas' })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Remaining profiles (not swiped)
  const remainingProfiles = useMemo(() => {
    const swiped = new Set([...likedIds, ...passedIds])
    return SEED_PROFILES.filter(p => !swiped.has(p.id))
  }, [likedIds, passedIds])

  // Filtered deck (with distance support + blocking)
  const deck = useMemo(() => {
    return remainingProfiles.filter(p => {
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
      return true
    })
  }, [remainingProfiles, filters, userLocation, blockedUsers])

  // Visible cards (top 3 for stack effect)
  const visibleCards = deck.slice(0, 3)

  // Current chatting profile
  const chatProfile = activeChat ? SEED_PROFILES.find(p => p.id === activeChat) : null

  // Matches profiles
  const matchProfiles = useMemo(() => 
    SEED_PROFILES.filter(p => matches.includes(p.id)), [matches]
  )

  // ==================== SWIPE LOGIC ====================
  const handleSwipe = (profileId: string, direction: 'left' | 'right') => {
    const profile = SEED_PROFILES.find(p => p.id === profileId)
    if (!profile) return

    if (direction === 'right') {
      const newLiked = [...likedIds, profileId]
      saveLiked(newLiked)

      // Match logic
      const isAutoMatch = AUTO_MATCH_IDS.includes(profileId)
      const randomMatch = Math.random() < 0.28
      const alreadyMatched = matches.includes(profileId)

      if (!alreadyMatched && (isAutoMatch || randomMatch)) {
        const newMatches = [...matches, profileId]
        saveMatches(newMatches)
        
        // Seed a nice first message
        const openers = CHAT_OPENERS[profileId] || ["¡Hola! Vi tu perfil y me tinca entrenar juntos 💪"]
        const firstMsg: Message = {
          id: Date.now().toString(36),
          from: 'them',
          text: openers[0],
          timestamp: Date.now()
        }
        const updatedMsgs = { ...messages, [profileId]: [firstMsg] }
        saveMessages(updatedMsgs)

        // Add notification
        addNotification({
          type: 'match',
          title: '¡Nuevo Match!',
          body: `Hiciste match con ${profile.name}`,
          relatedId: profileId
        })

        // Show beautiful match modal
        setShowMatchModal(profile)
        triggerConfetti()
        toast.success(`¡Match con ${profile.name}!`, { description: 'Tienen ganas de entrenar juntos 🔥' })
      } else {
        toast('Like enviado', { description: `A ${profile.name} le avisaremos si hay match` })
      }
    } else {
      const newPassed = [...passedIds, profileId]
      savePassed(newPassed)
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
  }

  const sendMessage = (text: string) => {
    if (!activeChat || !text.trim()) return

    const newMsg: Message = {
      id: Date.now().toString(36) + Math.random(),
      from: 'me',
      text: text.trim(),
      timestamp: Date.now()
    }

    const currentChat = messages[activeChat] || []
    const updated = { ...messages, [activeChat]: [...currentChat, newMsg] }
    saveMessages(updated)

    // Simulate realistic reply sometimes
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
    setFilters({ minAge: 20, maxAge: 40, gender: 'todos', trainingTypes: [], availability: [], maxDistanceKm: 100, onlyAvailableToday: false })
  })

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white flex flex-col overflow-hidden relative">
      {/* DEMO BANNER - Pre-alpha */}
      <div className="bg-[#14b8a6] text-black text-center text-xs py-1.5 font-medium tracking-wide z-50">
        DEMO PRE-ALPHA • Datos locales (se borran al recargar) • El match del movimiento
      </div>
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* ===== EXPLORE / SWIPE (fully owned by ExploreTab) ===== */}
        {activeTab === 'explore' && (
          <ExploreTab
            deck={deck}
            visibleCards={visibleCards}
            userLocation={userLocation}
            filters={filters}
            currentUser={currentUser}
            setShowFilters={setShowFilters}
            resetDeck={() => { saveLiked([]); savePassed([]); toast('Deck reiniciado'); }}
            requestUserLocation={requestUserLocation}
            onSwipe={(direction, profileId) => {
              if (direction === 'right') {
                handleSwipe(profileId, 'right');
              } else {
                handleSwipe(profileId, 'left');
              }
            }}
            onShowProfile={setShowFullProfile}
          />
        )}

        {/* ===== SQUADS (Fixed training crews) - New unique feature ===== */}
        {activeTab === 'squads' && (
          <div className="flex-1 overflow-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-semibold tracking-[-1.2px]">Tus Squads</div>
                <div className="text-[#94a3b8] text-sm">Grupos fijos de 3-4 personas para entrenar consistentemente</div>
              </div>
              <button 
                onClick={() => setShowCreateSquad(true)}
                className="flex items-center gap-2 bg-[#14b8a6] text-black px-4 py-2 rounded-2xl text-sm font-semibold active:bg-[#0f9d8c]"
              >
                <Plus size={16} /> Crear Squad
              </button>
            </div>

            {squads.length === 0 ? (
              <div className="card p-8 rounded-3xl text-center mt-8">
                <Users className="mx-auto text-[#14b8a6] mb-3" size={42} />
                <div className="font-semibold mb-1">No hay squads aún</div>
                <p className="text-sm text-[#94a3b8]">Crea uno o únete a un grupo fijo de entrenamiento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {squads.map(squad => {
                  const isMember = squad.members.includes('me')
                  const spots = 4 - squad.members.length

                  return (
                    <div key={squad.id} className="card rounded-3xl p-4 active:bg-[#1a1d23]" onClick={() => setSelectedSquad(squad.id)}>
                      <div className="flex justify-between">
                        <div>
                          <div className="font-semibold text-lg">{squad.name}</div>
                          <div className="text-sm text-[#14b8a6]">{squad.focus}</div>
                        </div>
                        <div className="text-right text-xs">
                          <div>{squad.members.length}/4 miembros</div>
                          {!isMember && spots > 0 && <div className="text-[#22c55e]">Espacios disponibles</div>}
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center text-sm">
                        <div className="text-[#94a3b8] text-xs">
                          Creado por {SEED_PROFILES.find(p => p.id === squad.createdBy)?.name || 'alguien'}
                        </div>
                        {!isMember && spots > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              const updated = squads.map(sq =>
                                sq.id === squad.id ? { ...sq, members: [...sq.members, 'me'] } : sq
                              )
                              saveSquads(updated)
                              toast.success('¡Te uniste al Squad!')
                            }}
                            className="bg-[#14b8a6] text-black text-xs px-4 py-1.5 rounded-2xl font-medium"
                          >
                            Unirme
                          </button>
                        )}
                        {isMember && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSquad(squad.id)
                            }}
                            className="text-xs border border-[#14b8a6] text-[#14b8a6] px-3 py-1 rounded-xl"
                          >
                            Ver Squad + Chat
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== SESIONES DE ENTRENAMIENTO (Unique feature) ===== */}
        {activeTab === 'sesiones' && (
          <div className="flex-1 overflow-auto p-4 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold tracking-[-1.2px]">Sesiones</div>
                <div className="text-[#94a3b8] text-sm">Entrenamientos grupales cerca de ti</div>
              </div>
              <button 
                onClick={() => setShowCreateSession(true)}
                className="flex items-center gap-2 bg-[#14b8a6] text-black px-4 py-2 rounded-2xl text-sm font-semibold active:bg-[#0f9d8c]"
              >
                <Plus size={16} /> Crear
              </button>
            </div>

            {/* === SESIONES ABIERTAS === */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-lg font-semibold">Sesiones abiertas</div>
                <div className="text-xs px-2 py-0.5 bg-[#272b33] rounded-full text-[#94a3b8]">
                  {sessions.filter(s => !s.participants.includes('me')).length}
                </div>
              </div>

              {sessions.filter(s => !s.participants.includes('me')).length === 0 ? (
                <div className="card p-6 rounded-3xl text-center">
                  <p className="text-[#94a3b8] text-sm">No hay sesiones abiertas por ahora.</p>
                  <p className="text-xs text-[#64748b] mt-1">¡Crea una tú!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions
                    .filter(s => !s.participants.includes('me'))
                    .sort((a,b) => b.createdAt - a.createdAt)
                    .map(session => {
                      const spotsLeft = session.maxParticipants - session.participants.length
                      const dist = userLocation ? getDistanceKm(userLocation.lat, userLocation.lng, 
                        SEED_PROFILES.find(p => p.id === session.creatorId)?.lat || 0, 
                        SEED_PROFILES.find(p => p.id === session.creatorId)?.lng || 0) : null

                      return (
                        <div key={session.id} className="card rounded-3xl p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">{session.title}</div>
                              <div className="text-sm text-[#14b8a6]">{session.trainingType} • {session.time}</div>
                              <div className="text-sm text-[#94a3b8] mt-0.5">{session.location}</div>
                            </div>
                            <div className="text-right text-xs">
                              <div className="text-[#22c55e] font-medium">{spotsLeft} cupos</div>
                              {dist && <div className="text-[#64748b]">{dist} km</div>}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-sm">
                            <div className="text-[#94a3b8]">
                              Creado por <span className="text-white">{session.creatorName}</span>
                              <div className="text-[10px] mt-0.5">{session.participants.length} / {session.maxParticipants} personas</div>
                            </div>
                            <button 
                              onClick={() => {
                                const updated = sessions.map(s => 
                                  s.id === session.id 
                                    ? { ...s, participants: [...s.participants, 'me'] } 
                                    : s
                                )
                                saveSessions(updated)

                                // Seed initial group chat messages
                                const joinedSession = updated.find(s => s.id === session.id)
                                if (joinedSession) {
                                  seedInitialSessionMessages(joinedSession)
                                }

                                // Notify the creator
                                if (session.creatorId !== 'me') {
                                  addNotification({
                                    type: 'session_join',
                                    title: '¡Alguien se unió a tu sesión!',
                                    body: `${currentUser?.name || 'Alguien'} se unió a "${session.title}"`,
                                    relatedId: session.id
                                  })
                                }

                                toast.success('¡Te uniste a la sesión!', { description: 'Ve a "Mis sesiones" para chatear con el grupo' })
                              }}
                              disabled={spotsLeft <= 0}
                              className="bg-[#14b8a6] text-black px-5 py-1.5 rounded-2xl text-sm font-medium disabled:opacity-50"
                            >
                              Unirme
                            </button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* === MIS SESIONES (Joined + Created) === */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-lg font-semibold">Mis sesiones</div>
                <div className="text-xs px-2 py-0.5 bg-[#14b8a6]/20 text-[#14b8a6] rounded-full">
                  {sessions.filter(s => s.participants.includes('me') || s.creatorId === 'me').length}
                </div>
              </div>

              {sessions.filter(s => s.participants.includes('me') || s.creatorId === 'me').length === 0 ? (
                <div className="card p-6 rounded-3xl text-center">
                  <p className="text-[#94a3b8] text-sm">Aún no te has unido ni creado ninguna sesión.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions
                    .filter(s => s.participants.includes('me') || s.creatorId === 'me')
                    .sort((a,b) => b.createdAt - a.createdAt)
                    .map(session => {
                      const isCreator = session.creatorId === 'me'
                      const dist = userLocation ? getDistanceKm(userLocation.lat, userLocation.lng, 
                        SEED_PROFILES.find(p => p.id === session.creatorId)?.lat || 0, 
                        SEED_PROFILES.find(p => p.id === session.creatorId)?.lng || 0) : null

                      return (
                        <div key={session.id} className="card rounded-3xl p-4 border border-[#14b8a6]/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg flex items-center gap-2">
                                {session.title}
                                {isCreator && <span className="text-[10px] bg-[#14b8a6] text-black px-2 py-0.5 rounded">Creada por ti</span>}
                              </div>
                              <div className="text-sm text-[#14b8a6]">{session.trainingType} • {session.time}</div>
                              <div className="text-sm text-[#94a3b8]">{session.location}</div>
                            </div>
                            <div className="text-right text-xs">
                              {dist && <div className="text-[#64748b]">{dist} km</div>}
                              <div className="text-[#22c55e] mt-0.5">{session.participants.length} / {session.maxParticipants}</div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-[#94a3b8]">
                              Participantes: {session.participants.length}
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setShowGroupChatModalFor(session.id)
                                  setChatInputValue('')
                                }}
                                className="text-xs bg-[#14b8a6] text-black px-4 py-1.5 rounded-2xl font-medium"
                              >
                                Abrir chat grupal
                              </button>

                              {!isCreator && (
                                <button 
                                  onClick={() => setShowReviewModalFor(session.creatorId)}
                                  className="text-xs border border-[#14b8a6] text-[#14b8a6] px-3 py-1 rounded-xl"
                                >
                                  Marcar entrenado
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Chat moved to modal - button above opens it */}
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== MATCHES ===== */}
        {activeTab === 'matches' && (
          <div className="flex-1 overflow-auto p-4">
            <div className="text-2xl font-semibold tracking-[-1.2px] mb-1 px-1">Tus matches</div>
            <div className="text-[#94a3b8] px-1 mb-5 text-sm">Gente con la que ya conectaste en Viña</div>

            {matchProfiles.length === 0 ? (
              <div className="card p-8 rounded-3xl text-center mt-8">
                <Heart className="mx-auto text-[#14b8a6] mb-3" size={42} />
                <div className="font-semibold mb-1">Aún no tienes matches</div>
                <p className="text-sm text-[#94a3b8]">Sigue deslizando a la derecha. ¡Los matches aparecen rápido!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {matchProfiles
                  .filter(p => !blockedUsers.includes(p.id))
                  .map(profile => (
                  <div key={profile.id} onClick={() => openChat(profile.id)} className="card rounded-3xl overflow-hidden active:opacity-80 cursor-pointer">
                    <div className="relative">
                      <img src={profile.photos[0]} className="w-full aspect-square object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 p-3">
                        <div className="font-semibold">{profile.name}, {profile.age}</div>
                        <div className="text-xs text-[#14b8a6]">{profile.city}, {profile.country}</div>
                        {userLocation && (
                          <div className="text-[10px] text-[#14b8a6]/80 mt-0.5">
                            {getDistanceKm(userLocation.lat, userLocation.lng, profile.lat, profile.lng)} km
                          </div>
                        )}
                        {getTrainingStreak(profile.id, reviews) > 1 && (
                          <div className="text-[10px] text-orange-400 mt-0.5">🔥 {getTrainingStreak(profile.id, reviews)} seguidas</div>
                        )}
                        {(() => {
                          const sharedSquads = squads.filter(sq => 
                            sq.members.includes('me') && sq.members.includes(profile.id)
                          )
                          if (sharedSquads.length > 0) {
                            return <div className="text-[10px] text-[#14b8a6] mt-0.5">Squad: {sharedSquads[0].name}</div>
                          }
                          return null
                        })()}
                      </div>
                    </div>
                    <div className="p-3 text-xs text-[#94a3b8] flex items-center gap-1">
                      <MessageCircle size={14} /> Chatear
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== MESSAGES ===== */}
        {activeTab === 'messages' && (
          <div className="flex-1 flex flex-col">
            {!activeChat ? (
              // List of chats
              <div className="overflow-auto flex-1 p-4">
                <div className="text-2xl font-semibold tracking-[-1.2px] mb-5 px-1">Mensajes</div>
                {matchProfiles.length === 0 && <div className="text-[#94a3b8] p-4">Cuando hagas match aparecerán aquí para chatear.</div>}
                {matchProfiles
                  .filter(p => !blockedUsers.includes(p.id))
                  .map(profile => {
                  const chatMsgs = messages[profile.id] || []
                  const last = chatMsgs[chatMsgs.length - 1]
                  return (
                    <div key={profile.id} onClick={() => setActiveChat(profile.id)} 
                      className="flex items-center gap-4 card p-4 rounded-3xl mb-3 active:bg-[#1a1d23]">
                      <img src={profile.photos[0]} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold">{profile.name}</span>
                          <span className="text-xs text-[#64748b]">{profile.city}</span>
                        </div>
                        {userLocation && (
                          <div className="text-[10px] text-[#14b8a6] mt-0.5">
                            {getDistanceKm(userLocation.lat, userLocation.lng, profile.lat, profile.lng)} km de ti
                          </div>
                        )}
                        <div className="text-sm text-[#94a3b8] truncate mt-0.5">
                          {last ? last.text : 'Match nuevo — di hola'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Chat view
              <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="h-14 px-4 flex items-center gap-3 border-b border-[#272b33] bg-[#0a0b0f] z-10">
                  <button onClick={() => setActiveChat(null)} className="p-2 -ml-2"><ArrowLeft /></button>
                  <img src={chatProfile?.photos[0]} className="w-9 h-9 rounded-xl object-cover" />
                  <div>
                    <div className="font-semibold">{chatProfile?.name}</div>
                    <div className="text-[10px] text-[#14b8a6] -mt-0.5">{chatProfile?.city}, {chatProfile?.country} • En línea</div>
                  </div>
                  <button onClick={() => setShowFullProfile(chatProfile!)} className="ml-auto text-xs px-3 py-1 bg-[#121418] rounded-full">Ver perfil</button>
                </div>

                {/* Safety in 1:1 chat */}
                <div className="flex justify-end gap-2 px-4 py-1 bg-[#0f1115] text-xs">
                  <button 
                    onClick={() => {
                      const reason = prompt('Motivo del reporte:')
                      if (reason && activeChat) {
                        reportUser(activeChat, reason, undefined, '1v1_chat', activeChat)
                      }
                    }}
                    className="text-red-400 hover:underline"
                  >
                    Reportar
                  </button>
                  <button 
                    onClick={() => {
                      if (activeChat && confirm('¿Bloquear este usuario?')) {
                        blockUser(activeChat)
                        setActiveChat(null)
                      }
                    }}
                    className="text-red-400 hover:underline"
                  >
                    Bloquear
                  </button>
                </div>

                {/* Entrenamos Juntos - Enhanced with reviews */}
                <div className="px-4 py-2 bg-[#121418] border-b border-[#272b33] text-center">
                  <button 
                    onClick={() => {
                      if (activeChat) {
                        setShowReviewModalFor(activeChat)
                        setReviewRating(5)
                        setReviewComment('')
                      }
                    }}
                    className="text-xs bg-[#14b8a6]/10 text-[#14b8a6] px-3 py-1 rounded-full hover:bg-[#14b8a6] hover:text-black transition"
                  >
                    ★ Marcamos que entrenamos juntos (dejar reseña)
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-auto p-4 space-y-3 pb-20" id="chat-scroll">
                  {(messages[activeChat] || []).map((m, i) => (
                    <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : ''}`}>
                      <div className={`message-bubble ${m.from === 'me' ? 'sent' : 'received'}`}>{m.text}</div>
                    </div>
                  ))}
                  {(messages[activeChat] || []).length === 0 && (
                    <div className="text-center text-sm text-[#64748b] mt-8">¡Empieza la conversación!</div>
                  )}
                </div>

                {/* Quick Training Proposals - Unique feature */}
                <div className="px-3 pt-2 border-t border-[#272b33] bg-[#0a0b0f]">
                  <div className="text-[10px] text-[#64748b] mb-1.5 px-1">Propuestas rápidas:</div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      '¿Vamos a correr el sábado?',
                      'Gym esta semana?',
                      'Calistenia en la playa mañana?',
                      'Pesas mañana 19:00?',
                      '¿Te tinca entrenar funcional?'
                    ].map((proposal, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(proposal)}
                        className="text-xs bg-[#121418] hover:bg-[#1f242b] border border-[#272b33] px-3 py-1 rounded-full text-[#cbd5e1] active:bg-[#14b8a6] active:text-black"
                      >
                        {proposal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-3 border-t border-[#272b33] bg-[#0a0b0f]">
                  <form onSubmit={(e) => { e.preventDefault(); const input = (e.currentTarget.elements[0] as HTMLInputElement); sendMessage(input.value); input.value = '' }} className="flex gap-2">
                    <input type="text" placeholder="Escribe un mensaje..." className="flex-1 bg-[#121418] border border-[#272b33] rounded-3xl px-5 py-3 text-sm outline-none" />
                    <button type="submit" className="bg-[#14b8a6] text-black w-12 rounded-3xl flex items-center justify-center"><Send size={18} /></button>
                  </form>
                  <div className="text-center text-[10px] text-[#475569] mt-2">Los mensajes son solo para esta demo (se guardan en tu navegador)</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== PROFILE ===== */}
        {activeTab === 'profile' && currentUser && (
          <div className="flex-1 overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-semibold tracking-[-1.2px]">Tu perfil</div>
              <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="flex items-center gap-1 text-sm text-[#14b8a6]">
                <Edit2 size={16} /> {isEditingProfile ? 'Guardar' : 'Editar'}
              </button>
            </div>

            <div className="card rounded-3xl overflow-hidden mb-4">
              <div className="relative h-52">
                <img src={currentUser.photos[0]} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90">
                  <div className="text-3xl font-semibold tracking-tight">{currentUser.name}, {currentUser.age}</div>
                  <div className="text-[#14b8a6]">{currentUser.city}, {currentUser.country} • {currentUser.level}</div>
                </div>
              </div>
              <div className="p-5 text-sm">
                <div className="text-[#94a3b8] mb-1 text-xs">SOBRE TI</div>
                <div>{currentUser.bio}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs uppercase tracking-widest text-[#64748b] mb-2 px-1">Tus entrenamientos</div>
              <div className="flex flex-wrap gap-2">
                {currentUser.trainingTypes.map(t => <div key={t} className="chip chip-active">{t}</div>)}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs uppercase tracking-widest text-[#64748b] mb-2 px-1">Tus objetivos</div>
              <div className="flex flex-wrap gap-2">
                {(currentUser.goals || []).map(g => <div key={g} className="chip">{g}</div>)}
              </div>
            </div>

            {/* User's Squads in Profile */}
            {(() => {
              const mySquads = squads.filter(sq => sq.members.includes('me'))
              if (mySquads.length === 0) return null
              return (
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-widest text-[#64748b] mb-2 px-1">Tus Squads</div>
                  <div className="flex flex-wrap gap-2">
                    {mySquads.map(sq => (
                      <div 
                        key={sq.id} 
                        onClick={() => { setSelectedSquad(sq.id); setActiveTab('squads') }}
                        className="chip cursor-pointer active:bg-[#14b8a6] active:text-black"
                      >
                        {sq.name}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            <div className="card rounded-3xl p-5 mb-4 text-sm space-y-3">
              <div className="flex justify-between"><span className="text-[#94a3b8]">Disponibilidad</span> <span>{currentUser.availability.join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-[#94a3b8]">Ubicación</span> <span>{currentUser.city}, {currentUser.country}</span></div>
            </div>

            {/* Disponible Hoy - Unique safety + utility feature */}
            <div className="card rounded-3xl p-4 mb-4 flex items-center justify-between">
              <div>
                <div className="font-medium">¿Disponible para entrenar hoy?</div>
                <div className="text-xs text-[#94a3b8]">Aparecerás en el filtro “Solo disponibles hoy”</div>
              </div>
              <button 
                onClick={() => {
                  const newVal = !currentUser.availableToday
                  const updated = { ...currentUser, availableToday: newVal }
                  saveUser(updated as CurrentUser)
                  toast(newVal ? '¡Marcado como disponible hoy!' : 'Disponibilidad actualizada')
                }}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${currentUser.availableToday ? 'bg-[#14b8a6] text-black' : 'bg-[#121418] border border-[#272b33]'}`}
              >
                {currentUser.availableToday ? 'Sí, disponible hoy' : 'No disponible hoy'}
              </button>
            </div>

            {/* Profile Verification - Now a serious multi-step process */}
            <div className="card rounded-3xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    Verificación de identidad
                    {currentUser.verificationStatus === 'verified' && (
                      <span className="text-[#22c55e] font-bold">✓ Verificado</span>
                    )}
                    {currentUser.verificationStatus === 'pending' && (
                      <span className="text-yellow-400 font-bold">⏳ En revisión</span>
                    )}
                  </div>
                  <div className="text-xs text-[#94a3b8]">
                    {currentUser.verificationStatus === 'verified' 
                      ? `Verificado el ${new Date(currentUser.verificationDate || 0).toLocaleDateString()}`
                      : 'Aumenta significativamente la confianza de otros usuarios'}
                  </div>
                </div>
              </div>

              {currentUser.verificationStatus !== 'verified' && (
                <button 
                  onClick={() => {
                    setShowVerificationFlow(true)
                    setVerificationStep(1)
                    setVerificationIdPhoto(null)
                    setVerificationSelfie(null)
                  }}
                  className="w-full mt-2 bg-[#14b8a6] text-black py-2.5 rounded-2xl text-sm font-semibold"
                >
                  {currentUser.verificationStatus === 'pending' ? 'Ver estado de verificación' : 'Iniciar verificación de identidad'}
                </button>
              )}

              {currentUser.verificationStatus === 'verified' && (
                <div className="mt-2 text-[10px] text-[#22c55e]">
                  Tu perfil muestra el badge de verificado en swipe, matches y sesiones.
                </div>
              )}
            </div>

            {/* Real stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                {label:'Matches', val: matches.length},
                {label:'Reseñas recibidas', val: Object.values(reviews).flat().filter(r => r.reviewerId !== 'me').length},
                {label:'Sesiones totales', val: Object.values(reviews).flat().length}
              ].map((s,i) => (
                <div key={i} className="card rounded-2xl p-4 text-center">
                  <div className="text-2xl font-semibold text-[#14b8a6]">{s.val}</div>
                  <div className="text-xs text-[#94a3b8]">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card rounded-2xl p-4 mb-4 text-sm">
              <div className="text-xs uppercase tracking-widest text-[#64748b] mb-2">Legal y seguridad</div>
              <div className="flex flex-col gap-1 text-[#14b8a6]">
                <button onClick={() => setShowLegal('terms')} className="text-left py-1 hover:underline">Términos de Servicio</button>
                <button onClick={() => setShowLegal('privacy')} className="text-left py-1 hover:underline">Política de Privacidad</button>
                <button onClick={() => setShowLegal('community')} className="text-left py-1 hover:underline">Directrices de la Comunidad ({LEGAL_VERSIONS.community})</button>
                <button 
                  onClick={() => setShowModerationPanel(true)} 
                  className="text-left py-1 hover:underline text-yellow-400"
                >
                  Panel de Moderación (Demo)
                </button>
              </div>

              {/* Legal consent history (for compliance) */}
              {currentUser.legalConsents && (
                <div className="mt-4 pt-4 border-t border-[#272b33] text-xs">
                  <div className="text-[#64748b] mb-1">Consentimientos aceptados</div>
                  <div className="text-[#cbd5e1]">
                    {new Date(currentUser.legalConsents.acceptedAt).toLocaleDateString()} — 
                    Términos {currentUser.legalConsents.termsVersion}, 
                    Privacidad {currentUser.legalConsents.privacyVersion}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }} 
              className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[#ef4444] border border-[#3f2a2a] rounded-2xl active:bg-[#1f1616]"
            >
              <RefreshCw size={16} /> Restablecer toda la app (borrar datos)
            </button>

            {/* Blocked users management */}
            {blockedUsers.length > 0 && (
              <div className="mt-6">
                <div className="text-xs uppercase tracking-widest text-[#64748b] mb-2 px-1">Usuarios bloqueados ({blockedUsers.length})</div>
                <div className="space-y-1">
                  {blockedUsers.map(userId => {
                    const user = SEED_PROFILES.find(p => p.id === userId)
                    return (
                      <div key={userId} className="flex justify-between items-center bg-[#121418] px-3 py-2 rounded-xl text-sm">
                        <span>{user?.name || 'Usuario'}</span>
                        <button 
                          onClick={() => unblockUser(userId)}
                          className="text-xs text-[#14b8a6] hover:underline"
                        >
                          Desbloquear
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="text-center text-[10px] text-[#475569] mt-6">EntrenaMatch • Solo para mayores de 18 años • Demo 2026</div>
          </div>
        )}
      </div>

      {/* Bottom Navigation - now with Squads */}
      <div className="h-[62px] border-t border-[#272b33] bg-[#0a0b0f] grid grid-cols-6 z-50 text-[10px]">
        {[
          { id: 'explore' as Tab, label: 'Explorar', icon: Dumbbell },
          { id: 'squads' as Tab, label: 'Squads', icon: Users },
          { id: 'sesiones' as Tab, label: 'Sesiones', icon: Star },
          { id: 'matches' as Tab, label: 'Matches', icon: Heart },
          { id: 'messages' as Tab, label: 'Mensajes', icon: MessageCircle },
          { id: 'profile' as Tab, label: 'Perfil', icon: User },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setActiveTab(id); if (id !== 'messages') setActiveChat(null) }}
            className={`nav-item ${activeTab === id ? 'active' : ''}`}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* FILTERS MODAL */}
      <AnimatePresence>
        {showFilters && (
          <div className="absolute inset-0 z-[70] flex items-end bg-black/70" onClick={() => setShowFilters(false)}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', bounce: 0.05 }}
              onClick={e => e.stopPropagation()} className="w-full card rounded-t-3xl p-6 pb-9">
              <div className="flex justify-between items-center mb-5">
                <div className="font-semibold text-xl">Filtros</div>
                <button onClick={resetFilters} className="text-[#14b8a6] text-sm">Limpiar todo</button>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2"><span>Edad</span> <span>{filters.minAge} - {filters.maxAge}</span></div>
                <div className="flex gap-4 items-center">
                  <input type="range" min="18" max="45" value={filters.minAge} onChange={e => setFilters(f => ({...f, minAge: Math.min(parseInt(e.target.value), f.maxAge - 1)}))} className="flex-1 accent-[#14b8a6]" />
                  <input type="range" min="18" max="45" value={filters.maxAge} onChange={e => setFilters(f => ({...f, maxAge: Math.max(parseInt(e.target.value), f.minAge + 1)}))} className="flex-1 accent-[#14b8a6]" />
                </div>
              </div>

              {/* Distance filter */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Distancia máxima</span> 
                  <span>
                    {userLocation 
                      ? (filters.maxDistanceKm >= 100 ? 'Cualquier distancia' : `${filters.maxDistanceKm} km`) 
                      : 'Activa GPS para usar'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5"
                  value={filters.maxDistanceKm} 
                  onChange={e => setFilters(f => ({...f, maxDistanceKm: parseInt(e.target.value)}))} 
                  className="w-full accent-[#14b8a6]" 
                  disabled={!userLocation}
                />
                <div className="flex justify-between text-[10px] text-[#64748b] mt-1">
                  <span>5 km</span>
                  <span>50 km</span>
                  <span>Cualquier</span>
                </div>
                {!userLocation && (
                  <button 
                    onClick={requestUserLocation}
                    className="mt-2 text-xs w-full py-2 rounded-xl border border-[#14b8a6] text-[#14b8a6] active:bg-[#14b8a6] active:text-black"
                  >
                    Activar ubicación GPS para filtrar por distancia
                  </button>
                )}
              </div>

              {/* Disponible Hoy filter - Unique feature */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.onlyAvailableToday} 
                    onChange={e => setFilters(f => ({...f, onlyAvailableToday: e.target.checked}))}
                    className="w-5 h-5 accent-[#14b8a6]"
                  />
                  <div>
                    <div className="text-sm font-medium">Solo personas disponibles hoy</div>
                    <div className="text-xs text-[#64748b]">Ideal para entrenar el mismo día</div>
                  </div>
                </label>
              </div>

              <div className="mb-6">
                <div className="text-sm mb-2">Me interesa</div>
                <div className="flex gap-2">
                  {(['todos','hombre','mujer'] as const).map(g => (
                    <button key={g} onClick={() => setFilters(f => ({...f, gender: g}))} className={`flex-1 py-2.5 rounded-2xl text-sm border ${filters.gender === g ? 'bg-[#14b8a6] text-black border-[#14b8a6]' : 'border-[#272b33] bg-[#121418]'}`}>
                      {g === 'todos' ? 'Todos' : g === 'hombre' ? 'Hombres' : 'Mujeres'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm mb-2">Tipo de entrenamiento</div>
                <div className="flex flex-wrap gap-2">
                  {TRAINING_OPTIONS.map(t => (
                    <button key={t} onClick={() => toggleFilterTraining(t)} className={`chip text-xs ${filters.trainingTypes.includes(t) ? 'chip-active' : ''}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm mb-2">Disponibilidad</div>
                <div className="flex flex-wrap gap-2">
                  {AVAILABILITY.map(a => (
                    <button key={a} onClick={() => toggleFilterAvailability(a)} className={`chip text-xs ${filters.availability.includes(a) ? 'chip-active' : ''}`}>{a}</button>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowFilters(false)} className="btn-primary w-full mt-8">Aplicar filtros</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE SQUAD MODAL */}
      <AnimatePresence>
        {showCreateSquad && (
          <div className="absolute inset-0 z-[95] flex items-end bg-black/70" onClick={() => setShowCreateSquad(false)}>
            <div onClick={e => e.stopPropagation()} className="w-full card rounded-t-3xl p-6 pb-8">
              <div className="font-semibold text-xl mb-4">Crear un Squad</div>
              <form onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                const newSquad: Squad = {
                  id: 'sq' + Date.now(),
                  name: (form.elements.namedItem('name') as HTMLInputElement).value,
                  focus: (form.elements.namedItem('focus') as HTMLInputElement).value,
                  members: ['me'],
                  createdBy: 'me',
                  createdAt: Date.now()
                }
                const updated = [newSquad, ...squads]
                saveSquads(updated)
                setShowCreateSquad(false)
                toast.success('Squad creado')
              }}>
                <input name="name" placeholder="Nombre del Squad (ej: Beasts de Viña)" required className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3 mb-3" />
                <input name="focus" placeholder="Enfoque (Pesas, Running, Calistenia...)" required className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3 mb-4" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowCreateSquad(false)} className="flex-1 btn-secondary">Cancelar</button>
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
            <div onClick={e => e.stopPropagation()} className="flex-1 flex flex-col max-w-[420px] mx-auto w-full bg-[#0a0b0f] mt-10 rounded-t-3xl overflow-hidden border border-[#272b33]">
              {(() => {
                const squad = squads.find(s => s.id === selectedSquad)
                if (!squad) return null
                const isMember = squad.members.includes('me')

                return (
                  <>
                    <div className="p-4 border-b border-[#272b33] flex justify-between items-center bg-[#121418]">
                      <div>
                        <div className="font-bold text-xl">{squad.name}</div>
                        <div className="text-[#14b8a6] text-sm">{squad.focus} • {squad.members.length}/4 miembros</div>
                      </div>
                      <button onClick={() => setSelectedSquad(null)} className="text-2xl text-[#94a3b8]">×</button>
                    </div>

                    <div className="p-4">
                      <div className="text-sm text-[#94a3b8] mb-2">Miembros</div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {squad.members.map(mid => {
                          const memberProfile = SEED_PROFILES.find(p => p.id === mid)
                          const displayName = memberProfile ? memberProfile.name : (mid === 'me' ? currentUser?.name || 'Tú' : 'Tú')

                          return (
                            <div 
                              key={mid} 
                              className="chip text-xs cursor-pointer active:bg-[#14b8a6] active:text-black"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (memberProfile) {
                                  setSelectedSquad(null)           // close squad modal
                                  setShowFullProfile(memberProfile) // open their profile
                                } else if (mid === 'me') {
                                  setSelectedSquad(null)
                                  // optionally open own profile, but for now just close
                                }
                              }}
                            >
                              {displayName}
                            </div>
                          )
                        })}
                        {squad.members.length < 4 && isMember && (
                          <div className="text-xs text-[#64748b] px-3 py-1">Espacio disponible</div>
                        )}
                      </div>

                      {!isMember && squad.members.length < 4 && (
                        <button 
                          onClick={() => {
                            const updated = squads.map(sq =>
                              sq.id === squad.id ? { ...sq, members: [...sq.members, 'me'] } : sq
                            )
                            saveSquads(updated)
                            toast.success('¡Te uniste al Squad!')
                          }}
                          className="btn-primary w-full mb-4"
                        >
                          Unirme a este Squad
                        </button>
                      )}

                      {isMember && (
                        <>
                          <button 
                            onClick={() => {
                              // Pre-create a session linked to this squad
                              const newSession: TrainingSession = {
                                id: 's' + Date.now(),
                                creatorId: 'me',
                                creatorName: currentUser!.name,
                                title: `Sesión del Squad: ${squad.name}`,
                                time: 'Mañana 19:00',
                                location: squad.focus === 'Running' ? 'Playa Reñaca' : 'Gym cercano',
                                trainingType: squad.focus,
                                maxParticipants: Math.min(6, squad.members.length + 2),
                                participants: [...squad.members],
                                createdAt: Date.now()
                              }
                              const updatedSessions = [newSession, ...sessions]
                              saveSessions(updatedSessions)
                              setSelectedSquad(null)
                              setActiveTab('sesiones')
                              toast.success('Sesión creada para el Squad', { description: 'Ve a la pestaña Sesiones' })
                            }}
                            className="w-full mb-3 text-sm border border-[#14b8a6] text-[#14b8a6] py-2 rounded-2xl"
                          >
                            Crear Sesión del Squad
                          </button>

                          {squad.createdBy !== 'me' && (
                            <button 
                              onClick={() => {
                                const updated = squads.map(sq =>
                                  sq.id === squad.id 
                                    ? { ...sq, members: sq.members.filter(m => m !== 'me') } 
                                    : sq
                                )
                                saveSquads(updated)
                                setSelectedSquad(null)
                                toast('Saliste del Squad')
                              }}
                              className="w-full text-sm text-red-400 py-2"
                            >
                              Dejar el Squad
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {isMember && (
                      <div className="flex-1 flex flex-col border-t border-[#272b33]">
                        <div className="p-3 text-sm font-medium text-[#14b8a6] border-b border-[#272b33]">Chat del Squad</div>
                        <div className="flex-1 overflow-auto p-4 space-y-2 text-sm" id="squad-chat-scroll">
                          {(sessionMessages[squad.id] || []).length === 0 ? (
                            <div className="text-[#64748b] text-center text-xs mt-6">Aún no hay mensajes. ¡Empieza la coordinación!</div>
                          ) : (
                            (sessionMessages[squad.id] || []).map((msg, i) => (
                              <div key={i} className={`flex ${msg.senderId === 'me' ? 'justify-end' : ''}`}>
                                <div className={`max-w-[75%] px-3 py-1.5 rounded-2xl ${msg.senderId === 'me' ? 'bg-[#14b8a6] text-black' : 'bg-[#1f242b]'}`}>
                                  <div className="text-[10px] opacity-70">{msg.senderName}</div>
                                  {msg.text}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="p-3 border-t border-[#272b33]">
                          <form onSubmit={(e) => {
                            e.preventDefault()
                            const input = (e.currentTarget.elements[0] as HTMLInputElement)
                            if (input.value.trim()) {
                              sendSessionMessage(squad.id, input.value)
                              input.value = ''
                            }
                          }} className="flex gap-2">
                            <input type="text" placeholder="Mensaje al squad..." className="flex-1 bg-[#121418] border border-[#272b33] rounded-3xl px-4 py-2 text-sm" />
                            <button type="submit" className="bg-[#14b8a6] text-black px-4 rounded-3xl text-sm">Enviar</button>
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
          <div className="absolute inset-0 z-[95] flex items-end bg-black/70" onClick={() => setShowCreateSession(false)}>
            <div onClick={e => e.stopPropagation()} className="w-full card rounded-t-3xl p-6 pb-8">
              <div className="font-semibold text-xl mb-4">Crear sesión de entrenamiento</div>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                const newSession: TrainingSession = {
                  id: 's' + Date.now(),
                  creatorId: 'me',
                  creatorName: currentUser!.name,
                  title: (form.elements.namedItem('title') as HTMLInputElement).value,
                  time: (form.elements.namedItem('time') as HTMLInputElement).value,
                  location: (form.elements.namedItem('location') as HTMLInputElement).value,
                  trainingType: (form.elements.namedItem('trainingType') as HTMLSelectElement).value,
                  maxParticipants: parseInt((form.elements.namedItem('max') as HTMLInputElement).value),
                  participants: ['me'],
                  createdAt: Date.now()
                }
                const updated = [newSession, ...sessions]
                saveSessions(updated)
                setShowCreateSession(false)

                // Seed initial message from creator
                const creatorMsg: SessionMessage = {
                  id: 'sm_create',
                  senderId: 'me',
                  senderName: currentUser!.name,
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
                  <input name="title" placeholder="Título de la sesión (ej: Pesas en el gym)" required className="w-full bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3" />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input name="time" placeholder="Horario (Mañana 19:00)" required className="bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3" />
                    <input name="location" placeholder="Lugar (Reñaca Playa)" required className="bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <select name="trainingType" required className="bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3">
                      {TRAINING_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input name="max" type="number" min="2" max="12" defaultValue="4" required className="bg-[#121418] border border-[#272b33] rounded-2xl px-4 py-3" />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowCreateSession(false)} className="flex-1 btn-secondary">Cancelar</button>
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
                <div className="text-sm text-[#94a3b8] mt-1">Tu reseña ayuda a otros a confiar</div>
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
                className="w-full bg-[#121418] border border-[#272b33] rounded-2xl p-4 text-sm h-24 resize-none mb-4"
              />

              {/* Photo upload for the session - Unique feature */}
              <div className="mb-4">
                <label className="text-xs text-[#94a3b8] mb-1 block">Foto de la sesión (opcional)</label>
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
                    <img src={reviewPhoto} className="w-24 h-24 object-cover rounded-xl border border-[#272b33]" alt="Preview" />
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
                <button onClick={() => { setShowReviewModalFor(null); setReviewPhoto(null) }} className="flex-1 btn-secondary">Cancelar</button>
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
              onClick={e => e.stopPropagation()} className="match-modal rounded-3xl max-w-[340px] w-full overflow-hidden border border-[#272b33]">
              <div className="p-8 text-center">
                <div className="text-[#14b8a6] font-semibold tracking-[3px] text-sm mb-1">¡ES UN MATCH!</div>
                <div className="text-3xl font-semibold tracking-tight mb-4">Tú y {showMatchModal.name} quieren entrenar juntos</div>
                
                <div className="flex justify-center -space-x-4 mb-6">
                  <img src={currentUser?.photos?.[0] || 'https://picsum.photos/id/1005/80/80'} className="w-20 h-20 rounded-full border-4 border-[#121418] object-cover z-10" />
                  <img src={showMatchModal.photos[0]} className="w-20 h-20 rounded-full border-4 border-[#121418] object-cover" />
                </div>

                <div className="text-sm text-[#94a3b8] mb-6">Ambos están en {showMatchModal.city}, {showMatchModal.country}. ¡Escríbele ya!</div>
                {userLocation && (
                  <div className="text-[#14b8a6] text-sm font-medium -mt-4 mb-6">
                    Están a {getDistanceKm(userLocation.lat, userLocation.lng, showMatchModal.lat, showMatchModal.lng)} km
                  </div>
                )}

                <div className="space-y-3">
                  <button onClick={() => closeMatchModal(true)} className="btn-primary w-full text-base">Enviar mensaje ahora</button>
                  <button onClick={() => closeMatchModal(false)} className="w-full py-3 text-sm text-[#94a3b8]">Seguir explorando</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULL PROFILE VIEW */}
      <AnimatePresence>
        {showFullProfile && (
          <div className="absolute inset-0 z-[90] bg-[#0a0b0f] flex flex-col" onClick={() => setShowFullProfile(null)}>
            <div className="p-4 flex items-center justify-between border-b border-[#272b33]">
              <button onClick={() => setShowFullProfile(null)}><ArrowLeft /></button>
              <div className="font-medium">Perfil completo</div>
              <div />
            </div>
            <div className="overflow-auto flex-1">
              <div className="relative">
                <img src={showFullProfile.photos[0]} className="w-full aspect-square object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black">
                  <div className="text-4xl font-semibold tracking-[-1.5px]">{showFullProfile.name}, {showFullProfile.age}</div>
                  <div className="flex gap-2 mt-1 text-[#14b8a6]">
                    <MapPin size={18} /> {showFullProfile.city}, {showFullProfile.country}
                    {showFullProfile.verificationStatus === 'verified' && <span className="text-[#22c55e] text-sm">✓ Verificado</span>}
                  </div>
                  {userLocation && (
                    <div className="mt-1 text-sm text-[#14b8a6] font-medium">
                      A {getDistanceKm(userLocation.lat, userLocation.lng, showFullProfile.lat, showFullProfile.lng)} km de ti
                    </div>
                  )}
                  {currentUser && (
                    <div className="mt-2 inline-block bg-[#14b8a6] text-black px-3 py-1 rounded-full text-sm font-bold">
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

                  {/* Photos from past sessions */}
                  {reviews[showFullProfile.id]?.some(r => r.photo) && (
                    <div className="mt-3">
                      <div className="text-xs text-[#64748b] mb-1">Sesiones juntos</div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {reviews[showFullProfile.id]?.filter(r => r.photo).map((r, idx) => (
                          <img key={idx} src={r.photo} className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-[#272b33]" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 space-y-6">
                <div>
                  <div className="uppercase text-xs tracking-widest text-[#64748b] mb-1.5">BIOGRAFÍA</div>
                  <p className="leading-snug">{showFullProfile.bio}</p>
                </div>
                <div>
                  <div className="uppercase text-xs tracking-widest text-[#64748b] mb-2">ENTRENA</div>
                  <div className="flex flex-wrap gap-2">{showFullProfile.trainingTypes.map(t => <div key={t} className="chip">{t}</div>)}</div>
                </div>
                <div>
                  <div className="uppercase text-xs tracking-widest text-[#64748b] mb-2">OBJETIVOS</div>
                  <div className="flex flex-wrap gap-2">{showFullProfile.goals.map(g => <div key={g} className="chip chip-active">{g}</div>)}</div>
                </div>

                {/* Squads membership - Polished feature */}
                {(() => {
                  const userSquads = squads.filter(sq => sq.members.includes(showFullProfile.id))
                  if (userSquads.length === 0) return null
                  return (
                    <div>
                      <div className="uppercase text-xs tracking-widest text-[#64748b] mb-2">SQUADS</div>
                      <div className="flex flex-wrap gap-2">
                        {userSquads.map(sq => (
                          <div 
                            key={sq.id} 
                            onClick={() => { setSelectedSquad(sq.id); setActiveTab('squads') }}
                            className="chip cursor-pointer hover:bg-[#14b8a6] hover:text-black active:scale-95 transition"
                          >
                            {sq.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
                <div className="grid grid-cols-2 gap-x-4 text-sm">
                  <div><span className="text-[#64748b]">Nivel</span><br />{showFullProfile.level}</div>
                  <div><span className="text-[#64748b]">Disponible</span><br />{showFullProfile.availability.join(', ')}</div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#272b33] flex gap-3">
              <button onClick={() => { setShowFullProfile(null); handleSwipe(showFullProfile.id, 'left') }} className="flex-1 btn-secondary">Pasar</button>
              <button onClick={() => { setShowFullProfile(null); handleSwipe(showFullProfile.id, 'right') }} className="flex-1 btn-primary">Me interesa</button>
            </div>

            {/* Safety actions - Critical for launch */}
            <div className="p-4 border-t border-[#272b33] flex gap-3 text-sm">
              <button 
                onClick={() => {
                  const reason = prompt('¿Por qué quieres reportar a esta persona? (acoso, perfil falso, comportamiento inadecuado, etc.)')
                  if (reason) {
                    reportUser(showFullProfile.id, reason, undefined, 'profile')
                    setShowFullProfile(null)
                  }
                }}
                className="flex-1 py-2 text-red-400 border border-red-900 rounded-2xl hover:bg-red-950"
              >
                Reportar
              </button>
              <button 
                onClick={() => {
                  if (confirm(`¿Bloquear a ${showFullProfile.name}? No volverás a verlo.`)) {
                    blockUser(showFullProfile.id)
                    setShowFullProfile(null)
                  }
                }}
                className="flex-1 py-2 text-red-400 border border-red-900 rounded-2xl hover:bg-red-950"
              >
                Bloquear
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* LEGAL PAGES */}
      <AnimatePresence>
        {showLegal && (
          <div className="absolute inset-0 z-[100] bg-[#0a0b0f] flex flex-col">
            <div className="h-14 px-4 flex items-center gap-3 border-b border-[#272b33] bg-[#0a0b0f]">
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
                  <p><strong>Reglas básicas de EntrenaMatch:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Sé respetuoso en todo momento.</li>
                    <li>No uses la plataforma con fines románticos o sexuales.</li>
                    <li>Los primeros encuentros deben ser en lugares públicos (gimnasios, parques, playas, etc.).</li>
                    <li>No acoses, no envíes mensajes no solicitados repetidamente.</li>
                    <li>Reporta cualquier comportamiento inadecuado.</li>
                    <li>Solo personas mayores de 18 años.</li>
                  </ul>
                  <p>El incumplimiento de estas normas puede resultar en la suspensión permanente de la cuenta.</p>
                  <p>Entrena con responsabilidad. Tu seguridad es lo primero.</p>
                </>
              )}
            </div>
            <div className="p-4 border-t border-[#272b33]">
              <div className="text-[10px] text-[#64748b] text-center mb-3">
                Versión {showLegal === 'terms' ? LEGAL_VERSIONS.terms : 
                         showLegal === 'privacy' ? LEGAL_VERSIONS.privacy : 
                         LEGAL_VERSIONS.community} • Última actualización: {LEGAL_VERSIONS.lastUpdated}
              </div>
              <button onClick={() => setShowLegal(null)} className="btn-primary w-full">Cerrar</button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* VERIFICATION FLOW MODAL - Multi-step serious process */}
      <AnimatePresence>
        {showVerificationFlow && currentUser && (
          <div className="absolute inset-0 z-[130] flex items-end bg-black/80" onClick={() => setShowVerificationFlow(false)}>
            <div 
              onClick={e => e.stopPropagation()} 
              className="w-full bg-[#0a0b0f] rounded-t-3xl p-6 max-h-[90vh] overflow-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="font-bold text-2xl">Verificación de identidad</div>
                  <div className="text-sm text-[#94a3b8]">Paso {verificationStep} de 3</div>
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
                    <div className="bg-[#121418] p-4 rounded-2xl text-sm space-y-2">
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
                    <p className="text-sm text-[#94a3b8] mb-4">Sube una foto de tu cédula, pasaporte o licencia (solo el frente).</p>
                  </div>

                  {!verificationIdPhoto ? (
                    <label className="block border-2 border-dashed border-[#272b33] rounded-3xl p-8 text-center cursor-pointer mb-6">
                      <div className="text-4xl mb-2">🪪</div>
                      <div className="font-medium">Subir documento</div>
                      <div className="text-xs text-[#64748b]">JPG o PNG</div>
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
                    <p className="text-sm text-[#94a3b8] mb-4">Tómate una selfie sosteniendo tu documento (o solo tu rostro).</p>
                  </div>

                  {!verificationSelfie ? (
                    <label className="block border-2 border-dashed border-[#272b33] rounded-3xl p-8 text-center cursor-pointer mb-6">
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
                  <p className="text-[10px] text-center text-[#64748b] mt-3">Tus documentos se revisarán de forma segura.</p>
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
            <div onClick={e => e.stopPropagation()} className="flex-1 bg-[#0a0b0f] max-w-[420px] mx-auto w-full mt-4 rounded-t-3xl overflow-hidden border border-[#272b33] flex flex-col">
              
              {/* Header */}
              <div className="p-4 border-b border-[#272b33] bg-[#121418] flex items-center justify-between">
                <div>
                  <div className="font-bold text-xl">Panel de Moderación</div>
                  <div className="text-xs text-[#94a3b8]">Simulado para preparación de lanzamiento</div>
                </div>
                <button onClick={() => setShowModerationPanel(false)} className="text-2xl">×</button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#272b33] bg-[#121418]">
                {[
                  { key: 'reports', label: 'Reportes' },
                  { key: 'verifications', label: 'Verificaciones' },
                  { key: 'bans', label: 'Baneados' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setModerationTab(tab.key as any)}
                    className={`flex-1 py-3 text-sm font-medium ${moderationTab === tab.key ? 'text-[#14b8a6] border-b-2 border-[#14b8a6]' : 'text-[#94a3b8]'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-auto p-4">
                
                {/* Reports Tab */}
                {moderationTab === 'reports' && (
                  <div>
                    <div className="text-sm text-[#94a3b8] mb-3">Reportes enviados por ti ({reports.length})</div>
                    {reports.length === 0 ? (
                      <div className="text-center text-[#64748b] py-8 text-sm">Aún no has realizado reportes.</div>
                    ) : (
                      reports.slice().reverse().map(report => {
                        const reported = SEED_PROFILES.find(p => p.id === report.reportedUserId)
                        return (
                          <div key={report.id} className="card p-3 mb-3 rounded-2xl text-sm">
                            <div className="flex justify-between">
                              <div>
                                <div>Reportado: <span className="font-semibold">{reported?.name}</span></div>
                                <div className="text-xs text-[#94a3b8]">Motivo: {report.reason}</div>
                                {report.details && <div className="text-xs mt-1">"{report.details}"</div>}
                              </div>
                              <div className="text-[10px] text-[#64748b] text-right">
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
                    <div className="text-sm text-[#94a3b8] mb-3">Verificaciones pendientes ({pendingVerifications.length})</div>
                    {pendingVerifications.length === 0 ? (
                      <div className="text-center text-[#64748b] py-8 text-sm">No hay verificaciones pendientes.</div>
                    ) : (
                      pendingVerifications.map((v, index) => (
                        <div key={index} className="card p-4 mb-4 rounded-2xl">
                          <div className="font-semibold mb-1">{v.name}, {v.age} • {v.city}</div>
                          <div className="flex gap-2 mb-3">
                            <div>
                              <div className="text-[10px] text-[#64748b]">Documento</div>
                              <img src={v.idPhoto} className="w-20 h-14 object-cover rounded border border-[#272b33]" />
                            </div>
                            <div>
                              <div className="text-[10px] text-[#64748b]">Selfie</div>
                              <img src={v.selfiePhoto} className="w-14 h-14 object-cover rounded border border-[#272b33]" />
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
                    <div className="text-sm text-[#94a3b8] mb-3">Usuarios baneados ({blockedUsers.length})</div>
                    {blockedUsers.length === 0 ? (
                      <div className="text-center text-[#64748b] py-8 text-sm">No hay usuarios baneados.</div>
                    ) : (
                      blockedUsers.map(userId => {
                        const user = SEED_PROFILES.find(p => p.id === userId)
                        return (
                          <div key={userId} className="flex justify-between items-center card p-3 mb-2 rounded-2xl">
                            <span>{user?.name || 'Usuario desconocido'}</span>
                            <button 
                              onClick={() => unblockUser(userId)}
                              className="text-xs text-[#14b8a6]"
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

              <div className="p-4 border-t border-[#272b33] text-[10px] text-[#64748b] text-center">
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
              className="w-full max-w-[420px] bg-[#0a0b0f] rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col h-[85vh] md:h-[620px] border border-[#272b33]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-[#272b33] bg-[#121418] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">
                    {sessions.find(s => s.id === showGroupChatModalFor)?.title}
                  </div>
                  <div className="text-xs text-[#14b8a6]">
                    Chat grupal • {sessions.find(s => s.id === showGroupChatModalFor)?.participants.length} participantes
                  </div>
                </div>
                <button onClick={() => setShowGroupChatModalFor(null)} className="text-2xl leading-none text-[#94a3b8] hover:text-white">×</button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Participants Sidebar */}
                <div className="w-28 border-r border-[#272b33] bg-[#121418] p-2 overflow-auto text-xs">
                  <div className="text-[#64748b] text-[10px] px-1 mb-1.5 font-medium">PARTICIPANTES</div>
                  {(sessions.find(s => s.id === showGroupChatModalFor)?.participants || []).map((pid, idx) => {
                    const name = pid === 'me' ? currentUser.name : (SEED_PROFILES.find(p => p.id === pid)?.name || 'Participante')
                    return (
                      <button 
                        key={idx}
                        onClick={() => {
                          const mention = `@${name.split(' ')[0]} `
                          setChatInputValue(prev => prev + mention)
                        }}
                        className="block w-full text-left px-2 py-1 hover:bg-[#1f242b] rounded text-[#cbd5e1] truncate"
                      >
                        {name}
                      </button>
                    )
                  })}
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-auto p-4 space-y-3 text-sm" id="group-chat-scroll">
                    {(sessionMessages[showGroupChatModalFor] || []).length === 0 ? (
                      <div className="text-center text-[#64748b] mt-8 text-xs">Aún no hay mensajes en este grupo.</div>
                    ) : (
                      (sessionMessages[showGroupChatModalFor] || []).map((msg, i) => {
                        const isMe = msg.senderId === 'me'
                        const isCreator = sessions.find(s => s.id === showGroupChatModalFor)?.creatorId === msg.senderId
                        return (
                          <div key={i} className={`flex ${isMe ? 'justify-end' : ''}`}>
                            <div className={`max-w-[78%] group ${isMe ? 'text-right' : ''}`}>
                              <div className="text-[10px] text-[#64748b] mb-0.5 px-1 flex items-center gap-1 justify-end">
                                {isCreator && <span className="text-[#14b8a6]">★</span>}
                                {msg.senderName}
                              </div>
                              <div className={`px-3 py-2 rounded-2xl inline-block ${isMe ? 'bg-[#14b8a6] text-black' : 'bg-[#1f242b]'}`}>
                                {msg.text}
                                {msg.photo && <img src={msg.photo} className="mt-2 max-w-[180px] rounded-lg" />}
                              </div>

                              {/* Reactions */}
                              <div className="flex gap-1 mt-1 text-xs">
                                {['👍', '🔥', '💪', '👏'].map(emoji => {
                                  const reactors = msg.reactions?.[emoji] || []
                                  const hasReacted = reactors.includes(currentUser.name)
                                  return (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        const updated = { ...sessionMessages }
                                        const msgs = updated[showGroupChatModalFor] || []
                                        const targetMsg = { ...msgs[i] }
                                        targetMsg.reactions = { ...(targetMsg.reactions || {}) }

                                        if (!targetMsg.reactions[emoji]) targetMsg.reactions[emoji] = []

                                        if (hasReacted) {
                                          targetMsg.reactions[emoji] = targetMsg.reactions[emoji].filter(n => n !== currentUser.name)
                                        } else {
                                          targetMsg.reactions[emoji].push(currentUser.name)
                                        }

                                        msgs[i] = targetMsg
                                        saveSessionMessages(updated)
                                      }}
                                      className={`px-1.5 py-0.5 rounded ${hasReacted ? 'bg-[#14b8a6]/30' : 'hover:bg-[#1f242b]'}`}
                                    >
                                      {emoji}{reactors.length > 0 ? ` ${reactors.length}` : ''}
                                    </button>
                                  )
                                })}
                              </div>

                              {/* Delete button - only for creator */}
                              {sessions.find(s => s.id === showGroupChatModalFor)?.creatorId === 'me' && (
                                <button 
                                  onClick={() => {
                                    const updated = { ...sessionMessages }
                                    updated[showGroupChatModalFor] = updated[showGroupChatModalFor].filter((_, idx) => idx !== i)
                                    saveSessionMessages(updated)
                                  }}
                                  className="text-[10px] text-[#ef4444] opacity-0 group-hover:opacity-100 ml-2"
                                >
                                  eliminar
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}

                    {/* Typing indicator */}
                    {isTyping && (
                      <div className="flex items-center gap-2 text-[#94a3b8] text-xs px-2 mt-1">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-[#94a3b8] rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-[#94a3b8] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-1.5 h-1.5 bg-[#94a3b8] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                        <span>Alguien está escribiendo...</span>
                      </div>
                    )}
                  </div>

                  {/* Input + Photo for group chat */}
                  <div className="p-3 border-t border-[#272b33] bg-[#0a0b0f]">
                    {groupChatPhoto && (
                      <div className="mb-2 flex items-center gap-2">
                        <img src={groupChatPhoto} className="w-12 h-12 object-cover rounded-lg" />
                        <button onClick={() => setGroupChatPhoto(null)} className="text-xs text-red-400">Quitar foto</button>
                      </div>
                    )}

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault()
                        if ((chatInputValue.trim() || groupChatPhoto) && showGroupChatModalFor) {
                          sendSessionMessage(showGroupChatModalFor, chatInputValue, groupChatPhoto)
                          setChatInputValue('')
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input 
                        type="text" 
                        value={chatInputValue}
                        onChange={(e) => setChatInputValue(e.target.value)}
                        placeholder="Escribe al grupo... (usa @ para mencionar)"
                        className="flex-1 bg-[#121418] border border-[#272b33] rounded-3xl px-4 py-3 text-sm outline-none" 
                      />

                      {/* Photo upload button for chat */}
                      <label className="cursor-pointer flex items-center justify-center bg-[#121418] border border-[#272b33] px-3 rounded-3xl text-sm hover:bg-[#1f242b]">
                        📷
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = () => setGroupChatPhoto(reader.result as string)
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>

                      <button type="submit" className="bg-[#14b8a6] text-black px-5 rounded-3xl font-medium text-sm">Enviar</button>
                    </form>
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
              className="flex-1 bg-[#0a0b0f] max-w-[420px] mx-auto w-full mt-14 rounded-t-3xl border border-[#272b33] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#272b33] flex justify-between items-center bg-[#121418]">
                <div className="font-semibold">Notificaciones</div>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => {
                      const allRead = notifications.map(n => ({...n, read: true}))
                      saveNotifications(allRead)
                    }}
                    className="text-xs text-[#14b8a6]"
                  >
                    Marcar todo como leído
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#94a3b8]">
                    No tienes notificaciones aún.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-4 border-b border-[#272b33] ${!notif.read ? 'bg-[#121418]' : ''}`}
                      onClick={() => {
                        const updated = notifications.map(n => 
                          n.id === notif.id ? {...n, read: true} : n
                        )
                        saveNotifications(updated)

                        // Navigate based on type
                        if (notif.type === 'match' && notif.relatedId) {
                          setShowNotifications(false)
                          setActiveTab('messages')
                          setActiveChat(notif.relatedId)
                        }
                        if (notif.type === 'session_join' && notif.relatedId) {
                          setShowNotifications(false)
                          setActiveTab('sesiones')
                        }
                        if (notif.type === 'squad_join' && notif.relatedId) {
                          setShowNotifications(false)
                          setActiveTab('squads')
                          setSelectedSquad(notif.relatedId)
                        }
                      }}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium text-sm">{notif.title}</div>
                        <div className="text-[10px] text-[#64748b]">
                          {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <div className="text-sm text-[#cbd5e1] mt-0.5">{notif.body}</div>
                      {!notif.read && <div className="w-2 h-2 bg-[#14b8a6] rounded-full mt-2"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default App
