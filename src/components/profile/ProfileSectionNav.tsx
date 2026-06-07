export type ProfileSection = 'actividad' | 'rendimiento' | 'cuenta'

export interface ProfileSectionNavProps {
  active: ProfileSection
  onChange: (section: ProfileSection) => void
}

const SECTIONS: { id: ProfileSection; label: string }[] = [
  { id: 'actividad', label: 'Actividad' },
  { id: 'rendimiento', label: 'Rendimiento' },
  { id: 'cuenta', label: 'Cuenta' },
]

export function ProfileSectionNav({ active, onChange }: ProfileSectionNavProps) {
  return (
    <div className="sticky top-[52px] z-10 bg-[#0D0D10]/95 backdrop-blur-md border-b border-[#2F2F35] px-4 py-2 flex gap-2">
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold tracking-wide transition-colors ${
            active === id
              ? 'bg-[#FF671F] text-black'
              : 'bg-[#1C1C20] text-[#9CA3AF] border border-[#2F2F35] active:bg-[#25252A]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
