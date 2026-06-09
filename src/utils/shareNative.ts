export type ShareNativeOutcome = 'shared' | 'copied' | 'cancelled' | 'failed'

function isUserCancelled(err: unknown): boolean {
  if (err instanceof DOMException && err.name === 'AbortError') return true
  const msg = err instanceof Error ? err.message : String(err)
  return /cancel/i.test(msg) || /abort/i.test(msg)
}

export async function shareNativeMessage(opts: {
  title: string
  text: string
  url?: string
}): Promise<ShareNativeOutcome> {
  const url = opts.url?.trim()

  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: opts.title,
        text: opts.text,
        ...(url ? { url } : {}),
      })
      return 'shared'
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url ? `${opts.text}\n${url}` : opts.text)
      return 'copied'
    }
    return 'failed'
  } catch (err) {
    if (isUserCancelled(err)) return 'cancelled'
    return 'failed'
  }
}
