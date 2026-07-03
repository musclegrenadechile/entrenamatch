/** Mensaje del banner de sesión recuperada en Entreno de Hoy. */
export function formatWorkoutDraftRecoveredMessage(timerWasReset: boolean): string {
  return timerWasReset
    ? 'Recuperamos tus ejercicios — el cronómetro empezó de cero'
    : 'Recuperamos tu sesión — sigue donde la dejaste'
}