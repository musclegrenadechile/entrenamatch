import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

test('E2E workout-flow — gym-log guardar + reseña post-entreno', async ({ page }) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.openWorkoutModal()
  })

  const workout = page.getByRole('dialog', { name: 'Entreno de Hoy' })
  await expect(workout).toBeVisible({ timeout: 12000 })
  await expect(workout.getByText('Press banca')).toBeVisible()
  await expect(workout.getByRole('status').filter({ hasText: /1 ejercicio · 1 serie/i })).toBeVisible()
  await expect(workout.getByLabel(/PR:/i)).toBeVisible()
  await expect(workout.getByText('Primer récord en este ejercicio')).toBeVisible()

  await workout.getByRole('button', { name: /Terminar y publicar/i }).click()
  await expect(workout).not.toBeVisible({ timeout: 15000 })

  await page.evaluate(() => {
    window.__entrenamatchE2E!.goToHomeTab()
  })
  await expect(page.getByText(/Entreno guardado/i)).toBeVisible({ timeout: 10000 })
  await expect(page.locator('.em-v2-training-save-banner__session')).toContainText(/1 serie/i)
  const sessionSummary = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutSaveBannerSessionSummary()
  )
  expect(sessionSummary).toMatch(/600 kg/)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.openReviewModal('p1')
  })

  const review = page.getByRole('dialog', { name: 'Reseña post-entreno' })
  await expect(review).toBeVisible({ timeout: 10000 })
  await expect(review.getByRole('status')).toContainText(/estrellas/i)
  await expect(review.getByRole('button', { name: 'Enviar reseña' })).toBeDisabled()
  await review.getByRole('button', { name: '5 estrellas' }).click()
  await expect(review.getByRole('status')).toContainText(/Buen match/i)
  await expect(review.getByRole('button', { name: 'Enviar reseña' })).toBeEnabled()
  await review.getByRole('button', { name: 'Enviar reseña' }).click()
  await expect(review).not.toBeVisible({ timeout: 10000 })
})