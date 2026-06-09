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
): Promise<boolean> {
  const { getDoc } = await import('firebase/firestore')
  const ref = doc(db, 'messages', messageId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return false
  const data = snap.data()
  if (data.to !== myUid || data.read === true) return true
  try {
    await updateDoc(ref, {
      readAt: Date.now(),
      read: true,
      readBy: myUid,
    })
    return true
  } catch (e) {
    console.warn('[ChatPresence] markDirectMessageRead failed', messageId, e)
    return false
  }
}

/** Mark all unread messages from partner as read (batch on open chat or after reply). */
export async function markPartnerThreadRead(
  db: Firestore,
  myUid: string,
  partnerId: string
): Promise<number> {
  const { collection, query, where, getDocs, writeBatch } = await import('firebase/firestore')
  const q = query(
    collection(db, 'messages'),
    where('from', '==', partnerId),
    where('to', '==', myUid)
  )
  const snap = await getDocs(q)
  if (snap.empty) return 0

  const batch = writeBatch(db)
  const now = Date.now()
  let pending = 0
  snap.forEach((docSnap) => {
    const data = docSnap.data()
    if (data.read === true) return
    batch.update(docSnap.ref, { read: true, readAt: now, readBy: myUid })
    pending++
  })
  if (pending === 0) return 0
  try {
    await batch.commit()
    return pending
  } catch (e) {
    console.warn('[ChatPresence] markPartnerThreadRead failed', partnerId, e)
    return 0
  }
}
