import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { Firestore } from 'firebase/firestore'
import type { CurrentUser, Profile, TrainingSession } from '../../types'
import { formatLiveDistanceKm } from '../../utils/formatLiveDistance'

export type LiveNearUser = Profile & {
  distance?: number
  seVaEnMin?: number
  joinCount?: number
}

export type LiveModalSort = 'distance' | 'urgency' | 'hot'

export function sortLiveNearUsers(
  users: LiveNearUser[],
  sort: LiveModalSort,
  syncBonds: Record<string, { bondLevel?: number }>
): LiveNearUser[] {
  const list = [...users]
  if (sort === 'urgency') {
    list.sort((a, b) => (a.seVaEnMin || 99) - (b.seVaEnMin || 99))
  } else if (sort === 'hot') {
    list.sort(
      (a, b) =>
        (b.joinCount || 0) - (a.joinCount || 0) ||
        (a.distance || 999) - (b.distance || 999)
    )
  } else {
    list.sort((a, b) => (a.distance || 999) - (b.distance || 999))
  }
  return list
}

export function filterLiveNearUsers(users: LiveNearUser[], search: string): LiveNearUser[] {
  const q = search.trim().toLowerCase()
  if (!q) return users
  return users.filter(
    (u) =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.trainingTypes || []).join(' ').toLowerCase().includes(q)
  )
}

export type LiveNearModalMountProps = {
  open: boolean
  liveCountForUI: number
  liveTrainingNow: LiveNearUser[]
  currentUser: CurrentUser | null
  syncBonds: Record<string, { bondLevel?: number }>
  search: string
  sort: LiveModalSort
  joiningSyncWith: string | null
  effectiveUserId: string
  matches: string[]
  realMatches: string[]
  sessions: TrainingSession[]
  isDemoMode: boolean
  db: Firestore | null
  firebaseUid?: string | null
  onClose: () => void
  onSearchChange: (value: string) => void
  onSortChange: (sort: LiveModalSort) => void
  onOpenProfile: (user: LiveNearUser) => void
  onStartSync: (userId: string, userName: string) => void
  onSwipeRight: (userId: string) => void
  onOpenChat: (userId: string) => void
  isUserLive: (userId: string) => boolean
  onNavigateMap: () => void
  onNavigateProfile: () => void
  onNavigateSessions: () => void
  onSessionsUpdate: (sessions: TrainingSession[]) => void
  saveSessions?: (sessions: TrainingSession[]) => void
}

/** Fase 393 — lista LIVE full-screen extraída de App.tsx. */
export function LiveNearModalMount({
  open,
  liveCountForUI,
  liveTrainingNow,
  currentUser,
  syncBonds,
  search,
  sort,
  joiningSyncWith,
  effectiveUserId,
  matches,
  realMatches,
  sessions,
  isDemoMode,
  db,
  firebaseUid,
  onClose,
  onSearchChange,
  onSortChange,
  onOpenProfile,
  onStartSync,
  onSwipeRight,
  onOpenChat,
  isUserLive,
  onNavigateMap,
  onNavigateProfile,
  onNavigateSessions,
  onSessionsUpdate,
  saveSessions,
}: LiveNearModalMountProps) {
  if (!open) return null

  const closeAndReset = () => {
    onSearchChange('')
    onSortChange('distance')
    onClose()
  }

  const cycleSort = () => {
    onSortChange(sort === 'distance' ? 'urgency' : sort === 'urgency' ? 'hot' : 'distance')
  }

  const list = sortLiveNearUsers(filterLiveNearUsers(liveTrainingNow, search), sort, syncBonds)

  const handleGroupSession = () => {
    onClose()
    const liveNames = liveTrainingNow
      .slice(0, 4)
      .map((u) => (u.name || 'U').split(' ')[0])
      .join(', ')
    const newGroupSession: TrainingSession = {
      id: 'livegroup' + Date.now(),
      creatorId: effectiveUserId,
      creatorName: currentUser?.name || 'Tú',
      title: `Live training ya — ${liveNames}`,
      description: '¡Armado desde el live cerca! Todos los que estaban entrenando ahora.',
      time: 'Ahora',
      location: currentUser?.city || 'Cerca de ti',
      trainingType: liveTrainingNow[0]?.trainingTypes?.[0] || 'Mixto',
      maxParticipants: Math.min(8, liveTrainingNow.length + 2),
      participants: [effectiveUserId, ...liveTrainingNow.map((u) => u.id)],
      createdAt: Date.now(),
    }
    const updatedSessions = [newGroupSession, ...(sessions || [])]
    if (saveSessions) saveSessions(updatedSessions)
    else onSessionsUpdate(updatedSessions)

    if (!isDemoMode && firebaseUid && db) {
      void (async () => {
        try {
          const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
          await setDoc(
            doc(db, 'sessions', newGroupSession.id),
            { ...newGroupSession, createdAt: serverTimestamp() },
            { merge: true }
          )
        } catch {
          /* ignore */
        }
      })()
    }
    onNavigateSessions()
    toast.success('¡Sesión grupal creada!', {
      description: `Con ${liveTrainingNow.length} live cerca. Ve a Sesiones para chatear en grupo.`,
    })
  }

  return (
    <div
      className="absolute inset-0 z-[95] bg-[#0D0D10] flex flex-col"
      onClick={closeAndReset}
    >
      <div className="p-4 flex items-center justify-between border-b border-[#2F2F35]">
        <button type="button" onClick={closeAndReset}>
          <ArrowLeft />
        </button>
        <div className="font-medium flex items-center gap-2">
          Entrenando Ahora cerca ({liveCountForUI})
          {liveTrainingNow.some((u) => (u.seVaEnMin || 0) > 0) && (
            <span className="text-orange-400 text-xs">¡se va pronto, únete!</span>
          )}
          {liveCountForUI > 5 && <span className="text-[#22c55e] text-xs">🔥 HOT</span>}
        </div>
        <div />
      </div>

      {currentUser?.trainingNow && liveTrainingNow.length > 0 && (
        <div className="px-4 py-1 text-[10px] bg-[#22c55e]/10 text-[#22c55e] text-center">
          💡 Si te unes a alguien que también está live, ¡inicias EntrenaSync automático con timer +
          acciones instantáneas (se comparten en vivo en ambos muros)!
        </div>
      )}

      {liveTrainingNow.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-[#2F2F35]/60 flex gap-2 items-center bg-[#0D0D10]">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre..."
            className="form-input flex-1 text-sm py-1.5"
          />
          <button
            type="button"
            onClick={cycleSort}
            className="text-xs px-3 py-1 rounded-full border border-[#22c55e]/40 text-[#22c55e] active:bg-[#22c55e]/10 whitespace-nowrap"
          >
            {sort === 'distance' ? '📍 Dist' : sort === 'urgency' ? '⏱ Se va pronto' : '🔥 Hot'}
          </button>
        </div>
      )}

      {liveTrainingNow.length > 1 && (
        <div className="px-4 py-2 border-b border-[#2F2F35]/50 bg-black/30 radar-container">
          <div className="radar-lines" />
          <div className="text-[8px] text-[#9CA3AF] mb-1">
            Cerca de ti (radar ordenado por distancia)
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[...liveTrainingNow]
              .sort((a, b) => {
                const aInNet = syncBonds[a.id] ? -1 : 0
                const bInNet = syncBonds[b.id] ? -1 : 0
                if (aInNet !== bInNet) return aInNet - bInNet
                return (a.distance || 0) - (b.distance || 0)
              })
              .map((u, idx) => (
                <motion.div
                  key={u.id}
                  onClick={() => {
                    onClose()
                    onOpenProfile(u)
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col items-center text-center cursor-pointer active:opacity-80"
                >
                  <div className="relative">
                    {u.photos?.[0] ? (
                      <img
                        src={u.photos[0]}
                        alt=""
                        className={`w-9 h-9 rounded-full object-cover border-2 ${syncBonds[u.id] ? 'border-[#FFD700]' : 'border-[#22c55e]/60'}`}
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full ${syncBonds[u.id] ? 'bg-[#FFD700] text-black' : 'bg-[#22c55e]/20'} flex items-center justify-center text-[10px] border ${syncBonds[u.id] ? 'border-[#FFD700]' : 'border-[#22c55e]/30'}`}
                      >
                        {(u.name || 'U')[0]}
                      </div>
                    )}
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22c55e] rounded-full ring-2 ring-black"
                      style={{
                        animation:
                          (u.seVaEnMin || 0) < 10
                            ? 'live-pulse-green-urgent 1.1s ease-in-out infinite'
                            : 'live-pulse-green 1.8s ease-in-out infinite',
                      }}
                    />
                    {!!syncBonds[u.id] && (
                      <div className="absolute -top-0.5 -left-0.5 text-[6px] bg-[#FFD700] text-black px-0.5 rounded font-bold">
                        RED
                      </div>
                    )}
                  </div>
                  <div className="text-[8px] mt-0.5 text-white truncate max-w-[48px] font-medium">
                    {(u.name || 'U').split(' ')[0]}
                  </div>
                  <div className="text-[7px] text-[#22c55e]">
                    {(u.distance || 0).toFixed(0)}km
                    {u.joinCount && u.joinCount > 0 ? ` +${u.joinCount}🔥` : ''}
                    {!!syncBonds[u.id] && <span className="text-[#FFD700]">•NP</span>}
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      <div className="overflow-auto flex-1 p-4">
        {list.length > 0 ? (
          list.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                onClose()
                onOpenProfile(user)
              }}
              className="card card-glass p-3 mb-2 flex gap-3 cursor-pointer active:scale-95 border border-[#22c55e]/50 hover:border-[#22c55e]/80 transition-all group"
            >
              {user.photos?.[0] && (
                <img
                  src={user.photos[0]}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border-2 border-[#22c55e]/40 group-hover:border-[#22c55e]/70 transition"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold flex items-center gap-1.5 text-white">
                  {user.name || 'Usuario'}
                  {formatLiveDistanceKm(user.distance) ? (
                    <span className="text-[#9CA3AF] text-xs font-normal">
                      · {formatLiveDistanceKm(user.distance)}
                    </span>
                  ) : null}
                  {!!syncBonds[user.id] && (
                    <span className="text-[7px] bg-[#FFD700] text-black px-1 rounded font-bold">
                      ⭐ RED · F{syncBonds[user.id].bondLevel || 1}
                    </span>
                  )}
                </div>
                <div className="text-[#9CA3AF] text-sm truncate">
                  {user.trainingTypes?.join(', ') || 'Entreno'}
                </div>
                <div className="text-[#22c55e] text-xs flex items-center gap-1 mt-0.5">
                  En vivo hace {Math.floor((Date.now() - (user.trainingNowSince || 0)) / 60000)}m
                  {(user.seVaEnMin || 0) > 0 && (
                    <span
                      className={
                        (user.seVaEnMin || 0) < 15 ? 'text-red-400 font-bold' : 'text-orange-400'
                      }
                    >
                      {(user.seVaEnMin || 0) < 15
                        ? `· se va pronto en ${user.seVaEnMin}m 🔥`
                        : `· se va en ${user.seVaEnMin}m`}
                    </span>
                  )}
                </div>
                {(user.seVaEnMin || 0) > 0 && (
                  <div className="h-1 bg-[#22c55e]/20 rounded mt-0.5 mb-1">
                    <div
                      className="h-1 bg-[#22c55e] rounded"
                      style={{
                        width: `${Math.max(5, Math.min(100, (90 - (user.seVaEnMin || 0)) / 90 * 100))}%`,
                      }}
                    />
                  </div>
                )}
                {(user.joinCount || 0) > 0 && (
                  <div className="text-[10px] text-[#22c55e] mt-0.5 font-medium">
                    +{user.joinCount} se unieron a este live
                  </div>
                )}
                {user.trainingSyncWith && (
                  <div className="text-[8px] text-[#22c55e] mt-0.5">🔄 En Sync ahora</div>
                )}
                {!!syncBonds[user.id] && (
                  <div className="text-[7px] text-[#FFD700] mt-0.5 font-medium">
                    Tu red • re-sync = +Fuerza del equipo + impacto compartido
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 self-center">
                <button
                  type="button"
                  disabled={joiningSyncWith === user.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                    if (currentUser?.trainingNow && isUserLive(user.id)) {
                      onStartSync(user.id, user.name)
                    } else {
                      onSwipeRight(user.id)
                    }
                  }}
                  className={`text-[10px] ${syncBonds[user.id] ? 'bg-[#FFD700] text-black' : 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black'} px-3 py-1 rounded font-semibold active:brightness-90 flex items-center justify-center gap-1 ${joiningSyncWith === user.id ? 'opacity-80 cursor-wait' : ''}`}
                >
                  {joiningSyncWith === user.id
                    ? '⏳ Abriendo EntrenaSync...'
                    : syncBonds[user.id]
                      ? '🔥 RE-SYNC RED (NP+)'
                      : `🔥 Entrenar juntos (Sync)${formatLiveDistanceKm(user.distance) ? ` (${formatLiveDistanceKm(user.distance)})` : ''}`}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                    onOpenChat(user.id)
                    if (!matches.includes(user.id) && !realMatches.includes(user.id)) {
                      onSwipeRight(user.id)
                    }
                  }}
                  className="text-[9px] border border-[#22c55e]/60 text-[#22c55e] px-2 py-0.5 rounded active:bg-[#22c55e]/10 hover:bg-[#22c55e]/5"
                >
                  Chatear ya
                </button>
              </div>
            </div>
          ))
        ) : currentUser?.trainingNow ? (
          <div className="card card-glass p-6 text-center border border-[#22c55e]/40">
            <div className="text-3xl mb-2">🟢</div>
            <div className="font-semibold text-[#22c55e] mb-1">
              Estás en vivo — visible en el mapa LIVE
            </div>
            <div className="text-sm text-[#9CA3AF] mb-3">
              Aún no hay otros entrenando cerca. Tu marcador ya está en el mapa; cuando alguien más
              active live aparecerá aquí.
            </div>
            <button
              type="button"
              onClick={() => {
                onClose()
                onNavigateMap()
              }}
              className="text-xs px-4 py-1.5 rounded-full bg-[#22c55e] text-black font-bold active:brightness-90"
            >
              Ver mapa →
            </button>
          </div>
        ) : (
          <div className="card card-glass p-6 text-center border border-[#22c55e]/30">
            <div className="text-3xl mb-2">🏋️</div>
            <div className="font-semibold text-white mb-1">¡Aún no hay nadie entrenando cerca!</div>
            <div className="text-sm text-[#9CA3AF] mb-3">
              Sé el primero en activar &quot;Entrenando Ahora (EN VIVO)&quot; en tu Perfil.
            </div>
            <button
              type="button"
              onClick={() => {
                onClose()
                onNavigateProfile()
              }}
              className="text-xs px-4 py-1.5 rounded-full bg-[#22c55e] text-black font-bold active:brightness-90"
            >
              Ir a Perfil a activar →
            </button>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[#2F2F35] bg-[#0D0D10]">
        <div className="text-center text-xs text-[#9CA3AF] mb-2">
          Toca card → perfil. Unirme = like + auto-comment en su muro live.
        </div>
        {liveTrainingNow.length >= 2 && (
          <button
            type="button"
            onClick={handleGroupSession}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black font-bold text-sm active:scale-[0.985]"
          >
            🔥 Armar sesión grupal con estos {liveTrainingNow.length} live ahora
          </button>
        )}
      </div>
    </div>
  )
}
