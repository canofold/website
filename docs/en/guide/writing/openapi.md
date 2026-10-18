---
title: OpenAPI documentation
description: Bring local OpenAPI specifications into one documentation, search and machine-content pipeline
group: Guide
subgroup: Writing
order: 27
---

# OpenAPI documentation

OpenAPI is a standard file describing HTTP endpoints: their paths, parameters, responses and authentication. A backend service or API team maintains the JSON/YAML specification; Canofold compiles it into reference pages within the documentation site.

For example, keep your Markdown integration guide alongside an exported `openapi.yaml`. The guide explains the workflow, while the specification supplies parameter, request and response details. Both enter the same navigation, search and AI outputs, so endpoint changes do not require copying another parameter table.

Use this for API guides, endpoint references alongside SDK documentation, or internal service handbooks. Ordinary articles and component documentation without an API specification do not need `sources`. Canofold reads the specification; it does not scan backend code or infer endpoints from prose. Pages do not execute API requests or generate SDKs.

## Connect a source

Local OpenAPI 3.0.x/3.1.x JSON/YAML is supported. Install matching CLI and adapter versions and retain a normal Markdown/MDX homepage:

```sh
pnpm add -D canofold@^0.8.0 @canofold/plugins@^0.8.0
```

Prepare these files, or use the specification already exported by your backend:

```text
canofold.config.ts
docs/
  index.md
  api/
    openapi.yaml
```

Put normal homepage content in `docs/index.md`, such as `# Pet API guide`. A minimal `docs/api/openapi.yaml` is:

```yaml
openapi: 3.1.0
info:
  title: Pet API
  version: '1.0'
paths:
  /pets:
    get:
      summary: List pets
      responses:
        '200':
          description: Success
```

Connect the file in `canofold.config.ts`:

```ts
import { defineConfig } from 'canofold'
import { openapi } from '@canofold/plugins/openapi'

export default defineConfig({
  i18n: { defaultLocale: 'en', locales: ['en'] },
  sources: [openapi({
    id: 'pet-api',
    root: 'docs/api',
    entry: 'docs/api/openapi.yaml',
    version: 'current',
    locale: 'en',
    base: '/api/'
  })]
})
```

This is a build-time source, not a Markdown plugin. Do not register it in `markdown.plugins`. Only explicitly configured sources participate.

Start the documentation server:

```sh
pnpm exec canofold dev
```

Using the local address printed in the terminal, open `/api/` for the Pet API overview and `/api/get/2f70657473/` for `GET /pets`. Here `/pets` is the backend endpoint being described; `/api/` is the documentation section. The specification's `servers` values are displayed as API information, not used as the Canofold development server address.

Without explicit navigation, the source joins generated navigation and the sidebar. If the project already has `navigation`, add `{ text: 'API reference', link: '/api/' }` to the matching locale array. Editing the specification or local references updates the preview. Before a production build, run:

```sh
pnpm exec canofold check
pnpm exec canofold build
```

Generated content lives in the configured `outputDir`, which defaults to `.canofold/dist`; generated Markdown is not written into `docs`. Pages use the site's themes and search configuration, and machine outputs follow the corresponding `ai` switches.

## Source options

| Field | Meaning |
| --- | --- |
| `id` | Stable lowercase kebab-case identity, unique within a version/locale |
| `root` | Project-relative boundary directory for local references |
| `entry` | Project-relative entry file, inside root |
| `version` | Configured documentation version ID; current when versions are omitted |
| `locale` | Configured locale; no automatic translation |
| `base` | Locale-relative route prefix, starting/ending with /, without deployment or version prefixes |
| `include.paths` | Optional exact API paths, not generated URLs or wildcard expressions |
| `include.tags` | Optional any-matching tags; intersects paths when both are configured |

Selector arrays must be nonempty and unique; unmatched selectors fail. Omit include for all paths operations. Each operation appears once; its first tag supplies a display group, and untagged operations remain reachable.

## Pages, identity and source

Pages contain method/path, descriptions, inherited/overridden parameters, requests/responses, authentication, servers, deprecation, examples and referenced schemas. Composition and recursion retain their authored structure rather than pretending to be flattened types. Responses are never invented.

URLs combine the prefix, lowercase method and lowercase hexadecimal UTF-8 API path, in segments of at most 64 characters. `GET /pets` under `/api/` becomes `/api/get/2f70657473/`. Title, tags and operationId changes do not move URLs. Collisions fail instead of acquiring order-dependent suffixes.

Source ID and operation method/path determine derived identity. Entry-file renames, title and deployment changes do not. Actual paths, entry JSON Pointers and reference dependencies remain separate provenance. The source viewer and Markdown mirror explicitly show generated Markdown, not original JSON/YAML. This does not automatically publish the raw specification and all referenced files.

## Versions, locales and updates

`info.version` belongs to the described API, not the documentation version. Configure separate language/version bindings; source IDs may be reused across those scopes. Entry/reference changes recompute that source. Removing operations or sources cleans their departed artifacts.

Historical entries and all local references must stay inside their version's `docsDir`, never borrowing the current specification. `canofold snapshot` can copy version-local inputs but does not guess or rewrite source bindings. Explicitly register the historical entry, root and version, then check and build. See [Documentation versions](/en/guide/site/versions/).

A broken specification or reference fails the build while preserving the preceding complete output. Repair restores the build; partial sources are not published. Invalidation is source-wide, not a claim to recompute only one operation.

## Security and supported scope

- Only local inputs inside root are read. Traversal, symlinks, missing targets and reference credentials/query strings are rejected. URI `$id` identifiers may name already loaded local schemas, not authorize network access.
- Descriptions, examples and extensions remain data. They do not execute HTML, MDX, rich directives or API requests. Configuration/adapters are still trusted build code, not a sandbox.
- Preserve 3.0 nullable, 3.1 boolean schemas, composition, recursion, anchors and a finite static reference closure. Full JSON Schema instance validation and dynamic runtime evaluation are not promised. Custom dialect declarations remain data without inferred extra semantics.
- Callback/webhook declarations do not become independent pages. Swagger 2.0, OpenAPI 3.2, remote sync, Try-it-out, credential management and SDK generation are not included.
- Limits: 16 MiB/file, 64 MiB and 512 files/source; JSON depth 128 and one million nodes, YAML alias expansion 50; 10,000 operations plus overview, 64 MiB generated body/facts, 16 MiB referenced schemas/page, and 1,024 UTF-8 bytes/API path. Exceeding limits fails explicitly, never silently truncates.

Parse/validation diagnostics identify the actual file, JSON Pointer and line/column when available. Generated-body checks do not pass generated lines off as authored source positions. See [AI output](/en/reference/output/ai-output/) for schema 3 representations and migration.
