import { useEffect, useState } from 'react'
import { ArrowLeft, Heart, Shield, MessageCircle, LogOut, Ghost } from 'lucide-react'
import { toast } from 'sonner'
import { BRAND_COPY } from '../../constants/brandCopy'
import { deleteMyAccount, type DeleteMyAccountReason } from '../../services/accountDeletion'

const COPY = BRAND_COPY.deleteAccount
const CONFIRM_PHRASE = COPY.confirmPhrase
const WAIT_SEC = 8

type Step = 'story' | 'alternatives' | 'consequences' | 'confirm'

export type DeleteAccountFlowProps = {
  open: boolean
  onClose: () => void
  userName?: string
  ghostMode?: boolean
  isDemoMode?: boolean
  onEnableGhost?: () => void | Promise<void>
  onLogout?: () => void | Promise<void>
  onScrollToFeedback?: () => void
  onDeleted?: () => void | Promise<void>
}

export function DeleteAccountFlow({
  open,
  onClose,
  userName = '',
  ghostMode = false,
  isDemoMode = false,
  onEnableGhost,
  onLogout,
  onScrollToFeedback,
  onDeleted,
}: DeleteAccountFlowProps) {
  const [step, setStep] = useState<Step>('story')
  const [reason, setReason] = useState<DeleteMyAccountReason>('')
  const [typed, setTyped] = useState('')
  const [waitLeft, setWaitLeft] = useState(WAIT_SEC)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep('story')
    setReason('')
    setTyped('')
    setWaitLeft(WAIT_SEC)
    setDeleting(false)
  }, [open])

  useEffect(() => {
    if (!open || step !== 'confirm') return
    setWaitLeft(WAIT_SEC)
    const id = window.setInterval(() => {
      setWaitLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [open, step])

  if (!open) return null

  const phraseOk = typed.trim() === CONFIRM_PHRASE
  const canDelete = phraseOk && waitLeft === 0 && !deleting && !isDemoMode

  const handleDelete = async () => {
    if (!canDelete) return
    setDeleting(true)
    try {
      await deleteMyAccount({ confirmPhrase: typed.trim(), reason: reason || undefined })
      toast.success(COPY.deletedToast)
      onClose()
      await onDeleted?.()
    } catch (e: unknown) {
      const msg =
        (e as { message?: string })?.message ||
        'No se pudo eliminar la cuenta. Revisa conexión e intenta de nuevo.'
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  const header = (
    <header className="flex-shrink-0 px-4 py-3 border-b border-[#2F2F35] flex items-center gap-3">
      <button
        type="button"
        onClick={() => {
          if (step === 'story') onClose()
          else if (step === 'alternatives') setStep('story')
          else if (step === 'consequences') setStep('alternatives')
          else setStep('consequences')
        }}
        className="p-2 rounded-xl border border-[#2F2F35] text-[#9CA3AF] active:bg-[#1C1C20]"
        aria-label="Volver"
      >
        <ArrowLeft size={18} />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="text-sm font-bold text-white truncate">{COPY.entryLabel}</h1>
        <p className="text-[10px] text-[#6B7280]">
          {step === 'story' && 'Paso 1 de 4'}
          {step === 'alternatives' && 'Paso 2 de 4'}
          {step === 'consequences' && 'Paso 3 de 4'}
          {step === 'confirm' && 'Paso 4 de 4'}
        </p>
      </div>
    </header>
  )

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#0D0D10] text-white">
      {header}

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {step === 'story' && (
          <>
            <div className="rounded-2xl border border-[#FF671F]/30 bg-gradient-to-br from-[#FF671F]/10 to-transparent p-5">
              <div className="flex items-center gap-2 text-[#FF671F] mb-2">
                <Heart size={18} aria-hidden />
                <span className="text-[10px] uppercase tracking-widest font-bold">Un mensaje personal</span>
              </div>
              <h2 className="text-lg font-black leading-tight">{COPY.storyTitle}</h2>
              <p className="text-sm text-[#e5e7eb] mt-3 leading-relaxed">{COPY.storyLead(userName)}</p>
              <p className="text-sm text-[#9CA3AF] mt-3 leading-relaxed">{COPY.storyBody}</p>
              <p className="text-sm text-[#FF671F] font-semibold mt-4">{COPY.storyThanks}</p>
            </div>
            <button
              type="button"
              onClick={() => setStep('alternatives')}
              className="w-full py-3 rounded-2xl bg-[#FF671F] text-black font-bold text-sm"
            >
              Entiendo — continuar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl border border-[#22c55e]/40 text-[#22c55e] font-semibold text-sm"
            >
              {COPY.stayCta}
            </button>
          </>
        )}

        {step === 'alternatives' && (
          <>
            <h2 className="text-base font-bold">{COPY.alternativesTitle}</h2>
            <p className="text-xs text-[#9CA3AF] leading-snug">
              Muchas personas solo necesitan un respiro, no borrar todo. Estas opciones no destruyen tu
              progreso.
            </p>

            {!ghostMode && onEnableGhost && (
              <button
                type="button"
                onClick={async () => {
                  await onEnableGhost()
                  toast.success('Modo fantasma activado — sigues en la app sin pin en el mapa')
                  onClose()
                }}
                className="w-full text-left rounded-2xl border border-[#a855f7]/40 bg-[#a855f7]/10 p-4 flex gap-3"
              >
                <Ghost className="text-[#c084fc] shrink-0" size={22} />
                <div>
                  <div className="font-semibold text-sm">{COPY.ghostCta}</div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">{COPY.ghostHint}</div>
                </div>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={async () => {
                  onClose()
                  await onLogout()
                }}
                className="w-full text-left rounded-2xl border border-[#2F2F35] bg-[#111113] p-4 flex gap-3"
              >
                <LogOut className="text-[#9CA3AF] shrink-0" size={22} />
                <div>
                  <div className="font-semibold text-sm">{COPY.logoutCta}</div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">{COPY.logoutHint}</div>
                </div>
              </button>
            )}

            {onScrollToFeedback && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onScrollToFeedback()
                  toast.info('Cuéntanos qué falló — lo leemos de verdad')
                }}
                className="w-full text-left rounded-2xl border border-[#FF671F]/30 bg-[#FF671F]/5 p-4 flex gap-3"
              >
                <MessageCircle className="text-[#FF671F] shrink-0" size={22} />
                <div>
                  <div className="font-semibold text-sm">{COPY.feedbackCta}</div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">{COPY.feedbackHint}</div>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl border border-[#22c55e]/40 text-[#22c55e] font-semibold text-sm"
            >
              {COPY.stayCta}
            </button>
            <button
              type="button"
              onClick={() => setStep('consequences')}
              className="w-full py-2 text-[11px] text-[#6B7280] underline underline-offset-2"
            >
              Aun así quiero eliminar mi cuenta
            </button>
          </>
        )}

        {step === 'consequences' && (
          <>
            <div className="flex items-center gap-2 text-[#f87171]">
              <Shield size={18} />
              <h2 className="text-base font-bold">{COPY.consequencesTitle}</h2>
            </div>
            <ul className="space-y-2 text-sm text-[#cbd5e1]">
              {COPY.consequences.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-[#f87171]">×</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-[#9CA3AF] leading-snug border border-[#2F2F35] rounded-xl p-3">
              {COPY.consequencesNote}
            </p>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-2">
                {COPY.reasonTitle}
              </p>
              <div className="flex flex-wrap gap-2">
                {COPY.reasons.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setReason(r.id as DeleteMyAccountReason)}
                    className={`px-3 py-1.5 text-xs rounded-2xl border ${
                      reason === r.id
                        ? 'bg-[#25252A] border-[#FF671F] text-white'
                        : 'border-[#2F2F35] text-[#9CA3AF]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('confirm')}
              className="w-full py-3 rounded-2xl border border-[#3f2a2a] text-[#f87171] font-semibold text-sm"
            >
              Continuar hacia eliminación definitiva
            </button>
          </>
        )}

        {step === 'confirm' && (
          <>
            <h2 className="text-base font-bold">{COPY.confirmTitle}</h2>
            <p className="text-xs text-[#9CA3AF] leading-snug">{COPY.confirmHint}</p>
            {isDemoMode && (
              <p className="text-xs text-amber-300/90 border border-amber-500/30 rounded-xl p-3">
                {COPY.demoBlocked}
              </p>
            )}
            <div className="rounded-xl bg-[#1C1C20] border border-[#2F2F35] px-3 py-2 font-mono text-sm text-[#FF671F] text-center select-all">
              {CONFIRM_PHRASE}
            </div>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Escribe la frase exacta"
              className="w-full bg-[#111113] border border-[#2F2F35] rounded-2xl px-4 py-3 text-sm"
              autoCapitalize="characters"
              autoComplete="off"
              disabled={deleting}
            />
            <p className="text-[10px] text-center text-[#6B7280]">{COPY.confirmWait(waitLeft)}</p>
            <button
              type="button"
              disabled={!canDelete}
              onClick={() => void handleDelete()}
              className="w-full py-3 rounded-2xl bg-[#7f1d1d] border border-[#ef4444]/50 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? COPY.deleting : COPY.deleteButton}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
