import { Radio, X, Zap } from 'lucide-react'

export interface SyncLiveBlockerModalProps {
  open: boolean
  partnerName?: string
  onClose: () => void
  onActivateLive: () => void
  onGoHome: () => void
}

export function SyncLiveBlockerModal({
  open,
  partnerName,
  onClose,
  onActivateLive,
  onGoHome,
}: SyncLiveBlockerModalProps) {
  if (!open) return null

  const firstName = partnerName?.split(' ')[0]

  return (
    <div
      className="sync-live-blocker-overlay"
      role="dialog"
      aria-label="Activar live para EntrenaSync"
      onClick={onClose}
    >
      <div className="sync-live-blocker-sheet" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sync-live-blocker-close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="sync-live-blocker-icon">
          <Radio size={28} className="text-[#22c55e]" />
        </div>

        <p className="sync-live-blocker-kicker">EntrenaSync</p>
        <h3 className="sync-live-blocker-title">Enciende LIVE para sincronizar</h3>

        <p className="sync-live-blocker-copy">
          {firstName ? (
            <>
              Para entrenar en sync con <strong className="text-white">{firstName}</strong>, ambos deben
              estar <strong className="text-[#22c55e]">en vivo</strong> en el GymPulse.
            </>
          ) : (
            <>
              EntrenaSync conecta a dos personas <strong className="text-white">entrenando en vivo</strong>.
              Tu compañero te ve en el mapa solo cuando activas LIVE.
            </>
          )}
        </p>

        <ul className="sync-live-blocker-steps">
          <li>
            <span className="sync-live-blocker-step-num">1</span>
            <span>Activa LIVE mientras entrenas</span>
          </li>
          <li>
            <span className="sync-live-blocker-step-num">2</span>
            <span>Tu pin aparece en GymPulse</span>
          </li>
          <li>
            <span className="sync-live-blocker-step-num">3</span>
            <span>Vuelve a Sync cuando los dos estén en vivo</span>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => {
            onActivateLive()
            onClose()
          }}
          className="sync-live-blocker-cta"
        >
          <Zap size={18} />
          Activar LIVE ahora
        </button>

        <button
          type="button"
          onClick={() => {
            onGoHome()
            onClose()
          }}
          className="sync-live-blocker-secondary"
        >
          Ir a Hoy — preparar mi sesión
        </button>
      </div>
    </div>
  )
}
