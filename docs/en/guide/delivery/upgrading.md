---
title: Upgrading Canofold
description: Update project dependencies, review compatibility changes, and verify build and deployment output
group: Guide
subgroup: Delivery and operations
order: 45
---

# Upgrading Canofold

Before upgrading, read the compatibility changes and upgrade steps for the target version in the [Changelog](https://github.com/canofold/canofold/blob/main/CHANGELOG.md). Upgrade every directly used Canofold package together rather than mixing package generations.

Install an explicit project-local CLI release, commit the lockfile, and make sure `requiredVersion` includes that release:

```bash
pnpm add -D canofold@<version>
pnpm exec canofold check
pnpm exec canofold build --no-cache
pnpm exec canofold build
```

The first build bypasses old cache state and proves that the new release can generate a complete site from source. The second build verifies the persistent cache path.

## From 0.6.2 to 0.6.4

Upgrade all directly used Canofold packages together. These patches leave configuration and theme contracts unchanged: 0.6.3 fixes intrinsic diagram sizing, container fitting, zoom, and expanded dialogs; 0.6.4 fixes button contrast in Glassmorphism, Sketch Style, Bauhaus, and Neumorphism. Rebuild and check diagram loading, source/preview switching, zoom, dialogs, and narrow layouts, plus default and hover button states in every enabled theme. Editors and Webviews with host renderers should also verify cancellation, error recovery, and closing and reopening previews.

## From 0.5.0 to 0.6.x

Upgrade any directly used `canofold`, `@canofold/markdown`, `@canofold/themes`, `@canofold/vite`, and `@canofold/plugins` packages together to 0.6.3, and commit the updated lockfile.

- Replace the former `theme` object with explicit responsibilities: `themes` lists imported `ThemeDefinition` values, `branding` contains only logo and favicon paths, and `layout` contains header and sidebar geometry. Theme names belong to each definition, not `i18n.messages`. Omitting `themes` uses the Canofold light and dark appearances.
- Standalone Markdown consumers must import `@canofold/markdown/base.css` followed by a selected `@canofold/themes/<theme>.css` entry. The former Markdown-owned theme entry no longer exists.
- `kroki()` and `plantUml()` keep source local when `server` is omitted. Remove `server: false`; configure an explicit trusted HTTP(S) base URL for remote rendering or select `renderer: 'client'` and provide the matching host renderer. A server URL cannot contain a query or fragment.
- A third-party theme package should peer-depend on `@canofold/themes`, export a `ThemeDefinition`, and expose its CSS separately. Theme CSS owns visual treatment only; Core continues to own layout, interaction state, and accessibility.
- Navigation entries may use `activePaths` when related pages do not live below the entry's route.

Run a clean build, then verify every configured theme and appearance, locale switching, diagram source/preview behavior, Vite Demo frames, keyboard focus, mobile layout, and CSP rules in the production preview.

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
