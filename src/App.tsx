// @ts-nocheck
import { useState, useEffect, useMemo, useCallback, useRef, Component, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, MessageCircle, User, MapPin, Dumbbell, 
  Edit2, RefreshCw, ArrowLeft, Send, Star, Plus, Users, Bell, Download,
  Clock, Camera, Activity, Zap
} from 'lucide-react'
import { 
  signUpWithEmail, 
  signInWithEmail, 
  createUserProfile,
  updateUserProfile,
  getUserProfile,
  logout
} from './services/auth'
import { storage } from './services/firebase'
import { useAuth } from './contexts/AuthContext'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

// ==================== REFACTORED IMPORTS ====================
import type { 
  Profile, Message, TrainingSession, TrainingReview, 
  SessionMessage, Squad, Report, Notification, CurrentUser, Tab,
  ProfilePost
} from './types'
import { 
  TRAINING_OPTIONS, AVAILABILITY, LEGAL_VERSIONS, AUTO_MATCH_IDS 
} from './constants'

// Capacitor plugins are loaded via a separate module that is only analyzed in CAPACITOR builds.
// This prevents Vite/Rolldown from ever trying to resolve @capacitor/* packages during pure web builds
// (Firebase --base=/ , GH Pages, dev server) → eliminates the "failed to resolve import" errors.
let CapacitorCamera: any = null
let PushNotifications: any = null
let PlayIntegrityNative: any = null

if (__CAPACITOR_BUILD__) {
  // The specifier is a define placeholder replaced at build time with the real path only for CAP builds.
  // Web builds get a dummy data URL, so no loader module is ever analyzed/resolved in web builds.
  import(CAPACITOR_PLUGINS_LOADER).then(() => {
    const plugins = (typeof window !== 'undefined' && (window as any).__CAPACITOR_PLUGINS__) || {}
    CapacitorCamera = plugins.Camera || null
    PushNotifications = plugins.PushNotifications || null
    PlayIntegrityNative = plugins.PlayIntegrity || null
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
import { useDemoAuth } from './hooks/useDemoAuth'
import { useProfile } from './hooks/useProfile'
import { useFilters } from './hooks/useFilters'
import { useSquads } from './hooks/useSquads'
import { ExploreTab } from './components/explore/ExploreTab'
import { AuthScreen } from './components/auth/AuthScreen'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { db, isFirebaseConfigured } from './services/firebase'
import { requestPlayIntegrityToken, hasPositiveIntegrity, getLastIntegrityResult } from './services/playIntegrity'
import { Capacitor } from '@capacitor/core'
import { collection, query, where, getDocs, orderBy, limit, doc, onSnapshot } from 'firebase/firestore'

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
      e.preventDefault()
      setDeferredInstallPrompt(e)
      // Show banner only if not previously dismissed and after some engagement
      if (!localStorage.getItem('entrenamatch_pwa_dismissed')) {
        // Much shorter delay for visibility (was 28s, too long for testers)
        setTimeout(() => {
          if (!localStorage.getItem('entrenamatch_pwa_dismissed')) {
            setShowPwaInstall(true)
          }
        }, 5000) // 5s after load
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
  const [isLoadingFeed, setIsLoadingFeed] = useState(false)
  const [feedShowPinnedOnly, setFeedShowPinnedOnly] = useState(false)
  const [feedSearch, setFeedSearch] = useState('')
  const [feedOnlyReal, setFeedOnlyReal] = useState(false)
  const [feedOnlyLive, setFeedOnlyLive] = useState(false)
  const [feedMaxProfiles, setFeedMaxProfiles] = useState(15)
  const [feedDisplayLimit, setFeedDisplayLimit] = useState(10)
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
  // DISRUPTIVE EntrenaSync (v0.2.0 killer): shared real-time synced training - turns live presence into "training together" experience (completely unique vs market async buddies)
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
  // NEVER-BEFORE-SEEN UNIQUENESS LAYER — EntrenaSync Arena
  // "Training together" becomes a shared ritual no other app has:
  // real-time co-presence with flying actions, combos, energy orbs,
  // dual avatars + tether, auto-generated shared story posts to BOTH
  // muros, persistent Sync Legends / bonds that unlock visibility +
  // special effects, global FOMO of active pairs everywhere, replayable
  // session memories. This is the disruptive soul that makes EntrenaMatch
  // unforgettable and truly unique in the entire market.
  // =====================================================
  const [syncCombo, setSyncCombo] = useState(0)
  const [flyingEmojis, setFlyingEmojis] = useState<any[]>([]) // {id, emoji, label}
  const [showSyncArena, setShowSyncArena] = useState(false)
  const [syncBonds, setSyncBonds] = useState<Record<string, {totalMin: number, sessions: number, avgRating: number, bondLevel: number}>>({})
  const [lastSyncStory, setLastSyncStory] = useState<any>(null)
  const [replaySession, setReplaySession] = useState<any>(null) // {partnerName, minutes, vibe, actions, rating?}
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
  const [showPreAlphaWelcome, setShowPreAlphaWelcome] = useState(() => {
    return !localStorage.getItem('entrenamatch_prealpha_welcome_shown')
  })

  // Onboarding step state (managed here so the flow actually advances)
  const [onboardingStep, setOnboardingStepLocal] = useState(0)

  // Quick demo entry from AuthScreen "⚡ Probar demo al instante" (key for public GH Pages review + lets people hit the improved onboarding fast)
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

  // Training Sessions (unique feature)
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [selectedTrainingType, setSelectedTrainingType] = useState('Pesas/Gym')
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  const closeCreateSession = () => {
    setShowCreateSession(false)
    setSelectedTrainingType('Pesas/Gym')
  }

  // Helper to remove undefined fields before Firestore writes (Firestore rejects undefined values in data)
  const sanitizeForFirestore = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const clean = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        clean[key] = obj[key];
      }
    });
    return clean;
  }

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

  // Squads feature (fixed small training groups)
  const [squads, setSquads] = useState<Squad[]>([])

  // Profile Muro / Wall posts - makes profiles feel alive (like FB wall)
  const [profilePosts, setProfilePosts] = useState<Record<string, ProfilePost[]>>({}) // userId -> posts array
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

  // Editing own post in muro (spectacular: inline edit without ugly prompts)
  const [editingPost, setEditingPost] = useState<{postId: string; postUserId: string; text: string} | null>(null)
  const [editDraft, setEditDraft] = useState('')

  // Ref for focusing composer from empty state CTA
  const muroComposerRef = useRef<HTMLTextAreaElement>(null)
  // Ref for hidden file input for attractive photo upload in muro composer (web)
  const muroPhotoInputRef = useRef<HTMLInputElement>(null)
  // Ref for feed post modal photo (same attractive file picker)
  const feedPhotoInputRef = useRef<HTMLInputElement>(null)

  // Attractive web file photo handler for muro composer (replaces ugly prompt)
  const handleMuroPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleFeedPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Moderation Panel state
  const [showModerationPanel, setShowModerationPanel] = useState(false)
  const [moderationTab, setModerationTab] = useState<'reports' | 'verifications' | 'bans'>('reports')

  // Auth flow state (default to register in public demo for easy "Crear Cuenta")
  // (local auth state moved into AuthScreen + useDemoAuth)

  // Notifications system (simulated for launch readiness)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  // Notification preferences (local per-device for user control - progressive improvement post-crash-fix)
  const [notifPrefs, setNotifPrefs] = useState<{messages: boolean, live: boolean, muro: boolean}>(() => {
    try {
      const saved = localStorage.getItem('entrenamatch_notif_prefs')
      return saved ? JSON.parse(saved) : { messages: true, live: true, muro: true }
    } catch {
      return { messages: true, live: true, muro: true }
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

  const unreadNotifications = notifications.filter(n => !n.read).length
  const totalChatUnreads = Object.values(chatUnreads).reduce((sum, n) => sum + (n || 0), 0)
  const totalSessionUnreads = Object.values(sessionUnreads).reduce((sum, n) => sum + (n || 0), 0)

  // Real Auth from Firebase + Demo Auth
  const { currentUser: firebaseUser, userProfile: firebaseProfile, isDemoMode } = useAuth()
  const { 
    signInDemo, 
    signUpDemo, 
    isAuthenticated: isDemoAuthenticated 
  } = useDemoAuth()

  // ============================================================
  // REAL MULTI-USER STATE - DECLARED AS EARLY AS POSSIBLE TO AVOID TDZ
  // ============================================================
  const effectiveUserId = !isDemoMode && firebaseUser?.uid ? firebaseUser.uid : 'me'

  const [realProfiles, setRealProfiles] = useState<Profile[]>([])
  const [realMatches, setRealMatches] = useState<string[]>([])
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
  const [realSessions, setRealSessions] = useState<TrainingSession[]>([])

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

  // Beta Feedback enhanced (Phase 0 - structured + history)
  const [feedbackType, setFeedbackType] = useState<'bug' | 'idea' | 'ux' | 'other'>('idea')
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackText, setFeedbackText] = useState('')
  const [myFeedbacks, setMyFeedbacks] = useState<any[]>([])
  const [loadingMyFeedbacks, setLoadingMyFeedbacks] = useState(false)

  // Simple last sync time for polish in Explore/Sessions/Profile
  const [lastSync, setLastSync] = useState<Date | null>(null)
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

  // EntrenaSync real-time mirror: when in sync, pull partner's latest syncActions and state from realProfiles (via periodic load or on change)
  // Placed here AFTER all dependent states (realProfiles, effectiveUserId, currentUser local from saveUser) to avoid TDZ or init order issues in render/bundler.
  useEffect(() => {
    if (currentUser?.trainingSyncWith && currentUser.trainingNow) {
      const partner = realProfiles.find(p => p.id === currentUser.trainingSyncWith)
      if (partner && partner.trainingSyncWith === effectiveUserId) {
        if (partner.syncStartedAt) setSyncStartedAt(partner.syncStartedAt)
        if (partner.syncActions && partner.syncActions.length > syncActions.length) {
          setSyncActions(partner.syncActions)
        }
      } else if (partner && !partner.trainingSyncWith) {
        // partner ended sync
        setSyncPartnerId(null)
        setSyncStartedAt(null)
        setSyncActions([])
      }
    }
  }, [realProfiles, currentUser?.trainingSyncWith, currentUser?.trainingNow, effectiveUserId])

  // === NEW: Dedicated syncSessions collection listener for INSTANT actions across devices ===
  // When we have an active EntrenaSync (syncPartnerId), we listen to a stable doc for the pair.
  // This gives true realtime (onSnapshot push) for doSyncAction without waiting for profile polls.
  // We still keep trainingSyncWith pointer in profiles for discovery/badges across Feed/Explore/Live.
  useEffect(() => {
    if (!syncPartnerId || !effectiveUserId || !db || isDemoMode || !isFirebaseConfigured) return undefined

    const uids = [effectiveUserId, syncPartnerId].sort()
    const sessionId = `sync_${uids[0]}_${uids[1]}`
    const sessionRef = doc(db, 'syncSessions', sessionId)

    const unsub = onSnapshot(sessionRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any
        if (Array.isArray(data.actions)) {
          // Keep last 10, newest first for UI
          const recent = [...data.actions]
            .sort((a: any, b: any) => (b.at || 0) - (a.at || 0))
            .slice(0, 10)
          setSyncActions(recent)

          // Unique magic: if the latest action came from the partner, give strong in-app feedback
          const latest = recent[0]
          if (latest && latest.userId !== effectiveUserId) {
            // Prominent toast so you feel your partner "with you" even if not looking at the panel
            toast(`${latest.emoji} ${latest.label}`, {
              description: `${realProfiles.find(p => p.id === syncPartnerId)?.name || 'Tu compañero'} lo hizo ahora`,
              duration: 2200,
            })
            // Small global pulse feel (we can enhance with a state later)
            triggerHaptic('light')
          }
        }
        if (data.startedAt) {
          setSyncStartedAt(data.startedAt)
        }
        if (typeof data.vibe === 'number') {
          setSyncVibe(Math.max(0, Math.min(100, data.vibe)))
        }
      }
    }, (err) => {
      console.warn('syncSessions onSnapshot error (non-fatal, fallback to mirror):', err)
    })

    return () => {
      try { unsub() } catch {}
    }
  }, [syncPartnerId, effectiveUserId, db, isDemoMode, isFirebaseConfigured])

  const loadActiveSyncCount = async () => {
    if (!isFirebaseConfigured || !db) {
      setActiveSyncCount(0)
      setActiveSyncPairs([])
      return
    }
    try {
      const ref = collection(db, 'syncSessions')
      const snap = await getDocs(query(ref, limit(80)))
      const now = Date.now()
      let count = 0
      const pairs: any[] = []
      snap.forEach(d => {
        const data = d.data() as any
        const started = data.startedAt || 0
        const ended = data.endedAt || 0
        const isActive = !ended && (now - started < 3 * 60 * 60 * 1000)
        if (isActive) {
          count++
          if (pairs.length < 2 && data.participants?.length === 2) {
            const [u1, u2] = data.participants
            const p1 = realProfiles.find(pp => pp.id === u1) || SEED_PROFILES.find(pp => pp.id === u1)
            const p2 = realProfiles.find(pp => pp.id === u2) || SEED_PROFILES.find(pp => pp.id === u2)
            if (p1 && p2) pairs.push({ names: `${p1.name.split(' ')[0]} + ${p2.name.split(' ')[0]}`, vibe: data.vibe || 50 })
          }
        }
      })
      setActiveSyncCount(count)
      if (pairs.length) setActiveSyncPairs(pairs)
    } catch (e) {
      // non-fatal
    }
  }

  const loadRealSessions = async () => {
    if (!isFirebaseConfigured || !db) {
      setRealSessions([])
      return
    }
    try {
      const sessionsRef = collection(db, 'sessions')
      // Order by creation time desc so newest sessions appear first for everyone
      const q = query(sessionsRef, orderBy('createdAt', 'desc'), limit(50))
      const snapshot = await getDocs(q)
      const loaded: TrainingSession[] = []
      snapshot.forEach((doc) => {
        const data = doc.data() as any
        if (data && data.title) {
          loaded.push({
            id: doc.id,
            creatorId: data.creatorId || '',
            creatorName: data.creatorName || 'Usuario',
            title: data.title,
            description: data.description || '',
            time: data.time || '',
            location: data.location || '',
            trainingType: data.trainingType || '',
            maxParticipants: data.maxParticipants || 4,
            participants: data.participants || [],
            createdAt: (data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt) || Date.now(),
            lastMessagePreview: data.lastMessagePreview || undefined,
            lastMessageAt: data.lastMessageAt?.toMillis ? data.lastMessageAt.toMillis() : data.lastMessageAt,
          })
        }
      })
      setRealSessions(loaded)
      const now = new Date()
      setLastSync(now)
      // console.log removed for production cleanliness (spammy on refresh)
    } catch (err) {
      console.warn('Could not load real sessions yet:', err)
      setRealSessions([])
    }
  }

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
      if (activeTab === 'feed') {
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
      const q = query(profilesRef, orderBy('updatedAt', 'desc'), limit(150)) // order by recent updates so people who just toggled live are likely in the results
      const snapshot = await getDocs(q)
      
      const profiles: Profile[] = []
      const currentUid = firebaseUser?.uid

      snapshot.forEach((doc) => {
        if (doc.id === currentUid) return
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
            trainingNowSince: data.trainingNowSince != null ? data.trainingNowSince : undefined,
            liveStreak: data.liveStreak != null ? data.liveStreak : undefined,
            lastLiveDate: data.lastLiveDate != null ? data.lastLiveDate : undefined,
            liveJoins: data.liveJoins != null ? data.liveJoins : undefined,
            joinedLiveStreak: data.joinedLiveStreak != null ? data.joinedLiveStreak : undefined,
            trainingSyncWith: data.trainingSyncWith || undefined,
            syncStreak: data.syncStreak != null ? data.syncStreak : undefined,
            syncBonds: data.syncBonds || {},
          })
        }
      })
      setRealProfiles(profiles)
      const now = new Date()
      setLastSync(now)
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
              trainingSyncWith: realProfile.trainingSyncWith,
              syncStartedAt: realProfile.syncStartedAt != null ? realProfile.syncStartedAt : undefined,
              syncActions: realProfile.syncActions || [],
              syncStreak: realProfile.syncStreak != null ? realProfile.syncStreak : undefined,
              syncBonds: realProfile.syncBonds || {},
            }
            if (merged.name) {
              saveUser(merged)
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

  // Helper: Save user locally + persist to Firestore if we are in real mode
  const saveUserWithRealSync = useCallback(async (user: CurrentUser) => {
    saveUser(user) // always update local state immediately

    if (!isDemoMode && firebaseUser?.uid) {
      try {
        const profileUpdate: any = {
          name: user.name,
          age: user.age,
          gender: user.gender,
          city: user.city,
          country: user.country,
          bio: user.bio,
          photos: user.photos,
          trainingTypes: user.trainingTypes,
          goals: user.goals,
          level: user.level,
          intensity: user.intensity,
          availability: user.availability,
          lat: user.lat,
          lng: user.lng,
          trainingNow: user.trainingNow,
        };
        if (user.trainingNow) {
          if (user.trainingNowSince !== undefined) {
            profileUpdate.trainingNowSince = user.trainingNowSince;
          }
        } else {
          // explicitly clear when finishing live, to avoid undefined error in Firestore
          profileUpdate.trainingNowSince = null;
        }
        if (user.liveStreak !== undefined) {
          profileUpdate.liveStreak = user.liveStreak;
        }
        if (user.lastLiveDate !== undefined) {
          profileUpdate.lastLiveDate = user.lastLiveDate;
        }
        if (user.liveJoins !== undefined) {
          profileUpdate.liveJoins = user.liveJoins;
        }
        if (user.joinedLiveStreak !== undefined) {
          profileUpdate.joinedLiveStreak = user.joinedLiveStreak;
        }
        if (user.legalConsents) {
          profileUpdate.legalConsents = user.legalConsents;
        }
        if (user.trainingSyncWith !== undefined) {
          profileUpdate.trainingSyncWith = user.trainingSyncWith;
        }
        if (user.syncStartedAt !== undefined) {
          profileUpdate.syncStartedAt = user.syncStartedAt;
        }
        if (user.syncActions !== undefined) {
          profileUpdate.syncActions = user.syncActions.slice(-10); // keep last 10 for prealpha
        }
        if (user.syncStreak !== undefined) {
          profileUpdate.syncStreak = user.syncStreak;
        }
        if (user.syncBonds) {
          profileUpdate.syncBonds = user.syncBonds;
        }
        await updateUserProfile(firebaseUser.uid, profileUpdate)
        // console.log removed (debug)
      } catch (e) {
        console.warn('Failed to sync profile to Firestore:', e)
      }
    }
  }, [saveUser, isDemoMode, firebaseUser?.uid])

  // Native push notifications setup (only for real users in native APK)
  // NOTE: We no longer auto-request permission on every login to avoid unwanted prompts/crashes during "activation".
  // Users explicitly activate via the button in Profile. This effect only sets up listeners if plugin present.
  useEffect(() => {
    if (isDemoMode || !firebaseUser?.uid || !PushNotifications) return

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
            toast.info(title, { 
              description: body,
              className: 'bg-[#1C1C20] border-[#FF671F] text-white',
              duration: 5000
            })
          })

          PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
            console.log('Push action performed (user tapped):', action)
            // TODO: navigate to chat/session based on action.notification.data
            toast('Notificación tocada', { description: 'Abriendo app...' })
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

  // On real Firebase login (web), request Notification permission once so bg message alerts work when tab hidden
  useEffect(() => {
    if (!isDemoMode && firebaseUser?.uid) {
      // slight delay so UI settles
      const t = setTimeout(() => { requestWebNotificationPermission() }, 1200)
      return () => clearTimeout(t)
    }
  }, [isDemoMode, firebaseUser?.uid])

  // Auto-load own muro when entering profile tab (demo + real)
  useEffect(() => {
    if (activeTab === 'profile' && effectiveUserId) {
      loadProfilePosts(effectiveUserId)
    }
  }, [activeTab, effectiveUserId])

  // Auto load muro when opening full profile of someone else
  useEffect(() => {
    if (showFullProfile) {
      loadProfilePosts(showFullProfile.id)
    } else {
      // clean comment composer when closing full profile view
      setActiveComment(null)
      setCommentDraft('')
    }
  }, [showFullProfile])

  // Auto-load global feed when entering the new Feed tab
  useEffect(() => {
    if (activeTab === 'feed' && !isDemoMode) {
      setFeedMaxProfiles(15);
      setFeedDisplayLimit(10);
      loadGlobalFeed()
    }
  }, [activeTab])

  // Live refresh for "Entrenando Ahora" to keep real-time urgency (every 60s in explore)
  // Also reloads *own* profilePosts when we are the one training live, so processIncomingLiveJoins can detect new join comments/likes from others in near real-time.
  useEffect(() => {
    if (activeTab === 'explore' && !isDemoMode) {
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

  // Clear comment UI when leaving profile tab
  useEffect(() => {
    if (activeTab !== 'profile') {
      setActiveComment(null)
      setCommentDraft('')
    }
  }, [activeTab])

  // Logout handler - works for both demo and real Firebase
  const handleLogout = async () => {
    try {
      await logout()

      // Critical: clear the ref that was keeping us authenticated after login
      lastSuccessfulAuthRef.current = null

      // Clear all local state
      if (clearProfile) clearProfile()
      setChatUnreads({})
      setSessionUnreads({})
      seenChatMsgIdsRef.current = {}
      seenGroupMsgIdsRef.current = {}
      seenLiveUserIdsRef.current = new Set()
      seenLiveJoinInteractionIdsRef.current = new Set()
      localStorage.removeItem('entrenamatch_seen_chat_msgs')
      localStorage.removeItem('entrenamatch_seen_group_msgs')
      localStorage.removeItem('entrenamatch_seen_live_users')
      localStorage.removeItem('entrenamatch_seen_live_joins')
      
      setMatches([])
      setLikedIds([])
      setPassedIds([])
      setMessages({})
      setRealProfiles([])
      setRealMatches([])
      setRealChatMessages([])
      setActiveChat(null)
      setActiveTab('explore')
      setIsEditingProfile(false)

      // Clear any demo-specific data
      try {
        localStorage.removeItem('entrenamatch_demo_user')
      } catch {}

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
  const sendRealMessage = async (text: string, toUserId: string) => {
    if (!text.trim() || !firebaseUser?.uid || !db) return

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      const msg = {
        from: firebaseUser.uid,
        to: toUserId,
        text: text.trim(),
        timestamp: Date.now(),
        createdAt: serverTimestamp(),
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
          text: data.text,
          timestamp: data.timestamp || Date.now(),
        });
      });
      snap2.forEach((doc) => {
        const data = doc.data() as any;
        msgs.push({
          id: doc.id,
          from: 'them',
          text: data.text,
          timestamp: data.timestamp || Date.now(),
        });
      });
      msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      // Always update local messages state for this chat (for persistence and list previews)
      setMessages(prev => {
        const updated = { ...prev, [otherUserId]: msgs };
        localStorage.setItem('fitvina_messages', JSON.stringify(updated));
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

  // Reliable 1:1 real chat: load on open + safe polling (avoids index/rules issues with complex 'in' queries)
  // The previous onSnapshot is kept commented below as optional enhancement.
  useEffect(() => {
    if (!activeChat || isDemoMode || !firebaseUser?.uid || !db) {
      setRealChatMessages([])
      return
    }

    const isRealChat = isRealChatId(activeChat)
    if (!isRealChat) {
      setRealChatMessages([])
      return
    }

    // Bootstrap for real user chats: if the chatId is a known real profile (from realProfiles) but not yet
    // in realMatches (common for the "swiped" side until discovery, or if list entry came only from local matches),
    // add it now (activates bg listeners, real path etc.) and write the match doc (helps the other side discover too).
    if (!realMatches.includes(activeChat) && realProfiles.some(r => r.id === activeChat)) {
      const newReal = [...realMatches, activeChat]
      setRealMatches(newReal)
      loadRealMatches() // re-query to confirm and trigger any bg effects cleanly
      if (db && firebaseUser?.uid) {
        (async () => {
          try {
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
            const matchId = [firebaseUser.uid, activeChat].sort().join('_')
            await setDoc(doc(db, 'matches', matchId), {
              user1: firebaseUser.uid,
              user2: activeChat,
              createdAt: serverTimestamp(),
              status: 'active',
              autoMatchedForTesting: true
            }, { merge: true })
            console.log('✅ Match doc bootstrapped for', activeChat)
          } catch (e) {
            console.warn('Failed to bootstrap match doc for real chat', e)
          }
        })()
      }
    }

    // Load immediately when opening a real chat
    loadRealChatMessages(activeChat).then(msgs => {
      if (msgs) setRealChatMessages(msgs);
    });

    // Safe polling for live updates (every 8s while chat is open) - feels real-time for pre-alpha
    const interval = setInterval(async () => {
      const msgs = await loadRealChatMessages(activeChat);
      if (msgs) setRealChatMessages(msgs);
    }, 8000);

    return () => clearInterval(interval);
  }, [activeChat, isDemoMode, firebaseUser?.uid, realMatches, db])  // db included to re-init if available

  // Background load real chat histories for ALL real matches on login (so history is available instantly when opening any chat)
  useEffect(() => {
    if (isDemoMode || !firebaseUser?.uid || realMatches.length === 0) return;
    realMatches.forEach(async (id) => {
      await loadRealChatMessages(id);  // populates local messages state only
    });
  }, [realMatches, isDemoMode, firebaseUser?.uid]);

  // Background polling for all real matches every 30s (updates local message history for "real time" feel even if chats not open)
  useEffect(() => {
    if (isDemoMode || !firebaseUser?.uid || realMatches.length === 0) return;
    const interval = setInterval(() => {
      realMatches.forEach(id => {
        loadRealChatMessages(id);  // updates local messages for that chat
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [realMatches, isDemoMode, firebaseUser?.uid]);

  // Background real-time listeners for ALL real matches (to update message list previews live when new msg arrives, even if chat not open).
  // Robust ref-managed like the group sessions bg listeners. Direct snapshot processing for instant updates (no extra getDocs roundtrip in handler).
  useEffect(() => {
    if (isDemoMode || !firebaseUser?.uid || !db) {
      return;
    }
    const myMatchIds = realMatches || [];

    // Cleanup listeners for matches we no longer have
    Object.keys(realChatUnsubsRef.current).forEach((id) => {
      if (!myMatchIds.includes(id)) {
        try { realChatUnsubsRef.current[id]?.(); } catch {}
        delete realChatUnsubsRef.current[id];
      }
    });

    myMatchIds.forEach((matchId) => {
      if (realChatUnsubsRef.current[matchId]) return; // already subscribed

      (async () => {
        try {
          const { collection, query, where, onSnapshot } = await import('firebase/firestore');
          const messagesRef = collection(db, 'messages');
          const q1 = query(messagesRef, where('from', '==', firebaseUser.uid), where('to', '==', matchId));
          const q2 = query(messagesRef, where('from', '==', matchId), where('to', '==', firebaseUser.uid));

          // Handler for q1 (my outgoing) — update state but do not notify self
          const handler1 = (snapshot: any) => {
            console.log(`📨 Live 1:1 update (bg) for ${matchId}`);
            loadRealChatMessages(matchId);
            // mark any new ids as seen so future incoming are detected
            if (snapshot.docChanges) {
              snapshot.docChanges().forEach((ch: any) => { if (ch.type === 'added') { if (!seenChatMsgIdsRef.current[matchId]) seenChatMsgIdsRef.current[matchId] = new Set(); seenChatMsgIdsRef.current[matchId].add(ch.doc.id); } });
            persistSeen();
            }
          };
          const unsub1 = onSnapshot(q1, handler1, (err: any) => console.warn(`bg 1:1 q1 listener error for ${matchId}:`, err));

          // Handler for q2 (possible incoming from match) — detect *new added* from them after initial, then notify
          const handler2 = (snapshot: any) => {
            console.log(`📨 Live 1:1 update (bg) for ${matchId}`);
            const changes = snapshot.docChanges ? snapshot.docChanges() : [];
            const preSize = seenChatMsgIdsRef.current[matchId] ? seenChatMsgIdsRef.current[matchId].size : 0;
            const newlyAddedIncoming: any[] = [];
            changes.forEach((ch: any) => {
              if (ch.type === 'added') {
                const d = ch.doc.data() as any;
                const msgId = ch.doc.id;
                if (!seenChatMsgIdsRef.current[matchId]) seenChatMsgIdsRef.current[matchId] = new Set();
                const wasSeen = seenChatMsgIdsRef.current[matchId].has(msgId);
                seenChatMsgIdsRef.current[matchId].add(msgId);
                persistSeen();
                // only from the other side AND not previously seen
                if (d.from === matchId && !wasSeen) {
                  newlyAddedIncoming.push({ id: msgId, text: d.text || '', photo: d.photo });
                }
              }
            });
            loadRealChatMessages(matchId);
            // Fire notif only for truly new unseen. On first population for this chat (preSize==0), treat as historical -> no notify.
            if (newlyAddedIncoming.length > 0 && preSize > 0) {
              if (currentActiveChatRef.current !== matchId) {
                const prof = (realProfiles || []).find((p: any) => p.id === matchId) || SEED_PROFILES.find((p: any) => p.id === matchId);
                const senderName = prof?.name || 'Usuario';
                const firstNew = newlyAddedIncoming[0];
                triggerMessageArrivalNotification(matchId, senderName, firstNew.text, false, firstNew.photo || prof?.photos?.[0]);
              }
            }
          };
          const unsub2 = onSnapshot(q2, handler2, (err: any) => console.warn(`bg 1:1 q2 listener error for ${matchId}:`, err));

          realChatUnsubsRef.current[matchId] = () => {
            try { unsub1(); } catch {}
            try { unsub2(); } catch {}
          };
        } catch (e) {
          console.warn('bg 1:1 listener setup error for', matchId, e);
        }
      })();
    });
  }, [realMatches, isDemoMode, firebaseUser?.uid, db, realProfiles]);

  // Global cleanup for 1:1 bg message listeners (on unmount / mode change)
  useEffect(() => {
    return () => {
      Object.values(realChatUnsubsRef.current).forEach((u) => {
        try { u(); } catch {}
      });
      realChatUnsubsRef.current = {};
    };
  }, []);

  // Real-time onSnapshot for 1:1 using safe separate == queries (triggers live update on changes, then load for data)
  // This makes chat truly real-time when open, without complex 'in' that may need indexes.
  useEffect(() => {
    if (!activeChat || isDemoMode || !firebaseUser?.uid || !db) {
      return;
    }
    const isRealChat = isRealChatId(activeChat);
    if (!isRealChat) {
      return;
    }
    let unsub1: (() => void) | null = null;
    let unsub2: (() => void) | null = null;
    (async () => {
      try {
        const { collection, query, where, onSnapshot, orderBy } = await import('firebase/firestore');
        const messagesRef = collection(db, 'messages');
        const q1 = query(messagesRef, where('from', '==', firebaseUser.uid), where('to', '==', activeChat));
        const q2 = query(messagesRef, where('from', '==', activeChat), where('to', '==', firebaseUser.uid));
        const handler = (snap: any, direction: string) => {
          console.log(`📨 Live 1:1 update (active chat)`);
          // Load does the merge of both directions + sets messages + (thanks to ref) also realChatMessages when active
          loadRealChatMessages(activeChat).then(msgs => {
            if (msgs) setRealChatMessages(msgs);
          });
        };
        unsub1 = onSnapshot(q1, (s) => handler(s, 'q1'), (err) => console.warn('1:1 q1 listener error:', err));
        unsub2 = onSnapshot(q2, (s) => handler(s, 'q2'), (err) => console.warn('1:1 q2 listener error:', err));
      } catch (e) {
        console.warn('1:1 onSnapshot setup error (falling back to poll):', e);
      }
    })();
    return () => {
      if (unsub1) unsub1();
      if (unsub2) unsub2();
    };
  }, [activeChat, isDemoMode, firebaseUser?.uid, realMatches, db]);

  // Note: Real-time 1:1 chat uses onSnapshot (safe queries) + polling + background for cross-device live updates.

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

  // Safe polling for real sessions (no TDZ risk)
  useEffect(() => {
    if (!isDemoMode && firebaseUser?.uid) {
      const interval = setInterval(() => {
        loadRealSessions()
      }, 30000) // every 30 seconds when in real mode

      return () => clearInterval(interval)
    }
  }, [isDemoMode, firebaseUser?.uid])

  // Real-time onSnapshot for sessions list (new sessions, joins, expels, closes appear instantly cross-device)
  // This makes sessions fully "live" and automated on the server (no more waiting 30s or manual refresh for others' actions).
  useEffect(() => {
    if (isDemoMode || !firebaseUser?.uid || !db) {
      return
    }
    let unsubscribe: (() => void) | null = null
    ;(async () => {
      try {
        const { collection, query, orderBy, limit, onSnapshot } = await import('firebase/firestore')
        const sessionsRef = collection(db, 'sessions')
        // Use same query as loadRealSessions for consistency (newest first)
        const q = query(sessionsRef, orderBy('createdAt', 'desc'), limit(50))
        unsubscribe = onSnapshot(q, (snapshot) => {
          const loaded: TrainingSession[] = []
          snapshot.forEach((doc) => {
            const data = doc.data() as any
            if (data && data.title) {
              loaded.push({
                id: doc.id,
                creatorId: data.creatorId || '',
                creatorName: data.creatorName || 'Usuario',
                title: data.title,
                description: data.description || '',
                time: data.time || '',
                location: data.location || '',
                trainingType: data.trainingType || '',
                maxParticipants: data.maxParticipants || 4,
                participants: data.participants || [],
                createdAt: (data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt) || Date.now(),
                lastMessagePreview: data.lastMessagePreview || undefined,
                lastMessageAt: data.lastMessageAt?.toMillis ? data.lastMessageAt.toMillis() : data.lastMessageAt,
              })
            }
          })
          setRealSessions(loaded)
          setLastSync(new Date())
          console.log(`📡 Live sessions update: ${loaded.length} sessions from Firestore`)
        }, (err) => {
          console.warn('Sessions live listener error (may need index or rules):', err)
        })
      } catch (e) {
        console.warn('Sessions onSnapshot setup error (falling back to poll):', e)
      }
    })()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [isDemoMode, firebaseUser?.uid, db])

  // Load my previous beta feedbacks when viewing Profile (real users only)
  useEffect(() => {
    if (activeTab === 'profile' && !isDemoMode && firebaseUser?.uid) {
      loadMyFeedbacks()
    }
  }, [activeTab, isDemoMode, firebaseUser?.uid])

  // Auto-run Play Integrity check once per session on real native users (silent first time, visible result in Profile)
  const didAutoIntegrityRef = useRef(false)
  useEffect(() => {
    if (!isDemoMode && firebaseUser?.uid && PlayIntegrityNative && !didAutoIntegrityRef.current) {
      didAutoIntegrityRef.current = true
      // Fire and forget; user sees nice UI in Profile
      checkPlayIntegrity(false).then((res) => {
        if (res && (res.token || res.simulatedVerdict)) {
          // Optional: if negative in future, we could show warning or restrict some actions
          console.log('[Play Integrity] Auto-checked on real native login:', res.token ? 'real token' : 'simulated')
        }
      })
    }
  }, [firebaseUser?.uid, isDemoMode])

  // Load real group chat messages when opening the modal for a real session
  const loadRealGroupMessages = async (sessionId: string) => {
    if (!db || !firebaseUser?.uid) return;

    try {
      const { collection, query, orderBy, getDocs } = await import('firebase/firestore');
      const msgsRef = collection(db, `sessions/${sessionId}/messages`);
      const q = query(msgsRef, orderBy('createdAt', 'asc'));
      const snap = await getDocs(q);

      const loaded: SessionMessage[] = [];
      snap.forEach(doc => {
        const d = doc.data() as any;
        loaded.push({
          id: doc.id,
          senderId: d.senderId,
          senderName: d.senderName || 'Usuario',
          text: d.text || '',
          timestamp: d.timestamp || Date.now(),
          photo: d.photo,
          reactions: d.reactions || {}
        });
      });

      setSessionMessages(prev => ({
        ...prev,
        [sessionId]: loaded
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

  // Real-time onSnapshot for group chat when modal open (subcollection under session)
  useEffect(() => {
    if (!showGroupChatModalFor || isDemoMode || !firebaseUser?.uid || !db) {
      return;
    }

    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
        const msgsRef = collection(db, `sessions/${showGroupChatModalFor}/messages`);
        const q = query(msgsRef, orderBy('createdAt', 'asc'));

        unsubscribe = onSnapshot(q, (snapshot) => {
          const loaded: SessionMessage[] = [];
          snapshot.forEach(doc => {
            const d = doc.data() as any;
            loaded.push({
              id: doc.id,
              senderId: d.senderId,
              senderName: d.senderName || 'Usuario',
              text: d.text || '',
              timestamp: d.timestamp || Date.now(),
              photo: d.photo,
              reactions: d.reactions || {}
            });
          });
          setSessionMessages(prev => ({
            ...prev,
            [showGroupChatModalFor]: loaded
          }));
          console.log(`📨 Live group update: ${loaded.length} msgs for session ${showGroupChatModalFor}`);
        }, (err) => {
          console.warn('Group chat live listener error (check rules/participants):', err);
        });
      } catch (e) {
        console.warn('Group chat onSnapshot setup error:', e);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [showGroupChatModalFor, isDemoMode, firebaseUser?.uid, db]);

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
      if (groupMessageUnsubsRef.current[sessionId]) return; // already have active listener

      (async () => {
        try {
          const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
          const msgsRef = collection(db, `sessions/${sessionId}/messages`);
          const q = query(msgsRef, orderBy('createdAt', 'asc'));

          const unsub = onSnapshot(q, (snapshot) => {
            const preSize = seenGroupMsgIdsRef.current[sessionId] ? seenGroupMsgIdsRef.current[sessionId].size : 0;
            const loaded: SessionMessage[] = [];
            const newlyAddedFromOthers: any[] = [];
            const changes = snapshot.docChanges ? snapshot.docChanges() : [];
            changes.forEach((ch: any) => {
              if (ch.type === 'added') {
                const d = ch.doc.data() as any;
                const msgId = ch.doc.id;
                if (!seenGroupMsgIdsRef.current[sessionId]) seenGroupMsgIdsRef.current[sessionId] = new Set();
                const wasSeen = seenGroupMsgIdsRef.current[sessionId].has(msgId);
                seenGroupMsgIdsRef.current[sessionId].add(msgId);
                persistSeen();
                if (d.senderId && d.senderId !== firebaseUser.uid && d.senderId !== effectiveUserId && !wasSeen) {
                  newlyAddedFromOthers.push({ id: msgId, text: d.text || '', senderName: d.senderName || 'Participante', photo: d.photo });
                }
              }
            });
            snapshot.forEach((doc) => {
              const d = doc.data() as any;
              loaded.push({
                id: doc.id,
                senderId: d.senderId,
                senderName: d.senderName || 'Usuario',
                text: d.text || '',
                timestamp: d.timestamp || Date.now(),
                photo: d.photo,
                reactions: d.reactions || {},
              });
            });
            setSessionMessages((prev) => ({
              ...prev,
              [sessionId]: loaded,
            }));
            setLastSync(new Date());
            if (showGroupChatModalFor === sessionId) {
              setSessionUnreads(prev => { const c = { ...prev }; c[sessionId] = 0; return c })
            }
            console.log(`📨 BG live group msg for ${sessionId}: ${loaded.length} msgs`);
            // Notify only for truly new unseen from others. Skip on first population for this listener (preSize==0 means historical).
            if (newlyAddedFromOthers.length > 0 && preSize > 0) {
              if (showGroupChatModalFor !== sessionId) {
                const first = newlyAddedFromOthers[0];
                const sess = (realSessions || []).find((s: any) => s.id === sessionId) || displaySessions.find((s: any) => s.id === sessionId);
                const sname = first.senderName || (sess ? (sess.creatorName || 'Alguien') : 'Participante');
                triggerMessageArrivalNotification(sessionId, sname, first.text, true, first.photo);
              }
            }
          }, (err) => {
            console.warn(`BG group chat listener error for session ${sessionId} (rules/participants):`, err);
          });

          groupMessageUnsubsRef.current[sessionId] = unsub;
        } catch (e) {
          console.warn('BG group messages onSnapshot setup error for', sessionId, e);
        }
      })();
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
    if (savedReviews) setReviews(JSON.parse(savedReviews))

    const savedSessionMessages = localStorage.getItem('entrenamatch_session_messages')
    if (savedSessionMessages && isDemoMode) {
      // Only restore local session messages in demo mode. In real mode, group chat messages come live from Firestore subcollections.
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

    // Load profile muro posts (demo/local)
    const savedPosts = localStorage.getItem('entrenamatch_profile_posts')
    if (savedPosts) {
      setProfilePosts(JSON.parse(savedPosts))
    }

    const savedBlocked = localStorage.getItem('entrenamatch_blocked')
    if (savedBlocked) setBlockedUsers(JSON.parse(savedBlocked))

    const savedReports = localStorage.getItem('entrenamatch_reports')
    if (savedReports) setReports(JSON.parse(savedReports))

    const savedNotifications = localStorage.getItem('entrenamatch_notifications')
    if (savedNotifications) {
      let loaded = JSON.parse(savedNotifications)
      // Auto-clean old read notifications to keep panel tidy (keep recent read + all unread)
      const now = Date.now()
      loaded = loaded.filter((n: any) => !n.read || (now - (n.timestamp || 0)) < 1000*60*60*24*7 ) // keep unread + last 7 days read
      setNotifications(loaded.slice(0, 30))
      if (loaded.length !== JSON.parse(savedNotifications).length) {
        localStorage.setItem('entrenamatch_notifications', JSON.stringify(loaded))
      }
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
  const saveLiked = (ids: string[]) => { localStorage.setItem('fitvina_liked', JSON.stringify(ids)); setLikedIds(ids) }
  const savePassed = (ids: string[]) => { localStorage.setItem('fitvina_passed', JSON.stringify(ids)); setPassedIds(ids) }
  const saveMatches = (ids: string[]) => { localStorage.setItem('fitvina_matches', JSON.stringify(ids)); setMatches(ids) }
  const saveMessages = (msgs: Record<string, Message[]>) => { localStorage.setItem('fitvina_messages', JSON.stringify(msgs)); setMessages(msgs) }
  const saveChatUnreads = (unreads: Record<string, number>) => { localStorage.setItem('entrenamatch_chat_unreads', JSON.stringify(unreads)); setChatUnreads(unreads) }

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
    localStorage.setItem('entrenamatch_squads', JSON.stringify(newSquads))
    setSquads(newSquads)
  }

  const saveProfilePosts = (posts: Record<string, ProfilePost[]>) => {
    localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(posts))
    setProfilePosts(posts)
  }

  // Muro / Profile Posts helpers (demo + real Firestore)
  const loadProfilePosts = async (userId: string) => {
    if (isDemoMode || !db) {
      const posts = (profilePosts[userId] || []).slice().sort((a, b) => b.timestamp - a.timestamp)
      return posts
    }
    try {
      // NOTE: Query uses only `where` (no orderBy) to avoid requiring a composite index immediately.
      // Client-side sort by timestamp desc ensures newest first for any viewer (A viewing B's muro).
      // Composite index (userId ASC + timestamp DESC) is defined in firestore.indexes.json and can be deployed with:
      //   firebase deploy --only firestore:indexes   (or via CI firebase-deploy.yml when secret configured)
      // This makes cross-profile muro loads work right now without waiting for index build.
      const { collection, query, where, getDocs, limit } = await import('firebase/firestore')
      const q = query(
        collection(db, 'profilePosts'),
        where('userId', '==', userId),
        limit(30)
      )
      const snap = await getDocs(q)
      const posts: ProfilePost[] = []
      snap.forEach((doc) => {
        const d = doc.data() as any
        const rawComments = d.comments || []
        posts.push({
          id: doc.id,
          userId: d.userId,
          text: d.text || '',
          photo: d.photo,
          timestamp: d.timestamp || Date.now(),
          likes: d.likes || [],
          pinned: !!d.pinned,
          comments: rawComments.map((c: any) => ({
            id: c.id || ('c' + Date.now() + Math.random().toString(36).slice(2)),
            userId: c.userId || '',
            userName: c.userName || 'Usuario',
            text: c.text || '',
            timestamp: c.timestamp || Date.now()
          }))
        })
      })
      // Always return newest-first (client sort; works regardless of index)
      posts.sort((a, b) => b.timestamp - a.timestamp)
      const limited = posts.slice(0, 10)
      setProfilePosts((prev) => {
        const newState = { ...prev, [userId]: limited }
        // Cache server results to localStorage so real users see their (and others') posts immediately on reload/mount
        // before or if the tab-load effect hasn't fired yet. Load always wins as source of truth for real.
        try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(newState)) } catch {}
        return newState
      })
      return limited
    } catch (e) {
      console.warn('loadProfilePosts error', e)
      const posts = (profilePosts[userId] || []).slice().sort((a, b) => b.timestamp - a.timestamp)
      return posts
    }
  }

  // Global feed loader for the new 'feed' tab - loads recent muro posts from community
  const loadGlobalFeed = async (more: boolean = false) => {
    if (isDemoMode || !realProfiles.length) return;
    setIsLoadingFeed(true);
    try {
      const max = more ? Math.min(feedMaxProfiles + 10, realProfiles.length) : feedMaxProfiles;
      if (more) setFeedMaxProfiles(max);
      // Load for up to max recent real profiles to keep it fast
      const toLoad = realProfiles.slice(0, max);
      // Parallel load (was sequential — small but real win for "giant update" feel when refreshing feed)
      await Promise.all(toLoad.map(p => loadProfilePosts(p.id).catch(() => {})));
      setLastSync(new Date());
    } finally {
      setIsLoadingFeed(false);
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
      comments: []
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
          try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(newState)) } catch {}
          return newState
        })

        if (activeTab === 'feed') {
          setTimeout(() => loadGlobalFeed().catch(() => {}), 300)
        }
      } catch (e) {
        setProfilePosts((prev) => {
          const current = prev[effectiveUserId] || []
          const newList = [post, ...current].slice(0, 10)
          const newState = { ...prev, [effectiveUserId]: newList }
          try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(newState)) } catch {}
          return newState
        })
      }
    } else {
      setProfilePosts((prev) => {
        const current = prev[effectiveUserId] || []
        const newList = [post, ...current].slice(0, 10)
        const newState = { ...prev, [effectiveUserId]: newList }
        try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(newState)) } catch {}
        return newState
      })
    }

    // Delightful UX: highlight the new post briefly in lists (feed or personal muro) so user sees the result instantly
    setRecentlyPublishedPostId(post.id)
    setTimeout(() => setRecentlyPublishedPostId(null), 4000)

    toast.success('Publicado en tu muro')
  }

  const likeProfilePost = async (postId: string, postUserId: string) => {
    const posts = profilePosts[postUserId] || []
    const idx = posts.findIndex((p) => p.id === postId)
    if (idx < 0) return
    const post = posts[idx]
    const hasLiked = post.likes.includes(effectiveUserId)
    const newLikes = hasLiked
      ? post.likes.filter((id) => id !== effectiveUserId)
      : [...post.likes, effectiveUserId]
    const updatedPost = { ...post, likes: newLikes }
    const newPosts = [...posts]
    newPosts[idx] = updatedPost
    if (!isDemoMode && db) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'profilePosts', postId), { likes: newLikes })
        setProfilePosts((prev) => {
          const newState = { ...prev, [postUserId]: newPosts }
          try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(newState)) } catch {}
          return newState
        })
      } catch (e) {
        console.warn(e)
      }
    } else {
      const updated = { ...profilePosts, [postUserId]: newPosts }
      saveProfilePosts(updated)
    }
    if (!hasLiked && postUserId !== effectiveUserId) {
      addNotification({
        type: 'message',
        title: '¡Like en tu muro!',
        body: `${currentUser?.name || 'Alguien'} le gustó tu publicación`,
        relatedId: postUserId
      })
    }
  }

  // TOP UPDATE v0.1.7: Quick reactions on feed posts (optimistic, super attractive social boost)
  const boostReaction = (postId: string, emoji: string) => {
    setFeedReactions(prev => {
      const forPost = prev[postId] || {}
      return {
        ...prev,
        [postId]: { ...forPost, [emoji]: (forPost[emoji] || 0) + 1 }
      }
    })
    // Fun micro feedback
    toast.success(emoji, { duration: 600, className: 'text-lg' })
    // Future: persist to Firestore profilePosts reactions map for cross-device
  }

  // === DISRUPTIVE EntrenaSync implementation (core of the top unique feature) ===

  // Haptic helper (works on web + Capacitor Android webview; upgrade to @capacitor/haptics later for native ImpactStyle)
  const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const pattern = style === 'success' ? [25, 15, 25] : style === 'medium' ? 55 : 22
        ;(navigator as any).vibrate(pattern)
      }
    } catch {}
  }

  const startSyncWith = async (partnerId: string, partnerName: string) => {
    if (!currentUser?.trainingNow || !realProfiles.some(p => p.id === partnerId && p.trainingNow)) return
    if (syncPartnerId || joiningSyncWith === partnerId) return // anti-spam guard
    const now = Date.now()
    setSyncPartnerId(partnerId)
    setSyncStartedAt(now)
    setSyncActions([])
    setSyncCombo(0)
    setFlyingEmojis([])
    setShowSyncArena(true) // open the immersive never-seen Arena immediately — this is the magic moment
    triggerHaptic('medium')
    const updated = { ...currentUser, trainingSyncWith: partnerId, syncStartedAt: now, syncActions: [] }
    saveUser(updated as any)
    // Persist to profiles (optimistic + FS)
    if (!isDemoMode && db && firebaseUser) {
      try {
        const { doc, updateDoc, setDoc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'profiles', effectiveUserId), { trainingSyncWith: partnerId, syncStartedAt: now, syncActions: [] })
        await updateDoc(doc(db, 'profiles', partnerId), { trainingSyncWith: effectiveUserId, syncStartedAt: now, syncActions: [] })

        // Dedicated instant session doc (for onSnapshot actions/timer, no poll dependency)
        const uids = [effectiveUserId, partnerId].sort()
        const sessionId = `sync_${uids[0]}_${uids[1]}`
        const sessionRef = doc(db, 'syncSessions', sessionId)
        const baseVibe = 12 // starting "together" energy
        await setDoc(sessionRef, {
          participants: [effectiveUserId, partnerId],
          startedAt: now,
          actions: [],
          vibe: baseVibe,
          updatedAt: now,
        }, { merge: true })
        setSyncVibe(baseVibe)
      } catch (e) { console.warn('sync persist failed', e) }
    }
    // Auto post to muro for both
    createProfilePost(`¡Sincronizado con ${partnerName}! Entrenamos juntos ahora 🔥`, null).catch(() => {})
    toast.success(`EntrenaSync iniciado con ${partnerName}`, { description: 'Timer y acciones compartidas en vivo' })
    // Attractive feedback: confetti + clear joining loader (the UI will switch to profile showing the rich sync panel)
    try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } }) } catch {}
    setJoiningSyncWith(null)
  }

  const endSync = async () => {
    if (!syncPartnerId) return
    const partnerName = realProfiles.find(p => p.id === syncPartnerId)?.name || 'compañero'
    const minutes = syncStartedAt ? Math.floor((Date.now() - syncStartedAt) / 60000) : 0
    // Clear local
    const oldPartner = syncPartnerId
    // Boost syncStreak
    const newSyncStreak = ((currentUser as any).syncStreak || 0) + 1
    const updated = { ...currentUser, trainingSyncWith: null, syncStartedAt: null, syncActions: [], syncStreak: newSyncStreak } as any
    saveUser(updated)
    setSyncPartnerId(null)
    setSyncStartedAt(null)
    setSyncActions([])
    setSyncVibe(0)
    setSyncCombo(0)
    setFlyingEmojis([])
    setShowSyncArena(false)
    // Capture for replay (the unique "remember this session together" moment)
    const capturedActions = [...syncActions]
    const capturedVibe = syncVibe
    // Clear FS
    if (!isDemoMode && db && firebaseUser) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'profiles', effectiveUserId), { trainingSyncWith: null, syncStartedAt: null, syncActions: [], syncStreak: newSyncStreak })
        if (oldPartner) await updateDoc(doc(db, 'profiles', oldPartner), { trainingSyncWith: null, syncStartedAt: null })
        // Mark session ended for active count queries
        try {
          const { doc: doc2, updateDoc: upd2 } = await import('firebase/firestore')
          const uids = [effectiveUserId, oldPartner].sort()
          const sid = `sync_${uids[0]}_${uids[1]}`
          await upd2(doc2(db, 'syncSessions', sid), { endedAt: Date.now() })
        } catch {}
      } catch (e) {}
    }
    createProfilePost(`Sync terminado con ${partnerName} - ${minutes}min juntos`, null).catch(() => {})
    // Save replayable memory (unique persistence of the shared ritual)
    if (minutes >= 2 && capturedActions.length > 0) {
      setReplaySession({ partnerName, minutes, vibe: capturedVibe, actions: capturedActions.slice(0,8), rating: null })
    }
    if (minutes > 5) {
      setPendingSyncRating({ partnerId: oldPartner, partnerName, minutes })
    } else {
      toast(`Sync finalizado: ${minutes}min`, { description: '¡Buen trabajo en equipo! +1 sync streak' })
    }
  }

  const submitSyncRating = async (rating: number) => {
    if (!pendingSyncRating) return
    triggerHaptic('success')
    const { partnerId, partnerName, minutes } = pendingSyncRating
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
    const updatedBonds = { ...syncBonds, [partnerId]: { totalMin: newTotalMin, sessions: newSessions, avgRating: newAvg, bondLevel: newBondLevel } }
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
      if (!isDemoMode && db && syncPartnerId) {
        try {
          const { doc, updateDoc } = await import('firebase/firestore')
          const uids = [effectiveUserId, syncPartnerId].sort()
          const sessionId = `sync_${uids[0]}_${uids[1]}`
          const bonus = Math.min(30, rating * 6 + Math.floor(minutes / 3))
          const finalVibe = Math.min(100, (syncVibe || 50) + bonus)
          await updateDoc(doc(db, 'syncSessions', sessionId), { vibe: finalVibe })
          setSyncVibe(finalVibe)
        } catch {}
      }
    }

    // THE UNIQUE MAGIC: Auto-generate rich "Session Story" post and publish to BOTH muros instantly.
    // This creates permanent shared memory + social proof that lives forever in each person's profile/feed.
    // Nobody else turns a live training session into a beautiful co-authored story post on both walls.
    if (minutes >= 3 && (replaySession || syncActions.length > 1)) {
      const actionsForStory = (replaySession?.actions || syncActions).slice(0, 6)
      const actionSummary = actionsForStory.map((a: any) => `${a.emoji} ${a.label}${a.combo ? `x${a.combo}` : ''}`).join(' · ')
      const storyText = `🔄 ENTRENASYNC LEGENDARIO\n${minutes} min juntos con ${partnerName}\nVibe final: ${syncVibe || 70}% • Calificación: ${rating}★\nRitual: ${actionSummary}\n\nEntrenamos como si estuviéramos en el mismo gym. Esto nadie más lo tiene. #EntrenaSync`
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
      setLastSyncStory({ partnerName, minutes, rating, vibe: syncVibe, summary: actionSummary })
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.7 } })
      toast.success('¡Historia del Sync guardada en AMBOS muros!', { description: 'Un recuerdo compartido que nadie más puede crear.' })
    }

    // Update replay with rating for nice replay modal later
    if (replaySession) {
      setReplaySession({ ...replaySession, rating })
    }

    toast.success(`Sync con ${partnerName} calificado ${rating}/5`, { description: '¡Gracias! Ayuda a mejorar el matching + tu Bond Legend creció.' })
    setPendingSyncRating(null)
  }

  const doSyncAction = async (emoji: string, label: string) => {
    if (!syncPartnerId || !syncStartedAt) return
    triggerHaptic('light')

    // NEVER-SEEN COMBO SYSTEM: consecutive same action = multiplier + special pop + stronger social proof
    const isCombo = syncActions.length > 0 && syncActions[0].label === label
    const newCombo = isCombo ? Math.min(5, syncCombo + 1) : 1
    setSyncCombo(newCombo)
    const baseGain = 7
    const comboBonus = (newCombo - 1) * 6 // x2= +6, x3=+12 etc up to x5
    const vibeGain = baseGain + comboBonus

    const action = { id: 'sa' + Date.now(), emoji, label, userId: effectiveUserId, at: Date.now(), combo: newCombo > 1 ? newCombo : undefined }
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
        const actionForSession = { emoji, label, userId: effectiveUserId, at: Date.now(), combo: newCombo > 1 ? newCombo : undefined }
        const newVibe = Math.min(100, (syncVibe || 0) + vibeGain)
        await updateDoc(doc(db, 'syncSessions', sessionId), {
          actions: arrayUnion(actionForSession),
          vibe: newVibe,
          updatedAt: Date.now(),
        })
        setSyncVibe(newVibe)
      } catch (e) { console.warn('instant syncSession action failed (mirror will catch on next poll)', e) }
    }

    // Auto social proof — richer when combo
    const partner = realProfiles.find(p => p.id === syncPartnerId)
    const proofText = newCombo > 1 
      ? `${emoji} ${label} x${newCombo} COMBO con ${partner?.name || 'sync buddy'} 🔥` 
      : `${emoji} ${label} con ${partner?.name || 'sync buddy'}`
    createProfilePost(proofText, null).catch(() => {})

    // Special toast + confetti pop for combos (the dopamine that makes it addictive and unique)
    if (newCombo >= 3) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
      toast.success(`${emoji} COMBO x${newCombo}!`, { description: '¡Energía multiplicada — esto nadie más lo siente!' })
      triggerHaptic('medium')
    } else {
      toast.success(`${emoji} ${label}`)
    }
  }

  // Auto-start sync UI when joining live (call from handleSwipe if both live)
  // Attractive + anti-spam: show loading on the specific join, disable multi-press, auto-nav to profile to see the beautiful sync panel
  const tryAutoStartSync = (targetId: string) => {
    const target = realProfiles.find(p => p.id === targetId)
    if (!target) return
    if (currentUser?.trainingNow && target?.trainingNow) {
      if (syncPartnerId || joiningSyncWith) return // prevent spam / already in sync
      setJoiningSyncWith(targetId)
      startSyncWith(targetId, target.name)
        .then(() => {
          setActiveTab('profile') // takes user to the attractive EntrenaSync UI (timer, actions, vibe meter, etc.)
          // brief success state on the button (if still in view)
          setTimeout(() => setJoiningSyncWith(null), 1200)
        })
        .catch(() => setJoiningSyncWith(null))
    }
  }

  const addCommentToPost = async (postId: string, postUserId: string, text: string) => {
    if (!text.trim()) return
    const comment = {
      id: 'c' + Date.now(),
      userId: effectiveUserId,
      userName: currentUser?.name || 'Tú',
      text: text.trim(),
      timestamp: Date.now()
    }
    const posts = profilePosts[postUserId] || []
    const idx = posts.findIndex((p) => p.id === postId)
    if (idx < 0) return
    const post = posts[idx]
    const updatedPost = { ...post, comments: [...post.comments, comment] }
    const newPosts = [...posts]
    newPosts[idx] = updatedPost
    if (!isDemoMode && db) {
      try {
        const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
        await updateDoc(doc(db, 'profilePosts', postId), { comments: arrayUnion(comment) })
        setProfilePosts((prev) => {
          const newState = { ...prev, [postUserId]: newPosts }
          try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(newState)) } catch {}
          return newState
        })
      } catch (e) {
        console.warn(e)
      }
    } else {
      const updated = { ...profilePosts, [postUserId]: newPosts }
      saveProfilePosts(updated)
    }
    if (postUserId !== effectiveUserId) {
      addNotification({
        type: 'message',
        title: 'Comentario en tu muro',
        body: `${currentUser?.name || 'Alguien'}: ${text.substring(0, 60)}`,
        relatedId: postUserId
      })
    }
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
    saveProfilePosts(updated)  // delete uses save (LS + state) - triggers AnimatePresence exit

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
    livePosts.forEach((post: any) => {
      // New comments on the live post
      ;(post.comments || []).forEach((c: any) => {
        if (c.userId && c.userId !== myId && !seenLiveJoinInteractionIdsRef.current.has(c.id)) {
          seenLiveJoinInteractionIdsRef.current.add(c.id)
          newJoinDetected = true
          addNotification({
            type: 'session_join',
            title: '🔥 ¡Alguien se unió a tu live!',
            body: `${c.userName || 'Un compañero'} se unió a tu entrenamiento en vivo`,
            relatedId: c.userId,
            photoUrl: undefined
          })
          toast(`🔥 ${c.userName || 'Alguien'} se unió a tu live`, {
            description: '¡Abre tu muro o chatea con ellos!',
            action: {
              label: 'Ver perfil',
              onClick: () => {
                // Try to open the joiner's profile if we have them loaded
                const joiner = [...realProfiles, ...SEED_PROFILES].find(p => p.id === c.userId)
                if (joiner) setShowFullProfile(joiner as any)
                else setActiveTab('feed')
              }
            }
          })
        }
      })

      // Also treat new likes on the live post as joins (if not self)
      ;(post.likes || []).forEach((likerId: string) => {
        const likeKey = `${post.id}_like_${likerId}`
        if (likerId !== myId && !seenLiveJoinInteractionIdsRef.current.has(likeKey)) {
          seenLiveJoinInteractionIdsRef.current.add(likeKey)
          newJoinDetected = true
          const likerProfile = [...realProfiles, ...SEED_PROFILES].find(p => p.id === likerId)
          const likerName = likerProfile?.name || 'Un compañero'
          addNotification({
            type: 'session_join',
            title: '❤️ ¡Like en tu post live!',
            body: `${likerName} le dio like a tu "Entrenando ahora"`,
            relatedId: likerId
          })
          toast(`❤️ ${likerName} se sumó a tu live`, { description: '¡Tu post en vivo está generando movimiento!' })
        }
      })
    })

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
  const startComment = (postId: string, postUserId: string, ownerName?: string) => {
    setActiveComment({ postId, postUserId, ownerName })
    setCommentDraft('')
  }
  const submitComment = async () => {
    if (!activeComment || !commentDraft.trim()) return
    await addCommentToPost(activeComment.postId, activeComment.postUserId, commentDraft)
    setActiveComment(null)
    setCommentDraft('')
  }
  const cancelComment = () => {
    setActiveComment(null)
    setCommentDraft('')
  }

  // Open rich full-comments modal (spectacular thread view)
  const openFullComments = (postId: string, postUserId: string, ownerName?: string) => {
    setViewingPostComments({ postId, postUserId, ownerName })
    setModalCommentDraft('')
    // close any inline to avoid overlap
    setActiveComment(null)
    setCommentDraft('')
  }

  const submitModalComment = async () => {
    if (!viewingPostComments || !modalCommentDraft.trim()) return
    await addCommentToPost(viewingPostComments.postId, viewingPostComments.postUserId, modalCommentDraft)
    setModalCommentDraft('')
    // modal will auto-refresh via global profilePosts
  }

  const closeFullComments = () => {
    setViewingPostComments(null)
    setModalCommentDraft('')
  }

  // Delete own comment from post (polish for spectacular muro)
  const deleteCommentFromPost = async (postId: string, postUserId: string, commentId: string) => {
    if (!confirm('¿Eliminar tu comentario?')) return;
    const posts = profilePosts[postUserId] || [];
    const pIdx = posts.findIndex(p => p.id === postId);
    if (pIdx < 0) return;
    const post = posts[pIdx];
    const newComments = post.comments.filter((c: any) => c.id !== commentId);
    const updatedPost = { ...post, comments: newComments };
    const newPosts = [...posts];
    newPosts[pIdx] = updatedPost;

    if (!isDemoMode && db) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'profilePosts', postId), { comments: newComments });
        setProfilePosts((prev) => {
          const newState = { ...prev, [postUserId]: newPosts };
          try { localStorage.setItem('entrenamatch_profile_posts', JSON.stringify(newState)) } catch {}
          return newState;
        });
      } catch (e) { console.warn(e); }
    } else {
      const updated = { ...profilePosts, [postUserId]: newPosts };
      saveProfilePosts(updated);
    }
    toast.success('Comentario eliminado');
  }

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
    const updated = [newNotif, ...notifications].slice(0, 50) // keep last 50
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

    // In-app toast with action to open the right chat + avatar + more context
    toast.info(title, {
      description: (
        <div className="flex items-start gap-2 mt-0.5">
          {avatarEl}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-[#cbd5e1] truncate leading-tight">{short}</div>
            <div className="text-[10px] text-[#9CA3AF] mt-0.5">
              {isGroup ? 'Chat grupal • En vivo' : 'Mensaje 1:1 • En vivo'}
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Ver',
        onClick: () => {
          if (isGroup) {
            setActiveTab('sesiones')
            setShowGroupChatModalFor(chatId)
            setSessionUnreads(prev => { const c = { ...prev }; c[chatId] = 0; return c })
          } else {
            setActiveTab('messages')
            setActiveChat(chatId)
            setChatUnreads(prev => { const c = { ...prev }; c[chatId] = 0; return c })
          }
        }
      },
      duration: 6000
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
          // Defer state updates from notification click context (helps avoid timing/strict-mode issues in some browsers/PWAs)
          setTimeout(() => {
            if (isGroup) {
              setActiveTab('sesiones')
              setShowGroupChatModalFor(chatId)
            } else {
              setActiveTab('messages')
              setActiveChat(chatId)
            }
          }, 0)
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

  const submitTrainingReview = (profileId: string) => {
    if (!currentUser) return

    const newReview: TrainingReview = {
      id: 'r' + Date.now(),
      reviewerId: 'me',
      reviewerName: currentUser?.name || 'Anónimo',
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

          if (profile && profile.name) {
            saveUser({ ...profile, id: 'me' } as any)

            // Only force full onboarding immediately for brand new registrations.
            // For returning logins (even with incomplete profile), load what exists and let user enter the app.
            // They can complete via the Profile tab "Completar mi perfil" CTA (prevents trapping users in creation loop on every visit).
            if (isRegister) {
              const needsOnboarding =
                !profile.bio ||
                !profile.photos?.length ||
                !profile.trainingTypes?.length ||
                !profile.goals?.length
              if (needsOnboarding) {
                setShowOnboarding(true)
              }
            }
            // If complete or login, main app shows (Profile will prompt if incomplete)
          } else {
            // No profile or no name → create a minimal usable local profile immediately
            // so the UI (including Profile tab + logout) never goes black/empty.
            const minimalUser = {
              id: 'me' as any,
              name: loggedInUser.email?.split('@')[0] || 'Usuario',
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
            setShowOnboarding(true)
          }
        } catch (e) {
          console.warn('Profile load after real auth failed', e)
          // Create minimal local profile as last resort so user is never stuck without UI
          const fallbackUser = {
            id: 'me' as any,
            name: loggedInUser.email?.split('@')[0] || 'Usuario',
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

    saveUserWithRealSync(updated as CurrentUser)
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
        saveUserWithRealSync(approved as CurrentUser)

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
          await addDoc(collection(db, `sessions/${sessionId}/messages`), msgData)
          console.log('✅ Real session group message sent')

          // Update parent session doc with last activity so the sessions list shows live preview + updates via listener
          try {
            const { doc, setDoc, serverTimestamp: ts } = await import('firebase/firestore')
            await setDoc(doc(db, 'sessions', sessionId), {
              lastMessagePreview: newMsg.text ? newMsg.text.substring(0, 80) : (photo ? '[foto]' : ''),
              lastMessageAt: ts(),
              updatedAt: ts(),
            }, { merge: true })
          } catch (e) { /* non critical */ }

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

  // Remaining profiles (not swiped) - Real Firestore profiles + Seed profiles (hybrid for Pre-Alpha)
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
    
    return Array.from(unique.values()).filter(p => !swiped.has(p.id))
  }, [likedIds, passedIds, realProfiles])

  // LIVE TRAINING NOW - the killer innovative feature. Real-time who is training right now near you. Green live indicator. Creates urgency, no fitness app does this well.
  const liveTrainingNow = useMemo(() => {
    const now = Date.now();
    const ASSUMED_SESSION_MS = 90 * 60 * 1000; // 90 min typical session
    let lives = realProfiles
      .filter(p => p.trainingNow && p.trainingNowSince && (now - p.trainingNowSince < 3 * 60 * 60 * 1000)) // auto expire after 3h
      .map(p => {
        const dist = userLocation ? getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng) : 999;
        const seVaEnMs = (p.trainingNowSince + ASSUMED_SESSION_MS) - now;
        const seVaEnMin = seVaEnMs > 0 ? Math.floor(seVaEnMs / 60000) : 0;
        // Join count from the live post (comments + other likes) - makes "se unieron" visible everywhere for FOMO
        let joinCount = 0;
        const theirPosts = profilePosts[p.id] || [];
        const livePost = theirPosts.find((post: any) => (post.text || '').toLowerCase().includes('entrenando ahora')) || theirPosts[0];
        if (livePost) {
          const otherLikes = (livePost.likes || []).filter((id: string) => id !== p.id).length;
          joinCount = (livePost.comments || []).length + otherLikes;
        }
        return { ...p, distance: dist, seVaEnMin, joinCount };
      })
      .filter(p => !userLocation || p.distance < 15) // near only if we have location; otherwise show all live (so feature works even without GPS)
      .sort((a, b) => {
        // NEVER-SEEN: active sync pairs + high sync legends bubble to the top of live discovery (social proof + bond capital)
        const aSync = (a as any).trainingSyncWith ? 100 : 0;
        const bSync = (b as any).trainingSyncWith ? 100 : 0;
        const aLegend = (a as any).syncStreak || 0;
        const bLegend = (b as any).syncStreak || 0;
        if (userLocation) {
          // distance primary, but sync/legend tiebreaker
          if (aSync !== bSync) return bSync - aSync;
          if (aLegend !== bLegend) return bLegend - aLegend;
          return a.distance - b.distance;
        }
        if (aSync !== bSync) return bSync - aSync;
        if (aLegend !== bLegend) return bLegend - aLegend;
        return (b.trainingNowSince || 0) - (a.trainingNowSince || 0);
      });
    if (isDemoMode && lives.length === 0) {
      // Demo fakes for the killer feature to shine
      lives = SEED_PROFILES.slice(0, 3).map((p, i) => ({ ...p, trainingNow: true, trainingNowSince: now - (i+1)*10*60000, distance: 1 + i*2, seVaEnMin: 40 - i*10, joinCount: 1 + i }));
    }
    return lives;
  }, [realProfiles, userLocation, isDemoMode, profilePosts]);

  // Real-time urgency notifications for NEW live trainers nearby (the killer retention hook).
  // Placed HERE (after liveTrainingNow declaration) to avoid TDZ "Cannot access before initialization" on app start.
  // Fires in-app notif + toast when fresh lives appear (on loadRealProfiles refresh or 60s interval).
  // Uses seen ref + dedup inside addNotification. Guard skips pure first-load spam. Demo + real parity.
  useEffect(() => {
    if (!liveTrainingNow || liveTrainingNow.length === 0) return
    let addedNew = false
    liveTrainingNow.forEach((liveUser: any) => {
      if (!seenLiveUserIdsRef.current.has(liveUser.id)) {
        seenLiveUserIdsRef.current.add(liveUser.id)
        addedNew = true
        // Guard: only notify if we've already seen at least one before (skip init spam)
        if (seenLiveUserIdsRef.current.size > 1) {
          addNotification({
            type: 'session_join',
            title: '🟢 ¡Entrenando ahora cerca!',
            body: `${liveUser.name} está en vivo a ${(liveUser.distance || 0).toFixed(1)}km. ¡Únete ya antes de que se vaya!`,
            relatedId: liveUser.id,
            photoUrl: liveUser.photos?.[0],
          })
          toast(`🟢 ${liveUser.name} entrenando ahora cerca`, {
            description: `A ${(liveUser.distance || 0).toFixed(1)}km · se va en ~${liveUser.seVaEnMin || 40}m — ¡Ver perfil!`,
            action: {
              label: 'Ver',
              onClick: () => setShowFullProfile(liveUser as any)
            }
          })
        }
      }
    })
    if (addedNew) {
      try {
        localStorage.setItem('entrenamatch_seen_live_users', JSON.stringify(Array.from(seenLiveUserIdsRef.current)))
      } catch {}
    }
  }, [liveTrainingNow, addNotification])

  // Filtered deck (with distance support + blocking)
  // Polish: sort by best compatibility first (improves "matching quality" — high compat + close appear at top of swipe)
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
      if (filters.onlyLiveTraining && !p.trainingNow) return false
      return true
    })

    // Sort: highest compatibility first, then closest distance, slight boost for verified/real
    if (currentUser) {
      return [...filtered].sort((a, b) => {
        const ca = calculateCompatibility(currentUser, a, userLocation)
        const cb = calculateCompatibility(currentUser, b, userLocation)
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
  }, [remainingProfiles, filters, userLocation, blockedUsers, currentUser])

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
  const handleSwipe = (profileId: string, direction: 'left' | 'right') => {
    // Support both seed profiles and real Firestore profiles
    const profile = [...SEED_PROFILES, ...realProfiles].find(p => p.id === profileId)
    if (!profile) return

    if (direction === 'right') {
      const newLiked = [...likedIds, profileId]
      saveLiked(newLiked)

      const isRealProfile = !profileId.startsWith('p') && realProfiles.some(r => r.id === profileId)
      const isAutoMatch = AUTO_MATCH_IDS.includes(profileId)
      const randomMatch = Math.random() < 0.28
      const alreadyMatched = matches.includes(profileId)

      if (!alreadyMatched && (isAutoMatch || randomMatch || isRealProfile)) {
        const newMatches = [...matches, profileId]
        saveMatches(newMatches)
        
        // Seed a nice first message (works for both demo and real)
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

        bumpPwaEngagement() // PWA hint after positive engagement (match)

        // Show beautiful match modal
        setShowMatchModal(profile)
        triggerConfetti()
        toast.success(`¡Match con ${profile.name}!`, { description: isRealProfile ? '¡Match real con otro usuario!' : 'Tienen ganas de entrenar juntos 🔥' })
      } else {
        toast('Like enviado', { description: `A ${profile.name} le avisaremos si hay match` })
      }

      // Real Firebase: persist the like + match for cross-device visibility
      if (isRealProfile && firebaseUser?.uid && db) {
        (async () => {
          try {
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
            const matchId = [firebaseUser.uid, profileId].sort().join('_')

            // Write a like record (useful for future mutual matching logic)
            await setDoc(doc(db, 'likes', `${firebaseUser.uid}_${profileId}`), {
              liker: firebaseUser.uid,
              liked: profileId,
              createdAt: serverTimestamp(),
            }, { merge: true })

            // Write the match (current Pre-Alpha: auto-match for fast testing of real chat)
            await setDoc(doc(db, 'matches', matchId), {
              user1: firebaseUser.uid,
              user2: profileId,
              createdAt: serverTimestamp(),
              status: 'active',
              autoMatchedForTesting: true
            }, { merge: true })

            console.log('✅ Real like + match written to Firestore for cross-device testing')
            // Immediately load so this device also has it in realMatches (for isRealChat, bg listeners etc.)
            loadRealMatches()
          } catch (e) {
            console.warn('Could not write real like/match yet:', e)
          }
        })()
      }

      // === KILLER LIVE FEATURE: "someone joined my live" flow ===
      // When swiping right (Unirme) on a person who is trainingNow, auto-interact with their live muro post.
      // This makes the post "alive" with real join comments (visible in their muro + feed teasers).
      // For real: direct FS arrayUnion on their latest profilePost so cross-device owners see the join in thread.
      // Owner will get notified via our processor (below) when they load/refresh their posts.
      if (profile.trainingNow) {
        (async () => {
          try {
            const joinText = '¡Me uno al live ahora mismo! 🔥 ¿Dónde estás entrenando?'
            // DISRUPTIVE: auto-start EntrenaSync if both live (the unique market hook)
            // set loader for attractive feedback on any join button
            if (!joiningSyncWith) setJoiningSyncWith(profileId)
            tryAutoStartSync(profileId)
            if (!isDemoMode && firebaseUser?.uid && db) {
              // Query the target's most recent profilePost (the "¡Entrenando ahora..." one) and comment + like it
              const { collection, query, where, orderBy, limit, getDocs, doc, updateDoc, arrayUnion, serverTimestamp } = await import('firebase/firestore')
              const postsCol = collection(db, 'profilePosts')
              const q = query(postsCol, where('userId', '==', profileId), orderBy('timestamp', 'desc'), limit(1))
              const snap = await getDocs(q)
              if (!snap.empty) {
                const postRef = doc(db, 'profilePosts', snap.docs[0].id)
                const joinComment = {
                  id: 'lj' + Date.now(),
                  userId: firebaseUser.uid,
                  userName: currentUser?.name || 'Un compañero live',
                  text: joinText,
                  timestamp: Date.now()
                }
                await updateDoc(postRef, {
                  comments: arrayUnion(joinComment),
                  // bump a virtual 'liveJoins' count or just likes for visibility
                  likes: arrayUnion(firebaseUser.uid)
                })
                // Optimistic: update local profilePosts for target so liveTrainingNow joinCount updates immediately for everyone viewing
                setProfilePosts(prev => {
                  const targetPosts = prev[profileId] || []
                  const updatedPosts = targetPosts.map((p: any) => p.id === postRef.id ? { ...p, comments: [...(p.comments||[]), joinComment], likes: [...(p.likes||[]), firebaseUser.uid] } : p )
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
          description: profile.trainingNow && currentUser?.trainingNow 
            ? '¡EntrenaSync iniciado! Timer + acciones compartidas. Te llevamos al panel.' 
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

  const sendMessage = (text: string) => {
    if (!activeChat || !text.trim()) return

    const isRealChat = isRealChatId(activeChat)

    if (isRealChat) {
      // Real cross-device chat
      sendRealMessage(text, activeChat)

      // Optimistic update for both local messages and realChatMessages for instant feel
      const newMsg: Message = {
        id: Date.now().toString(36) + Math.random(),
        from: 'me',
        text: text.trim(),
        timestamp: Date.now()
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
      text: text.trim(),
      timestamp: Date.now()
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

  // Gate for unauthenticated users and profile creation
  // For real mode we also consider a just-successful auth (the hook can lag)
  const isAuthenticated = isDemoMode 
    ? !!currentUser 
    : !!firebaseUser || !!lastSuccessfulAuthRef.current

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <AuthScreen
          authMode={authMode}
          setAuthMode={setAuthMode}
          authEmail={authEmail}
          setAuthEmail={setAuthEmail}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authLoading={authLoading}
          authError={authError}
          handleEmailAuth={handleEmailAuth}
          isDemoMode={isDemoMode}
        />
      </ErrorBoundary>
    )
  }

  // For real users or demo users without full profile, show onboarding/creation flow
  const shouldShowOnboarding = showOnboarding || 
    (!isDemoMode && firebaseUser && (!currentUser || !currentUser.name ))

  if (shouldShowOnboarding) {
    return (
      <ErrorBoundary>
        <OnboardingFlow
          onboardingStep={onboardingStep}
          setOnboardingStep={setOnboardingStepLocal}
          currentUser={currentUser}
          saveUser={saveUserWithRealSync}
          setShowOnboarding={setShowOnboarding}
          requestUserLocation={requestUserLocation}
          consents={{ is18: false, isForTraining: false, sharesLocation: false }}
          setConsents={() => {}}
        />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0D0D10] text-white flex flex-col overflow-hidden relative app-container">
      {/* MINIMAL TOP BAR - Premium subtle (visual aesthetics upgrade) */}
      <div className="bg-[#1C1C20] border-b border-[#2F2F35] z-50 flex items-center justify-between px-4 py-1.5 text-[10px] font-medium">
        <div className="font-semibold tracking-[-0.2px] flex items-center gap-2 text-[#FF671F]">
          <span className="live-pill !py-0 !px-2 !text-[8px] !bg-[#FF671F]/10 !border-0">PRE-ALPHA</span>
          <span className="text-white/90">Real backend • v0.1.11-arena</span>
          <button 
            onClick={refreshAllReal} 
            disabled={isLoadingMatches}
            className="ml-1 text-[9px] px-2 py-0.5 rounded-full bg-[#FF671F]/10 text-[#FF671F] active:bg-[#FF671F]/20 disabled:opacity-60 border border-[#FF671F]/20"
            title="Refrescar perfiles, matches y sesiones reales ahora"
          >
            {isLoadingMatches ? '...' : 'Actualizar todo'}
            {liveTrainingNow.length > 0 && <span className="ml-1 text-[8px] text-[#22c55e]">+{liveTrainingNow.length} live</span>}
          </button>
          {liveTrainingNow.length > 0 && (
            <span className="ml-1 text-[8px] px-1.5 py-0.5 rounded-full bg-[#22c55e] text-black font-bold shadow-sm ring-1 ring-[#22c55e]/50" style={{animation: 'live-pulse-green 2.2s ease-in-out infinite'}}>🟢 {liveTrainingNow.length} LIVE {currentUser?.trainingNow && currentUser.liveStreak ? `🔥${currentUser.liveStreak}d` : ''}{syncPartnerId ? ' 🔄SYNC' : ''}{activeSyncCount > 0 ? ` · 🔄${activeSyncCount} PARES EN SYNC` : ''}</span>
          )}
        </div>

        {(currentUser || firebaseUser) ? (
          <div className="flex items-center gap-2">
            {/* Bell for notifications (wires to existing panel; now populated by real incoming 1:1 + group msgs) */}
            <button
              onClick={() => setShowNotifications(true)}
              className={`relative p-1.5 rounded-xl bg-black/70 active:bg-black text-white transition-all ${ (unreadNotifications + totalChatUnreads + totalSessionUnreads) > 0 ? 'ring-1 ring-[#FF4F79]/70' : '' }`}
              aria-label="Notificaciones"
            >
              <Bell size={16} />
              {(unreadNotifications + totalChatUnreads + totalSessionUnreads) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 text-[9px] font-bold rounded-full bg-[#FF4F79] text-black flex items-center justify-center">
                  {Math.min(9, unreadNotifications + totalChatUnreads + totalSessionUnreads)}
                </span>
              )}
            </button>
            <button 
              onClick={handleLogout}
              className="bg-black/90 hover:bg-black text-white px-4 py-1.5 rounded-2xl text-xs font-semibold active:bg-white active:text-black border border-black/50 transition-all"
            >
              Cerrar sesión
            </button>
            <button 
              onClick={handleLogout}
              className="bg-white hover:bg-gray-100 text-black px-4 py-1.5 rounded-2xl text-xs font-bold active:bg-gray-200 border border-black/20 shadow-sm transition-all"
            >
              Cambiar cuenta
            </button>
            {/* Always visible install button for web (mobile often needs manual trigger or extra engagement; discoverable in top bar) */}
            {!isDemoMode && typeof window !== 'undefined' && typeof (window as any).Capacitor === 'undefined' && (
              <button
                onClick={() => { 
                  // Clear dismissed temporarily so banner can show
                  localStorage.removeItem('entrenamatch_pwa_dismissed');
                  setShowPwaInstall(true); 
                  bumpPwaEngagement(); 
                }}
                className="ml-1 text-[9px] px-2 py-0.5 rounded-full bg-[#FF671F]/10 text-[#FF671F] active:bg-[#FF671F]/20 border border-[#FF671F]/20 flex-shrink-0"
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
        {/* ===== EXPLORE / SWIPE (fully owned by ExploreTab) ===== */}
        {/* LIVE TRAINING BANNER - ALWAYS VISIBLE, the star feature for urgency and retention. Green pulsing, se va en, mini photos, quick join. Makes app addictive. Top of explore for maximum impact. */}
        {activeTab === 'explore' && (
          <div className="px-4 py-2 bg-gradient-to-r from-[#0D0D10] via-[#0a2a1a] to-[#0D0D10] border-b border-[#22c55e]/40 relative overflow-hidden live-banner-glow">
            <div className="absolute inset-0 bg-[radial-gradient(#22c55e_0.5px,transparent_1px)] bg-[length:4px_4px] opacity-10"></div>
            <div className="flex items-center gap-2 mb-1 relative z-10">
              <div className="live-pill green">🟢 EN VIVO AHORA</div>
              <div className="text-sm font-semibold">{liveTrainingNow.length} entrenando cerca de ti {liveTrainingNow.some(u => u.seVaEnMin > 0) ? '· ¡urgencia!' : ''} {liveTrainingNow.length > 5 ? '· 🔥 HOT ZONE!' : ''} {liveTrainingNow.reduce((s,u)=>s+(u.joinCount||0),0) > 0 ? `· +${liveTrainingNow.reduce((s,u)=>s+(u.joinCount||0),0)} unidos hoy` : ''}{activeSyncCount > 0 ? ` · 🔄 ${activeSyncCount} pares sincronizados ahora (único)` : ''}</div>
            </div>
            {liveTrainingNow.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {liveTrainingNow.slice(0, 4).map(user => (
                  <motion.div key={user.id} onClick={() => setShowFullProfile(user)} className="min-w-[130px] card card-glass p-2 text-[10px] cursor-pointer border border-[#22c55e]/70 active:scale-95 relative overflow-hidden shadow-lg shadow-[#22c55e]/10" whileHover={{ scale: 1.04, y: -2, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(34 197 94 / 0.2)' }} whileTap={{ scale: 0.96 }} initial={{ opacity: 0.85, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1">
                        {user.photos && user.photos[0] && <img src={user.photos[0]} className="w-5 h-5 rounded-full object-cover border-2 border-[#22c55e]/60 ring-1 ring-[#22c55e]/20" />}
                        <div className="font-semibold truncate text-white drop-shadow-sm">{user.name}</div>
                      </div>
                      <div className="w-3 h-3 bg-[#22c55e] rounded-full flex-shrink-0 ring-2 ring-[#22c55e]/40" style={{animation: user.seVaEnMin < 10 ? 'live-pulse-green-urgent 1.1s ease-in-out infinite' : 'live-pulse-green 2.0s ease-in-out infinite'}}></div>
                    </div>
                    <div className="text-[#9CA3AF] text-[9px] mb-0.5 flex items-center gap-1">{userLocation && user.distance < 900 ? `${user.distance.toFixed(1)}km` : '— km'} <span className="text-[#22c55e]/70">·</span> {user.trainingTypes?.[0] || 'Entreno'}</div>
                    <div className="flex items-center gap-1 text-[#22c55e] text-[9px] mb-1">
                      <span>En vivo hace {Math.floor((Date.now() - (user.trainingNowSince || 0))/60000)}m</span>
                      {user.seVaEnMin > 0 && <span className={`text-orange-400 ${user.seVaEnMin < 20 ? 'font-bold text-red-400 animate-pulse' : ''}`}>{user.seVaEnMin < 15 ? '· se va pronto' : '· se va en'} {user.seVaEnMin}m {user.seVaEnMin < 10 ? '¡ya!' : ''}</span>}
                    </div>
                    {user.seVaEnMin > 0 && (
                      <div className="h-1 bg-[#22c55e]/20 rounded mt-0.5 mb-1">
                        <div className="h-1 bg-[#22c55e] rounded" style={{width: `${Math.max(5, Math.min(100, (90 - user.seVaEnMin)/90 * 100))}%`}}></div>
                      </div>
                    )}
                    {user.joinCount > 0 && (
                      <div className="text-[8px] text-[#22c55e] mb-1 font-medium flex items-center gap-0.5">+{user.joinCount} se unieron 🔥</div>
                    )}
                    {(user.liveStreak || user.joinedLiveStreak) && (
                      <div className="text-[8px] text-[#22c55e] mb-1">🔥{(user.liveStreak||0)}h +{(user.joinedLiveStreak||0)}j streak</div>
                    )}
                    {user.trainingSyncWith && <div className="text-[7px] text-[#22c55e] mb-1">🔄 En Sync ahora</div>}
                    {user.syncStreak && <div className="text-[7px] text-[#22c55e] mb-1">🔄 SyncStreak {user.syncStreak}d</div>}
                    <button 
                      disabled={joiningSyncWith === user.id}
                      onClick={(e)=>{e.stopPropagation(); handleSwipe(user.id,'right'); }} 
                      className={`w-full text-[9px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black py-1 rounded font-bold active:brightness-90 transition shadow-sm flex items-center justify-center gap-1 ${joiningSyncWith === user.id ? 'opacity-80 cursor-wait' : ''}`}
                    >
                      {joiningSyncWith === user.id ? (
                        <>⏳ Iniciando Sync...</>
                      ) : (
                        <>Unirme + EntrenaSync 🔥</>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="card card-glass p-6 text-center border border-[#22c55e]/30">
                <div className="text-4xl mb-2">🏋️‍♂️</div>
                <div className="font-semibold mb-1">Nadie entrenando cerca todavía</div>
                <div className="text-sm text-[#9CA3AF] mb-4">Sé el primero en activar "Entrenando Ahora (EN VIVO)" en tu Perfil. ¡Aparecerás en el radar y la gente querrá unirse o sync contigo!</div>
                <button onClick={() => setActiveTab('profile')} className="text-xs px-4 py-1.5 rounded-full bg-[#22c55e] text-black font-bold active:brightness-90">Ir a Perfil y activar live →</button>
              </div>
            )}
            <div className="text-[9px] text-[#9CA3AF] mt-0.5 flex justify-between items-center">
              <span>¡Urgencia real! Toca para ver o únete antes de que se vayan. Nadie lo tiene tan bien.</span>
              <button onClick={() => setShowLiveModal(true)} className="text-[#22c55e] underline active:text-white">Ver todos live →</button>
            </div>
          </div>
        )}

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
            onReport={(id) => {
              // Polished: quick confirm instead of prompt for pre-alpha safety
              if (confirm('¿Reportar este perfil por comportamiento inadecuado o spam?')) {
                reportUser(id, 'Comportamiento inadecuado', undefined, 'explore_rec', id);
              }
            }}
            realProfiles={realProfiles}
            onRefreshRealProfiles={async () => { await loadRealProfiles(); setLastSync(new Date()); }}
            lastSync={lastSync}
            profilePosts={profilePosts}
          />
        )}

        {/* FULL LIVE MODAL - spectacular full list of live training near you. Enhanced with search, sort by dist/urgency, quick chat, simple visual "map" row (dots sorted by dist). Makes the killer feature even stronger. */}
        {showLiveModal && (
          <div className="absolute inset-0 z-[95] bg-[#0D0D10] flex flex-col" onClick={() => { setShowLiveModal(false); setLiveModalSearch(''); setLiveModalSort('distance'); }}>
            <div className="p-4 flex items-center justify-between border-b border-[#2F2F35]">
              <button onClick={() => { setShowLiveModal(false); setLiveModalSearch(''); setLiveModalSort('distance'); }}><ArrowLeft /></button>
              <div className="font-medium flex items-center gap-2">Entrenando Ahora cerca ({liveTrainingNow.length}) {liveTrainingNow.some(u => u.seVaEnMin > 0) && <span className="text-orange-400 text-xs">¡urgencia!</span>} {liveTrainingNow.length > 5 && <span className="text-[#22c55e] text-xs">🔥 HOT</span>}</div>
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
                  {liveModalSort === 'distance' ? '📍 Dist' : liveModalSort === 'urgency' ? '⏱ Urgencia' : '🔥 Hot'}
                </button>
              </div>
            )}

            {/* Simple visual "map" row: mini avatars + pulsing dots sorted by distance (emoji radar feel, FOMO visual) - enhanced */}
            {liveTrainingNow.length > 1 && (
              <div className="px-4 py-2 border-b border-[#2F2F35]/50 bg-black/30 radar-container">
                <div className="radar-lines"></div>
                <div className="text-[8px] text-[#9CA3AF] mb-1">Cerca de ti (radar ordenado por distancia)</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[...liveTrainingNow].sort((a,b)=> (a.distance||0)-(b.distance||0)).map((u, idx) => (
                    <motion.div key={u.id} onClick={() => { setShowLiveModal(false); setShowFullProfile(u); }} whileHover={{scale:1.1}} whileTap={{scale:0.9}} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: idx * 0.05}} className="flex flex-col items-center text-center cursor-pointer active:opacity-80">
                      <div className="relative">
                        {u.photos?.[0] ? <img src={u.photos[0]} className="w-9 h-9 rounded-full object-cover border-2 border-[#22c55e]/60" /> : <div className="w-9 h-9 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[10px] border border-[#22c55e]/30">{u.name[0]}</div>}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] rounded-full ring-2 ring-black" style={{animation: u.seVaEnMin < 10 ? 'live-pulse-green-urgent 1.1s ease-in-out infinite' : 'live-pulse-green 1.8s ease-in-out infinite'}}></div>
                      </div>
                      <div className="text-[8px] mt-0.5 text-white truncate max-w-[48px] font-medium">{u.name.split(' ')[0]}</div>
                      <div className="text-[7px] text-[#22c55e]">{(u.distance||0).toFixed(0)}km {u.joinCount > 0 ? `+${u.joinCount}🔥` : ''}</div>
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
                      <div className="font-semibold flex items-center gap-1.5 text-white">{user.name} <span className="text-[#9CA3AF] text-xs font-normal">· {userLocation && user.distance < 900 ? `${user.distance.toFixed(1)}km` : '— km'}</span></div>
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
                    </div>
                    <div className="flex flex-col gap-1 self-center">
                      <button 
                        disabled={joiningSyncWith === user.id}
                        onClick={(e) => { e.stopPropagation(); handleSwipe(user.id, 'right'); setShowLiveModal(false); }} 
                        className={`text-[10px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black px-3 py-1 rounded font-semibold active:brightness-90 flex items-center justify-center gap-1 ${joiningSyncWith === user.id ? 'opacity-80 cursor-wait' : ''}`}
                      >
                        {joiningSyncWith === user.id ? '⏳ Iniciando...' : 'Unirme'}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setShowLiveModal(false); openChat(user.id); if (!matches.includes(user.id) && !realMatches.includes(user.id)) handleSwipe(user.id, 'right'); }} className="text-[9px] border border-[#22c55e]/60 text-[#22c55e] px-2 py-0.5 rounded active:bg-[#22c55e]/10 hover:bg-[#22c55e]/5">Chatear ya</button>
                    </div>
                  </div>
                )) : (
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
              <div className="text-center text-xs text-[#9CA3AF] mb-2">Toca card → perfil. Unirme = like + auto-comment en su muro live. ¡La urgencia hace que abras seguido!</div>
              {liveTrainingNow.length >= 2 && (
                <button
                  onClick={() => {
                    setShowLiveModal(false)
                    // Quick group session polish: create an optimistic session with the current live people + self
                    const liveNames = liveTrainingNow.slice(0, 4).map(u => u.name.split(' ')[0]).join(', ')
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
                          const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
                          await addDoc(collection(db, 'sessions'), {
                            ...newGroupSession,
                            createdAt: serverTimestamp()
                          })
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

        {/* ===== GLOBAL FEED TAB - Muro Comunitario (per plan: global recent activity feed) ===== */}
        {activeTab === 'feed' && (
          <div className="flex-1 overflow-auto p-4">
            <div className="sticky top-0 bg-[#0D0D10]/95 backdrop-blur-md z-10 -mx-4 px-4 pb-4 border-b border-[#2F2F35]/50">
              <div className="flex items-center justify-between mb-2 px-1">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🔥</div>
                    <div>
                      <div className="font-bold text-xl tracking-[-0.5px] bg-gradient-to-r from-[#FF671F] via-[#FF4F79] to-[#FF671F] bg-clip-text text-transparent">EL MURO</div>
                      <div className="text-[10px] text-[#9CA3AF] -mt-0.5">de la comunidad • donde el entreno se vuelve leyenda</div>
                    </div>
                  </div>
                  <div className="text-[#9CA3AF] text-xs flex items-center gap-1.5 mt-1.5">
                    El feed icónico de EntrenaMatch
                    {liveTrainingNow.length > 0 && <span className="text-[8px] ml-1 px-1.5 py-0.5 rounded-full bg-[#22c55e] text-black font-bold shadow-sm ring-1 ring-[#22c55e]/50">🟢 {liveTrainingNow.length} LIVE AHORA</span>}
                    {activeSyncCount > 0 && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] font-bold">🔄 {activeSyncCount} EN SYNC</span>}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex gap-2 items-center mb-1.5">
                    <input 
                      type="text" 
                      value={feedSearch} 
                      onChange={e => setFeedSearch(e.target.value)}
                      placeholder="Buscar posts..."
                      className="form-input text-xs py-1 px-3 flex-1 min-w-[80px] rounded-2xl"
                    />
                    <button onClick={() => setShowFeedPostModal(true)} className="text-[9px] px-3 py-1 rounded-2xl bg-gradient-to-r from-[#FF671F] to-[#FF4F79] text-black font-bold active:brightness-90 shadow-sm flex items-center gap-1 flex-shrink-0">
                      <Plus className="w-3 h-3" /> Publicar
                    </button>
                  </div>

                  {/* NEVER-SEEN GLOBAL FOMO: active EntrenaSync pairs happening RIGHT NOW across the community.
                      Clicking one can inspire or (if you are live) quick-join the culture of training together. */}
                  {activeSyncPairs.length > 0 && (
                    <div className="text-[9px] mb-1 px-0.5 flex items-center gap-1 text-[#22c55e]/90">
                      <span className="font-bold">🔄 {activeSyncPairs.length} pares en arena ahora:</span>
                      {activeSyncPairs.map((pr, i) => (
                        <span key={i} className="px-1.5 py-px rounded bg-[#22c55e]/10 text-[#22c55e]">{pr.names} <span className="opacity-60">{pr.vibe}%</span></span>
                      ))}
                    </div>
                  )}

                  {/* FILTERS - ahora scroll horizontal para que "live" y "fijados" se puedan mover bien visualmente en pantallas chicas */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
                    <button 
                      onClick={() => setFeedOnlyReal(!feedOnlyReal)}
                      className={`text-[9px] px-2.5 py-1 rounded-2xl border transition-all active:scale-95 flex-shrink-0 snap-start ${feedOnlyReal ? 'bg-[#FF671F] text-black border-[#FF671F] shadow-sm' : 'border-[#FF671F]/40 text-[#FF671F] hover:bg-[#FF671F]/10'}`}
                    >
                      {feedOnlyReal ? '★ Reales' : 'REAL'}
                    </button>
                    <button 
                      onClick={() => setFeedOnlyLive(!feedOnlyLive)}
                      className={`text-[9px] px-2.5 py-1 rounded-2xl border transition-all active:scale-95 flex-shrink-0 snap-start ${feedOnlyLive ? 'bg-[#22c55e] text-black border-[#22c55e] shadow-sm' : 'border-[#22c55e]/40 text-[#22c55e] hover:bg-[#22c55e]/10'}`}
                    >
                      {feedOnlyLive ? '🟢 Live' : '🟢 Live'}
                    </button>
                    <button 
                      onClick={() => setFeedShowPinnedOnly(!feedShowPinnedOnly)}
                      className={`text-[9px] px-2.5 py-1 rounded-2xl border transition-all active:scale-95 flex-shrink-0 snap-start ${feedShowPinnedOnly ? 'bg-[#FF671F] text-black border-[#FF671F] shadow-sm' : 'border-[#FF671F]/40 text-[#FF671F] hover:bg-[#FF671F]/10'}`}
                    >
                      {feedShowPinnedOnly ? '📌 Fijados' : '📌 Fijados'}
                    </button>
                    <button 
                      onClick={() => { setFeedMaxProfiles(15); setFeedDisplayLimit(10); loadGlobalFeed(); if (!isDemoMode) loadRealProfiles(); }} 
                      disabled={isLoadingFeed}
                      className="text-[9px] px-2.5 py-1 rounded-2xl border border-[#FF671F]/40 text-[#FF671F] active:bg-[#FF671F]/10 active:scale-95 flex-shrink-0 snap-start"
                    >
                      {isLoadingFeed ? 'Cargando...' : '↻ Actualizar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showFeedPublishSuccess && (
              <div className="mb-3 mx-1 p-3 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-2xl text-center text-[#22c55e] text-sm font-medium flex items-center justify-center gap-2">
                🎉 ¡Tu post se publicó en el Feed! Aparece arriba en la lista.
              </div>
            )}

            {liveTrainingNow.length > 0 && (
              <div className="mb-4 -mx-1">
                <div className="text-[8px] uppercase tracking-[1px] text-[#22c55e]/80 mb-1.5 px-2 font-bold flex items-center gap-1">🔥 EN VIVO AHORA EN LA COMUNIDAD {liveTrainingNow.length > 5 && <span className="text-red-400">HOT ZONE</span>}</div>
                <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                  {liveTrainingNow.slice(0,4).map((u, idx) => (
                    <motion.div 
                      key={u.id} 
                      onClick={() => setActiveTab('explore')} 
                      whileHover={{scale:1.03, y:-2}} 
                      whileTap={{scale:0.97}} 
                      initial={{opacity:0, x:10}}
                      animate={{opacity:1, x:0}}
                      transition={{delay: idx*0.03}}
                      className="text-[9px] bg-[#0a120f] border border-[#22c55e]/40 text-[#22c55e] px-3 py-1.5 rounded-2xl cursor-pointer active:bg-[#22c55e]/10 flex flex-col min-w-[92px] shadow-sm hover:border-[#22c55e]/70"
                    >
                      <div className="font-bold flex items-center gap-1 text-white/90">{u.name.split(' ')[0]} <span className="text-[7px] text-[#9CA3AF]">{userLocation && u.distance < 900 ? `${u.distance.toFixed(0)}km` : '—'}</span></div>
                      {u.seVaEnMin > 0 && <div className="text-[7px] text-orange-400">{u.seVaEnMin < 15 ? '🔥 se va pronto' : `se va en ${u.seVaEnMin}m`}</div>}
                      {u.joinCount > 0 && <div className="text-[7px] text-[#22c55e]/70">+{u.joinCount} se unieron</div>}
                      {u.trainingSyncWith && <div className="text-[7px] text-[#22c55e] mt-0.5">🔄 En Sync ahora</div>}
                      {u.seVaEnMin > 0 && <div className="h-px bg-[#22c55e]/20 mt-1"><div className="h-px bg-[#22c55e]" style={{width: `${Math.max(8, Math.min(100, (90 - u.seVaEnMin)/90 * 100))}%`}}></div></div>}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {(() => {
              // Collect and sort recent posts from all loaded users (exclude self)
              // useMemo to avoid recompute on every render - helps "update gigante" feel
              const feedComputation = React.useMemo(() => {
                const allCommunityPosts = Object.entries(profilePosts)
                  .filter(([uid]) => uid !== effectiveUserId)
                  .flatMap(([uid, posts]) => (posts || []).map((p: any) => ({ ...p, ownerId: uid })));

                let feedPosts = [...allCommunityPosts]
                  .sort((a: any, b: any) => {
                    if (b.pinned && !a.pinned) return 1;
                    if (a.pinned && !b.pinned) return -1;
                    return b.timestamp - a.timestamp;
                  });
                if (feedShowPinnedOnly) feedPosts = feedPosts.filter((p: any) => p.pinned);
                if (feedOnlyReal) feedPosts = feedPosts.filter((p: any) => realProfiles.some(rp => rp.id === p.ownerId));
                if (feedOnlyLive) feedPosts = feedPosts.filter((p: any) => realProfiles.some(rp => rp.id === p.ownerId && rp.trainingNow));
                if (feedSearch.trim()) {
                  const q = feedSearch.toLowerCase().trim();
                  feedPosts = feedPosts.filter((p: any) => {
                    const owner = realProfiles.find(r => r.id === p.ownerId) || { name: '' };
                    return (p.text || '').toLowerCase().includes(q) || (owner.name || '').toLowerCase().includes(q);
                  });
                }
                feedPosts = feedPosts.slice(0, feedDisplayLimit);
                return { feedPosts, allCommunityPosts };
              }, [profilePosts, feedShowPinnedOnly, feedOnlyReal, feedOnlyLive, feedSearch, feedDisplayLimit, realProfiles, effectiveUserId]);

              const { feedPosts, allCommunityPosts } = feedComputation;

              if (isLoadingFeed && feedPosts.length === 0) {
                return (
                  <div className="space-y-3 mt-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="card card-glass p-4 mb-3 rounded-2xl animate-pulse">
                        <div className="h-4 bg-[#2F2F35] rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-[#2F2F35] rounded w-2/3 mb-1"></div>
                        <div className="h-3 bg-[#2F2F35] rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                );
              }
              if (feedPosts.length === 0) {
                return (
                  <div className="card card-glass p-10 rounded-3xl text-center mt-6 border border-[#FF671F]/20">
                    <div className="text-5xl mb-4">🏋️‍♂️</div>
                    <div className="font-bold text-2xl mb-2 tracking-tight">El feed está despertando</div>
                    <p className="text-sm text-[#9CA3AF] max-w-[280px] mx-auto mb-5">Sé el primero en publicar un entreno, una foto o un "¡me uno!". Los posts de la comunidad real aparecen aquí en vivo con likes, comentarios y urgencia.</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button onClick={() => setShowFeedPostModal(true)} className="btn-primary px-8 py-2.5 text-sm">Publicar en el Feed</button>
                      {!isDemoMode && <button onClick={() => { setFeedMaxProfiles(15); loadGlobalFeed(); }} className="px-6 py-2.5 border border-[#FF671F]/50 text-[#FF671F] rounded-2xl text-sm active:bg-[#FF671F]/10">Cargar más comunidad</button>}
                    </div>
                    <div className="text-[10px] text-[#9CA3AF]/60 mt-4">Tip: Fija tus posts para que destaquen en el feed global</div>
                  </div>
                );
              }

              return (
                <>
                  <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] mb-2 px-1 font-medium">
                    <span>{feedPosts.length} posts de la comunidad {feedSearch || feedOnlyReal || feedShowPinnedOnly || feedOnlyLive ? '· filtrados' : '· recientes'}</span>
                    {(feedSearch || feedOnlyReal || feedShowPinnedOnly || feedOnlyLive) && <button onClick={() => { setFeedSearch(''); setFeedOnlyReal(false); setFeedShowPinnedOnly(false); setFeedOnlyLive(false); }} className="text-[#FF671F] underline active:text-white">limpiar</button>}
                  </div>
                  {(() => {
                    const pinnedInFeed = allCommunityPosts.filter((p: any) => p.pinned);
                    if (pinnedInFeed.length > 0 && !feedShowPinnedOnly && !feedSearch && !feedOnlyReal && !feedOnlyLive) {
                      return <div className="text-[9px] text-[#FF671F] mb-2 px-1">📌 {pinnedInFeed.length} posts fijados destacados arriba</div>;
                    }
                    return null;
                  })()}
                  <AnimatePresence>
                  {feedPosts.map((post: any, idx: number) => {
                    const ownerProfile = realProfiles.find(r => r.id === post.ownerId);
                    const owner = ownerProfile || { name: 'Compañero', id: post.ownerId, photos: [] };
                    const liked = post.likes.includes(effectiveUserId);
                    const isOwnPost = post.ownerId === effectiveUserId;
                    return (
                      <motion.div 
                        key={post.id} 
                        className={`muro-post p-4 mb-3 rounded-2xl ${post.pinned ? 'muro-post--pinned' : ''} ${ (post.text || '').toLowerCase().includes('sincronizado') ? 'muro-post--sync' : (post.text || '').toLowerCase().includes('entrenando ahora') || (post.text || '').includes('me uno al live') ? 'muro-post--live' : '' } ${recentlyPublishedPostId === post.id ? 'ring-2 ring-[#FF671F] shadow-lg shadow-[#FF671F]/20' : ''} hover:border-[#FF671F]/40 overflow-hidden transition-all`}
                        initial={{ opacity: 0, y: 16, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98, height: 0, marginBottom: 0 }}
                        whileHover={{ scale: 1.012, y: -3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: Math.min(idx * 0.015, 0.2) }}
                      >
                        {/* Owner header with photo - premium */}
                        <div className="flex items-center gap-2.5 mb-2.5" onClick={() => setShowFullProfile(owner as any)} style={{cursor: 'pointer'}}>
                          {owner.photos && owner.photos[0] ? (
                            <img src={owner.photos[0]} className={`w-7 h-7 rounded-full object-cover border-2 ${ownerProfile?.trainingNow ? 'border-[#22c55e] ring-1 ring-[#22c55e]/30' : 'border-[#2F2F35]'}`} />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-[#2F2F35] flex items-center justify-center text-[10px] ring-1 ring-inset ring-[#FF671F]/20">👤</div>
                          )}
                          <div className="text-sm text-[#FF671F] font-semibold flex-1 flex items-center gap-1.5">
                            {owner.name}
                            {ownerProfile && ownerProfile.city && <span className="text-[#9CA3AF] text-[10px] font-normal">· {ownerProfile.city}</span>}
                            {ownerProfile && ownerProfile.level && <span className="text-[8px] px-1 py-px bg-[#FF671F]/10 text-[#FF671F]/80 rounded">{ownerProfile.level}</span>}
                            {ownerProfile && realProfiles.some(rp => rp.id === post.ownerId) && <span className="text-[8px] bg-[#FF671F] text-black px-1.5 rounded font-bold">REAL</span>}
                            {ownerProfile?.trainingNow && <span className="live-pill bg-[#22c55e] text-black text-[8px] ml-0.5">🟢 LIVE {ownerProfile.liveStreak ? `🔥${ownerProfile.liveStreak}d` : ''}</span>}
                            {ownerProfile?.trainingSyncWith && <span className="text-[8px] px-1.5 py-px rounded-full bg-[#22c55e]/10 text-[#22c55e] font-bold ml-0.5">🔄 SYNC</span>}
                            {(post.text || '').toLowerCase().includes('sincronizado') && <span className="text-[8px] bg-[#22c55e] text-black px-1.5 py-px rounded-full font-bold ml-0.5">🔄 SYNC SESSION</span>}
                            {(post.text || '').toLowerCase().includes('me uno al live') && <span className="text-[8px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black px-1.5 py-px rounded-full font-bold shadow">🔥 JOIN</span>}
                          </div>
                          <div className="text-[9px] text-[#9CA3AF] tabular-nums">{getRelativeTime(post.timestamp)}</div>
                          {post.pinned && <span className="text-[8px] px-1 py-px bg-[#FF671F]/20 text-[#FF671F] rounded">📌 FIJADO</span>}
                          {Date.now() - post.timestamp < 3600000 && <span className="text-[8px] bg-[#22c55e] text-black px-1 rounded font-bold">NUEVO</span>}
                          {recentlyPublishedPostId === post.id && <span className="text-[8px] bg-[#FF671F] text-black px-1.5 rounded font-bold animate-pulse">¡ACABAS DE PUBLICAR!</span>}
                        </div>

                        <div className="text-[13px] leading-snug mb-2.5 text-white/95">{post.text}</div>
                        {post.photo && (
                          <div 
                            className="relative mb-3 -mx-1 rounded-2xl overflow-hidden ring-1 ring-[#2F2F35] cursor-pointer group"
                            onClick={() => setFeedPhotoModal({ url: post.photo, postId: post.id })}
                          >
                            <img src={post.photo} className="w-full max-h-[240px] object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">🔍 ver foto</div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-sm pt-1">
                          <button 
                            onClick={() => likeProfilePost(post.id, post.ownerId)}
                            className={`flex items-center gap-1.5 transition active:scale-95 ${liked ? 'text-[#FF671F]' : 'text-[#9CA3AF] hover:text-[#FF671F]'}`}
                          >
                            <motion.span animate={{ scale: liked ? [1, 1.4, 1] : 1 }} transition={{duration: 0.2}} className="text-base">{liked ? '❤️' : '🤍'}</motion.span> 
                            <span className="font-semibold tabular-nums">{post.likes.length}</span>
                          </button>
                          <button 
                            onClick={() => startComment(post.id, post.ownerId, owner.name)}
                            className="flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#FF671F] active:scale-95"
                          >
                            💬 <span className="font-semibold tabular-nums">{post.comments.length}</span>
                          </button>

                          {isOwnPost && (
                            <>
                              <button 
                                onClick={() => togglePinPost(post.id, post.ownerId, post.pinned)}
                                className={`text-xs ml-0.5 px-1 py-0.5 rounded active:scale-95 ${post.pinned ? 'text-[#FF671F]' : 'text-[#9CA3AF] active:text-[#FF671F]'}`}
                                title={post.pinned ? 'Desfijar del feed' : 'Fijar en feed global'}
                              >
                                📌
                              </button>
                              <button 
                                onClick={() => deleteProfilePost(post.id, post.ownerId)}
                                className="text-red-400 text-xs ml-0.5 px-1 py-0.5 active:text-red-500 active:scale-95"
                              >
                                🗑
                              </button>
                            </>
                          )}

                          <button onClick={() => setShowFullProfile(owner as any)} className="ml-auto text-[10px] text-[#FF671F] active:underline hover:text-white font-medium">Ver perfil →</button>
                        </div>

                        {/* ICONIC Quick reactions - satisfying, visual pop, part of the signature muro experience */}
                        <div className="flex gap-1.5 mt-2 -ml-0.5">
                          {['🔥','💪','❤️','👏'].map(emo => {
                            const count = (feedReactions[post.id]?.[emo] || 0)
                            const active = count > 0
                            return (
                              <button 
                                key={emo}
                                onClick={() => { boostReaction(post.id, emo); triggerHaptic('light'); }}
                                className={`muro-reaction px-2.5 py-1 rounded-full border flex items-center gap-1 transition-all active:scale-90 ${active ? 'active' : 'bg-[#1C1C20] border-[#2F2F35] hover:border-[#FF671F]/40'}`}
                              >
                                <span className="text-base">{emo}</span>
                                {count > 0 && <span className="count text-[#FF671F] font-bold tabular-nums text-xs">{count}</span>}
                              </button>
                            )
                          })}
                        </div>

                        {post.comments.length > 0 && (
                          <div onClick={() => openFullComments(post.id, post.ownerId, owner.name)} className="mt-2.5 pt-2 border-t border-[#2F2F35]/70 text-[11px] text-[#9CA3AF] cursor-pointer bg-[#0a0a0c]/30 -mx-1 px-2 py-1 rounded-xl space-y-1">
                            {post.comments.slice(-2).map((c: any) => (
                              <div key={c.id} className="flex gap-1.5 items-start">
                                <span className="font-semibold text-white/90 text-[10px] mt-px">{c.userName}</span> 
                                <span className="truncate text-[10px] text-white/70">{c.text}</span>
                              </div>
                            ))}
                            {post.comments.length > 2 && <div className="text-[#FF671F] text-[9px] font-medium pl-0.5">+{post.comments.length-2} comentarios más • ver hilo</div>}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  </AnimatePresence>

                  {feedPosts.length < allCommunityPosts.length && (
                    <div className="text-center mt-3">
                      <button onClick={() => setFeedDisplayLimit(feedDisplayLimit + 10)} className="text-xs px-4 py-1.5 rounded-2xl border border-[#FF671F]/30 text-[#FF671F] active:bg-[#FF671F]/10 active:scale-95">Cargar más posts de la comunidad →</button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* ATTRACTIVE DIRECT POST MODAL FROM FEED - no more disappointing jump to profile. User stays in feed context, posts, sees it appear immediately. */}
        {activeTab === 'feed' && showFeedPostModal && (
          <div className="absolute inset-0 z-[95] bg-black/80 flex items-end md:items-center justify-center p-0 md:p-6" onClick={() => setShowFeedPostModal(false)}>
            <div 
              className="w-full md:w-[480px] card-glass rounded-t-3xl md:rounded-3xl p-5 md:p-6 text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🔥</div>
                  <div>
                    <div className="font-bold text-lg">Publicar en el Feed Global</div>
                    <div className="text-xs text-[#9CA3AF]">Tu post aparecerá en el muro de la comunidad en vivo</div>
                  </div>
                </div>
                <button onClick={() => { setShowFeedPostModal(false); setFeedPostText(''); setFeedPostPhoto(null); }} className="text-[#9CA3AF] text-xl">✕</button>
              </div>

              <textarea
                value={feedPostText}
                onChange={e => setFeedPostText(e.target.value)}
                placeholder="¿Qué entrenaste hoy? Comparte un logro, una foto del gym, un '¡me uno!' o motivación para la comunidad..."
                className="form-input w-full h-28 text-base resize-y mb-3"
                maxLength={280}
                autoFocus
              />

              {feedPhotoUploading && (
                <div className="mb-3">
                  <div className="text-[10px] text-[#9CA3AF] mb-1">Subiendo foto al Feed...</div>
                  <div className="w-full h-2 bg-[#2F2F35] rounded-full overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-[#FF671F] to-[#FF4F79] transition-all" style={{ width: `${feedPhotoUploadProgress}%` }} />
                  </div>
                  <div className="text-[9px] text-right text-[#FF671F]">{feedPhotoUploadProgress}%</div>
                </div>
              )}
              {feedPostPhoto && !feedPhotoUploading && (
                <div className="mb-3">
                  <div className="text-[10px] text-[#9CA3AF] mb-1">Foto del entreno</div>
                  <div className="relative inline-block">
                    <img src={feedPostPhoto} className="w-full max-h-40 rounded-2xl border-2 border-[#FF671F]/30 object-cover shadow-sm" />
                    <button 
                      onClick={() => setFeedPostPhoto(null)} 
                      className="absolute -top-2 -right-2 bg-[#1C1C20] hover:bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border border-[#2F2F35] transition-colors"
                      title="Quitar foto"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (Capacitor.isNativePlatform() && CapacitorCamera) {
                      (async () => {
                        try {
                          const photo = await CapacitorCamera.getPhoto({
                            quality: 80,
                            allowEditing: true,
                            resultType: 'base64'
                          });
                          if (photo?.base64String) {
                            const dataUrl = `data:image/jpeg;base64,${photo.base64String}`;
                            if (!isDemoMode && storage) {
                              setFeedPhotoUploading(true);
                              setFeedPhotoUploadProgress(0);
                              const { ref, uploadString, getDownloadURL } = await import('firebase/storage');
                              const path = `posts/${effectiveUserId}/feed-${Date.now()}.jpg`;
                              const storageRef = ref(storage, path);
                              const snap = await uploadString(storageRef, dataUrl, 'data_url');
                              const url = await getDownloadURL(snap.ref);
                              setFeedPostPhoto(url);
                              setFeedPhotoUploading(false);
                            } else {
                              setFeedPostPhoto(dataUrl);
                            }
                          }
                        } catch (e) {
                          toast('No se pudo agregar foto');
                          setFeedPhotoUploading(false);
                        }
                      })();
                    } else {
                      feedPhotoInputRef.current?.click();
                    }
                  }}
                  className="flex-1 py-2.5 text-sm border border-[#2F2F35] rounded-2xl active:bg-[#25252A] flex items-center justify-center gap-1 hover:border-[#FF671F]/40 transition-colors"
                >
                  📷 {feedPostPhoto ? 'Cambiar foto' : 'Añadir foto'}
                </button>
                <input
                  ref={feedPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFeedPhotoFile}
                  className="hidden"
                />

                <button 
                  onClick={async () => {
                    if (!feedPostText.trim()) return;
                    const text = feedPostText.trim();
                    const photo = feedPostPhoto;
                    setFeedPublishing(true);
                    try {
                      await createProfilePost(text, photo);
                      setShowFeedPostModal(false);
                      setFeedPostText('');
                      setFeedPostPhoto(null);
                      setFeedPublishing(false);
                      setShowFeedPublishSuccess(true);
                      setTimeout(() => setShowFeedPublishSuccess(false), 4000);
                      toast.success('¡Publicado en el Feed!', { 
                        description: 'Tu post ya está visible para toda la comunidad. ¡Gracias por aportar!' 
                      });
                      if (activeTab === 'feed') loadGlobalFeed().catch(() => {});
                      try { confetti({ particleCount: 100, spread: 65, origin: { y: 0.7 } }); } catch {}
                    } catch (e) {
                      setFeedPublishing(false);
                      toast.error('Error al publicar');
                    }
                  }}
                  disabled={!feedPostText.trim() || feedPublishing}
                  className="flex-1 btn-primary text-sm py-2.5 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {feedPublishing ? 'Publicando...' : 'Publicar en el Feed'}
                </button>
              </div>

              <div className="text-[10px] text-center text-[#9CA3AF] mt-3">Los posts son visibles para todos • reacciones y comentarios en vivo</div>
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

        {/* ===== SQUADS (Fixed training crews) - New unique feature ===== */}
        {activeTab === 'squads' && (
          <div className="flex-1 overflow-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="section-header">Tus Squads</div>
                <div className="text-[#9CA3AF] text-sm">Grupos fijos (próximamente real)</div>
              </div>
              <button 
                onClick={() => setShowCreateSquad(true)}
                className="flex items-center gap-2 bg-[#FF671F] text-black px-4 py-2 rounded-2xl text-sm font-semibold active:bg-[#E55A1A]"
              >
                <Plus size={16} /> Crear Squad
              </button>
            </div>

            {squads.length === 0 ? (
              <div className="card p-8 rounded-3xl text-center mt-8">
                <Users className="mx-auto text-[#FF671F] mb-3" size={42} />
                <div className="font-semibold mb-2">Sé el primero en crear un Squad</div>
                <p className="text-sm text-[#9CA3AF] mb-4 max-w-[280px] mx-auto">
                  Los squads son grupos fijos de 3-4 personas para entrenar consistentemente. 
                  Esta es una de las features que más queremos probar.
                </p>
                <p className="text-xs text-[#9CA3AF] mb-4">Crea uno con foco (gym, running, calistenia...) e invita a otros testers. Cuéntanos cómo se siente el chat grupal.</p>
                <button 
                  onClick={() => setShowCreateSquad(true)}
                  className="px-6 py-2.5 bg-[#FF671F] text-black rounded-2xl text-sm font-semibold active:bg-[#E55A1A]"
                >
                  Crear mi primer Squad
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {squads.map(squad => {
                  const isMember = squad.members.includes(effectiveUserId)
                  const spots = 4 - squad.members.length

                  return (
                    <div key={squad.id} className="card card-glass session-card rounded-3xl p-4 active:bg-[#25252A] border border-[#FF671F]/20" onClick={() => setSelectedSquad(squad.id)}>
                      <div className="flex justify-between">
                        <div>
                          <div className="font-semibold text-lg flex items-center gap-2 tracking-tight">{squad.name} <span className="text-[9px] bg-[#FF671F]/10 text-[#FF671F] px-1.5 py-0.5 rounded font-medium">SQUAD</span></div>
                          <div className="text-sm text-[#FF671F] font-medium mt-0.5">{squad.focus}</div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="text-[#22c55e] font-medium">{squad.members.length}/4</div>
                          {!isMember && spots > 0 && <div className="text-[#9CA3AF] mt-0.5">cupos</div>}
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center text-sm">
                        <div className="text-[#9CA3AF] text-xs">
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
                            className="bg-[#FF671F] text-black text-xs px-4 py-1.5 rounded-2xl font-medium active:bg-[#E55A1A]"
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
                            className="text-xs border border-[#FF671F] text-[#FF671F] px-3 py-1.5 rounded-2xl font-medium active:bg-[#FF671F] active:text-black"
                          >
                            Abrir chat
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
                <div className="section-header">Sesiones</div>
                <div className="text-[#9CA3AF] text-sm">Entrenamientos grupales cerca de ti</div>
                {!isDemoMode && (
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={async () => {
                        setIsLoadingSessions(true)
                        try { await loadRealSessions() } finally { setIsLoadingSessions(false) }
                      }}
                      disabled={isLoadingSessions}
                      className="text-xs px-3 py-1 rounded-2xl bg-[#FF671F] text-black font-semibold active:bg-[#E55A1A] disabled:opacity-60"
                    >
                      {isLoadingSessions ? 'Actualizando...' : 'Actualizar sesiones reales'}
                    </button>
                    {lastSync && <span className="text-[10px] text-[#9CA3AF]">· hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</span>}
                    <span className="live-pill">● en vivo</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowCreateSession(true)}
                className="flex items-center gap-2 bg-[#FF671F] text-black px-4 py-2 rounded-2xl text-sm font-semibold active:bg-[#E55A1A]"
              >
                <Plus size={16} /> Crear
              </button>
            </div>

            {/* === SESIONES ABIERTAS === */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-lg font-semibold">Sesiones abiertas</div>
                <div className="text-xs px-2 py-0.5 bg-[#2F2F35] rounded-full text-[#9CA3AF]">
                  {displaySessions.filter(s => !s.participants.includes(effectiveUserId)).length}
                </div>
              </div>
              <div className="text-[10px] text-[#9CA3AF] -mt-2 mb-3">Sesiones visibles para testers reales • chat grupal en vivo</div>

              {displaySessions.filter(s => !s.participants.includes(effectiveUserId)).length === 0 ? (
                <div className="mt-4 card card-glass p-7 rounded-3xl text-center border border-[#FF671F]/20">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-[#1C1C20] flex items-center justify-center mb-4">
                    <Users className="text-[#FF671F]" size={28} />
                  </div>
                  <div className="font-semibold text-lg mb-2">No hay sesiones abiertas todavía</div>
                  <p className="text-sm text-[#9CA3AF] leading-snug mb-4 max-w-[280px] mx-auto">
                    { !isDemoMode ? 'Aún no hay sesiones activas de otros testers. ¡Sé el primero!' : 'Sé el primero en crear una.' } Se ven en vivo para todos y el chat grupal funciona cross-device. ¡Crea y abre la app para que otros se unan!
                  </p>
                  <button onClick={() => setShowCreateSession(true)} className="btn-primary px-8">Crear la primera sesión</button>
                  {lastSync && (
                    <div className="text-[10px] text-[#9CA3AF] mt-2">Última sync real: hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {displaySessions
                    .filter(s => !s.participants.includes(effectiveUserId))
                    .sort((a,b) => b.createdAt - a.createdAt)
                    .map(session => {
                      const spotsLeft = session.maxParticipants - session.participants.length
                      const creatorProfile = SEED_PROFILES.find(p => p.id === session.creatorId)
                      const dist = userLocation && creatorProfile ? getDistanceKm(userLocation.lat, userLocation.lng, 
                        creatorProfile.lat || 0, creatorProfile.lng || 0) : null

                      return (
                        <motion.div key={session.id} whileHover={{ scale: 1.01, y: -1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className={`card card-glass session-card rounded-3xl p-4 ${liveTrainingNow.some(u => u.id === session.creatorId) ? 'border-[#22c55e]/60 ring-1 ring-[#22c55e]/20' : ''} hover:border-[#FF671F]/20 transition-all`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg tracking-tight">{session.title}</div>
                              <div className="text-sm text-[#FF671F] font-medium mt-0.5">{session.trainingType} • {session.time}</div>
                              <div className="text-sm text-[#9CA3AF] mt-0.5 flex items-center gap-1">
                                <MapPin size={13} /> {session.location}
                              </div>
                            </div>
                            <div className="text-right text-xs">
                              <div className="text-[#22c55e] font-semibold">{spotsLeft} cupos</div>
                              {dist && <div className="text-[#9CA3AF] mt-0.5">{dist} km</div>}
                              {liveTrainingNow.some(u => u.id === session.creatorId) && (
                                <div className="mt-0.5 text-[8px] px-1 py-0.5 bg-[#22c55e] text-black rounded font-bold">🟢 LIVE</div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-sm">
                            <div className="text-[#9CA3AF]">
                              Creado por <span className="text-white font-medium">{session.creatorName}</span>
                              {!isDemoMode && session.creatorId && session.creatorId !== 'me' && (
                                <span className="ml-1.5 text-[9px] px-1.5 py-px bg-[#FF671F] text-black rounded-full align-middle">REAL</span>
                              )}
                              <div className="text-[10px] mt-0.5">{session.participants.length} / {session.maxParticipants} personas</div>
                              {session.lastMessagePreview && (
                                <div className="text-[10px] text-[#9CA3AF] mt-0.5 truncate max-w-[160px]">💬 {session.lastMessagePreview}</div>
                              )}
                            </div>
                            <button 
                              onClick={async () => {
                                const updatedSession = {
                                  ...session,
                                  participants: [...(session.participants || []), effectiveUserId]
                                }
                                const updatedLocal = sessions.map(s => 
                                  s.id === session.id ? updatedSession : s
                                )
                                saveSessions(updatedLocal)

                                // IMPORTANT: Also write join back to Firestore so other real users see updated participants
                                let joinPersisted = true
                                if (!isDemoMode && firebaseUser?.uid && db) {
                                  try {
                                    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
                                    await setDoc(doc(db, 'sessions', session.id), sanitizeForFirestore({
                                      ...updatedSession,
                                      updatedAt: serverTimestamp(),
                                    }), { merge: true })
                                    console.log('✅ Join persisted to Firestore for other users')
                                  } catch (e) {
                                    joinPersisted = false
                                    console.warn('Failed to persist join to Firestore:', e)
                                    toast.error('No se pudo guardar tu unión en el servidor', { description: 'El chat se abre igual (optimista). Usa "Actualizar sesiones reales" si no ves cambios.' })
                                  }
                                }

                                // Seed initial group chat messages (skipped in real mode - comes from server)
                                seedInitialSessionMessages(updatedSession)

                                if (!isDemoMode) {
                                  loadRealSessions()
                                }

                                // Notify the creator (only for real users)
                                if (session.creatorId && session.creatorId !== effectiveUserId) {
                                  addNotification({
                                    type: 'session_join',
                                    title: '¡Alguien se unió a tu sesión!',
                                    body: `${currentUser?.name || 'Alguien'} se unió a "${session.title}"`,
                                    relatedId: session.id
                                  })
                                }

                                toast.success('¡Te uniste!', { description: joinPersisted ? 'Abriendo chat grupal...' : 'Abriendo (puede tardar en sincronizar para otros)' })
                                setShowGroupChatModalFor(session.id)
                              }}
                              disabled={spotsLeft <= 0}
                              className="bg-[#FF671F] text-black px-5 py-1.5 rounded-2xl text-sm font-medium disabled:opacity-50"
                            >
                              Unirme
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* === MIS SESIONES (Joined + Created) === */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-lg font-semibold">Mis sesiones</div>
                <div className="text-xs px-2 py-0.5 bg-[#FF671F]/20 text-[#FF671F] rounded-full">
                  {displaySessions.filter(s => s.participants.includes(effectiveUserId) || s.creatorId === effectiveUserId).length}
                </div>
              </div>

              {displaySessions.filter(s => s.participants.includes(effectiveUserId) || s.creatorId === effectiveUserId).length === 0 ? (
                <div className="card card-glass p-7 rounded-3xl text-center border border-[#FF671F]/20">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="font-semibold mb-1">Aún no tienes sesiones</div>
                  <p className="text-sm text-[#9CA3AF] mb-2 max-w-[260px] mx-auto">
                    { !isDemoMode ? 'Crea tu primera sesión real o únete a una abierta arriba. ¡Otros testers la verán cross-device!' : 'Crea tu primera sesión o únete a una abierta arriba.' }
                  </p>
                  <p className="text-xs text-[#9CA3AF] mb-3">Chat grupal real-time + notifs cuando se unan.</p>
                  <button 
                    onClick={() => setShowCreateSession(true)}
                    className="px-5 py-2 bg-gradient-to-r from-[#FF671F] to-[#FF4F79] text-black rounded-2xl text-sm font-semibold active:brightness-90"
                  >
                    Crear sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {displaySessions
                    .filter(s => s.participants.includes(effectiveUserId) || s.creatorId === effectiveUserId)
                    .sort((a,b) => b.createdAt - a.createdAt)
                    .map(session => {
                      const isCreator = session.creatorId === effectiveUserId || session.creatorId === 'me'
                      const creatorProfileForDist = SEED_PROFILES.find(p => p.id === session.creatorId)
                      const dist = userLocation && creatorProfileForDist ? getDistanceKm(userLocation.lat, userLocation.lng, 
                        creatorProfileForDist.lat || 0, creatorProfileForDist.lng || 0) : null

                      return (
                        <motion.div key={session.id} whileHover={{ scale: 1.01, y: -1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className={`card card-glass session-card rounded-3xl p-4 border border-[#FF4F79]/50 ring-1 ring-inset ring-[#FF4F79]/10 ${liveTrainingNow.some(u => u.id === session.creatorId) ? 'border-[#22c55e]/60 ring-1 ring-[#22c55e]/20' : ''} hover:border-[#FF671F]/20 transition-all`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg flex items-center gap-2 tracking-tight">
                                {session.title}
                                {isCreator && <span className="text-[9px] bg-[#FF671F] text-black px-2 py-0.5 rounded font-medium">TUYA</span>}
                                {liveTrainingNow.some(u => u.id === session.creatorId) && <span className="text-[8px] bg-[#22c55e] text-black px-1.5 py-0.5 rounded font-bold">🟢 LIVE</span>}
                              </div>
                              <div className="text-sm text-[#FF671F] font-medium mt-0.5">{session.trainingType} • {session.time}</div>
                              <div className="text-sm text-[#9CA3AF] mt-0.5 flex items-center gap-1">
                                <MapPin size={13} /> {session.location}
                              </div>
                              {session.lastMessagePreview && (
                                <div className="text-[10px] text-[#9CA3AF] mt-0.5 truncate max-w-[180px]">💬 {session.lastMessagePreview}</div>
                              )}
                            </div>
                            <div className="text-right text-xs">
                              {dist && <div className="text-[#9CA3AF]">{dist} km</div>}
                              <div className="text-[#22c55e] mt-0.5 font-medium">{session.participants.length} / {session.maxParticipants}</div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-[#9CA3AF]">
                              Participantes: {session.participants.length}
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  setShowGroupChatModalFor(session.id)
                                  setChatInputValue('')
                                }}
                                className="text-xs bg-[#FF671F] text-black px-4 py-1.5 rounded-2xl font-medium"
                              >
                                Abrir chat grupal
                              </button>

                              {isCreator && (
                                <button 
                                  onClick={() => closeSession(session.id)}
                                  className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-xl active:bg-red-500/20"
                                >
                                  Cerrar sesión
                                </button>
                              )}

                              {!isCreator && (
                                <>
                                  <button 
                                    onClick={() => leaveSession(session.id)}
                                    className="text-xs border border-[#2F2F35] px-2 py-1 rounded-xl active:bg-[#25252A]"
                                  >
                                    Salir
                                  </button>
                                  <button 
                                    onClick={() => setShowReviewModalFor(session.creatorId)}
                                    className="text-xs border border-[#FF671F] text-[#FF671F] px-3 py-1 rounded-xl"
                                  >
                                    Marcar entrenado
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Chat moved to modal - button above opens it */}
                        </motion.div>
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
            <div className="flex items-center justify-between mb-1 px-1">
              <div>
                <div className="section-header">Tus matches</div>
                <div className="text-[#9CA3AF] text-sm">Conexiones reales <span className="live-pill text-[8px]">en vivo</span></div>
              </div>
              {!isDemoMode && (
                <button 
                  onClick={async () => {
                    setIsLoadingMatches(true)
                    try { await loadRealProfiles() } finally { setIsLoadingMatches(false) }
                  }} 
                  disabled={isLoadingMatches}
                  className="text-xs px-3 py-1 rounded-2xl bg-[#FF671F] text-black font-semibold active:bg-[#E55A1A] disabled:opacity-60"
                >
                  {isLoadingMatches ? '...' : 'Actualizar reales'}
                </button>
              )}
              {lastSync && <span className="text-[10px] text-[#9CA3AF] ml-2">· hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</span>}
            </div>
            <div className="text-[#9CA3AF] px-1 mb-4 text-xs">Matches reales • en vivo cross-device</div>

            {matchProfiles.length === 0 ? (
              <div className="mt-10 px-4">
                <div className="card p-8 rounded-3xl text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-[#1C1C20] flex items-center justify-center mb-4">
                    <Heart className="text-[#FF671F]" size={36} />
                  </div>
                  <div className="font-semibold text-xl mb-2">Aún no tienes matches</div>
                  <p className="text-sm text-[#9CA3AF] leading-snug mb-4 max-w-[300px] mx-auto">
                    ¡Sigue explorando! Los matches con testers reales aparecen aquí al instante (cross-device). Prueba swipiar perfiles cercanos o con entrenamientos en común.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => setActiveTab('explore')} className="btn-primary px-6">Ir a Explorar</button>
                    {!isDemoMode && (
                      <button onClick={async () => { setIsLoadingMatches(true); try { await loadRealProfiles(); await loadRealMatches(); } finally { setIsLoadingMatches(false); } }} className="px-4 py-2 border border-[#FF671F]/60 text-[#FF671F] rounded-2xl text-sm">Actualizar</button>
                    )}
                  </div>
                  {lastSync && (
                    <div className="text-[10px] text-[#9CA3AF] mt-2">Última sync real: hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {matchProfiles
                  .filter(p => !blockedUsers.includes(p.id))
                  .map(profile => (
                  <div key={profile.id} onClick={() => openChat(profile.id)} className={`card card-glass rounded-3xl overflow-hidden active:opacity-80 cursor-pointer relative ring-1 ring-white/5 ${profile.trainingNow ? 'ring-2 ring-[#22c55e]/60 shadow-lg shadow-[#22c55e]/10' : ''}`} style={{transition: 'transform 0.2s'}}>
                    <div className="relative">
                      <img src={profile.photos[0]} className="w-full aspect-square object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {realProfiles.some(rp => rp.id === profile.id) && (
                          <div className="text-[9px] bg-[#FF671F] text-black px-1.5 py-0.5 rounded-full font-bold">REAL</div>
                        )}
                        {profile.trainingNow && (
                          <div className="text-[9px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black px-1.5 py-0.5 rounded-full font-bold shadow-sm ring-1 ring-[#22c55e]/50">🟢 LIVE {profile.liveStreak ? `🔥${profile.liveStreak}d` : ''}</div>
                        )}
                        {profile.verificationStatus === 'verified' && (
                          <div className="text-[9px] bg-[#22c55e] text-black px-1 py-0.5 rounded-full">✓</div>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 p-3">
                        <div className="font-semibold">{profile.name}, {profile.age}</div>
                        <div className="text-xs text-[#FF4F79]">{profile.city}, {profile.country}</div>
                        {userLocation && (
                          <div className="text-[10px] text-[#FF671F]/80 mt-0.5">
                            {getDistanceKm(userLocation.lat, userLocation.lng, profile.lat, profile.lng)} km
                          </div>
                        )}
                        {getTrainingStreak(profile.id, reviews) > 1 && (
                          <div className="text-[10px] text-orange-400 mt-0.5">🔥 {getTrainingStreak(profile.id, reviews)} seguidas</div>
                        )}
                        {(() => {
                          const sharedSquads = squads.filter(sq => 
                            sq.members.includes(effectiveUserId) && sq.members.includes(profile.id)
                          )
                          if (sharedSquads.length > 0) {
                            return <div className="text-[10px] text-[#FF671F] mt-0.5">Squad: {sharedSquads[0].name}</div>
                          }
                          return null
                        })()}
                        {/* Spectacular muro teaser (1-2 latest) on match cards - improved progressive polish */}
                        {(() => {
                          const posts = profilePosts[profile.id] || []
                          if (posts.length === 0) return null
                          const sorted = [...posts].sort((a: any, b: any) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.timestamp - a.timestamp)
                          const top = sorted.slice(0, 2)
                          const str = top.map((p: any) => {
                            let t = (p.text || '').trim()
                            if (t.length > 35) t = t.slice(0, 32) + '...'
                            const pre = p.photo ? '📷' : (p.pinned ? '📌' : '📝')
                            return `${pre} ${t}`
                          }).join(' • ')
                          return <div className="text-[9px] text-[#FF671F]/90 mt-0.5 line-clamp-2 leading-tight">{str}</div>
                        })()}
                      </div>
                    </div>
                    <div className="p-3 text-xs text-[#9CA3AF] flex items-center gap-1">
                      <MessageCircle size={14} /> Abrir chat
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
              // List of chats (perfiles) - scrollable with sticky header so you can scroll down to all profiles
              <div className="overflow-auto flex-1 p-4 min-h-0">
                <div className="sticky top-0 bg-[#0D0D10] z-10 pb-2 -mx-4 px-4">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <div className="flex items-center gap-2">
                      <div className="section-header">Mensajes</div>
                      <span className="live-pill">● en vivo</span>
                    </div>
                    {!isDemoMode && (
                      <button onClick={async () => {
                        setIsLoadingChats(true);
                        try {
                          const currentMatches = await loadRealMatches(); // discover any new matches first
                          for (const id of currentMatches) {
                            await loadRealChatMessages(id);
                          }
                          setLastSync(new Date());
                          setChatUnreads({}); // all "read" after manual full sync
                          toast.success('Chats reales actualizados');
                        } finally {
                          setIsLoadingChats(false);
                        }
                      }} disabled={isLoadingChats} className="text-[10px] px-2 py-1 rounded-xl border border-[#FF671F]/50 text-[#FF671F] active:bg-[#FF671F] active:text-black disabled:opacity-60">{isLoadingChats ? '...' : 'Actualizar chats reales'}</button>
                    )}
                    {lastSync && <span className="text-[10px] text-[#9CA3AF] ml-2">· hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</span>}
                  </div>
                  <div className="text-[#9CA3AF] text-xs px-1 mb-3">Mensajes 1:1 reales • en vivo cross-device • notificaciones toast + navegador cuando llega un mensaje</div>
                </div>

                {matchProfiles.length === 0 && (
                  <div className="mt-8 card p-6 rounded-3xl text-center">
                    <MessageCircle className="mx-auto text-[#FF671F] mb-3" size={36} />
                    <div className="font-semibold mb-1">Sin conversaciones aún</div>
                    <p className="text-sm text-[#9CA3AF]">Los matches reales aparecen aquí. Chats en vivo cross-device. Recibirás notificación (toast + campana) cuando llegue un mensaje.</p>
                  </div>
                )}
                {matchProfiles
                  .filter(p => !blockedUsers.includes(p.id))
                  .map(profile => {
                  const chatMsgs = messages[profile.id] || []
                  const last = chatMsgs[chatMsgs.length - 1]
                  const unread = chatUnreads[profile.id] || 0
                  return (
                    <div key={profile.id} onClick={() => { setActiveChat(profile.id); setChatUnreads(prev => { const c = { ...prev }; c[profile.id] = 0; return c }) }} 
                      className="flex items-center gap-4 card p-4 rounded-3xl mb-3 active:bg-[#25252A]">
                      <img src={profile.photos[0]} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold">{profile.name}</span>
                          <span className="text-xs text-[#9CA3AF]">{profile.city}</span>
                        </div>
                        {userLocation && (
                          <div className="text-[10px] text-[#FF671F] mt-0.5">
                            {getDistanceKm(userLocation.lat, userLocation.lng, profile.lat, profile.lng)} km de ti
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="text-sm text-[#9CA3AF] truncate flex-1">
                            {last ? last.text : 'Match nuevo — di hola'}
                          </div>
                          {last && last.timestamp && (
                            <span className="text-[10px] text-[#9CA3AF] flex-shrink-0">{getRelativeTime(last.timestamp)}</span>
                          )}
                          {unread > 0 && (
                            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full bg-[#ef4444] text-white">
                              {unread > 9 ? '9+' : unread}
                            </span>
                          )}
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
                <div className="h-14 px-4 flex items-center gap-3 border-b border-[#2F2F35] bg-[#0D0D10] z-10">
                  <button onClick={() => setActiveChat(null)} className="p-2 -ml-2"><ArrowLeft /></button>
                  <img src={chatProfile?.photos[0]} className="w-9 h-9 rounded-xl object-cover" />
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {chatProfile?.name}
                      {realMatches.includes(activeChat || '') && (
                        <span className="text-[9px] bg-[#FF671F] text-black px-1.5 py-0 rounded">REAL</span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#FF671F] -mt-0.5">{chatProfile?.city}, {chatProfile?.country} • En línea</div>
                  </div>
                  <button onClick={() => setShowFullProfile(chatProfile!)} className="ml-auto text-xs px-3 py-1 bg-[#1C1C20] rounded-full">Ver perfil</button>
                  <a href="/entrenamatch/privacy.html" target="_blank" className="text-[10px] text-[#9CA3AF] underline ml-1">Privacidad</a>
                  {!isDemoMode && (
                    <button onClick={async () => { if (activeChat) { setIsLoadingChats(true); try { await loadRealChatMessages(activeChat); setLastSync(new Date()); setChatUnreads(prev => { const c = { ...prev }; if (activeChat) c[activeChat] = 0; return c }); toast.success('Chat actualizado'); } finally { setIsLoadingChats(false); } } }} disabled={isLoadingChats} className="text-[10px] px-2 py-1 border border-[#2F2F35] rounded-xl text-[#FF671F] active:bg-[#25252A] disabled:opacity-60">{isLoadingChats ? '...' : 'Actualizar'}</button>
                  )}
                  <button onClick={() => {
                    if (confirm('¿Reportar problema en este chat?')) {
                      if (activeChat && db) {
                        (async () => {
                          try {
                            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
                            await addDoc(collection(db, 'betaFeedback'), {
                              userId: firebaseUser?.uid || 'demo',
                              type: 'other',
                              rating: 3,
                              text: `Chat 1:1 con ${activeChat}: Problema reportado por usuario`,
                              platform: (typeof window !== 'undefined' && (window as any).Capacitor) ? 'android' : 'web',
                              appVersion: '0.1.7-prealpha',
                              context: '1v1-chat',
                              createdAt: serverTimestamp(),
                            });
                            toast.success('Reporte enviado (ver en Perfil > Feedback)');
                          } catch {}
                        })();
                      }
                    }
                  }} className="text-[10px] text-red-400 underline ml-1">Reportar</button>
                </div>

                {/* Safety in 1:1 chat */}
                <div className="flex justify-end gap-2 px-4 py-1 bg-[#0f1115] text-xs">
                  <button 
                    onClick={() => {
                      if (confirm('¿Reportar este chat/perfil por comportamiento inadecuado?')) {
                        reportUser(activeChat, 'Comportamiento inadecuado', undefined, '1v1_chat', activeChat)
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
                <div className="px-4 py-2 bg-[#1C1C20] border-b border-[#2F2F35] text-center">
                  <button 
                    onClick={() => {
                      if (activeChat) {
                        setShowReviewModalFor(activeChat)
                        setReviewRating(5)
                        setReviewComment('')
                      }
                    }}
                    className="text-xs bg-[#FF671F]/10 text-[#FF671F] px-3 py-1 rounded-full hover:bg-[#FF671F] hover:text-black transition"
                  >
                    ★ Marcamos que entrenamos juntos (dejar reseña)
                  </button>
                </div>

                {/* Messages - robust scroll container */}
                <div ref={chatScrollRef} className="flex-1 overflow-auto p-4 space-y-3 pb-20 min-h-0" id="chat-scroll">
                  {/* Real messages take priority when in a real cross-device chat */}
                  {((realChatMessages.length > 0 ? realChatMessages : (messages[activeChat] || []))).map((m, i) => {
                    const isMe = m.from === 'me'
                    const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''
                    return (
                      <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`max-w-[82%] ${isMe ? 'text-right' : ''}`}>
                          {time && <div className="text-[9px] text-[#6B7280] mb-0.5 px-1">{time}</div>}
                          <div className={`px-3.5 py-2 rounded-3xl text-[14px] leading-snug break-words overflow-hidden ${isMe ? 'bg-[#FF671F] text-black rounded-br-md' : 'bg-[#25252A] text-white rounded-bl-md'}`}>
                            {renderMessageText(m.text)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {((realChatMessages.length > 0 ? realChatMessages : (messages[activeChat] || []))).length === 0 && (
                    <div className="text-center text-sm text-[#9CA3AF] mt-8">
                      <div className="font-medium text-white mb-1">
                        {realMatches.includes(activeChat || '') || (activeChat || '').startsWith('p') ? '¡Match real con otro tester!' : '¡Primer match!'}
                      </div>
                      <div>Escribe algo para romper el hielo.</div>
                      {realMatches.includes(activeChat || '') && (
                        <div className="text-[10px] mt-1 text-[#FF671F]">Los mensajes viajan en tiempo real a su celular</div>
                      )}
                      {!realMatches.includes(activeChat || '') && (
                        <div className="text-[10px] mt-1">Ejemplo: “Hola! Vi que entrenas pesas, ¿en qué gym vas?”</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Training Proposals - Unique feature */}
                <div className="px-3 pt-2 border-t border-[#2F2F35] bg-[#0D0D10]">
                  <div className="text-[10px] text-[#9CA3AF] mb-1.5 px-1">Propuestas rápidas:</div>
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
                        className="text-xs bg-[#1C1C20] hover:bg-[#25252A] border border-[#2F2F35] px-3 py-1 rounded-full text-[#cbd5e1] active:bg-[#FF671F] active:text-black"
                      >
                        {proposal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-3 border-t border-[#2F2F35] bg-[#0D0D10]">
                  <form onSubmit={(e) => { e.preventDefault(); const input = (e.currentTarget.elements[0] as HTMLInputElement); sendMessage(input.value); input.value = '' }} className="flex gap-2">
                    <input type="text" placeholder="Escribe un mensaje..." className="flex-1 bg-[#1C1C20] border border-[#2F2F35] rounded-3xl px-5 py-3 text-sm outline-none" />
                    <button type="submit" className="bg-[#FF671F] text-black w-12 rounded-3xl flex items-center justify-center"><Send size={18} /></button>
                  </form>
                  <div className="text-center text-[10px] text-[#6B7280] mt-2">
                    {!isDemoMode 
                      ? 'Mensajes reales • se envían al servidor (visibles cross-device para usuarios reales)' 
                      : 'Los mensajes son locales en esta versión (demo)'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== PROFILE - Premium Pre-Alpha experience (self-contained to prevent black screens) */}
        {activeTab === 'profile' && currentUser && (
          <div className="flex-1 overflow-auto bg-[#0D0D10] pb-28">
            {/* Sticky header with escape hatches - polished aesthetics */}
            <div className="sticky top-0 z-20 bg-[#0D0D10]/95 backdrop-blur-xl border-b border-[#2F2F35] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <div className="section-header text-xl">Tu perfil</div>
                  {!isDemoMode && <div className="live-pill !text-[8px] !py-0.5 !mt-0.5">REAL • Firebase</div>}
                </div>
                {!isDemoMode && (
                  <button onClick={async () => { 
                    setIsSyncingProfile(true);
                    try {
                      await loadRealProfiles(); 
                      await loadRealSessions(); 
                      await loadMyFeedbacks(); 
                      if (firebaseUser?.uid) {
                        try {
                          const rp = await getUserProfile(firebaseUser.uid);
                          if (rp && rp.name) {
                            const merged: CurrentUser = {
                              ...currentUser,
                              id: 'me' as any,
                              name: rp.name,
                              age: rp.age,
                              gender: rp.gender,
                              city: rp.city,
                              country: rp.country,
                              bio: rp.bio,
                              photos: rp.photos || [],
                              trainingTypes: rp.trainingTypes || [],
                              goals: rp.goals || [],
                              level: rp.level || 'Intermedio',
                              intensity: rp.intensity || 'Moderado',
                              availability: rp.availability || ['Tarde'],
                              lat: rp.lat || currentUser?.lat || -33.0153,
                              lng: rp.lng || currentUser?.lng || -71.5528,
                              legalConsents: rp.legalConsents || currentUser?.legalConsents,
                            };
                            saveUser(merged);
                          }
                        } catch {}
                      }
                      setLastSync(new Date()); 
                      toast.success('Datos reales sincronizados') 
                    } finally {
                      setIsSyncingProfile(false);
                    }
                  }} disabled={isSyncingProfile} className="text-[10px] px-2.5 py-1 rounded-xl border border-[#FF671F]/40 text-[#FF671F] active:bg-[#FF671F]/10 disabled:opacity-60 flex items-center gap-1">
                    <RefreshCw size={12} className={isSyncingProfile ? 'animate-spin' : ''} /> {isSyncingProfile ? 'Sync...' : 'Sincronizar'}
                  </button>
                )}
                {lastSync && <span className="text-[9px] text-[#9CA3AF] ml-1">hace {Math.max(0, Math.floor((Date.now()-lastSync.getTime())/1000))}s</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={handleLogout} className="text-[10px] px-3 py-1 rounded-2xl border border-[#3f2a2a] text-[#f87171] active:bg-[#1f1616] active:text-white">Cambiar cuenta</button>
                <button onClick={() => setShowOnboarding(true)} className="text-[10px] px-3 py-1 rounded-2xl bg-gradient-to-r from-[#FF671F] to-[#E55A1A] text-black font-semibold active:opacity-90 flex items-center gap-1"><Edit2 size={13} /> Editar</button>
              </div>
            </div>

            {/* Hero photo with name overlay - premium visual treatment */}
            <div className="relative h-72 w-full overflow-hidden bg-[#111]">
              <img 
                src={(currentUser.photos && currentUser.photos[0]) || 'https://picsum.photos/id/1005/600/800'} 
                className="absolute inset-0 w-full h-full object-cover" 
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Enhanced cinematic gradients */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-end gap-2">
                  <div className="text-3xl font-bold tracking-[-1.8px] text-white drop-shadow">{currentUser.name}, {currentUser.age}</div>
                  {currentUser.verificationStatus === 'verified' && (
                    <div className="mb-1 px-2 py-0.5 bg-[#22c55e] text-black text-[9px] font-bold rounded-full flex items-center gap-0.5">✓ VERIFICADO</div>
                  )}
                </div>
                <div className="text-[#FF671F] text-sm mt-1 flex items-center gap-2 font-medium">
                  <MapPin size={15} /> {currentUser.city}, {currentUser.country}
                  <span className="text-white/60">•</span> 
                  <span className="text-[10px] px-1.5 py-px rounded-full bg-[#FF4F79]/10 text-[#FF4F79] font-semibold">{currentUser.level}</span>
                  <span className="text-white/60">•</span> 
                  <span className="chip-health text-[10px] px-2 py-0.5 !font-semibold">{currentUser.intensity || 'Moderado'}</span>
                </div>
              </div>

              {/* Quick edit overlay */}
              <button 
                onClick={() => setShowOnboarding(true)}
                className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 active:bg-black text-white text-xs px-3.5 py-2 rounded-2xl border border-white/30 backdrop-blur"
              >
                <Edit2 size={14} /> Editar foto y datos
              </button>

              {/* Camera quick add badge if native */}
              {typeof window !== 'undefined' && (window as any).Capacitor && CapacitorCamera && (
                <button onClick={async () => { /* reuse the camera logic below if possible, or trigger onboarding */ setShowOnboarding(true); }} className="absolute top-4 left-4 text-xs bg-black/60 px-2.5 py-1 rounded-2xl border border-white/20 flex items-center gap-1 text-white">
                  <Camera size={13} /> Cámara
                </button>
              )}
            </div>

            {/* Photo gallery strip - always show if any extra, with delete (spectacular profile curation) */}
            {currentUser.photos && currentUser.photos.length > 0 && (
              <div className="px-4 py-3 flex gap-2 overflow-x-auto bg-[#0D0D10] border-b border-[#2F2F35]">
                {currentUser.photos.map((photo: string, idx: number) => (
                  <div key={idx} className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border ${idx === 0 ? 'border-[#FF671F] ring-1 ring-[#FF671F]/30' : 'border-[#2F2F35]'} shadow group`}>
                    <img src={photo} className="w-full h-full object-cover" />
                    {idx === 0 && <div className="absolute bottom-0 left-0 right-0 text-[8px] bg-[#FF671F] text-black px-1 text-center rounded-b">principal</div>}
                    {/* Delete button - always visible on mobile for usability, nice on desktop */}
                    <button
                      onClick={() => deleteExtraPhoto(idx)}
                      className="absolute top-1 right-1 bg-red-500/90 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 active:scale-90 shadow"
                      title="Eliminar foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick native camera add (APK only) - Phase 0 deeper integration */}
            {typeof window !== 'undefined' && (window as any).Capacitor && CapacitorCamera && (
              <div className="px-4 pt-3">
                <button
                  onClick={async () => {
                    try {
                      const photo = await CapacitorCamera.getPhoto({ quality: 80, allowEditing: false, resultType: 'base64' })
                      if (photo?.base64String) {
                        const dataUrl = `data:image/jpeg;base64,${photo.base64String}`
                        const newPhotos = [...(currentUser.photos || []), dataUrl].slice(0, 6)
                        const updated = { ...currentUser, photos: newPhotos }
                        // Use the real-sync saver (handles local + Firestore for real users)
                        saveUserWithRealSync(updated as any)
                        toast.success('Foto agregada con cámara')
                        setLastSync(new Date())
                      }
                    } catch (e) {
                      toast('No se pudo usar la cámara (permisos o cancelado)')
                    }
                  }}
                  className="w-full py-2 rounded-2xl border border-[#FF671F] text-[#FF671F] text-sm flex items-center justify-center gap-2 active:bg-[#FF671F]/10"
                >
                  <span>📷</span> Agregar foto con cámara del teléfono
                </button>
                <div className="text-center text-[10px] text-[#9CA3AF] mt-1">Disponible en la app nativa (APK)</div>
              </div>
            )}

            {/* Incomplete CTA */}
            {(!currentUser.bio || !currentUser.photos?.length || !currentUser.trainingTypes?.length) && (
              <div className="mx-4 mt-4 p-4 rounded-3xl bg-[#25252A] border border-[#FF671F]/40">
                <div className="text-[#FF671F] font-semibold mb-1">Completa tu perfil</div>
                <p className="text-sm text-[#cbd5e1] mb-3">Agrega bio, fotos y entrenamiento para que otros testers reales te vean en Explorar.</p>
                <button onClick={() => setShowOnboarding(true)} className="btn-primary w-full text-sm py-2">Completar ahora</button>
              </div>
            )}

            {/* Bio */}
            <div className="px-4 mt-4">
              <div className="card p-4">
                <div className="uppercase text-[10px] tracking-[1px] text-[#9CA3AF] mb-1.5">Sobre mí</div>
                <p className="text-[15px] leading-snug text-white/95">{currentUser.bio || 'Todavía no has escrito tu bio. ¡Cuéntale al mundo por qué entrenas!'}</p>
              </div>
            </div>

            {/* Stats row - premium visual cards + LIVE count as global killer stat in header (urgency / FOMO) */}
            <div className="px-4 mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'Matches', value: matches?.length || 0, icon: Heart, color: '#FF671F' },
                { label: 'Sesiones', value: squads?.length || 0, icon: Star, color: '#00C4B4' },
                { label: 'Nivel', value: currentUser.level || '—', icon: Dumbbell, color: '#FF4F79', isText: true },
                { label: 'Live cerca', value: liveTrainingNow.length, icon: Zap, color: '#22c55e', isLive: true },
                { label: 'Live joins', value: currentUser.liveJoins || 0, icon: Zap, color: '#22c55e' },
                { label: 'Syncs', value: (currentUser as any).syncStreak || 0, icon: Users, color: '#22c55e' }
              ].map((stat: any, i) => (
                <div 
                  key={i} 
                  onClick={stat.isLive && liveTrainingNow.length > 0 ? () => { setActiveTab('explore'); setShowLiveModal(true); } : undefined}
                  className={`card p-2 text-center rounded-2xl flex flex-col items-center justify-center min-h-[68px] ${stat.isLive && liveTrainingNow.length > 0 ? 'cursor-pointer active:scale-95 border border-[#22c55e]/60 ring-1 ring-[#22c55e]/20 shadow-sm shadow-[#22c55e]/10' : ''} ${stat.isLive ? 'relative' : ''}`}
                >
                  <stat.icon size={14} className="mb-0.5" style={{ color: stat.color }} />
                  {stat.isText ? (
                    <div className="text-[10px] font-semibold px-1 py-0.5 rounded bg-white/10" style={{ color: stat.color }}>{stat.value}</div>
                  ) : (
                    <div className="stat-number text-base leading-none" style={{ color: stat.color }}>{stat.value}</div>
                  )}
                  <div className="text-[8px] text-[#9CA3AF] mt-0.5 font-medium tracking-widest">{stat.label}</div>
                  {stat.isLive && liveTrainingNow.length > 0 && (
                    <div className="text-[7px] text-[#22c55e] mt-0.5 flex items-center gap-1">
                      ¡Ver ahora! 
                      <div className="w-1 h-1 bg-[#22c55e] rounded-full" style={{animation: 'live-pulse-green 1.5s ease-in-out infinite'}}></div>
                    </div>
                  )}
                  {stat.isLive && liveTrainingNow.length === 0 && (
                    <div className="text-[7px] text-[#9CA3AF] mt-0.5">¡Sé el primero!</div>
                  )}
                </div>
              ))}
            </div>

            {/* NEVER-SEEN: Sync Legends / Bonds — persistent proof of real training partnerships.
                High bond levels give visual status + future priority in live/explore (unique accountability capital). */}
            {Object.keys(syncBonds).length > 0 && (
              <div className="px-4 mt-3">
                <div className="text-[10px] uppercase tracking-[1px] text-[#9CA3AF] mb-1.5 flex items-center gap-1">🔥 TUS SYNC LEGENDS <span className="text-[8px] normal-case opacity-60">(entrenaron contigo de verdad)</span></div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(syncBonds).slice(0,4).map(([pid, b]: any) => {
                    const p = [...realProfiles, ...SEED_PROFILES].find(pp => pp.id === pid)
                    const flames = '🔥'.repeat(Math.max(1, b.bondLevel || 1))
                    return (
                      <div key={pid} className="legend-card rounded-2xl p-2.5 text-xs flex gap-2 items-center active:scale-[0.985]" onClick={() => { const prof = p; if (prof) setShowFullProfile(prof as any); else toast('Compa no disponible ahora') }}>
                        <div className="w-8 h-8 rounded-full bg-[#1C1C20] overflow-hidden ring-1 ring-[#FF671F]/30 flex-shrink-0">
                          {p?.photos?.[0] ? <img src={p.photos[0]} className="w-full h-full object-cover" /> : <div className="text-center text-base pt-0.5">{(p?.name||'?')[0]}</div>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white/95 truncate">{p?.name || 'Leyenda'}</div>
                          <div className="text-[10px] text-[#9CA3AF]">{b.totalMin}min • {b.sessions} sesiones • {b.avgRating}★</div>
                          <div className="legend-flame text-[11px] leading-none mt-px">{flames} Bond {b.bondLevel}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Live streak badge - killer retention stat, shows when active */}
            {(currentUser.liveStreak && currentUser.liveStreak > 0) || (currentUser.joinedLiveStreak && currentUser.joinedLiveStreak > 0) ? (
              <div className="px-4 -mt-2 mb-1 text-center">
                <span className="inline-block bg-[#22c55e]/10 text-[#22c55e] text-xs px-3 py-0.5 rounded-full font-bold">
                  🔥 {currentUser.liveStreak || 0}d host {currentUser.joinedLiveStreak ? `+ ${currentUser.joinedLiveStreak}d join` : ''} streak — ¡sigue así!
                </span>
              </div>
            ) : null}

            {/* Training Types - visual polish */}
            <div className="px-4 mt-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[1.5px] text-[#9CA3AF] mb-2 px-1">
                <Dumbbell size={13} /> Tipos de entrenamiento
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentUser.trainingTypes || []).length > 0 ? (
                  currentUser.trainingTypes.map((t: string) => <div key={t} className="chip chip-active text-xs px-3.5 py-1.5">{t}</div>)
                ) : <span className="text-xs text-[#9CA3AF]">Sin tipos seleccionados</span>}
              </div>
            </div>

            {/* Goals */}
            <div className="px-4 mt-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[1.5px] text-[#9CA3AF] mb-2 px-1">
                <Star size={13} /> Objetivos
              </div>
              <div className="flex flex-wrap gap-2">
                {(currentUser.goals || []).length > 0 ? (
                  currentUser.goals.map((g: string) => <div key={g} className="chip chip-health text-xs px-3.5 py-1.5">{g}</div>)
                ) : <span className="text-xs text-[#9CA3AF]">Sin objetivos aún</span>}
              </div>
            </div>

            {/* Availability + Disponible hoy - nicer toggle visual */}
            <div className="px-4 mt-4 card p-4 space-y-3">
              <div className="flex justify-between text-sm items-center">
                <span className="text-[#9CA3AF] flex items-center gap-1.5"><Clock size={14} /> Disponibilidad</span>
                <span className="text-right text-white/90 text-xs">{(currentUser.availability || []).join(' • ') || 'No especificada'}</span>
              </div>
              <div>
                <button 
                  onClick={() => {
                    const newVal = !currentUser.availableToday
                    const updated = { ...currentUser, availableToday: newVal }
                    saveUserWithRealSync(updated as CurrentUser)
                    toast(newVal ? '¡Marcado como disponible hoy!' : 'Disponibilidad actualizada')
                  }}
                  className={`w-full py-3 rounded-2xl text-sm font-semibold transition flex items-center justify-center gap-2 ${currentUser.availableToday ? 'bg-[#10B981] text-black' : 'bg-[#1C1C20] border border-[#2F2F35] text-white'}`}
                >
                  {currentUser.availableToday ? '✓ Disponible para entrenar hoy' : 'Marcar como disponible hoy'}
                </button>
                <div className="text-[10px] text-center text-[#9CA3AF] mt-1.5">Otros usuarios te verán en el filtro “Solo disponibles hoy”</div>
              </div>
            </div>

            {/* Google Play Integrity - working with the Google app (Play Integrity API) */}
            <div className="px-4 mt-2">
              <div className="card p-5 border border-[#22c55e]/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-semibold text-sm flex items-center gap-2"><span>🛡️</span> Google Play Integrity</div>
                  <div className="text-[9px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">Android + Play Store</div>
                </div>
                <p className="text-xs text-[#9CA3AF] mb-3">
                  Verifica app oficial (PLAY_RECOGNIZED), licencia (LICENSED) y dispositivo íntegro. 
                  Pega aquí el nonce de tu "prueba de integridad" creada en Play Console para obtener veredictos específicos de prueba (ej. MEETS_DEVICE_INTEGRITY).
                  La app ahora requiere integridad positiva para activar "Entrenando ahora (EN VIVO)" en builds reales.
                </p>
                <div className="text-[10px] text-[#9CA3AF] mb-2">
                  Detección actual: <span className="font-mono">{Capacitor.isNativePlatform() ? 'Nativa (APK real)' : 'Web (simulado)'}</span> — debe ser Nativa en la APK instalada. (Ver logs: [Play Integrity] isNativePlatform())
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={testIntegrityNonce}
                    onChange={(e) => setTestIntegrityNonce(e.target.value)}
                    placeholder="Nonce de prueba de la consola (opcional, para veredictos específicos)"
                    className="w-full form-input text-xs py-2"
                  />
                  <button
                    onClick={() => checkPlayIntegrity(true)}
                    disabled={integrityChecking}
                    className="w-full py-2.5 rounded-2xl text-sm font-semibold bg-[#22c55e] text-black active:bg-[#16a34a] disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {integrityChecking ? 'Verificando con Google...' : 'Verificar integridad ahora con Google Play'}
                  </button>
                  {testIntegrityNonce.trim() && (
                    <div className="text-[9px] text-[#9CA3AF]">Usando nonce de prueba — obtendrás el veredicto específico que configuraste en la consola.</div>
                  )}
                </div>

                {lastIntegrity && (
                  <div className="mt-3 text-[10px] bg-[#111113] p-3 rounded-2xl border border-[#2F2F35]">
                    {lastIntegrity.token && (
                      <>
                        <div className="text-[#22c55e] font-medium">✅ Token obtenido de Google</div>
                        <div className="text-[#9CA3AF] mt-1 break-all font-mono text-[8px] max-h-12 overflow-auto">{lastIntegrity.token}</div>
                        <div className="text-[#9CA3AF] mt-1">Cópialo y envíalo a un backend para decodificar → obtienes el JSON completo con veredictos (como el que me diste).</div>
                      </>
                    )}
                    {lastIntegrity.simulatedVerdict && (
                      <>
                        <div className="text-amber-400 font-medium">🌐 Resultado simulado (web / PWA)</div>
                        <div className="text-[#9CA3AF] mt-1">En la APK nativa instalada desde Play obtendrás un token real. El simulado es positivo:</div>
                        <div className="text-[9px] mt-1 text-[#cbd5e1]">LICENSED + PLAY_RECOGNIZED + MEETS_DEVICE_INTEGRITY</div>
                      </>
                    )}
                    {lastIntegrity.error && (
                      <div className="text-red-400">Error: {lastIntegrity.error}</div>
                    )}
                    <button onClick={() => { console.log('Last full integrity object:', lastIntegrity); toast('Resultado completo en consola del navegador (F12)'); }} className="mt-2 text-[9px] underline text-[#FF671F]">Ver objeto completo en consola</button>
                  </div>
                )}

                <div className="text-[9px] text-[#9CA3AF] mt-2">
                  Package esperado: <span className="font-mono text-[#22c55e]">com.entrenamatch.app</span>. 
                  El JSON que me pasaste usaba placeholder "com.package.name" — en la app real usamos el correcto.
                </div>
              </div>
            </div>

            {/* Entrenando Ahora - KILLER FEATURE real-time, live green indicator near you. Generates urgency, no other fitness app has it this well. */}
            <div className="px-4 mt-2 card p-4 space-y-3">
              <div>
                <button 
                  onClick={() => {
                    const newVal = !currentUser.trainingNow
                    if (newVal && !isDemoMode && PlayIntegrityNative) {
                      const current = getLastIntegrityResult() || lastIntegrity;
                      if (!hasPositiveIntegrity(current)) {
                        toast.error('Verifica integridad primero', { 
                          description: 'Usa el botón 🛡️ Google Play Integrity arriba (o ingresa nonce de tu prueba) para obtener token positivo.' 
                        });
                        return;
                      }
                    }
                    let streakUpdate: any = {}
                    if (newVal) {
                      const todayStr = new Date().toDateString()
                      const lastStr = currentUser.lastLiveDate ? new Date(currentUser.lastLiveDate).toDateString() : null
                      let newStreak = currentUser.liveStreak || 0
                      if (!lastStr || lastStr === todayStr) {
                        // same day or first
                        if (!lastStr) newStreak = 1
                      } else {
                        const lastDate = new Date(lastStr)
                        const yesterday = new Date()
                        yesterday.setDate(yesterday.getDate() - 1)
                        if (lastDate.toDateString() === yesterday.toDateString()) {
                          newStreak = (currentUser.liveStreak || 0) + 1
                        } else {
                          newStreak = 1
                        }
                      }
                      streakUpdate = { liveStreak: newStreak, lastLiveDate: Date.now(), joinedLiveStreak: (currentUser.joinedLiveStreak || 0) + (lastStr && lastStr !== todayStr ? 1 : (lastStr ? 0 : 1)) }
                    }
                    const updated = { ...currentUser, trainingNow: newVal, trainingNowSince: newVal ? Date.now() : undefined, ...streakUpdate, ...( !newVal ? { trainingSyncWith: null, syncStartedAt: null } : {} ) }
                    saveUserWithRealSync(updated as CurrentUser)
                    // Immediately refresh real profiles so the toggler sees current live people, and the poller will propagate to others soon
                    loadRealProfiles().catch(() => {})
                    toast(newVal ? '🟢 ¡Entrenando ahora en vivo! La gente cerca te verá' : 'Entrenamiento finalizado')
                    if (newVal) {
                      createProfilePost('¡Entrenando ahora cerca! ¿Quién se une? 🏋️', null).catch(() => {})
                    }
                  }}
                  className={`w-full py-3 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm ${currentUser.trainingNow ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black' : 'bg-[#1C1C20] border border-[#2F2F35] text-white hover:border-[#22c55e]/50 active:bg-[#25252A]'}`}
                >
                  {currentUser.trainingNow ? '🟢 Entrenando ahora (EN VIVO) — ¡Estás generando urgencia!' : 'Marcar como entrenando ahora'}
                </button>
                <div className="text-[10px] text-center text-[#9CA3AF] mt-1.5">¡Aparecerás en "Entrenando Ahora" para usuarios cerca! Urgencia real-time que hace que la gente abra la app seguido. Nadie lo tiene tan bien.</div>
                <button onClick={() => setActiveTab('explore')} className="mt-2 w-full text-xs text-[#22c55e] underline active:opacity-70">Ver quién está live cerca ahora →</button>
                {currentUser.trainingNow && ((currentUser.liveStreak || 0) + (currentUser.joinedLiveStreak || 0) + (currentUser.liveJoins || 0) > 0) && (
                  <div className="text-[9px] text-center text-[#22c55e] mt-1 font-medium">🔥 {currentUser.liveStreak || 0}d host streak + {currentUser.joinedLiveStreak || 0}d join • {currentUser.liveJoins || 0} total live joins recibidos</div>
                )}
              </div>

              {/* =====================================================
                   THE NEVER-BEFORE-SEEN ENTRenaSync ARENA
                   This is the heart of what makes the app something nobody has seen.
                   Real-time co-presence ritual: two athletes connected by energy,
                   actions fly across the shared space, combos explode, vibe orb
                   pulses with your combined power, story gets written to BOTH walls.
                   Pure magic. Pure differentiation.
                   ===================================================== */}
              {currentUser.trainingNow && syncPartnerId && (
                <div className="mt-3 sync-arena p-3.5">
                  {/* Header with presence + controls */}
                  <div className="flex items-center justify-between mb-2 relative z-20">
                    <div className="flex items-center gap-2">
                      <div className="text-[#22c55e] font-extrabold text-[13px] tracking-[0.5px] flex items-center gap-1.5">🔄 EN ARENA SYNC <span className="text-[8px] font-normal opacity-60 align-middle">EN VIVO</span></div>
                      {syncCombo >= 2 && <div className="text-[9px] px-1.5 py-px rounded bg-[#FF671F] text-black font-black tracking-wider">COMBO x{syncCombo}</div>}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button onClick={() => setShowSyncArena(!showSyncArena)} className="px-2 py-0.5 rounded bg-white/5 text-[#22c55e] active:bg-white/10">{showSyncArena ? 'COMPACT' : 'ARENA'}</button>
                      <button onClick={() => loadRealProfiles().catch(()=>{})} className="px-1.5 py-0.5 bg-[#22c55e]/15 text-[#22c55e] rounded active:bg-[#22c55e]/30">↻</button>
                      <button onClick={endSync} className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded active:bg-red-500/40 text-[9px]">TERMINAR</button>
                    </div>
                  </div>

                  {/* THE IMMERSIVE RITUAL: Dual avatars + tether + reactive energy orb */}
                  <div className="relative h-[128px] flex items-center justify-center mb-2.5" style={{background: 'radial-gradient(ellipse at center, rgba(16,28,20,0.6) 0%, transparent 70%)'}}>
                    {/* Avatar YOU */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                      <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#22c55e]/70 shadow-[0_0_12px_rgba(34,197,94,0.5)] bg-[#1C1C20] border border-[#22c55e]/40">
                        {currentUser.photos?.[0] ? <img src={currentUser.photos[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg font-black text-white/90">{(currentUser.name||'T')[0]}</div>}
                      </div>
                      <div className="text-[9px] mt-1 text-[#22c55e] font-semibold tracking-widest">TÚ</div>
                    </div>

                    {/* CENTRAL VIBE ORB — the soul of the unique experience. Reacts to shared energy. Both people see the exact same pulse. */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div 
                        className={`energy-orb ${syncVibe > 65 ? 'high' : ''}`}
                        style={{ transform: `scale(${0.82 + (syncVibe/100)*0.32})` }}
                      >
                        <div className="absolute inset-0 rounded-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="font-mono text-[22px] font-black text-black/90 tracking-[-1.5px]">{syncStartedAt ? Math.floor((Date.now()-syncStartedAt)/60000) : 0}</div>
                            <div className="text-[7px] -mt-1 text-black/70 font-bold tracking-[1px]">MIN</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-1 text-[10px] font-mono text-[#22c55e] tracking-[2px] flex items-center gap-1">
                        VIBE <span className="font-black text-lg tabular-nums">{syncVibe}</span><span className="text-[8px] opacity-70">%</span>
                      </div>
                    </div>

                    {/* Tether line — visual "we are connected" never-seen cue */}
                    <div className="sync-tether" />

                    {/* Avatar PARTNER */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                      <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#FF671F]/70 shadow-[0_0_12px_rgba(255,103,31,0.45)] bg-[#1C1C20] border border-[#FF671F]/40">
                        {realProfiles.find(p=>p.id===syncPartnerId)?.photos?.[0] ? <img src={realProfiles.find(p=>p.id===syncPartnerId)!.photos![0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg font-black text-white/90">{(realProfiles.find(p=>p.id===syncPartnerId)?.name||'C')[0]}</div>}
                      </div>
                      <div className="text-[9px] mt-1 text-[#FF671F] font-semibold tracking-widest">{(realProfiles.find(p=>p.id===syncPartnerId)?.name || 'COMPA').split(' ')[0].toUpperCase()}</div>
                    </div>

                    {/* FLYING EMOJI WAVES — the dopamine "we moved at the same time" effect. Both clients render the exact same ones because of instant listener */}
                    <AnimatePresence>
                      {flyingEmojis.map((f, idx) => (
                        <motion.div
                          key={f.id}
                          initial={{ opacity: 0.95, scale: 0.9, x: -30 + idx*18 }}
                          animate={{ opacity: 0, scale: 0.4, x: 8 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.35, ease: [0.22,1,0.36,1] }}
                          className="flying-emoji"
                          style={{ left: `${34 + idx * 7}%`, top: '34%' }}
                        >
                          {f.emoji}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Expanded ritual action grid — bigger, more satisfying taps. 8 moves for rich vocabulary of training together. */}
                  <div className="grid grid-cols-4 gap-1.5 mb-2 relative z-20">
                    {[
                      {e:'💪', l:'Buena forma'}, {e:'🔥', l:'Serie lista'}, {e:'💧', l:'Hidratado'},
                      {e:'🏁', l:'Push final'}, {e:'⚡', l:'Explosivo'}, {e:'🧘', l:'Control'},
                      {e:'📈', l:'Más peso'}, {e:'❤️', l:'Juntos'}
                    ].map((a, idx) => {
                      const isActiveCombo = syncCombo >= 2 && syncActions[0]?.label === a.l
                      return (
                        <button 
                          key={idx} 
                          onClick={() => doSyncAction(a.e, a.l)} 
                          className={`action-ritual-btn h-9 rounded-2xl text-sm flex flex-col items-center justify-center gap-px font-semibold active:scale-[0.97] ${isActiveCombo ? 'combo' : ''}`}
                        >
                          <span className="text-base leading-none">{a.e}</span>
                          <span className="text-[8.5px] text-white/80 tracking-tight leading-none">{a.l}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Mirror hint + story tools — the "ritual" language that sells uniqueness */}
                  <div className="text-[8px] text-center text-[#22c55e]/55 mb-1.5">Tus acciones aparecen al instante en su pantalla. ¡Entrenen como si estuvieran en el mismo lugar!</div>

                  {/* Action story log as beautiful timeline (the shared memory being built live) */}
                  {syncActions.length > 0 && (
                    <div className="text-[9px] bg-black/40 border border-[#22c55e]/20 p-2 rounded-xl mb-2 max-h-[74px] overflow-auto story-timeline relative z-10">
                      <div className="flex items-center justify-between text-[#22c55e]/70 mb-0.5 px-0.5">
                        <div>RITUAL EN VIVO ({syncActions.length})</div>
                        <button onClick={() => setReplaySession({partnerName: realProfiles.find(p=>p.id===syncPartnerId)?.name, minutes: syncStartedAt ? Math.floor((Date.now()-syncStartedAt)/60000):0 , vibe: syncVibe, actions: [...syncActions], rating: null })} className="text-[#FF671F] underline text-[8px]">REPLAY</button>
                      </div>
                      <AnimatePresence>
                      {syncActions.slice(0,7).map((a: any, i: number) => {
                        const isMe = a.userId === effectiveUserId
                        const who = isMe ? 'Tú' : (realProfiles.find(p => p.id === syncPartnerId)?.name?.split(' ')[0] || 'Compa')
                        return (
                          <motion.div 
                            key={a.id || i} 
                            initial={{ opacity: 0, y: -6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center gap-1.5 py-[1px] text-[10px]"
                          >
                            <span className={isMe ? 'text-white' : 'text-[#22c55e]'}>{who} {a.emoji} {a.label}{a.combo ? <span className="text-[#FF671F] font-black">×{a.combo}</span> : ''}</span>
                            <span className="ml-auto text-[#22c55e]/40 text-[7.5px] tabular-nums">{a.at ? Math.max(0,Math.floor((Date.now()-a.at)/60000)) : 0}m</span>
                          </motion.div>
                        )
                      })}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Quick unique actions row */}
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => { /* quick story post without ending */ const p = realProfiles.find(pp=>pp.id===syncPartnerId); createProfilePost(`🔄 Sigo en Sync con ${p?.name||'mi buddy'} — vibe ${syncVibe}%`, null).catch(()=>{}); toast('Historia parcial guardada en tu muro') }} className="text-[10px] px-3 py-1 rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/40 active:bg-[#22c55e]/20">📝 Guardar historia ahora</button>
                    <button onClick={() => setShowSyncArena(false)} className="text-[10px] px-3 py-1 rounded-full bg-white/5 text-white/70 border border-white/10 active:bg-white/10">Cerrar arena</button>
                  </div>

                  <div className="text-center text-[7.5px] text-[#22c55e]/45 mt-1.5">Cada acción + combo + vibe se comparte en tiempo real. Al terminar se escribe un recuerdo hermoso en los dos muros. Esto es único en el mundo.</div>
                </div>
              )}

              {/* Compact legacy indicator when arena closed but still in sync (keeps awareness) */}
              {currentUser.trainingNow && syncPartnerId && !showSyncArena && (
                <button onClick={() => setShowSyncArena(true)} className="mt-2 w-full text-[10px] py-1.5 rounded-2xl border border-[#22c55e]/50 text-[#22c55e] bg-[#0a2a1a]/60 flex items-center justify-center gap-2 active:bg-[#112211]">
                  🔄 Abrir ARENA SYNC completa — {syncVibe}% vibe • {syncStartedAt ? Math.floor((Date.now()-syncStartedAt)/60000):0}min juntos
                </button>
              )}

              {/* Live activity / recent joiners when you are the one training (spectacular feedback loop) */}
              {currentUser.trainingNow && (() => {
                const myPosts = profilePosts[effectiveUserId] || [];
                const livePost = myPosts.find((p: any) => (p.text || '').toLowerCase().includes('entrenando ahora')) || myPosts[0];
                if (!livePost || ((livePost.comments || []).length + (livePost.likes || []).length) === 0) return null;
                const recent = [...(livePost.comments || []), ...(livePost.likes || []).map((id: string) => {
                  const prof = [...realProfiles, ...SEED_PROFILES].find(p => p.id === id);
                  return { userId: id, userName: prof?.name || 'Compañero', isLike: true };
                })].slice(-3).reverse();
                return (
                  <div className="mt-3 pt-3 border-t border-[#2F2F35]">
                    <div className="text-[9px] text-[#22c55e] mb-1 flex items-center gap-1">🔥 Actividad en tu live ahora <span className="text-[#9CA3AF]">(de tu post "Entrenando ahora")</span></div>
                    <div className="space-y-1">
                      {recent.map((c: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-[10px] bg-[#1C1C20] px-2 py-1 rounded-xl border border-[#22c55e]/10 hover:border-[#22c55e]/40 transition cursor-pointer active:bg-[#25252A]" onClick={() => {
                          const joiner = [...realProfiles, ...SEED_PROFILES].find(p => p.id === c.userId);
                          if (joiner) setShowFullProfile(joiner as any); else setActiveTab('feed');
                        }}>
                          <span className="font-medium text-white/95">{c.userName || 'Compañero'}</span> <span className="text-[#22c55e]">{c.isLike ? '❤️ dio like' : '💬 ' + (c.text || '').substring(0,28)}</span>
                          <span className="ml-auto text-[#9CA3AF] text-[8px]">ver →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* MURO / WALL - attractive FB-style feed to make profile feel alive */}
            <div className="px-4 mt-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs uppercase tracking-[1px] text-[#9CA3AF]">Muro</div>
                  <button onClick={() => setActiveTab('feed')} className="text-[9px] text-[#FF671F] underline active:opacity-70">Ver feed global →</button>
                </div>
                <button 
                  disabled={loadingPersonalMuro}
                  onClick={() => { 
                    setLoadingPersonalMuro(true);
                    loadProfilePosts(effectiveUserId).then(() => processIncomingLiveJoins()).finally(() => setLoadingPersonalMuro(false)); 
                  }} 
                  className="text-[10px] px-2 py-0.5 rounded-full border border-[#FF671F]/30 text-[#FF671F] active:bg-[#FF671F]/10 disabled:opacity-50"
                >
                  {loadingPersonalMuro ? '...' : 'Refrescar'}
                </button>
              </div>
              {/* Live engagement stats - makes the muro feel alive and spectacular */}
              {(() => {
                const myPosts = profilePosts[effectiveUserId] || []
                if (myPosts.length === 0) return null
                const likes = myPosts.reduce((s, p) => s + (p.likes?.length || 0), 0)
                const comms = myPosts.reduce((s, p) => s + (p.comments?.length || 0), 0)
                return (
                  <div className="flex gap-3 text-[10px] px-1 mb-2 text-[#9CA3AF]">
                    <span>📝 {myPosts.length}</span>
                    {myPosts.some((p: any) => p.pinned) && <span>📌 {myPosts.filter((p: any) => p.pinned).length}</span>}
                    <span>❤️ {likes}</span>
                    <span>💬 {comms}</span>
                    {currentUser.trainingNow && <span className="text-[#22c55e]">🟢 Live {currentUser.liveStreak ? `🔥${currentUser.liveStreak}d` : ''}</span>}
                    {(currentUser.liveJoins || 0) > 0 && <span className="text-[#22c55e]">🔥 {currentUser.liveJoins} joins {currentUser.joinedLiveStreak ? `+${currentUser.joinedLiveStreak}d` : ''}</span>}
                    <span className="text-[#FF671F]/60">· comunidad interactúa</span>
                  </div>
                )
              })()}

              {/* Pinned posts highlight - spectacular for personal muro */}
              {(() => {
                const myPosts = profilePosts[effectiveUserId] || [];
                const pinned = myPosts.filter((p: any) => p.pinned);
                if (pinned.length === 0) return null;
                return (
                  <div className="px-1 mb-3">
                    <div className="text-[9px] text-[#FF671F] mb-1 flex justify-between items-center">
                      <span>📌 Tus posts fijados ({pinned.length}) — aparecen primero en el feed global</span>
                      <button onClick={() => setActiveTab('feed')} className="text-xs underline active:text-white">ver todo en feed →</button>
                    </div>
                    <div className="card card-glass p-2 text-xs space-y-1">
                      {pinned.slice(0,3).map((p: any) => (
                        <div key={p.id} onClick={() => setActiveTab('feed')} className="truncate cursor-pointer hover:text-[#FF671F] active:text-[#FF671F] flex gap-1">
                          <span>📌</span> <span>{p.text}</span>
                        </div>
                      ))}
                      {pinned.length > 3 && <div className="text-[#FF671F]/70">+{pinned.length-3} más...</div>}
                    </div>
                  </div>
                );
              })()}

              {/* Attractive composer */}
              <div className="card p-4 mb-4">
                <div className="text-sm font-medium text-[#FF671F] mb-2 flex items-center gap-2">
                  <span>📝</span> Publica en tu muro
                  <span className="text-[10px] text-[#9CA3AF] font-normal">(aparece en Feed Global también)</span>
                </div>
                <textarea 
                  ref={muroComposerRef}
                  value={muroComposerText}
                  onChange={e => setMuroComposerText(e.target.value)}
                  placeholder="¿Qué tal tu último entreno? Motiva a la comunidad..."
                  className="form-input w-full h-20 text-sm mb-3 resize-y"
                  maxLength={280}
                />
                <div className="text-[10px] text-right text-[#9CA3AF] -mt-2 mb-2 pr-1">
                  {muroComposerText.length}/280
                </div>
                {muroPhotoUploading && (
                  <div className="mb-3">
                    <div className="text-[10px] text-[#9CA3AF] mb-1">Subiendo foto...</div>
                    <div className="w-full h-2 bg-[#2F2F35] rounded-full overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-[#FF671F] to-[#FF4F79] transition-all" style={{ width: `${muroPhotoUploadProgress}%` }} />
                    </div>
                    <div className="text-[9px] text-right text-[#FF671F]">{muroPhotoUploadProgress}%</div>
                  </div>
                )}
                {muroComposerPhoto && !muroPhotoUploading && (
                  <div className="mb-3">
                    <div className="text-[10px] text-[#9CA3AF] mb-1">Foto del entreno</div>
                    <div className="relative inline-block">
                      <img src={muroComposerPhoto} className="max-h-32 rounded-2xl border-2 border-[#FF671F]/30 object-cover shadow-sm" />
                      <button 
                        onClick={() => setMuroComposerPhoto(null)} 
                        className="absolute -top-2 -right-2 bg-[#1C1C20] hover:bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border border-[#2F2F35] transition-colors"
                        title="Quitar foto"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (typeof window !== 'undefined' && (window as any).Capacitor && CapacitorCamera) {
                        // Native camera + immediate Storage upload with progress for pro UX
                        (async () => {
                          try {
                            const p = await CapacitorCamera.getPhoto({ quality: 70, allowEditing: true, resultType: 'base64' })
                            if (p?.base64String) {
                              const dataUrl = `data:image/jpeg;base64,${p.base64String}`
                              if (!isDemoMode && storage) {
                                setMuroPhotoUploading(true)
                                setMuroPhotoUploadProgress(0)
                                const { ref, uploadString, getDownloadURL } = await import('firebase/storage')
                                const path = `posts/${effectiveUserId}/composer-${Date.now()}.jpg`
                                const storageRef = ref(storage, path)
                                const snap = await uploadString(storageRef, dataUrl, 'data_url')
                                const url = await getDownloadURL(snap.ref)
                                setMuroComposerPhoto(url)
                                setMuroPhotoUploading(false)
                              } else {
                                setMuroComposerPhoto(dataUrl)
                              }
                            }
                          } catch (e) { 
                            toast('No se pudo agregar foto')
                            setMuroPhotoUploading(false)
                          }
                        })()
                      } else {
                        // Web: use nice file picker (much more attractive than prompt URL)
                        muroPhotoInputRef.current?.click()
                      }
                    }}
                    className="flex-1 py-2 text-sm border border-[#2F2F35] rounded-2xl active:bg-[#25252A] flex items-center justify-center gap-1 hover:border-[#FF671F]/40 transition-colors"
                  >
                    📷 {muroComposerPhoto ? 'Cambiar foto' : 'Añadir foto'}
                  </button>
                  {/* Hidden file input for web - makes photo upload feel native and attractive */}
                  <input
                    ref={muroPhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMuroPhotoFile}
                    className="hidden"
                  />
                  <button 
                    onClick={async () => {
                      if (!muroComposerText.trim()) return
                      setMuroPublishing(true)
                      try {
                        await createProfilePost(muroComposerText, muroComposerPhoto)
                        setMuroComposerText('')
                        setMuroComposerPhoto(null)
                        setMuroPublishing(false)
                      } catch (e) {
                        setMuroPublishing(false)
                      }
                    }}
                    disabled={!muroComposerText.trim() || muroPublishing}
                    className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {muroPublishing ? 'Publicando...' : 'Publicar'}
                  </button>
                </div>
                <div className="text-[10px] text-center text-[#9CA3AF] mt-1.5">Visible en tu perfil y para quien vea tu perfil completo</div>
              </div>

              {/* Posts feed - ICONIC beautiful muro for your personal legacy */}
              <div className="px-1 mb-2 flex items-center justify-between">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span>🏋️</span> 
                  <span>Tu Muro</span>
                  <span className="text-[10px] text-[#9CA3AF] font-normal">— tu legado de entreno</span>
                </div>
                <button onClick={() => setActiveTab('feed')} className="text-xs text-[#FF671F] active:underline">Ver en el Feed Global →</button>
              </div>
              <AnimatePresence>
                {loadingPersonalMuro && (profilePosts[effectiveUserId] || []).length === 0 ? (
                  <div className="space-y-3">
                    {[1,2].map(i => (
                      <div key={i} className="muro-post p-4 mb-3 rounded-2xl animate-pulse">
                        <div className="h-3 bg-[#2F2F35] rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-[#2F2F35] rounded w-full mb-1"></div>
                        <div className="h-4 bg-[#2F2F35] rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (profilePosts[effectiveUserId] || []).length > 0 ? (
                  [...(profilePosts[effectiveUserId] || [])].sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.timestamp - a.timestamp).map(post => {
                    const isOwn = true
                    const liked = post.likes.includes(effectiveUserId)
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 16, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.97, height: 0, marginBottom: 0 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: 'spring', bounce: 0.12, duration: 0.28 }}
                        className={`muro-post p-4 mb-3 rounded-2xl ${post.pinned ? 'muro-post--pinned' : ''} hover:border-[#FF671F]/40 overflow-hidden transition-all`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF]" title={new Date(post.timestamp).toLocaleString('es-CL')}>
                            {getRelativeTime(post.timestamp)}
                            {post.pinned && <span className="text-[#FF671F]">📌</span>}
                            {Date.now() - post.timestamp < 3600000 && <span className="text-[8px] bg-[#22c55e] text-black px-1 rounded">nuevo</span>}
                            {recentlyPublishedPostId === post.id && <span className="text-[8px] bg-[#FF671F] text-black px-1.5 rounded font-bold animate-pulse">¡ACABAS DE PUBLICAR!</span>}
                          </div>
                          {isOwn && (
                            <div className="flex gap-1">
                              <button 
                                onClick={() => togglePinPost(post.id, effectiveUserId, post.pinned)}
                                className={`text-xs px-1 ${post.pinned ? 'text-[#FF671F]' : 'text-[#9CA3AF] active:text-[#FF671F]'}`}
                                title={post.pinned ? 'Desfijar del feed' : 'Fijar en el feed global'}
                              >
                                📌
                              </button>
                              <button 
                                onClick={() => startEditPost(post.id, effectiveUserId, post.text)}
                                className="text-[#9CA3AF] text-xs px-1 active:text-[#FF671F]"
                                title="Editar post"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => deleteProfilePost(post.id, effectiveUserId)}
                                className="text-red-400 text-xs px-1 active:text-red-500"
                                title="Eliminar post"
                              >
                                🗑
                              </button>
                            </div>
                          )}
                        </div>
                        {editingPost?.postId === post.id ? (
                          <div className="mb-2">
                            <textarea 
                              value={editDraft}
                              onChange={e => setEditDraft(e.target.value)}
                              className="form-input w-full h-16 text-sm resize-y mb-1"
                              maxLength={280}
                            />
                            <div className="flex gap-2 justify-end">
                              <button onClick={cancelEditPost} className="text-xs px-3 py-1 text-[#9CA3AF] active:text-white">Cancelar</button>
                              <button onClick={saveEditPost} disabled={!editDraft.trim()} className="text-xs px-3 py-1 btn-primary disabled:opacity-50">Guardar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm leading-relaxed mb-2">{post.text}</div>
                        )}
                        {post.photo && (
                          <div 
                            className="relative mb-3 -mx-1 rounded-2xl overflow-hidden ring-1 ring-[#2F2F35] cursor-pointer group"
                            onClick={() => setFeedPhotoModal({ url: post.photo, postId: post.id })}
                          >
                            <img src={post.photo} className="w-full max-h-[240px] object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">🔍 ver foto del entreno</div>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <button 
                            onClick={() => likeProfilePost(post.id, effectiveUserId)}
                            className={`flex items-center gap-1 transition ${liked ? 'text-[#FF671F]' : 'text-[#9CA3AF] hover:text-[#FF671F]'}`}
                          >
                            <motion.span
                              key={liked ? 'l' + post.likes.length : 'u'}
                              animate={{ scale: liked ? [1, 1.35, 1] : 1 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                            >
                              {liked ? '❤️' : '🤍'}
                            </motion.span>
                            <span className="font-medium">{post.likes.length}</span>
                          </button>
                          <button 
                            onClick={() => startComment(post.id, effectiveUserId)}
                            className="flex items-center gap-1 text-[#9CA3AF] hover:text-[#FF671F]"
                          >
                            💬 <span className="font-medium">{post.comments.length}</span>
                          </button>
                        </div>
                        {post.comments.length > 0 && (
                          <div 
                            onClick={() => openFullComments(post.id, effectiveUserId)}
                            className="mt-2 pt-2 border-t border-[#2F2F35] text-xs text-[#9CA3AF] space-y-1 cursor-pointer active:bg-[#1A1A1E]/40 rounded px-1 -mx-1 py-0.5"
                            title="Ver todos los comentarios"
                          >
                            {post.comments.slice(-3).map(c => (
                              <div key={c.id} className="flex gap-1.5 items-start">
                                <span className="font-medium text-white/80">{c.userName}:</span> 
                                <span className="truncate">{c.text}</span>
                                {c.userId === effectiveUserId && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); deleteCommentFromPost(post.id, effectiveUserId, c.id); }}
                                    className="ml-1 text-red-400 text-[10px] active:text-red-500"
                                    title="Eliminar comentario"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                            {post.comments.length > 3 && <div className="text-[#FF671F]/70">+{post.comments.length-3} más... (toca para ver hilo completo)</div>}
                          </div>
                        )}
                        {/* Inline attractive comment box */}
                        {activeComment?.postId === post.id && (
                          <div className="mt-2 pt-2 border-t border-[#2F2F35] flex items-center gap-2">
                            <input 
                              type="text" 
                              value={commentDraft} 
                              onChange={e => setCommentDraft(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
                              placeholder="Escribe un comentario..."
                              className="flex-1 form-input text-sm py-1.5"
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
                    )
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="muro-empty p-7 text-center mb-3 rounded-2xl"
                  >
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-[#1C1C20] flex items-center justify-center mb-3 text-3xl">🏋️</div>
                    <div className="font-semibold mb-1.5">Tu muro está listo para la leyenda</div>
                    <div className="text-xs text-[#9CA3AF] mb-4 max-w-[220px] mx-auto leading-snug">Cada post aquí es parte de tu historia de entreno. La comunidad lo verá en el Feed Global. Sé icónico.</div>
                    <button 
                      onClick={() => muroComposerRef.current?.focus()}
                      className="btn-primary text-sm py-2 px-6"
                    >
                      Publicar mi primer logro
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Prominent link to global feed - makes the app feel like a living movement */}
              <div className="mt-3 px-1">
                <button onClick={() => setActiveTab('feed')} className="w-full text-left card card-glass p-3 text-sm flex items-center justify-between active:scale-[0.99]">
                  <div>
                    <div className="text-[#FF671F] font-medium">Explora el Feed Global →</div>
                    <div className="text-[10px] text-[#9CA3AF]">Muro completo de la comunidad, posts fijados y más</div>
                  </div>
                  <span className="text-[#FF671F]">→</span>
                </button>
              </div>
            </div>

            {/* Verification status - visual upgrade */}
            <div className="px-4 mt-4">
              <div className="card p-4 flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2 text-sm">
                    Verificación de identidad
                    {currentUser.verificationStatus === 'verified' && <span className="chip-health text-[10px] px-2 py-0 !font-bold">✓ VERIFICADO</span>}
                    {currentUser.verificationStatus === 'pending' && <span className="text-[#facc15] text-xs font-medium">EN REVISIÓN</span>}
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">Aumenta la confianza de otros usuarios reales</div>
                </div>
                {currentUser.verificationStatus !== 'verified' && (
                  <button onClick={() => { setShowVerificationFlow(true); setVerificationStep(1); }} className="shrink-0 text-xs px-4 py-2 bg-[#FF671F] text-black rounded-2xl font-semibold active:bg-[#E55A1A]">
                    {currentUser.verificationStatus === 'pending' ? 'Ver estado' : 'Verificar'}
                  </button>
                )}
              </div>
            </div>

            {/* Legal & safety */}
            <div className="px-4 mt-4 card p-4 text-sm">
              <div className="text-xs uppercase tracking-widest text-[#9CA3AF] mb-2">Legal y seguridad</div>
              <div className="flex flex-col gap-1 text-[#FF671F] text-sm">
                <button onClick={() => setShowLegal('terms')} className="text-left py-0.5">Términos de Servicio</button>
                <button onClick={() => setShowLegal('privacy')} className="text-left py-0.5">Política de Privacidad</button>
                <button onClick={() => setShowLegal('community')} className="text-left py-0.5">Directrices de la Comunidad</button>
                <a href="/entrenamatch/privacy.html" target="_blank" className="text-left py-0.5 hover:underline">Ver Política de Privacidad completa →</a>
                <a href="/entrenamatch/terms.html" target="_blank" className="text-left py-0.5 hover:underline">Ver Términos de Servicio completos →</a>
              </div>
            </div>

            {/* Micro guidance - kept minimal, no heavy Pre-Alpha branding to avoid clutter in profile view */}
            <div className="px-4 mt-6 mb-8">
              <div className="card p-4 text-xs text-[#9CA3AF] leading-snug">
                Tus datos se sincronizan entre dispositivos vía Firebase. Usa "Cambiar cuenta" en la barra superior (siempre visible) o el botón del encabezado. ¡Gracias por testear!
                <div className="mt-1 text-[10px] text-[#9CA3AF]">Ver PRODUCTION_AND_APK.md para hosting y builds.</div>
              </div>
              <div className="text-center text-[10px] text-[#6B7280] mt-4">v0.1.11-arena • Solo +18 • Backend real</div>
            </div>

            {/* Mobile App Download - Prominent for Pre-Alpha testers */}
            <div className="px-4 mt-2 mb-8">
              <div className="card p-5 rounded-3xl border border-[#FF4F79]/30 bg-[#1C1C20]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">📱</div>
                  <div>
                    <div className="font-semibold text-[#FF671F]">App Móvil Android</div>
                    <div className="text-xs text-[#9CA3AF]">Experiencia nativa con notificaciones y mejor cámara</div>
                  </div>
                </div>
                <div className="text-sm text-[#F8F8F8] mb-4">
                  Descarga la versión nativa de EntrenaMatch (APK) para tener <strong>notificaciones push reales en tu celular</strong> (mejor que web PWA), cámara nativa y experiencia completa offline. Se actualiza vía GitHub Releases. Para pruebas beta, instala el APK (activa "orígenes desconocidos").
                </div>
                <a 
                  href="https://github.com/musclegrenadechile/entrenamatch/releases/tag/android-prealpha" 
                  target="_blank"
                  className="btn-primary w-full block text-center text-sm py-2.5"
                >
                  Descargar APK más reciente (Gratis)
                </a>
                <div className="text-[10px] text-center text-[#9CA3AF] mt-2">
                  También disponible automáticamente en GitHub Actions → Artifacts
                </div>
              </div>
            </div>

            {/* Beta Feedback ENHANCED (Phase 0 - structured, with history) - visual polish */}
            <div className="px-4 mt-2 mb-8">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-sm flex items-center gap-2"><Star size={15} className="text-[#FF671F]" /> Feedback de Beta</div>
                  <div className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FF671F]/10 text-[#FF671F] border border-[#FF671F]/20">Privado</div>
                </div>
                <p className="text-[11px] text-[#9CA3AF] mb-4">Tu opinión define la app. Todo se guarda en Firebase y lo leemos.</p>

                {/* Type segmented */}
                <div className="mb-3">
                  <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-1">Tipo</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { v: 'bug', l: '🐞 Bug' },
                      { v: 'idea', l: '💡 Idea' },
                      { v: 'ux', l: '🎨 UX / Diseño' },
                      { v: 'other', l: '📝 Otro' },
                    ].map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => setFeedbackType(opt.v as any)}
                        className={`px-3 py-1 text-xs rounded-2xl border transition ${feedbackType === opt.v ? 'bg-[#FF671F] text-black border-[#FF671F]' : 'border-[#2F2F35] text-[#cbd5e1] active:bg-[#1C1C20]'}`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Star rating */}
                <div className="mb-3">
                  <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-1">¿Qué tan bien funciona para ti? (1-5)</div>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(r => (
                      <button
                        key={r}
                        onClick={() => setFeedbackRating(r)}
                        className={`p-1 rounded-xl ${feedbackRating >= r ? 'text-[#facc15]' : 'text-[#6B7280]'}`}
                        aria-label={`${r} estrellas`}
                      >
                        <Star size={22} fill={feedbackRating >= r ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                    <span className="ml-1 text-sm text-[#9CA3AF] self-center">{feedbackRating}/5</span>
                  </div>
                </div>

                {/* Text */}
                <textarea 
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full bg-[#1C1C20] border border-[#2F2F35] rounded-2xl p-3 text-sm h-20 resize-y" 
                  placeholder="Cuéntanos qué pasó, qué te gustó, qué duele o qué mejorarías..."
                />

                {/* APK screenshot note */}
                <div className="text-[10px] text-[#9CA3AF] mt-1 mb-2">
                  En la APK nativa puedes adjuntar capturas al reportar por el mismo canal de invitación.
                </div>

                <button 
                  onClick={async () => {
                    const text = feedbackText.trim()
                    if (!text) { toast('Escribe algo antes de enviar'); return }
                    if (!firebaseUser?.uid || !db) { toast('Inicia sesión para enviar feedback'); return }

                    const platform = (typeof window !== 'undefined' && (window as any).Capacitor) ? 'android' : 'web'
                    const appVersion = '0.1.7-prealpha'

                    try {
                      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
                      await addDoc(collection(db, 'betaFeedback'), {
                        userId: firebaseUser.uid,
                        type: feedbackType,
                        rating: feedbackRating,
                        text,
                        platform,
                        appVersion,
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                        createdAt: serverTimestamp(),
                      })
                      toast.success('¡Gracias! Feedback guardado.')
                      setFeedbackText('')
                      setFeedbackType('idea')
                      setFeedbackRating(5)
                      setLastSync(new Date())
                      await loadMyFeedbacks()
                    } catch (e) {
                      toast.error('No se pudo enviar (revisa conexión o permisos)')
                    }
                  }}
                  className="mt-1 w-full py-2.5 rounded-2xl bg-[#FF671F] text-black text-sm font-semibold active:bg-[#E55A1A]"
                >
                  Enviar feedback estructurado
                </button>
                <div className="text-[10px] text-[#9CA3AF] mt-1 text-center">Se guarda privado • Lo revisamos para la beta</div>

                {/* My previous feedbacks list */}
                {(myFeedbacks.length > 0 || loadingMyFeedbacks) && (
                  <div className="mt-4 pt-3 border-t border-[#2F2F35]">
                    <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-2 flex items-center justify-between">
                      <span>Mis feedbacks anteriores</span>
                      {loadingMyFeedbacks && <span className="text-[#FF671F]">cargando…</span>}
                    </div>
                    {myFeedbacks.length === 0 && !loadingMyFeedbacks && (
                      <div className="text-xs text-[#9CA3AF]">Aún no has enviado ninguno. ¡El primero cuenta mucho!</div>
                    )}
                    <div className="space-y-2 max-h-44 overflow-auto pr-1">
                      {myFeedbacks.map((fb, i) => (
                        <div key={fb.id || i} className="bg-[#1C1C20] rounded-2xl p-3 text-xs border border-[#2F2F35] card-glass">
                          <div className="flex items-center gap-2 text-[#9CA3AF]">
                            <span className="font-medium text-white/90">{fb.type === 'bug' ? '🐞 Bug' : fb.type === 'idea' ? '💡 Idea' : fb.type === 'ux' ? '🎨 UX' : '📝 Otro'}</span>
                            <span>·</span>
                            <span className="text-[#facc15]">{ '★'.repeat(Math.max(1, Math.min(5, fb.rating || 0))) }</span>
                            <span className="ml-auto text-[#9CA3AF] text-[10px]">{new Date(fb.createdAt).toLocaleDateString('es-CL', {month:'short', day:'numeric'})}</span>
                          </div>
                          <div className="mt-1.5 text-[#cbd5e1] leading-snug line-clamp-2 text-[11px]">{fb.text}</div>
                          <div className="mt-1 text-[#9CA3AF] text-[9px] flex items-center gap-1">📱 {fb.platform}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Web notification quick control (only real web users; native uses Capacitor plugin) */}
            {!isDemoMode && typeof window !== 'undefined' && typeof (window as any).Capacitor === 'undefined' && (
              <div className="px-4 pb-2">
                <button
                  onClick={() => { requestWebNotificationPermission(); toast('Solicitando permiso de notificaciones del navegador...') }}
                  className="w-full text-xs py-2 rounded-2xl border border-[#2F2F35] text-[#FF671F] active:bg-[#1C1C20]"
                >
                  🔔 Activar/renovar notificaciones del navegador (para mensajes en segundo plano)
                </button>
              </div>
            )}

            {/* Native push notification activation (only in real APK) */}
            {!isDemoMode && typeof window !== 'undefined' && typeof (window as any).Capacitor !== 'undefined' && (
              <div className="px-4 pb-2">
                <button
                  onClick={() => { requestNativePushPermission() }}
                  className="w-full text-xs py-2.5 rounded-2xl border border-[#22c55e]/40 bg-[#22c55e]/5 text-[#22c55e] active:bg-[#22c55e] active:text-black font-semibold"
                >
                  🔔 Activar notificaciones push nativas (reales en Android, incluso app cerrada)
                </button>
                <div className="text-[9px] text-center text-[#9CA3AF] mt-1">Mejor que PWA. Requiere build con google-services.json correcto.</div>
                {!PushNotifications && (
                  <div className="mt-1.5 text-[9px] bg-red-950/50 border border-red-500/50 text-red-400 p-1.5 rounded-xl text-center">
                    ⚠️ Esta build del APK no tiene google-services.json configurado. La app puede fallar al abrir en Android. Actualiza a v0.1.7+.
                  </div>
                )}
              </div>
            )}

            {/* Notification preferences - simple local toggles (progressive UX improvement) */}
            {!isDemoMode && (
              <div className="px-4 pb-3">
                <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-1.5">Preferencias de notificaciones (local en este dispositivo)</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { key: 'messages' as const, label: 'Mensajes y matches', icon: '💬' },
                    { key: 'live' as const, label: 'Live / Sesiones', icon: '🟢' },
                    { key: 'muro' as const, label: 'Actividad en muro', icon: '📝' },
                  ].map(p => (
                    <button
                      key={p.key}
                      onClick={() => setNotifPrefs(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                      className={`px-2.5 py-1 rounded-xl border flex items-center gap-1 transition ${notifPrefs[p.key] ? 'border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]' : 'border-[#2F2F35] text-[#9CA3AF] opacity-70'}`}
                    >
                      {p.icon} {p.label} {notifPrefs[p.key] ? '✓' : '○'}
                    </button>
                  ))}
                </div>
                <div className="text-[9px] text-[#9CA3AF] mt-1">Cambios se guardan localmente. Útil para silenciar temporalmente.</div>
              </div>
            )}

            {/* PWA / App install options - always offer for web, with clear APK for native notifications on phone */}
            {!isDemoMode && typeof window !== 'undefined' && typeof (window as any).Capacitor === 'undefined' && (
              <div className="px-4 pb-3 space-y-2">
                <button
                  onClick={() => { 
                    localStorage.removeItem('entrenamatch_pwa_dismissed'); 
                    setShowPwaInstall(true); 
                  }}
                  className="w-full text-xs py-2.5 rounded-2xl border border-[#FF671F]/40 bg-[#FF671F]/5 text-[#FF671F] active:bg-[#FF671F] active:text-black flex items-center justify-center gap-1.5 font-semibold"
                >
                  <Download size={14} /> Instalar como PWA (acceso rápido + notifs web)
                </button>
                <div className="text-[9px] text-center text-[#9CA3AF]">O usa el botón 📱 Instalar de la barra superior.</div>
              </div>
            )}

            {/* Subtle logout at the very bottom of Profile (non-blocking, after all content) */}
            <div className="px-4 pb-8 pt-2 text-center">
              <div className="text-[10px] text-[#6B7280] mb-1">v0.1.11-arena • Phase 0 real</div>
              <div className="text-[10px] text-[#9CA3AF] mb-1 flex justify-center gap-2">
                <a href="/entrenamatch/privacy.html" target="_blank" className="underline active:text-[#FF671F]">Privacidad</a>
                <span>·</span>
                <a href="/entrenamatch/terms.html" target="_blank" className="underline active:text-[#FF671F]">Términos</a>
              </div>
              <button 
                onClick={handleLogout} 
                className="text-xs text-[#9CA3AF] active:text-[#f87171] underline"
              >
                Cerrar sesión / Cambiar de cuenta
              </button>
            </div>
          </div>
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
                    Estás entre los primeros en probar <strong>El match del movimiento</strong> con perfiles reales. <span className="text-[#FF671F]">¡Nuevo diseño con energía naranja estilo Dunkin' para que te atrape!</span>
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
          const postsForUser = profilePosts[viewingPostComments.postUserId] || []
          const livePost = postsForUser.find(p => p.id === viewingPostComments.postId) || { id: viewingPostComments.postId, text: '', comments: [], likes: [] } as any
          const comments = (livePost.comments || []).slice().sort((a: any, b: any) => a.timestamp - b.timestamp) // oldest first for thread feel
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
                    onClick={submitModalComment} 
                    disabled={!modalCommentDraft.trim()} 
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
      <div className="bottom-nav h-[62px] grid grid-cols-7 z-50 text-[9px] pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_20px_-6px_rgb(0,0,0,0.4)]">
        {[
          { id: 'explore' as Tab, label: 'Explorar', icon: Dumbbell, live: liveTrainingNow.length > 0 },
          { id: 'feed' as Tab, label: 'Feed', icon: Activity },
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
            {id === 'explore' && liveTrainingNow.length > 0 && (
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
                    className="mt-3 text-xs w-full py-2.5 rounded-2xl border border-[#FF671F] text-[#FF671F] active:bg-[#FF671F] active:text-black"
                  >
                    Activar GPS para usar distancia
                  </button>
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
                    <div className="text-xs text-[#9CA3AF]">¡Quién está entrenando en este preciso momento cerca! Urgencia real.</div>
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
                          const memberProfile = SEED_PROFILES.find(p => p.id === mid)
                          const displayName = memberProfile ? memberProfile.name : (mid === 'me' ? currentUser?.name || 'Tú' : 'Tú')

                          return (
                            <div 
                              key={mid} 
                              className="chip text-xs cursor-pointer active:bg-[#FF671F] active:text-black"
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
                          <div className="text-xs text-[#9CA3AF] px-3 py-1">Espacio disponible</div>
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
                                creatorId: effectiveUserId,
                                creatorName: currentUser?.name || 'Tú',
                                title: `Sesión del Squad: ${squad.name}`,
                                time: 'Mañana 19:00',
                                location: squad.focus === 'Running' ? 'Playa Reñaca' : 'Gym cercano',
                                trainingType: squad.focus,
                                maxParticipants: Math.min(6, squad.members.length + 2),
                                participants: [...squad.members.filter(m => m !== 'me'), effectiveUserId],
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
                      <div className="flex-1 flex flex-col border-t border-[#2F2F35]">
                        <div className="p-3 text-sm font-medium text-[#FF671F] border-b border-[#2F2F35]">Chat del Squad</div>
                        <div className="flex-1 overflow-auto p-4 space-y-2 text-sm" id="squad-chat-scroll">
                          {(sessionMessages[squad.id] || []).length === 0 ? (
                            <div className="text-[#9CA3AF] text-center text-xs mt-6">Aún no hay mensajes. ¡Empieza la coordinación!</div>
                          ) : (
                            (sessionMessages[squad.id] || []).map((msg, i) => (
                              <div key={i} className={`flex ${msg.senderId === 'me' ? 'justify-end' : ''}`}>
                                <div className={`max-w-[75%] px-3 py-1.5 rounded-2xl break-words overflow-hidden ${msg.senderId === 'me' ? 'bg-[#FF671F] text-black' : 'bg-[#25252A]'}`}>
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
                      <button onClick={() => { handleSwipe(showFullProfile.id, 'right'); setShowFullProfile(null); /* live join toast + auto muro comment handled inside handleSwipe for consistency */ }} className="mt-1 w-full py-2 bg-[#22c55e] text-black rounded-2xl text-sm font-bold active:bg-[#16a34a]">Unirme ahora al entrenamiento 🔥</button>
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
                      <button onClick={() => setActiveTab('feed')} className="text-[9px] text-[#FF671F] underline active:opacity-70">Ver feed global</button>
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
                          <div className="text-[13px] leading-snug mb-2 text-white/95">{post.pinned ? '📌 ' : ''}{post.text}</div>
                          {post.photo && (
                            <div className="relative mb-3 -mx-1 rounded-2xl overflow-hidden ring-1 ring-[#2F2F35]">
                              <img src={post.photo} className="w-full max-h-[200px] object-cover transition-transform hover:scale-[1.02]" />
                              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                            <span title={new Date(post.timestamp).toLocaleString('es-CL')}>{getRelativeTime(post.timestamp)}</span>
                            <span onClick={() => likeProfilePost(post.id, showFullProfile.id)} className="cursor-pointer active:text-[#FF671F]">❤️ {post.likes.length}</span>
                            <span onClick={() => startComment(post.id, showFullProfile.id, showFullProfile.name)} className="cursor-pointer active:text-[#FF671F]">💬 {post.comments.length}</span>
                          </div>
                          {post.comments.length > 0 && (
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
                              {post.comments.length > 2 && <div className="text-[#FF671F]/70 mt-0.5">+{post.comments.length-2} más... toca para ver todo</div>}
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
                <button onClick={() => { setShowFullProfile(null); openChat(showFullProfile.id) }} className="flex-1 btn-primary">Abrir chat con {showFullProfile.name.split(' ')[0]}</button>
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
                  if (confirm('¿Reportar a esta persona por comportamiento inadecuado o spam?')) {
                    reportUser(showFullProfile.id, 'Comportamiento inadecuado', undefined, 'profile')
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
                              appVersion: '0.1.7-prealpha',
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
                            const mention = `@${name.split(' ')[0]} `
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
                              <div className={`message-bubble inline-block ${isMe ? 'sent' : 'received'}`}>
                                {renderMessageText(msg.text)}
                                {msg.photo && <img src={msg.photo} className="mt-2 max-w-[200px] rounded-xl border border-white/10" />}
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

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault()
                        if ((chatInputValue.trim() || groupChatPhoto) && showGroupChatModalFor) {
                          sendSessionMessage(showGroupChatModalFor, chatInputValue, groupChatPhoto)
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
                        placeholder="Mensaje al grupo..."
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

                      <button type="submit" disabled={!chatInputValue.trim() && !groupChatPhoto} className="bg-[#FF671F] disabled:bg-[#2F2F35] disabled:text-[#9CA3AF] text-black px-3 rounded-3xl font-semibold h-11 w-11 flex items-center justify-center active:bg-[#E55A1A] active:scale-95 transition" aria-label="Enviar">
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
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF671F] text-black font-bold">
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
                    const typeIcon = notif.type === 'message' ? '💬' : notif.type === 'match' ? '❤️' : notif.type === 'session_join' ? '👥' : notif.type === 'squad_join' ? '🏋️' : '🔔'
                    const time = notif.timestamp ? getRelativeTime(notif.timestamp) : ''
                    return (
                      <div 
                        key={notif.id} 
                        className={`p-4 border-b border-[#2F2F35] flex items-start gap-3 active:bg-[#1C1C20] cursor-pointer ${!notif.read ? 'bg-[#1C1C20]' : ''}`}
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
                            setChatUnreads(prev => { const c = { ...prev }; if (notif.relatedId) c[notif.relatedId] = 0; return c })
                          }
                          if (notif.type === 'message' && notif.relatedId) {
                            setShowNotifications(false)
                            const isLikelyGroup = (notif.relatedId || '').startsWith('s')
                            if (isLikelyGroup) {
                              setActiveTab('sesiones')
                              setShowGroupChatModalFor(notif.relatedId)
                              setSessionUnreads(prev => { const c = { ...prev }; if (notif.relatedId) c[notif.relatedId] = 0; return c })
                            } else {
                              setActiveTab('messages')
                              setActiveChat(notif.relatedId)
                              setChatUnreads(prev => { const c = { ...prev }; if (notif.relatedId) c[notif.relatedId] = 0; return c })
                            }
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

    </ErrorBoundary>
  )
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D0D10] text-white flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-2xl mb-4">Algo salió mal</div>
            <p className="text-[#9CA3AF] mb-6">La aplicación tuvo un error durante la inicialización.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Recargar la página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default App
