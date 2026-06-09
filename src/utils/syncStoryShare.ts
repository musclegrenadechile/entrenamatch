/** Render 1080×1920 story PNG for post-sync share */
export async function renderSyncStoryPng(opts: {
  selfName: string
  partnerName: string
  minutes: number
  vibe: number
  setsLogged: number
}): Promise<Blob | null> {
  const w = 1080
  const h = 1920
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const grd = ctx.createLinearGradient(0, 0, w, h)
  grd.addColorStop(0, '#0D0D10')
  grd.addColorStop(0.5, '#1a160f')
  grd.addColorStop(1, '#0a2a1a')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = '#FF671F'
  ctx.font = 'bold 72px system-ui'
  ctx.fillText('EntrenaSync', 80, 200)

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 56px system-ui'
  ctx.fillText(`${opts.selfName.split(' ')[0]} × ${opts.partnerName.split(' ')[0]}`, 80, 320)

  ctx.fillStyle = '#22c55e'
  ctx.font = '48px system-ui'
  ctx.fillText(`${opts.minutes} min · Vibe ${opts.vibe}%`, 80, 420)
  ctx.fillText(`${opts.setsLogged} series registradas`, 80, 500)

  ctx.fillStyle = '#9CA3AF'
  ctx.font = '36px system-ui'
  ctx.fillText('#EntrenaMatch · GymPulse', 80, h - 120)

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

export function buildSyncPostText(opts: {
  selfName: string
  partnerName: string
  minutes: number
  vibe: number
}): string {
  const a = opts.selfName.split(' ')[0]
  const b = opts.partnerName.split(' ')[0]
  return `🔥 ENTRENASYNC COMPLETADO con ${b} — ${opts.minutes} min · Vibe ${opts.vibe}%\n${a} × ${b} · #EntrenaMatch #GymPulse`
}

export async function syncStoryToDataUrl(
  opts: Parameters<typeof renderSyncStoryPng>[0]
): Promise<string | null> {
  const blob = await renderSyncStoryPng(opts)
  if (!blob) return null
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function downloadSyncStory(opts: Parameters<typeof renderSyncStoryPng>[0]): Promise<void> {
  const blob = await renderSyncStoryPng(opts)
  if (!blob) return
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `entrenamatch-sync-${Date.now()}.png`
  a.click()
  URL.revokeObjectURL(url)
}
