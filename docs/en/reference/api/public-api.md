---
title: Public API and compatibility
description: Know which Canofold interfaces follow compatibility and deprecation guarantees
group: Reference
subgroup: API
order: 63
---

# Public API and compatibility

Canofold keeps its supported surface intentionally small. Use documented package exports, CLI commands, configuration fields, semantic Markdown APIs, theme tokens, and extension API v1. Do not deep-import generated chunks or depend on build-cache files, serialized AST/HAST, Pagefind internals, `.cf-*` shell classes, or exact layout markup.

The [Markdown syntax reference](/en/markdown/syntax/) defines the authoring contract for semantic Markdown. Internal class names and compiled node structures are not authoring APIs.

## Package contracts

Canofold publishes five packages. `canofold` exports `canofoldVersion`, `defineConfig`, `CANOFOLD_EXTENSION_API_VERSION`, `defineExtension`, `defineSearchProvider`, and the documented configuration, search, and extension types from its root. `@canofold/markdown` supports only the subpaths declared in its package export map: React, client enhancement, server rendering, analysis, and structural CSS. `@canofold/themes` exports the `ThemeDefinition` contract, official theme definitions, shared visual tokens, and public theme CSS entries. The `@canofold/vite` root exports the `vite()` Demo Engine and its option types while reusing the project's Vite configuration. `@canofold/plugins` exposes official Markdown plugin and search-provider factories through its aggregate root and focused subpaths; generated sites load its browser and CSS subpaths on demand.

Generated AI Manifests and extension descriptors carry explicit versions. Reject versions your consumer does not understand.

Configure build-time sources through `sources`. The public `ContentSource`, `ContentSourceContext`, and `SourceDocument` types from `canofold` feed pages, search, and machine content through one pipeline. The official `openapi()` factory is exported only by the server-side `@canofold/plugins/openapi` subpath, not the aggregate root or browser bundle. See [OpenAPI documentation](/en/guide/writing/openapi/) for setup and boundaries.

The source context provides `context.fail({ message, file?, pointer?, line?, column? })` to report a repairable input error and stop that source without committing partial pages. Omit `file` to use the entry. A supplied path may be absolute or relative to the source's `root`, and must name a bounded input already read through `context.read()`. Positions are one-based and omitted when unavailable; a `column` also requires a `line`. Ordinary adapter exceptions remain tooling failures. The host supplies this method, so adapters do not import private Core error classes; the official OpenAPI adapter uses it for structured diagnostics. See the [CLI reference](/en/reference/configuration/cli/) for command behavior.

## Version policy

During `0.x`, patch releases remain compatible. A minor release may make a breaking correction only when the Changelog states its impact and upgrade path. When possible, a non-security removal is deprecated for at least one minor release.

From `1.0`, incompatible public changes require a major release. Deprecations stay available for at least two minor releases or 90 days, whichever is longer, unless retaining the behavior would preserve a security vulnerability.
