import confetti from 'canvas-confetti'

/** Subtle celebration when Entreno de Hoy logs new PRs. */
export function fireWorkoutPRConfetti(): void {
  confetti({
    particleCount: 48,
    spread: 52,
    startVelocity: 22,
    origin: { y: 0.72 },
    colors: ['#FFD700', '#FF671F', '#22c55e'],
    ticks: 120,
    gravity: 1.1,
    scalar: 0.85,
  })
}