import { exerciseMatchesMuscleTab, getLibraryExercise } from '../data/exerciseLibrary'

/** Panel de recientes cuando el buscador está vacío y abierto. */
export function shouldShowGymLogRecentSuggestions(search: string, showPicker: boolean): boolean {
  return showPicker && search.trim().length === 0
}

/** Ejercicios recientes que aún no están en la sesión, opcionalmente filtrados por músculo. */
export function pickGymLogRecentSuggestions(
  recentNames: readonly string[],
  sessionNames: readonly string[],
  muscleFilter?: string,
  limit = 6
): string[] {
  const inSession = new Set(sessionNames)
  const out: string[] = []
  for (const name of recentNames) {
    if (inSession.has(name)) continue
    if (muscleFilter) {
      const ex = getLibraryExercise(name)
      if (!ex || !exerciseMatchesMuscleTab(ex, muscleFilter)) continue
    }
    out.push(name)
    if (out.length >= limit) break
  }
  return out
}