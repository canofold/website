---
title: What is Canofold?
description: Compile Markdown into documentation, search indexes, and AI knowledge; explore the workflow, ecosystem, and integration options
group: Guide
subgroup: Introduction
order: 1
---

# What is Canofold?

Canofold is a modern Markdown knowledge compiler for people and AI. Keep Markdown and MDX in your repository; compile those files into knowledge that people can read, search engines can index, and tools can consume.

Product guides, component examples, and team handbooks can become a complete static site, render inside an existing React application, or open directly in VS Code preview.

## Shared knowledge should not need separate copies

Documentation lives in a repository, readers visit a website, and AI needs clean context. When each surface stores its own copy, every revision becomes a synchronization task, and it gets harder to tell which copy is current.

Canofold keeps source files as the shared authority. Pages for readers, indexes for retrieval, and content for AI follow the same revision and build. Our direction is to connect authoring, reading, and knowledge use while preserving where the information came from.

## One input, three kinds of output

```text
Markdown / MDX + configuration and assets
                    |
          Canofold content compilation
                    |
        +-----------+------------+
        v           v            v
   HTML pages   Search indexes   AI-readable content
                            llms.txt / Markdown / JSONL
```

The content model records pages, headings, links, locales, and versions during compilation. Page generation, checks, and knowledge output use that information, keeping page identities and sources consistent rather than making each downstream tool infer the document structure again.

HTML pages include navigation, outlines, and SEO metadata, ready for static hosting. Search uses the configured provider. Enable [AI-friendly output](/en/reference/output/ai-output/) to generate Markdown mirrors, `llms.txt`, page indexes, and JSONL shards for agents, retrieval, or RAG pipelines.

## Start where you need it

| Your task | Starting point |
|---|---|
| Build searchable documentation across languages and versions | [`canofold` CLI: Quick start](/en/guide/introduction/getting-started/) |
| Render Markdown/MDX inside a React application or SSR pipeline | [`@canofold/markdown`: standalone rendering](/en/markdown/usage/) |
| Give a React component library runnable examples with source views | [`@canofold/vite`: component demos](/en/guide/writing/component-demos/) |
| Preview layout, equations, and diagrams while writing locally | [VS Code extension](/en/vscode/) |
| Ask an agent to author content, maintain docs, or cite site knowledge | [Canofold Skills](/en/skills/) (experimental) |

For a site, keep content and configuration in your project and use the CLI to develop, check, and build. For standalone rendering, the host application continues to own layout, content sources, and routing.

## Separate content, presentation, and extensions

Write code blocks, tables, tabs, steps, and file trees in Markdown. Add official plugins for math and diagrams. React examples reference real Demo source files, with hot updates, source views, and optional iframe isolation.

14 official themes offer 15 appearances, including Canofold light/dark, glassmorphism, neumorphism, and minimalist flat. Customize variables or publish a theme package through the `@canofold/themes` contract while reusing the same content.

The five Core npm packages cover site compilation, Markdown rendering, themes, Vite demos, and official plugins. The VS Code extension is a separate editor entry point; Skills guide agents through authoring, documentation maintenance, and knowledge reading. Adopt the parts you need around your source files.

Ready to build? Follow the [Quick start](/en/guide/introduction/getting-started/). To see the result first, open the [Markdown Playground](/en/markdown/playground/). [Why choose Canofold?](/en/guide/introduction/why-canofold/) explains which teams these design choices fit.
