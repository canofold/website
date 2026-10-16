import { expect, test } from '@playwright/test'

for (const locale of [
  { root: '/', nav: '主导航', title: 'Canofold｜面向人与 AI 的 Markdown 知识编译器', heading: 'VS Code 扩展', status: '实验阶段', start: '快速开始', try: '在线体验' },
  { root: '/en/', nav: 'Primary navigation', title: 'Canofold | A Markdown Knowledge Compiler for People and AI', heading: 'VS Code extension', status: 'experimental', start: 'Get started', try: 'Try it online' }
]) {
  for (const width of [1280, 390, 320]) {
    test(`${locale.root} 知识定位、SEO 与独立入口在 ${width}px 可用`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(locale.root)
      await expect(page).toHaveTitle(locale.title)
      await expect(page.locator('main').getByRole('link', { name: locale.start, exact: true })).toHaveAttribute('href', `${locale.root}guide/introduction/getting-started/`)
      await expect(page.locator('main').getByRole('link', { name: locale.try, exact: true })).toHaveAttribute('href', `${locale.root}markdown/playground/`)
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Markdown.*VS Code/)
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', locale.title)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://canofold.dev${locale.root}`)
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://canofold.dev/en/')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)

      const nav = page.getByRole('banner').getByRole('navigation', { name: locale.nav })
      if (width < 840) await page.locator('.cf-primary-menu > summary').click()
      await nav.getByRole('link', { name: 'VS Code', exact: true }).click()
      await expect(page).toHaveURL(`${locale.root}vscode/`)
      await expect(page.getByRole('heading', { name: locale.heading, level: 1 })).toBeVisible()
      await expect(page.getByRole('link', { name: 'VS Code Marketplace', exact: true })).toHaveAttribute('href', 'https://marketplace.visualstudio.com/items?itemName=canofold.canofold-vscode')

      if (width < 840) await page.locator('.cf-primary-menu > summary').click()
      await expect(nav.getByRole('link', { name: 'VS Code', exact: true })).toHaveAttribute('aria-current', 'page')
      await nav.getByRole('link', { name: 'Skills', exact: true }).click()
      await expect(page).toHaveURL(`${locale.root}skills/`)
      await expect(page.getByRole('heading', { name: 'Canofold Skills', level: 1 })).toBeVisible()
      if (width < 840) await page.locator('.cf-primary-menu > summary').click()
      await expect(nav.getByRole('link', { name: 'Skills', exact: true })).toHaveAttribute('aria-current', 'page')
      await expect(page.locator('main')).toContainText(locale.status)
      await expect(page.locator('main')).toContainText('canofold-knowledge-reader')
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    })
  }
}

test('320px 首页主导航在全部外观下可打开并用 Escape 关闭', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const options = page.locator('[data-canofold-theme-option]')
  await expect(options).toHaveCount(15)
  for (let index = 0; index < 15; index++) {
    await page.locator('.cf-theme-menu > summary').click()
    await options.nth(index).click()
    const menu = page.locator('.cf-primary-menu')
    await menu.locator('summary').click()
    const links = menu.getByRole('navigation').getByRole('link')
    await expect(links).toHaveCount(5)
    await expect(links.last()).toBeVisible()
    const bounds = await menu.getByRole('navigation').boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
    await page.keyboard.press('Escape')
    await expect(menu).not.toHaveAttribute('open')
  }
})
