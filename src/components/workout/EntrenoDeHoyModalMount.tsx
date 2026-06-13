import type { Profile, Workout, WorkoutExercise, WorkoutQuickTemplate, WorkoutType } from '../../types'
import { isGymCheckInFresh } from '../../services/localNetwork'
import { EntrenoDeHoyModal, type EntrenoDeHoyModalProps } from './EntrenaLogModal'

export type EntrenoLogPrefill = {
  title?: string
  exercises?: WorkoutExercise[]
  type?: WorkoutType
  durationMin?: number
} | null

export type EntrenoDeHoyModalMountProps = {
  open: boolean
  onClose: () => void
  onMinimize?: () => void
  onDiscardSession?: () => void
  onSave: EntrenoDeHoyModalProps['onSave']
  userId?: string | null
  skipDraftRestore?: boolean
  saving?: boolean
  prefill: EntrenoLogPrefill
  expandPastWorkouts?: boolean
  recentWorkouts?: Workout[]
  gymRoutineTemplates?: WorkoutQuickTemplate[]
  currentUser?: Profile | null
  shareToChatId?: string | null
  chatPartnerName?: string
  matchProfiles?: Profile[]
  onGymSoundSave?: (user: Profile) => void | Promise<void>
}

function resolveShareToChatFirstName(
  shareToChatId: string | null | undefined,
  chatPartnerName: string | undefined,
  matchProfiles: Profile[] | undefined
): string | undefined {
  if (!shareToChatId) return undefined
  const full =
    chatPartnerName ||
    matchProfiles?.find((p) => p.id === shareToChatId)?.name ||
    'tu partner'
  return full.split(' ')[0]
}

function resolveLiveDurationMin(user?: Profile | null): number | undefined {
  if (!user?.trainingNow || !user.trainingNowSince) return undefined
  return Math.max(5, Math.floor((Date.now() - user.trainingNowSince) / 60_000))
}

/** Fase 372 — workout log modal + derived gym/live props extracted from App.tsx. */
export function EntrenoDeHoyModalMount({
  open,
  onClose,
  onMinimize,
  onDiscardSession,
  onSave,
  userId,
  skipDraftRestore,
  saving,
  prefill,
  expandPastWorkouts,
  recentWorkouts,
  gymRoutineTemplates,
  currentUser,
  shareToChatId,
  chatPartnerName,
  matchProfiles,
  onGymSoundSave,
}: EntrenoDeHoyModalMountProps) {
  return (
    <EntrenoDeHoyModal
      open={open}
      onClose={onClose}
      onMinimize={onMinimize}
      onDiscardSession={onDiscardSession}
      onSave={onSave}
      userId={userId}
      skipDraftRestore={skipDraftRestore}
      saving={saving}
      defaultTitle={prefill?.title || 'Entreno de hoy'}
      initialExercises={prefill?.exercises}
      initialType={prefill?.type}
      initialDurationMin={prefill?.durationMin}
      recentWorkouts={recentWorkouts}
      expandPastWorkouts={expandPastWorkouts}
      liveDurationMin={resolveLiveDurationMin(currentUser)}
      gymRoutineTemplates={gymRoutineTemplates}
      gymRoutineLabel={
        isGymCheckInFresh(currentUser?.gymCheckIn)
          ? currentUser?.gymCheckIn?.gymName
          : undefined
      }
      gymSoundUser={currentUser ?? undefined}
      isLive={!!currentUser?.trainingNow}
      onGymSoundSave={onGymSoundSave}
      shareToChatName={resolveShareToChatFirstName(
        shareToChatId,
        chatPartnerName,
        matchProfiles
      )}
    />
  )
}
