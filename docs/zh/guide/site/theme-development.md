---
title: 开发主题包
description: 定义主题与外观、编写视觉 CSS，并打包验证第三方 Canofold 主题
group: 指南
subgroup: 站点能力
order: 36.5
---

# 开发主题包

主题包是独立的 npm 包，分别导出定义和 CSS。消费方把定义放入 `themes`，不需要修改 Core 或注册全局主题。选择现有主题见[定制主题](/guide/site/customization/)。

## 创建最小包

以下主题复用官方基础配色，再覆盖自己的变量。JavaScript 入口无需额外构建工具，单独的声明支持 TypeScript 消费方。

:::file-tree
- canofold-theme/
  - package.json
  - index.js
  - index.d.ts
  - aurora.css
  - LICENSE
:::

```json title="package.json"
{
  "name": "@acme/canofold-theme",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "files": ["index.js", "index.d.ts", "aurora.css", "LICENSE"],
  "exports": {
    ".": { "types": "./index.d.ts", "import": "./index.js" },
    "./aurora.css": "./aurora.css"
  },
  "peerDependencies": { "@canofold/themes": "^0.6.3" }
}
```

发布时替换示例作用域 `@acme`，并提供对应许可证。开发时也要安装 peer dependency。CSS 必须进入 `files` 和 `exports`，不能只存在于源码目录。

```js title="index.js"
import { defineTheme } from '@canofold/themes'

export default defineTheme({
  id: 'aurora',
  name: { zh: '极光', en: 'Aurora' },
  styles: ['@canofold/themes/canofold.css', '@acme/canofold-theme/aurora.css'],
  appearances: [
    { id: 'light', name: { zh: '浅色', en: 'Light' }, colorScheme: 'light' },
    { id: 'dark', name: { zh: '深色', en: 'Dark' }, colorScheme: 'dark' }
  ]
})
```

```ts title="index.d.ts"
import type { ThemeDefinition } from '@canofold/themes'

declare const aurora: ThemeDefinition
export default aurora
```

## 定义契约

| 字段 | 约束 |
|---|---|
| `id` | 稳定的小写 kebab-case；同一站点内不能重复 |
| `name` | 至少一个非空名称；键使用 BCP 47 locale 或基础语言，如 `zh`、`en`、`zh-CN` |
| `styles` | 非空、无重复的 CSS 入口列表，按级联顺序加载 |
| `appearances` | 至少一个外观；外观 ID 在主题中唯一，名称规则与主题相同 |
| `colorScheme` | 仅 `light` 或 `dark`，控制浏览器配色与 Core 的明暗语义 |

`defineTheme()` 校验、规范化并冻结定义，未知字段和非法值会报错。名称按当前 locale、基础语言、英文、首个名称依次回退。单外观显示主题名称，多外观显示“主题 · 外观”；不要放进 `i18n.messages`。

Core 维护 `data-cf-theme`、`data-cf-theme-appearance`、`.dark`、持久化与 Demo frame 同步。ID 参与持久化，发布后不要随意改名。显式配置时默认选择数组第一项的第一个外观，不按系统配色自动选另一项。

包中使用公开 CSS 导出；项目内定义也可使用相对项目工作目录的路径，如 `./docs/aurora.css`。不要发布机器绝对路径，也不要在 JavaScript 入口副作用导入 CSS：Core 通过 `styles` 装配。

## CSS 职责

Core 与 `@canofold/markdown/base.css` 负责结构和交互，`@canofold/themes/shared.css` 提供共享视觉 Hook。站点装配所有已配置主题的 CSS，因此主题必须限定作用域。

```css title="aurora.css"
html[data-cf-theme='aurora'] {
  --cf-accent-500: #0f766e;
  --cf-accent-strong: #0f766e;
  --cf-accent-deep: #115e59;
  --cf-accent-soft: #ccfbf1;
  --cf-radius-md: 10px;
  --cf-radius-lg: 16px;
}

html[data-cf-theme='aurora'][data-cf-theme-appearance='dark'] {
  --cf-on-accent: #073c35;
  --cf-accent-500: #5eead4;
  --cf-accent-strong: #5eead4;
  --cf-accent-deep: #99f6e4;
  --cf-accent-soft: #134e4a;
}
```

示例明确把 `canofold.css` 列在第一项，复用完整明暗配色。独立主题可以省略它，但必须提供所需语义颜色、字体、圆角和阴影，不能依赖其他主题恰好被配置。

`styles` 读取 CSS 内容，不会自动复制主题包的字体或图片，也不会重写其中的相对 `url()`。小型装饰可内嵌为 data URL；项目资源放进 `docs/public/` 并使用其公开地址。需要随主题分发额外文件时，应明确提供资源安装或构建步骤，再验证子路径部署；不要假设 npm 包里的相对资源会自动出现在站点。

| 用途 | 视觉 Hook 示例 |
|---|---|
| 内容表面 | `--cf-canvas`、`--cf-surface`、`--cf-surface-elevated` |
| 正文与辅助文字 | `--cf-ink`、`--cf-ink-body`、`--cf-ink-secondary` |
| 强调与状态 | `--cf-accent-500`、`--cf-on-accent`、`--cf-success`、`--cf-warning`、`--cf-danger` |
| 导航状态材质 | `--cf-nav-item-hover-*`、`--cf-nav-item-active-*` |
| 边框与阴影 | `--cf-hairline`、`--cf-shadow-raised`、`--cf-shadow-inset` |
| 字体与圆角 | `--cf-font-sans`、`--cf-font-display`、`--cf-radius-md` |

完整 Hook 以已安装包的 `shared.css` 和主题 CSS 为准。变量无法表达视觉特征时，可添加作用域内的纯视觉选择器，但不要依赖内部 DOM 层级。主题不能改写 display、position、尺寸、间距、对齐、溢出、z-index、点击区域、显隐或焦点行为，也不能重新判定 hover/active。导航、侧栏与下拉复用同一组状态 Hook，避免各写一套覆盖规则。

## 打包并验收

在主题目录运行 `npm pack --dry-run`，核对定义、声明、CSS 与许可证，再运行 `npm pack`。在独立测试站点安装生成的包：

```bash
pnpm add -D canofold@0.6.3 @canofold/themes@0.6.3 /absolute/path/acme-canofold-theme-1.0.0.tgz
```

```ts title="canofold.config.ts"
import { canofold } from '@canofold/themes'
import { defineConfig } from 'canofold'
import aurora from '@acme/canofold-theme'

export default defineConfig({ themes: [canofold, aurora] })
```

运行 `canofold check`、`canofold build --no-cache` 与 `canofold preview`。检查明暗切换、刷新恢复、中英文名称、hover/active、键盘焦点、移动端、Demo 同步、代码、表格、公式、图表、搜索和弹框。再只配置 `themes: [aurora]` 构建一次，排除其他主题的隐含依赖。

独立 React 消费方先引入 `@canofold/markdown/base.css`，再按 `styles` 顺序引入 CSS，并自行设置根元素主题、外观属性与明暗 class；站点自动选择器不属于 Markdown SDK。验收通过后再向 npm 发布。
