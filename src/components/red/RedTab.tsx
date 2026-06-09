import type { ReactNode } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import type { RedSubTab } from '../../utils/tabNavigation'

export interface RedTabProps {
  subTab: RedSubTab
  onSubTabChange: (tab: RedSubTab) => void
  chatUnreads: number
  children: ReactNode
}

export function RedTab({ subTab, onSubTabChange, chatUnreads, children }: RedTabProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-[#2F2F35] bg-[#0D0D10]/95">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#9CA3AF] font-bold mb-2">Tu red</p>
        <div
          className="flex gap-1 p-1 rounded-2xl bg-[#1C1C20] border border-[#2F2F35]"
          role="tablist"
          aria-label="Matches o mensajes"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'matches'}
            onClick={() => onSubTabChange('matches')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'matches'
                ? 'bg-[#FF671F] text-black shadow-sm'
                : 'text-[#9CA3AF] active:bg-[#25252A]'
            }`}
          >
            <Heart size={14} aria-hidden />
            Matches
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'messages'}
            onClick={() => onSubTabChange('messages')}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'messages'
                ? 'bg-[#22c55e] text-black shadow-sm'
                : 'text-[#9CA3AF] active:bg-[#25252A]'
            }`}
          >
            <MessageCircle size={14} aria-hidden />
            Mensajes
            {chatUnreads > 0 && subTab !== 'messages' && (
              <span className="absolute -top-0.5 right-2 min-w-[15px] h-[15px] px-1 text-[9px] font-extrabold rounded-full bg-[#FF4F79] text-black flex items-center justify-center">
                {chatUnreads > 9 ? '9+' : chatUnreads}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}
