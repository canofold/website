---
title: Migrate existing documentation
description: Move Markdown, VitePress, or Docusaurus content into Canofold
group: Guide
subgroup: Introduction
order: 5
---

# Migrate existing documentation

Work on a new branch and keep the old site until links, assets, and search pass validation. Canofold does not interpret another framework's configuration or offer a lossless converter. The content can move, but routes and navigation must be checked against Canofold's rules.

## Plain Markdown repository

Choose the documentation root and specify the source language. `init` preserves existing files and does not overwrite conflicting pages or configuration:

```bash
pnpm add -D canofold
pnpm exec canofold init --locale en --docs-dir docs
pnpm exec canofold check
pnpm exec canofold build --no-cache
```

Provide at least `docs/index.md`. `docs/guide/install.md` maps to `/guide/install/`. Keep page-local images next to the page; place stable shared paths under `docs/public/`. Add page `title` and `description`. Configure [redirects](/en/guide/site/redirects/) for published URLs that change. CI can consume rule IDs and source positions from `check --json`.

Relative `.md` / `.mdx` links to collected documents resolve from the source file to an HTML route in the same version, preserving queries and fragments. For example, `[Next](./next.md#api)` in `docs/guide/start.md` points to `/guide/next/#api`, even with Markdown mirrors disabled. Extensionless and directory links follow the checker's lookup order: the exact file, `.md`, `.mdx`, `index.md`, then `index.mdx`. An existing asset takes precedence over same-named document candidates. Cross-language links follow the actual source-file layout. Absolute site URLs, external links, and assets do not use this source-file conversion. To download a Markdown mirror, enable mirror output and link to its explicit public URL.

If a document references files outside the new documentation root, move those files with it and adjust relative paths, or link to stable repository URLs.

## VitePress

VitePress [Markdown extensions](https://vitepress.dev/guide/markdown) and [Vue-in-Markdown](https://vitepress.dev/guide/using-vue) are not Canofold syntax. Copy content into a separate `docs/` directory while retaining the old site build. Do not treat `.vitepress/` as a Canofold configuration directory.

| VitePress source | Canofold destination |
|---|---|
| `.vitepress/config.ts` `nav` and `sidebar` | `navigation` in `canofold.config.ts`; directories and `index.md` form the sidebar |
| `public/` | `{docsDir}/public/`, then verify absolute asset URLs |
| Ordinary `.md` and relative links | Keep files, run `check`, verify public routes |
| Vue components, interpolation, framework-specific containers | Rewrite page by page; use `::demo` for React component examples, supported Markdown directives or trusted MDX for other content |
| Older version directories | Add `versions.items`; check routes and component sources for each version |

For example, `docs/guide/install.md` becomes `/guide/install/`. Validate the new page before redirecting an existing `/guide/install` public URL. Do not blindly replace links: fragments, query strings, and subpath deployment need individual review.

## Docusaurus

Docusaurus [MDX](https://docusaurus.io/docs/markdown-features/react), [admonitions](https://docusaurus.io/docs/markdown-features/admonitions), and [versioned docs](https://docusaurus.io/docs/versioning) have their own semantics; copying directories alone does not preserve rendering.

| Docusaurus source | Canofold destination |
|---|---|
| `sidebars.js`, `_category_.json` | Directory `index.md` names groups; `order` sorts pages |
| `id`, `slug`, `sidebar_position` | Derive routes from paths, sort with `order`, redirect old URLs where needed |
| `static/` | `{docsDir}/public/`, then verify references |
| Versioned docs | Separate `docsDir` per version with a `versions.items` `base` |
| Theme components and MDX package imports | Rewrite individually; local Canofold MDX components use trusted relative imports, interactive examples use Demo |

Sample a page with `:::note` or `:::tip`, tabs, an image, and a titled code block, then compare its actual preview. Keep unsupported plugins, React components, or routing metadata on a migration checklist until converted; unknown Frontmatter fields may parse without taking effect.

## Exit checks

1. Run `canofold check` and `canofold build --no-cache`; fix every error.
2. Use `canofold preview` to open the home, a deep route, assets, 404, and a page with code or a component.
3. Compare navigation, anchors, shared URLs, search, and locale/version switching with the old site; add redirects where necessary.
4. Inspect the sitemap, canonical URLs, and `hreflang` before deployment. Avoid claiming the same canonical URL on two live sites during cutover.

Continue with [content structure](/en/guide/writing/content-structure/), [assets](/en/guide/writing/assets/), and [versions](/en/guide/site/versions/).
