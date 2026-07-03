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
    window.__entrenamatchE2E!.openReviewModal('p1')
  })

  const review = page.getByRole('dialog', { name: 'Reseña post-entreno' })
  await expect(review).toBeVisible({ timeout: 10000 })
  await review.getByRole('button', { name: '5 estrellas' }).click()
  await review.getByRole('button', { name: 'Enviar reseña' }).click()
  await expect(review).not.toBeVisible({ timeout: 10000 })
})