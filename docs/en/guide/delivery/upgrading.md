---
title: Upgrading Canofold
description: Update project dependencies, review compatibility changes, and verify build and deployment output
group: Guide
subgroup: Delivery and operations
order: 45
---

# Upgrading Canofold

Before upgrading, read the compatibility changes and upgrade steps for the target version in the [Changelog](https://github.com/canofold/canofold/blob/main/CHANGELOG.md). If your project directly depends on `@canofold/markdown` or `@canofold/plugins`, review their versions and public entries as well.

Install an explicit project-local CLI release, commit the lockfile, and make sure `requiredVersion` includes that release:

```bash
pnpm add -D canofold@<version>
pnpm exec canofold check
pnpm exec canofold build --no-cache
pnpm exec canofold build
```

The first build bypasses old cache state and proves that the new release can generate a complete site from source. The second build verifies the persistent cache path.

## From 0.4.1 to 0.5.0

Upgrade any directly used `canofold`, `@canofold/markdown`, `@canofold/vite`, and `@canofold/plugins` packages together to 0.5.0, and commit the updated lockfile.

- Drafts now participate in local preview and `check`, but remain absent from production pages, search, Markdown mirrors, and AI outputs. If you previously used `status: draft` for permanently hidden content, review local preview visibility.
- `check --json` provides CI-readable diagnostics, and `checks.rules` can set individual rules to `error`, `warning`, or `off`. Review new findings before changing severity; editorial advice need not all block publication.
- Pages without trusted Git history or explicit `updatedAt` no longer display an update date inferred from file mtime. Set `updatedAt` when you need a fixed date. Translation freshness is known only when `translation.sourceHash` records the reviewed source; otherwise it is unknown.
- Existing historical version directories remain usable. For a new snapshot, run `check`, then `snapshot <version-id>`, and add the version to `versions.items` manually. The current version cannot be `archived`; historical Demo and MDX project-local code dependencies must stay inside that version's docs directory. See [version maintenance](/en/guide/site/versions/).
- Search supports field weighting and match highlighting. Rebuild using the steps above, then check common queries and locale/version switching. Search indexes and build caches need no manual conversion.

If you provide a custom DemoEngine, historical Demos must report `dependencyPaths` in their manifest and keep project-local code and assets inside the version directory. Historical Demos cannot reference current-version source or global `demos.setup`. Run a full build after migrating them.

## Pre-release checks

- Open the home page, deep routes, the 404 page, and static assets in the production preview.
- Confirm that search results are filtered by the current locale and documentation version.
- Verify redirects, canonical URLs, `hreflang`, and the sitemap against the deployment origin.
- If you publish AI artifacts, make sure consumers can read `ai/manifest.json` and its declared shards.
- Check light and dark modes, keyboard navigation, and the mobile layout for regressions.

Deploy the new output only after these checks pass. Follow the target version's Changelog when a release requires migration steps.
