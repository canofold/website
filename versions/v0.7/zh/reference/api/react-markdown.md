---
title: React Markdown API
description: 查询 @canofold/markdown 的公开入口、属性和返回类型
group: 参考
subgroup: API
order: 61
---

# React Markdown API

本页只记录公开代码契约。安装与接入见[使用 Markdown 包](/markdown/usage/)，写作方式见 [Markdown 语法参考](/markdown/syntax/)。

## 公开入口

| 入口 | 契约 |
|---|---|
| `@canofold/markdown` | React `Markdown` 组件及其类型 |
| `@canofold/markdown/server` | 构建与 SSR renderer |
| `@canofold/markdown/client` | 静态 HTML 交互增强 |
| `@canofold/markdown/server/analyze` | 服务端资源分析 |
| `@canofold/markdown/base.css` | 必需的结构样式 |
| `@canofold/themes` | 主题定义和 `ThemeDefinition` 契约 |
| `@canofold/themes/<theme>.css` | 在 `base.css` 之后引入的视觉主题样式 |

深层 `dist/` Chunk、内部组件、Unified/HAST 处理器、Islands、React root 和缓存文件都不是公共 API。

## `MarkdownProps`

```ts
interface MarkdownProps extends MarkdownRootProps {
  source: string
  options?: RenderMarkdownOptions
  components?: MarkdownComponents
  onError?: (error: unknown) => void
  onReady?: () => void
  fallback?: ReactNode
  retainPrevious?: boolean
}
```

`MarkdownRootProps` 还包含：

| 属性 | 类型 | 说明 |
|---|---|---|
| `as` | `React.ElementType` | 根元素，默认 `div` |
| `className` | `string` | 根元素 class |
| `classNames` | `MarkdownClassNames` | 向稳定语义位置追加 class |
| `slots` | `MarkdownSlots` | 替换图标和图注等视觉槽位 |
| `urlTransform` | `(value, property) => string` | 转换真实 `href`、`src`、`poster` 和 `srcSet` |
| 其他安全根元素属性 | `HTMLAttributes<HTMLElement>` | 传给根元素，不包含 `children` 和 `dangerouslySetInnerHTML` |

`urlTransform` 的返回值仍会经过协议安全检查。相对 URL 以及 `http`、`https`、`irc`、`ircs`、`mailto`、`tel`、`xmpp` 可用；`javascript`、`vbscript`、`data`、`file`、`blob` 等协议会被移除。

独立 React 入口的 HTML 默认策略是 `strip`。Mermaid 与 PlantUML 语法不属于核心入口，需要通过 `@canofold/plugins` 的 `mermaid()`、`plantUml()` 显式启用。

## `RenderMarkdownOptions`

| 分组 | 类型 | 用途 |
|---|---|---|
| `html` | `trusted \| sanitize \| strip` | Raw HTML 策略 |
| `directives` | `{ invalid?: 'error' \| 'literal' }` | 无效富文本指令的处理策略，默认 `error` |
| `code` | `MarkdownCodeOptions` | Shiki 主题、未知语言策略和自定义语言 |
| `features` | `MarkdownFeatureOptions` | 按能力启停复合组件 |
| `labels` | `Partial<MarkdownLabels>` | 交互可访问性文案 |
| `locale` | `string` | 供插件生成本地化内容的 BCP 47 locale |
| `plugins` | `readonly MarkdownPlugin[]` | 按需启用 Mermaid、PlantUML、数学等官方或自定义插件 |

编辑预览可以传入 `options={{ directives: { invalid: 'literal' } }}`，将未知或无效指令保留为转义后的原文，同时继续显示正常内容。若错误出现在 Tabs、Steps 等结构化容器内，会保留整个容器的原文，避免转换时丢失子项。默认 `error` 继续阻止无效指令进入正式构建；`format:check` 等普通冒号文本无需开启容错。

这不是通用的异常吞噬机制：插件异常和 MDX 编译错误仍会报告，HTML 清理、媒体 URL 校验和 MDX 可信执行边界不变。

如果自定义插件需要在 Canofold Playground 的实时预览中运行，还要声明 `browserCompiler`，提供浏览器安全的包导出、命名工厂和可序列化工厂参数。普通静态文档不会加载该入口。

自定义插件使用指令时，必须在 `MarkdownPlugin.directiveNames` 中声明名称。名称采用小写 kebab-case，且同一个名称只能由一个插件拥有。`fenceLanguages` 对代码围栏执行同样的所有权检查。

`components` 支持原生标签以及 `Callout`、`Tabs`、`CodeGroup`、`Steps`、`CodeBlock`、`CopySnippet`、`Table`、`Image`、`Terminal`、`Details`、`FileTree`、`Gallery`、`CardGrid`、`Api`、`Aside` 和 `Badge`。图表由插件拥有，不是核心 React 命名覆盖。覆盖交互组件时应透传全部 Props，让 Canofold 保留事件、ARIA 和行为属性。

## 服务端接口

```ts
interface MarkdownRenderer {
  analyze(
    source: string,
    options?: { markdown?: RenderMarkdownOptions; mode?: 'markdown' | 'mdx' }
  ): Promise<MarkdownContentAnalysis>
  render(source: string, options?: MarkdownRenderOptions): Promise<RenderedMarkdown>
  renderMdx(source: string, options?: MdxRenderOptions): Promise<RenderedMarkdown>
  clear(): void
}

interface RenderedMarkdown {
  content: ReactNode
  assets: MarkdownAssets
}

function createMarkdownRenderer(options?: { maxEntries?: number }): MarkdownRenderer
```

`maxEntries` 分别限制 Markdown 和 MDX 的编译缓存条目，默认各为 64。`analyze()` 与对应渲染方法复用编译缓存，`clear()` 同时清空两者。MDX 只接受可信内容；传入 `sanitize` 或 `strip` 会失败。

`renderMdx()` 的 `urlTransform` 也用于 MDX 中直接编写的原生 `<a>`、`<img>`、`<video>` 等元素，在表达式和 spread 得到最终属性后转换 URL；不会改写传给自定义组件的属性，也不递归拦截外部组件内部的 JSX。动态属性可在渲染时转换，但仍不属于下述静态检查范围。

`analyze()` 等待 remark/rehype 插件完成后返回标题、锚点、正文、首个正文块摘要以及链接和图片引用，已有源位置会保留，插件生成的节点不会伪造行列号。`codeExamples` 取自 remark 转换后的代码围栏，在高亮和交互组件转换前提取。Canofold 的目录、链接检查、资源复制、搜索和 AI 元数据使用这些编译事实。

MDX 分析只编译静态内容，不执行作者组件或表达式。原生 JSX 标签的静态 `id`、`href`、`src`，图片和 `<source>` 的静态 `srcSet` 候选路径，以及默认 `Image` / `MarkdownImage` 的静态图片路径会进入分析；直接的字符串字面量表达式也可识别。动态表达式和自定义组件运行时生成的内容无法静态预测。Markdown 镜像和 AI 全文保留作者源码，不把编译后的 HTML 反向转换为 Markdown。

属性按 JSX 的覆盖顺序分析：后写属性优先；如果后面的 `{...props}` 可能覆盖某个属性，就不把前面的值当成确定的资源或链接。需要静态检查的路径应直接写在 spread 之后，或使用普通 Markdown 链接和图片。

`MarkdownContentAnalysis` 包含 `text`、`excerpt`、`headings`、`codeExamples`、`anchors`、`links`、`images` 及对应的 `linkLocations` / `imageLocations`；后两者在原始节点有源码位置时返回行列，插件生成的节点使用 `null`。

`@canofold/markdown/server/analyze` 公开不执行渲染的源码分析：

```ts
interface MarkdownAnalysis {
  text: string
  headings: MarkdownHeading[]
  codeExamples: MarkdownCodeExample[]
  links: string[]
  linkLocations: Array<{ line: number; column: number } | undefined>
  images: string[]
  imageLocations: Array<{ line: number; column: number } | undefined>
  missingCodeBlockLanguages: number
  missingCodeBlockLanguageLocations: Array<{ line: number; column: number } | undefined>
  directives: MarkdownDirective[]
  directiveIssues: Array<{ message: string; line?: number; column?: number }>
}

interface AnalyzeMarkdownOptions {
  plugins?: readonly MarkdownPlugin[]
  mode?: 'markdown' | 'mdx'
}

function analyzeMarkdown(source: string, options?: AnalyzeMarkdownOptions): MarkdownAnalysis
```

它适合源码语法诊断和指令定位，不执行编译插件。传入 `plugins` 后，只接受对应 `mode` 中已激活插件声明的 `directiveNames`；其他未知指令出现在 `directiveIssues` 中。需要与发布页面一致的搜索、目录或链接事实时，应使用 `renderer.analyze()`，不能用源码分析结果代替编译结果。

## 客户端增强接口

```ts
interface MarkdownEnhancement {
  ready: Promise<void>
  dispose(): void
}

function enhanceMarkdown(
  root?: ParentNode,
  assets?: Pick<MarkdownAssets, 'behaviors'>
): MarkdownEnhancement
```

宿主在页面卸载或替换前必须调用 `dispose()`。
