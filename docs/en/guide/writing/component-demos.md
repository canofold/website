---
title: Build component demos with Vite
description: Run components, displayed source, and Canofold documentation with one command
group: Guide
subgroup: Writing
order: 34
---

# Build component demos with Vite

Component documentation should run real component code instead of copying an example into Markdown that can drift. Canofold exposes this through a demo-engine boundary; Vite projects use the official `@canofold/vite` engine.

## Install and configure

```bash
pnpm add -D @canofold/vite
```

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'
import { vite } from '@canofold/vite'

export default defineConfig({
  demos: {
    engine: vite()
  }
})
```

Run `canofold dev`. Canofold remains responsible for routing, Markdown, and page rebuilds, while Vite handles component modules, the CSS dependency graph, and HMR. They share one process and one port, so no second Vite server is required. Existing `vite.config.ts`, plugins, aliases, and React settings continue to apply. The official engine currently supports React 18 and React 19.

## Write a demo

A demo is a regular `.tsx`, `.jsx`, `.ts`, or `.js` file that default-exports a React component. The component entry should import its own CSS:

```tsx title="src/components/button/demo/basic.tsx"
import { Button } from '@acme/ui'

export default function BasicButtonDemo() {
  return <Button>Save</Button>
}
```

Reference it from an ordinary `.md` page:

```md
::demo[Basic usage]{src="/src/components/button/demo/basic.tsx" description="Shows the default button state and click behavior."}
```

The bracketed label is the demo title, and `description` is the short explanation shown below it; both are optional. Every card provides “Open in new window” and “Show source” actions. Source is collapsed by default, and the source action changes to its expanded state when opened. Canofold runs and displays the same demo file, so both update together. Add `sandbox="iframe"` when DOM and global-style isolation is required:

```md
::demo[Isolated preview]{src="/src/components/button/demo/basic.tsx" sandbox="iframe"}
```

Iframe mode runs trusted repository code. It restricts capabilities such as navigation, form submission, and popups for the embedded preview, but it is not a security boundary for untrusted third-party code. “Open in new window” uses a standalone preview page and does not inherit the iframe restrictions.

### Demos running on this page

The two cards below are generated from the same React demo file in the Website repository. The first mounts directly in the page and the second uses iframe isolation; the preview and expanded source always come from that one file.

::demo[Inline interaction]{src="/docs/examples/release-channel/basic.tsx" description="Switch release channels to verify React state, component CSS, and inline rendering."}

::demo[Iframe isolation]{src="/docs/examples/release-channel/basic.tsx" sandbox="iframe" description="Run the same demo in an isolated document to verify iframe loading and automatic height."}

### Demo syntax

| Part | Required | Meaning |
|---|---|---|
| `[title]` | No | Demo title shown below the preview |
| `src` | Yes | A `.tsx`, `.jsx`, `.ts`, or `.js` demo file inside the project root |
| `description` | No | One sentence explaining the demo's purpose or behavior |
| `sandbox` | No | `inline` (default) or `iframe` |

Both `src` and `demos.setup` must resolve to local source inside the project root. Canofold does not execute demo entries from outside the project or from `node_modules`.

## Package entry and source resolution

Canofold does not require a documentation-only alias or library entry. `@canofold/vite` reuses the project's existing Vite resolution. For a standard single-package component library with a package name, exactly one `build.lib.entry`, and no explicit same-name alias, 0.3.3 resolves that package name precisely to the source entry, so the entry path is declared only once. Multi-entry libraries and multi-package workspaces are not inferred; they keep using the project's workspace, exports, TypeScript paths, or Vite aliases, and Canofold never overrides a same-name alias configured by the project.

`vite()` discovers `vite.config` from the Canofold project root by default. Use `vite({ root: './packages/ui' })` or `vite({ configFile: './vite.docs.config.ts' })` only when the Vite root differs or a specific config is required. Pass `configFile: false` to disable config discovery.

## CSS and shared context

Do not list every component stylesheet in `styles`, and do not repeat style imports in every demo. Import `./styles.css` from the public component entry; Vite follows the dependency graph in development and extracts CSS for production. Reserve `styles` for documentation-site globals.

Configure `setup` only when every demo needs a shared provider:

```ts title="canofold.config.ts"
export default defineConfig({
  demos: {
    engine: vite(),
    setup: './docs/demo.setup.tsx'
  }
})
```

```tsx title="docs/demo.setup.tsx"
import type { PropsWithChildren } from 'react'

export default function DemoSetup({ children }: PropsWithChildren) {
  return <YourThemeProvider>{children}</YourThemeProvider>
}
```

Do not create this file when no shared provider is needed. MDX remains available for trusted pages that need free-form JSX, but component demos no longer require MDX.
