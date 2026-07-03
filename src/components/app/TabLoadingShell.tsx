/** Unified tab lazy-load skeleton (oleada 350 — Visual v2). */
export function TabLoadingShell({ message = 'Cargando…' }: { message?: string }) {
  return (
    <div
      className="em-v2-loading flex flex-col items-center justify-center p-10 min-h-[40vh]"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="em-v2-loading__icon" aria-hidden>
        🏋️
      </div>
      <p className="em-v2-loading__title">{message}</p>
      <p className="em-v2-loading__sub">EntrenaMatch</p>
      <div className="em-v2-loading__bar" aria-hidden>
        <div className="em-v2-loading__bar-fill" />
      </div>
    </div>
  )
}