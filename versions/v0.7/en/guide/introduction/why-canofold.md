---
title: Why choose Canofold?
description: Keep knowledge in your repository, deliver static pages, and share the same content with AI; decide whether Canofold fits your team
group: Guide
subgroup: Introduction
order: 2
---

# Why choose Canofold?

Writing documentation already takes time. Publishing and reusing it should not become a second job. Canofold makes a clear choice: keep knowledge in the repository, keep pages static where possible, and make the same content available to AI.

## Your knowledge, your workflow

Review documentation beside code or in a dedicated knowledge repository. Changes have diffs, releases have commits, and history stays traceable. Keep the Git branches and CI your team already uses instead of introducing another content backend.

During adoption, `canofold init` adds missing configuration and files while leaving existing content in place. Deploy the output to your own static host; protect the complete output directory with Access or an internal gateway for private knowledge. Your team owns the content and its delivery.

## Keep static content lightweight

A reader should get the article first. Canofold generates complete HTML at build time. Native DOM enhancements handle interactions such as tabs and code copying, without full-page React hydration.

Run components where they are needed: Vite powers React demos, and plugins load diagram runtimes. Interactive technical docs can coexist with ordinary content that has little runtime work to do.

Production needs only a static file service. Maintain content and a build pipeline rather than a dedicated documentation application server.

## Written for people, ready for AI

Building a site and then writing crawlers and cleanup scripts for AI repeats work on headings, text, and sources. Canofold can generate Markdown mirrors, `llms.txt`, page metadata, and JSONL shards during the build.

These files update with the pages and retain citable sources. Connect them to your own agents, retrieval systems, or vector stores. You choose the models and retrieval services; Canofold prepares the knowledge.

[Skills](/en/skills/) bring this workflow to agents: author against the actual project, update docs from code, or find answers within a specific documentation locale and version. They remain experimental and can be tried on a focused task.

## Where it is worth trying

If you maintain an open-source project, a React component library, or team knowledge in Git, and want both a complete reading experience and content for search and AI, try Canofold with a few real pages. Its 14 themes, live demos, and VS Code preview fit into that workflow directly.

When browser-based collaborative editing, per-page permissions, or review comments are central requirements, an online CMS or collaborative knowledge base is usually a better fit. Canofold uses static publishing. Teams maintain translations and historical snapshots; the tools organize routes, switchers, and checks.

MDX, local components, and build extensions execute code and are intended for trusted repository content. Read the [security boundaries](/en/reference/output/security/) before processing external input.

## Try it in three steps

1. [Install and initialize](/en/guide/introduction/getting-started/), then add three to five existing pages with real links, images, and code examples.
2. Run `canofold check` and `canofold build`. Inspect navigation, search, and any AI output you need.
3. Read the build with `canofold preview`, edit a page in VS Code, and decide whether to bring in more documentation.

Validate your own writing and reading tasks first, then expand themes, plugins, and locale configuration.
