import { useCallback, useEffect, useRef, useState } from 'react'

export type ChatVoiceMessage = {
  id: string
  voiceUrl?: string
}

export type UseChatVoicePlayerOptions = {
  onHaptic?: (kind: 'light' | 'medium') => void
}

/**
 * Shared voice-note playback for 1:1 ChatView and group session chat (fase 349).
 */
export function useChatVoicePlayer(opts?: UseChatVoicePlayerOptions) {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)
  const [voicePlayProgress, setVoicePlayProgress] = useState(0)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  const stopVoice = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause()
      } catch {
        /* ignore */
      }
      currentAudioRef.current = null
    }
    setPlayingVoiceId(null)
    setVoicePlayProgress(0)
  }, [])

  const toggleVoicePlay = useCallback(
    (msg: ChatVoiceMessage) => {
      if (!msg.voiceUrl || msg.voiceUrl.startsWith('blob:')) return
      try {
        opts?.onHaptic?.(playingVoiceId === msg.id ? 'light' : 'medium')
      } catch {
        /* ignore */
      }
      if (playingVoiceId === msg.id) {
        stopVoice()
        return
      }
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause()
        } catch {
          /* ignore */
        }
        currentAudioRef.current = null
      }
      setPlayingVoiceId(msg.id)
      setVoicePlayProgress(0)
      const audio = new Audio(msg.voiceUrl)
      currentAudioRef.current = audio
      audio.onended = () => stopVoice()
      audio.ontimeupdate = () => {
        if (audio.duration > 0) {
          setVoicePlayProgress(Math.min(100, (audio.currentTime / audio.duration) * 100))
        }
      }
      audio.play().catch(() => stopVoice())
    },
    [playingVoiceId, stopVoice, opts]
  )

  useEffect(() => () => stopVoice(), [stopVoice])

  return {
    playingVoiceId,
    voicePlayProgress,
    currentAudioRef,
    toggleVoicePlay,
    stopVoice,
  }
}
