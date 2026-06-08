import { APP_VERSION } from '../constants'

type BootShellProps = {
  message?: string
  submessage?: string
  timedOut?: boolean
  onRetry?: () => void
  onDemo?: () => void
}

export function BootShell({
  message = 'Cargando EntrenaMatch…',
  submessage,
  timedOut = false,
  onRetry,
  onDemo,
}: BootShellProps) {
  return (
    <div
      className="min-h-[100svh] flex flex-col items-center justify-center bg-[#0D0D10] text-white px-6"
      style={{ minHeight: '100vh' }}
    >
      <div className="text-center max-w-xs">
        <div className="text-3xl mb-3" aria-hidden>
          🏋️
        </div>
        <p className="text-base font-semibold text-white mb-1">{message}</p>
        {submessage ? (
          <p className="text-sm text-[#9CA3AF] leading-relaxed">{submessage}</p>
        ) : (
          <p className="text-sm text-[#9CA3AF]">v{APP_VERSION}</p>
        )}
        {!timedOut ? (
          <div className="mt-6 h-1 w-24 mx-auto rounded-full bg-[#2F2F35] overflow-hidden">
            <div
              className="h-full w-1/2 bg-[#FF671F] rounded-full animate-pulse"
              style={{ animation: 'boot-slide 1.2s ease-in-out infinite alternate' }}
            />
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            <p className="text-[11px] text-[#fca5a5] leading-snug">
              La conexión está tardando más de lo usual. Puedes reintentar o probar el modo demo.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="w-full py-2.5 rounded-xl bg-[#FF671F] text-black font-bold text-sm active:opacity-90"
                >
                  Reintentar
                </button>
              )}
              {onDemo && (
                <button
                  type="button"
                  onClick={onDemo}
                  className="w-full py-2.5 rounded-xl border border-[#FF671F]/40 text-[#FF671F] font-bold text-sm active:bg-[#FF671F]/10"
                >
                  Entrar en demo
                </button>
              )}
            </div>
          </div>
        )}
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
