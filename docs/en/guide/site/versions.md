---
title: Manage documentation versions
description: Publish current documentation while preserving historical content snapshots
group: Guide
subgroup: Site capabilities
order: 34
---

# Manage documentation versions

To keep older docs versions available, give each version its own source directory and URL prefix. The current version usually uses `/`, while historical versions use prefixes such as `/v1/` or `/v2/`. Switching versions does not rewrite one document at runtime.

## Prepare a historical snapshot

While the current docs still represent the release you are archiving, run:

```bash
pnpm exec canofold check
pnpm exec canofold snapshot v1
```

`snapshot` copies the whole current documentation directory—pages, relative assets, `public/`, and version-local MDX and Demo source—into `versions/v1/`. It does not rewrite or overwrite `canofold.config.ts`, nor overwrite an existing directory. It stops on drafts, symbolic links, MDX/Demo dependencies outside the docs directory, or global `demos.setup`. Add the historical item to `versions.items` yourself, then continue editing current docs. To revise history, edit `versions/v1/` and rerun `check` and `build`.

A component library's usual `::demo{src="/src/..."}` points at current source and is not a historical snapshot. Before archiving, place the Demo and its project-local dependencies in the current docs directory and use a relative `src`. Historical builds reject local source outside their version directory. Pin third-party packages to exact versions and commit the lockfile so a reinstall does not silently change old examples. `snapshot` does not automatically freeze npm packages, Vite configuration, or a global provider; maintain these inputs separately.

This example uses English as the default locale, keeps current documentation in `docs/`, and stores the old release in `versions/v1/`:

:::file-tree
- canofold.config.ts
- docs/
  - index.md
  - zh/
    - index.md
- versions/
  - v1/
    - index.md
    - zh/
      - index.md
:::

The current English and Chinese homes map to `/` and `/zh/`; the v1 homes map to `/v1/` and `/v1/zh/`.

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'

export default defineConfig({
  versions: {
    current: 'v2',
    items: [
      {
        id: 'v2',
        label: '2.x',
        docsDir: 'docs',
        base: '/'
      },
      {
        id: 'v1',
        label: '1.x',
        docsDir: 'versions/v1',
        base: '/v1/',
        status: 'archived'
      }
    ]
  }
})
```

Keep `docsDir` and `base` boundaries clear across versions so that two pages cannot write to the same output path.
Omit `status` for a maintained historical release. `status: 'archived'` keeps pages readable and searchable while visibly marking them as no longer maintained. The current version cannot be archived.

## Switch pages

When a reader switches versions, Canofold looks for the same page-relative path in the target version. If it does not exist, the menu explicitly says that the page is unavailable and its link opens that version's home page for the current locale. Redirects can preserve common entry points after an old version removes or moves a page.

## Search and AI output

Compact Search writes a separate JSON file for each version and locale. Pagefind uses one index and restricts results with `version` and `locale` filters. Both providers keep results from other versions out of the current page's search results.

AI artifacts include only `versions.current` by default. Set `ai.versions: 'all'` to write historical versions into separate partitions:

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'

export default defineConfig({
  ai: {
    versions: 'all'
  }
})
```

## When to keep a snapshot

Keep a historical snapshot when a release changes configuration, APIs, or workflows incompatibly and readers still need the old instructions. Whether that boundary follows major, minor, or another release marker depends on the project's compatibility policy.
