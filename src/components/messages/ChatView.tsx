import type { RefObject, ReactNode, FormEvent } from 'react'
import { ArrowLeft, Mic, Pause, Play, Send } from 'lucide-react'
import type { Message, Profile } from '../../types'

export interface ChatViewProps {
  activeChat: string
  chatProfile: Profile | undefined
  isRealMatch: boolean
  chatMessages: Message[]
  syncBond: { bondLevel?: number } | undefined
  isDemoMode: boolean
  isLoadingChats: boolean
  playingVoiceId: string | null
  voicePlayProgress: number
  pendingVoice: { url: string; duration: number } | null
  isUploadingVoice: boolean
  voiceUploadProgress: number
  isRecordingVoice: boolean
  recordingTime: number
  recordingLevels: number[]
  chatInputValue: string
  chatScrollRef: RefObject<HTMLDivElement | null>
  renderMessageText: (text: string) => ReactNode
  onBack: () => void
  onShowProfile: () => void
  onRefreshChat: () => void | Promise<void>
  onStartSync: () => void
  onReport: () => void
  onBlock: () => void | Promise<void>
  onShowReviewModal: () => void
  onToggleVoicePlay: (message: Message) => void
  onSendMessage: (text: string) => void
  onSendBondTemplate: (template: string) => void
  onPreviewPendingVoice: () => void
  onCancelPendingVoice: () => void
  onReRecordVoice: () => void
  onSendPendingVoice: () => void
  onCancelUpload: () => void
  onChatInputChange: (value: string) => void
  onSubmitForm: (e: FormEvent<HTMLFormElement>) => void
  onStartVoiceRecording: () => void
  onStopVoiceRecording: () => void
  onCancelVoiceRecording: () => void
}

const QUICK_PROPOSALS = [
  '¿Vamos a correr el sábado?',
  'Gym esta semana?',
  'Calistenia en la playa mañana?',
  'Pesas mañana 19:00?',
  '¿Te tinca entrenar funcional?',
]

const BOND_TEMPLATES = [
  '🏆 Compartir nuestro último EntrenaSync',
  '⭐ Postear mi eco de esta alianza',
  '🌊 Mencionar ripples de nuestro Arena',
]

export function ChatView({
  activeChat,
  chatProfile,
  isRealMatch,
  chatMessages,
  syncBond,
  isDemoMode,
  isLoadingChats,
  playingVoiceId,
  voicePlayProgress,
  pendingVoice,
  isUploadingVoice,
  voiceUploadProgress,
  isRecordingVoice,
  recordingTime,
  recordingLevels,
  chatInputValue,
  chatScrollRef,
  renderMessageText,
  onBack,
  onShowProfile,
  onRefreshChat,
  onStartSync,
  onReport,
  onBlock,
  onShowReviewModal,
  onToggleVoicePlay,
  onSendMessage,
  onSendBondTemplate,
  onPreviewPendingVoice,
  onCancelPendingVoice,
  onReRecordVoice,
  onSendPendingVoice,
  onCancelUpload,
  onChatInputChange,
  onSubmitForm,
  onStartVoiceRecording,
  onStopVoiceRecording,
  onCancelVoiceRecording,
}: ChatViewProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="chat-header h-16 px-4 flex items-center gap-3 z-10">
        <button type="button" onClick={onBack} className="p-1.5 -ml-1 text-[#9CA3AF] active:text-white">
          <ArrowLeft size={22} />
        </button>

        <div
          className={`chat-header-avatar w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 relative ${chatProfile?.trainingNow ? 'live' : ''}`}
          onClick={onShowProfile}
          onKeyDown={(e) => e.key === 'Enter' && onShowProfile()}
          role="button"
          tabIndex={0}
        >
          <img src={chatProfile?.photos?.[0]} alt="" className="w-full h-full object-cover cursor-pointer" />
          {chatProfile?.trainingNow && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#22c55e] rounded-full ring-[2.5px] ring-[#0D0D10]" />
          )}
        </div>

        <div className="min-w-0 flex-1" onClick={onShowProfile} onKeyDown={(e) => e.key === 'Enter' && onShowProfile()} role="button" tabIndex={0}>
          <div className="font-black text-[17px] tracking-[-0.3px] flex items-center gap-2 leading-none">
            {chatProfile?.name}
            {isRealMatch && (
              <span className="text-[8px] px-1.5 py-px bg-[#FF671F] text-black rounded font-black tracking-widest">
                REAL
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#FF671F] flex items-center gap-1.5 mt-1">
            {chatProfile?.city}, {chatProfile?.country}
            {chatProfile?.trainingNow && <span className="text-[#22c55e] font-bold">• EN VIVO AHORA</span>}
            {syncBond && (
              <span className="px-1.5 py-px text-[8px] rounded bg-[#FFD700] text-black font-black tracking-wider">
                ⭐ RED · Fuerza {syncBond.bondLevel || 1}
              </span>
            )}
          </div>
        </div>

        <div className="chat-header-actions flex items-center gap-1 flex-shrink-0">
          <button type="button" onClick={onShowProfile} className="text-[10px] px-3 py-1 bg-[#1C1C20] hover:bg-[#25252A] rounded-full text-[#FF671F] border border-[#2F2F35]">
            Perfil
          </button>
          {!isDemoMode && (
            <button
              type="button"
              onClick={() => void onRefreshChat()}
              disabled={isLoadingChats}
              className="text-[9px] px-2 py-1 border border-[#2F2F35] rounded-xl text-[#FF671F] active:bg-[#25252A] disabled:opacity-60"
            >
              {isLoadingChats ? '...' : 'Sync'}
            </button>
          )}
          <button type="button" onClick={onStartSync} className="text-[9px] px-2.5 py-1 bg-[#22c55e]/10 text-[#22c55e] rounded-full active:bg-[#22c55e] active:text-black">
            Entrenar
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2 px-4 py-1 bg-[#0f1115] text-xs">
        <button type="button" onClick={onReport} className="text-red-400 hover:underline">
          Reportar
        </button>
        <button type="button" onClick={() => void onBlock()} className="text-red-400 hover:underline">
          Bloquear
        </button>
      </div>

      <div className="px-4 py-2 bg-[#1C1C20] border-b border-[#2F2F35] text-center">
        <button type="button" onClick={onShowReviewModal} className="text-xs bg-[#FF671F]/10 text-[#FF671F] px-3 py-1 rounded-full hover:bg-[#FF671F] hover:text-black transition">
          ★ Marcamos que entrenamos juntos (dejar reseña)
        </button>
      </div>

      <div ref={chatScrollRef} className="flex-1 overflow-auto px-3 py-4 space-y-1 pb-24 min-h-0 bg-[#0a0a0c]" id="chat-scroll">
        {chatMessages.map((m, i, arr) => {
          const isMe = m.from === 'me'
          const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
          const prev = arr[i - 1]
          const isGrouped = prev && prev.from === m.from && m.timestamp - (prev.timestamp || 0) < 1000 * 60 * 4
          return (
            <div key={m.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-2.5'} group`}>
              <div className={`max-w-[84%] ${isMe ? 'text-right' : ''}`}>
                {!isGrouped && time && <div className="chat-timestamp px-1 mb-0.5">{time}</div>}
                <div className={`chat-bubble ${isMe ? 'chat-bubble-sent' : 'chat-bubble-received'} ${isGrouped ? 'chat-bubble-grouped' : ''}`}>
                  {m.voiceUrl && !m.voiceUrl.startsWith('blob:') ? (
                    <div className={`voice-bubble ${isMe ? 'sent' : 'received'}`}>
                      <button type="button" onClick={() => onToggleVoicePlay(m)} className={`voice-play-btn ${playingVoiceId === m.id ? 'playing' : ''}`}>
                        {playingVoiceId === m.id ? <Pause size={15} /> : <Play size={15} />}
                      </button>
                      <div className="voice-wave-container">
                        <div className={`voice-wave ${playingVoiceId === m.id ? 'playing' : ''}`}>
                          {[4, 7, 3, 9, 5, 8, 4, 6, 3, 7, 5, 9].map((h, idx) => (
                            <div key={idx} className="voice-bar" style={{ height: `${h * 1.55}px`, animationDelay: `${(idx % 6) * -120}ms` }} />
                          ))}
                        </div>
                        {playingVoiceId === m.id && <div className="voice-progress" style={{ width: `${voicePlayProgress}%` }} />}
                      </div>
                      <span className="voice-duration">🎙️ {m.voiceDuration || '?'}s</span>
                    </div>
                  ) : m.voiceUrl && m.voiceUrl.startsWith('blob:') ? (
                    <span className="text-[10px] text-red-400">Nota de voz (sesión actual)</span>
                  ) : (
                    <span>{renderMessageText(m.text)}</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {chatMessages.length === 0 && (
          <div className="chat-empty">
            <div className="icon">💬</div>
            <div className="title">Conexión lista</div>
            <div className="text-[#9CA3AF] text-sm max-w-[240px] mx-auto">
              Este es tu GymPartner. Envía un mensaje, una nota de voz o una propuesta de entrenamiento. Los chats reales se sincronizan cross-device.
            </div>
            <div className="mt-4 text-[11px] text-[#FF671F]/70">Prueba una de las propuestas rápidas de abajo</div>
          </div>
        )}
      </div>

      <div className="px-3 pt-2 border-t border-[#2F2F35] bg-[#0D0D10]">
        <div className="text-[10px] text-[#9CA3AF] mb-1.5 px-1">Propuestas rápidas:</div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {QUICK_PROPOSALS.map((proposal) => (
            <button
              key={proposal}
              type="button"
              onClick={() => onSendMessage(proposal)}
              className="text-xs bg-[#1C1C20] hover:bg-[#25252A] border border-[#2F2F35] px-3 py-1 rounded-full text-[#cbd5e1] active:bg-[#FF671F] active:text-black"
            >
              {proposal}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-[#2F2F35] bg-[#0D0D10]">
        {syncBond && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {BOND_TEMPLATES.map((tpl) => (
              <button
                key={tpl}
                type="button"
                onClick={() => onSendBondTemplate(tpl)}
                className="text-[9px] px-2 py-0.5 rounded-full border border-[#FFD700]/40 text-[#FFD700] active:bg-[#FFD700]/10"
              >
                {tpl.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {pendingVoice && !isUploadingVoice && (
          <div className="mb-3 p-3 rounded-2xl bg-[#1a140f] border border-[#FF671F]/30 flex items-center gap-3">
            <button type="button" onClick={onPreviewPendingVoice} className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF671F] to-[#E55A1A] flex items-center justify-center text-black active:scale-90 shadow-lg flex-shrink-0">
              <Play size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#FF671F] tracking-wider">NOTA DE VOZ LISTA</div>
              <div className="text-[11px] text-[#9CA3AF]">{pendingVoice.duration}s • +1 Voice Streak</div>
            </div>
            <div className="flex flex-col gap-1">
              <button type="button" onClick={onCancelPendingVoice} className="text-[9px] px-2 py-0.5 text-red-400 border border-red-400/40 rounded active:bg-red-500/10">
                Cancelar
              </button>
              <button type="button" onClick={onReRecordVoice} className="text-[9px] px-2 py-0.5 text-[#EAB308] border border-[#EAB308]/40 rounded active:bg-[#EAB308]/10">
                Re-grabar
              </button>
            </div>
            <button type="button" onClick={onSendPendingVoice} className="ml-1 px-4 py-2 bg-[#FF671F] text-black rounded-2xl font-black text-sm active:bg-[#E55A1A] flex items-center gap-1.5 active:scale-[0.985]">
              ENVIAR <Send size={15} />
            </button>
          </div>
        )}

        {isUploadingVoice && (
          <div className="voice-uploading mb-2">
            <div className="label">TRANSMITIENDO A TUS GYMPARTNERS...</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${voiceUploadProgress || 10}%` }} />
            </div>
            <div className="text-[10px] tabular-nums text-[#FF671F] font-mono w-8 text-right">{voiceUploadProgress || 0}%</div>
            <button type="button" onClick={onCancelUpload} className="text-[9px] px-1.5 py-0.5 text-red-400 hover:text-red-500 ml-1">
              cancelar
            </button>
          </div>
        )}

        <form onSubmit={onSubmitForm} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder={pendingVoice ? 'Nota lista — presiona ENVIAR' : 'Mensaje o nota de voz a tu GymPartner...'}
            className="chat-input flex-1"
            onChange={(e) => onChatInputChange(e.target.value)}
            value={chatInputValue}
          />

          {isRecordingVoice ? (
            <div className="voice-recording flex-1" style={{ minWidth: 175 }}>
              <div className="dot" />
              <div className="flex-1">
                <div className="text-red-400 text-[9px] font-extrabold tracking-[1px]">GRABANDO NOTA</div>
                <div className="text-xs text-red-400/80 tabular-nums">{recordingTime}s / 60</div>
              </div>
              <div className="flex gap-1 items-end h-4 mx-1 bg-black/30 rounded px-1">
                {recordingLevels.map((h, i) => (
                  <div key={i} className="w-[2px] bg-red-400 rounded" style={{ height: `${Math.max(3, h)}px` }} />
                ))}
              </div>
              <button type="button" onClick={onStopVoiceRecording} className="px-3.5 py-1 text-[10px] bg-red-600 text-white rounded-full font-extrabold active:bg-red-700">
                PARAR
              </button>
              <button type="button" onClick={onCancelVoiceRecording} className="text-red-400 text-2xl leading-none px-1 hover:text-red-300">
                ×
              </button>
            </div>
          ) : (
            <button type="button" onClick={onStartVoiceRecording} className="chat-mic-btn w-12 h-12 rounded-3xl flex items-center justify-center" title="Grabar nota de voz">
              <Mic size={20} />
            </button>
          )}

          <button
            type="submit"
            disabled={!chatInputValue.trim() && !pendingVoice}
            className="chat-send-btn w-12 h-12 rounded-3xl flex items-center justify-center active:scale-[0.93] disabled:bg-[#2F2F35] disabled:text-[#6B7280]"
          >
            <Send size={18} />
          </button>
        </form>

        <div className="text-center text-[9px] text-[#6B7280] mt-2 tracking-wider">
          {!isDemoMode ? 'Mensajes reales cross-device • notas de voz que se sienten' : 'Demo local'}
        </div>
      </div>
    </div>
  )
}
