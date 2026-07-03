import { useEffect, useState } from 'react'

/** Matches narrow phones — Entreno footer collapses below this width. */
const COMPACT_MOBILE_MQ = '(max-width: 480px)'

export function useCompactMobile(): boolean {
  const [compact, setCompact] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(COMPACT_MOBILE_MQ).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(COMPACT_MOBILE_MQ)
    const onChange = () => setCompact(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return compact
}