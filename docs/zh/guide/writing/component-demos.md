---
title: 使用 Vite 编写组件示例
description: 一个命令运行组件、示例源码与 Canofold 文档
group: 指南
subgroup: 内容创作
order: 34
---

# 使用 Vite 编写组件示例

组件库文档应直接运行真实组件代码，而不是在 Markdown 中复制一份无法同步的示例。Canofold 通过 Demo 引擎承接这一能力；Vite 项目使用官方 `@canofold/vite` 引擎。

## 安装与配置

```bash
pnpm add -D @canofold/vite
```

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'
import { vite } from '@canofold/vite'

export default defineConfig({
  demos: {
    engine: vite()
  }
})
```

运行 `canofold dev` 即可。Canofold 仍负责路由、Markdown 与页面重建；Vite 负责组件模块、CSS 依赖图和 HMR。两者共用一个进程、一个端口，不需要再启动独立的 Vite 服务。项目已有的 `vite.config.ts`、插件、别名和 React 配置会继续生效。当前官方引擎支持 React 18 和 React 19。

## 编写一个 Demo

Demo 是普通的 `.tsx`、`.jsx`、`.ts` 或 `.js` 文件，默认导出一个 React 组件。组件入口应自行导入组件 CSS：

```tsx title="src/components/button/demo/basic.tsx"
import { Button } from '@acme/ui'

export default function BasicButtonDemo() {
  return <Button>保存</Button>
}
```

在普通 `.md` 文档中引用它：

```md
::demo[基础用法]{src="/src/components/button/demo/basic.tsx" description="展示按钮的默认状态与点击行为。"}
```

方括号是 Demo 标题，`description` 是标题下方的简短说明，两者都可以省略。每张 Demo 卡片下方提供“在新窗口打开”和“查看代码”两个操作；代码默认收起，展开后会切换为“收起代码”状态。Canofold 使用同一个 Demo 文件运行预览并展示源码，因此修改文件后两者会一起更新。需要隔离 DOM 和全局样式时，可增加 `sandbox="iframe"`：

```md
::demo[隔离预览]{src="/src/components/button/demo/basic.tsx" sandbox="iframe"}
```

iframe 模式运行的是仓库内可信代码。它会限制嵌入预览的导航、表单提交和弹窗等浏览器能力，但不是运行第三方不可信代码的安全边界。“在新窗口打开”会打开独立预览页，不继承 iframe 限制。

### 本页实际运行的 Demo

下面两张卡片由 Website 仓库中的同一个 React Demo 文件生成。第一张直接挂载在页面中，第二张使用 iframe 隔离；预览与展开后的源码始终来自同一个文件。

::demo[内联交互]{src="/docs/examples/release-channel/basic.tsx" description="切换发布通道，验证 React 状态、组件 CSS 与页面内预览。"}

::demo[iframe 隔离]{src="/docs/examples/release-channel/basic.tsx" sandbox="iframe" description="在隔离文档中运行同一个 Demo，验证 iframe 加载与自适应高度。"}

### Demo 语法

| 部分 | 是否必填 | 说明 |
|---|---|---|
| `[标题]` | 否 | 显示在预览下方的 Demo 标题 |
| `src` | 是 | 项目根目录内的 `.tsx`、`.jsx`、`.ts` 或 `.js` Demo 文件 |
| `description` | 否 | 标题下方的一句用途或行为说明 |
| `sandbox` | 否 | `inline`（默认）或 `iframe` |

`src` 和 `demos.setup` 都必须解析到项目根目录内的本地源码；Canofold 不执行项目外部或 `node_modules` 中的 Demo 入口。

## 包入口与源码解析

Canofold 不要求文档专用的 alias 或 library entry。`@canofold/vite` 直接复用项目现有的 Vite 解析规则。对于 `package.json` 有包名、Vite 只有一个 `build.lib.entry`、并且没有显式声明同名 alias 的标准单包组件库，0.3.3 会自动把这个包名精确解析到该源码入口，因此入口路径只需声明一次。多入口组件库和多包 workspace 不做推断，继续使用项目已有的 workspace、exports、TypeScript paths 或 Vite alias；Canofold 不覆盖项目主动配置的同名 alias。

`vite()` 默认从 Canofold 项目根目录发现 `vite.config`。只有 Vite 根目录不同或需要指定配置文件时，才使用 `vite({ root: './packages/ui' })`、`vite({ configFile: './vite.docs.config.ts' })`；传入 `configFile: false` 可关闭配置发现。

## CSS 与共享上下文

不要把每个组件的 CSS 填进 `styles`，也不要在每个 Demo 中重复引入样式。让组件公共入口负责 `import './styles.css'`，Vite 会沿依赖图加载开发样式并在生产构建中抽取 CSS。`styles` 只适合文档站自身的全局样式。

只有多个 Demo 都必须共享 Provider 时才配置 `setup`：

```ts title="canofold.config.ts"
export default defineConfig({
  demos: {
    engine: vite(),
    setup: './docs/demo.setup.tsx'
  }
})
```

```tsx title="docs/demo.setup.tsx"
import type { PropsWithChildren } from 'react'

export default function DemoSetup({ children }: PropsWithChildren) {
  return <YourThemeProvider>{children}</YourThemeProvider>
}
```

没有共享 Provider 时不要创建这个文件。MDX 仍可用于需要自由 JSX 编排的可信页面，但展示组件示例不再要求 MDX。
