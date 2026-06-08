/**
 * First Steps — progreso persistente en Firestore (profiles/{uid}.firstSteps).
 */

import { doc, getDoc, updateDoc, type Firestore } from 'firebase/firestore'

export interface FirstStepsProgress {
  live: boolean
  team: boolean
  sync: boolean
  pact: boolean
  dismissed: boolean
  updatedAt: number
}

export const EMPTY_FIRST_STEPS: FirstStepsProgress = {
  live: false,
  team: false,
  sync: false,
  pact: false,
  dismissed: false,
  updatedAt: 0,
}

export async function loadFirstStepsProgress(
  db: Firestore,
  uid: string
): Promise<FirstStepsProgress> {
  try {
    const snap = await getDoc(doc(db, 'profiles', uid))
    const fs = snap.data()?.firstSteps as Partial<FirstStepsProgress> | undefined
    if (!fs) return { ...EMPTY_FIRST_STEPS }
    return {
      live: fs.live === true,
      team: fs.team === true,
      sync: fs.sync === true,
      pact: fs.pact === true,
      dismissed: fs.dismissed === true,
      updatedAt: typeof fs.updatedAt === 'number' ? fs.updatedAt : 0,
    }
  } catch {
    return { ...EMPTY_FIRST_STEPS }
  }
}

export async function saveFirstStepsProgress(
  db: Firestore,
  uid: string,
  patch: Partial<FirstStepsProgress>
): Promise<void> {
  const current = await loadFirstStepsProgress(db, uid)
  await updateDoc(doc(db, 'profiles', uid), {
    firstSteps: { ...current, ...patch, updatedAt: Date.now() },
  })
}

export async function markPostRegisterGuideSeen(db: Firestore, uid: string): Promise<void> {
  await updateDoc(doc(db, 'profiles', uid), {
    postRegisterGuideSeen: true,
    postRegisterGuideSeenAt: Date.now(),
  })
}

export async function markActivationGuideComplete(db: Firestore, uid: string): Promise<void> {
  const current = await loadFirstStepsProgress(db, uid)
  await updateDoc(doc(db, 'profiles', uid), {
    postRegisterGuideSeen: true,
    postRegisterGuideSeenAt: Date.now(),
    firstSteps: { ...current, dismissed: true, updatedAt: Date.now() },
  })
}

export async function shouldShowActivationGuide(db: Firestore, uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'profiles', uid))
    const data = snap.data()
    if (data?.postRegisterGuideSeen === true) return false
    if (data?.firstSteps?.dismissed === true) return false
    return true
  } catch {
    return true
  }
}

/** @deprecated use shouldShowActivationGuide */
export async function hasSeenPostRegisterGuide(db: Firestore, uid: string): Promise<boolean> {
  return !(await shouldShowActivationGuide(db, uid))
}
