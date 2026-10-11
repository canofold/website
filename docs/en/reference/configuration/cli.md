---
title: CLI command reference
description: Review the inputs, outputs, and failure conditions of every Canofold command
group: Reference
subgroup: Configuration and CLI
order: 53
---

# CLI command reference

This page uses bare `canofold` to show command signatures. Project scripts can use that form directly; prefix an ad-hoc local invocation with `pnpm exec`. See [Installation](/en/guide/introduction/installation/) for package-manager commands.

```bash
canofold --help
```

Canofold currently provides eight commands. All except `init` load configuration from the current working directory. Supported names are `canofold.config.ts`, `.mts`, `.cts`, `.js`, `.mjs`, and `.cjs`. `init` creates or reads configuration in its target directory, while `--help` does not load project configuration.

| Command | Purpose | Default output |
|---|---|---|
| `canofold init [dir] [options]` | Create documentation or adopt existing content | Content directory, `canofold.config.ts` |
| `canofold dev [--port]` | Start the development server | `http://127.0.0.1:3333/` |
| `canofold check` | Report content quality issues | Terminal report |
| `canofold build [--no-cache]` | Generate the static site | `.canofold/dist` |
| `canofold clean` | Remove generated output and build state | — |
| `canofold preview [--port]` | Serve an existing build | Local HTTP server |
| `canofold snapshot <id>` | Copy current docs for historical version maintenance | `versions/<id>/` |
| `canofold deploy` | Generate hosting templates | `.canofold/deploy` |

## `canofold init [dir] [options]`

```bash
canofold init
canofold init my-docs
canofold init --locale en
canofold init --locale en --locales en,zh
canofold init --locale en --docs-dir handbook
```

- Without `dir`, files are created in the current directory.
- With `dir`, Canofold creates a standalone project in that child directory.
- A new project defaults to Chinese single-language content directly under `docs/`, without a `zh/` or `en/` layer.
- Existing Markdown and MDX are adopted in place. Canofold only adds missing configuration and `canofold-env.d.ts`; it never moves, overwrites, or supplements existing content.
- An existing `canofold.config.ts` is authoritative. Re-running the command on a configured project is a successful no-op.

| Option | Meaning |
|---|---|
| `--locale <locale>` | Set the default locale; this is sufficient for a single-language project |
| `--locales <locale,...>` | Set every enabled locale; the first item is the default when `--locale` is omitted |
| `--docs-dir <path>` | Use another project-relative content directory |

Single-language projects do not use locale directories. In a multilingual project, the default locale remains at the content root and only non-default locales use `{docsDir}/{locale}/`. Chinese and English locales, including regional variants such as `zh-CN` and `en-US`, reuse localized starter templates by base language; other languages receive a language-neutral minimal home page.

When existing content has no configuration or explicit locale, an interactive terminal asks for the locale. Scripts and CI never guess: they stop and require `--locale` or `--locales`. Absolute or out-of-project content paths, duplicate or invalid locales, and options that conflict with existing configuration fail before any file is written.

## `canofold dev [--port <number>]`

```bash
canofold dev
canofold dev --port 3334
```

`--port` follows the same validation as `preview` and must be an integer from 1 through 65535.

The command performs an initial build and watches project inputs: configured content roots, local styles, components, extensions, and all six supported configuration names. It ignores `.git`, `node_modules`, `.canofold`, build output, and temporary swap directories.

A Markdown or MDX edit can use a single-page rebuild when navigation metadata is unchanged. Configuration, new files, and content-graph changes trigger a full rebuild.

## `canofold check`

```bash
canofold check
canofold check --json
```

`--json` emits `diagnostics` with stable rule IDs, source locations, and suggestions, plus per-version/locale `translationCoverage` and per-page `translationStatus`. Confirmed errors make the command exit nonzero for CI.

Example output:

```txt
WARNING [frontmatter-description]: docs/en/guide/install.md Frontmatter description is missing
ERROR [broken-link]: docs/en/guide/install.md:12:1 Link target does not exist: /en/reference/missing/
```

The command reports undeclared code languages, missing titles or descriptions, broken internal links and relative assets, duplicate headings, and locale gaps.

`check` also validates drafts, while production builds omit them. When checks complete, `--json` emits `{ schemaVersion: 1, diagnostics: [...] }`; each diagnostic includes a stable `ruleId`, severity, project-relative path, and line/column when known. Configuration errors or a missing published home page prevent the content graph from loading, so the command exits with an error instead of a JSON report. Use `checks.rules` to set a rule to `off`, `warning`, or `error`. Any final `error` causes a nonzero exit code. A production build remains the final gate for MDX, components, and extension output; run `check` before `build` in release workflows.

## `canofold build [--no-cache]`

```bash
canofold build
canofold build --no-cache
```

The build fails when:

- `canofold.config.ts` cannot load or violates the schema;
- `requiredVersion` does not accept the installed Canofold version;
- Markdown, MDX, or a local React component cannot compile;
- routes, output files, navigation, or group metadata conflict;
- versions, redirects, or locale configuration are invalid.

Canofold stores a versioned manifest under `.canofold/cache`. It verifies both inputs and generated
files before a cache hit, rebuilds only invalidated pages when safe, and replaces `outputDir`
atomically. Corrupt or incompatible cache state automatically falls back to a clean build.

Use `--no-cache` to force a clean build while writing a fresh manifest.

Every successful build also prints a summary and writes a machine-readable [build report](/en/reference/output/build-artifacts/) to `.canofold/cache/build-report.json`. The report stays outside the deployable directory and records actual, missing, and removed files.

## `canofold clean`

```bash
canofold clean
```

`clean` removes the configured `outputDir` and persistent build manifest. It uses the same path
safety checks and build lock as `build`, so it refuses overlapping source/output configurations.

## `canofold preview [--port <number>]`

```bash
canofold preview
canofold preview --port 4174
```

`--port` must be an integer from 1 through 65535. The command serves `outputDir` and does not watch source files.

## `canofold snapshot <id>`

```bash
canofold check
canofold snapshot v1
```

Copies the current version's complete docs directory to `versions/v1/` without rewriting configuration or overwriting a target. Drafts, symlinks, or historical Demo/MDX code that still points to current source cause an error. Add the historical entry to `versions.items` yourself; see [versions](/en/guide/site/versions/).

## `canofold deploy`

```bash
canofold build
canofold deploy
```

`deploy` fails when no build output exists. It generates examples for GitHub Pages, Cloudflare Pages, Vercel, Netlify, and Nginx, but never logs in, uploads, or publishes.
