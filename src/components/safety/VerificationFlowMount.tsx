import { AnimatePresence } from 'framer-motion'
import type { CurrentUser } from '../../types'
import { VerificationFaceCapture } from '../profile/VerificationFaceCapture'

export type VerificationFlowMountProps = {
  open: boolean
  currentUser: CurrentUser
  step: number
  selfie: string | null
  submitting: boolean
  capacitorCamera: unknown
  onClose: () => void
  onStepChange: (step: number) => void
  onSelfieChange: (value: string | null) => void
  onSubmit: () => void | Promise<void>
}

/** Fase 458 — biometric verification flow extracted from App.tsx. */
export function VerificationFlowMount({
  open,
  currentUser,
  step,
  selfie,
  submitting,
  capacitorCamera,
  onClose,
  onStepChange,
  onSelfieChange,
  onSubmit,
}: VerificationFlowMountProps) {
  if (!open) return null

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-[130] flex items-end bg-black/80" onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-[#0D0D10] rounded-t-3xl p-6 max-h-[90vh] overflow-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="font-bold text-2xl">Verificación biométrica</div>
              <div className="text-sm text-[#9CA3AF]">Paso {step} de 2</div>
            </div>
            <button type="button" onClick={onClose} className="text-2xl">
              ×
            </button>
          </div>

          {step === 1 && (
            <div>
              <div className="mb-6">
                <p className="text-[#cbd5e1] mb-4">
                  Comprobamos que eres la misma persona de tu foto de perfil con una selfie en vivo por
                  cámara frontal. No pedimos documento de identidad.
                </p>
                <div className="bg-[#1C1C20] p-4 rounded-2xl text-sm space-y-2">
                  <div>
                    ✓ Nombre: <span className="font-medium">{currentUser.name}</span>
                  </div>
                  <div>
                    ✓ Edad: <span className="font-medium">{currentUser.age} años</span>
                  </div>
                  <div>
                    ✓ Ubicación:{' '}
                    <span className="font-medium">
                      {currentUser.city}, {currentUser.country}
                    </span>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => onStepChange(2)} className="btn-primary w-full">
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-4">
                <div className="font-semibold mb-2">Paso 2: Selfie en vivo</div>
                <p className="text-sm text-[#9CA3AF] mb-4">
                  Usa la cámara frontal. La IA compara tu rostro con tu foto de perfil principal.
                </p>
              </div>

              <VerificationFaceCapture
                value={selfie}
                onChange={onSelfieChange}
                capacitorCamera={capacitorCamera}
                disabled={submitting}
              />

              <div className="flex gap-3">
                <button type="button" onClick={() => onStepChange(1)} className="btn-secondary flex-1">
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => void onSubmit()}
                  disabled={!selfie || submitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {submitting ? 'Analizando rostro…' : 'Verificar rostro'}
                </button>
              </div>
              <p className="text-[10px] text-center text-[#9CA3AF] mt-3">
                Solo verificación facial — sin documento. La selfie se guarda de forma privada.
              </p>
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  )
}
