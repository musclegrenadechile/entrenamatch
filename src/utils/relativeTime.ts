/** Compact relative time for chats, notifications, feed (e.g. "5m", "2h", "ahora"). */
export function getRelativeTime(ts?: number): string {
  if (!ts) return ''
  const diff = Date.now() - ts
  if (diff < 60000) return 'ahora'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return new Date(ts).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}
