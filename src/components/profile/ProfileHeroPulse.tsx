import { toast } from 'sonner'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

/** Fase 89 — compact hero: LIVE + streak + ghost in one block. */
export function ProfileHeroPulse(props: ProfileTabProps) {
  const {
    currentUser,
    saveUserWithRealSync,
    setMapForceTick,
    toggleLiveTraining,
    triggerHaptic,
  } = profileTabBindings(props)

  const live = !!currentUser.trainingNow
  const streak = currentUser.liveStreak || 0
  const ghost = !!currentUser.ghostMode

  const toggleLive = async () => {
    try {
      triggerHaptic('medium')
      await toggleLiveTraining(live ? 'off' : 'on')
    } catch {
      toast.error('No se pudo actualizar Live')
    }
  }

  const toggleGhost = async () => {
    try {
      triggerHaptic('light')
      const next = !ghost
      await saveUserWithRealSync({ ...currentUser, ghostMode: next } as typeof currentUser)
      toast(next ? 'Modo fantasma ON (~500 m)' : 'Ubicación exacta en mapa')
      setMapForceTick((t) => t + 1)
    } catch {
      toast.error('No se pudo cambiar modo fantasma')
    }
  }

  return (
    <div className="mx-4 -mt-6 relative z-10">
      <div className="rounded-2xl border border-[#2F2F35] bg-[#0D0D10]/95 backdrop-blur-md p-3 shadow-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => void toggleLive()}
            className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide ${
              live
                ? 'bg-[#22c55e] text-black shadow-[0_0_12px_rgba(34,197,94,0.45)]'
                : 'bg-white/10 text-white border border-white/20'
            }`}
          >
            {live ? `🟢 LIVE · ${streak}d` : 'Activar LIVE'}
          </button>
          <button
            type="button"
            onClick={() => void toggleGhost()}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              ghost
                ? 'bg-[#a855f7]/25 text-[#e9d5ff] border border-[#a855f7]/50'
                : 'bg-white/5 text-[#9CA3AF] border border-white/10'
            }`}
            aria-pressed={ghost}
          >
            {ghost ? '👻 Fantasma' : 'Pin exacto'}
          </button>
          <span className="text-[10px] text-[#9CA3AF] ml-auto">
            {currentUser.level} · {currentUser.city}
          </span>
        </div>
      </div>
    </div>
  )
}
