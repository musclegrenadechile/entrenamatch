import type { RefObject, ReactNode, FormEvent } from 'react'
import { VerifiedPhotoBadge, VerifiedProfilePhoto } from '../profile/VerifiedProfilePhoto'
import { isProfileVerified } from '../../utils/identityVerification'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Mic,
  MoreVertical,
  Pause,
  Play,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react'
import type { Message, Profile } from '../../types'
import { generateIcebreakers } from '../../utils/icebreakers'
import { ChatPactCompareStrip, type ChatPactCompareData } from './ChatPactCompareStrip'

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
  partnerTyping?: boolean
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
  currentUser?: Profile | null
  voiceStreak?: number
  pactCompare?: ChatPactCompareData | null
  onOpenEntrenoLog?: () => void
}

const TRAINING_CHIPS = [
  '🏃 Correr sábado AM',
  '🏋️ Gym esta semana',
  '🌊 Calistenia playa',
  '💪 Pesas 19:00',
  '⚡ Funcional juntos',
]

const BOND_TEMPLATES = [
  '🏆 Compartir nuestro último EntrenaSync',
  '⭐ Postear mi eco de esta alianza',
  '🌊 Mencionar ripples de nuestro Arena',
]

function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function dayLabel(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const yest = new Date()
  yest.setDate(yest.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === yest.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function ChatView({
  chatProfile,
  isRealMatch,
  chatMessages,
  syncBond,
  isDemoMode,
  playingVoiceId,
  voicePlayProgress,
  pendingVoice,
  isUploadingVoice,
  voiceUploadProgress,
  isRecordingVoice,
  recordingTime,
  recordingLevels,
  chatInputValue,
  partnerTyping = false,
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
  currentUser,
  voiceStreak = 0,
  pactCompare = null,
  onOpenEntrenoLog,
}: ChatViewProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [chipsOpen, setChipsOpen] = useState(chatMessages.length === 0)

  const icebreakers =
    currentUser && chatProfile && chatMessages.length === 0
      ? generateIcebreakers(currentUser, chatProfile)
      : []

  const messagesWithDividers = useMemo(() => {
    let lastDay = ''
    return chatMessages.map((m, i) => {
      const ts = m.timestamp || Date.now()
      const dk = dayKey(ts)
      const showDay = dk !== lastDay
      if (showDay) lastDay = dk
      return { m, i, showDay, day: dayLabel(ts) }
    })
  }, [chatMessages])

  return (
    <div className="flex-1 flex flex-col chat-v2 min-h-0">
      {/* Lane — partner + estado de entreno */}
      <div className="chat-lane-header">
        <button type="button" onClick={onBack} className="chat-lane-back" aria-label="Volver">
          <ArrowLeft size={20} />
        </button>

        <button type="button" className="chat-lane-partner" onClick={onShowProfile}>
          <div className={`chat-lane-avatar ${chatProfile?.trainingNow ? 'live' : ''}`}>
            {chatProfile?.photos?.[0] ? (
              <>
                <VerifiedProfilePhoto
                  src={chatProfile.photos[0]}
                  alt=""
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover"
                  verificationStatus={chatProfile.verificationStatus}
                  showBadge={false}
                />
                {isProfileVerified(chatProfile.verificationStatus) && (
                  <VerifiedPhotoBadge size="xs" corner="top-right" className="top-0 right-0" />
                )}
              </>
            ) : (
              <span>👤</span>
            )}
          </div>
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-[15px] text-white truncate">{chatProfile?.name}</span>
              {isRealMatch && <span className="chat-lane-badge chat-lane-badge--real">REAL</span>}
              {syncBond && (
                <span className="chat-lane-badge chat-lane-badge--bond">
                  RED · {syncBond.bondLevel || 1}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#9CA3AF] mt-0.5 truncate">
              {chatProfile?.city}
              {chatProfile?.trainingNow ? (
                <span className="text-[#22c55e] font-bold"> · EN VIVO AHORA</span>
              ) : partnerTyping ? (
                <span className="text-[#FF671F] italic"> · escribiendo…</span>
              ) : (
                <span> · GymPartner</span>
              )}
            </p>
          </div>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 text-[#9CA3AF]"
            aria-label="Más opciones"
          >
            <MoreVertical size={20} />
          </button>
          {menuOpen && (
            <div className="absolute top-full right-0 mt-1 w-44 rounded-xl bg-[#1C1C20] border border-[#2F2F35] shadow-lg z-20 py-1">
              <button
                type="button"
                onClick={() => {
                  onShowReviewModal()
                  setMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#FF671F] active:bg-[#25252A]"
              >
                ★ Marcar entreno juntos
              </button>
              <button
                type="button"
                onClick={() => {
                  onShowProfile()
                  setMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-xs text-white active:bg-[#25252A]"
              >
                Perfil
              </button>
              <button
                type="button"
                onClick={() => {
                  onStartSync()
                  setMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#22c55e] active:bg-[#25252A]"
              >
                Entrenar juntos (Sync)
              </button>
              {!isDemoMode && (
                <button
                  type="button"
                  onClick={() => {
                    void onRefreshChat()
                    setMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#FF671F] active:bg-[#25252A]"
                >
                  Sync chat
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onReport()
                  setMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 active:bg-[#25252A]"
              >
                Reportar
              </button>
              <button
                type="button"
                onClick={() => {
                  void onBlock()
                  setMenuOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 active:bg-[#25252A]"
              >
                Bloquear
              </button>
            </div>
          )}
        </div>
      </div>

      {pactCompare && (
        <ChatPactCompareStrip compare={pactCompare} onOpenEntrenoLog={onOpenEntrenoLog} />
      )}

      {/* Dock de acciones — único EntrenaMatch */}
      <div className="chat-action-dock">
        <button type="button" className="chat-dock-btn chat-dock-btn--sync" onClick={onStartSync}>
          <Zap size={15} />
          Sync
        </button>
        <button
          type="button"
          className="chat-dock-btn chat-dock-btn--voice"
          onClick={onStartVoiceRecording}
          disabled={isRecordingVoice}
        >
          <Mic size={15} />
          Voz{voiceStreak > 0 ? ` · ${voiceStreak}d` : ''}
        </button>
        {onOpenEntrenoLog && (
          <button type="button" className="chat-dock-btn chat-dock-btn--log" onClick={onOpenEntrenoLog}>
            <Dumbbell size={15} />
            Log
          </button>
        )}
        <button
          type="button"
          className="chat-dock-btn chat-dock-btn--chip"
          onClick={() => setChipsOpen((v) => !v)}
        >
          <Sparkles size={15} />
          Propuesta
          {chipsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      <div
        ref={chatScrollRef}
        className="flex-1 overflow-auto px-3 py-3 space-y-0.5 min-h-0 chat-v2-thread"
        id="chat-scroll"
      >
        {messagesWithDividers.map(({ m, i, showDay, day }) => {
          const isMe = m.from === 'me'
          const time = m.timestamp
            ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''
          const prev = chatMessages[i - 1]
          const isGrouped =
            prev && prev.from === m.from && m.timestamp - (prev.timestamp || 0) < 1000 * 60 * 4

          return (
            <div key={m.id || i}>
              {showDay && (
                <div className="chat-day-divider">
                  <span>{day}</span>
                </div>
              )}
              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-2'}`}>
                <div className={`max-w-[86%] ${isMe ? 'text-right' : ''}`}>
                  {!isGrouped && time && <div className="chat-timestamp px-1 mb-0.5">{time}</div>}
                  <div
                    className={`chat-bubble ${isMe ? 'chat-bubble-sent' : 'chat-bubble-received'} ${
                      isGrouped ? 'chat-bubble-grouped' : ''
                    } ${m.voiceUrl ? 'chat-bubble--voice' : ''}`}
                  >
                    {m.voiceUrl && !m.voiceUrl.startsWith('blob:') ? (
                      <div className={`voice-bubble ${isMe ? 'sent' : 'received'}`}>
                        <button
                          type="button"
                          onClick={() => onToggleVoicePlay(m)}
                          className={`voice-play-btn ${playingVoiceId === m.id ? 'playing' : ''}`}
                        >
                          {playingVoiceId === m.id ? <Pause size={15} /> : <Play size={15} />}
                        </button>
                        <div className="voice-wave-container">
                          <div className={`voice-wave ${playingVoiceId === m.id ? 'playing' : ''}`}>
                            {[4, 7, 3, 9, 5, 8, 4, 6, 3, 7, 5, 9].map((h, idx) => (
                              <div
                                key={idx}
                                className="voice-bar"
                                style={{
                                  height: `${h * 1.55}px`,
                                  animationDelay: `${(idx % 6) * -120}ms`,
                                }}
                              />
                            ))}
                          </div>
                          {playingVoiceId === m.id && (
                            <div className="voice-progress" style={{ width: `${voicePlayProgress}%` }} />
                          )}
                        </div>
                        <span className="voice-duration">🎙️ {m.voiceDuration || '?'}s</span>
                      </div>
                    ) : m.voiceUrl && m.voiceUrl.startsWith('blob:') ? (
                      <span className="text-[10px] text-red-400">Nota de voz (sesión actual)</span>
                    ) : (
                      <span>{renderMessageText(m.text)}</span>
                    )}
                  </div>
                  {isMe && (m.read || m.readAt) && (
                    <span className="text-[9px] text-[#6B7280] px-1 mt-0.5 inline-block">
                      ✓✓ leído
                      {m.readAt
                        ? ` · ${new Date(m.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {partnerTyping && (
          <div className="flex justify-start mt-2 px-1">
            <div className="chat-bubble chat-bubble-received px-3 py-2.5 flex items-center gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-[#FF671F]/80 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {chatMessages.length === 0 && !partnerTyping && (
          <div className="chat-empty chat-empty--v2">
            <div className="chat-empty-ring">💪</div>
            <div className="title">Canal de entreno listo</div>
            <p className="text-[#9CA3AF] text-sm max-w-[260px] mx-auto leading-snug">
              Propón un horario, manda una nota de voz o arranca un EntrenaSync. Todo queda sincronizado
              entre dispositivos.
            </p>
          </div>
        )}
      </div>

      {/* Propuestas colapsables */}
      {chipsOpen && (
        <div className="chat-chips-panel">
          {icebreakers.length > 0 && (
            <>
              <p className="chat-chips-label">Para romper el hielo</p>
              <div className="chat-chips-row">
                {icebreakers.map((tip) => (
                  <button key={tip} type="button" className="chat-chip chat-chip--ice" onClick={() => onSendMessage(tip)}>
                    {tip}
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="chat-chips-label">Propuestas de entreno</p>
          <div className="chat-chips-row">
            {TRAINING_CHIPS.map((proposal) => (
              <button
                key={proposal}
                type="button"
                className="chat-chip"
                onClick={() => onSendMessage(proposal.replace(/^[^\s]+\s/, ''))}
              >
                {proposal}
              </button>
            ))}
          </div>
          {syncBond && (
            <>
              <p className="chat-chips-label">Red · plantillas</p>
              <div className="chat-chips-row">
                {BOND_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    className="chat-chip chat-chip--bond"
                    onClick={() => onSendBondTemplate(tpl)}
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="chat-composer chat-composer--v2">
        {pendingVoice && !isUploadingVoice && (
          <div className="chat-voice-ready">
            <button type="button" onClick={onPreviewPendingVoice} className="chat-voice-ready-play">
              <Play size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-[#FF671F] tracking-wider">RITUAL DE VOZ</p>
              <p className="text-[11px] text-[#9CA3AF]">
                {pendingVoice.duration}s · +1 racha de voz
              </p>
            </div>
            <button type="button" onClick={onCancelPendingVoice} className="text-[9px] text-red-400 px-2">
              ✕
            </button>
            <button type="button" onClick={onReRecordVoice} className="text-[9px] text-[#EAB308] px-2">
              Otra
            </button>
            <button type="button" onClick={onSendPendingVoice} className="chat-voice-send">
              Enviar
            </button>
          </div>
        )}

        {isUploadingVoice && (
          <div className="voice-uploading mb-2">
            <div className="label">TRANSMITIENDO A TUS GYMPARTNERS...</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${voiceUploadProgress || 10}%` }} />
            </div>
            <div className="text-[10px] tabular-nums text-[#FF671F] font-mono w-8 text-right">
              {voiceUploadProgress || 0}%
            </div>
            <button type="button" onClick={onCancelUpload} className="text-[9px] px-1.5 py-0.5 text-red-400 ml-1">
              cancelar
            </button>
          </div>
        )}

        <form onSubmit={onSubmitForm} className="flex gap-2 items-center">
          {isRecordingVoice ? (
            <div className="voice-recording flex-1" style={{ minWidth: 175 }}>
              <div className="dot" />
              <div className="flex-1">
                <div className="text-red-400 text-[9px] font-extrabold tracking-[1px]">GRABANDO</div>
                <div className="text-xs text-red-400/80 tabular-nums">{recordingTime}s / 60</div>
              </div>
              <div className="flex gap-1 items-end h-4 mx-1 bg-black/30 rounded px-1">
                {recordingLevels.map((h, i) => (
                  <div key={i} className="w-[2px] bg-red-400 rounded" style={{ height: `${Math.max(3, h)}px` }} />
                ))}
              </div>
              <button
                type="button"
                onClick={onStopVoiceRecording}
                className="px-3 py-1 text-[10px] bg-red-600 text-white rounded-full font-extrabold"
              >
                PARAR
              </button>
              <button type="button" onClick={onCancelVoiceRecording} className="text-red-400 text-xl px-1">
                ×
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Mensaje a tu GymPartner…"
                className="chat-input flex-1"
                onChange={(e) => onChatInputChange(e.target.value)}
                value={chatInputValue}
              />
              <button
                type="button"
                onClick={onStartVoiceRecording}
                className="chat-mic-btn w-11 h-11 rounded-2xl flex items-center justify-center"
                title="Nota de voz"
              >
                <Mic size={18} />
              </button>
              <button
                type="submit"
                disabled={!chatInputValue.trim() && !pendingVoice}
                className="chat-send-btn w-11 h-11 rounded-2xl flex items-center justify-center disabled:bg-[#2F2F35] disabled:text-[#6B7280]"
              >
                <Send size={17} />
              </button>
            </>
          )}
        </form>
        <p className="text-center text-[9px] text-[#6B7280] mt-2">
          {!isDemoMode ? 'Canal GymPartner · voz + sync + logs' : 'Demo local'}
        </p>
      </div>
    </div>
  )
}
