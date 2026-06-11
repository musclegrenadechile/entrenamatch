import { useEffect, useState } from 'react'
import { realtimeStats } from '../../utils/realtimeStats'

const MAX_CHAT_LISTENERS = 5

export function PerfOverlay() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1500)
    return () => window.clearInterval(id)
  }, [])

  if (!import.meta.env.DEV) return null
  void tick

  const totalListeners =
    realtimeStats.profileListeners +
    realtimeStats.feedGlobalListeners +
    realtimeStats.feedUserListeners +
    realtimeStats.chatListeners +
    realtimeStats.commentListeners +
    realtimeStats.liveListeners

  return (
    <div
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-2 z-[9999] pointer-events-none select-none"
      aria-hidden
    >
      <div className="rounded-xl bg-black/80 border border-white/10 px-2.5 py-1.5 text-[9px] font-mono text-[#9CA3AF] leading-relaxed shadow-lg">
        <div className="text-[#22c55e] font-bold mb-0.5">PERF</div>
        <div>listeners: {totalListeners}</div>
        <div>
          prof {realtimeStats.profileListeners} · feed {realtimeStats.feedGlobalListeners}+
          {realtimeStats.feedUserListeners}
        </div>
        <div>
          chat {realtimeStats.chatListeners}/{MAX_CHAT_LISTENERS} · cmt{' '}
          {realtimeStats.commentListeners}
        </div>
        <div>live {realtimeStats.liveListeners} · feed {realtimeStats.lastFeedComputeMs}ms</div>
      </div>
    </div>
  )
}
