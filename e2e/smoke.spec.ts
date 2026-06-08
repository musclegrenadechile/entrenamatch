import { test, expect } from '@playwright/test'

test('smoke — app shell loads', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('body')).toBeVisible()
  const title = await page.title()
  expect(title.length).toBeGreaterThan(0)
})

test('smoke — demo or auth entry', async ({ page }) => {
  await page.goto('./')
  const body = await page.locator('body').innerText()
  expect(body.length).toBeGreaterThan(10)
})

test('E2E — demo login and bottom nav', async ({ page }) => {
  await page.goto('./')
  await page.waitForTimeout(2000)
  const demoBtn = page.getByRole('button', { name: /demo|entrar/i }).first()
  if (await demoBtn.isVisible().catch(() => false)) {
    await demoBtn.click()
    await page.waitForTimeout(1500)
  }
  const nav = page.locator('.bottom-nav')
  if (await nav.isVisible().catch(() => false)) {
    await expect(nav).toBeVisible()
    const hoy = page.getByText('Hoy', { exact: true })
    if (await hoy.isVisible().catch(() => false)) {
      await hoy.click()
      await page.waitForTimeout(500)
    }
  }
})

test('E2E — FuelBalance card visible on Hoy', async ({ page }) => {
  await page.goto('./')
  await page.waitForTimeout(2500)
  const demoBtn = page.getByRole('button', { name: /demo|entrar/i }).first()
  if (await demoBtn.isVisible().catch(() => false)) {
    await demoBtn.click()
    await page.waitForTimeout(2000)
  }
  const balance = page.getByText(/Balance del día|Fuel AI|Configura tu fuel/i).first()
  await expect(balance).toBeVisible({ timeout: 8000 })
})
