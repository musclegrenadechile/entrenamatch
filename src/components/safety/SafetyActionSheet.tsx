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
    <div className="fixed inset-0 z-[250] flex items-end bg-black/70" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl bg-[#1C1C20] border-t border-[#2F2F35] p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-sm font-bold text-white mb-1">Seguridad</p>
        <p className="text-center text-[11px] text-[#9CA3AF] mb-4">{targetName}</p>
        <button
          type="button"
          onClick={() => {
            onReport()
            onClose()
          }}
          className="w-full py-3 rounded-2xl bg-[#25252A] text-red-400 font-semibold mb-2"
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
          className="w-full py-3 rounded-2xl bg-red-900/30 text-red-300 font-semibold mb-2 border border-red-800/40"
        >
          Bloquear usuario
        </button>
        <button type="button" onClick={onClose} className="w-full py-3 text-[#9CA3AF] text-sm">
          Cancelar
        </button>
      </div>
    </div>
  )
}
