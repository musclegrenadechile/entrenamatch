import type { Firestore } from 'firebase/firestore'

/** Fase 105 — FCM token por usuario en colección dedicada. */
export async function saveUserPushToken(
  db: Firestore,
  uid: string,
  token: string
): Promise<void> {
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  await setDoc(
    doc(db, 'userPushTokens', uid),
    {
      token,
      platform: typeof (window as unknown as { Capacitor?: unknown }).Capacitor !== 'undefined'
        ? 'native'
        : 'web',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
