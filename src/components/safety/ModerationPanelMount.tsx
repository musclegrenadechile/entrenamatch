import { AnimatePresence } from 'framer-motion'
import type { Report } from '../../types'
import { SEED_PROFILES } from '../../data/seedProfiles'

type ModerationTab = 'reports' | 'verifications' | 'bans'

type PendingVerification = {
  userId: string
  name: string
  age: number
  city: string
  idPhoto: string
  selfiePhoto: string
}

export type ModerationPanelMountProps = {
  open: boolean
  tab: ModerationTab
  reports: Report[]
  pendingVerifications: PendingVerification[]
  blockedUsers: string[]
  onClose: () => void
  onTabChange: (tab: ModerationTab) => void
  onReviewVerification: (userId: string, approve: boolean) => void
  onUnblockUser: (userId: string) => void
}

/** Fase 458 — moderation panel extracted from App.tsx. */
export function ModerationPanelMount({
  open,
  tab,
  reports,
  pendingVerifications,
  blockedUsers,
  onClose,
  onTabChange,
  onReviewVerification,
  onUnblockUser,
}: ModerationPanelMountProps) {
  if (!open) return null

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-[140] bg-black/90 flex flex-col" onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-[#0D0D10] max-w-[420px] mx-auto w-full mt-[42px] rounded-t-3xl overflow-hidden border border-[#2F2F35] flex flex-col"
        >
          <div className="p-4 border-b border-[#2F2F35] bg-[#1C1C20] flex items-center justify-between">
            <div>
              <div className="font-bold text-xl">Panel de Moderación</div>
              <div className="text-xs text-[#9CA3AF]">Simulado para preparación de lanzamiento</div>
            </div>
            <button type="button" onClick={onClose} className="text-2xl">
              ×
            </button>
          </div>

          <div className="flex border-b border-[#2F2F35] bg-[#1C1C20]">
            {(
              [
                { key: 'reports', label: 'Reportes' },
                { key: 'verifications', label: 'Verificaciones' },
                { key: 'bans', label: 'Baneados' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => onTabChange(t.key)}
                className={`flex-1 py-3 text-sm font-medium ${tab === t.key ? 'text-[#FF671F] border-b-2 border-[#FF671F]' : 'text-[#9CA3AF]'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {tab === 'reports' && (
              <div>
                <div className="text-sm text-[#9CA3AF] mb-3">
                  Reportes enviados por ti ({reports.length})
                </div>
                {reports.length === 0 ? (
                  <div className="text-center text-[#9CA3AF] py-8 text-sm">
                    Aún no has realizado reportes.
                  </div>
                ) : (
                  reports
                    .slice()
                    .reverse()
                    .map((report) => {
                      const reported = SEED_PROFILES.find((p) => p.id === report.reportedUserId)
                      return (
                        <div key={report.id} className="card p-3 mb-3 rounded-2xl text-sm">
                          <div className="flex justify-between">
                            <div>
                              <div>
                                Reportado: <span className="font-semibold">{reported?.name}</span>
                              </div>
                              <div className="text-xs text-[#9CA3AF]">Motivo: {report.reason}</div>
                              {report.details && (
                                <div className="text-xs mt-1">&quot;{report.details}&quot;</div>
                              )}
                            </div>
                            <div className="text-[10px] text-[#9CA3AF] text-right">
                              {new Date(report.timestamp).toLocaleDateString()}
                              <br />
                              {report.status}
                            </div>
                          </div>
                        </div>
                      )
                    })
                )}
              </div>
            )}

            {tab === 'verifications' && (
              <div>
                <div className="text-sm text-[#9CA3AF] mb-3">
                  Verificaciones pendientes ({pendingVerifications.length})
                </div>
                {pendingVerifications.length === 0 ? (
                  <div className="text-center text-[#9CA3AF] py-8 text-sm">
                    No hay verificaciones pendientes.
                  </div>
                ) : (
                  pendingVerifications.map((v, index) => (
                    <div key={index} className="card p-4 mb-4 rounded-2xl">
                      <div className="font-semibold mb-1">
                        {v.name}, {v.age} • {v.city}
                      </div>
                      <div className="flex gap-2 mb-3">
                        <div>
                          <div className="text-[10px] text-[#9CA3AF]">Documento</div>
                          <img
                            src={v.idPhoto}
                            alt="Documento"
                            className="w-20 h-14 object-cover rounded border border-[#2F2F35]"
                          />
                        </div>
                        <div>
                          <div className="text-[10px] text-[#9CA3AF]">Selfie</div>
                          <img
                            src={v.selfiePhoto}
                            alt="Selfie"
                            className="w-14 h-14 object-cover rounded border border-[#2F2F35]"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onReviewVerification(v.userId, true)}
                          className="flex-1 py-2 bg-[#22c55e] text-black rounded-2xl text-sm font-medium"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => onReviewVerification(v.userId, false)}
                          className="flex-1 py-2 bg-red-500 text-white rounded-2xl text-sm font-medium"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'bans' && (
              <div>
                <div className="text-sm text-[#9CA3AF] mb-3">
                  Usuarios baneados ({blockedUsers.length})
                </div>
                {blockedUsers.length === 0 ? (
                  <div className="text-center text-[#9CA3AF] py-8 text-sm">
                    No hay usuarios baneados.
                  </div>
                ) : (
                  blockedUsers.map((userId) => {
                    const user = SEED_PROFILES.find((p) => p.id === userId)
                    return (
                      <div
                        key={userId}
                        className="flex justify-between items-center card p-3 mb-2 rounded-2xl"
                      >
                        <span>{user?.name || 'Usuario desconocido'}</span>
                        <button
                          type="button"
                          onClick={() => onUnblockUser(userId)}
                          className="text-xs text-[#FF4F79]"
                        >
                          Desbanear
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#2F2F35] text-[10px] text-[#9CA3AF] text-center">
            Este panel es solo para demostración de preparación de lanzamiento.
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}
