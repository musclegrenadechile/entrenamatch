/**
 * Fase 364 — LIVE pilot Saturday checklist (2 devices, manual QA).
 */

export type LivePilotStep = {
  id: string
  actor: 'A' | 'B' | 'both'
  action: string
  passCriteria: string
}

export const LIVE_PILOT_SATURDAY_STEPS: LivePilotStep[] = [
  {
    id: 'live-01',
    actor: 'A',
    action: 'Activar LIVE en gym real',
    passCriteria: 'Badge LIVE visible en perfil y mapa propio',
  },
  {
    id: 'live-02',
    actor: 'B',
    action: 'Abrir mapa Viña/Santiago',
    passCriteria: 'Marcador de A aparece en <60 s',
  },
  {
    id: 'live-03',
    actor: 'B',
    action: 'Tap marcador → perfil completo',
    passCriteria: 'FullProfileSheet abre sin crash',
  },
  {
    id: 'live-04',
    actor: 'both',
    action: 'EntrenaSync ≥2 min',
    passCriteria: 'Arena estable; minutos suman al derby',
  },
  {
    id: 'live-05',
    actor: 'A',
    action: 'Desactivar LIVE tras 3 h o manual',
    passCriteria: 'Desaparece del mapa de B; sin zombie >72 h',
  },
]
