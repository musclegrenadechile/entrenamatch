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
}

export interface Message {
  id: string
  from: 'me' | 'them'
  text: string
  timestamp: number
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
}

export interface SessionMessage {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: number
  photo?: string
  reactions?: Record<string, string[]>
}

export interface Squad {
  id: string
  name: string
  focus: string
  members: string[]
  createdBy: string
  createdAt: number
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
  type: 'match' | 'session_join' | 'squad_join' | 'verification' | 'group_message' | 'report' | 'message'
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

export type Tab = 'explore' | 'squads' | 'sesiones' | 'matches' | 'messages' | 'profile'

export interface ProfilePost {
  id: string
  userId: string
  text: string
  photo?: string
  timestamp: number
  likes: string[] // list of userIds who liked
  comments: Array<{
    id: string
    userId: string
    userName: string
    text: string
    timestamp: number
  }>
}
