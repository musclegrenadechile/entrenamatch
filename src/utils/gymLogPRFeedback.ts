import confetti from 'canvas-confetti'

/** Haptic corto al marcar un PR en vivo en gym-log. */
export function buzzGymLogLivePR(): void {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([120, 60, 160])
    }
  } catch {
    /* ignore */
  }
}

/** Micro confetti localizado — más sutil que el post-guardar. */
export function fireGymLogLivePRConfetti(): void {
  confetti({
    particleCount: 18,
    spread: 38,
    startVelocity: 16,
    origin: { y: 0.85, x: 0.5 },
    colors: ['#FFD700', '#FF671F', '#22c55e'],
    ticks: 80,
    gravity: 1.05,
    scalar: 0.6,
  })
}

export function celebrateGymLogLivePR(): void {
  buzzGymLogLivePR()
  fireGymLogLivePRConfetti()
}