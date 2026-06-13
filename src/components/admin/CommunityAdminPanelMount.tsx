import type { Firestore } from 'firebase/firestore'
import type { Profile } from '../../types'
import type { AppAdminRecord } from '../../services/appAdmin'
import { CommunityAdminPanel } from './CommunityAdminPanel'

export type CommunityAdminPanelMountProps = {
  open: boolean
  onClose: () => void
  db: Firestore | null
  admin: AppAdminRecord | null
  realProfiles: Profile[]
}

/** Fase 371 — community admin panel guard + mount extracted from App.tsx. */
export function CommunityAdminPanelMount({
  open,
  onClose,
  db,
  admin,
  realProfiles,
}: CommunityAdminPanelMountProps) {
  if (!admin) return null
  return (
    <CommunityAdminPanel
      open={open}
      onClose={onClose}
      db={db}
      admin={admin}
      realProfiles={realProfiles}
    />
  )
}
