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

## Documentation version configuration in 0.7.1

`versions` is now an array. Assign the old `items` directly to `versions`, move the entry selected by `current` to the first position, and remove the `current` and `items` wrapper fields. The object format is no longer accepted; source directories and URL paths need not change.

Omitted or empty versions no longer display a control. Configure one entry for a label or multiple entries for switching. Neither the project nor Canofold package version is read automatically. Check default docs, historical paths, and search after upgrading, then rebuild. See [Manage documentation versions](/en/guide/site/versions/) for examples.

## Machine-format migration to 0.7.0

Canofold 0.7.0 introduces schema 2 machine output. Existing 0.6.x sites continue to produce their previous format until upgraded and rebuilt.

Upgrade directly used packages from the five-package set together to 0.7.0, update `requiredVersion` and the lockfile, then run content checks, a clean build and a second cached build. Upgrade machine consumers to support schema 2 and establish a fresh trusted baseline. Never compare schema 1 route records with new document IDs to infer removals.

Existing HTML/Markdown routes and output switches retain their meanings. Configure a stable `ai.contentSpace` for the same collection across roots; without one, compare only within the same source. Full manifests work with the page index disabled. If full content is disabled, select an explicit metadata entry instead of treating read failures as deleted content. See [AI-friendly output](/en/reference/output/ai-output/) for representations and integrity rules.

## 0.6.x patch upgrades

Existing 0.6.x sites need no configuration or theme-definition migration for 0.6.8. Keep directly used packages from the five-package set on the same version, rebuild, and deploy the complete output directory. The Changelog lists individual fixes; this page covers migration steps that require project changes.

### Upgrade Mermaid separately

Mermaid is an optional peer. Upgrading Canofold does not replace the project's installed Mermaid. To move from Mermaid 11 to 12, use `pnpm add -D mermaid@^12.2.0`. Mermaid 12 requires Node 22.12+, Safari 17.4+, or equivalent ES2024 browser support.

Canofold defaults to Dagre layout and the Classic look. To use ELK, set `layout: elk` under `config` in diagram front matter and migrate the former `defaultRenderer` setting to `layout`. Deploy the complete output directory, including the lazy-loaded ELK resource chunks.

## From 0.5.0 to 0.6.x

Upgrade any directly used `canofold`, `@canofold/markdown`, `@canofold/themes`, `@canofold/vite`, and `@canofold/plugins` packages together to 0.6.8, and commit the updated lockfile.

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
- Existing historical version directories remain usable. For a new snapshot, run `check`, then `snapshot <version-id>`, and register the historical version. The current version cannot be `archived`; historical Demo and MDX project-local code dependencies must stay inside that version's docs directory. When upgrading to 0.7.1, convert the configuration as described above. See [version maintenance](/en/guide/site/versions/) for usage.
- The new release regenerates search indexes and build caches; neither needs manual conversion.

If you provide a custom DemoEngine, historical Demos must report `dependencyPaths` in their manifest and keep project-local code and assets inside the version directory. Historical Demos cannot reference current-version source or global `demos.setup`. Run a full build after migrating them.

## Pre-release checks

- Open the home page, deep routes, the 404 page, and static assets in the production preview.
- Confirm that search results are filtered by the current locale and documentation version.
- Verify redirects, canonical URLs, `hreflang`, and the sitemap against the deployment origin.
- If you publish AI artifacts, make sure consumers can read `ai/manifest.json` and its declared shards.
- Check light and dark modes, keyboard navigation, and the mobile layout for regressions.

Deploy the new output only after these checks pass. Follow the target version's Changelog when a release requires migration steps.
