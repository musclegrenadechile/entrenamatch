import { APP_VERSION } from '../../constants'
import type { ProfileTabProps } from './profileTabTypes'
import { profileTabBindings } from './profileTabBindings'

export function ProfileFooterSection(props: ProfileTabProps) {
  const { handleLogout } = profileTabBindings(props)

  return (
    <>
{/* Subtle logout at the very bottom of Profile (non-blocking, after all content) */}
<div className="px-4 pb-8 pt-2 text-center">
  <div className="text-[10px] text-[#6B7280] mb-1">v{APP_VERSION} • Phase 0 real</div>
  <div className="text-[10px] text-[#9CA3AF] mb-1 flex justify-center gap-2">
    <a href="/entrenamatch/privacy.html" target="_blank" className="underline active:text-[#FF671F]">Privacidad</a>
    <span>·</span>
    <a href="/entrenamatch/terms.html" target="_blank" className="underline active:text-[#FF671F]">Términos</a>
  </div>
  <button
    type="button"
    onClick={() => { void handleLogout() }}
    className="text-xs text-[#9CA3AF] active:text-[#f87171] underline"
  >
    Cerrar sesión / Cambiar de cuenta
  </button>
</div>
    </>
  )
}
