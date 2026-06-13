import { SafetyActionSheet } from './SafetyActionSheet'

export type SafetySheetTarget = {
  id: string
  name: string
}

export type SafetyActionSheetMountProps = {
  target: SafetySheetTarget | null
  onClose: () => void
  onReport: (userId: string) => void
  onBlock: (userId: string) => void | Promise<void>
}

/** Fase 395 — sheet reportar/bloquear extraído de App.tsx. */
export function SafetyActionSheetMount({
  target,
  onClose,
  onReport,
  onBlock,
}: SafetyActionSheetMountProps) {
  return (
    <SafetyActionSheet
      open={!!target}
      targetName={target?.name || ''}
      onClose={onClose}
      onReport={() => target && onReport(target.id)}
      onBlock={() => target && void onBlock(target.id)}
    />
  )
}
