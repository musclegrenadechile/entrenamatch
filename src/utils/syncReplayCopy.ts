/** Copy + helpers for EntrenaSync replay / witness UI (plain Spanish). */

import type { ProfilePost } from '../types'

export const SYNC_REPLAY_COPY = {
  galleryTitle: 'Entrenaste con alguien',
  galleryHint: 'Toca una sesión — verás el resumen en el Muro',
  modalEyebrow: 'Resumen de la sesión',
  modalTitle: (partner: string) => `EntrenaSync con ${partner}`,
  modalStats: (minutes: number, vibe: number, rating?: number | null) => {
    const base = `${minutes} min · Conexión ${vibe}%`
    return rating ? `${base} · ${rating}★` : base
  },
  emptyActions: 'En esta sesión no quedaron reacciones guardadas (series, emojis, fotos).',
  resync: (firstName: string) => `Volver a entrenar con ${firstName}`,
  modalFooter: 'Este resumen también queda en el Muro de ambos.',
  witnessEyebrow: 'Viste un EntrenaSync en vivo',
  witnessSubtitle: 'Alguien de tu zona entrenó en pareja — esto es lo que pasó',
  witnessEmpty: 'Sesión intensa en el mapa — sin detalle de reacciones.',
  witnessCreate: 'Quiero hacer el mío',
  witnessSave: 'Guardar en mi muro',
  witnessFooter: 'Lo viste en el mapa cuando la onda apareció en vivo.',
  witnessToast: 'Publicado en tu Muro',
  witnessToastDesc: 'Tus contactos verán que apoyaste un EntrenaSync',
} as const

export function isSyncReplayPost(post: ProfilePost): boolean {
  if (post.postType === 'workout' || post.postType === 'nutrition') return false
  const text = (post.text || '').toLowerCase()
  return (
    post.postType === 'sync' ||
    !!post.isSyncStory ||
    text.includes('entrenasync') ||
    text.includes('sincronizado') ||
    text.includes('destacado de sesión sync')
  )
}

export function formatSyncVibeLabel(vibe: number): string {
  return `Conexión ${Math.max(0, Math.min(100, Math.round(vibe)))}%`
}

export function formatSyncReplayCard(post: ProfilePost): { title: string; subtitle: string } {
  const text = post.text || ''
  const partner =
    text.match(/ENTRENASYNC con\s+([^·\n•%]+)/i)?.[1]?.trim() ||
    text.match(/sincronizados? con\s+([^·\n•%]+)/i)?.[1]?.trim() ||
    text.match(/con\s+([A-Za-zÁÉÍÓÚáéíóúÑñ][^\n·•%]{1,40})/i)?.[1]?.trim()
  const first = partner?.split(/\s+/)[0]
  const minMatch = text.match(/(\d+)\s*min/i)
  const mins = minMatch ? `${minMatch[1]} min` : null

  if (first) {
    return {
      title: `Con ${first}`,
      subtitle: mins ? `EntrenaSync · ${mins}` : 'EntrenaSync',
    }
  }
  if (post.workoutPreview) {
    return {
      title: post.workoutPreview.title?.slice(0, 24) || 'Entreno',
      subtitle: `${post.workoutPreview.durationMin} min`,
    }
  }
  return { title: 'EntrenaSync', subtitle: text.slice(0, 32) || 'Sesión' }
}

export function buildWitnessEchoPostText(opts: {
  partnerName: string
  minutes: number
  vibe: number
  actions?: Array<{ emoji?: string; label?: string }>
}): string {
  const actionLine = (opts.actions || [])
    .slice(0, 3)
    .map((a) => `${a.emoji || '💪'} ${a.label || 'Acción'}`)
    .join(' · ')
  const lines = [
    '🔥 Destacado de Sesión Sync',
    `Vi un EntrenaSync con ${opts.partnerName} — ${opts.minutes} min · ${formatSyncVibeLabel(opts.vibe)}`,
  ]
  if (actionLine) lines.push(actionLine)
  lines.push('Lo vi en vivo en el mapa de la Comunidad.')
  return lines.join('\n')
}
