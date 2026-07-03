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
    <div className="flex-1 overflow-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="section-header">Sesiones</div>
          <div className="text-[#9CA3AF] text-sm">Entrenamientos grupales cerca de ti</div>
          {!isDemoMode && (
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => void onRefreshSessions()}
                disabled={isLoadingSessions}
                className="text-xs px-3 py-1 rounded-2xl bg-[#FF671F] text-black font-semibold active:bg-[#E55A1A] disabled:opacity-60"
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
          className="flex items-center gap-2 bg-[#FF671F] text-black px-4 py-2 rounded-2xl text-sm font-semibold active:bg-[#E55A1A]"
        >
          <Plus size={16} /> Crear
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="text-lg font-semibold">Sesiones abiertas</div>
          <div className="text-xs px-2 py-0.5 bg-[#2F2F35] rounded-full text-[#9CA3AF]">
            {openSessions.length}
          </div>
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
                    className={`card card-glass session-card rounded-3xl p-4 ${creatorLive ? 'border-[#22c55e]/60 ring-1 ring-[#22c55e]/20' : ''} hover:border-[#FF671F]/20 transition-all`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-lg tracking-tight">{session.title}</div>
                        <div className="text-sm text-[#FF671F] font-medium mt-0.5">
                          {session.trainingType} • {session.time}
                        </div>
                        <div className="text-sm text-[#9CA3AF] mt-0.5 flex items-center gap-1">
                          <MapPin size={13} /> {session.location}
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-[#22c55e] font-semibold">{spotsLeft} cupos</div>
                        {dist != null && <div className="text-[#9CA3AF] mt-0.5">{dist} km</div>}
                        {creatorLive && (
                          <div className="mt-0.5 text-[8px] px-1 py-0.5 bg-[#22c55e] text-black rounded font-bold">
                            🟢 LIVE
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <div className="text-[#9CA3AF]">
                        Creado por <span className="text-white font-medium">{session.creatorName}</span>
                        {!isDemoMode && session.creatorId && session.creatorId !== 'me' && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-px bg-[#FF671F] text-black rounded-full align-middle">
                            REAL
                          </span>
                        )}
                        <div className="text-[10px] mt-0.5">
                          {session.participants.length} / {session.maxParticipants} personas
                        </div>
                        {session.lastMessagePreview && (
                          <div className="text-[10px] text-[#9CA3AF] mt-0.5 truncate max-w-[160px]">
                            💬 {session.lastMessagePreview}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => void onJoinSession(session)}
                        disabled={spotsLeft <= 0}
                        className="bg-[#FF671F] text-black px-5 py-1.5 rounded-2xl text-sm font-medium disabled:opacity-50"
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
          <div className="text-lg font-semibold">Mis sesiones</div>
          <div className="text-xs px-2 py-0.5 bg-[#FF671F]/20 text-[#FF671F] rounded-full">{mySessions.length}</div>
        </div>

        {mySessions.length === 0 ? (
          <div className="card card-glass p-7 rounded-3xl text-center border border-[#FF671F]/20">
            <div className="text-2xl mb-2">📅</div>
            <div className="font-semibold mb-1">Aún no tienes sesiones</div>
            <p className="text-sm text-[#9CA3AF] mb-2 max-w-[260px] mx-auto">
              {!isDemoMode
                ? 'Crea tu primera sesión real o únete a una abierta arriba. ¡Otros testers la verán cross-device!'
                : 'Crea tu primera sesión o únete a una abierta arriba.'}
            </p>
            <p className="text-xs text-[#9CA3AF] mb-3">Chat grupal real-time + notifs cuando se unan.</p>
            <button
              type="button"
              onClick={onCreateSession}
              className="px-5 py-2 bg-gradient-to-r from-[#FF671F] to-[#FF4F79] text-black rounded-2xl text-sm font-semibold active:brightness-90"
            >
              Crear sesión
            </button>
          </div>
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
                    className={`card card-glass session-card rounded-3xl p-4 border border-[#FF4F79]/50 ring-1 ring-inset ring-[#FF4F79]/10 ${creatorLive ? 'border-[#22c55e]/60 ring-1 ring-[#22c55e]/20' : ''} hover:border-[#FF671F]/20 transition-all`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-lg flex items-center gap-2 tracking-tight">
                          {session.title}
                          {isCreator && (
                            <span className="text-[9px] bg-[#FF671F] text-black px-2 py-0.5 rounded font-medium">
                              TUYA
                            </span>
                          )}
                          {creatorLive && (
                            <span className="text-[8px] bg-[#22c55e] text-black px-1.5 py-0.5 rounded font-bold">
                              🟢 LIVE
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-[#FF671F] font-medium mt-0.5">
                          {session.trainingType} • {session.time}
                        </div>
                        <div className="text-sm text-[#9CA3AF] mt-0.5 flex items-center gap-1">
                          <MapPin size={13} /> {session.location}
                        </div>
                        {session.lastMessagePreview && (
                          <div className="text-[10px] text-[#9CA3AF] mt-0.5 truncate max-w-[180px]">
                            💬 {session.lastMessagePreview}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs">
                        {dist != null && <div className="text-[#9CA3AF]">{dist} km</div>}
                        <div className="text-[#22c55e] mt-0.5 font-medium">
                          {session.participants.length} / {session.maxParticipants}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-[#9CA3AF]">Participantes: {session.participants.length}</div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenGroupChat(session.id)}
                          className="text-xs bg-[#FF671F] text-black px-4 py-1.5 rounded-2xl font-medium"
                        >
                          Abrir chat grupal
                        </button>

                        {isCreator && (
                          <button
                            type="button"
                            onClick={() => void onCloseSession(session.id)}
                            className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-xl active:bg-red-500/20"
                          >
                            Cerrar sesión
                          </button>
                        )}

                        {!isCreator && (
                          <>
                            <button
                              type="button"
                              onClick={() => void onLeaveSession(session.id)}
                              className="text-xs border border-[#2F2F35] px-2 py-1 rounded-xl active:bg-[#25252A]"
                            >
                              Salir
                            </button>
                            <button
                              type="button"
                              onClick={() => onReviewCreator(session.creatorId)}
                              className="text-xs border border-[#FF671F] text-[#FF671F] px-3 py-1 rounded-xl"
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
