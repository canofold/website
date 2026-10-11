---
title: Security boundaries
description: Understand trust assumptions for Markdown, MDX, external services, secrets, and private hosting
group: Reference
subgroup: Output and Quality
order: 74
---

# Security boundaries

Canofold executes repository configuration, extensions, MDX, and local TSX during builds. Run production builds only for trusted repository content. Extension path and output restrictions protect build invariants; they do not sandbox extension code or its imported packages.

## Content trust levels

| Content | Policy |
|---|---|
| Reviewed repository Markdown | Keep the `sanitize` default, or opt into `trusted` when raw HTML is required |
| Externally synchronized Markdown | Keep `sanitize`, or use `strip` when authored HTML is unnecessary |
| MDX and local React components | Trusted only; they execute code during builds |
| Project-local extensions and config | Review and pin dependencies; they have build-process privileges |
| External pull requests | Do not run unreviewed builds in an environment holding production secrets |

## Secrets

Never place secrets in Markdown, MDX, browser configuration fields, or `docs/public/`.

## Private hosting

Canofold does not provide SSO/RBAC. A hosting identity layer must protect HTML, Markdown sources, search, AI files, assets, and redirects together.

`seo.robots: 'disallow'` only asks compliant crawlers not to crawl. It cannot prevent access, downloads, or index leakage and does not replace login, gateway policy, or private object-storage permissions.

## HTML and external runtimes

Sanitization removes scripts, event attributes, and unsafe URLs from Markdown HTML; it is not a JavaScript sandbox. MDX remains executable trusted code.

Starting in 0.5.0, `mermaid()` builds its local runtime from the project's installed Mermaid and locked dependencies without requesting remote modules. Audit the site's own production dependencies, then rebuild and deploy after dependency updates so browser assets use the new versions.

An explicit `mermaid({ moduleUrl })` override can point to a self-hosted module or CDN. That module executes in the reader's browser, so use trusted sources and allow only the required origins in CSP. `kroki()` and `plantUml({ server })` send diagram source to the configured service; use trusted, controlled endpoints and avoid sending sensitive content.
