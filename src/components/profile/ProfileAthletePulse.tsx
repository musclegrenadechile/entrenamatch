import { Activity, Dumbbell, Flame } from 'lucide-react'
import type { Profile, ProfilePost } from '../../types'
import { WORKOUT_TYPE_LABELS } from '../../data/exerciseLibrary'

export interface ProfileAthletePulseProps {
  profile: Profile
  syncBond?: { sessions: number; bondLevel: number; totalMin: number } | null
  lastWorkoutPost?: ProfilePost | null
  isSelf?: boolean
}

export function ProfileAthletePulse({
  profile,
  syncBond,
  lastWorkoutPost,
  isSelf = false,
}: ProfileAthletePulseProps) {
  const ws = profile.weekStats
  const liveDays = ws?.liveDays ?? 0
  const syncMin = ws?.syncMinutes ?? 0
  const liveStreak = profile.liveStreak ?? 0
  const gymFresh = profile.gymCheckIn?.gymName

  const hasPulse = liveDays > 0 || syncMin > 0 || liveStreak > 0 || !!lastWorkoutPost || !!syncBond
  if (!hasPulse && !gymFresh) return null

  const preview = lastWorkoutPost?.workoutPreview
  const typeLabel = preview ? WORKOUT_TYPE_LABELS[preview.type] || preview.type : null

  return (
    <section className="px-4 mt-4" aria-label="Pulso atlético">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#141418] to-[#0f0f12] p-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <Activity className="w-4 h-4 text-[#22c55e]" />
          <p className="text-xs font-black text-white">
            {isSelf ? 'Tu pulso esta semana' : 'Pulso esta semana'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {liveDays > 0 && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-[#22c55e]/15 text-[#22c55e] font-bold border border-[#22c55e]/25">
              {liveDays} días live
            </span>
          )}
          {syncMin > 0 && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-[#FFD700]/15 text-[#FFD700] font-bold border border-[#FFD700]/25">
              {syncMin} min sync
            </span>
          )}
          {liveStreak > 0 && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-[#FF671F]/15 text-[#FF671F] font-bold border border-[#FF671F]/25 flex items-center gap-0.5">
              <Flame className="w-3 h-3" /> {liveStreak}d racha
            </span>
          )}
          {syncBond && syncBond.sessions > 0 && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/90 font-bold border border-white/10">
              ⭐ Bond Lv.{syncBond.bondLevel} · {syncBond.sessions} syncs
            </span>
          )}
          {gymFresh && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-[#9CA3AF] font-bold border border-white/10 truncate max-w-full">
              📍 {profile.gymCheckIn!.gymName}
            </span>
          )}
        </div>

        {preview && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/8 text-[10px]">
            <Dumbbell className="w-3.5 h-3.5 text-[#FF671F] shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{preview.title}</p>
              <p className="text-[#9CA3AF]">
                {typeLabel} · {preview.totalSets} sets · {preview.volumeLabel}
                {preview.prCount ? ` · ${preview.prCount} PR` : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
