/** Registro run local Playwright PR smoke — preview oleada 454. */
import {
  E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_CI_FILES,
  isTrainingPlaywrightPrSmokeCoverageComplete,
  trainingPlaywrightPrSmokeSpecFileBasenames,
} from './e2eTrainingPlaywrightPrSmokeCoverage'

export const E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_RUN_SPECS = [
  'e2e/training-mega-flow.spec.ts',
  'e2e/workout-history-flow.spec.ts',
] as const

export const E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_RUN_BASE_URL =
  'http://127.0.0.1:4173/entrenamatch/'

export function trainingPlaywrightPrSmokeRunCommand(): string {
  const specs = E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_RUN_SPECS.join(' ')
  return `PLAYWRIGHT_BASE_URL=${E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_RUN_BASE_URL} npx playwright test ${specs}`
}

export function countTrainingPlaywrightPrSmokeRunSpecs(): number {
  return E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_RUN_SPECS.length
}

export function trainingPlaywrightPrSmokeRunSpecFileBasenames(): string[] {
  return trainingPlaywrightPrSmokeSpecFileBasenames()
}

export function e2eTrainingPlaywrightPrSmokeRunBlockRange(): { from: number; to: number } {
  return { from: 453, to: 454 }
}

export function isTrainingPlaywrightPrSmokeRunReady(): boolean {
  return (
    isTrainingPlaywrightPrSmokeCoverageComplete() &&
    E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_CI_FILES.length === 2 &&
    E2E_TRAINING_PLAYWRIGHT_PR_SMOKE_RUN_SPECS.length === 2
  )
}