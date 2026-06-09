/**
 * Identity verification — Gemini face match via Cloud Function `verifyIdentity`.
 */

import type { FirebaseStorage } from 'firebase/storage'
import type { IdentityAiVerdict } from '../utils/identityVerification'

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
  return new Promise((resolve) => {
    const img = new Image()
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
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
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
  const res = await fn(input)
  return res.data
}
