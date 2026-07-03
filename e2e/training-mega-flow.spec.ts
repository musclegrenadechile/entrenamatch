import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

/** Oleada 381 — recorrido completo: gym-log → Fuel → sync → reseña. */
test('E2E training-mega-flow — entreno → Fuel → sync → reseña', async ({ page }) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.seedDemoFuelProfile()
  })

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
  await expect(page.locator('.em-v2-training-save-banner__fuel')).toContainText(/Fuel sugerido/i)

  const planCard = page.locator('.em-v2-plan').filter({ hasText: 'EntrenaPlan' })
  await expect(planCard).toBeVisible({ timeout: 12000 })
  await expect(planCard.locator('.em-v2-plan__history-hint')).toBeVisible({ timeout: 10000 })
  await expect(planCard.locator('.em-v2-plan__rotation-chip')).toBeVisible({ timeout: 10000 })
  await expect(planCard.locator('.em-v2-card__detail').first()).toContainText(/rotación/i)
  const detail = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanDetail())
  expect(detail).toMatch(/Tras PR|rotación/i)
  const chip = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanRotationChip())
  expect(chip).toMatch(/rotación/i)
  const aria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanRotationAriaLabel()
  )
  expect(aria).toMatch(/tras PR|siguiente sesión/i)

  await expect(planCard.locator('.em-v2-plan__fuel-week-hint')).toBeVisible({ timeout: 10000 })
  const fuelWeekHint = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekHint()
  )
  expect(fuelWeekHint).toMatch(/Registra.*día.*Fuel/i)
  const fuelWeekAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekAriaLabel()
  )
  expect(fuelWeekAria).toMatch(/Balance Fuel semanal/i)
  const fuelWeekTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekToneClass()
  )
  expect(fuelWeekTone).toBe('em-v2-plan__fuel-week-hint--under-fueled')

  await page.getByRole('button', { name: /Registrar post-entreno/i }).click()

  const fuel = page.getByRole('dialog', { name: 'Registrar comida Fuel' })
  await expect(fuel).toBeVisible({ timeout: 10000 })
  await expect(fuel.getByPlaceholder('Nombre de la comida')).toHaveValue('Post-entreno')
  await expect(fuel.locator('.em-v2-fuel-log__workout-prefill')).toContainText(/Sugerido del entreno/i)
  await expect(fuel.getByLabel('Calorías kcal')).toHaveValue('320')

  await page.evaluate(() => {
    window.__entrenamatchE2E!.closeFuelLogModal()
  })
  await expect(fuel).not.toBeVisible({ timeout: 8000 })

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

  const review = page.getByRole('dialog', { name: 'Reseña post-entreno' })
  await expect(review).toBeVisible({ timeout: 10000 })
  await review.getByRole('button', { name: '5 estrellas' }).click()
  await review.getByRole('button', { name: 'Enviar reseña' }).click()
  await expect(review).not.toBeVisible({ timeout: 10000 })

  await expect(page.locator('.bottom-nav')).toBeVisible()
})