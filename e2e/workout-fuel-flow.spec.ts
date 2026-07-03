import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

/** Oleada 380 — guardar entreno → banner → Fuel log con prefill post-entreno. */
test('E2E workout-fuel-flow — banner post-guardar → Fuel prefill', async ({ page }) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.openWorkoutModal()
  })

  const workout = page.getByRole('dialog', { name: 'Entreno de Hoy' })
  await expect(workout).toBeVisible({ timeout: 12000 })
  await workout.getByRole('button', { name: /Terminar y publicar/i }).click()
  await expect(workout).not.toBeVisible({ timeout: 15000 })

  await page.evaluate(() => {
    window.__entrenamatchE2E!.goToHomeTab()
  })

  await expect(page.getByText(/Entreno guardado/i)).toBeVisible({ timeout: 10000 })
  await expect(page.locator('.em-v2-training-save-banner__session')).toContainText(/1 serie/i)
  await expect(page.locator('.em-v2-training-save-banner__fuel')).toContainText(/Fuel sugerido/i)
  const fuelHint = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutSaveBannerFuelHint()
  )
  expect(fuelHint).toMatch(/proteína/i)
  await expect(
    page.getByRole('button', { name: /Registrar post-entreno/i })
  ).toBeVisible()

  await page.getByRole('button', { name: /Registrar post-entreno/i }).click()

  const fuel = page.getByRole('dialog', { name: 'Registrar comida Fuel' })
  await expect(fuel).toBeVisible({ timeout: 10000 })
  await expect(fuel.getByPlaceholder('Nombre de la comida')).toHaveValue('Post-entreno')
})