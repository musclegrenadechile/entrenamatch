/**
 * Fase 80 — Feed filter UI state + global feed loader outside App.tsx.
 */

import { useCallback, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'
import type { Firestore } from 'firebase/firestore'
import type { Profile, ProfilePost } from '../types'
import { fetchGlobalProfilePosts } from '../services/profilePosts'

export interface UseFeedStateOptions {
  isDemoMode: boolean
  db: Firestore | null
  realProfiles: Profile[]
  setProfilePosts: Dispatch<SetStateAction<Record<string, ProfilePost[]>>>
  loadProfilePostsRef: RefObject<
    ((userId: string) => Promise<ProfilePost[] | undefined>) | null
  >
  setLastSync: Dispatch<SetStateAction<Date | null>>
}

export function useFeedState({
  isDemoMode,
  db,
  realProfiles,
  setProfilePosts,
  loadProfilePostsRef,
  setLastSync,
}: UseFeedStateOptions) {
  const [isLoadingFeed, setIsLoadingFeed] = useState(false)
  const [feedShowPinnedOnly, setFeedShowPinnedOnly] = useState(false)
  const [feedSearch, setFeedSearch] = useState('')
  const [feedOnlyReal, setFeedOnlyReal] = useState(false)
  const [feedOnlyLive, setFeedOnlyLive] = useState(false)
  const [feedMaxProfiles, setFeedMaxProfiles] = useState(15)
  const [feedDisplayLimit, setFeedDisplayLimit] = useState(10)
  const [hasMoreGlobalFeed, setHasMoreGlobalFeed] = useState(true)
  const globalFeedLastDocRef = useRef<unknown>(null)

  const [feedPhotoModal, setFeedPhotoModal] = useState<{ url: string; postId?: string } | null>(
    null
  )
  const [feedReactions, setFeedReactions] = useState<Record<string, Record<string, number>>>({})
  const [showFeedPostModal, setShowFeedPostModal] = useState(false)
  const [feedPostText, setFeedPostText] = useState('')
  const [feedPostPhoto, setFeedPostPhoto] = useState<string | null>(null)
  const [feedPhotoUploading, setFeedPhotoUploading] = useState(false)
  const [feedPhotoUploadProgress, setFeedPhotoUploadProgress] = useState(0)
  const [recentlyPublishedPostId, setRecentlyPublishedPostId] = useState<string | null>(null)
  const [feedPublishing, setFeedPublishing] = useState(false)
  const [showFeedPublishSuccess, setShowFeedPublishSuccess] = useState(false)

  const loadGlobalFeed = useCallback(
    async (more = false) => {
      setIsLoadingFeed(true)
      try {
        if (!isDemoMode && db) {
          const { posts, lastDoc, hasMore } = await fetchGlobalProfilePosts(db, {
            pageSize: 25,
            lastDoc: more ? globalFeedLastDocRef.current : null,
          })
          if (!more) globalFeedLastDocRef.current = null
          globalFeedLastDocRef.current = lastDoc
          setHasMoreGlobalFeed(hasMore)

          setProfilePosts((prev) => {
            const next = { ...prev }
            for (const post of posts) {
              const uid = post.userId
              const existing = next[uid] || []
              const merged = [...existing.filter((x) => x.id !== post.id), post].sort(
                (a, b) => b.timestamp - a.timestamp
              )
              next[uid] = merged.slice(0, 30)
            }
            return next
          })
        } else {
          const max = more ? Math.min(feedMaxProfiles + 10, realProfiles.length) : feedMaxProfiles
          if (more) setFeedMaxProfiles(max)
          const toLoad = realProfiles.slice(0, max)
          await Promise.all(
            toLoad.map((p) => loadProfilePostsRef.current?.(p.id).catch(() => undefined) ?? Promise.resolve())
          )
        }
        setLastSync(new Date())
      } catch (e) {
        console.warn('loadGlobalFeed error', e)
        if (realProfiles.length) {
          const toLoad = realProfiles.slice(0, feedMaxProfiles)
          await Promise.all(
            toLoad.map((p) => loadProfilePostsRef.current?.(p.id).catch(() => undefined) ?? Promise.resolve())
          )
        }
      } finally {
        setIsLoadingFeed(false)
      }
    },
    [
      isDemoMode,
      db,
      realProfiles,
      feedMaxProfiles,
      setProfilePosts,
      loadProfilePostsRef,
      setLastSync,
    ]
  )

  return {
    isLoadingFeed,
    feedShowPinnedOnly,
    setFeedShowPinnedOnly,
    feedSearch,
    setFeedSearch,
    feedOnlyReal,
    setFeedOnlyReal,
    feedOnlyLive,
    setFeedOnlyLive,
    feedMaxProfiles,
    setFeedMaxProfiles,
    feedDisplayLimit,
    setFeedDisplayLimit,
    hasMoreGlobalFeed,
    feedPhotoModal,
    setFeedPhotoModal,
    feedReactions,
    setFeedReactions,
    showFeedPostModal,
    setShowFeedPostModal,
    feedPostText,
    setFeedPostText,
    feedPostPhoto,
    setFeedPostPhoto,
    feedPhotoUploading,
    setFeedPhotoUploading,
    feedPhotoUploadProgress,
    setFeedPhotoUploadProgress,
    recentlyPublishedPostId,
    setRecentlyPublishedPostId,
    feedPublishing,
    setFeedPublishing,
    showFeedPublishSuccess,
    setShowFeedPublishSuccess,
    loadGlobalFeed,
  }
}
