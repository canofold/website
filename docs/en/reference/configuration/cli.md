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

All commands except `init` load configuration from the current working directory. Supported names are `canofold.config.ts`, `.mts`, `.cts`, `.js`, `.mjs`, and `.cjs`. `init` creates or reads configuration in its target directory, while `--help` does not load project configuration.

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
- An existing configuration is authoritative. The command adds only missing initialization files; it makes no changes when nothing is missing.

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

`--port` follows the same validation as `preview` and must be an integer from 1 through 65535. Development starts at port 3333 by default. If occupied, it tries higher ports up to 65535 and prints the actual address with the configured `basePath`; other listen errors fail immediately. It does not stop the existing service.

Only one dev session may run per project. Startup checks ownership before loading configuration or building, including when the project is reached through a directory symlink. A duplicate exits with an explicit error without rebuilding or opening another port. Normal shutdown releases ownership; the next startup recovers after a crashed process. Port conflicts between different projects still use the fallback described above.

The server starts watching project inputs before its initial build so saves made during startup are not missed. Watched inputs include configured content roots, local styles, components, extensions, and all six supported configuration names. It ignores `.git`, `node_modules`, `.canofold`, build output, and temporary swap directories.

A Markdown or MDX edit can use a single-page rebuild when navigation metadata is unchanged. Configuration, new files, and content-graph changes trigger a full rebuild.

Successful rebuilds print one short status line. Unchanged cached builds neither repeat statistics nor reload the browser. Detailed cache reasons, sizes, and output paths remain in `.canofold/cache/build-report.json`. Interactive terminals distinguish statuses with color; redirected output and `NO_COLOR` stay plain text. Build errors remain visible and preserve the last successful output.

Recoverable initial Frontmatter, MDX syntax or source-content errors do not end the session. If no output is available, the browser shows an error page and recovers automatically after the source is fixed and saved. Later failures preserve the last complete output; newly opened or reconnected pages also receive the active error. Unsafe startup failures such as configuration, listener or tooling initialization failures still exit. Draft homepages remain available in development.

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

`check` also validates drafts, while production builds omit them. The JSON report contains `schemaVersion: 1`, `diagnostics`, `translationCoverage`, and `translationStatus`; diagnostics include line/column when known. Configuration errors or a missing published home page prevent the content graph from loading, so the command exits with an error instead of a JSON report. Use `checks.rules` to set a rule to `off`, `warning`, or `error`. Any final `error` causes a nonzero exit code.

Independently located Frontmatter, MDX syntax and OpenAPI content failures return as `content-syntax` diagnostics without interrupting checks of other valid files. OpenAPI diagnostics carry the source file, JSON Pointer and available authored line/column, never generated-page positions. Disabling a check rule cannot make uncompilable content publishable; configuration, plugin execution and safety failures still fail explicitly.

Content analysis executes compiler plugins, but does not render complete pages or run browser scripts. MDX component execution, Demos, and generated extension files still require a production build. Run `check` before `build` when publishing. Passing content checks does not replace browser acceptance.

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

The build checks content before committing or reusing output, honoring `checks.rules`: errors fail the build; warnings do not. Pages identifiable as drafts stay outside publication checks, but published links to drafts remain errors. Unparseable Frontmatter still fails rather than guessing the page status. Cache hits do not skip checks.

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

`--port` must be an integer from 1 through 65535. Preview defaults to 4173 and uses the same occupied-port fallback as `dev`, printing the actual mounted address. The command serves `outputDir` and does not watch source files.

## `canofold snapshot <id>`

```bash
canofold check
canofold snapshot v1
```

Copies current docs to `versions/v1/` without modifying configuration or overwriting a destination. Current docs come from the first configured array entry, or `docsDir` when versions are unconfigured. Append the historical entry to `versions`, keeping the main version first; see [versions](/en/guide/site/versions/).

`v1` names the snapshot; it does not trigger a Git lookup. Run it before rewriting docs. Drafts, symlinks, or MDX/Demo dependencies outside the version directory cause errors. Snapshots do not freeze the entire project's build environment.

## `canofold deploy`

```bash
canofold build
canofold deploy
```

`deploy` fails when no build output exists. It generates examples for GitHub Pages, Cloudflare Pages, Vercel, Netlify, and Nginx, but never logs in, uploads, or publishes.
