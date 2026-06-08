/** Post-sync duel stats — head-to-head from Arena actions. */

export interface SyncDuelAction {
  id?: string
  emoji?: string
  label?: string
  userId?: string
  at?: number
  combo?: number
  photoUrl?: string
}

export interface SyncDuelSide {
  name: string
  actions: number
  maxCombo: number
  prs: number
  hype: number
  photos: number
  score: number
}

export interface SyncDuelResult {
  self: SyncDuelSide
  partner: SyncDuelSide
  winner: 'self' | 'partner' | 'tie'
  headline: string
  subline: string
}

function firstName(name: string): string {
  return (name || 'Atleta').split(' ')[0]
}

function scoreActions(actions: SyncDuelAction[], userId: string): Omit<SyncDuelSide, 'name'> {
  const mine = actions.filter((a) => a.userId === userId)
  let maxCombo = 0
  let prs = 0
  let hype = 0
  let photos = 0

  for (const a of mine) {
    if (a.combo && a.combo > 1) maxCombo = Math.max(maxCombo, a.combo)
    const label = a.label || ''
    if (/PR/i.test(label)) prs += 1
    else if (/Ánimo|animo/i.test(label) || a.emoji === '🔥') hype += 1
    else if (/Foto/i.test(label) || a.photoUrl) photos += 1
  }

  const actionsCount = mine.length
  const score =
    actionsCount * 10 + maxCombo * 8 + prs * 15 + hype * 5 + photos * 6

  return { actions: actionsCount, maxCombo, prs, hype, photos, score }
}

export function computeSyncDuel(
  actions: SyncDuelAction[],
  selfUserId: string,
  selfName: string,
  partnerUserId: string,
  partnerName: string
): SyncDuelResult {
  const selfCore = scoreActions(actions, selfUserId)
  const partnerCore = scoreActions(actions, partnerUserId)

  const self: SyncDuelSide = { name: firstName(selfName), ...selfCore }
  const partner: SyncDuelSide = { name: firstName(partnerName), ...partnerCore }

  let winner: SyncDuelResult['winner'] = 'tie'
  if (self.score > partner.score) winner = 'self'
  else if (partner.score > self.score) winner = 'partner'

  const headline =
    winner === 'self'
      ? 'Llevaste la energía esta sesión'
      : winner === 'partner'
        ? `${partner.name} llevó más energía hoy`
        : 'Misma energía — otra sesión pronto'

  const subline =
    self.actions + partner.actions === 0
      ? 'Activad acciones en la próxima para ver el resumen completo'
      : winner === 'tie'
        ? 'Misma energía — la revancha os espera'
        : `${Math.abs(self.score - partner.score)} pts de diferencia en el marcador`

  return { self, partner, winner, headline, subline }
}

export interface SyncDuelMetricRow {
  key: string
  label: string
  self: number
  partner: number
}

export function buildDuelMetrics(duel: SyncDuelResult): SyncDuelMetricRow[] {
  return [
    { key: 'actions', label: 'Acciones', self: duel.self.actions, partner: duel.partner.actions },
    { key: 'combo', label: 'Racha máx', self: duel.self.maxCombo, partner: duel.partner.maxCombo },
    { key: 'prs', label: 'PRs', self: duel.self.prs, partner: duel.partner.prs },
    { key: 'hype', label: 'Ánimo', self: duel.self.hype, partner: duel.partner.hype },
  ]
}
