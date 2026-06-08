/** Unified boot timeout — Auth + profile hydration (fase 161). */
export const BOOT_TIMEOUT_MS = 10_000

export type BootPhase = 'auth' | 'profile' | 'app'

export function bootMessages(phase: BootPhase, timedOut: boolean) {
  if (timedOut) {
    return {
      message: 'Sin conexión o respuesta lenta',
      submessage: 'Reintenta cargar tu cuenta o prueba el modo demo en este dispositivo.',
    }
  }
  if (phase === 'auth') {
    return {
      message: 'Cargando tu cuenta…',
      submessage: 'Verificando sesión con EntrenaMatch',
    }
  }
  if (phase === 'profile') {
    return {
      message: 'Cargando tu perfil…',
      submessage: 'Sincronizando datos de entrenamiento',
    }
  }
  return {
    message: 'Preparando tu arena…',
    submessage: 'Mapa, live y tu equipo',
  }
}
