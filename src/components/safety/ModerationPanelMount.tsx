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
      <div className="em-v2-moderation__overlay absolute inset-0 z-[140] flex flex-col" onClick={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="em-v2-moderation flex-1 max-w-[420px] mx-auto w-full mt-[42px] rounded-t-3xl overflow-hidden flex flex-col"
        >
          <div className="em-v2-moderation__header p-4 flex items-center justify-between">
            <div>
              <div className="em-v2-moderation__title">Panel de Moderación</div>
              <div className="text-xs text-[#9CA3AF]">Simulado para preparación de lanzamiento</div>
            </div>
            <button type="button" onClick={onClose} className="text-2xl">
              ×
            </button>
          </div>

          <div className="em-v2-moderation__tabs">
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
                className={`em-v2-moderation__tab ${tab === t.key ? 'em-v2-moderation__tab--active' : ''}`}
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
                  <div className="em-v2-moderation__empty">Aún no has realizado reportes.</div>
                ) : (
                  reports
                    .slice()
                    .reverse()
                    .map((report) => {
                      const reported = SEED_PROFILES.find((p) => p.id === report.reportedUserId)
                      return (
                        <div key={report.id} className="em-v2-card mb-3 text-sm">
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
                  <div className="em-v2-moderation__empty">No hay verificaciones pendientes.</div>
                ) : (
                  pendingVerifications.map((v, index) => (
                    <div key={index} className="em-v2-card mb-4">
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
                          className="em-v2-moderation__approve"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => onReviewVerification(v.userId, false)}
                          className="em-v2-moderation__reject"
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
                  <div className="em-v2-moderation__empty">No hay usuarios baneados.</div>
                ) : (
                  blockedUsers.map((userId) => {
                    const user = SEED_PROFILES.find((p) => p.id === userId)
                    return (
                      <div
                        key={userId}
                        className="em-v2-card flex justify-between items-center mb-2"
                      >
                        <span>{user?.name || 'Usuario desconocido'}</span>
                        <button
                          type="button"
                          onClick={() => onUnblockUser(userId)}
                          className="em-v2-moderation__unblock"
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

          <div className="em-v2-moderation__footer p-4">
            Este panel es solo para demostración de preparación de lanzamiento.
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}
