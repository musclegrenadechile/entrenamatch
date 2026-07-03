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
  const sessionChip = await page.evaluate(() =>
    window.__entrenamatchE2E!.getGymLogSessionChipText()
  )
  expect(sessionChip).toMatch(/1 ejercicio · 1 serie/i)
  const sessionAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getGymLogSessionChipAriaLabel()
  )
  expect(sessionAria).toMatch(/Sesión activa.*PR en vivo/i)
  const sessionTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getGymLogSessionChipToneClass()
  )
  expect(sessionTone).toBe('em-v2-gym-session-chip--has-pr')
  const sessionPrAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.isGymLogSessionPrToneAriaExpected()
  )
  expect(sessionPrAria).toBe(true)
  await expect(workout.getByLabel(/PR:/i)).toBeVisible()
  await expect(workout.getByText('Primer récord en este ejercicio')).toBeVisible()

  await workout.getByRole('button', { name: /Terminar y publicar/i }).click()
  await expect(workout).not.toBeVisible({ timeout: 15000 })

  await page.evaluate(() => {
    window.__entrenamatchE2E!.goToHomeTab()
  })
  await expect(page.getByText(/Entreno guardado/i)).toBeVisible({ timeout: 10000 })
  await expect(page.locator('.em-v2-training-save-banner__session')).toContainText(/1 serie/i)
  await expect(page.getByText('🏆 Nuevo PR')).toBeVisible()
  const sessionSummary = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutSaveBannerSessionSummary()
  )
  expect(sessionSummary).toMatch(/600 kg/)
  const bannerTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutSaveBannerToneClass()
  )
  expect(bannerTone).toBe('em-v2-training-save-banner--has-pr')
  const bannerAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutSaveBannerAriaLabel()
  )
  expect(bannerAria).toMatch(/récord personal/i)
  const bannerPrAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWorkoutSaveBannerPrToneAriaExpected()
  )
  expect(bannerPrAria).toBe(true)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.openReviewModal('p1')
  })

  const review = page.getByRole('dialog', { name: /Reseña post-entreno con récord personal/i })
  await expect(review).toBeVisible({ timeout: 10000 })
  await expect(review.getByText('🏆 Sesión con récord personal')).toBeVisible()
  const reviewTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getTrainingReviewCardToneClass()
  )
  expect(reviewTone).toBe('em-v2-review-modal__card--has-pr')
  const reviewAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getTrainingReviewCardAriaLabel()
  )
  expect(reviewAria).toMatch(/récord personal/i)
  const reviewPrAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.isTrainingReviewPrToneAriaExpected()
  )
  expect(reviewPrAria).toBe(true)
  await expect(review.getByRole('status').filter({ hasText: /estrellas|récord personal/i })).toBeVisible()
  await expect(review.getByRole('button', { name: 'Enviar reseña' })).toBeDisabled()
  await review.getByRole('button', { name: '5 estrellas' }).click()
  await expect(review.getByRole('status')).toContainText(/Buen match/i)
  await expect(review.getByRole('button', { name: 'Enviar reseña' })).toBeEnabled()
  await review.getByRole('button', { name: 'Enviar reseña' }).click()
  await expect(review).not.toBeVisible({ timeout: 10000 })
})