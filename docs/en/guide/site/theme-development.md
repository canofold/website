---
title: Develop a theme package
description: Define themes and appearances, write visual CSS, and package and verify a third-party Canofold theme
group: Guide
subgroup: Site capabilities
order: 36.5
---

# Develop a theme package

A theme is an independent npm package with separate definition and CSS exports. Add the definition to `themes`; no Core change or global registry is needed. To select existing themes, see [Theme customization](/en/guide/site/customization/).

## Create a minimal package

This theme reuses the official base palette and overrides its own variables. Its JavaScript entry needs no build tool; a separate declaration supports TypeScript consumers.

:::file-tree
- canofold-theme/
  - package.json
  - index.js
  - index.d.ts
  - aurora.css
  - LICENSE
:::

```json title="package.json"
{
  "name": "@acme/canofold-theme",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "files": ["index.js", "index.d.ts", "aurora.css", "LICENSE"],
  "exports": {
    ".": { "types": "./index.d.ts", "import": "./index.js" },
    "./aurora.css": "./aurora.css"
  },
  "peerDependencies": { "@canofold/themes": "^0.6.8" }
}
```

Replace the example scope `@acme` before publishing and provide the matching license. Install the peer dependency for development too. CSS must enter both `files` and `exports`, not only the source directory.

```js title="index.js"
import { defineTheme } from '@canofold/themes'

export default defineTheme({
  id: 'aurora',
  name: { zh: '极光', en: 'Aurora' },
  styles: ['@canofold/themes/canofold.css', '@acme/canofold-theme/aurora.css'],
  appearances: [
    { id: 'light', name: { zh: '浅色', en: 'Light' }, colorScheme: 'light' },
    { id: 'dark', name: { zh: '深色', en: 'Dark' }, colorScheme: 'dark' }
  ]
})
```

```ts title="index.d.ts"
import type { ThemeDefinition } from '@canofold/themes'

declare const aurora: ThemeDefinition
export default aurora
```

## Definition contract

| Field | Constraint |
|---|---|
| `id` | Stable lowercase kebab-case, unique within the site |
| `name` | At least one non-empty name keyed by a BCP 47 locale or base language, such as `zh`, `en`, or `zh-CN` |
| `styles` | Non-empty, unique CSS exports in cascade order |
| `appearances` | At least one appearance; ids are unique within the theme, and names follow the same rules |
| `colorScheme` | Only `light` or `dark`, controlling browser color scheme and Core's light/dark semantics |

`defineTheme()` validates, normalizes, and freezes definitions. Unknown fields and invalid values fail. Names fall back through the current locale, base language, English, and first available name. A single appearance displays the theme name; multiple appearances display “Theme · Appearance”. Do not put names in `i18n.messages`.

Core owns `data-cf-theme`, `data-cf-theme-appearance`, `.dark`, persistence, and Demo frame synchronization. Ids participate in persistence, so keep them stable after publishing. An explicit array defaults to the first appearance of its first entry, not an automatically chosen system appearance.

Use public CSS exports in packages. Project-local definitions can use paths relative to the project working directory, such as `./docs/aurora.css`. Do not publish machine-specific absolute paths or import CSS as a JavaScript side effect: Core assembles it through `styles`.

## CSS responsibilities

Core and `@canofold/markdown/base.css` own structure and behavior; `@canofold/themes/shared.css` supplies shared visual hooks. The site assembles CSS from every configured theme, so each theme must be scoped.

```css title="aurora.css"
html[data-cf-theme='aurora'] {
  --cf-accent-500: #0f766e;
  --cf-accent-strong: #0f766e;
  --cf-accent-deep: #115e59;
  --cf-accent-soft: #ccfbf1;
  --cf-radius-md: 10px;
  --cf-radius-lg: 16px;
}

html[data-cf-theme='aurora'][data-cf-theme-appearance='dark'] {
  --cf-on-accent: #073c35;
  --cf-accent-500: #5eead4;
  --cf-accent-strong: #5eead4;
  --cf-accent-deep: #99f6e4;
  --cf-accent-soft: #134e4a;
}
```

The example explicitly lists `canofold.css` first to reuse a complete light/dark palette. An independent theme may omit it, but must provide its required colors, typography, radii, and shadows instead of depending on another theme happening to be configured.

`styles` reads CSS content; it does not automatically copy package fonts or images or rewrite relative `url()` references. Small decorations can use data URLs. Put project assets in `docs/public/` and use their public URLs. If a theme distributes additional files, provide explicit installation or build steps and verify subpath deployment instead of assuming package-relative resources will appear on the site.

| Purpose | Example visual hooks |
|---|---|
| Content surfaces | `--cf-canvas`, `--cf-surface`, `--cf-surface-elevated` |
| Text | `--cf-ink`, `--cf-ink-body`, `--cf-ink-secondary` |
| Accent and status | `--cf-accent-500`, `--cf-on-accent`, `--cf-success`, `--cf-warning`, `--cf-danger` |
| Navigation state material | `--cf-nav-item-hover-*`, `--cf-nav-item-active-*` |
| Borders and shadows | `--cf-hairline`, `--cf-shadow-raised`, `--cf-shadow-inset` |
| Typography and radii | `--cf-font-sans`, `--cf-font-display`, `--cf-radius-md` |

Consult the installed `shared.css` and theme CSS for complete hooks. If variables cannot express an effect, add a scoped, purely visual selector without relying on internal DOM nesting. Themes must not redefine display, positioning, dimensions, spacing, alignment, overflow, stacking, hit areas, visibility, focus behavior, or hover/active state detection. Navigation, sidebars, and dropdowns share state hooks instead of separate override rules.

## Package and verify

Run `npm pack --dry-run` in the theme directory to inspect definitions, declarations, CSS, and the license, then run `npm pack`. Install the result in an independent test site:

```bash
pnpm add -D canofold@0.6.8 @canofold/themes@0.6.8 /absolute/path/acme-canofold-theme-1.0.0.tgz
```

```ts title="canofold.config.ts"
import { canofold } from '@canofold/themes'
import { defineConfig } from 'canofold'
import aurora from '@acme/canofold-theme'

export default defineConfig({ themes: [canofold, aurora] })
```

Run `canofold check`, `canofold build --no-cache`, and `canofold preview`. Check both appearances, refresh persistence, localized names, hover/active states, keyboard focus, mobile layout, Demo synchronization, code, tables, math, diagrams, search, and dialogs. Build again with only `themes: [aurora]` to detect dependencies on other themes.

Standalone React consumers import `@canofold/markdown/base.css`, then CSS in `styles` order, and set root theme/appearance attributes and the light/dark class themselves. The site's automatic selector is not part of the Markdown SDK. Publish to npm only after verification.
