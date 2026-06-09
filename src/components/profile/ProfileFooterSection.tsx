import { APP_VERSION } from '../../constants'
import type { ProfileTabProps } from './profileTabTypes'

export function ProfileFooterSection(_props: ProfileTabProps) {
  return (
    <>
<div className="px-4 pb-8 pt-2 text-center">
  <div className="text-[10px] text-[#6B7280] mb-1">EntrenaMatch · v{APP_VERSION}</div>
  <div className="text-[10px] text-[#9CA3AF] flex justify-center gap-2">
    <a href="/entrenamatch/privacy.html" target="_blank" className="underline active:text-[#FF671F]">Privacidad</a>
    <span>·</span>
    <a href="/entrenamatch/terms.html" target="_blank" className="underline active:text-[#FF671F]">Términos</a>
  </div>
</div>
    </>
  )
}
