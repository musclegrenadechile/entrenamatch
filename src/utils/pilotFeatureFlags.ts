import { getAccountAgeDays } from './profileProgressive'

/** Fase 106 — monetización solo tras madurez del piloto. */
export function isMonetizationUnlocked(
  user: { legalConsents?: { acceptedAt?: number } } | null | undefined,
  opts: { syncSessionCount?: number; pilotMau?: number } = {}
): boolean {
  if (import.meta.env.VITE_PILOT_MONETIZATION === '1') return true
  const age = getAccountAgeDays(user)
  const syncs = opts.syncSessionCount ?? 0
  const mau = opts.pilotMau ?? 0
  return age >= 7 && syncs >= 2 && mau >= 50
}
