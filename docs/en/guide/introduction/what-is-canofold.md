---
title: What is Canofold?
description: Learn what Canofold is for, what it provides, and which package to use
group: Guide
subgroup: Introduction
order: 1
---

# What is Canofold?

Canofold is a static knowledge and documentation platform built around Markdown and MDX. It produces documentation sites, search indexes, and AI-readable content, with a standalone React Markdown renderer, Vite component demos, theme packages, and plugin extensions.

It fits teams that version knowledge alongside code, configuration, or other project assets. Adoption does not require changes to application source or a separate documentation frontend. One CLI handles development, checks, builds, and previews.

## Add docs with minimal intrusion

Docs, configuration, and commands stay in the existing repository. `canofold init` adds only missing files; existing Markdown and MDX remain in place and are not overwritten.

The build output is static. Production does not require a Canofold service, a Node.js server, or a database.

## Unfold one source into multiple outputs

The same Markdown and MDX can produce a complete static site, local search indexes, Markdown mirrors, `llms.txt`, and bounded content shards, according to configuration. These files share the same content; they do not call a model or provide hosted retrieval or question answering.

Navigation, sidebars, locale routes, and version routes are generated from the content structure and configuration as well.

Translations and historical content snapshots must be maintained separately. Canofold does not translate pages automatically or create historical documentation from package versions.

## Main capabilities

| Task | What Canofold provides |
|---|---|
| Write content | Markdown, MDX, local React components, code, tables, file trees, media, math, and diagrams |
| Organize the site | Routes, navigation, sidebars, page outlines, search, SEO, locales, and versions |
| Customize presentation | 14 official themes, light/dark appearances, branding, and third-party theme packages |
| Check content | Configuration, frontmatter, links, static assets, and missing translations |
| Build and publish | Complete static HTML, redirects, search indexes, and deployable output |
| Serve AI tools | Markdown mirrors, `llms.txt`, page indexes, and chunked data |

See the [Markdown SDK](/en/markdown/) for content syntax, [Quick start](/en/guide/introduction/getting-started/) for the site workflow, and [Reference](/en/reference/) for configuration fields.

## Choose a package

| Package | Responsibility |
|---|---|
| `canofold` | Build a complete documentation site |
| `@canofold/markdown` | Render Markdown and MDX in an existing React, SSR, or static generation project |
| `@canofold/themes` | Provide the theme contract and official visual themes |
| `@canofold/vite` | Run live examples, HMR, and production demo builds in a Vite component project |
| `@canofold/plugins` | Provide math, diagrams, link handling, reading time, and Pagefind plugins |

A regular documentation site only requires `canofold`. Install `@canofold/themes` directly when the config imports theme definitions; the other packages render Markdown independently, integrate Vite component demos, or add optional plugins.

## Scope

Canofold fits product documentation, developer documentation, team knowledge bases, operating manuals, and open-source projects, especially when the project needs locales, version management, or AI-ready knowledge output.

Canofold is not an online CMS or a hosted service. It does not provide collaborative editing, accounts, permissions, review comments, or a dynamic content API. Protect the complete output directory at the hosting layer for private documentation.

MDX, local components, and build extensions execute code and should only process trusted content. See [Security boundaries](/en/reference/output/security/) for details.

Read [Why choose Canofold?](/en/guide/introduction/why-canofold/) for its design tradeoffs. When you are ready, [install Canofold](/en/guide/introduction/installation/). To inspect the rendered content first, open the [Markdown Playground](/en/markdown/playground/).
