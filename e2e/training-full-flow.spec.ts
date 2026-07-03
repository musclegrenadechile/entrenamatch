import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

/** Oleada 379 — entreno → sync mock → reseña. Oleada 450 — tono PR×reseña post-sync. */
test('E2E training-full-flow — gym-log → sync → reseña', async ({ page }) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.openWorkoutModal()
  })
  const workout = page.getByRole('dialog', { name: 'Entreno de Hoy' })
  await expect(workout).toBeVisible({ timeout: 12000 })
  await workout.getByRole('button', { name: /Terminar y publicar/i }).click()
  await expect(workout).not.toBeVisible({ timeout: 15000 })

  await page.evaluate(async () => {
    await window.__entrenamatchE2E!.enableLive()
  })
  await page.waitForTimeout(600)

  await page.evaluate(async () => {
    await window.__entrenamatchE2E!.startMockSync('p1', 'Camila Morales')
  })

  const arena = page.getByRole('dialog', { name: 'Sala Sync EntrenaSync' })
  await expect(arena).toBeVisible({ timeout: 15000 })

  await page.evaluate(() => {
    window.__entrenamatchE2E!.closeArena()
  })
  await expect(arena).not.toBeVisible({ timeout: 10000 })

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
  await review.getByRole('button', { name: '4 estrellas' }).click()
  await review.getByRole('button', { name: 'Enviar reseña' }).click()
  await expect(review).not.toBeVisible({ timeout: 10000 })

  await expect(page.locator('.bottom-nav')).toBeVisible()
})