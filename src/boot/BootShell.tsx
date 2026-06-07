import { APP_VERSION } from '../constants';

type BootShellProps = {
  message?: string;
  submessage?: string;
};

export function BootShell({
  message = 'Cargando EntrenaMatch…',
  submessage,
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
        <div className="mt-6 h-1 w-24 mx-auto rounded-full bg-[#2F2F35] overflow-hidden">
          <div
            className="h-full w-1/2 bg-[#FF671F] rounded-full animate-pulse"
            style={{ animation: 'boot-slide 1.2s ease-in-out infinite alternate' }}
          />
        </div>
      </div>
      <style>{`
        @keyframes boot-slide {
          from { transform: translateX(-100%); opacity: 0.5; }
          to { transform: translateX(200%); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
