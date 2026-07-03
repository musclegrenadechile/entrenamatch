import type { PluginListenerHandle } from '@capacitor/core'

type SpeechRecognitionCtor = new () => SpeechRecognition

export type WebSpeechSession = {
  stop: () => Promise<string>
  abort: () => void
}

export function usesWebSpeechRecognition(): boolean {
  if (typeof window === 'undefined') return false
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition)
}

export function startWebSpeechRecognition(onPartial: (text: string) => void): WebSpeechSession {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
  if (!Ctor) throw new Error('UNSUPPORTED')

  const recognition = new Ctor()
  recognition.lang = 'es-CL'
  recognition.interimResults = true
  recognition.continuous = true
  recognition.maxAlternatives = 1

  const finalParts: string[] = []
  let interim = ''

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const chunk = result[0]?.transcript?.trim() || ''
      if (!chunk) continue
      if (result.isFinal) finalParts.push(chunk)
      else interim += `${chunk} `
    }
    const combined = [...finalParts, interim.trim()].filter(Boolean).join(' ').trim()
    if (combined) onPartial(combined)
  }

  recognition.onerror = () => {
    /* partial/final may still be usable on stop */
  }

  recognition.start()

  return {
    stop: () =>
      new Promise<string>((resolve) => {
        const finish = () => {
          const transcript = [...finalParts, interim.trim()].filter(Boolean).join(' ').trim()
          resolve(transcript)
        }
        recognition.onend = () => finish()
        try {
          recognition.stop()
        } catch {
          finish()
        }
        setTimeout(finish, 1200)
      }),
    abort: () => {
      try {
        recognition.abort()
      } catch {
        /* ignore */
      }
    },
  }
}

export type NativeSpeechPartialListener = PluginListenerHandle | null
