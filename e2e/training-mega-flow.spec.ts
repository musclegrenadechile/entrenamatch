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
  const scenarioClass = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanScenarioClass()
  )
  expect(scenarioClass).toBe('em-v2-plan--under-fueled')

  await expect(planCard.locator('.em-v2-plan__fuel-row')).toBeVisible({ timeout: 10000 })
  const fuelRowTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelRowToneClass()
  )
  expect(fuelRowTone).toBe('em-v2-plan__fuel-row--under-fueled')

  const toneStackAligned = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneStackAligned()
  )
  expect(toneStackAligned).toBe(true)
  const toneStackExpected = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneStackExpected('under-fueled')
  )
  expect(toneStackExpected).toBe(true)
  const nutritionTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanNutritionToneClass()
  )
  expect(nutritionTone).toBe('em-v2-plan__nutrition--under-fueled')
  const toneStackFullyExpected = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneStackFullyExpected('under-fueled')
  )
  expect(toneStackFullyExpected).toBe(true)

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

  await expect(planCard.locator('.em-v2-plan__headline-fuel')).toBeVisible({ timeout: 10000 })
  const headlineFuelChip = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelHeadlineChip()
  )
  expect(headlineFuelChip).toMatch(/Afinar Fuel/i)
  const headlineFuelTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelHeadlineChipToneClass()
  )
  expect(headlineFuelTone).toBe('em-v2-plan__headline-fuel--under-fueled')

  await expect(planCard.locator('.em-v2-plan__fuel-week-hint')).toBeVisible({ timeout: 10000 })
  const fuelWeekHint = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekHint()
  )
  expect(fuelWeekHint).toMatch(/Registra.*día.*Fuel/i)
  const fuelWeekAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekAriaLabel()
  )
  expect(fuelWeekAria).toMatch(/Balance Fuel semanal.*Afinar Fuel/i)
  const fuelWeekTone = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanFuelWeekToneClass()
  )
  expect(fuelWeekTone).toBe('em-v2-plan__fuel-week-hint--under-fueled')

  await expect(planCard.locator('.em-v2-plan__nutrition')).toBeVisible({ timeout: 10000 })
  const nutrition = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanNutritionNote()
  )
  expect(nutrition).toMatch(/Registra|Fuel|macros/i)
  const nutritionAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanNutritionAriaLabel()
  )
  expect(nutritionAria).toMatch(/Nutrición EntrenaPlan.*Afinar Fuel/i)
  const toneAriaAligned = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneAriaAligned('under-fueled')
  )
  expect(toneAriaAligned).toBe(true)
  const cardAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.getWeeklyPlanCardAriaLabel()
  )
  expect(cardAria).toMatch(/Plan de entreno recomendado.*Afinar Fuel/i)
  const cardToneAria = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelCardToneAriaExpected('under-fueled')
  )
  expect(cardToneAria).toBe(true)
  const toneStackFullySynced = await page.evaluate(() =>
    window.__entrenamatchE2E!.isWeeklyPlanFuelToneStackFullySynced('under-fueled')
  )
  expect(toneStackFullySynced).toBe(true)

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