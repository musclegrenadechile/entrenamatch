import { ChevronRight, Flag } from 'lucide-react'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileCommunityAdminEntry(props: ProfileTabProps) {
  const { appAdminRecord, onOpenCommunityAdmin } = profileTabBindings(props)
  if (!appAdminRecord || !onOpenCommunityAdmin) return null

  return (
    <div className="px-4 mt-2 mb-1">
      <button type="button" onClick={onOpenCommunityAdmin} className="trainer-profile-entry admin-entry">
        <div className="trainer-profile-entry__icon admin-entry__icon">
          <Flag size={20} />
        </div>
        <div className="trainer-profile-entry__body">
          <p className="trainer-profile-entry__title">{appAdminRecord.displayLabel || 'Admin'}</p>
          <p className="trainer-profile-entry__sub">Reportes · bloqueos · eliminar cuentas</p>
        </div>
        <ChevronRight size={18} className="trainer-profile-entry__chevron" />
      </button>
    </div>
  )
}
