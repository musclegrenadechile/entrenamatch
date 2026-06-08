/**
 * GymPulse Map 2.0 — unified marker HTML (Fase 104).
 * All live pins use `.iconic-live-marker` / `.iconic-cluster`.
 */

export interface LiveMarkerUser {
  id: string
  name?: string
  photos?: string[]
  visibleLevel?: number
  isNetworkBond?: boolean
  seVaEnMin?: number
  joinCount?: number
  distance?: number
  trainingTypes?: string[]
  gymCheckIn?: { gymName?: string }
  trainingSyncWith?: string
}

export function buildIconicLiveMarkerHtml(
  u: LiveMarkerUser,
  opts: { isBond?: boolean; size?: number } = {}
): string {
  const isBond = opts.isBond ?? !!u.isNetworkBond
  const isHigh = (u.visibleLevel || 1) >= 15 || isBond
  const hasPulso = (u.visibleLevel || 1) >= 20
  const lvl = u.visibleLevel || 1
  const borderColor = isBond ? '#FFD700' : hasPulso ? '#a855f7' : isHigh ? '#eab308' : '#22c55e'
  const size = opts.size ?? (hasPulso ? 36 : isHigh ? 32 : 28)
  const ringExtra = hasPulso
    ? `<div class="live-pulso-ring" style="inset:-11px;border-color:#a855f7;opacity:0.28"></div>`
    : isHigh
      ? `<div class="live-halo-ring" style="border-color:#eab308;opacity:0.38"></div>`
      : ''
  const bondHalo = isBond
    ? `<div style="position:absolute;inset:-7px;border-radius:9999px;border:2px solid #FFD700;opacity:0.35;animation:live-pulse-green 1.4s ease-in-out infinite;"></div>`
    : ''
  const liveBadge = `<div style="position:absolute;top:-3px;right:-3px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#111;font-size:7px;font-weight:900;padding:0 4px;border-radius:4px;line-height:9px;border:1px solid #111">LIVE</div>`
  const timeBadge =
    u.seVaEnMin != null
      ? `<div style="position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);background:#0a0a0c;color:#22c55e;font-size:8px;padding:0 4px;border-radius:3px;border:1px solid #22c55e55;white-space:nowrap;font-weight:700">~${u.seVaEnMin}m</div>`
      : ''
  const lvlBadge =
    isHigh || hasPulso
      ? `<div style="position:absolute;bottom:-1px;right:2px;background:${hasPulso ? '#a855f7' : '#eab308'};color:#111;font-size:7px;font-weight:800;padding:0 2px;border-radius:2px">${lvl}</div>`
      : ''
  const nameLabel = `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:rgba(10,10,12,0.85);color:#ddd;font-size:8px;padding:0 4px;border-radius:3px;white-space:nowrap;max-width:68px;overflow:hidden;text-overflow:ellipsis;border:1px solid rgba(255,255,255,0.1)">${(u.name || '').split(' ')[0]}</div>`

  return `<div class="iconic-live-marker" style="position:relative;width:${size}px;height:${size}px">
    ${nameLabel}
    <div style="width:${size}px;height:${size}px;border-radius:9999px;overflow:hidden;border:2.5px solid ${borderColor};box-shadow:0 0 0 2px rgba(0,0,0,0.75);">
      <img src="${u.photos?.[0] || ''}" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.style.background='#22c55e';this.innerHTML='<div style=\\'font-size:9px;color:white;display:flex;align-items:center;justify-content:center;height:100%;font-weight:700\\'>LIVE</div>'" />
    </div>
    ${ringExtra}${bondHalo}${liveBadge}${timeBadge}${lvlBadge}
    <div style="position:absolute;inset:-4px;border-radius:9999px;border:1.5px solid #22c55e;opacity:0.32;animation:live-pulse-green 1.9s ease-in-out infinite;"></div>
  </div>`
}

export function buildIconicClusterMarkerHtml(count: number, hasHighPulso = false): string {
  const size = count >= 10 ? 44 : count >= 5 ? 40 : 36
  const glow = hasHighPulso ? ' cluster-high-pulso' : ''
  const abbrev = count >= 1000 ? `${Math.round(count / 100) / 10}k` : String(count)
  return `<div class="iconic-cluster${glow}" style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center">
    <div class="cluster-node-glow"></div>
    <div style="width:${size}px;height:${size}px;border-radius:9999px;background:linear-gradient(145deg,#14532d,#166534);border:2.5px solid #22c55e;box-shadow:0 0 0 3px rgba(0,0,0,0.65),0 0 18px rgba(34,197,94,0.35);display:flex;align-items:center;justify-content:center;font-size:${count >= 10 ? 13 : 12}px;font-weight:900;color:#ecfdf5">${abbrev}</div>
  </div>`
}
