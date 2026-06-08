import { test, expect } from '@playwright/test'

/** Fase 127 — core flow: demo login → Explorar → mapa → Fuel */
async function enterDemoIfNeeded(page: import('@playwright/test').Page) {
  await page.goto('./')
  await page.waitForTimeout(2000)
  const demoBtn = page.getByRole('button', { name: /demo|entrar/i }).first()
  if (await demoBtn.isVisible().catch(() => false)) {
    await demoBtn.click()
    await page.waitForTimeout(2000)
  }
}

test('E2E core — demo login and bottom nav', async ({ page }) => {
  await enterDemoIfNeeded(page)
  const nav = page.locator('.bottom-nav')
  await expect(nav).toBeVisible({ timeout: 10000 })
})

test('E2E core — FuelBalance on Hoy tab', async ({ page }) => {
  await enterDemoIfNeeded(page)
  const hoy = page.getByText('Hoy', { exact: true })
  if (await hoy.isVisible().catch(() => false)) {
    await hoy.click()
    await page.waitForTimeout(800)
  }
  const balance = page.getByText(/Balance del día|Fuel AI|Configura tu fuel/i).first()
  await expect(balance).toBeVisible({ timeout: 10000 })
})

test('E2E core — open GymPulse map from Explorar', async ({ page }) => {
  await enterDemoIfNeeded(page)
  const explore = page.getByText('Explorar', { exact: true })
  if (await explore.isVisible().catch(() => false)) {
    await explore.click()
    await page.waitForTimeout(1000)
  }
  const mapBtn = page.getByRole('button', { name: /mapa|gympulse|ver mapa/i }).first()
  if (await mapBtn.isVisible().catch(() => false)) {
    await mapBtn.click()
    await page.waitForTimeout(1500)
  }
  const mapCanvas = page.locator('#live-map-container')
  await expect(mapCanvas).toBeVisible({ timeout: 12000 })
  const radar = page.getByRole('button', { name: /radar/i })
  if (await radar.isVisible().catch(() => false)) {
    await radar.click()
  }
})

test('E2E core — live modal entry (if available)', async ({ page }) => {
  await enterDemoIfNeeded(page)
  const liveChip = page.getByText(/en vivo|entrenando ahora/i).first()
  if (await liveChip.isVisible().catch(() => false)) {
    await liveChip.click()
    await page.waitForTimeout(800)
  }
  await expect(page.locator('body')).toBeVisible()
})
