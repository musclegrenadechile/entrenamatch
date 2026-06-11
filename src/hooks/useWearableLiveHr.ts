import { useEffect, useState } from 'react'
import { fetchWearableLiveHeartRate } from '../services/wearableHealth'

const POLL_MS = 30_000

/** Poll wearable HR while EntrenaSync Arena is open (W1b). */
export function useWearableLiveHr(enabled: boolean, syncStartedAt: number | null): number | null {
  const [bpm, setBpm] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled || !syncStartedAt) {
      setBpm(null)
      return
    }

    let cancelled = false
    const poll = async () => {
      const next = await fetchWearableLiveHeartRate(syncStartedAt)
      if (!cancelled) setBpm(next)
    }

    void poll()
    const id = window.setInterval(() => void poll(), POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [enabled, syncStartedAt])

  return bpm
}
