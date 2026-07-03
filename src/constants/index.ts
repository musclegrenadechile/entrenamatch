// @ts-nocheck
import type { Profile, ProfileGender } from '../types'

export const PROFILE_GENDER_OPTIONS: ReadonlyArray<{ value: ProfileGender; label: string }> = [
  { value: 'hombre', label: 'Hombre' },
  { value: 'mujer', label: 'Mujer' },
  { value: 'otro', label: 'Otros' },
]

export const TRAINING_OPTIONS = [
  'Pesas/Gym', 'Running', 'Fútbol', 'Pádel', 'Rugby', 'Básquet', 'Tenis',
  'Calistenia', 'CrossFit', 'Yoga', 'Funcional', 'Boxeo', 'Ciclismo', 'Natación', 'Pilates', 'Otro',
]

export const AVAILABILITY = ['Mañana', 'Tarde', 'Noche']

export const TRAINING_GOALS = [
  'Ganar músculo',
  'Perder grasa',
  'Aumentar fuerza',
  'Mejorar resistencia',
  'Rehabilitación / Lesión',
  'Preparar competencia',
  'Mantenerse en forma',
  'Socializar y motivación',
  'Movilidad y flexibilidad',
  'Pérdida de peso'
]

export const TRAINING_INTENSITIES = ['Relajado', 'Moderado', 'Intenso'] as const

export const LEGAL_VERSIONS = {
  terms: 'v1.1',
  privacy: 'v1.1',
  community: 'v1.0',
  lastUpdated: '2026-05-20'
}

// Note: SEED_PROFILES will be moved later as it's large
export const AUTO_MATCH_IDS = ['p1', 'p3', 'p5', 'p6', 'p9', 'p11', 'p13']

// Centralized app version (used in UI footers, auth screen, crash reports, APK, etc.)
export const APP_VERSION = '0.1.454'

/** Firebase Hosting — canonical origin for APK shares and deep links. */
export const PUBLIC_APP_URL = 'https://entrenamatch.web.app'
export const PUBLIC_APP_URL_FIREBASE_ALT = 'https://entrenamatch.firebaseapp.com'
/** @deprecated GH Pages — redirects to PUBLIC_APP_URL; do not share. */
export const PUBLIC_APP_URL_GITHUB = 'https://musclegrenadechile.github.io/entrenamatch'

/** Firebase Hosting origins only (official web + APK shares). */
export const SHAREABLE_APP_HOSTS = [
  'entrenamatch.web.app',
  'entrenamatch.firebaseapp.com',
] as const

export const LEGACY_GITHUB_HOST = 'musclegrenadechile.github.io'
