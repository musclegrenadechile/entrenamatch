import { ChevronRight, Dumbbell } from 'lucide-react'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileTrainerCoachEntry(props: ProfileTabProps) {
  const { onOpenTrainerCoach } = profileTabBindings(props)
  if (!onOpenTrainerCoach) return null

  return (
    <div className="px-4 mt-3 mb-1">
      <button
        type="button"
        onClick={onOpenTrainerCoach}
        className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[#6366f1]/35 bg-gradient-to-br from-[#6366f1]/12 to-transparent text-left active:scale-[0.99] transition-transform"
      >
        <div className="w-11 h-11 rounded-xl bg-[#6366f1]/25 flex items-center justify-center text-[#a5b4fc]">
          <Dumbbell size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm">EntrenaCoach</p>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
            Busca entrenador personal · reserva · califica
          </p>
        </div>
        <ChevronRight size={18} className="text-[#a5b4fc] shrink-0" />
      </button>
    </div>
  )
}
