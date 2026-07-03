import { Activity, Settings, Users } from 'lucide-react'

export type ProfileSection = 'actividad' | 'red' | 'ajustes'

export interface ProfileSectionNavProps {
  active: ProfileSection
  onChange: (section: ProfileSection) => void
}

const SECTIONS: { id: ProfileSection; label: string; Icon: typeof Activity }[] = [
  { id: 'actividad', label: 'Actividad', Icon: Activity },
  { id: 'red', label: 'Red', Icon: Users },
  { id: 'ajustes', label: 'Ajustes', Icon: Settings },
]

export function ProfileSectionNav({ active, onChange }: ProfileSectionNavProps) {
  return (
    <div className="em-v2-profile__subnav sticky top-0 z-10 px-4 py-2">
      <div className="em-v2-profile__tabs" role="tablist" aria-label="Secciones del perfil">
        {SECTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active === id}
            onClick={() => onChange(id)}
            className={`em-v2-profile__tab${active === id ? ` em-v2-profile__tab--${id}` : ''}`}
          >
            <Icon size={14} aria-hidden />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}