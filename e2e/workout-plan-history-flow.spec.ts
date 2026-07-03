import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

test('E2E workout-plan-history-flow — guardar entreno y hint PR en EntrenaPlan', async ({
  page,
}) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.seedDemoFuelProfile()
    window.__entrenamatchE2E!.seedDemoFuelWeekLogs('surplus')
  })

  await page.evaluate(() => {
    window.__entrenamatchE2E!.openWorkoutModal()
  })

  const workout = page.getByRole('dialog', { name: 'Entreno de Hoy' })
  await expect(workout).toBeVisible({ timeout: 12000 })
  await expect(workout.getByText('Press banca')).toBeVisible()
  await workout.getByRole('button', { name: /Terminar y publicar/i }).click()
  await expect(workout).not.toBeVisible({ timeout: 15000 })

  await page.evaluate(() => {
    window.__entrenamatchE2E!.goToHomeTab()
  })

  const planCard = page.locator('.em-v2-plan').filter({ hasText: 'EntrenaPlan' })
  await expect(planCard).toBeVisible({ timeout: 12000 })
  await expect(planCard.locator('.em-v2-plan__history-hint')).toBeVisible({ timeout: 10000 })
  await expect(planCard.locator('.em-v2-plan__history-hint')).toContainText(/PR en Press banca/i)

  const hint = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanHistoryHint())
  expect(hint).toMatch(/10×60 kg|60 kg/)
  expect(hint).toContain('sigue progresando')

  await expect(planCard.locator('.em-v2-card__detail').first()).toContainText(/rotación/i)
  const detail = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanDetail())
  expect(detail).toMatch(/Tras PR|rotación/i)

  await expect(planCard.locator('.em-v2-plan__rotation-chip')).toBeVisible({ timeout: 10000 })
  const chip = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanRotationChip())
  expect(chip).toMatch(/rotación/i)
  const aria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanRotationAriaLabel()
  )
  expect(aria).toMatch(/tras PR|Pecho|Pull/i)

  await expect(planCard.locator('.em-v2-plan__fuel-week-chip')).toBeVisible({ timeout: 10000 })
  const fuelChip = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanFuelWeekChip())
  expect(fuelChip).toMatch(/Δ \+\d+ kcal/)

  await expect(planCard.locator('.em-v2-plan__fuel-week-hint')).toBeVisible({ timeout: 10000 })
  const fuelWeekHint = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekHint()
  )
  expect(fuelWeekHint).toMatch(/Superávit/i)
  const fuelWeekTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekToneClass()
  )
  expect(fuelWeekTone).toBe('em-v2-plan__fuel-week-hint--surplus')
})