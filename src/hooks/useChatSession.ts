/**
 * Fase 79 — 1:1 chat state, Firestore listeners, send/load outside App.tsx.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import type { Firestore } from 'firebase/firestore'
import { toast } from 'sonner'
import type { Message, Profile } from '../types'
import { attachDirectChatListener, type DirectChatMsg } from '../services/chatMessages'
import { attachPartnerTypingListener, markDirectMessageRead } from '../services/chatPresence'
import { isQuotaError, reclaimLocalStorageSpace } from '../utils/safeLocalStorage'

export interface UseChatSessionOptions {
  isDemoMode: boolean
  db: Firestore | null
  firebaseUserUid: string | null | undefined
  realProfiles: Profile[]
  SEED_PROFILES: Profile[]
  latestRealProfilesRef: RefObject<Profile[]>
  chatScrollRef: RefObject<HTMLDivElement | null>
  setLastSync: Dispatch<SetStateAction<Date | null>>
  addNotification: RefObject<
    (n: { type: string; title: string; body: string; relatedId?: string }) => void
  >
  onIncomingMessageRef: RefObject<
    ((matchId: string, name: string, text: string, photo?: string) => void) | null
  >
  onLoadProfilePostsRef: RefObject<((userId: string) => Promise<unknown>) | null>
  initialMessages?: Record<string, Message[]>
  initialMatches?: string[]
  initialUnreads?: Record<string, number>
}

export function useChatSession(opts: UseChatSessionOptions) {
  const {
    isDemoMode,
    db,
    firebaseUserUid,
    realProfiles,
    SEED_PROFILES,
    latestRealProfilesRef,
    chatScrollRef,
    setLastSync,
    addNotification,
    onIncomingMessageRef,
    onLoadProfilePostsRef,
    initialMessages = {},
    initialMatches = [],
    initialUnreads = {},
  } = opts

  const [matches, setMatches] = useState<string[]>(initialMatches)
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages)
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [realMatches, setRealMatches] = useState<string[]>([])
  const [realChatMessages, setRealChatMessages] = useState<DirectChatMsg[]>([])
  const [chatUnreads, setChatUnreads] = useState<Record<string, number>>(initialUnreads)
  const [chatPartnerTyping, setChatPartnerTyping] = useState(false)

  const realChatUnsubsRef = useRef<Record<string, () => void>>({})
  const currentActiveChatRef = useRef<string | null>(null)
  const seenChatMsgIdsRef = useRef<Record<string, Set<string>>>({})
  const prevRealMatchesRef = useRef<string[]>([])
  const realMatchesInitializedRef = useRef(false)
  const justMatchedLocallyRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    currentActiveChatRef.current = activeChat || null
  }, [activeChat])

  const persistSeen = useCallback(() => {
    try {
      const chatObj: Record<string, string[]> = {}
      Object.keys(seenChatMsgIdsRef.current).forEach((k) => {
        chatObj[k] = Array.from(seenChatMsgIdsRef.current[k])
      })
      localStorage.setItem('entrenamatch_seen_chat_msgs', JSON.stringify(chatObj))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('entrenamatch_chat_unreads', JSON.stringify(chatUnreads))
  }, [chatUnreads])

  const isRealChatId = useCallback(
    (chatId: string | null): boolean => {
      if (!chatId || isDemoMode || !firebaseUserUid) return false
      if (chatId.startsWith('p')) return true
      const isKnownRealProfile = realProfiles.some((r) => r.id === chatId)
      return realMatches.includes(chatId) || isKnownRealProfile
    },
    [isDemoMode, firebaseUserUid, realProfiles, realMatches]
  )

  const loadRealMatches = useCallback(async () => {
    if (isDemoMode || !firebaseUserUid || !db) return []

    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore')
      const matchesRef = collection(db, 'matches')
      const q1 = query(matchesRef, where('user1', '==', firebaseUserUid))
      const q2 = query(matchesRef, where('user2', '==', firebaseUserUid))
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])

      const matchedUserIds = new Set<string>()
      snap1.forEach((d) => {
        const data = d.data() as { user2?: string }
        if (data.user2 && data.user2 !== firebaseUserUid) matchedUserIds.add(data.user2)
      })
      snap2.forEach((d) => {
        const data = d.data() as { user1?: string }
        if (data.user1 && data.user1 !== firebaseUserUid) matchedUserIds.add(data.user1)
      })

      const ids = Array.from(matchedUserIds)
      if (realMatchesInitializedRef.current) {
        const prev = prevRealMatchesRef.current
        for (const id of ids) {
          if (prev.includes(id) || justMatchedLocallyRef.current.has(id)) {
            if (justMatchedLocallyRef.current.has(id)) justMatchedLocallyRef.current.delete(id)
            continue
          }
          const prof = (latestRealProfilesRef.current || []).find((p) => p.id === id)
          addNotification.current({
            type: 'match',
            title: '¡Nuevo Match!',
            body: `Hiciste match con ${prof?.name || 'un GymPartner'}`,
            relatedId: id,
          })
          toast.success(`¡Match con ${prof?.name || 'un GymPartner'}!`, {
            description: 'Ambos se dieron like — ya pueden chatear',
          })
        }
      }
      realMatchesInitializedRef.current = true
      prevRealMatchesRef.current = ids
      setRealMatches(ids)
      ids.slice(0, 6).forEach((id) => {
        onLoadProfilePostsRef.current?.(id).catch(() => {})
      })
      return ids
    } catch (e) {
      console.warn('Could not load real matches yet:', e)
      return []
    }
  }, [
    isDemoMode,
    firebaseUserUid,
    db,
    latestRealProfilesRef,
    addNotification,
    onLoadProfilePostsRef,
  ])

  const loadRealChatMessages = useCallback(
    async (otherUserId: string) => {
      if (!db || !firebaseUserUid) return null
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore')
        const messagesRef = collection(db, 'messages')
        const q1 = query(messagesRef, where('from', '==', firebaseUserUid), where('to', '==', otherUserId))
        const q2 = query(messagesRef, where('from', '==', otherUserId), where('to', '==', firebaseUserUid))
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])

        const msgs: DirectChatMsg[] = []
        snap1.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>
          msgs.push({
            id: docSnap.id,
            from: 'me',
            text: String(data.text || ''),
            timestamp: Number(data.timestamp) || Date.now(),
            voiceUrl: data.voiceUrl as string | undefined,
            voiceDuration: data.voiceDuration as number | undefined,
          })
        })
        snap2.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>
          msgs.push({
            id: docSnap.id,
            from: 'them',
            text: String(data.text || ''),
            timestamp: Number(data.timestamp) || Date.now(),
            voiceUrl: data.voiceUrl as string | undefined,
            voiceDuration: data.voiceDuration as number | undefined,
          })
        })
        msgs.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
        setMessages((prev) => {
          const updated = { ...prev, [otherUserId]: msgs as unknown as Message[] }
          if (isDemoMode) {
            localStorage.setItem('fitvina_messages', JSON.stringify(updated))
          }
          return updated
        })
        setLastSync(new Date())
        if (currentActiveChatRef.current === otherUserId) {
          setRealChatMessages(msgs)
          setChatUnreads((prev) => {
            const c = { ...prev }
            c[otherUserId] = 0
            return c
          })
        }
        return msgs
      } catch (e) {
        console.warn('Could not load real chat messages:', e)
        return null
      }
    },
    [db, firebaseUserUid, isDemoMode, setLastSync]
  )

  const sendRealMessage = useCallback(
    async (
      text: string,
      toUserId: string,
      voice?: { voiceUrl: string; voiceDuration: number } | null
    ) => {
      if ((!text.trim() && !voice) || !firebaseUserUid || !db) return

      const writeMessage = async () => {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
        const msg: Record<string, unknown> = {
          from: firebaseUserUid,
          to: toUserId,
          text: text.trim() || '',
          timestamp: Date.now(),
          createdAt: serverTimestamp(),
        }
        if (voice) {
          msg.voiceUrl = voice.voiceUrl
          msg.voiceDuration = voice.voiceDuration
        }
        await addDoc(collection(db, 'messages'), msg)
      }

      try {
        await writeMessage()
        loadRealChatMessages(toUserId).then((msgs) => {
          if (msgs) setRealChatMessages(msgs)
        })
        setChatUnreads((prev) => {
          const c = { ...prev }
          c[toUserId] = 0
          return c
        })
      } catch (e) {
        if (isQuotaError(e)) {
          reclaimLocalStorageSpace('hard')
          try {
            await writeMessage()
            loadRealChatMessages(toUserId).then((msgs) => {
              if (msgs) setRealChatMessages(msgs)
            })
            setChatUnreads((prev) => {
              const c = { ...prev }
              c[toUserId] = 0
              return c
            })
            toast.success('Mensaje enviado', { description: 'Liberamos espacio en el navegador.' })
            return
          } catch (retryErr) {
            console.error('Failed to send after storage reclaim:', retryErr)
          }
        }
        console.error('Failed to send real message:', e)
        toast.error('No se pudo enviar el mensaje', {
          description: isQuotaError(e)
            ? 'Almacenamiento del navegador lleno. Borra datos del sitio en ajustes o cierra otras pestañas.'
            : 'Revisa tu conexión e intenta de nuevo.',
        })
      }
    },
    [firebaseUserUid, db, loadRealChatMessages]
  )

  const applyDirectChatMessages = useCallback(
    (otherUserId: string, msgs: DirectChatMsg[]) => {
      setMessages((prev) => {
        const updated = { ...prev, [otherUserId]: msgs as unknown as Message[] }
        if (isDemoMode) {
          try {
            localStorage.setItem('fitvina_messages', JSON.stringify(updated))
          } catch {}
        }
        return updated
      })
      if (currentActiveChatRef.current === otherUserId) {
        setRealChatMessages(msgs)
        setChatUnreads((prev) => {
          const c = { ...prev }
          c[otherUserId] = 0
          return c
        })
      }
      setLastSync(new Date())
    },
    [isDemoMode, setLastSync]
  )

  useEffect(() => {
    if (isDemoMode || !firebaseUserUid || !db) return undefined

    const myMatchIds = realMatches || []
    Object.keys(realChatUnsubsRef.current).forEach((id) => {
      if (!myMatchIds.includes(id)) {
        try {
          realChatUnsubsRef.current[id]?.()
        } catch {}
        delete realChatUnsubsRef.current[id]
      }
    })

    myMatchIds.forEach((matchId) => {
      if (realChatUnsubsRef.current[matchId]) return
      realChatUnsubsRef.current[matchId] = attachDirectChatListener(db, firebaseUserUid, matchId, {
        onMessages: (msgs) => applyDirectChatMessages(matchId, msgs),
        onIncoming: (msg) => {
          if (!seenChatMsgIdsRef.current[matchId]) seenChatMsgIdsRef.current[matchId] = new Set()
          if (seenChatMsgIdsRef.current[matchId].has(msg.id)) return
          seenChatMsgIdsRef.current[matchId].add(msg.id)
          persistSeen()
          if (currentActiveChatRef.current === matchId) return
          const prof =
            (realProfiles || []).find((p) => p.id === matchId) ||
            SEED_PROFILES.find((p) => p.id === matchId)
          onIncomingMessageRef.current?.(
            matchId,
            prof?.name || 'Usuario',
            msg.text,
            prof?.photos?.[0]
          )
        },
        onError: (err) => console.warn(`1:1 chat listener error for ${matchId}:`, err),
      })
    })

    return undefined
  }, [
    realMatches,
    isDemoMode,
    firebaseUserUid,
    db,
    applyDirectChatMessages,
    realProfiles,
    SEED_PROFILES,
    onIncomingMessageRef,
    persistSeen,
  ])

  useEffect(() => {
    return () => {
      Object.values(realChatUnsubsRef.current).forEach((u) => {
        try {
          u()
        } catch {}
      })
      realChatUnsubsRef.current = {}
    }
  }, [isDemoMode, firebaseUserUid])

  useEffect(() => {
    loadRealMatches()
  }, [firebaseUserUid, isDemoMode, loadRealMatches])

  useEffect(() => {
    if (!isDemoMode && firebaseUserUid) {
      const interval = setInterval(() => loadRealMatches(), 30000)
      return () => clearInterval(interval)
    }
    return undefined
  }, [isDemoMode, firebaseUserUid, loadRealMatches])

  useEffect(() => {
    if (isDemoMode || !firebaseUserUid || !db) return
    let unsubs: (() => void)[] = []
    ;(async () => {
      try {
        const { collection, query, where, onSnapshot } = await import('firebase/firestore')
        const matchesRef = collection(db, 'matches')
        const q1 = query(matchesRef, where('user1', '==', firebaseUserUid))
        const q2 = query(matchesRef, where('user2', '==', firebaseUserUid))
        const reloadMatches = () => loadRealMatches()
        unsubs = [
          onSnapshot(q1, reloadMatches, (e) => console.warn('matches listener q1', e)),
          onSnapshot(q2, reloadMatches, (e) => console.warn('matches listener q2', e)),
        ]
      } catch (e) {
        console.warn('matches onSnapshot setup error', e)
      }
    })()
    return () => {
      unsubs.forEach((u) => u())
    }
  }, [isDemoMode, firebaseUserUid, db, loadRealMatches])

  useEffect(() => {
    if (!activeChat || isDemoMode || !firebaseUserUid || !db) return
    if (!isRealChatId(activeChat)) return
    loadRealMatches().catch(() => {})
  }, [activeChat, isDemoMode, firebaseUserUid, db, isRealChatId, loadRealMatches])

  useEffect(() => {
    if (!activeChat || isDemoMode || !firebaseUserUid || !db) {
      setRealChatMessages([])
    }
  }, [activeChat, isDemoMode, firebaseUserUid, db])

  useEffect(() => {
    const scrollToBottom = () => {
      const el = chatScrollRef.current
      if (el) {
        const doScroll = () => {
          el.scrollTop = el.scrollHeight
        }
        requestAnimationFrame(doScroll)
        requestAnimationFrame(() => requestAnimationFrame(doScroll))
        setTimeout(doScroll, 50)
        setTimeout(doScroll, 150)
        setTimeout(doScroll, 350)
      }
    }
    scrollToBottom()
  }, [activeChat, realChatMessages.length, messages[activeChat || '']?.length, chatScrollRef])

  useEffect(() => {
    if (isDemoMode || !db || !firebaseUserUid || !activeChat) {
      setChatPartnerTyping(false)
      return undefined
    }
    return attachPartnerTypingListener(db, firebaseUserUid, activeChat, setChatPartnerTyping)
  }, [isDemoMode, db, firebaseUserUid, activeChat])

  useEffect(() => {
    if (isDemoMode || !db || !activeChat) return
    const msgs = realChatMessages.length > 0 ? realChatMessages : messages[activeChat] || []
    for (const m of msgs) {
      if (m.from === 'them' && m.id && !(m as Message & { read?: boolean }).read && !(m as Message & { readAt?: number }).readAt) {
        void markDirectMessageRead(db, m.id)
      }
    }
  }, [isDemoMode, db, activeChat, realChatMessages, messages])

  const totalChatUnreads = useMemo(
    () => Object.values(chatUnreads).reduce((sum, n) => sum + (n || 0), 0),
    [chatUnreads]
  )

  const saveMessages = useCallback(
    (msgs: Record<string, Message[]>) => {
      if (isDemoMode) localStorage.setItem('fitvina_messages', JSON.stringify(msgs))
      setMessages(msgs)
    },
    [isDemoMode]
  )

  const saveMatches = useCallback(
    (ids: string[]) => {
      if (isDemoMode) localStorage.setItem('fitvina_matches', JSON.stringify(ids))
      setMatches(ids)
    },
    [isDemoMode]
  )

  const clearChatOnLogout = useCallback(() => {
    setMatches([])
    setMessages({})
    setRealChatMessages([])
    setRealMatches([])
    setActiveChat(null)
    setChatUnreads({})
    seenChatMsgIdsRef.current = {}
    realMatchesInitializedRef.current = false
    prevRealMatchesRef.current = []
  }, [])

  return {
    matches,
    setMatches,
    messages,
    setMessages,
    activeChat,
    setActiveChat,
    realMatches,
    setRealMatches,
    realChatMessages,
    setRealChatMessages,
    chatUnreads,
    setChatUnreads,
    chatPartnerTyping,
    totalChatUnreads,
    isRealChatId,
    sendRealMessage,
    loadRealChatMessages,
    loadRealMatches,
    saveMessages,
    saveMatches,
    seenChatMsgIdsRef,
    justMatchedLocallyRef,
    clearChatOnLogout,
    persistSeen,
  }
}
