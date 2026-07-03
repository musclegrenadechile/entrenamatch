import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

test('E2E workout-fab-flow — minimizar gym-log y chip sesión en FAB', async ({ page }) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.openWorkoutModal()
  })

  const workout = page.getByRole('dialog', { name: 'Entreno de Hoy' })
  await expect(workout).toBeVisible({ timeout: 12000 })
  await expect(workout.getByText('Press banca')).toBeVisible()

  await workout.getByRole('button', { name: 'Minimizar sesión' }).click()

  await expect(workout).not.toBeVisible({ timeout: 10000 })

  const fab = page.getByRole('button', { name: 'Volver a Modo Entreno' })
  await expect(fab).toBeVisible({ timeout: 10000 })
  await expect(page.getByRole('status').filter({ hasText: /1 serie/i })).toBeVisible()

  await page.evaluate(() => {
    window.__entrenamatchE2E!.resumeWorkoutModal()
  })

  await expect(workout).toBeVisible({ timeout: 10000 })
  await expect(workout.getByText('Press banca')).toBeVisible()
})