---
title: Frontmatter reference
description: Look up Canofold page metadata fields, defaults, and scope
group: Reference
subgroup: Configuration and CLI
order: 52
---

# Frontmatter reference

Frontmatter appears at the top of a Markdown or MDX file. General page fields apply to all content. `hero` and `features` apply only to each locale's home page.

Unknown fields may be parsed, but they do not affect Canofold behavior and are not automatically published to the AI page index. `ai/pages.json` keeps only `title`, `description`, `createdAt`, `updatedAt`, `order`, `group`, `subgroup`, `tags`, and `owner`.

## General page fields

Most content pages need only a title, description, and ordering metadata:

```yaml
---
title: API authentication
seoTitle: 'API authentication and request signing | Acme Docs'
description: Configure server-side API tokens and request signatures
order: 20
---
```

| Field | Type | Default | Effect |
|---|---|---|---|
| `title` | `string` | First heading or empty | Page title, sidebar, and default SEO title |
| `seoTitle` | `string` | Built from `title` and the site title | Override only the browser and search-result title without changing the page title, sidebar, search, or AI data |
| `description` | `string` | Empty | SEO, search result, and deterministic summary |
| `createdAt` | ISO 8601 date | None | Preserve the content creation time in public page metadata |
| `updatedAt` | ISO 8601 date | Known Git content commit time; otherwise hidden | Pin the footer's last-updated time and publish it in page metadata |
| `group` | `string` | First directory name | Compatibility/display override for the top-level section |
| `subgroup` | `string` | Second directory name | Compatibility/display override for the first nested group |
| `order` | `number` | Last | Page, sidebar, and pagination order |
| `collapsed` | `boolean` | `false` | Initial subgroup state from its `index.md` |
| `layout` | `document \| playground` | `document` | Use the standard document layout or the editable source/preview Playground layout |
| `status` | `published \| draft` | `published` | Preview drafts with `dev` and validate with `check`; production builds omit them |
| `sidebar` | `boolean` | `true` | Exclude the page from the sidebar without removing its route |
| `search` | `boolean` | `true` | Include in search |
| `ai` | `boolean` | `true` | Include in AI outputs |
| `tags` | `string[]` | Empty | Preserve classification metadata in `ai/pages.json` |
| `owner` | `string` | Empty | Preserve ownership metadata in `ai/pages.json` |
| `translation.sourceHash` | `sha256:<64 hexadecimal digits>` | None | Default-locale source fingerprint recorded when reviewing a translation; used only by `check` |

Local `dev` can preview a draft home page, but every version and locale still needs a published home page before release. If its only home has `status: draft`, both `check` and the production build fail.

### Navigation fields

Directory `index.md` files are authoritative for group labels and collapsed state. Conflicting `group` or `subgroup` labels in one directory fail the build.

`group` and `subgroup` do not limit the content tree to two levels. Use directory `index.md` files for recursive navigation. Keep these fields for legacy content or display-name overrides.

### Date fields

Set `updatedAt` when you need an explicit update date. Use `YYYY-MM-DD`, or include `Z` or an offset such as `+08:00` when a time is present. Without it, Canofold uses the file's latest content commit from complete Git history. Uncommitted files, shallow clones, or unavailable Git history have no displayed last-updated date; checkout time and shallow-boundary commits are never presented as content history. For Git-derived dates in CI, fetch the complete history (for example, `fetch-depth: 0` with GitHub Actions `actions/checkout`) or set `updatedAt` explicitly.

### Translation review fingerprint

After reviewing a translation against its default-locale source, run `canofold check --json` and copy the target page's `sourceHash` from `translationStatus` into its `translation.sourceHash` frontmatter field. A subsequent source title, description, or body change makes `check` report that translation as stale. An unstamped translation or a missing source has `unknown` status; file timestamps are not used to guess freshness. Review the translation again before replacing the hash rather than copying it only to silence a warning.

## Home-page fields

Configure each locale home page in the `index.md` at that locale's content root. The default locale uses `docs/index.md`; other locales use `docs/{locale}/index.md`. `canofold.config.ts` holds site-wide configuration, not home-page copy.

```yaml
---
title: Acme Docs
seoTitle: 'Acme Docs | Deployable documentation from API definitions'
hero:
  accent: Build deployable documentation from API definitions
  tagline: Keep content and configuration in the repository, then deploy the static build.
  image: /banner.png
  imageAlt: Acme documentation build flow
  actions:
    - text: Get started
      link: /guide/getting-started/
      primary: true
      icon: rocket
features:
  - image: /feature/api.png
    title: API reference
    details: Build searchable reference pages from versioned content.
---
```

### Page structure

| Field | Type | Page position | Description |
|---|---|---|---|
| `title` | `string` | Hero heading | The single visible page heading |
| `seoTitle` | `string` | Not rendered directly | Override only the browser and search-result title; useful when a short brand name needs a product definition |
| `description` | `string` | Not rendered directly | SEO description and search summary |
| `hero.accent` | `string` | Below the heading | One sentence for the home page's main message |
| `hero.tagline` | `string` | Below the accent | One or two sentences that define the product or its scope |
| `hero.image` | `string` | Right side of the Hero | Main visual; omit it for a single-column Hero |
| `hero.imageAlt` | `string` | Not rendered directly | Alternative text; use an empty string for a decorative image |
| `hero.actions` | `array` | Hero action row | Rendered left to right in array order |
| `features` | `array` | Below the Hero | Home-page capability cards |

`hero.image` and `actions[].link` accept a site path beginning with `/` or an HTTPS URL. Other protocols fail checks and builds.

### Hero actions

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | `string` | Yes | Button label |
| `link` | `string` | Yes | Absolute site path or HTTPS URL |
| `primary` | `boolean` | No | Use the primary style; a home page may define at most one |
| `icon` | `string` | No | Use a built-in Lucide icon from Canofold |

### Feature cards

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | Yes | Card heading |
| `details` | `string` | Yes | One-sentence capability description |
| `image` | `string` | No | Use an image from `{docsDir}/public/`, such as `/feature/api.svg` |
| `icon` | `string` | No | Use the same built-in icon set as actions |

When both `image` and `icon` are present, `image` wins. Omitting both creates a text-only card.

### Images and built-in icons

An image path that starts with `/` maps to `{docsDir}/public/`. For example, `/banner.png` maps to `{docsDir}/public/banner.png`, and `/feature/api.svg` maps to `{docsDir}/public/feature/api.svg`.

Actions and feature cards can also use Canofold's built-in Lucide icons without an extra icon package. Accepted values are `ai`, `box`, `code`, `file`, `file-code`, `gauge`, `globe`, `layers`, `rocket`, `search`, `sparkles`, and `terminal`.

Canofold validates home-page fields during content scanning. Invalid types, unknown nested fields, unsupported icons, or multiple primary actions fail checks and builds.
