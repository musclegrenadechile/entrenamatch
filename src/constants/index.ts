// @ts-nocheck
import type { Profile } from '../types'

export const TRAINING_OPTIONS = [
  'Pesas/Gym', 'Running', 'Calistenia', 'CrossFit', 'Yoga', 
  'Funcional', 'Boxeo', 'Ciclismo', 'Natación', 'Pilates'
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
export const APP_VERSION = '0.1.103'
