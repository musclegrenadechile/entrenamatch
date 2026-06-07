/** Haptic feedback — web vibrate API (Capacitor haptics can wrap this later). */
export function triggerHaptic(style: 'light' | 'medium' | 'success' = 'light') {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const pattern = style === 'success' ? [25, 15, 25] : style === 'medium' ? 55 : 22
      ;(navigator as Navigator & { vibrate?: (p: number | number[]) => boolean }).vibrate?.(pattern)
    }
  } catch {}
}
