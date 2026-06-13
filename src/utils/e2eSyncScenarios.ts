/**
 * Fase 354 — scripted QA steps for 2-device EntrenaSync (manual E2E checklist).
 */

export type E2ESyncStep = {
  id: string
  device: 'A' | 'B' | 'both'
  action: string
  expect: string
}

/** Minimum sync loop validation — pair with P0_BETA_RELEASE.md row 6. */
export const E2E_SYNC_TWO_DEVICE_STEPS: E2ESyncStep[] = [
  {
    id: 'sync-01',
    device: 'A',
    action: 'Login + activar LIVE',
    expect: 'Aparece en mapa de B en <60 s',
  },
  {
    id: 'sync-02',
    device: 'B',
    action: 'Abrir mapa / notificación team_live',
    expect: 'Deep link abre mapa o modal LIVE de A',
  },
  {
    id: 'sync-03',
    device: 'A',
    action: 'Invitar EntrenaSync a B (o B acepta desde mapa)',
    expect: 'Arena sync visible en ambos',
  },
  {
    id: 'sync-04',
    device: 'both',
    action: 'Mantener sync ≥2 min con acción (serie/voz)',
    expect: 'Minutos suman al derby / pacto semanal',
  },
  {
    id: 'sync-05',
    device: 'both',
    action: 'Finalizar sync',
    expect: 'Resumen con duración; sin crash al volver a tabs',
  },
]

export function countStepsByDevice(steps: E2ESyncStep[]): Record<'A' | 'B' | 'both', number> {
  return steps.reduce(
    (acc, s) => {
      acc[s.device] += 1
      return acc
    },
    { A: 0, B: 0, both: 0 }
  )
}
