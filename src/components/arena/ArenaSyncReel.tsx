import { motion } from 'framer-motion'
import type { SyncDuelAction } from '../../utils/syncDuel'

export interface ArenaSyncReelProps {
  actions: SyncDuelAction[]
  selfUserId: string
  selfName: string
  partnerName: string
}

export function ArenaSyncReel({ actions, selfUserId, selfName, partnerName }: ArenaSyncReelProps) {
  const highlights = actions.slice(0, 6).reverse()
  if (highlights.length === 0) return null

  const selfFirst = selfName.split(' ')[0] || 'Tú'
  const partnerFirst = partnerName.split(' ')[0] || 'Compañero'

  return (
    <div className="em-v2-arena-reel" aria-label="Momentos de la sesión">
      <p className="em-v2-arena-reel__title">Momentos del sync</p>
      <div className="em-v2-arena-reel__track">
        {highlights.map((a, i) => {
          const isMe = a.userId === selfUserId
          return (
            <motion.div
              key={`${a.at}-${i}`}
              className="em-v2-arena-reel__slide"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.25 }}
            >
              <span className="em-v2-arena-reel__emoji">{a.emoji || '💪'}</span>
              <span className="em-v2-arena-reel__who">{isMe ? selfFirst : partnerFirst}</span>
              <span className="em-v2-arena-reel__label">{a.label}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}