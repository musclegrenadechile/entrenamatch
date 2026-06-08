import { Zap } from 'lucide-react'

export interface SyncLiveBlockerModalProps {
  open: boolean
  onClose: () => void
  onActivateLive: () => void
  onGoHome: () => void
}

export function SyncLiveBlockerModal({
  open,
  onClose,
  onActivateLive,
  onGoHome,
}: SyncLiveBlockerModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="post-register-guide w-full max-w-sm rounded-3xl p-6 border border-[#22c55e]/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl mb-3 text-center">🟢</div>
        <h3 className="text-lg font-black text-white text-center">Activa live primero</h3>
        <p className="text-sm text-[#9CA3AF] mt-2 text-center leading-snug">
          EntrenaSync conecta a dos personas <strong className="text-white">entrenando en vivo</strong>.
          Activa IR LIVE para que tu compañero te vea en el mapa y puedan sincronizar.
        </p>
        <button
          type="button"
          onClick={() => {
            onActivateLive()
            onClose()
          }}
          className="w-full mt-5 py-3 rounded-2xl bg-[#22c55e] text-black font-bold flex items-center justify-center gap-2 active:brightness-90"
        >
          <Zap size={18} />
          Activar IR LIVE
        </button>
        <button
          type="button"
          onClick={() => {
            onGoHome()
            onClose()
          }}
          className="w-full mt-2 py-2.5 rounded-2xl text-[#9CA3AF] text-sm font-semibold active:text-white"
        >
          Ir a Hoy →
        </button>
      </div>
    </div>
  )
}
