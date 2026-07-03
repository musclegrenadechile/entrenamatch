import { ensureMicrophonePermission } from './microphoneAccess'

let pipelineWarmed = false
let warmupInFlight: Promise<void> | null = null

/** Prefetch auth + mic permission when the log modal opens (oleada D). */
export async function prewarmWorkoutVoicePipeline(): Promise<void> {
  if (pipelineWarmed) return
  if (warmupInFlight) return warmupInFlight

  warmupInFlight = (async () => {
    try {
      const [{ app }, { getAuth }] = await Promise.all([
        import('../services/firebase'),
        import('firebase/auth'),
      ])
      if (!app) return

      const user = getAuth(app).currentUser
      if (user) {
        await user.getIdToken()
      }

      await ensureMicrophonePermission()

      // Preload voice modules so first dictation avoids chunk fetch delay.
      await Promise.all([
        import('../services/workoutVoice'),
        import('./workoutVoiceLocalParse'),
      ])
    } catch {
      /* warmup is best-effort */
    } finally {
      pipelineWarmed = true
      warmupInFlight = null
    }
  })()

  return warmupInFlight
}

export function resetWorkoutVoiceWarmup(): void {
  pipelineWarmed = false
  warmupInFlight = null
}
