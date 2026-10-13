---
title: 定制主题
description: 选择视觉主题并配置 Canofold 的品牌资源、布局和项目样式
group: 指南
subgroup: 站点能力
order: 36
---

# 定制主题

Canofold 把视觉主题、品牌资源和布局几何分开管理。主题包负责本地化名称、颜色、字体、圆角、边框、阴影和纯视觉动效；Core 负责 DOM 结构、尺寸、响应式规则、交互状态、焦点和无障碍。

## 选择视觉主题

配置文件直接导入官方主题时，应显式安装 `@canofold/themes`：

```bash
pnpm add -D @canofold/themes
```

只把读者需要选择的主题放入配置：

```ts title="canofold.config.ts"
import { canofold, neoBrutalist, neumorphism } from '@canofold/themes'
import { defineConfig } from 'canofold'

export default defineConfig({
  themes: [canofold, neoBrutalist, neumorphism]
})
```

数组第一项的第一个外观是默认值。`canofold` 提供浅色和深色两种外观；其余官方主题各提供一个固定外观。读者选择会跨页面保留，并同步到隔离的 Vite Demo frame。不配置 `themes` 时只使用 `canofold`。

官方主题包括 Canofold、玻璃拟态、素描风格、手绘涂鸦、极简扁平、包豪斯、新粗野主义、新拟态、孟菲斯、赛博中国、像素动漫、多巴胺设计、少女漫画和 Outrun 复古未来。导入名和稳定 ID 由 `@canofold/themes` 直接导出，Core 不维护主题注册表。

## 品牌资源

品牌资源由所有主题共用。Canofold 默认使用官方明暗 Logo 和 favicon；替换时把文件放入 `docs/public/`，并使用站点绝对路径：

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'

export default defineConfig({
  branding: {
    logo: '/logo-light.svg',
    logoDark: '/logo-dark.svg',
    favicon: '/favicon.svg'
  }
})
```

两张 Logo 应保持相同尺寸和轮廓，主题会根据自己的明暗外观选择对应资源。

## 布局几何

站点几何尺寸属于 `layout`，不属于视觉主题：

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'

export default defineConfig({
  layout: {
    header: true,
    sidebarWidth: '18rem',
    outlineWidth: '16rem'
  }
})
```

布局由 Core 统一管理，确保所有主题保持一致的对齐、点击区域、键盘行为和响应式断点。

## 第三方主题

第三方包分别导出由 `defineTheme` 创建的定义和公开 CSS 入口：

```ts title="canofold.config.ts"
import { canofold } from '@canofold/themes'
import { defineConfig } from 'canofold'
import aurora from '@acme/canofold-theme'

export default defineConfig({
  themes: [canofold, aurora]
})
```

主题和外观 ID 使用小写 kebab-case。本地化 `name` 属于主题定义，不应放进 `i18n.messages`。CSS 必须以 `html[data-cf-theme='theme-id']` 限定作用域，也不能重定义布局、显隐、滚动、点击区域、焦点行为或无障碍。

## 项目 CSS

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'

export default defineConfig({
  styles: ['./docs/brand.css']
})
```

项目 CSS 在选中主题的样式之后加载。优先使用公共语义 Token 和项目自己的 class；只有公共 API 明确说明的语义属性才能作为选择器，不要依赖内部 `.cf-*` 类名或精确布局结构。字段默认值见[站点配置参考](/reference/configuration/base-config/#主题品牌布局与搜索)。
