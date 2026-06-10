import type { Message, Profile } from '../types'

export function getLastChatMessage(msgs: Message[] | undefined): Message | undefined {
  if (!msgs?.length) return undefined
  return msgs.reduce((best, m) =>
    (m.timestamp || 0) >= (best.timestamp || 0) ? m : best
  )
}

export function getChatLastTimestamp(msgs: Message[] | undefined): number {
  return getLastChatMessage(msgs)?.timestamp || 0
}

/** WhatsApp-style time for chat list rows. */
export function formatChatListTime(ts?: number, now = Date.now()): string {
  if (!ts) return ''
  const d = new Date(ts)
  const diff = now - ts
  if (diff < 60_000) return 'ahora'
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m`

  const today = new Date(now)
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'ayer'

  if (diff < 7 * 24 * 60 * 60_000) {
    const wd = d.toLocaleDateString('es-CL', { weekday: 'short' })
    return wd.charAt(0).toUpperCase() + wd.slice(1)
  }

  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}

export function formatChatPreview(last: Message | undefined): string {
  if (!last) return 'Match nuevo — saluda'
  if (last.workoutPreview) {
    const title = last.workoutPreview.title?.trim()
    return title ? `🏋️ ${title}` : '🏋️ Entreno'
  }
  if (last.photoUrl) return '📷 Foto'
  if (last.voiceUrl) return '🎙️ Nota de voz'
  if (last.text?.trim()) return last.text.trim()
  return 'Mensaje'
}

export function sortProfilesByChatActivity(
  profiles: Profile[],
  messages: Record<string, Message[]>
): Profile[] {
  return [...profiles].sort((a, b) => {
    const ta = getChatLastTimestamp(messages[a.id])
    const tb = getChatLastTimestamp(messages[b.id])
    if (tb !== ta) return tb - ta
    return a.name.localeCompare(b.name, 'es')
  })
}
