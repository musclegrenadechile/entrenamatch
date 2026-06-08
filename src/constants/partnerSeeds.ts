import type { PartnerLocation } from '../types'

/** Demo-only partner seeds — never merged into map in Firebase real mode (fase 118). */
export const PARTNER_SEEDS: PartnerLocation[] = [
  {
    id: 'p-seed-1',
    name: 'Muscle Grenade Viña',
    lat: -33.015,
    lng: -71.55,
    type: 'gym',
    address: 'Viña del Mar, cerca del centro',
    promoLabel: '10% OFF primera visita',
    promoCode: 'MGVIÑA10',
  },
  {
    id: 'p-seed-2',
    name: 'Gym Partner Santiago',
    lat: -33.45,
    lng: -70.65,
    type: 'gym',
    address: 'Santiago, Providencia',
    promoLabel: 'Día guest gratis con check-in',
    promoCode: 'STGO-GUEST',
  },
  {
    id: 'p-seed-3',
    name: 'Suplementos Elite Valpo',
    lat: -33.05,
    lng: -71.62,
    type: 'store',
    address: 'Valparaíso, Cerro Concepción',
    promoLabel: 'Shake post-entreno 2x1',
    promoCode: 'ELITE2X1',
  },
  {
    id: 'p-seed-4',
    name: 'CrossFit Concón',
    lat: -32.92,
    lng: -71.52,
    type: 'gym',
    address: 'Concón, zona costera',
    promoLabel: 'Clase prueba gratis',
    promoCode: 'CONCON-WOD',
  },
]
