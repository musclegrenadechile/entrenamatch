/** Subtítulo del panel «Repetir un entreno». */
export function buildPastWorkoutPickerSubline(count: number): string {
  if (count <= 0) return 'Aún no tienes rutinas guardadas'
  return count === 1 ? '1 rutina guardada' : `${count} rutinas en tu historial`
}