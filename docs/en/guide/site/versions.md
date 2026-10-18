---
title: Manage documentation versions
description: Publish current documentation while preserving historical content snapshots
group: Guide
subgroup: Site capabilities
order: 34
---

# Manage documentation versions

From Canofold 0.7.1, `versions` is an array whose first entry is current. Each version has its own source directory and URL prefix. Builds publish them together; readers choose an old version from the dropdown to open its pages without switching Git revisions.

Omit `versions` or use `[]` to hide the control while building from the top-level `docsDir` (`docs` by default). One entry displays its `label`; multiple entries offer switching. Labels are not read automatically from the project or Canofold package version.

## Prepare a historical snapshot

While the current docs still represent the release you are archiving, run:

```bash
pnpm exec canofold check
pnpm exec canofold snapshot v1
```

`snapshot` copies the current documentation directory, including its assets, MDX components, and Demo source, into `versions/v1/`. It saves content as it exists when run. `v1` is a snapshot name, not a Git lookup.

The command does not modify configuration or overwrite an existing destination. Append the historical entry to the `versions` array, keeping the current main version first. Run `check` and `build`, commit the snapshot and configuration together, then start rewriting current docs.

Drafts, symbolic links, MDX/Demo dependencies outside the docs directory, or docs with Demos using global `demos.setup` cause snapshots to fail. Move Demos and their project-local dependencies into the docs directory and use relative `src` paths rather than `/src/...`. Snapshots do not freeze npm packages, external public assets, Vite configuration, or global providers; maintain those inputs and the lockfile separately.

## Configure version directories and URLs

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
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh']
  },
  versions: [
    { id: 'v2', label: '2.x', docsDir: 'docs', base: '/' },
    {
      id: 'v1',
      label: '1.x',
      docsDir: 'versions/v1',
      base: '/v1/',
      status: 'archived'
    }
  ]
})
```

- `id` is an internal identifier used for version associations and search partitions.
- `label` is the name displayed in the version control, such as `2.x`. It does not locate historical content.
- `docsDir` is the source directory relative to the project root. It must contain that version's actual documentation.
- `base` is the version's URL prefix, not a disk directory or Git branch. The current main version must use `/`.

Each `id` and `base` must be unique, and content directories should be maintained independently. With a non-empty `versions` array, omit the top-level `docsDir`. The first entry must use `base: '/'` and cannot be archived. Do not change the main version just to reorder the dropdown.

`basePath` prefixes the whole deployment: `basePath: '/manual/'` with `base: '/v1/'` produces `/manual/v1/`. Omit `status` for a maintained historical release; `status: 'archived'` keeps it readable and searchable but marks it as no longer maintained.

To migrate the old configuration, assign its `items` array directly to `versions`, move the entry selected by `current` to the first position, and remove both wrapper fields.

## If you did not save the old docs

Version configuration does not generate historical content. Without a snapshot, recover docs and their referenced assets and source from Git or a backup, verify them, then register the version. Canofold does not restore Git history automatically; without a historical source, old content cannot be recovered.

## Switch pages

When a reader switches versions, Canofold looks for the same page-relative path in the target version. If it does not exist, the menu explicitly says that the page is unavailable and its link opens that version's home page for the current locale. Redirects can preserve common entry points after an old version removes or moves a page.

Derived pages such as OpenAPI operations match by source kind, `id`, and operation key rather than generated URLs or input filenames. Configure historical `root`, `entry`, `version`, and `locale` bindings explicitly; every dependency must stay inside that version's `docsDir`. Snapshots do not add these bindings automatically. See [OpenAPI documentation](/en/guide/writing/openapi/).

## Search and AI output

Compact Search writes a separate JSON file for each version and locale. Pagefind uses one index and restricts results with `version` and `locale` filters. Both providers keep results from other versions out of the current page's search results.

AI artifacts include only the first array entry's current main version by default. Set `ai.versions: 'all'` to write historical versions into separate partitions:

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'

export default defineConfig({
  ai: {
    versions: 'all'
  }
})
```

## When to keep a snapshot

Keep a snapshot when configuration, APIs, or workflows change incompatibly and readers still need the old instructions, not for every patch. For example, maintain one `0.7.x` content set, save it before rewriting for `0.8`, then offer both series. With one content set, maintain it and record its release commit. Correct historical docs in their snapshot directory, then check, rebuild, and publish.
