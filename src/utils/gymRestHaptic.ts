/** Haptic feedback when gym rest countdown completes. */
export function buzzRestTimerDone(): void {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 90, 200, 90, 280])
    }
  } catch {
    /* ignore */
  }
}