export interface SafetyActionSheetProps {
  open: boolean
  targetName: string
  onClose: () => void
  onReport: () => void
  onBlock: () => void
}

export function SafetyActionSheet({
  open,
  targetName,
  onClose,
  onReport,
  onBlock,
}: SafetyActionSheetProps) {
  if (!open) return null

  return (
    <div className="em-v2-safety-sheet__overlay fixed inset-0 z-[250] flex items-end" onClick={onClose}>
      <div
        className="em-v2-safety-sheet w-full p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="em-v2-safety-sheet__title">Seguridad</p>
        <p className="em-v2-safety-sheet__sub">{targetName}</p>
        <button
          type="button"
          onClick={() => {
            onReport()
            onClose()
          }}
          className="em-v2-safety-sheet__report"
        >
          Reportar usuario
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`¿Bloquear a ${targetName}? No volverás a ver su perfil ni mensajes.`)) {
              onBlock()
              onClose()
            }
          }}
          className="em-v2-safety-sheet__block"
        >
          Bloquear usuario
        </button>
        <button type="button" onClick={onClose} className="em-v2-safety-sheet__cancel">
          Cancelar
        </button>
      </div>
    </div>
  )
}
