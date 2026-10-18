---
title: Troubleshooting
description: Diagnose configuration, routes, Markdown, MDX, diagrams, search, and deployment
group: Reference
subgroup: Output and Quality
order: 73
---

# Troubleshooting

## Pages or navigation are missing

- Navigation links must target generated absolute routes and end in `/`.
- The default locale has no URL prefix; alternate locales keep their prefix.
- Sidebars follow directories recursively. Nesting is not rejected; only visual indentation is capped.
- Symbolic links in documentation content are rejected instead of being followed silently.

## Markdown or MDX fails

- Declare fenced-code languages. `fallbackLanguage` labels fences without a language; `unknownLanguage` controls unknown languages.
- MDX imports are limited to `react`, `react/jsx-runtime`, and project-relative files that stay inside the project.
- MDX always executes trusted code. `markdown.html: sanitize` and `strip` apply to Markdown, not MDX.

## A plugin has no effect

- Put Markdown plugins in `markdown.plugins`; put `pagefind()` in `search.provider`.
- Mermaid requires `mermaid`, and Pagefind requires `pagefind`. Restart the development server after installing a dependency.
- Make sure the syntax is page content rather than example source nested inside an outer `markdown` fence.
- `canofold check` executes plugin transforms needed for content analysis, but does not emit the site or run browser enhancement. Use `canofold dev` or `canofold build` to verify final pages and client behavior.
- Custom plugin names must be unique. Bump `version` when transform code changes and include resolved options in `cacheKey`.

If checks and rendered output disagree, run `pnpm exec canofold build --no-cache`. For browser-side failures, inspect the console and Network panel for missing plugin scripts, missing styles, or CSP blocks.

## An extension fails to load or generate output

- `resolve` must begin with `./` and target a file inside the project. The module must default-export the result of `defineExtension(...)`.
- `apiVersion` must currently be `1`, extension names must be unique, and `options` must be JSON-serializable.
- `transformSource` must return a string. `extendPage` may only return fields allowed by the Extension API.
- Every path written by `generate` must be listed in `outputs`. Missing, duplicate, and undeclared writes fail the build.
- `canofold check` does not run `generate`. Run `canofold build` and inspect `outputDir/extensions/{name}/` when verifying extra files.

Extension errors include the extension name, hook, and related page when applicable. Fix the innermost error first, then rebuild.

## Mermaid reports a syntax error

Inspect the source and verify that the project's installed Mermaid version supports the syntax. `mermaid()` builds a local browser runtime from that dependency and makes no remote module request. Configure CSP module access when `moduleUrl` overrides it with a CDN or self-hosted module.

## PlantUML shows source only

This is expected when `server` is omitted. Configure a trusted PlantUML HTTP(S) base URL, or use `renderer: 'client'` with a host renderer, then allow any required network or `blob:` image source in the CSP policy.

## Kroki shows source only

`kroki()` keeps source local by default. Configure a trusted Kroki HTTP(S) base URL for remote rendering, or use `renderer: 'client'` with a host renderer. Do not send private diagram source to an unreviewed service.

## Search has no results

- Check whether the page sets `search: false`.
- With the default compact provider, verify `/search/<version>/<locale>.json`.
- After configuring `pagefind()`, verify `/pagefind/pagefind.js` and its index chunks.
- When an extension changes `searchText` through `extendPage`, rebuild the search index. `canofold check` does not write an index.

## Deployment returns 404

Publish the configured `outputDir` and serve directory `index.html` files instead of an SPA fallback. Confirm that `basePath` matches the hosting path.
