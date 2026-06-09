/** Unified tab lazy-load skeleton (fase 179) — matches BootShell branding. */
export function TabLoadingShell({ message = 'Cargando…' }: { message?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center p-10 min-h-[40vh] text-white"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="text-2xl mb-2" aria-hidden>
        🏋️
      </div>
      <p className="text-sm font-semibold text-white mb-1">{message}</p>
      <p className="text-xs text-[#9CA3AF]">EntrenaMatch</p>
      <div className="mt-5 h-1 w-20 rounded-full bg-[#2F2F35] overflow-hidden">
        <div
          className="h-full w-1/2 bg-[#FF671F] rounded-full"
          style={{ animation: 'boot-slide 1.2s ease-in-out infinite alternate' }}
        />
      </div>
      <style>{`
        @keyframes boot-slide {
          from { transform: translateX(-100%); opacity: 0.5; }
          to { transform: translateX(200%); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
