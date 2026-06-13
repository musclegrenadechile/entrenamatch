/**
 * Swipe deck exclusion state — demo localStorage + Firestore profile arrays in real mode.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Firestore } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import {
  clearSwipeDeckForUser,
  loadSwipeStateForUser,
  syncLikeToProfileDeck,
  syncPassToProfileDeck,
} from '../services/swipeState'

export function useSwipeDeck(
  opts: {
    isDemoMode: boolean
    db: Firestore | null | undefined
    firebaseUser: User | null | undefined
  }
) {
  const { isDemoMode, db, firebaseUser } = opts
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [passedIds, setPassedIds] = useState<string[]>([])
  const [isResettingDeck, setIsResettingDeck] = useState(false)
  const loadTokenRef = useRef(0)

  useEffect(() => {
    if (isDemoMode) {
      try {
        const savedLiked = localStorage.getItem('fitvina_liked')
        const savedPassed = localStorage.getItem('fitvina_passed')
        if (savedLiked) setLikedIds(JSON.parse(savedLiked))
        if (savedPassed) setPassedIds(JSON.parse(savedPassed))
      } catch {}
      return
    }
    if (!firebaseUser?.uid || !db) return

    const token = ++loadTokenRef.current
    let cancelled = false
    ;(async () => {
      try {
        await firebaseUser.getIdToken()
        const { liked, passed } = await loadSwipeStateForUser(db, firebaseUser.uid)
        if (cancelled || token !== loadTokenRef.current) return
        setLikedIds(liked)
        setPassedIds(passed)
      } catch (e) {
        console.warn('Could not load swipe state from Firestore', e)
      }
    })()
    return () => { cancelled = true }
  }, [firebaseUser?.uid, isDemoMode, db])

  const saveLiked = useCallback(
    (ids: string[]) => {
      if (isDemoMode) {
        try {
          localStorage.setItem('fitvina_liked', JSON.stringify(ids))
        } catch {
          /* ignore */
        }
      } else if (db && firebaseUser?.uid) {
        const prev = likedIds
        const added = ids.filter((id) => !prev.includes(id))
        for (const id of added) {
          void syncLikeToProfileDeck(db, firebaseUser.uid, id).catch(() => {})
        }
      }
      setLikedIds(ids)
    },
    [isDemoMode, db, firebaseUser?.uid, likedIds]
  )

  const savePassed = useCallback(
    (ids: string[]) => {
      if (isDemoMode) {
        try {
          localStorage.setItem('fitvina_passed', JSON.stringify(ids))
        } catch {
          /* ignore */
        }
      } else if (db && firebaseUser?.uid) {
        const prev = passedIds
        const added = ids.filter((id) => !prev.includes(id))
        for (const id of added) {
          void syncPassToProfileDeck(db, firebaseUser.uid, id).catch(() => {})
        }
      }
      setPassedIds(ids)
    },
    [isDemoMode, db, firebaseUser?.uid, passedIds]
  )

  const resetDeck = useCallback(async (): Promise<{ clearedSwipes: number }> => {
    const clearedSwipes = likedIds.length + passedIds.length
    loadTokenRef.current += 1
    setIsResettingDeck(true)
    setLikedIds([])
    setPassedIds([])
    if (isDemoMode) {
      try {
        localStorage.removeItem('fitvina_liked')
        localStorage.removeItem('fitvina_passed')
      } catch { /* ignore */ }
      setIsResettingDeck(false)
      return { clearedSwipes }
    }
    if (db && firebaseUser?.uid) {
      try {
        await clearSwipeDeckForUser(db, firebaseUser.uid)
      } catch (e) {
        console.warn('clearSwipeDeckForUser failed', e)
        throw e
      } finally {
        setIsResettingDeck(false)
      }
      return { clearedSwipes }
    }
    setIsResettingDeck(false)
    return { clearedSwipes }
  }, [likedIds.length, passedIds.length, isDemoMode, db, firebaseUser?.uid])

  return {
    likedIds,
    passedIds,
    isResettingDeck,
    setLikedIds,
    setPassedIds,
    saveLiked,
    savePassed,
    resetDeck,
  }
}
