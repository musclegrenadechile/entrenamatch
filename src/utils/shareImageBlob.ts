/** Share a PNG blob via native sheet (Web Share / Capacitor) with download fallback. */

import { Capacitor } from '@capacitor/core'

export type ShareImageOutcome = 'shared' | 'downloaded' | 'cancelled' | 'failed'

export type ShareImageOpts = {
  title?: string
  text?: string
  dialogTitle?: string
}

type CapacitorSharePlugin = {
  share: (opts: {
    title?: string
    text?: string
    files?: string[]
    dialogTitle?: string
  }) => Promise<{ activityType?: string }>
}

type CapacitorFilesystemPlugin = {
  writeFile: (opts: { path: string; data: string; directory: string }) => Promise<{ uri: string }>
  getUri: (opts: { path: string; directory: string }) => Promise<{ uri: string }>
}

const FS_CACHE = 'CACHE'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(new Error('read failed'))
        return
      }
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(blob)
  })
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function isUserCancelled(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true
  const msg = err instanceof Error ? err.message : String(err)
  return /cancel/i.test(msg) || /abort/i.test(msg)
}

async function shareViaWebApi(
  blob: Blob,
  filename: string,
  opts?: ShareImageOpts
): Promise<ShareImageOutcome | null> {
  if (typeof navigator === 'undefined' || !navigator.share) return null

  const file = new File([blob], filename, { type: blob.type || 'image/png' })
  const payload: ShareData = {}
  if (opts?.title) payload.title = opts.title
  if (opts?.text) payload.text = opts.text

  if (navigator.canShare?.({ files: [file] })) {
    payload.files = [file]
  } else if (!opts?.title && !opts?.text) {
    return null
  }

  try {
    await navigator.share(payload)
    return 'shared'
  } catch (err) {
    if (isUserCancelled(err)) return 'cancelled'
    return null
  }
}

async function shareViaCapacitor(
  blob: Blob,
  filename: string,
  opts?: ShareImageOpts
): Promise<ShareImageOutcome | null> {
  if (!Capacitor.isNativePlatform()) return null

  const plugins =
    (typeof window !== 'undefined' &&
      (window as Window & {
        __CAPACITOR_PLUGINS__?: {
          Share?: CapacitorSharePlugin
          Filesystem?: CapacitorFilesystemPlugin
        }
      }).__CAPACITOR_PLUGINS__) ||
    null

  const Share = plugins?.Share
  const Filesystem = plugins?.Filesystem
  if (!Share || !Filesystem) return null

  const safeName = filename.replace(/[^\w.-]+/g, '_')
  const path = `entrenamatch-share/${safeName}`

  try {
    const data = await blobToBase64(blob)
    await Filesystem.writeFile({ path, data, directory: FS_CACHE })
    const { uri } = await Filesystem.getUri({ path, directory: FS_CACHE })
    await Share.share({
      title: opts?.title,
      text: opts?.text,
      files: [uri],
      dialogTitle: opts?.dialogTitle ?? 'Compartir',
    })
    return 'shared'
  } catch (err) {
    if (isUserCancelled(err)) return 'cancelled'
    return null
  }
}

export async function sharePngBlob(
  blob: Blob,
  filename: string,
  opts?: ShareImageOpts
): Promise<ShareImageOutcome> {
  const web = await shareViaWebApi(blob, filename, opts)
  if (web) return web

  const native = await shareViaCapacitor(blob, filename, opts)
  if (native) return native

  try {
    downloadBlob(blob, filename)
    return 'downloaded'
  } catch {
    return 'failed'
  }
}
