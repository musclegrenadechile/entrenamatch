/** Fase 104 + polish — story 1080×1920 para compartir derby regional. */

import type { CityDerbyState } from '../services/cityDerby'
import { DERBY_AWAY, DERBY_HOME } from '../services/cityDerby'
import { sharePngBlob, type ShareImageOutcome } from './shareImageBlob'
import { resolveShareableAppBase, shareableAppHostname } from './sparseCityDefaults'

const W = 1080
const H = 1920

const C = {
  orange: '#FF671F',
  orangeDark: '#E55A1A',
  green: '#22c55e',
  greenDark: '#16a34a',
  blue: '#60a5fa',
  blueDark: '#3b82f6',
  gold: '#FFD700',
  white: '#FFFFFF',
  muted: '#9CA3AF',
  bg0: '#070709',
  card: '#1C1C24',
}

export type DerbyShareTeamCopy = { title: string; subtitle: string }

/** Short labels for story layout — long regional names overlap at fixed canvas coords. */
export function derbyShareTeamCopy(cityNorm: string): DerbyShareTeamCopy {
  if (cityNorm === DERBY_HOME.norm) {
    return { title: 'Valparaíso', subtitle: 'Región V · Costa' }
  }
  if (cityNorm === DERBY_AWAY.norm) {
    return { title: 'Santiago', subtitle: 'Comuna RM' }
  }
  const short = cityNorm.length > 14 ? `${cityNorm.slice(0, 12)}…` : cityNorm
  return { title: short, subtitle: 'Copa Zona' }
}

export function derbyShareLeaderLine(derby: CityDerbyState): string {
  if (derby.isTie) {
    if (derby.home.totalMinutes === 0 && derby.away.totalMinutes === 0) {
      return 'Semana recién empezada — sé el primero en sumar'
    }
    return 'Empate ajustado · cada minuto cuenta'
  }
  const norm = derby.leaderNorm || ''
  const { title } = derbyShareTeamCopy(norm)
  const margin =
    derby.marginIndex > 0 ? ` (+${derby.marginIndex} índice)` : ''
  return `${title} lidera${margin}`
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
  grd.addColorStop(0.4, '#14110d')
  grd.addColorStop(1, '#0a1218')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, W, H)

  const glowOrange = ctx.createRadialGradient(W * 0.2, 360, 20, W * 0.2, 360, 520)
  glowOrange.addColorStop(0, 'rgba(255,103,31,0.32)')
  glowOrange.addColorStop(1, 'rgba(255,103,31,0)')
  ctx.fillStyle = glowOrange
  ctx.fillRect(0, 0, W, H)

  const glowGreen = ctx.createRadialGradient(W * 0.78, H * 0.55, 20, W * 0.78, H * 0.55, 560)
  glowGreen.addColorStop(0, 'rgba(34,197,94,0.2)')
  glowGreen.addColorStop(1, 'rgba(34,197,94,0)')
  ctx.fillStyle = glowGreen
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

function drawTeamPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  team: DerbyShareTeamCopy,
  score: number,
  minutes: number,
  athletes: number,
  accent: string,
  accentDark: string,
  isLeader: boolean
) {
  roundRect(ctx, x, y, w, h, 32)
  const panelGrd = ctx.createLinearGradient(x, y, x, y + h)
  panelGrd.addColorStop(0, 'rgba(28,28,36,0.96)')
  panelGrd.addColorStop(1, 'rgba(14,14,18,0.98)')
  ctx.fillStyle = panelGrd
  ctx.fill()
  ctx.strokeStyle = isLeader ? accent : 'rgba(255,255,255,0.1)'
  ctx.lineWidth = isLeader ? 4 : 2
  ctx.stroke()

  ctx.fillStyle = accent
  roundRect(ctx, x + 24, y + 24, w - 48, 8, 4)
  ctx.fill()

  if (isLeader) {
    ctx.fillStyle = 'rgba(255,215,0,0.18)'
    roundRect(ctx, x + w / 2 - 72, y - 18, 144, 40, 20)
    ctx.fill()
    ctx.fillStyle = C.gold
    ctx.font = 'bold 22px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('👑 LÍDER', x + w / 2, y + 2)
  }

  const titleSize = fitFontSize(ctx, team.title, w - 48, '900', 52, 32)
  ctx.fillStyle = C.white
  ctx.font = `900 ${titleSize}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(team.title, x + w / 2, y + 56)

  ctx.fillStyle = C.muted
  ctx.font = '500 24px system-ui, sans-serif'
  ctx.fillText(team.subtitle, x + w / 2, y + 56 + titleSize + 10)

  ctx.fillStyle = accent
  ctx.font = '900 88px system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(score), x + w / 2, y + h * 0.58)

  ctx.fillStyle = C.muted
  ctx.font = '500 22px system-ui, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText('índice / 100k hab', x + w / 2, y + h * 0.58 + 52)

  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.font = '600 26px system-ui, sans-serif'
  ctx.fillText(`${minutes} min`, x + w / 2, y + h - 88)
  ctx.fillStyle = C.muted
  ctx.font = '500 22px system-ui, sans-serif'
  ctx.fillText(`${athletes} atletas`, x + w / 2, y + h - 52)
}

function drawDuelBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  homePct: number,
  awayPct: number
) {
  const h = 28
  roundRect(ctx, x, y, w, h, 14)
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.fill()

  const homeW = Math.max(8, Math.round((w * homePct) / 100))
  const awayW = Math.max(8, w - homeW)
  const homeGrd = ctx.createLinearGradient(x, y, x + homeW, y)
  homeGrd.addColorStop(0, C.greenDark)
  homeGrd.addColorStop(1, C.green)
  ctx.fillStyle = homeGrd
  roundRect(ctx, x, y, homeW, h, 14)
  ctx.fill()

  const awayGrd = ctx.createLinearGradient(x + homeW, y, x + w, y)
  awayGrd.addColorStop(0, C.blue)
  awayGrd.addColorStop(1, C.blueDark)
  ctx.fillStyle = awayGrd
  roundRect(ctx, x + homeW, y, awayW, h, 14)
  ctx.fill()

  ctx.fillStyle = C.white
  ctx.font = 'bold 20px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${homePct}%`, x + 16, y + h / 2)
  ctx.textAlign = 'right'
  ctx.fillText(`${awayPct}%`, x + w - 16, y + h / 2)
}

export async function renderDerbyStoryPng(derby: CityDerbyState): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const homeCopy = derbyShareTeamCopy(derby.home.cityNorm)
  const awayCopy = derbyShareTeamCopy(derby.away.cityNorm)
  const homeLeads = !derby.isTie && derby.leaderNorm === derby.home.cityNorm
  const awayLeads = !derby.isTie && derby.leaderNorm === derby.away.cityNorm

  drawBackground(ctx)

  // Brand header
  ctx.fillStyle = C.orange
  ctx.font = '900 96px system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('Entrena', 72, 96)
  ctx.fillStyle = C.white
  ctx.fillText('Match', 72, 188)

  ctx.fillStyle = 'rgba(255,103,31,0.2)'
  roundRect(ctx, 72, 300, 520, 60, 30)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,103,31,0.45)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = C.orange
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🏆 COPA ZONA · ÍNDICE / 100K HAB', 332, 330)

  // Main duel card
  const cardX = 56
  const cardY = 400
  const cardW = W - 112
  const cardH = 980
  roundRect(ctx, cardX, cardY, cardW, cardH, 40)
  ctx.fillStyle = 'rgba(20,20,26,0.92)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = C.muted
  ctx.font = '600 26px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(`Semana ${derby.weekKey}`, W / 2, cardY + 36)

  const panelW = 420
  const panelH = 520
  const panelY = cardY + 100
  const gap = 48
  const leftX = cardX + (cardW - panelW * 2 - gap) / 2
  const rightX = leftX + panelW + gap

  drawTeamPanel(
    ctx,
    leftX,
    panelY,
    panelW,
    panelH,
    homeCopy,
    derby.home.indexPer100k,
    derby.home.totalMinutes,
    derby.home.participantCount || 0,
    C.green,
    C.greenDark,
    homeLeads
  )
  drawTeamPanel(
    ctx,
    rightX,
    panelY,
    panelW,
    panelH,
    awayCopy,
    derby.away.indexPer100k,
    derby.away.totalMinutes,
    derby.away.participantCount || 0,
    C.blue,
    C.blueDark,
    awayLeads
  )

  // VS badge — centered between panels
  const vsY = panelY + panelH / 2
  ctx.fillStyle = C.bg0
  ctx.beginPath()
  ctx.arc(W / 2, vsY, 56, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,103,31,0.55)'
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.fillStyle = C.orange
  ctx.font = '900 40px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('VS', W / 2, vsY + 2)

  const barY = panelY + panelH + 48
  drawDuelBar(ctx, cardX + 48, barY, cardW - 96, derby.homeBarPct, derby.awayBarPct)

  ctx.fillStyle = derby.isTie ? C.gold : C.white
  ctx.font = 'bold 36px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(derbyShareLeaderLine(derby), W / 2, barY + 56)

  ctx.fillStyle = C.muted
  ctx.font = '500 28px system-ui, sans-serif'
  ctx.fillText(
    `${derby.home.totalMinutes} vs ${derby.away.totalMinutes} min brutos en la guerra`,
    W / 2,
    barY + 108
  )

  // CTA
  const ctaY = cardY + cardH + 72
  const ctaGrd = ctx.createLinearGradient(72, ctaY, W - 72, ctaY + 116)
  ctaGrd.addColorStop(0, C.orange)
  ctaGrd.addColorStop(1, C.orangeDark)
  roundRect(ctx, 72, ctaY, W - 144, 116, 36)
  ctx.fillStyle = ctaGrd
  ctx.fill()
  ctx.fillStyle = '#000'
  ctx.font = '900 38px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Suma minutos por tu ciudad', W / 2, ctaY + 40)
  ctx.font = '600 28px system-ui, sans-serif'
  ctx.fillText(`Activa LIVE · ${shareableAppHostname()}`, W / 2, ctaY + 82)

  ctx.fillStyle = C.muted
  ctx.font = '500 24px system-ui, sans-serif'
  ctx.textBaseline = 'bottom'
  ctx.fillText('#EntrenaMatch #CopaZona', W / 2, H - 72)

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png', 0.92)
  })
}

function derbyStoryFilename(weekKey: string): string {
  return `entrenamatch-derby-${weekKey}.png`
}

function derbyStoryShareText(derby: CityDerbyState): string {
  return `${derbyShareLeaderLine(derby)} — ${DERBY_HOME.label} vs ${DERBY_AWAY.label}. #EntrenaMatch\n${resolveShareableAppBase()}`
}

export async function shareDerbyStory(derby: CityDerbyState): Promise<ShareImageOutcome> {
  const blob = await renderDerbyStoryPng(derby)
  if (!blob) return 'failed'
  return sharePngBlob(blob, derbyStoryFilename(derby.weekKey), {
    title: 'Copa Zona EntrenaMatch',
    text: derbyStoryShareText(derby),
    dialogTitle: 'Compartir story Copa Zona',
  })
}

/** @deprecated Prefer shareDerbyStory — kept for callers that only need a file save. */
export async function downloadDerbyStory(derby: CityDerbyState): Promise<boolean> {
  const outcome = await shareDerbyStory(derby)
  return outcome === 'shared' || outcome === 'downloaded'
}
