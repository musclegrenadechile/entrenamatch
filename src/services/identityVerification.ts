/**
 * Identity verification — Gemini face match via Cloud Function `verifyIdentity`.
 */

import type { FirebaseStorage } from 'firebase/storage'
import type {
  IdentityAiVerdict,
  IdentityVerificationStatus,
} from '../utils/identityVerification'

const VERIFY_CALLABLE_TIMEOUT_MS = 50_000
const COMPRESS_TIMEOUT_MS = 12_000
const PERSIST_TIMEOUT_MS = 18_000

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} tardó demasiado — intenta de nuevo.`)), ms)
    }),
  ])
}

export type VerifyIdentityInput = {
  profilePhotoBase64?: string
  profilePhotoUrl?: string
  selfieBase64: string
  idPhotoBase64?: string
  displayName?: string
  age?: number
}

/** Resize/compress before sending to Cloud Function (smaller payload, better vision). */
export async function compressImageDataUrl(
  dataUrl: string,
  maxSide = 1280,
  quality = 0.82
): Promise<string> {
  if (!dataUrl?.startsWith('data:') || typeof document === 'undefined') return dataUrl
  const work = new Promise<string>((resolve) => {
    const img = new Image()
    const done = (out: string) => resolve(out)
    img.onload = () => {
      let { width, height } = img
      const scale = Math.min(1, maxSide / Math.max(width, height, 1))
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        done(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      done(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => done(dataUrl)
    img.src = dataUrl
  })
  return withTimeout(work, COMPRESS_TIMEOUT_MS, 'Procesar imagen')
}

export async function imageRefToDataUrl(src: string): Promise<string | null> {
  if (!src) return null
  if (src.startsWith('data:')) return src
  try {
    const res = await fetch(src)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function uploadVerificationImage(
  storage: FirebaseStorage,
  userId: string,
  dataUrl: string,
  kind: 'selfie' | 'id'
): Promise<string> {
  const { ref, uploadString, getDownloadURL } = await import('firebase/storage')
  const path = `verification/${userId}/${kind}-${Date.now()}.jpg`
  const storageRef = ref(storage, path)
  const snap = await uploadString(storageRef, dataUrl, 'data_url')
  return getDownloadURL(snap.ref)
}

export async function verifyIdentityWithAi(input: VerifyIdentityInput): Promise<IdentityAiVerdict> {
  const { app: firebaseApp } = await import('./firebase')
  if (!firebaseApp) throw new Error('Firebase not initialized')
  if (!input.selfieBase64?.trim()) throw new Error('Selfie requerida para verificación')

  const { getFunctions, httpsCallable } = await import('firebase/functions')
  const functions = getFunctions(firebaseApp, 'us-central1')
  const fn = httpsCallable<VerifyIdentityInput, IdentityAiVerdict>(functions, 'verifyIdentity')
  const res = await withTimeout(fn(input), VERIFY_CALLABLE_TIMEOUT_MS, 'Análisis facial')
  return res.data
}

export async function persistVerificationToProfile(
  uid: string,
  status: IdentityVerificationStatus,
  selfiePhotoUrl?: string
): Promise<void> {
  const { updateUserProfile } = await import('./auth')
  await withTimeout(
    updateUserProfile(uid, {
      verificationStatus: status,
      verificationDate: Date.now(),
      verificationDocuments: selfiePhotoUrl ? { selfiePhoto: selfiePhotoUrl } : undefined,
    } as Record<string, unknown>),
    PERSIST_TIMEOUT_MS,
    'Guardar verificación'
  )
}
