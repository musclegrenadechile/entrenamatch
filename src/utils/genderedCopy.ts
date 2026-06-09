/** Spanish copy that adapts to profile gender (hombre / mujer). */

export type ProfileGender = 'hombre' | 'mujer' | string | null | undefined

export function isFeminineGender(gender: ProfileGender): boolean {
  return gender === 'mujer'
}

export function genderedWord(
  gender: ProfileGender,
  masculine: string,
  feminine: string
): string {
  return isFeminineGender(gender) ? feminine : masculine
}

/** City derby / challenge badge — "Campeón Viña del Mar" vs "Campeona …" */
export function cityChampionLabel(gender: ProfileGender, city: string): string {
  const title = genderedWord(gender, 'Campeón', 'Campeona')
  return `${title} ${city}`
}

export function winnerLabel(gender: ProfileGender): string {
  return genderedWord(gender, 'Ganador', 'Ganadora')
}

export function championAuraLabel(gender: ProfileGender): string {
  return genderedWord(gender, 'Aura de Campeón', 'Aura de Campeona')
}

/** Localize gadget names that use gendered Spanish. */
export function gadgetDisplayName(name: string, gender: ProfileGender): string {
  if (name === 'Aura de Campeón' || name === 'Aura de Campeona') {
    return championAuraLabel(gender)
  }
  return name
}
