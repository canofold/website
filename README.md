# Canofold Website

Official Canofold website, documentation, and Markdown Playground.

## Development

Requires Node.js 22 or later and pnpm 11.

```bash
corepack enable
pnpm install
pnpm dev
```

## Checks

```bash
pnpm typecheck
pnpm check
pnpm build
pnpm audit:site
pnpm report
pnpm test:e2e
```

This repository consumes published `canofold` packages. It must not rely on sibling package source directories.
