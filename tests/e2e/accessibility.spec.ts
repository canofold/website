import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

for (let index = 0; index < 15; index++) {
  test(`首页按钮在默认和 hover 状态保持可读：外观 ${index + 1}/15`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const options = page.locator('[data-canofold-theme-option]')
    await expect(options).toHaveCount(15)
    const option = options.nth(index)
    const value = await option.getAttribute('data-canofold-theme-option')
    if (!value) throw new Error('Missing theme selection')
    await page.locator('.cf-theme-menu > summary').click()
    await option.click()
    const [theme, appearance] = value.split(':')
    if (!theme || !appearance) throw new Error(`Invalid theme selection: ${value}`)
    await expect(page.locator('html')).toHaveAttribute('data-cf-theme', theme)
    await expect(page.locator('html')).toHaveAttribute('data-cf-theme-appearance', appearance)
    const buttons = page.locator('.cf-btn')
    await expect(buttons).toHaveCount(2)
    await page.getByRole('heading', { level: 1 }).hover()
    let results = await new AxeBuilder({ page }).include('.cf-btn').withTags(wcagTags).analyze()
    expect(summarizeViolations(results.violations), `${value} default buttons`).toEqual([])
    for (let index = 0; index < await buttons.count(); index++) {
      await buttons.nth(index).hover()
      results = await new AxeBuilder({ page }).include('.cf-btn').withTags(wcagTags).analyze()
      expect(summarizeViolations(results.violations), `${value} button ${index} hover`).toEqual([])
    }
  })
}

function summarizeViolations(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) {
  return violations.map(({ id, nodes }) => ({
    id,
    count: nodes.length,
    examples: nodes.slice(0, 5).map(({ target, any, failureSummary }) => ({
      target: target.join(' '),
      failureSummary,
      checks: any.map(({ id: checkId, data }) => ({ id: checkId, data }))
    }))
  }))
}

for (const route of ['/', '/guide/introduction/what-is-canofold/', '/markdown/syntax/']) {
  test(`基础阅读页面符合自动无障碍规则：${route}`, async ({ page }) => {
    await page.goto(route)
    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
    expect(summarizeViolations(results.violations)).toEqual([])
  })
}

test('搜索对话框符合自动无障碍规则', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '搜索文档' }).click()
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
  expect(summarizeViolations(results.violations)).toEqual([])
})

test('深色阅读和代码示例符合自动无障碍规则', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/markdown/syntax/')
  await page.locator('.cf-theme-menu > summary').click()
  await page.locator('[data-canofold-theme-option="canofold:dark"]').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect.poll(() => page.locator('body').evaluate((element) => getComputedStyle(element).color)).toBe('rgb(227, 227, 232)')
  await expect.poll(() => page.locator('p[data-cf-element="paragraph"]').first().evaluate((element) => getComputedStyle(element).color)).toBe('rgb(227, 227, 232)')
  await expect.poll(() => page.locator('.cf-search-trigger span').evaluate((element) => getComputedStyle(element).color)).toBe('rgb(185, 185, 192)')
  await expect.poll(() => page.locator('.cf-sort-label').first().evaluate((element) => getComputedStyle(element).color)).toBe('rgb(245, 245, 247)')
  await expect.poll(() => page.locator('.cf-data-table tbody td').evaluateAll((cells) =>
    cells.length > 0 && cells.every((cell) => getComputedStyle(cell).color === 'rgb(227, 227, 232)')
  )).toBe(true)
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
  expect(summarizeViolations(results.violations)).toEqual([])
})

test('减少动画偏好同时控制页面和代码标签栏的滚动', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/guide/introduction/installation/')
  const tabs = page.locator('.cf-tabs-list').first()
  await expect(tabs).toBeAttached()
  await expect.poll(() => tabs.evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe('smooth')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => tabs.evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe('auto')
  await expect.poll(() => page.locator('html').evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe('auto')
})

for (const route of ['/markdown/syntax/', '/guide/writing/component-demos/']) {
  test(`320px 阅读重排没有整页横向溢出：${route}`, async ({ page }) => {
    // 1280px at 400% browser zoom has a 320 CSS-pixel layout viewport.
    // This checks reflow, not browser UI zoom or a manual screen-reader audit.
    await page.setViewportSize({ width: 320, height: 700 })
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
    await page.getByRole('button', { name: '搜索文档' }).click()
    const search = page.getByRole('searchbox', { name: '搜索文档' })
    await expect(search).toBeFocused()
    const bounds = await search.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: '搜索文档' })).toBeHidden()
  })
}
