---
title: Deploy the static site
description: Publish the Canofold output directory to any static hosting platform
group: Guide
subgroup: Delivery and operations
order: 42
---

# Deploy the static site

Canofold is host-independent. Run `pnpm exec canofold check` and then `pnpm exec canofold build` before publishing. The default publish directory is `.canofold/dist/`.

## Generate host guidance

```bash
pnpm exec canofold deploy
```

This writes platform examples and instructions under `.canofold/deploy/`. It does not create an account, upload files, or modify a remote environment.

## Platform settings

| Platform | Build command | Output directory |
|---|---|---|
| GitHub Pages | `pnpm exec canofold check && pnpm exec canofold build` | `.canofold/dist` |
| Cloudflare Pages | `pnpm exec canofold check && pnpm exec canofold build` | `.canofold/dist` |
| Vercel | `pnpm exec canofold check && pnpm exec canofold build` | `.canofold/dist` |
| Netlify | `pnpm exec canofold check && pnpm exec canofold build` | `.canofold/dist` |
| Nginx / object storage | Upload after CI build | `.canofold/dist` |

The host must serve directory `index.html` files and must not use an SPA fallback. For a subpath deployment, set a matching `basePath`, such as `/project/`, in both Canofold and the CDN or reverse proxy.

Translate generated `redirects.json` into platform 301/308 rules. See [Security boundaries](/en/reference/output/security/) for private documentation and CSP.
