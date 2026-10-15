import { expect, test, type Page } from '@playwright/test'

function captureRuntimeErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    const location = message.location().url
    const expectedSandboxBlock =
      (text.includes("document's frame is sandboxed") && text.includes("'allow-scripts'")) ||
      (text.includes("from origin 'null'") && text.includes('blocked by CORS policy')) ||
      (text === 'Failed to load resource: net::ERR_FAILED' &&
        ['/assets/canofold-shell.js', '/assets/canofold-search.js'].some((path) =>
          location.endsWith(path)
        ))
    if (!expectedSandboxBlock) errors.push(text)
  })
  return () => expect(errors, '页面不应产生运行时错误').toEqual([])
}

async function scrollRatio(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const node = element as HTMLElement
    const max = node.scrollHeight - node.clientHeight
    return max > 0 ? node.scrollTop / max : 0
  })
}

test('首页、搜索和站内导航可以正常使用', async ({ page }) => {
  const expectNoRuntimeErrors = captureRuntimeErrors(page)
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1, name: 'Canofold' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible()
  await expect(page.locator('main > article.cf-content')).toHaveCount(0)

  await page.getByRole('button', { name: '搜索文档' }).click()
  const search = page.getByRole('searchbox', { name: '搜索文档' })
  await expect(search).toBeFocused()
  await search.fill('Playground')
  const result = page.locator('[data-canofold-search-results] a').filter({ hasText: 'Playground' }).first()
  await expect(result).toBeVisible()
  await result.click()

  await expect(page).toHaveURL(/\/markdown\/playground\/(?:#.*)?$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Markdown Playground' })).toBeVisible()
  expectNoRuntimeErrors()
})

test('首页插图持续运动并尊重减少动画偏好', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const illustration = page.locator('.cf-hero-visual img')
  await expect(illustration).toBeVisible()
  await expect(illustration).toHaveCSS('animation-name', 'cf-home-visual-float')
  const first = await illustration.evaluate((element) => getComputedStyle(element).transform)
  await expect.poll(() => illustration.evaluate((element) => getComputedStyle(element).transform)).not.toBe(first)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(illustration).toHaveCSS('animation-iteration-count', '1')
  await expect.poll(() => illustration.evaluate((element) => element.getAnimations().some((animation) => animation.playState === 'running'))).toBe(false)
})

test('同色系主题切换重新渲染 Mermaid，保留源码和缩放操作', async ({ page }) => {
  const expectNoRuntimeErrors = captureRuntimeErrors(page)
  await page.goto('/markdown/playground/', { waitUntil: 'domcontentloaded' })
  const source = page.locator('[data-canofold-playground-source]')
  await source.fill('```mermaid\nflowchart LR\n Theme --> Preview\n```')
  const figure = page.locator('[data-canofold-playground-preview] figure[data-cf-plugin-diagram="mermaid"]')
  const svg = figure.locator('.cf-diagram-preview > svg')
  // The hidden next preview coexists with the previous preview until enhancement completes.
  await expect.poll(() => figure.evaluateAll((elements) => elements.map((element) => ({
    source: element.getAttribute('data-cf-source'),
    rendering: element.getAttribute('data-cf-rendering') === 'true'
  })))).toEqual([{ source: expect.stringContaining('Theme --> Preview'), rendering: false }])
  await expect(svg).toBeVisible()
  for (const theme of ['neo-brutalist', 'neumorphism', 'glassmorphism']) {
    const previous = await svg.getAttribute('id')
    await page.locator('.cf-theme-menu > summary').click()
    await page.locator(`[data-canofold-theme-option="${theme}:default"]`).click()
    await expect(page.locator('html')).toHaveAttribute('data-cf-theme', theme)
    await expect(svg).toBeVisible()
    await expect(svg).not.toHaveAttribute('id', previous!)
    await expect(figure).not.toHaveAttribute('data-cf-render-error', 'true')
  }
  await figure.locator('[data-cf-diagram-action="source"]').click()
  await expect(figure.locator('.cf-diagram-source')).toBeVisible()
  await figure.locator('[data-cf-diagram-action="source"]').click()
  await figure.locator('[data-cf-diagram-action="zoom-in"]').click()
  await expect(figure.locator('[data-cf-diagram-action="zoom-reset"]')).toBeEnabled()
  expectNoRuntimeErrors()
})

test('多词搜索保留正文命中的正确页面，并按语言隔离结果', async ({ page }) => {
  const expectNoRuntimeErrors = captureRuntimeErrors(page)
  await page.goto('/')
  await page.getByRole('button', { name: '搜索文档' }).click()
  const search = page.getByRole('searchbox', { name: '搜索文档' })
  await search.fill('Cloudflare Pages 部署')
  await expect(page.locator('[data-canofold-search-results] a[href^="/guide/delivery/deployment/"]')).toBeVisible()
  await expect(page.locator('[data-canofold-search-results] a[href^="/en/"]')).toHaveCount(0)
  await search.fill('zzqxyvnotapage93821')
  await expect(page.locator('[data-canofold-search-results]')).toContainText('没有找到匹配文档')
  expectNoRuntimeErrors()

  await page.goto('/en/')
  await page.getByRole('button', { name: 'Search docs' }).click()
  const englishSearch = page.getByRole('searchbox', { name: 'Search docs' })
  await englishSearch.fill('keep older docs versions')
  await expect(page.locator('[data-canofold-search-results] a[href^="/en/guide/site/versions/"]')).toBeVisible()
  await expect(page.locator('[data-canofold-search-results] a[href^="/guide/"]')).toHaveCount(0)
  expectNoRuntimeErrors()
})

test('搜索对话框可用键盘打开、保持焦点并在关闭后返回触发位置', async ({ page }) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: '搜索文档' })
  await trigger.focus()
  await trigger.press('Enter')
  const dialog = page.getByRole('dialog', { name: '搜索文档' })
  await expect(dialog).toBeVisible()
  await expect(page.getByRole('searchbox', { name: '搜索文档' })).toBeFocused()

  await page.keyboard.press('Shift+Tab')
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))).toBe(true)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('searchbox', { name: '搜索文档' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('指南侧栏在站内导航后保留位置且不整页刷新', async ({ page }) => {
  test.setTimeout(30_000)
  const expectNoRuntimeErrors = captureRuntimeErrors(page)
  await page.setViewportSize({ width: 1280, height: 560 })
  await page.goto('/guide/introduction/what-is-canofold/')

  const sidebar = page.locator('[data-canofold-sidebar]')
  const target = sidebar.locator('a[href="/guide/delivery/deployment/"]')
  await expect(sidebar).toBeVisible()
  await expect(target).toBeAttached()
  await target.scrollIntoViewIfNeeded()

  const before = await sidebar.evaluate((element) => ({
    scrollTop: element.scrollTop,
    top: element.getBoundingClientRect().top,
    width: element.getBoundingClientRect().width,
    scrollable: element.scrollHeight > element.clientHeight
  }))
  expect(before.scrollable).toBe(true)
  await page.evaluate(() => {
    ;(window as Window & { __canofoldE2EMarker?: string }).__canofoldE2EMarker = 'preserved'
  })

  await target.click()
  await expect(page).toHaveURL(/\/guide\/delivery\/deployment\/$/)
  await expect(page.getByRole('heading', { level: 1, name: '部署' })).toBeVisible()

  await expect.poll(() => sidebar.evaluate((element) => element.scrollTop)).toBeCloseTo(before.scrollTop, 0)
  const after = await sidebar.evaluate((element) => ({
    top: element.getBoundingClientRect().top,
    width: element.getBoundingClientRect().width
  }))
  expect(after.top).toBeCloseTo(before.top, 0)
  expect(after.width).toBeCloseTo(before.width, 0)
  await expect
    .poll(() =>
      page.evaluate(() => (window as Window & { __canofoldE2EMarker?: string }).__canofoldE2EMarker)
    )
    .toBe('preserved')
  expectNoRuntimeErrors()
})

test('点击后续目录标题时阅读进度不会倒退', async ({ page }) => {
  const expectNoRuntimeErrors = captureRuntimeErrors(page)
  const samePageFetches: string[] = []
  page.on('request', (request) => {
    if (request.resourceType() === 'fetch' && new URL(request.url()).pathname === '/markdown/syntax/') {
      samePageFetches.push(request.url())
    }
  })
  await page.goto('/markdown/syntax/')

  const outline = page.locator('[data-canofold-outline]')
  await outline.getByRole('link', { name: '代码块标题与标注' }).click()
  await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe('#代码块标题与标注')
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)

  const initial = await page.locator('[data-canofold-progress]').evaluate((element) => {
    const read = () => Number(element.getAttribute('style')?.match(/scaleX\(([^)]+)\)/)?.[1] ?? 0)
    const initialValue = read()
    const values = [initialValue]
    const observer = new MutationObserver(() => values.push(read()))
    observer.observe(element, { attributes: true, attributeFilter: ['style'] })
    ;(window as Window & { __canofoldProgressValues?: number[] }).__canofoldProgressValues = values
    return initialValue
  })

  await outline.getByRole('link', { name: '文件树', exact: true }).click()
  await expect.poll(() => page.evaluate(() => decodeURIComponent(location.hash))).toBe('#文件树')
  await expect
    .poll(() =>
      page.evaluate(() => {
        const values = (window as Window & { __canofoldProgressValues?: number[] }).__canofoldProgressValues
        return values?.at(-1) ?? 0
      })
    )
    .toBeGreaterThan(initial)

  const values = await page.evaluate(
    () => (window as Window & { __canofoldProgressValues?: number[] }).__canofoldProgressValues ?? []
  )
  expect(values.length).toBeGreaterThan(1)
  expect(Math.min(...values)).toBeGreaterThanOrEqual(initial - 0.01)
  await expect(outline.getByRole('link', { name: '文件树', exact: true })).toHaveAttribute(
    'data-active',
    'true'
  )
  expect(samePageFetches, '同页目录跳转不应请求并重建整页').toEqual([])
  expectNoRuntimeErrors()
})

test('Playground 实时预览不闪空白并保持双向滚动同步', async ({ page }) => {
  test.setTimeout(30_000)
  const expectNoRuntimeErrors = captureRuntimeErrors(page)
  await page.goto('/markdown/playground/', { waitUntil: 'domcontentloaded' })

  const playground = page.locator('[data-canofold-playground]')
  const source = page.locator('[data-canofold-playground-source]')
  const preview = page.locator('[data-canofold-playground-preview]')
  await expect(playground).toHaveAttribute('data-canofold-playground-ready', '')
  await expect(preview.locator('.katex').first()).toBeVisible()
  await expect(preview.locator('.cf-diagram-preview svg').first()).toBeVisible()

  await preview.evaluate((element) => {
    const state = { blank: false }
    const check = () => {
      if (!(element.textContent ?? '').trim() || element.getBoundingClientRect().height === 0) {
        state.blank = true
      }
    }
    new MutationObserver(check).observe(element, { childList: true, subtree: true })
    ;(window as Window & { __canofoldPreviewState?: { blank: boolean } }).__canofoldPreviewState = state
  })

  const original = await source.inputValue()
  await source.fill(`${original}\n\n## E2E 实时预览\n\n预览内容已更新。`)
  await expect(preview.getByRole('heading', { level: 2, name: 'E2E 实时预览' })).toBeVisible()
  await expect(page.locator('[data-canofold-playground-error]')).toHaveCount(0)
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __canofoldPreviewState?: { blank: boolean } }).__canofoldPreviewState?.blank ??
        true
    )
  ).toBe(false)

  await source.evaluate((element) => {
    element.scrollTop = (element.scrollHeight - element.clientHeight) * 0.6
    element.dispatchEvent(new Event('scroll'))
  })
  await expect.poll(() => scrollRatio(page, '[data-canofold-playground-preview]')).toBeCloseTo(0.6, 1)

  // Let the browser dispatch the programmatic preview scroll before exercising the reverse direction.
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  )

  await preview.evaluate((element) => {
    element.scrollTop = (element.scrollHeight - element.clientHeight) * 0.25
    element.dispatchEvent(new Event('scroll'))
  })
  await expect.poll(() => scrollRatio(page, '[data-canofold-playground-source]')).toBeCloseTo(0.25, 1)

  const resizer = page.locator('[data-canofold-playground-resizer]')
  await resizer.focus()
  await resizer.press('ArrowRight')
  await expect(resizer).toHaveAttribute('aria-valuenow', '47')
  expectNoRuntimeErrors()
})

test('Vite 组件示例支持内联交互、源码切换和 iframe 隔离', async ({ page }) => {
  const expectNoRuntimeErrors = captureRuntimeErrors(page)
  await page.goto('/guide/writing/component-demos/')

  const demos = page.locator('[data-cf-component="demo"]')
  await expect(demos).toHaveCount(2)

  const inlineDemo = demos.nth(0)
  await expect(inlineDemo.getByText('Stable channel')).toBeVisible()
  await inlineDemo.getByRole('button', { name: 'Preview' }).click()
  await expect(inlineDemo.getByText('Preview channel')).toBeVisible()
  await expect(inlineDemo.getByRole('button', { name: 'Preview' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )

  const source = inlineDemo.locator('[data-cf-demo-source]')
  const sourceToggle = inlineDemo.locator('[data-cf-demo-source-toggle]')
  await expect(source).toBeHidden()
  await expect(sourceToggle).toHaveAttribute('aria-label', '查看代码')
  await sourceToggle.click()
  await expect(sourceToggle).toHaveAttribute('aria-expanded', 'true')
  await expect(sourceToggle).toHaveAttribute('aria-label', '收起代码')
  await expect(source).toBeVisible()
  await expect(source).toContainText("from './ReleaseChannel'")

  const isolatedDemo = demos.nth(1)
  const frame = isolatedDemo.locator('iframe.cf-demo-frame')
  await expect(frame).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin')
  await expect(isolatedDemo.frameLocator('iframe').getByRole('button', { name: 'Stable' })).toBeVisible()
  expectNoRuntimeErrors()
})

test('Mermaid 布局、数学标签和编辑恢复使用真实浏览器运行时', async ({ page }) => {
  let invalid = false
  const errors: string[] = []
  const requests: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => requests.push(request.url()))
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    if (invalid && message.text().startsWith('[canofold] mermaid render failed:')) return
    errors.push(message.text())
  })
  await page.goto('/markdown/playground/', { waitUntil: 'domcontentloaded' })
  const source = page.locator('[data-canofold-playground-source]')
  const preview = page.locator('[data-canofold-playground-preview]')
  const diagrams = preview.locator('figure[data-cf-plugin-diagram="mermaid"]')
  const fences = [
    'flowchart LR\n Input["$$E=mc^2$$"] --> Preview',
    'sequenceDiagram\n Alice->>Bob: Ready',
    'classDiagram\n Document --> Preview',
    'stateDiagram-v2\n [*] --> Ready\n Ready --> [*]',
    'erDiagram\n DOCUMENT ||--o{ PREVIEW : renders',
    '---\nconfig:\n  layout: elk\n---\nflowchart LR\n Source --> ELK --> Preview'
  ]
  await source.fill(fences.map((diagram) => `\`\`\`mermaid\n${diagram}\n\`\`\``).join('\n\n'))
  await expect(diagrams).toHaveCount(6)
  await expect(diagrams.locator('.cf-diagram-preview > svg')).toHaveCount(6)
  await expect(diagrams.first().locator('.katex')).toHaveCount(1)
  expect(requests.some((url) => /elk.*\.mjs/.test(url))).toBe(true)
  for (const figure of [diagrams.first(), diagrams.last()]) {
    await expect(figure).not.toHaveAttribute('data-cf-render-error', 'true')
    await figure.locator('[data-cf-diagram-action="zoom-in"]').click()
    await expect(figure.locator('[data-cf-diagram-action="zoom-reset"]')).toBeEnabled()
    await figure.locator('[data-cf-diagram-action="zoom-reset"]').click()
    await figure.locator('[data-cf-diagram-action="source"]').click()
    await expect(figure.locator('.cf-diagram-source')).toBeVisible()
    await figure.locator('[data-cf-diagram-action="source"]').click()
    await figure.locator('[data-cf-diagram-action="expand"]').click()
    await expect(page.locator('dialog.cf-diagram-dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('dialog.cf-diagram-dialog')).toHaveCount(0)
  }
  for (let index = 0; index < 12; index++) {
    await source.fill(`\`\`\`mermaid\nflowchart LR\n Edit_${index} --> Latest\n\`\`\``)
  }
  await expect(diagrams).toHaveCount(1)
  await expect(diagrams.locator('.cf-diagram-preview')).toContainText('Edit_11')
  invalid = true
  await source.fill('```mermaid\nflowchart LR\n A --> [\n```')
  await expect(diagrams).toHaveAttribute('data-cf-render-error', 'true')
  await expect(diagrams).not.toHaveAttribute('data-cf-rendering', 'true')
  invalid = false
  await source.fill('```mermaid\nflowchart LR\n Recovered --> Preview\n```')
  await expect(diagrams.locator('.cf-diagram-preview')).toContainText('Recovered')
  await expect(diagrams).not.toHaveAttribute('data-cf-render-error', 'true')
  expect(errors).toEqual([])
})

test('长代码块行号在三位数时保留独立槽位', async ({ page }) => {
  await page.goto('/markdown/playground/', { waitUntil: 'domcontentloaded' })
  const source = page.locator('[data-canofold-playground-source]')
  const preview = page.locator('[data-canofold-playground-preview]')
  const lines = Array.from({ length: 120 }, (_, index) => `const line${index + 1} = ${index + 1}`)
  await source.fill(['```ts', ...lines, '```'].join('\n'))

  const renderedLines = preview.locator('.cf-code .line')
  await expect(renderedLines).toHaveCount(120)
  const gutter = await renderedLines.last().evaluate((line) => {
    const before = getComputedStyle(line, '::before')
    return { width: Number.parseFloat(before.width), padding: Number.parseFloat(getComputedStyle(line).paddingLeft) }
  })
  expect(gutter.width).toBeGreaterThan(30)
  expect(gutter.padding).toBeGreaterThan(gutter.width)
})

test('图片放大后可点击空白区域或按 Escape 关闭', async ({ page }) => {
  await page.goto('/markdown/playground/', { waitUntil: 'domcontentloaded' })
  const trigger = page.locator('[data-canofold-playground-preview]').getByRole('button', { name: '放大图片' }).first()
  const dialog = page.getByRole('dialog', { name: '放大图片' })

  await trigger.click()
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('img', { name: '桌面上的文档工作区' })).toBeVisible()
  await dialog.locator('.cf-image-lightbox-backdrop').click({ position: { x: 10, y: 10 } })
  await expect(dialog).toHaveCount(0)

  await trigger.click()
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
})

test.describe('移动端 Playground', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('右上角图标在源码和预览之间切换', async ({ page }) => {
    const expectNoRuntimeErrors = captureRuntimeErrors(page)
    // Ready locators below gate our UI; external media must not gate navigation.
    await page.goto('/markdown/playground/', { waitUntil: 'domcontentloaded' })

    const playground = page.locator('[data-canofold-playground]')
    const toggle = page.locator('[data-canofold-playground-toggle]')
    const source = page.locator('[data-canofold-playground-source]')
    const preview = page.locator('[data-canofold-playground-preview]')
    await expect(toggle).toBeVisible()
    await expect(playground).toHaveAttribute('data-view', 'preview')
    await expect(preview).toBeVisible()

    await toggle.click()
    await expect(playground).toHaveAttribute('data-view', 'source')
    await expect(source).toBeVisible()

    await toggle.click()
    await expect(playground).toHaveAttribute('data-view', 'preview')
    await expect(preview).toBeVisible()
    expectNoRuntimeErrors()
  })
})

test.describe('移动端导航', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('触屏设备上的标题锚点无需悬停即可发现', async ({ page }) => {
    await page.goto('/markdown/syntax/')
    const anchor = page.locator('.cf-content .cf-anchor-island').first()
    await anchor.scrollIntoViewIfNeeded()
    await expect(anchor.getByRole('button', { name: '复制章节链接' })).toBeVisible()
    await expect.poll(() => anchor.evaluate((element) => getComputedStyle(element).opacity)).toBe('1')
  })

})

test.describe('320px 窄屏导航', () => {
  test.use({ viewport: { width: 320, height: 844 }, hasTouch: true, isMobile: true })

  test('GitHub 入口保持在视口内且页面不横向溢出', async ({ page }) => {
    await page.goto('/guide/introduction/what-is-canofold/')

    const github = page.getByRole('link', { name: 'GitHub 仓库' })
    await expect(github).toBeVisible()

    const box = await github.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(320)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  })
})
