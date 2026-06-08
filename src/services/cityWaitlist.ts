import type { Firestore } from 'firebase/firestore'

const LOCAL_KEY = 'entrenamatch_city_waitlist'

export type CityWaitlistEntry = {
  email: string
  city: string
  comuna?: string
  createdAt: number
}

export function getLocalWaitlistEntry(): CityWaitlistEntry | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as CityWaitlistEntry) : null
  } catch {
    return null
  }
}

export async function saveCityWaitlist(
  email: string,
  city: string,
  opts?: { comuna?: string; db?: Firestore | null; uid?: string | null }
): Promise<void> {
  const entry: CityWaitlistEntry = {
    email: email.trim().toLowerCase(),
    city: city.trim(),
    comuna: opts?.comuna?.trim(),
    createdAt: Date.now(),
  }
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entry))
  } catch {
    /* ignore */
  }

  if (opts?.db) {
    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
      await addDoc(collection(opts.db, 'cityWaitlist'), {
        ...entry,
        uid: opts.uid || null,
        createdAt: serverTimestamp(),
      })
    } catch (e) {
      console.warn('[cityWaitlist] Firestore write failed', e)
    }
  }
}
