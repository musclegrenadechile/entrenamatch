import type { WeeklyPactProgress } from '../../services/weeklyPact'

export interface ArenaWeeklyMetaChipProps {
  progress: WeeklyPactProgress | null
  sessionMinutes: number
}

export function ArenaWeeklyMetaChip({ progress, sessionMinutes }: ArenaWeeklyMetaChipProps) {
  if (!progress?.pledged) {
    return (
      <div className="arena-meta-chip arena-meta-chip--muted">
        <span>Meta semanal</span>
        <span className="arena-meta-chip__hint">Fíjala en Hoy al terminar</span>
      </div>
    )
  }

  const syncCreditHint =
    sessionMinutes >= 2
      ? 'Este sync suma a tu meta ✓'
      : sessionMinutes >= 1
        ? '1 min más → cuenta para meta'
        : '≥2 min cuentan para meta'

  return (
    <div
      className={`arena-meta-chip ${progress.isComplete ? 'arena-meta-chip--done' : ''}`}
      role="status"
    >
      <span className="arena-meta-chip__label">Meta semanal</span>
      <span className="arena-meta-chip__vals">
        {progress.liveDaysDone}/{progress.liveDaysTarget} live ·{' '}
        {progress.syncSessionsDone}/{progress.syncSessionsTarget} sync
      </span>
      <span className="arena-meta-chip__hint">{syncCreditHint}</span>
    </div>
  )
}
