import { motion } from 'framer-motion'

export interface CommunityActiveMember {
  id: string
  name: string
  photo?: string
  trainingNow?: boolean
  distance?: number
  inBond?: boolean
}

export interface CommunityActiveStripProps {
  members: CommunityActiveMember[]
  cityLabel?: string
  /** Total unique people active in feed/LIVE today (Fase 3 Muro). */
  activeTodayCount?: number
  onOpenProfile: (member: CommunityActiveMember) => void
  onOpenMap?: () => void
}

export function CommunityActiveStrip({
  members,
  cityLabel,
  activeTodayCount,
  onOpenProfile,
  onOpenMap,
}: CommunityActiveStripProps) {
  if (members.length === 0 && !activeTodayCount) return null

  const liveCount = members.filter((m) => m.trainingNow).length
  const todayTotal = activeTodayCount ?? members.length

  return (
    <div className="mb-3 -mx-1 px-1">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
          {todayTotal > 0 && (
            <span className="text-white">{todayTotal} activos hoy</span>
          )}
          {cityLabel && (
            <span>
              {todayTotal > 0 ? ' · ' : ''}
              {cityLabel}
            </span>
          )}
          {liveCount > 0 && <span className="text-[#22c55e]"> · {liveCount} LIVE</span>}
        </p>
        {onOpenMap && liveCount > 0 && (
          <button
            type="button"
            onClick={onOpenMap}
            className="text-[10px] text-[#FF671F] font-semibold active:underline"
          >
            Ver mapa →
          </button>
        )}
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1 snap-x scrollbar-hide">
        {members.map((m, idx) => (
          <motion.button
            key={m.id}
            type="button"
            onClick={() => onOpenProfile(m)}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.03, 0.2) }}
            className="community-active-avatar snap-start flex-shrink-0 flex flex-col items-center gap-1 w-[52px]"
          >
            <div
              className={`relative w-11 h-11 rounded-full overflow-hidden border-2 ${
                m.trainingNow
                  ? 'border-[#22c55e] shadow-[0_0_0_2px_rgba(34,197,94,0.25)]'
                  : m.inBond
                    ? 'border-[#FFD700]/70'
                    : 'border-[#2F2F35]'
              }`}
            >
              {m.photo ? (
                <img src={m.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#2F2F35] flex items-center justify-center text-sm">
                  👤
                </div>
              )}
              {m.trainingNow && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-[#0D0D10]" />
              )}
            </div>
            <span className="text-[9px] text-white/90 font-semibold truncate w-full text-center leading-none">
              {(m.name || 'U').split(' ')[0]}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
