---
title: Site configuration reference
description: Look up canofold.config fields, defaults, accepted values, and related guides
group: Reference
subgroup: Configuration and CLI
order: 51
---

# Site configuration reference

Canofold loads one `canofold.config.ts`, `.mts`, `.cts`, `.js`, `.mjs`, or `.cjs` from the project root. Multiple variants are ambiguous, and unknown fields or invalid values fail validation.

```ts
import { defineConfig } from 'canofold'

export default defineConfig({
  title: 'Acme Docs',
  description: 'Acme platform documentation',
  siteUrl: 'https://docs.acme.com',
  basePath: '/',
  requiredVersion: '^0.7.0'
})
```

`defineConfig()` leaves the value unchanged while providing type checking and editor completion for the complete object and its nested fields. A directly exported object still goes through the build-time schema.

## Site and directories

| Field | Default | Purpose |
|---|---|---|
| `title` | `Canofold` | Site name and default browser title |
| `description` | `Technical documentation` | Site description used when a page has no description |
| `siteUrl` | unset | HTTP(S) origin used by canonical URLs, `hreflang`, and the sitemap; no path, query, or hash |
| `basePath` | `/` | Subpath deployment prefix, beginning and ending with `/` |
| `editUrl` | unset | HTTP(S) prefix for “Edit this page”; queries and hashes are rejected |
| `github` | unset | HTTP(S) URL for the header GitHub link |
| `requiredVersion` | unset | Semver range that the running CLI must satisfy |
| `docsDir` | `docs` | Content directory without configured versions; cannot be combined with non-empty `versions` |
| `outputDir` | `.canofold/dist` | Static site output directory |
| `markdownMirror` | `true` | Emit Markdown source beside each HTML page; `ai/index.md` links to HTML when disabled |
| `styles` | `[]` | Site-wide project CSS loaded after the default stylesheet; demo CSS should be imported by components |
| `seo.robots` | `allow` | Write `Allow: /` or `Disallow: /` to `robots.txt`; this is a crawler hint, not access control |

Keep `siteUrl` as the origin and express a deployment subdirectory with `basePath`. Omit unresolved `editUrl` and `github` values. Disabling `layout.header` leaves the content sidebar, page outline, and search shortcut available.

## Markdown

| Field | Default | Purpose |
|---|---|---|
| `markdown.html` | `sanitize` | Raw HTML policy: `trusted`, `sanitize`, or `strip`; MDX remains trusted executable code |
| `markdown.code.themes` | built-in light/dark themes | Replace the Shiki theme names |
| `markdown.code.fallbackLanguage` | `text` | Fence label used when no language is declared |
| `markdown.code.overflow` | `wrap` | Wrap long lines by default; `scroll` preserves each line and enables horizontal scrolling |
| `markdown.code.unknownLanguage` | `warn` | Handle an unknown fence language with `warn`, `error`, or `plain-text` |
| `markdown.features` | all enabled | Disable callouts, tabs, code groups, steps, terminals, document blocks, tables, or code blocks independently |
| `markdown.labels` | built-in by locale | Override accessible labels for Markdown interactions |
| `markdown.plugins` | `[]` | Trusted build-time Markdown plugins, applied in array order |

The standalone `<Markdown>` component defaults to `html: 'strip'`, unlike the Canofold site default. See [Markdown](/en/markdown/) for integration and [Official plugins](/en/guide/site/plugins/) for plugin setup.

One fence can override the site default with the standalone `wrap` or `scroll` metadata token, for example ```` ```ts scroll ````. It composes with `title="file.ts"`, line highlights, and diff annotations.

## Component demos

| Field | Default | Purpose |
|---|---|---|
| `demos.engine` | unset | Component demo engine; Vite projects use `vite()` |
| `demos.setup` | unset | Optional shared React wrapper for providers, theming, or internationalization |

The demo engine is a replaceable Canofold capability and does not replace the project's build tool. `@canofold/vite` reads the existing `vite.config` and mounts Vite middleware and HMR on the same Canofold development server. See [Component demos](/en/guide/writing/component-demos/) for the complete workflow.

## Themes, branding, layout, and search

| Field | Default | Purpose |
|---|---|---|
| `themes` | `[canofold]` | Ordered `ThemeDefinition[]`; the first appearance of the first theme is the default |
| `branding.logo` / `logoDark` | Canofold light/dark logo | Brand images shared by every configured theme |
| `branding.favicon` | Canofold favicon | Site favicon |
| `layout.header` | `true` | Render brand, top navigation, search entry, and locale/version controls |
| `layout.sidebarWidth` | `17.5rem` | Desktop sidebar width |
| `layout.outlineWidth` | `18.75rem` | Desktop page-outline width |
| `search.enabled` | `true` | Generate a search index and browser entry |
| `search.provider` | `compact` | Built-in `compact` or a `SearchProvider` object such as `pagefind()` |
| `checks.rules` | `{}` | Override a check rule with `off`, `warning`, or `error`; omitted rules keep their default level |

Theme definitions come from `@canofold/themes` or a third-party package and own localized names, CSS entries, and appearances. Core owns layout, behavior, persistence, and accessibility. See [Theme customization](/en/guide/site/customization/) and [Search](/en/guide/site/search/) for task workflows.

## Site capabilities

| Field | Default | Purpose |
|---|---|---|
| `extensions` | `[]` | `{ resolve, options }` entries; `resolve` starts with `./` and options are JSON-serializable |
| `sources` | `[]` | Trusted build-time content adapters; the official `openapi()` reads local OpenAPI and belongs here, not in Markdown plugins or Extensions |
| `navigation` | `{}` | Locale-keyed `{ text, link, activePaths? }[]`; derived from top-level content sections when omitted |
| `versions` | `[]` | Version array; first entry is current and uses `/`. Omitted or empty hides the control; one shows a label, multiple offer switching |
| `redirects` | `{}` | Old-to-current route map; chains, cycles, and real-page collisions fail validation |
| `advertising` | unset | `{ image, href, alt, label? }` image slot beside the page outline |

See [navigation](/en/guide/site/navigation/), [versions](/en/guide/site/versions/), [redirects](/en/guide/site/redirects/), [extensions](/en/guide/site/extensions/), and [advertising](/en/guide/delivery/advertising/) for workflows.

Each `versions[]` entry requires `id`, `label`, project-relative `docsDir`, and URL prefix `base`; `status: 'supported' | 'archived'` is optional. IDs and bases must be unique, and the first entry cannot be archived. Labels are not read from package versions. The array format applies from 0.7.1; see [Manage documentation versions](/en/guide/site/versions/) for examples, migration, and snapshots.

See [OpenAPI documentation](/en/guide/writing/openapi/) for source fields, selection, and safety boundaries. Custom sources implement the public `ContentSource`, `ContentSourceContext`, and `SourceDocument` types and declare bounded dependencies through `context.read()`. Adapters do not own output writing or write generated files into author directories.

`kind` identifies a derived type; `markdown` and `mdx` are reserved for authored documents. The reference Reader currently supports Markdown, MDX, and OpenAPI and explicitly rejects unknown representations instead of guessing how to interpret them.

## Internationalization and AI output

| Field | Default | Purpose |
|---|---|---|
| `i18n.defaultLocale` | `zh` | Default locale without a URL prefix |
| `i18n.locales` | `['zh']` | Locales included in the build |
| `i18n.localeNames` | `{}` | Display names in the locale switcher |
| `i18n.messages` | `{}` | Site and Markdown UI overrides by locale |
| `ai.llmsTxt` | `true` | Emit `llms.txt` |
| `ai.llmsFullTxt` | `true` | Emit `llms-full.txt` or its Manifest pointer |
| `ai.pageIndex` | `true` | Emit `ai/pages.json` |
| `ai.fullContent` | `true` | Emit `ai/manifest.json` and `ai/content/*` shards |
| `ai.markdownIndex` | `true` | Emit `ai/index.md` |
| `ai.pageSummaries` | `true` | Emit `ai/summaries.json` |
| `ai.codeExamples` | `true` | Emit `ai/code-examples.json` |
| `ai.chunkSizeBytes` | `262144` | Encoded byte budget for one JSONL content record |
| `ai.llmsFullMaxBytes` | `10485760` | Budget for the legacy aggregate file |
| `ai.llmsFullOverflow` | `manifest` | Write a Manifest pointer on overflow, or use `error` to fail the build |
| `ai.versions` | `current` | Publish only the current version, or use `all` for every version |
| `ai.contentSpace` | Unset | Stable machine-content namespace; omission permits comparison only within the same source |

See [Internationalization](/en/guide/site/internationalization/) and [AI-friendly output](/en/reference/output/ai-output/) for setup and artifact details.

These switches are independent. If `ai.fullContent` is disabled while `llms-full.txt` exceeds its budget under the `manifest` overflow policy, the build fails rather than pointing to a missing Manifest. Increase the budget, disable `ai.llmsFullTxt`, or enable shards.
