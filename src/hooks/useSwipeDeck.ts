/**
 * Swipe deck exclusion state — demo localStorage + Firestore profile arrays in real mode.
 */

import { useState, useEffect, useCallback } from 'react'
import type { Firestore } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { clearSwipeDeckForUser, loadSwipeStateForUser } from '../services/swipeState'

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

    let cancelled = false
    ;(async () => {
      try {
        await firebaseUser.getIdToken()
        const { liked, passed } = await loadSwipeStateForUser(db, firebaseUser.uid)
        if (cancelled) return
        setLikedIds(liked)
        setPassedIds(passed)
      } catch (e) {
        console.warn('Could not load swipe state from Firestore', e)
      }
    })()
    return () => { cancelled = true }
  }, [firebaseUser?.uid, isDemoMode, db])

  const saveLiked = useCallback((ids: string[]) => {
    if (isDemoMode) {
      try { localStorage.setItem('fitvina_liked', JSON.stringify(ids)) } catch {}
    }
    setLikedIds(ids)
  }, [isDemoMode])

  const savePassed = useCallback((ids: string[]) => {
    if (isDemoMode) {
      try { localStorage.setItem('fitvina_passed', JSON.stringify(ids)) } catch {}
    }
    setPassedIds(ids)
  }, [isDemoMode])

  const resetDeck = useCallback(() => {
    saveLiked([])
    savePassed([])
    if (!isDemoMode && db && firebaseUser?.uid) {
      void clearSwipeDeckForUser(db, firebaseUser.uid).catch((e) =>
        console.warn('clearSwipeDeckForUser failed', e)
      )
    }
  }, [saveLiked, savePassed, isDemoMode, db, firebaseUser?.uid])

  return {
    likedIds,
    passedIds,
    setLikedIds,
    setPassedIds,
    saveLiked,
    savePassed,
    resetDeck,
  }
}
