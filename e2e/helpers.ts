import { expect, type Page } from '@playwright/test'

export async function enterDemo(page: Page, query = '?e2e=1') {
  await page.goto(`./${query}`)
  await page.waitForTimeout(2000)
  const demoBtn = page.getByRole('button', { name: /modo prueba|solo este dispositivo/i }).first()
  if (await demoBtn.isVisible().catch(() => false)) {
    await demoBtn.click()
    await page.waitForTimeout(2500)
  }
}

export async function waitForE2EHarness(page: Page) {
  await expect(page.locator('.bottom-nav')).toBeVisible({ timeout: 20000 })
  await page.waitForFunction(() => !!(window as Window & { __entrenamatchE2E?: unknown }).__entrenamatchE2E, {
    timeout: 20000,
  })
}

export async function goToMapTab(page: Page) {
  const explore = page.getByText('Explorar', { exact: true })
  if (await explore.isVisible().catch(() => false)) {
    await explore.click()
    await page.waitForTimeout(800)
  }
  const mapBtn = page.getByRole('button', { name: /mapa|gympulse|ver mapa/i }).first()
  if (await mapBtn.isVisible().catch(() => false)) {
    await mapBtn.click()
    await page.waitForTimeout(1200)
  }
  await expect(page.locator('#live-map-container')).toBeVisible({ timeout: 12000 })
}
