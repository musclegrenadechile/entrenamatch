import type { RefObject, ReactNode, FormEvent } from 'react'
import { VerifiedProfilePhoto } from '../profile/VerifiedProfilePhoto'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Camera,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Mic,
  MoreVertical,
  Paperclip,
  Pause,
  Play,
  Send,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import type { Message, Profile } from '../../types'
import { BRAND_COPY } from '../../constants/brandCopy'
import { generateIcebreakers } from '../../utils/icebreakers'
import { ChatPactCompareStrip, type ChatPactCompareData } from './ChatPactCompareStrip'
import { WorkoutPostCard } from '../workout/WorkoutPostCard'
import { getPublicGymSound } from '../../services/gymSound'
import { NowPlayingBadge } from '../music/NowPlayingBadge'
import { ShareWorkoutPickerSheet } from '../workout/ShareWorkoutPickerSheet'
import type { Workout } from '../../types'

function ChatMessageStatus({ message }: { message: Message }) {
  const isRead = !!(message.read || message.readAt)
  if (message.sendStatus === 'sending') {
    return <span className="chat-wa-status chat-wa-status--sending">· · ·</span>
  }
  if (message.sendStatus === 'failed') {
    return <span className="chat-wa-status chat-wa-status--failed">!</span>
  }
  if (isRead) {
    return (
      <span className="chat-wa-status chat-wa-status--read" title="Leído">
        <CheckCheck size={14} strokeWidth={2.75} aria-hidden />
      </span>
    )
  }
  return (
    <span className="chat-wa-status chat-wa-status--sent" title="Enviado">
      <Check size={12} strokeWidth={2.5} aria-hidden />
    </span>
  )
}

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
  pendingPhoto?: { url: string } | null
  isUploadingPhoto?: boolean
  photoUploadProgress?: number
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
  onPickPhoto: () => void
  onCancelPendingPhoto: () => void
  onSendPendingPhoto: () => void
  onChatInputChange: (value: string) => void
  onSubmitForm: (e: FormEvent<HTMLFormElement>) => void
  onStartVoiceRecording: () => void
  onStopVoiceRecording: () => void
  onCancelVoiceRecording: () => void
  currentUser?: Profile | null
  voiceStreak?: number
  pactCompare?: ChatPactCompareData | null
  onOpenEntrenoLog?: () => void
  onOpenExplore?: () => void
  onCopyWorkout?: (workoutId: string, title?: string) => void
  fetchTodayWorkouts?: () => Promise<Workout[]>
  onShareWorkoutToChat?: (workout: Workout) => void | Promise<void>
}

const TRAINING_CHIPS = [
  '🏃 Correr sábado AM',
  '🏋️ Gym esta semana',
  '🌊 Calistenia playa',
  '💪 Pesas 19:00',
]

const BOND_TEMPLATES = [
  '🏋️ ¿Entrenamos esta semana?',
  '💪 ¿Cómo te fue el último entreno?',
  '📅 ¿Qué día te acomoda para gym?',
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

function formatMsgTime(ts?: number): string {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  pendingPhoto,
  isUploadingPhoto,
  photoUploadProgress = 0,
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
  onPickPhoto,
  onCancelPendingPhoto,
  onSendPendingPhoto,
  onChatInputChange,
  onSubmitForm,
  onStartVoiceRecording,
  onStopVoiceRecording,
  onCancelVoiceRecording,
  currentUser,
  voiceStreak = 0,
  pactCompare = null,
  onOpenEntrenoLog,
  onOpenExplore,
  onCopyWorkout,
  fetchTodayWorkouts,
  onShareWorkoutToChat,
}: ChatViewProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [attachOpen, setAttachOpen] = useState(false)
  const [shareWorkoutOpen, setShareWorkoutOpen] = useState(false)
  const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([])
  const [loadingTodayWorkouts, setLoadingTodayWorkouts] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      const prev = chatMessages[i - 1]
      const next = chatMessages[i + 1]
      const isGroupedWithPrev =
        prev && prev.from === m.from && ts - (prev.timestamp || 0) < 1000 * 60 * 4
      const isGroupedWithNext =
        next && next.from === m.from && (next.timestamp || 0) - ts < 1000 * 60 * 4
      return { m, i, showDay, day: dayLabel(ts), isGroupedWithPrev, isGroupedWithNext }
    })
  }, [chatMessages])

  const scrollToBottom = (smooth = false) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' })
    const el = chatScrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }

  useLayoutEffect(() => {
    scrollToBottom(false)
  }, [chatMessages.length, partnerTyping, pendingPhoto, pendingVoice, attachOpen])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
    scrollToBottom(false)
  }, [chatInputValue])

  const canSend = !!(chatInputValue.trim() || pendingVoice || pendingPhoto)
  const partnerMusic = getPublicGymSound(chatProfile)
  const canShareWorkout = !!(onOpenEntrenoLog || (fetchTodayWorkouts && onShareWorkoutToChat))

  const openShareWorkoutPicker = () => {
    setAttachOpen(false)
    setShareWorkoutOpen(true)
    if (!fetchTodayWorkouts) return
    setLoadingTodayWorkouts(true)
    void fetchTodayWorkouts()
      .then((list) => setTodayWorkouts(list))
      .catch(() => setTodayWorkouts([]))
      .finally(() => setLoadingTodayWorkouts(false))
  }

  return (
    <div className="chat-wa chat-wa--fullscreen flex-1 flex flex-col min-h-0 overflow-hidden">
      <header className="chat-wa-header chat-wa-header--fullscreen shrink-0">
        <button type="button" onClick={onBack} className="chat-wa-header-btn" aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
        <button type="button" className="chat-wa-header-profile" onClick={onShowProfile}>
          <div className={`chat-wa-avatar ${chatProfile?.trainingNow ? 'live' : ''}`}>
            {chatProfile?.photos?.[0] ? (
              <VerifiedProfilePhoto
                src={chatProfile.photos[0]}
                alt={chatProfile.name || 'Atleta'}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover"
                verificationStatus={chatProfile.verificationStatus}
                showBadge={false}
              />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div className="min-w-0 text-left">
            <div className="chat-wa-name">{chatProfile?.name || 'Chat'}</div>
            <div className="chat-wa-sub">
              {partnerTyping ? (
                <span className="text-[#25D366]">escribiendo…</span>
              ) : partnerMusic ? (
                <span className="text-[#1DB954] truncate">🎧 {partnerMusic.trackName}</span>
              ) : chatProfile?.trainingNow ? (
                <span className="text-[#22c55e]">en vivo ahora</span>
              ) : (
                <span>{chatProfile?.city || BRAND_COPY.partner}</span>
              )}
            </div>
          </div>
        </button>
        <button type="button" className="chat-wa-header-btn text-[#22c55e]" onClick={onStartSync} aria-label="EntrenaSync">
          <Zap size={20} />
        </button>
        <div className="relative">
          <button type="button" onClick={() => setMenuOpen((v) => !v)} className="chat-wa-header-btn" aria-label="Más">
            <MoreVertical size={20} />
          </button>
          {menuOpen && (
            <div className="absolute top-full right-0 mt-1 w-44 rounded-xl bg-[#1C1C20] border border-[#2F2F35] shadow-lg z-30 py-1">
              <button type="button" onClick={() => { onShowReviewModal(); setMenuOpen(false) }} className="w-full text-left px-3 py-2 text-xs text-[#FF671F]">★ Marcar entreno</button>
              <button type="button" onClick={() => { onShowProfile(); setMenuOpen(false) }} className="w-full text-left px-3 py-2 text-xs text-white">Perfil</button>
              {!isDemoMode && (
                <button type="button" onClick={() => { void onRefreshChat(); setMenuOpen(false) }} className="w-full text-left px-3 py-2 text-xs text-[#FF671F]">Actualizar</button>
              )}
              <button type="button" onClick={() => { onReport(); setMenuOpen(false) }} className="w-full text-left px-3 py-2 text-xs text-red-400">Reportar</button>
              <button type="button" onClick={() => { void onBlock(); setMenuOpen(false) }} className="w-full text-left px-3 py-2 text-xs text-red-400">Bloquear</button>
            </div>
          )}
        </div>
      </header>

      {pactCompare && <ChatPactCompareStrip compare={pactCompare} onOpenEntrenoLog={onOpenEntrenoLog} />}

      {partnerMusic && (
        <div className="chat-wa-music-strip shrink-0">
          <NowPlayingBadge nowPlaying={partnerMusic} size="sm" />
        </div>
      )}

      <div ref={chatScrollRef} className="chat-wa-thread flex-1 min-h-0 overflow-y-auto overscroll-contain" id="chat-scroll">
        {chatMessages.length === 0 && !partnerTyping && (
          <div className="chat-wa-empty">
            <div className="chat-wa-empty-icon">💬</div>
            <p className="font-bold text-white">Canal de entreno</p>
            <p className="text-sm text-[#9CA3AF] max-w-[260px] mx-auto mt-1">
              Manda texto, foto o nota de voz. Propón un EntrenaSync cuando quieras.
            </p>
            {onOpenExplore && (
              <button type="button" onClick={onOpenExplore} className="mt-3 text-xs font-bold text-[#FF671F] underline">
                Buscar más partners →
              </button>
            )}
          </div>
        )}

        {messagesWithDividers.map(({ m, i, showDay, day, isGroupedWithPrev, isGroupedWithNext }) => {
          const isMe = m.from === 'me'
          const time = formatMsgTime(m.timestamp)
          const tailClass = isMe
            ? isGroupedWithNext ? 'chat-wa-bubble--sent-mid' : 'chat-wa-bubble--sent-last'
            : isGroupedWithNext ? 'chat-wa-bubble--recv-mid' : 'chat-wa-bubble--recv-last'

          return (
            <div key={m.id || i}>
              {showDay && (
                <div className="chat-day-divider"><span>{day}</span></div>
              )}
              <div className={`chat-wa-row ${isMe ? 'chat-wa-row--me' : 'chat-wa-row--them'} ${isGroupedWithPrev ? 'chat-wa-row--tight' : ''}`}>
                <div className={`chat-wa-bubble ${isMe ? 'chat-wa-bubble--sent' : 'chat-wa-bubble--recv'} ${tailClass}`}>
                  {m.workoutPreview && (
                    <div className="chat-wa-workout-share">
                      <WorkoutPostCard
                        preview={m.workoutPreview}
                        compact
                        onCopyRoutine={
                          !isMe && m.workoutId && onCopyWorkout
                            ? () => onCopyWorkout(m.workoutId!, m.workoutPreview?.title)
                            : undefined
                        }
                        copyLabel="Copiar rutina"
                        showReactions={false}
                      />
                    </div>
                  )}
                  {m.photoUrl && (
                    <button type="button" className="chat-wa-photo" onClick={() => setLightboxUrl(m.photoUrl!)}>
                      <img src={m.photoUrl} alt="Foto enviada" loading="lazy" />
                    </button>
                  )}
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
                      <span className="voice-duration">{m.voiceDuration || '?'}″</span>
                    </div>
                  ) : null}
                  {m.text && !m.workoutPreview ? (
                    <div className="chat-wa-text">{renderMessageText(m.text)}</div>
                  ) : null}
                  <div className="chat-wa-meta">
                    <time>{time}</time>
                    {isMe && <ChatMessageStatus message={m} />}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {partnerTyping && (
          <div className="chat-wa-row chat-wa-row--them">
            <div className="chat-wa-bubble chat-wa-bubble--recv chat-wa-bubble--recv-last px-3 py-2 flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="w-2 h-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
      </div>

      {attachOpen && (
        <div className="chat-wa-attach-panel">
          <button type="button" className="chat-wa-attach-item" onClick={() => { onPickPhoto(); setAttachOpen(false) }}>
            <span className="chat-wa-attach-icon chat-wa-attach-icon--photo"><Camera size={20} /></span>
            Foto
          </button>
          <button type="button" className="chat-wa-attach-item" onClick={() => { onStartVoiceRecording(); setAttachOpen(false) }}>
            <span className="chat-wa-attach-icon chat-wa-attach-icon--voice"><Mic size={20} /></span>
            Nota de voz{voiceStreak > 0 ? ` · ${voiceStreak}d` : ''}
          </button>
          {canShareWorkout && (
            <button type="button" className="chat-wa-attach-item" onClick={openShareWorkoutPicker}>
              <span className="chat-wa-attach-icon"><Sparkles size={20} /></span>
              Entreno
            </button>
          )}
          {icebreakers.slice(0, 2).map((tip) => (
            <button key={tip} type="button" className="chat-wa-attach-chip" onClick={() => { onSendMessage(tip); setAttachOpen(false) }}>
              {tip}
            </button>
          ))}
          {TRAINING_CHIPS.slice(0, 2).map((p) => (
            <button key={p} type="button" className="chat-wa-attach-chip" onClick={() => { onSendMessage(p.replace(/^[^\s]+\s/, '')); setAttachOpen(false) }}>
              {p}
            </button>
          ))}
          {syncBond && BOND_TEMPLATES.slice(0, 1).map((tpl) => (
            <button key={tpl} type="button" className="chat-wa-attach-chip chat-wa-attach-chip--bond" onClick={() => { onSendBondTemplate(tpl); setAttachOpen(false) }}>
              {tpl}
            </button>
          ))}
        </div>
      )}

      <ShareWorkoutPickerSheet
        open={shareWorkoutOpen}
        partnerName={chatProfile?.name}
        loading={loadingTodayWorkouts}
        workouts={todayWorkouts}
        onClose={() => setShareWorkoutOpen(false)}
        onLogNew={() => onOpenEntrenoLog?.()}
        onShareWorkout={(workout) => onShareWorkoutToChat?.(workout) ?? Promise.resolve()}
      />

      <footer className="chat-wa-composer">
        {pendingPhoto && !isUploadingPhoto && (
          <div className="chat-wa-pending-photo">
            <img src={pendingPhoto.url} alt="Vista previa" />
            <button type="button" onClick={onCancelPendingPhoto} className="chat-wa-pending-photo-x"><X size={16} /></button>
            <button type="button" onClick={onSendPendingPhoto} className="chat-wa-pending-photo-send">Enviar foto</button>
          </div>
        )}
        {isUploadingPhoto && (
          <div className="voice-uploading mb-2">
            <div className="label">SUBIENDO FOTO…</div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${photoUploadProgress || 12}%` }} /></div>
          </div>
        )}
        {pendingVoice && !isUploadingVoice && (
          <div className="chat-voice-ready">
            <button type="button" onClick={onPreviewPendingVoice} className="chat-voice-ready-play"><Play size={18} /></button>
            <div className="flex-1 min-w-0 text-[11px] text-[#9CA3AF]">{pendingVoice.duration}s de voz</div>
            <button type="button" onClick={onCancelPendingVoice} className="text-[9px] text-red-400 px-2">✕</button>
            <button type="button" onClick={onReRecordVoice} className="text-[9px] text-[#EAB308] px-2">Otra</button>
            <button type="button" onClick={onSendPendingVoice} className="chat-voice-send">Enviar</button>
          </div>
        )}
        {isUploadingVoice && (
          <div className="voice-uploading mb-2">
            <div className="label">ENVIANDO VOZ…</div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${voiceUploadProgress || 10}%` }} /></div>
            <button type="button" onClick={onCancelUpload} className="text-[9px] text-red-400 ml-1">cancelar</button>
          </div>
        )}

        <form onSubmit={onSubmitForm} className="chat-wa-composer-row">
          {isRecordingVoice ? (
            <div className="voice-recording flex-1">
              <div className="dot" />
              <div className="flex-1 text-xs text-red-400 tabular-nums">{recordingTime}s / 60</div>
              <div className="flex gap-0.5 items-end h-4">
                {recordingLevels.map((h, idx) => (
                  <div key={idx} className="w-[2px] bg-red-400 rounded" style={{ height: `${Math.max(3, h)}px` }} />
                ))}
              </div>
              <button type="button" onClick={onStopVoiceRecording} className="px-3 py-1 text-[10px] bg-red-600 text-white rounded-full font-bold">Listo</button>
              <button type="button" onClick={onCancelVoiceRecording} className="text-red-400 text-xl px-1">×</button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className={`chat-wa-composer-btn ${attachOpen ? 'active' : ''}`}
                onClick={() => setAttachOpen((v) => !v)}
                aria-label="Adjuntar"
              >
                <Paperclip size={20} />
              </button>
              <button type="button" className="chat-wa-composer-btn" onClick={onPickPhoto} aria-label="Cámara">
                <ImageIcon size={20} />
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Mensaje"
                className="chat-wa-input"
                value={chatInputValue}
                onChange={(e) => onChatInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (canSend) e.currentTarget.form?.requestSubmit()
                  }
                }}
              />
              {canSend ? (
                <button type="submit" className="chat-wa-send" aria-label="Enviar">
                  <Send size={18} />
                </button>
              ) : (
                <button type="button" className="chat-wa-composer-btn chat-wa-composer-btn--mic" onClick={onStartVoiceRecording} aria-label="Grabar voz">
                  <Mic size={20} />
                </button>
              )}
            </>
          )}
        </form>
      </footer>

      {lightboxUrl && (
        <div className="chat-wa-lightbox" onClick={() => setLightboxUrl(null)} role="dialog" aria-modal>
          <img src={lightboxUrl} alt="Foto ampliada" onClick={(e) => e.stopPropagation()} />
          <button type="button" className="chat-wa-lightbox-close" onClick={() => setLightboxUrl(null)}><X size={24} /></button>
        </div>
      )}
    </div>
  )
}
