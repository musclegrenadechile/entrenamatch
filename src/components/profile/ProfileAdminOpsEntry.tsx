import { ChevronRight, Shield } from 'lucide-react'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'
import { isMarketplaceUiEnabled } from '../../utils/pilotFeatureFlags'

export function ProfileAdminOpsEntry(props: ProfileTabProps) {
  const { isMarketplaceAdmin, onOpenAdminOps } = profileTabBindings(props)
  if (!isMarketplaceAdmin || !onOpenAdminOps) return null

  const adminSub = isMarketplaceUiEnabled()
    ? 'Pedidos tienda · verificar entrenadores'
    : 'Verificar entrenadores · métricas piloto'

  return (
    <div className="px-4 mt-2 mb-1">
      <button type="button" onClick={onOpenAdminOps} className="trainer-profile-entry admin-entry">
        <div className="trainer-profile-entry__icon admin-entry__icon">
          <Shield size={20} />
        </div>
        <div className="trainer-profile-entry__body">
          <p className="trainer-profile-entry__title">Admin Ops</p>
          <p className="trainer-profile-entry__sub">{adminSub}</p>
        </div>
        <ChevronRight size={18} className="trainer-profile-entry__chevron" />
      </button>
    </div>
  )
}
