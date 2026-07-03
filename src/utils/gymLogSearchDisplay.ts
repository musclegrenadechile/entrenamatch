/** Mensaje cuando la búsqueda de ejercicios no devuelve resultados. */
export function buildGymLogSearchEmptyMessage(query: string, muscle?: string): string {
  const q = query.trim()
  if (!q) return ''
  if (muscle) return `Sin resultados para «${q}» en ${muscle}`
  return `Sin resultados para «${q}»`
}

export function shouldShowGymLogSuggestions(search: string, count: number): boolean {
  return search.trim().length > 0 && count > 0
}

export function shouldShowGymLogSearchEmpty(search: string, count: number): boolean {
  return search.trim().length > 0 && count === 0
}