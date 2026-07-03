import { test, expect } from '@playwright/test'
import { enterDemo, waitForE2EHarness } from './helpers'

/** Oleada 380 — guardar entreno → banner → Fuel log con prefill post-entreno. */
test('E2E workout-fuel-flow — banner post-guardar → Fuel prefill', async ({ page }) => {
  await enterDemo(page)
  await waitForE2EHarness(page)

  await page.evaluate(() => {
    window.__entrenamatchE2E!.seedDemoFuelProfile()
    window.__entrenamatchE2E!.seedDemoFuelWeekLogs('deficit')
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
  await expect(page.locator('.em-v2-training-save-banner__session')).toContainText(/1 serie/i)
  await expect(page.locator('.em-v2-training-save-banner__fuel')).toContainText(/Fuel sugerido/i)
  const fuelHint = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWorkoutSaveBannerFuelHint()
  )
  expect(fuelHint).toMatch(/proteína/i)
  await expect(
    page.getByRole('button', { name: /Registrar post-entreno/i })
  ).toBeVisible()

  const planCard = page.locator('.em-v2-plan').filter({ hasText: 'EntrenaPlan' })
  await expect(planCard).toBeVisible({ timeout: 12000 })

  const scenarioClass = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanScenarioClass()
  )
  expect(scenarioClass).toBe('em-v2-plan--deficit')

  await expect(planCard.locator('.em-v2-plan__fuel-row')).toBeVisible({ timeout: 10000 })
  const fuelRowTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelRowToneClass()
  )
  expect(fuelRowTone).toBe('em-v2-plan__fuel-row--deficit')

  const toneStackAligned = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneStackAligned()
  )
  expect(toneStackAligned).toBe(true)
  const toneStackExpected = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneStackExpected('deficit')
  )
  expect(toneStackExpected).toBe(true)
  const nutritionTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanNutritionToneClass()
  )
  expect(nutritionTone).toBe('em-v2-plan__nutrition--deficit')
  const toneStackFullyExpected = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneStackFullyExpected('deficit')
  )
  expect(toneStackFullyExpected).toBe(true)

  await expect(planCard.locator('.em-v2-plan__headline-fuel')).toBeVisible({ timeout: 10000 })
  const headlineFuelChip = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelHeadlineChip()
  )
  expect(headlineFuelChip).toMatch(/Déficit/i)
  const headlineFuelTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelHeadlineChipToneClass()
  )
  expect(headlineFuelTone).toBe('em-v2-plan__headline-fuel--deficit')

  await expect(planCard.locator('.em-v2-plan__fuel-week-chip')).toBeVisible({ timeout: 10000 })
  const fuelChip = await page.evaluate(() => window.__entrenamatchE2E!.getWeeklyPlanFuelWeekChip())
  expect(fuelChip).toMatch(/Δ -\d+ kcal/)
  await expect(planCard.locator('.em-v2-plan__fuel-week-hint')).toBeVisible({ timeout: 10000 })
  const fuelWeekHint = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekHint()
  )
  expect(fuelWeekHint).toMatch(/Déficit/i)
  const fuelWeekTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekToneClass()
  )
  expect(fuelWeekTone).toBe('em-v2-plan__fuel-week-hint--deficit')
  const nutrition = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanNutritionNote()
  )
  expect(nutrition).toMatch(/proteína/i)

  await page.getByRole('button', { name: /Registrar post-entreno/i }).click()

  const fuel = page.getByRole('dialog', { name: 'Registrar comida Fuel' })
  await expect(fuel).toBeVisible({ timeout: 10000 })
  await expect(fuel.getByPlaceholder('Nombre de la comida')).toHaveValue('Post-entreno')
  await expect(fuel.locator('.em-v2-fuel-log__workout-prefill')).toContainText(/Sugerido del entreno/i)
  await expect(fuel.getByRole('status').filter({ hasText: /Sugerido del entreno/i })).toBeVisible()
  await expect(fuel.getByLabel('Calorías kcal')).toHaveValue('320')
  await expect(fuel.getByLabel('Proteína en gramos')).not.toHaveValue('35')
  const macros = await page.evaluate(() => window.__entrenamatchE2E!.getFuelLogPrefillMacros())
  expect(macros?.kcal).toBe(320)
  expect(macros?.proteinG).toBeGreaterThan(0)
})