---
title: Search
description: Build multilingual indexes with built-in search or Pagefind
group: Guide
subgroup: Site capabilities
order: 32
---

# Search

Search is enabled by default with the built-in `compact` provider. Small and medium sites need no additional configuration.

## How compact matching works

`compact` lowercases contiguous Latin letters and digits into word tokens. For contiguous Han text, it emits each character and every adjacent two-character token. For example, `组件文档` yields `组`, `件`, `文`, `档`, `组件`, `件文`, and `文档`. Queries use the same tokenizer.

The index includes titles, descriptions, tags, the full searchable body text, and bounded code samples. Ranking favors complete phrases and tokens in titles, followed by descriptions, tags, and route paths; a body-only mention can still find a page without outranking a stronger title match. Results display the page description rather than a snippet from the matching body position. The UI highlights complete queries and useful matching tokens in titles and descriptions. This keeps the index small and browser-side dependency-free, but it does not provide fuzzy matching or match-position snippets. Use Pagefind when a large site needs more mature tokenization and chunked loading.

## Use Pagefind

For larger sites, install the official plugin package and Pagefind:

:::code-group[Package manager]

```bash title="pnpm"
pnpm add -D @canofold/plugins pagefind
```

```bash title="npm"
npm install --save-dev @canofold/plugins pagefind
```

```bash title="yarn"
yarn add --dev @canofold/plugins pagefind
```

:::

Then configure the search provider:

```ts title="canofold.config.ts"
import { pagefind } from '@canofold/plugins'
import { defineConfig } from 'canofold'

export default defineConfig({
  search: { provider: pagefind() }
})
```

Pagefind indexes final HTML and filters results by the active locale and version.

## Exclude content

Set `search: false` in page frontmatter to exclude one page:

```yaml
---
search: false
---
```

Use `search: { enabled: false }` to disable search for the entire site. Private sites should protect search indexes with the same access policy as page content.
