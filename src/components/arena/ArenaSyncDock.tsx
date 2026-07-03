import { Camera, Mic, Trophy } from 'lucide-react'

export interface ArenaSyncDockProps {
  onSetReady: () => void
  onRest: () => void
  onHype: () => void
  onVoicePing?: () => void
  onPr?: () => void
  onPhoto?: () => void
  isRecordingVoice?: boolean
  disabled?: boolean
}

export function ArenaSyncDock({
  onSetReady,
  onRest,
  onHype,
  onVoicePing,
  onPr,
  onPhoto,
  isRecordingVoice = false,
  disabled,
}: ArenaSyncDockProps) {
  return (
    <section className="em-v2-arena-dock arena-sync-dock" aria-label="Acciones de sync">
      <button
        type="button"
        className="arena-sync-dock__main arena-sync-dock__main--green"
        onClick={onSetReady}
        disabled={disabled}
      >
        <span className="arena-sync-dock__emoji">💪</span>
        <span>Set listo</span>
      </button>
      <button
        type="button"
        className="arena-sync-dock__main arena-sync-dock__main--cyan"
        onClick={onRest}
        disabled={disabled}
      >
        <span className="arena-sync-dock__emoji">💧</span>
        <span>Descanso</span>
      </button>
      <button
        type="button"
        className="arena-sync-dock__main arena-sync-dock__main--orange"
        onClick={onHype}
        disabled={disabled}
      >
        <span className="arena-sync-dock__emoji">🔥</span>
        <span>Ánimo</span>
      </button>

      <div className="arena-sync-dock__secondary">
        {onVoicePing && (
          <button
            type="button"
            className={`arena-sync-dock__mini ${isRecordingVoice ? 'arena-sync-dock__mini--rec' : ''}`}
            onClick={onVoicePing}
            disabled={disabled || isRecordingVoice}
            aria-label="Voz 3 segundos"
          >
            <Mic size={16} />
            <span>{isRecordingVoice ? '…' : '3s'}</span>
          </button>
        )}
        {onPr && (
          <button type="button" className="arena-sync-dock__mini" onClick={onPr} disabled={disabled}>
            <Trophy size={16} />
            <span>PR</span>
          </button>
        )}
        {onPhoto && (
          <button type="button" className="arena-sync-dock__mini" onClick={onPhoto} disabled={disabled}>
            <Camera size={16} />
            <span>Foto</span>
          </button>
        )}
      </div>
    </section>
  )
}
