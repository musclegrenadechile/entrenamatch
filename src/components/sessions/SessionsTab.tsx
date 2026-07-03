import { motion } from 'framer-motion'
import { MapPin, Plus, Users } from 'lucide-react'
import { EmV2EmptyState } from '../ui/EmV2EmptyState'
import type { TrainingSession } from '../../types'

export type DisplaySession = TrainingSession & { lastMessagePreview?: string }

export interface SessionsTabProps {
  sessions: DisplaySession[]
  effectiveUserId: string
  isDemoMode: boolean
  isLoadingSessions: boolean
  lastSync: Date | null
  isCreatorLive: (creatorId: string) => boolean
  getCreatorDistanceKm: (creatorId: string) => number | null
  onCreateSession: () => void
  onRefreshSessions: () => void | Promise<void>
  onJoinSession: (session: DisplaySession) => void | Promise<void>
  onOpenGroupChat: (sessionId: string) => void
  onCloseSession: (sessionId: string) => void | Promise<void>
  onLeaveSession: (sessionId: string) => void | Promise<void>
  onReviewCreator: (creatorId: string) => void
}

export function SessionsTab({
  sessions,
  effectiveUserId,
  isDemoMode,
  isLoadingSessions,
  lastSync,
  isCreatorLive,
  getCreatorDistanceKm,
  onCreateSession,
  onRefreshSessions,
  onJoinSession,
  onOpenGroupChat,
  onCloseSession,
  onLeaveSession,
  onReviewCreator,
}: SessionsTabProps) {
  const openSessions = sessions.filter((s) => !s.participants.includes(effectiveUserId))
  const mySessions = sessions.filter(
    (s) => s.participants.includes(effectiveUserId) || s.creatorId === effectiveUserId
  )

  return (
    <div className="em-v2-sessions flex-1 overflow-auto px-4 pb-28 space-y-8">
      <header className="em-v2-sessions__header pt-2">
        <div className="flex items-center justify-between gap-2">
        <div>
          <p className="em-v2-sessions__eyebrow">Grupales</p>
          <h2 className="em-v2-sessions__title">Sesiones</h2>
          <p className="em-v2-sessions__sub">Entrenamientos grupales cerca de ti</p>
          {!isDemoMode && (
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => void onRefreshSessions()}
                disabled={isLoadingSessions}
                className="em-v2-sessions__refresh"
              >
                {isLoadingSessions ? 'Actualizando...' : 'Actualizar sesiones reales'}
              </button>
              {lastSync && (
                <span className="text-[10px] text-[#9CA3AF]">
                  · hace {Math.max(0, Math.floor((Date.now() - lastSync.getTime()) / 1000))}s
                </span>
              )}
              <span className="live-pill">● en vivo</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onCreateSession}
          className="em-v2-sessions__create flex items-center gap-2 shrink-0"
        >
          <Plus size={16} /> Crear
        </button>
        </div>
      </header>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="em-v2-section-title">Sesiones abiertas</div>
          <div className="em-v2-section-badge">{openSessions.length}</div>
        </div>
        <div className="text-[10px] text-[#9CA3AF] -mt-2 mb-3">
          Sesiones visibles para testers reales • chat grupal en vivo
        </div>

        {openSessions.length === 0 ? (
          <EmV2EmptyState
            className="mt-4 em-v2-fade-in"
            icon={<Users className="text-[#FF671F]" size={28} />}
            title="No hay sesiones abiertas todavía"
            body={`${!isDemoMode ? 'Aún no hay sesiones activas de otros testers. ¡Sé el primero!' : 'Sé el primero en crear una.'} Se ven en vivo para todos y el chat grupal funciona cross-device.`}
          >
            <button type="button" onClick={onCreateSession} className="em-v2-hero-card__cta">
              Crear la primera sesión
            </button>
            {lastSync && (
              <p className="text-[10px] text-[#9CA3AF] mt-1">
                Última sync: hace {Math.max(0, Math.floor((Date.now() - lastSync.getTime()) / 1000))}s
              </p>
            )}
          </EmV2EmptyState>
        ) : (
          <div className="space-y-3">
            {openSessions
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((session) => {
                const spotsLeft = session.maxParticipants - session.participants.length
                const dist = getCreatorDistanceKm(session.creatorId)
                const creatorLive = isCreatorLive(session.creatorId)

                return (
                  <motion.div
                    key={session.id}
                    whileHover={{ scale: 1.01, y: -1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className={`em-v2-card ${creatorLive ? 'em-v2-card--live' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="em-v2-card__title">{session.title}</div>
                        <div className="em-v2-card__focus">
                          {session.trainingType} • {session.time}
                        </div>
                        <div className="em-v2-card__detail">
                          <MapPin size={13} /> {session.location}
                        </div>
                      </div>
                      <div className="em-v2-card__stat">
                        <div className="em-v2-card__stat-value">{spotsLeft} cupos</div>
                        {dist != null && <div className="em-v2-card__stat-label">{dist} km</div>}
                        {creatorLive && (
                          <div className="mt-0.5">
                            <span className="em-v2-card__badge em-v2-card__badge--live">🟢 LIVE</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="em-v2-card__footer">
                      <div className="em-v2-card__footer-meta">
                        Creado por <strong>{session.creatorName}</strong>
                        {!isDemoMode && session.creatorId && session.creatorId !== 'me' && (
                          <span className="ml-1.5 em-v2-card__badge em-v2-card__badge--real">REAL</span>
                        )}
                        <div className="mt-0.5">
                          {session.participants.length} / {session.maxParticipants} personas
                        </div>
                        {session.lastMessagePreview && (
                          <div className="em-v2-card__preview">💬 {session.lastMessagePreview}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => void onJoinSession(session)}
                        disabled={spotsLeft <= 0}
                        className="em-v2-card__cta"
                      >
                        Unirme
                      </button>
                    </div>
                  </motion.div>
                )
              })}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="em-v2-section-title">Mis sesiones</div>
          <div className="em-v2-section-badge em-v2-section-badge--brand">{mySessions.length}</div>
        </div>

        {mySessions.length === 0 ? (
          <EmV2EmptyState
            className="em-v2-fade-in"
            emoji="📅"
            title="Aún no tienes sesiones"
            body={
              !isDemoMode
                ? 'Crea tu primera sesión real o únete a una abierta arriba.'
                : 'Crea tu primera sesión o únete a una abierta arriba.'
            }
            compact
          >
            <button type="button" onClick={onCreateSession} className="em-v2-hero-card__cta">
              Crear sesión
            </button>
          </EmV2EmptyState>
        ) : (
          <div className="space-y-3">
            {mySessions
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((session) => {
                const isCreator = session.creatorId === effectiveUserId || session.creatorId === 'me'
                const dist = getCreatorDistanceKm(session.creatorId)
                const creatorLive = isCreatorLive(session.creatorId)

                return (
                  <motion.div
                    key={session.id}
                    whileHover={{ scale: 1.01, y: -1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className={`em-v2-card em-v2-card--owned ${creatorLive ? 'em-v2-card--live' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="em-v2-card__title">
                          {session.title}
                          {isCreator && (
                            <span className="em-v2-card__badge em-v2-card__badge--owned">TUYA</span>
                          )}
                          {creatorLive && (
                            <span className="em-v2-card__badge em-v2-card__badge--live">🟢 LIVE</span>
                          )}
                        </div>
                        <div className="em-v2-card__focus">
                          {session.trainingType} • {session.time}
                        </div>
                        <div className="em-v2-card__detail">
                          <MapPin size={13} /> {session.location}
                        </div>
                        {session.lastMessagePreview && (
                          <div className="em-v2-card__preview">💬 {session.lastMessagePreview}</div>
                        )}
                      </div>
                      <div className="em-v2-card__stat">
                        {dist != null && <div className="em-v2-card__stat-label">{dist} km</div>}
                        <div className="em-v2-card__stat-value">
                          {session.participants.length} / {session.maxParticipants}
                        </div>
                      </div>
                    </div>

                    <div className="em-v2-card__footer">
                      <div className="em-v2-card__footer-meta">
                        Participantes: {session.participants.length}
                      </div>

                      <div className="em-v2-card__actions">
                        <button
                          type="button"
                          onClick={() => onOpenGroupChat(session.id)}
                          className="em-v2-card__cta"
                        >
                          Abrir chat grupal
                        </button>

                        {isCreator && (
                          <button
                            type="button"
                            onClick={() => void onCloseSession(session.id)}
                            className="em-v2-card__cta em-v2-card__cta--danger"
                          >
                            Cerrar sesión
                          </button>
                        )}

                        {!isCreator && (
                          <>
                            <button
                              type="button"
                              onClick={() => void onLeaveSession(session.id)}
                              className="em-v2-card__cta em-v2-card__cta--ghost"
                            >
                              Salir
                            </button>
                            <button
                              type="button"
                              onClick={() => onReviewCreator(session.creatorId)}
                              className="em-v2-card__cta em-v2-card__cta--outline"
                            >
                              Marcar entrenado
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
