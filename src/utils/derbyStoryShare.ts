/** Fase 104 — story 1080×1920 para compartir resultado del derby regional. */

import type { CityDerbyState } from '../services/cityDerby'
import { DERBY_AWAY, DERBY_HOME } from '../services/cityDerby'

const W = 1080
const H = 1920

export async function renderDerbyStoryPng(derby: CityDerbyState): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const grd = ctx.createLinearGradient(0, 0, W, H)
  grd.addColorStop(0, '#070709')
  grd.addColorStop(0.5, '#14110d')
  grd.addColorStop(1, '#0a1218')
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#FF671F'
  ctx.font = 'bold 42px system-ui,sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('ENTRENAMATCH', W / 2, 120)

  ctx.fillStyle = '#9CA3AF'
  ctx.font = '28px system-ui,sans-serif'
  ctx.fillText('Derby semanal · índice/100k hab', W / 2, 175)

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 56px system-ui,sans-serif'
  ctx.fillText(`${DERBY_HOME.label}`, W / 2 - 140, 400)
  ctx.fillStyle = '#22c55e'
  ctx.font = 'black 96px system-ui,sans-serif'
  ctx.fillText(String(derby.home.indexPer100k), W / 2 - 140, 520)

  ctx.fillStyle = '#FF671F'
  ctx.font = 'bold 72px system-ui,sans-serif'
  ctx.fillText('VS', W / 2, 470)

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 56px system-ui,sans-serif'
  ctx.fillText(`${DERBY_AWAY.label}`, W / 2 + 140, 400)
  ctx.fillStyle = '#60a5fa'
  ctx.font = 'black 96px system-ui,sans-serif'
  ctx.fillText(String(derby.away.indexPer100k), W / 2 + 140, 520)

  const leader = derby.leaderLabel || 'Empate'
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 40px system-ui,sans-serif'
  ctx.fillText(derby.isTie ? 'Empate ajustado' : `${leader} lidera`, W / 2, 700)

  ctx.fillStyle = '#9CA3AF'
  ctx.font = '32px system-ui,sans-serif'
  ctx.fillText(
    `${derby.home.totalMinutes} vs ${derby.away.totalMinutes} min brutos esta semana`,
    W / 2,
    780
  )

  ctx.fillStyle = '#FF671F'
  ctx.font = 'bold 36px system-ui,sans-serif'
  ctx.fillText('entrenamatch.web.app', W / 2, H - 120)

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png', 0.92)
  })
}

export async function downloadDerbyStory(derby: CityDerbyState): Promise<boolean> {
  const blob = await renderDerbyStoryPng(derby)
  if (!blob) return false
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `entrenamatch-derby-${derby.weekKey}.png`
  a.click()
  URL.revokeObjectURL(url)
  return true
}
