/**
 * Chat typing + read receipts (Firestore ephemeral typing, message readAt).
 */

import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore'

const TYPING_TTL_MS = 8000

export function typingDocPath(chatPartnerId: string, myUid: string): string {
  const pair = [myUid, chatPartnerId].sort().join('_')
  return `typing_${pair}_${myUid}`
}

export async function setChatTyping(
  db: Firestore,
  myUid: string,
  partnerId: string,
  typing: boolean
): Promise<void> {
  const ref = doc(db, 'chatTyping', typingDocPath(partnerId, myUid))
  if (!typing) {
    await updateDoc(ref, { active: false, updatedAt: Date.now() }).catch(() => {})
    return
  }
  await setDoc(ref, {
    userId: myUid,
    partnerId,
    active: true,
    expiresAt: Date.now() + TYPING_TTL_MS,
    updatedAt: Date.now(),
  })
}

export function attachPartnerTypingListener(
  db: Firestore,
  myUid: string,
  partnerId: string,
  onTyping: (typing: boolean) => void
): () => void {
  const ref = doc(db, 'chatTyping', typingDocPath(myUid, partnerId))
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onTyping(false)
        return
      }
      const d = snap.data()
      const active = d.active === true && Number(d.expiresAt) > Date.now()
      onTyping(active)
    },
    () => onTyping(false)
  )
}

export async function markDirectMessageRead(
  db: Firestore,
  messageId: string,
  myUid: string
): Promise<void> {
  const ref = doc(db, 'messages', messageId)
  await updateDoc(ref, {
    readAt: Date.now(),
    read: true,
    readBy: myUid,
  }).catch(() => {})
}
