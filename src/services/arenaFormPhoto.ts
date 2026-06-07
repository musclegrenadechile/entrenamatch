/**
 * Arena form photo — capture, upload, timeline action, post to wall.
 */

import type { Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'

export async function pickArenaPhotoDataUrl(
  getNativePhoto: () => Promise<string | null>,
  pickWebFile: () => Promise<string | null>
): Promise<string | null> {
  const native = await getNativePhoto()
  if (native) return native
  return pickWebFile()
}

export async function uploadArenaPhotoUrl(
  storage: FirebaseStorage,
  uid: string,
  dataUrl: string
): Promise<string> {
  const { ref, uploadString, getDownloadURL } = await import('firebase/storage')
  const path = `posts/${uid}/arena-${Date.now()}.jpg`
  const storageRef = ref(storage, path)
  const snap = await uploadString(storageRef, dataUrl, 'data_url')
  return getDownloadURL(snap.ref)
}

export async function postPartnerSyncStory(
  db: Firestore,
  partnerId: string,
  text: string,
  photoUrl?: string
): Promise<void> {
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(db, 'profilePosts', `post_arena_${Date.now()}_${partnerId.slice(0, 6)}`), {
    userId: partnerId,
    text,
    photo: photoUrl || null,
    timestamp: Date.now(),
    pinned: false,
    isSyncStory: true,
    likes: [],
    comments: [],
    reactions: {},
  })
}
