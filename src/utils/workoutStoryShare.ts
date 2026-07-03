/** Fase 376 — story 1080×1920 para compartir rutina en Instagram Stories. */

import { WORKOUT_TYPE_LABELS } from '../data/exerciseLibrary'
import { BRAND_COPY } from '../constants/brandCopy'
import type { WorkoutPreview } from '../types'
import { sharePngBlob, type ShareImageOutcome } from './shareImageBlob'
import { resolveShareableAppBase, shareableAppHostname } from './sparseCityDefaults'

export const WORKOUT_STORY_APP_HOST = 'entrenamatch.web.app'

const W = 1080
const H = 1920
const MAX_EXERCISES = 6

const C = {
  orange: '#FF671F',
  orangeDark: '#E55A1A',
  gold: '#FFD700',
  white: '#FFFFFF',
  muted: '#9CA3AF',
  bg0: '#070709',
  card: '#1C1C24',
}

export type WorkoutStoryOpts = {
  userName: string
  userPhoto?: string
  userId?: string
  preview: WorkoutPreview
  prSummary?: string
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

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontWeight: string,
  maxSize: number,
  minSize: number
): number {
  let size = maxSize
  while (size >= minSize) {
    ctx.font = `${fontWeight} ${size}px system-ui, sans-serif`
    if (ctx.measureText(text).width <= maxWidth) return size
    size -= 2
  }
  return minSize
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const grd = ctx.createLinearGradient(0, 0, W, H)
  grd.addColorStop(0, C.bg0)
  grd.addColorStop(0.42, '#14110d')
  grd.addColorStop(1, '#0a1218')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, W, H)

  const glowOrange = ctx.createRadialGradient(W * 0.25, 320, 20, W * 0.25, 320, 480)
  glowOrange.addColorStop(0, 'rgba(255,103,31,0.34)')
  glowOrange.addColorStop(1, 'rgba(255,103,31,0)')
  ctx.fillStyle = glowOrange
  ctx.fillRect(0, 0, W, H)

  const glowGold = ctx.createRadialGradient(W * 0.82, H * 0.45, 20, W * 0.82, H * 0.45, 520)
  glowGold.addColorStop(0, 'rgba(255,215,0,0.14)')
  glowGold.addColorStop(1, 'rgba(255,215,0,0)')
  ctx.fillStyle = glowGold
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = 'rgba(255,255,255,0.025)'
  for (let y = 0; y < H; y += 44) {
    for (let x = 0; x < W; x += 44) {
      ctx.beginPath()
      ctx.arc(x, y, 1.1, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.strokeStyle = 'rgba(255,103,31,0.14)'
  ctx.lineWidth = 2
  roundRect(ctx, 44, 44, W - 88, H - 88, 44)
  ctx.stroke()
}

async function drawAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  photo: string | undefined,
  fallbackName: string
) {
  const img = photo ? await loadImage(photo) : null

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2)
  ctx.strokeStyle = C.orange
  ctx.lineWidth = 6
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

function drawStatChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  value: string,
  label: string
) {
  roundRect(ctx, x, y, w, h, 20)
  ctx.fillStyle = 'rgba(28,28,36,0.92)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = C.white
  ctx.font = '900 36px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(value, x + w / 2, y + h * 0.42)

  ctx.fillStyle = C.muted
  ctx.font = '600 20px system-ui, sans-serif'
  ctx.fillText(label, x + w / 2, y + h * 0.72)
}

function exerciseLine(ex: NonNullable<WorkoutPreview['exercises']>[number]): string {
  if (ex.setSummary) return `${ex.setCount}× · ${ex.setSummary}`
  if (ex.topWeightKg && ex.topWeightKg > 0) return `${ex.setCount}× · ${ex.topWeightKg} kg`
  return `${ex.setCount} sets`
}

export function buildWorkoutStoryRefUrl(userId?: string): string {
  const base = resolveShareableAppBase()
  if (userId?.trim()) {
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}ref=${encodeURIComponent(userId.trim())}`
  }
  return base
}

export function buildWorkoutStoryPostText(opts: WorkoutStoryOpts): string {
  const { preview, userName, prSummary, userId } = opts
  const typeLabel = WORKOUT_TYPE_LABELS[preview.type] || preview.type
  const first = userName.split(' ')[0] || 'Yo'
  const refUrl = buildWorkoutStoryRefUrl(userId)
  const prLine = prSummary ? `\n${prSummary}` : preview.prCount ? `\n🏆 ${preview.prCount} PR` : ''
  return (
    `🏋️ ${first} · ${preview.title} (${typeLabel})\n` +
    `${preview.exerciseCount} ejercicios · ${preview.totalSets} sets · ${preview.durationMin} min · ${preview.volumeLabel}${prLine}\n` +
    `Únete en ${refUrl} · #EntrenaMatch #EntrenoDeHoy #MapaLIVE`
  )
}

async function renderWorkoutStoryPng(opts: WorkoutStoryOpts): Promise<Blob | null> {
  if (typeof document === 'undefined') return null

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const { preview, userName, userPhoto, prSummary } = opts
  const typeLabel = WORKOUT_TYPE_LABELS[preview.type] || preview.type
  const exercises = (preview.exercises || []).slice(0, MAX_EXERCISES)
  const extraCount = Math.max(0, (preview.exercises?.length || 0) - MAX_EXERCISES)

  drawBackground(ctx)

  // Brand header
  ctx.fillStyle = C.orange
  ctx.font = '900 34px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('ENTRENAMATCH', W / 2, 72)
  ctx.fillStyle = C.muted
  ctx.font = '600 26px system-ui, sans-serif'
  ctx.fillText('ENTRENO DE HOY', W / 2, 116)

  await drawAvatar(ctx, 160, 220, 72, userPhoto, userName)

  const nameX = 280
  ctx.textAlign = 'left'
  ctx.fillStyle = C.white
  ctx.font = '900 42px system-ui, sans-serif'
  const displayName = userName.length > 22 ? `${userName.slice(0, 20)}…` : userName
  ctx.fillText(displayName, nameX, 188)

  ctx.fillStyle = C.orange
  ctx.font = '700 24px system-ui, sans-serif'
  ctx.fillText(typeLabel.toUpperCase(), nameX, 242)

  // Title card
  const titleY = 320
  roundRect(ctx, 72, titleY, W - 144, 140, 28)
  const titleGrd = ctx.createLinearGradient(72, titleY, W - 72, titleY + 140)
  titleGrd.addColorStop(0, 'rgba(255,103,31,0.22)')
  titleGrd.addColorStop(1, 'rgba(28,28,36,0.95)')
  ctx.fillStyle = titleGrd
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,103,31,0.35)'
  ctx.lineWidth = 2
  ctx.stroke()

  const titleSize = fitFontSize(ctx, preview.title, W - 200, '900', 52, 30)
  ctx.fillStyle = C.white
  ctx.font = `900 ${titleSize}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(preview.title, W / 2, titleY + 52)

  if ((preview.prCount ?? 0) > 0) {
    ctx.fillStyle = C.gold
    ctx.font = '700 28px system-ui, sans-serif'
    ctx.fillText(`🏆 ${preview.prCount} PR`, W / 2, titleY + 52 + titleSize + 14)
  }

  // Stats row
  const statsY = 500
  const chipW = (W - 144 - 36) / 4
  const chipH = 96
  drawStatChip(ctx, 72, statsY, chipW, chipH, String(preview.exerciseCount), 'EJERCICIOS')
  drawStatChip(ctx, 72 + chipW + 12, statsY, chipW, chipH, String(preview.totalSets), 'SETS')
  drawStatChip(ctx, 72 + (chipW + 12) * 2, statsY, chipW, chipH, String(preview.durationMin), 'MIN')
  drawStatChip(ctx, 72 + (chipW + 12) * 3, statsY, chipW, chipH, preview.volumeLabel, 'VOLUMEN')

  // Exercise list card
  const listY = 640
  const listH = exercises.length > 0 ? 520 : 280
  roundRect(ctx, 72, listY, W - 144, listH, 32)
  ctx.fillStyle = 'rgba(28,28,36,0.94)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = C.muted
  ctx.font = '700 22px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('RUTINA', 108, listY + 44)

  if (exercises.length === 0) {
    ctx.fillStyle = C.white
    ctx.font = '600 32px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${preview.durationMin} min de entreno`, W / 2, listY + listH / 2)
  } else {
    let rowY = listY + 88
    exercises.forEach((ex, i) => {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'transparent'
      roundRect(ctx, 96, rowY - 8, W - 192, 64, 16)
      ctx.fill()

      ctx.fillStyle = C.white
      ctx.font = '600 30px system-ui, sans-serif'
      ctx.textAlign = 'left'
      const name = ex.name.length > 28 ? `${ex.name.slice(0, 26)}…` : ex.name
      ctx.fillText(name, 112, rowY + 28)

      ctx.fillStyle = C.muted
      ctx.font = '600 26px system-ui, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(exerciseLine(ex), W - 112, rowY + 28)
      rowY += 72
    })

    if (extraCount > 0) {
      ctx.fillStyle = C.muted
      ctx.font = '500 24px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`+${extraCount} ejercicio${extraCount === 1 ? '' : 's'} más`, W / 2, rowY + 20)
    }
  }

  // PR summary line
  if (prSummary?.trim()) {
    const prY = listY + listH + 28
    ctx.fillStyle = 'rgba(255,215,0,0.15)'
    roundRect(ctx, 72, prY, W - 144, 72, 20)
    ctx.fill()
    ctx.fillStyle = C.gold
    ctx.font = '600 26px system-ui, sans-serif'
    ctx.textAlign = 'center'
    const prShort =
      prSummary.length > 64 ? `${prSummary.slice(0, 62)}…` : prSummary
    ctx.fillText(prShort, W / 2, prY + 44)
  }

  // CTA footer
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
  ctx.fillText('¿Quieres entrenar conmigo?', W / 2, ctaY + 46)
  ctx.font = '600 28px system-ui, sans-serif'
  const host = shareableAppHostname()
  ctx.fillText(`App gratis · ${host}`, W / 2, ctaY + 88)

  ctx.fillStyle = C.muted
  ctx.font = '500 28px system-ui, sans-serif'
  ctx.fillText('#EntrenaMatch  #EntrenoDeHoy  #MapaLIVE', W / 2, H - 72)

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

export async function workoutStoryToDataUrl(opts: WorkoutStoryOpts): Promise<string | null> {
  const blob = await renderWorkoutStoryPng(opts)
  if (!blob) return null
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function workoutStoryFilename(): string {
  return `entrenamatch-rutina-${Date.now()}.png`
}

export function toastWorkoutShareOutcome(
  toastApi: { success: (m: string) => void; error: (m: string) => void },
  outcome: ShareImageOutcome
) {
  if (outcome === 'shared') toastApi.success(BRAND_COPY.workoutStory.sharedOk)
  else if (outcome === 'downloaded') toastApi.success(BRAND_COPY.workoutStory.sharedDownload)
  else if (outcome === 'failed') toastApi.error(BRAND_COPY.workoutStory.failed)
}

export async function shareWorkoutStory(opts: WorkoutStoryOpts): Promise<ShareImageOutcome> {
  const blob = await renderWorkoutStoryPng(opts)
  if (!blob) return 'failed'
  const text = buildWorkoutStoryPostText(opts)
  return sharePngBlob(blob, workoutStoryFilename(), {
    title: 'Entreno de Hoy · EntrenaMatch',
    text,
    dialogTitle: 'Compartir rutina en Instagram',
  })
}
