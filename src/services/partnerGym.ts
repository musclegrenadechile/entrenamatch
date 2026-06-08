import type { Firestore } from 'firebase/firestore'
import { toLocalDateStr } from '../utils/fuelCalculator'

export interface PartnerGymCheckIn {
  id: string
  userId: string
  gymId: string
  gymName: string
  lat: number
  lng: number
  date: string
  checkedInAt: number
}

export interface PartnerGymStats {
  checkInsToday: number
  liveNow: number
  promos: string[]
}

export interface PartnerGymDoc {
  gymId: string
  name: string
  promos?: string[]
  city?: string
}

/** Phase 89 — persist gym check-in for partner dashboard aggregates. */
export async function recordPartnerGymCheckIn(
  db: Firestore,
  input: {
    userId: string
    gymId: string
    gymName: string
    lat: number
    lng: number
  }
): Promise<void> {
  const { collection, addDoc, doc, setDoc, serverTimestamp } = await import(
    'firebase/firestore'
  )
  const date = toLocalDateStr()
  const checkedInAt = Date.now()

  await addDoc(collection(db, 'partnerGymCheckIns'), {
    userId: input.userId,
    gymId: input.gymId,
    gymName: input.gymName,
    lat: input.lat,
    lng: input.lng,
    date,
    checkedInAt,
    createdAt: serverTimestamp(),
  })

  const dailyId = `${input.gymId}_${date}`
  const dailyRef = doc(db, 'partnerGymDaily', dailyId)
  const { getDoc, increment } = await import('firebase/firestore')
  const snap = await getDoc(dailyRef)
  if (snap.exists()) {
    await setDoc(
      dailyRef,
      {
        gymId: input.gymId,
        gymName: input.gymName,
        date,
        checkInCount: increment(1),
        updatedAt: checkedInAt,
      },
      { merge: true }
    )
  } else {
    await setDoc(dailyRef, {
      gymId: input.gymId,
      gymName: input.gymName,
      date,
      checkInCount: 1,
      updatedAt: checkedInAt,
    })
  }
}

export async function fetchPartnerGymStats(
  db: Firestore,
  gymId: string,
  liveNowFallback = 0
): Promise<PartnerGymStats> {
  const date = toLocalDateStr()
  const dailyId = `${gymId}_${date}`
  const { doc, getDoc, collection, query, where, getDocs } = await import(
    'firebase/firestore'
  )

  let checkInsToday = 0
  let promos: string[] = []

  try {
    const dailySnap = await getDoc(doc(db, 'partnerGymDaily', dailyId))
    if (dailySnap.exists()) {
      checkInsToday = Number(dailySnap.data().checkInCount) || 0
    } else {
      const q = query(
        collection(db, 'partnerGymCheckIns'),
        where('gymId', '==', gymId),
        where('date', '==', date)
      )
      const snap = await getDocs(q)
      checkInsToday = snap.size
    }
  } catch {
    checkInsToday = 0
  }

  try {
    const gymSnap = await getDoc(doc(db, 'partnerGyms', gymId))
    if (gymSnap.exists()) {
      const d = gymSnap.data()
      promos = Array.isArray(d.promos) ? d.promos.map(String) : []
    }
  } catch {
    promos = []
  }

  if (promos.length === 0) {
    promos = ['Membresía día prueba — pregunta en recepción', '10% merch EntrenaMatch en tienda']
  }

  return {
    checkInsToday,
    liveNow: liveNowFallback,
    promos,
  }
}

export async function seedPartnerGymIfMissing(
  db: Firestore,
  gym: { id: string; name: string; city?: string }
): Promise<void> {
  const { doc, getDoc, setDoc } = await import('firebase/firestore')
  const ref = doc(db, 'partnerGyms', gym.id)
  const snap = await getDoc(ref)
  if (snap.exists()) return
  await setDoc(ref, {
    gymId: gym.id,
    name: gym.name,
    city: gym.city || null,
    promos: ['Clase grupal gratis los martes 19:00', 'Check-in EntrenaMatch = café en barra'],
    active: true,
    updatedAt: Date.now(),
  })
}

export interface TopPartnerGym {
  gymId: string
  gymName: string
  checkInsToday: number
}

/** Phase 96 — top partner gyms by check-ins today (client-side sort). */
export async function fetchTopPartnerGyms(
  db: Firestore,
  limit = 5
): Promise<TopPartnerGym[]> {
  const date = toLocalDateStr()
  const { collection, query, where, getDocs } = await import('firebase/firestore')
  try {
    const q = query(collection(db, 'partnerGymDaily'), where('date', '==', date))
    const snap = await getDocs(q)
    return snap.docs
      .map((d) => {
        const data = d.data()
        return {
          gymId: String(data.gymId || ''),
          gymName: String(data.gymName || 'Gym'),
          checkInsToday: Number(data.checkInCount) || 0,
        }
      })
      .filter((g) => g.gymId && g.checkInsToday > 0)
      .sort((a, b) => b.checkInsToday - a.checkInsToday)
      .slice(0, limit)
  } catch {
    return []
  }
}
