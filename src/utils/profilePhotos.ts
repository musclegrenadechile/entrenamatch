/** Profile photo persistence helpers — Storage URLs only in Firestore. */

export const PROFILE_PHOTO_PLACEHOLDER = ''

export function isDataUrlPhoto(url: string | null | undefined): boolean {
  return typeof url === 'string' && url.startsWith('data:')
}

export function isHttpPhotoUrl(url: string | null | undefined): boolean {
  return typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))
}

export function isFirebaseStoragePhoto(url: string | null | undefined): boolean {
  return (
    isHttpPhotoUrl(url) &&
    (url!.includes('firebasestorage.googleapis.com') || url!.includes('storage.googleapis.com'))
  )
}

/** URLs safe to store in Firestore (no base64 blobs). */
export function filterPersistablePhotos(photos: string[] | null | undefined): string[] {
  if (!Array.isArray(photos)) return []
  return photos.filter((p) => isHttpPhotoUrl(p) && !isDataUrlPhoto(p))
}

export function photoSetFreshnessScore(photos: string[] | null | undefined): number {
  const list = filterPersistablePhotos(photos)
  if (list.length === 0) return 0
  let score = list.length * 10
  if (isFirebaseStoragePhoto(list[0])) score += 100
  return score
}

/**
 * Pick best photo list when hydrating from cache + Firestore.
 * Prefers newer photosUpdatedAt; otherwise the fresher-looking set (Storage > Google avatar).
 */
export function resolveProfilePhotos(
  cachedPhotos: string[] | null | undefined,
  remotePhotos: string[] | null | undefined,
  cachedUpdatedAt?: number | null,
  remoteUpdatedAt?: number | null
): string[] {
  const cached = filterPersistablePhotos(cachedPhotos)
  const remote = filterPersistablePhotos(remotePhotos)
  const cachedPending = Array.isArray(cachedPhotos)
    ? cachedPhotos.filter((p) => isDataUrlPhoto(p))
    : []

  if (cachedUpdatedAt && remoteUpdatedAt) {
    if (cachedUpdatedAt > remoteUpdatedAt) return cached.length ? cached : remote
    if (remoteUpdatedAt > cachedUpdatedAt) return remote.length ? remote : cached
  }

  if (cached.length === 0 && remote.length === 0 && cachedPending.length > 0) {
    return cachedPending
  }

  if (cached.length === 0) return remote.length ? remote : cachedPending
  if (remote.length === 0) return cached

  return photoSetFreshnessScore(cached) >= photoSetFreshnessScore(remote) ? cached : remote
}

/**
 * Photos to write on sync — never wipe persisted Storage URLs because incoming
 * state still has unpersisted data: URLs or a partial profile patch.
 */
export function resolvePhotosForFirestoreSave(
  incoming: string[] | null | undefined,
  prior: string[] | null | undefined
): string[] {
  const incomingRaw = Array.isArray(incoming) ? incoming : []
  const priorRaw = Array.isArray(prior) ? prior : []
  const incomingPersistable = filterPersistablePhotos(incomingRaw)
  const priorPersistable = filterPersistablePhotos(priorRaw)
  const incomingHasDataUrls = incomingRaw.some(isDataUrlPhoto)

  if (incomingPersistable.length > 0) {
    return incomingPersistable
  }

  const userClearedGallery =
    incomingRaw.length === 0 && priorRaw.length > 0 && !incomingHasDataUrls

  if (userClearedGallery) {
    return []
  }

  if (incomingHasDataUrls && priorPersistable.length > 0) {
    return priorPersistable
  }

  if (priorPersistable.length > 0) {
    return priorPersistable
  }

  return []
}

export async function ensurePersistableProfilePhotos(
  photos: string[],
  upload: (dataUrl: string) => Promise<string>
): Promise<string[]> {
  const out: string[] = []
  for (const photo of photos) {
    if (!photo) continue
    if (isDataUrlPhoto(photo)) {
      const uploaded = await upload(photo)
      if (!isHttpPhotoUrl(uploaded) || isDataUrlPhoto(uploaded)) {
        throw new Error('No se pudo subir la foto de perfil a Storage')
      }
      out.push(uploaded)
      continue
    }
    if (isHttpPhotoUrl(photo)) {
      out.push(photo)
    }
  }
  return out.slice(0, 6)
}

export function primaryProfilePhoto(
  photos: string[] | null | undefined,
  fallback = PROFILE_PHOTO_PLACEHOLDER
): string {
  if (!Array.isArray(photos)) return fallback
  const first = photos.find((p) => isHttpPhotoUrl(p) || isDataUrlPhoto(p))
  return first || fallback
}

export function profilePhotosChanged(
  a: string[] | null | undefined,
  b: string[] | null | undefined
): boolean {
  const fa = filterPersistablePhotos(a)
  const fb = filterPersistablePhotos(b)
  if (fa.length !== fb.length) return true
  return fa.some((p, i) => p !== fb[i])
}

export function latestPhotosUpdatedAt(
  a?: number | null,
  b?: number | null
): number | undefined {
  const max = Math.max(a || 0, b || 0)
  return max > 0 ? max : undefined
}
