/**
 * Fase 358 — scripted P0 beta QA matrix (manual checklist, versioned).
 */

export type P0QaRow = {
  id: string
  flow: string
  version: string
}

export const P0_BETA_QA_VERSION = '0.1.376'

/** Minimum 2-device QA before pilot rollout — mirrors P0_BETA_RELEASE.md. */
export const P0_BETA_QA_MATRIX: P0QaRow[] = [
  { id: 'p0-01', flow: 'Registro → onboarding → Tab Hoy', version: P0_BETA_QA_VERSION },
  { id: 'p0-02', flow: 'LIVE no se activa solo al terminar onboarding', version: P0_BETA_QA_VERSION },
  { id: 'p0-03', flow: 'Una sola guía (3 pasos), sin tour apilado', version: P0_BETA_QA_VERSION },
  { id: 'p0-04', flow: 'CityDerbyCard visible 0 vs 0 + índice población', version: P0_BETA_QA_VERSION },
  { id: 'p0-05', flow: 'LIVE → visible en mapa otro usuario (<60 s)', version: P0_BETA_QA_VERSION },
  { id: 'p0-06', flow: 'EntrenaSync ≥2 min → minutos al derby', version: P0_BETA_QA_VERSION },
  { id: 'p0-07', flow: 'Matches tab carga (sin error chunk tras hard refresh)', version: P0_BETA_QA_VERSION },
  { id: 'p0-08', flow: 'Invitar amigo desde piloto strip', version: P0_BETA_QA_VERSION },
  { id: 'p0-09', flow: 'Toast derby si rival supera (simular minutos)', version: P0_BETA_QA_VERSION },
  { id: 'p0-10', flow: 'Panel notificaciones → deep link chat/map', version: P0_BETA_QA_VERSION },
  { id: 'p0-11', flow: 'Publicar en Muro (texto + foto) desde Home', version: P0_BETA_QA_VERSION },
  { id: 'p0-12', flow: 'Crashlytics nativo (APK internal)', version: P0_BETA_QA_VERSION },
]

export function countP0Rows(version = P0_BETA_QA_VERSION): number {
  return P0_BETA_QA_MATRIX.filter((r) => r.version === version).length
}
