---
title: React Markdown API
description: Look up @canofold/markdown public entries, props, and return types
group: Reference
subgroup: API
order: 61
---

# React Markdown API

This page contains code contracts only. See [Use the Markdown package](/en/markdown/usage/) for installation and integration, and the [Markdown syntax reference](/en/markdown/syntax/) for authoring.

## Public entries

| Entry | Contract |
|---|---|
| `@canofold/markdown` | React `Markdown` component and types |
| `@canofold/markdown/server` | Build and SSR renderer |
| `@canofold/markdown/client` | Static HTML behavior enhancement |
| `@canofold/markdown/server/analyze` | Server-side resource analysis |
| `@canofold/markdown/base.css` | Required structural styles |
| `@canofold/themes` | Theme definitions and the `ThemeDefinition` contract |
| `@canofold/themes/<theme>.css` | Selected visual theme styles, imported after `base.css` |

Deep `dist/` chunks, internal components, Unified/HAST processors, Islands, React roots, and cache files are not public API.

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

`MarkdownRootProps` also contains:

| Prop | Type | Meaning |
|---|---|---|
| `as` | `React.ElementType` | Root element; defaults to `div` |
| `className` | `string` | Root class |
| `classNames` | `MarkdownClassNames` | Append classes at stable semantic positions |
| `slots` | `MarkdownSlots` | Replace local visuals such as icons and captions |
| `urlTransform` | `(value, property) => string` | Transform real `href`, `src`, `poster`, and `srcSet` values |
| other safe root props | `HTMLAttributes<HTMLElement>` | Forwarded except `children` and `dangerouslySetInnerHTML` |

The result of `urlTransform` still passes through protocol safety checks. Relative URLs and `http`, `https`, `irc`, `ircs`, `mailto`, `tel`, and `xmpp` are allowed; protocols such as `javascript`, `vbscript`, `data`, `file`, and `blob` are removed.

The standalone React entry defaults to `html: 'strip'`. Mermaid and PlantUML fenced syntax is provided by the opt-in `mermaid()` and `plantUml()` plugins from `@canofold/plugins`.

## `RenderMarkdownOptions`

| Group | Type | Purpose |
|---|---|---|
| `html` | `trusted \| sanitize \| strip` | Raw HTML policy |
| `directives` | `{ invalid?: 'error' \| 'literal' }` | Invalid rich-directive policy; defaults to `error` |
| `code` | `MarkdownCodeOptions` | Shiki themes, unknown-language policy, and custom languages |
| `features` | `MarkdownFeatureOptions` | Enable or disable composite capabilities |
| `labels` | `Partial<MarkdownLabels>` | Accessible interaction labels |
| `locale` | `string` | BCP 47 locale available to plugins that emit localized content |
| `plugins` | `readonly MarkdownPlugin[]` | Compiler plugins applied to Markdown and MDX pipelines |

Authoring previews can pass `options={{ directives: { invalid: 'literal' } }}` to retain unknown or invalid directives as escaped source while rendering valid surrounding content. An invalid child in a structured container such as Tabs or Steps preserves the complete container source, so transformation cannot discard its children. The default `error` policy continues to reject invalid directives in builds; ordinary colon words such as `format:check` do not require recovery mode.

This is not a general exception handler: plugin failures and MDX compilation errors remain errors. HTML sanitization, media URL validation, and trusted MDX execution boundaries are unchanged.

Custom plugins that must run in Canofold Playground realtime preview also declare `browserCompiler` with a browser-safe package export, named factory, and serializable factory options. Ordinary static pages do not load that entry.

A custom plugin that uses directives must list them in `MarkdownPlugin.directiveNames`. Names use lowercase kebab-case, and one directive may have only one owner. `fenceLanguages` applies the same ownership rule to code fences.

`components` accepts intrinsic tags plus `Callout`, `Tabs`, `CodeGroup`, `Steps`, `CodeBlock`, `CopySnippet`, `Table`, `Image`, `Terminal`, `Details`, `FileTree`, `Gallery`, `CardGrid`, `Api`, `Aside`, and `Badge`. Diagrams are plugin-owned rather than a core named React override. Interactive replacements should forward every supplied prop so Canofold can retain events, ARIA, and behavior attributes.

## Server interface

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

`maxEntries` bounds the Markdown and MDX compilation caches separately, with 64 entries each by default. `analyze()` shares the cache with the corresponding render method, and `clear()` clears both. MDX accepts trusted content only and rejects `sanitize` or `strip`.

`analyze()` waits for remark/rehype plugins and returns headings, anchors, text, a first-content-block excerpt, and link/image references. Existing source positions are preserved; generated nodes do not receive invented locations. `codeExamples` captures fences after remark transforms, before highlighting and interactive presentation. Canofold uses these compiled facts for navigation, link validation, resource copying, search, and AI metadata.

MDX analysis compiles static content without executing author components or expressions. Literal `id`, `href`, and `src` attributes on native JSX tags, static `srcSet` image and `<source>` candidates, plus static image paths on the default `Image` / `MarkdownImage` components, are included; direct string-literal expressions are recognized too. Dynamic expressions and output produced by custom components at runtime cannot be predicted statically. Markdown mirrors and AI full-content exports retain authored source rather than reverse-converting compiled HTML to Markdown.

Analysis follows JSX override order: later attributes win. A later `{...props}` makes earlier values uncertain, so they are not reported as definite resources or links. Put statically checked paths after spreads, or use ordinary Markdown links and images.

`renderMdx()` also applies `urlTransform` to native `<a>`, `<img>`, `<video>`, and similar elements authored directly in MDX, after expressions and spreads resolve their final props. It does not rewrite custom-component props or intercept JSX inside imported components. Dynamic URLs can be transformed during rendering but remain outside static analysis.

`MarkdownContentAnalysis` contains `text`, `excerpt`, `headings`, `codeExamples`, `anchors`, `links`, `images`, and their `linkLocations` / `imageLocations`. The latter contain line and column when available in the source and `null` for generated nodes.

`@canofold/markdown/server/analyze` inspects source without rendering it:

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

Use it for source syntax diagnostics and directive locations; it does not execute compiler plugins. The `plugins` option only accepts `directiveNames` declared by plugins active in the selected `mode`. Other unknown directives appear in `directiveIssues`. Use `renderer.analyze()` for search, navigation, or references that must match the published page.

## Client enhancement interface

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

Call `dispose()` before the host unmounts or replaces the page.
