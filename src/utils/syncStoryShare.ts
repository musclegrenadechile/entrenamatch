/** Render 1080×1920 branded story PNG for post-EntrenaSync share */

import { sharePngBlob, type ShareImageOutcome } from './shareImageBlob'
import { shareableAppHostname } from './sparseCityDefaults'

/** @deprecated Use shareableAppHostname() — kept for tests expecting a string label. */
export const SYNC_STORY_APP_URL = 'entrenamatch.web.app'

export type SyncStoryOpts = {
  selfName: string
  partnerName: string
  minutes: number
  vibe: number
  setsLogged: number
  selfPhoto?: string
  partnerPhoto?: string
  witnessCount?: number
  isNetworkBond?: boolean
}

const W = 1080
const H = 1920

const C = {
  orange: '#FF671F',
  orangeDark: '#E55A1A',
  green: '#22c55e',
  gold: '#FFD700',
  white: '#FFFFFF',
  muted: '#9CA3AF',
  bg0: '#070709',
  bg1: '#121218',
  card: '#1C1C24',
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src?.trim()) return Promise.resolve(null)
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.arcTo(x + w, y, x + w, y + h, rad)
  ctx.arcTo(x + w, y + h, x, y + h, rad)
  ctx.arcTo(x, y + h, x, y, rad)
  ctx.arcTo(x, y, x + w, y, rad)
  ctx.closePath()
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const grd = ctx.createLinearGradient(0, 0, W, H)
  grd.addColorStop(0, C.bg0)
  grd.addColorStop(0.45, '#14110d')
  grd.addColorStop(1, '#0a2218')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, W, H)

  const glowOrange = ctx.createRadialGradient(180, 280, 20, 180, 280, 420)
  glowOrange.addColorStop(0, 'rgba(255,103,31,0.35)')
  glowOrange.addColorStop(1, 'rgba(255,103,31,0)')
  ctx.fillStyle = glowOrange
  ctx.fillRect(0, 0, W, H)

  const glowGreen = ctx.createRadialGradient(W - 120, H - 320, 20, W - 120, H - 320, 500)
  glowGreen.addColorStop(0, 'rgba(34,197,94,0.22)')
  glowGreen.addColorStop(1, 'rgba(34,197,94,0)')
  ctx.fillStyle = glowGreen
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  for (let y = 0; y < H; y += 48) {
    for (let x = 0; x < W; x += 48) {
      ctx.beginPath()
      ctx.arc(x, y, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.strokeStyle = 'rgba(255,103,31,0.12)'
  ctx.lineWidth = 2
  roundRect(ctx, 48, 48, W - 96, H - 96, 48)
  ctx.stroke()
}

async function drawAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  photo: string | undefined,
  fallbackName: string,
  accent: string
) {
  const img = photo ? await loadImage(photo) : null

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2)
  ctx.strokeStyle = accent
  ctx.lineWidth = 8
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  if (img) {
    const side = radius * 2
    ctx.drawImage(img, cx - radius, cy - radius, side, side)
  } else {
    const grd = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius)
    grd.addColorStop(0, '#2a2a32')
    grd.addColorStop(1, '#14141a')
    ctx.fillStyle = grd
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
    ctx.fillStyle = C.white
    ctx.font = `bold ${Math.round(radius * 0.9)}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText((fallbackName.charAt(0) || '?').toUpperCase(), cx, cy + 4)
  }
  ctx.restore()
}

function drawVibeRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, vibe: number) {
  const r = 118
  const pct = Math.max(0, Math.min(100, vibe)) / 100

  ctx.lineWidth = 14
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = C.orange
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct)
  ctx.stroke()

  ctx.fillStyle = C.white
  ctx.font = 'bold 72px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${Math.round(vibe)}%`, cx, cy - 8)

  ctx.fillStyle = C.muted
  ctx.font = '500 28px system-ui, sans-serif'
  ctx.fillText('SYNC SCORE', cx, cy + 44)
}

function drawStatCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  value: string,
  label: string,
  accent: string
) {
  roundRect(ctx, x, y, w, h, 28)
  ctx.fillStyle = 'rgba(28,28,36,0.92)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = accent
  ctx.font = 'bold 52px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(value, x + w / 2, y + h * 0.42)

  ctx.fillStyle = C.muted
  ctx.font = '500 24px system-ui, sans-serif'
  ctx.fillText(label, x + w / 2, y + h * 0.72)
}

export async function renderSyncStoryPng(opts: SyncStoryOpts): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const selfFirst = opts.selfName.split(' ')[0] || 'Tú'
  const partnerFirst = opts.partnerName.split(' ')[0] || 'Compañero'
  const durationLabel =
    opts.minutes >= 1 ? `${opts.minutes}` : '<1'

  drawBackground(ctx)

  // Brand header
  ctx.fillStyle = C.orange
  ctx.font = '900 108px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('Entrena', 80, 110)
  ctx.fillStyle = C.white
  ctx.fillText('Match', 80, 210)

  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  roundRect(ctx, 80, 340, 420, 56, 28)
  ctx.fill()
  ctx.fillStyle = C.green
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('GymPulse · Entrena en vivo con tu red', 290, 356)

  // Session chip
  ctx.fillStyle = 'rgba(255,103,31,0.18)'
  roundRect(ctx, 80, 430, 520, 64, 32)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,103,31,0.45)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = C.orange
  ctx.font = 'bold 30px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('🔄 ENTRENASYNC COMPLETADO', 108, 448)

  if (opts.isNetworkBond) {
    ctx.fillStyle = 'rgba(255,215,0,0.15)'
    roundRect(ctx, 620, 430, 280, 64, 32)
    ctx.fill()
    ctx.fillStyle = C.gold
    ctx.font = 'bold 28px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('⭐ RED ACTIVA', 760, 448)
  }

  // Avatars + VS
  const avatarY = 720
  const avatarR = 148
  await drawAvatar(ctx, 300, avatarY, avatarR, opts.selfPhoto, selfFirst, C.orange)
  await drawAvatar(ctx, 780, avatarY, avatarR, opts.partnerPhoto, partnerFirst, C.green)

  ctx.fillStyle = C.bg1
  ctx.beginPath()
  ctx.arc(540, avatarY, 62, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.fillStyle = C.white
  ctx.font = '900 44px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('VS', 540, avatarY + 2)

  ctx.fillStyle = C.white
  ctx.font = 'bold 46px system-ui, sans-serif'
  ctx.fillText(selfFirst, 300, avatarY + avatarR + 56)
  ctx.fillStyle = C.muted
  ctx.font = '500 32px system-ui, sans-serif'
  ctx.fillText('×', 540, avatarY + avatarR + 56)
  ctx.fillStyle = C.white
  ctx.font = 'bold 46px system-ui, sans-serif'
  ctx.fillText(partnerFirst, 780, avatarY + avatarR + 56)

  // Stat row
  const cardY = 1080
  const cardW = 300
  const cardH = 150
  const gap = 24
  const startX = (W - (cardW * 3 + gap * 2)) / 2
  drawStatCard(ctx, startX, cardY, cardW, cardH, durationLabel, 'MINUTOS', C.white)
  drawStatCard(
    ctx,
    startX + cardW + gap,
    cardY,
    cardW,
    cardH,
    `${opts.setsLogged}`,
    'SERIES',
    C.green
  )
  drawStatCard(
    ctx,
    startX + (cardW + gap) * 2,
    cardY,
    cardW,
    cardH,
    opts.witnessCount && opts.witnessCount > 0 ? `${opts.witnessCount}` : '—',
    'TESTIGOS',
    C.gold
  )

  drawVibeRing(ctx, 540, 1420, opts.vibe)

  // CTA footer — acquisition hook
  const ctaY = 1620
  const ctaGrd = ctx.createLinearGradient(80, ctaY, W - 80, ctaY + 120)
  ctaGrd.addColorStop(0, C.orange)
  ctaGrd.addColorStop(1, C.orangeDark)
  roundRect(ctx, 80, ctaY, W - 160, 120, 36)
  ctx.fillStyle = ctaGrd
  ctx.fill()
  ctx.fillStyle = '#000'
  ctx.font = '900 40px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('¿Entrenamos juntos?', W / 2, ctaY + 46)
  ctx.font = '600 30px system-ui, sans-serif'
  ctx.fillText(`Descarga gratis · ${shareableAppHostname()}`, W / 2, ctaY + 88)

  ctx.fillStyle = C.muted
  ctx.font = '500 28px system-ui, sans-serif'
  ctx.fillText('#EntrenaMatch  #GymPulse  #EntrenaSync', W / 2, H - 72)

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
  return (
    `🔥 ENTRENASYNC con ${b} — ${opts.minutes} min · Sync ${opts.vibe}%\n` +
    `${a} × ${b} entrenaron en vivo en EntrenaMatch.\n` +
    `Únete en ${shareableAppHostname()} · #EntrenaMatch #GymPulse #EntrenaSync`
  )
}

export async function syncStoryToDataUrl(opts: SyncStoryOpts): Promise<string | null> {
  const blob = await renderSyncStoryPng(opts)
  if (!blob) return null
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function syncStoryFilename(): string {
  return `entrenamatch-sync-${Date.now()}.png`
}

export async function shareSyncStory(opts: SyncStoryOpts): Promise<ShareImageOutcome> {
  const blob = await renderSyncStoryPng(opts)
  if (!blob) return 'failed'
  const text = buildSyncPostText({
    selfName: opts.selfName,
    partnerName: opts.partnerName,
    minutes: opts.minutes,
    vibe: opts.vibe,
  })
  return sharePngBlob(blob, syncStoryFilename(), {
    title: 'EntrenaSync · EntrenaMatch',
    text,
    dialogTitle: 'Compartir story EntrenaSync',
  })
}

/** @deprecated Prefer shareSyncStory */
export async function downloadSyncStory(opts: SyncStoryOpts): Promise<boolean> {
  const outcome = await shareSyncStory(opts)
  return outcome === 'shared' || outcome === 'downloaded'
}
