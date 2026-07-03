import type { ReactNode } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import type { RedSubTab } from '../../utils/tabNavigation'

export interface RedTabProps {
  subTab: RedSubTab
  onSubTabChange: (tab: RedSubTab) => void
  chatUnreads: number
  /** Full-screen chat — hide Matches/Mensajes switcher (WhatsApp-style). */
  hideSubNav?: boolean
  children: ReactNode
}

export function RedTab({ subTab, onSubTabChange, chatUnreads, hideSubNav, children }: RedTabProps) {
  return (
    <div className="em-v2-red flex-1 flex flex-col min-h-0">
      {!hideSubNav && (
      <div className="em-v2-red__subnav flex-shrink-0 px-4 pt-3 pb-2">
        <p className="em-v2-red__eyebrow">Tu red</p>
        <div className="em-v2-red__tabs" role="tablist" aria-label="Matches o mensajes">
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'matches'}
            onClick={() => onSubTabChange('matches')}
            className={`em-v2-red__tab ${subTab === 'matches' ? 'em-v2-red__tab--matches' : ''}`}
          >
            <Heart size={14} aria-hidden />
            Matches
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'messages'}
            onClick={() => onSubTabChange('messages')}
            className={`em-v2-red__tab em-v2-red__tab--messages-wrap ${subTab === 'messages' ? 'em-v2-red__tab--messages' : ''}`}
          >
            <MessageCircle size={14} aria-hidden />
            Mensajes
            {chatUnreads > 0 && subTab !== 'messages' && (
              <span className="em-v2-red__badge">
                {chatUnreads > 9 ? '9+' : chatUnreads}
              </span>
            )}
          </button>
        </div>
      </div>
      )}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}
