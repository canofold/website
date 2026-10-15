---
title: Theme customization
description: Select visual themes and configure Canofold branding, layout, and project styles
group: Guide
subgroup: Site capabilities
order: 36
---

# Theme customization

Canofold separates visual themes, brand assets, and layout geometry. Theme packages own localized names, colors, typography, radii, borders, shadows, and visual motion. Core owns DOM structure, dimensions, responsive behavior, interaction states, focus, and accessibility.

## Select visual themes

Install `@canofold/themes` directly when the config imports official definitions:

```bash
pnpm add -D @canofold/themes
```

Then list only the themes readers should be able to select:

```ts title="canofold.config.ts"
import { canofold, neoBrutalist, neumorphism } from '@canofold/themes'
import { defineConfig } from 'canofold'

export default defineConfig({
  themes: [canofold, neoBrutalist, neumorphism]
})
```

The first appearance of the first entry is the default. `canofold` provides light and dark appearances; every other official theme provides one fixed appearance. The reader's selection persists across pages and is also applied inside isolated Vite Demo frames. Omitting `themes` uses only `canofold`.

Official exports and appearances are listed below. Names are localized by each definition, not kept in a Core registry.

| Export | Name | Appearances |
|---|---|---|
| `canofold` | Canofold | Light, dark |
| `glassmorphism` | Glassmorphism | Dark |
| `sketchStyle` | Sketch Style | Light |
| `handDrawnDoodle` | Hand-Drawn Doodle | Light |
| `minimalistFlat` | Minimalist Flat | Light |
| `bauhaus` | Bauhaus | Light |
| `neoBrutalist` | Neo-Brutalist | Light |
| `neumorphism` | Neumorphism | Light |
| `memphis` | Memphis | Light |
| `cyberChinese` | Cyber Chinese | Dark |
| `pixelAnime` | Pixel Anime | Dark |
| `dopamineDesign` | Dopamine Design | Light |
| `shoujoManga` | Shoujo Manga | Light |
| `outrun` | Outrun | Dark |

## Brand assets

Brand assets are shared by every theme. Canofold uses its official light/dark logos and favicon by default. Put replacements in `docs/public/` and reference them with site-absolute paths:

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'

export default defineConfig({
  branding: {
    logo: '/logo-light.svg',
    logoDark: '/logo-dark.svg',
    favicon: '/favicon.svg'
  }
})
```

Keep both logos the same size and silhouette. Themes choose the asset that matches their color scheme.

## Layout geometry

Site geometry belongs to `layout`, not to a visual theme:

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'

export default defineConfig({
  layout: {
    header: true,
    sidebarWidth: '18rem',
    outlineWidth: '16rem'
  }
})
```

Keeping geometry in Core ensures every theme preserves the same alignment, hit areas, keyboard behavior, and responsive breakpoints.

## Third-party themes

A third-party package exports a definition created with `defineTheme` and its CSS as separate public entries:

```ts title="canofold.config.ts"
import { canofold } from '@canofold/themes'
import { defineConfig } from 'canofold'
import aurora from '@acme/canofold-theme'

export default defineConfig({
  themes: [canofold, aurora]
})
```

Theme and appearance ids use lowercase kebab-case. Localized `name` values live in the theme definition, not in `i18n.messages`. CSS must be scoped with `html[data-cf-theme='theme-id']` and must not redefine layout, visibility, scrolling, hit areas, focus behavior, or accessibility.

See [Develop a theme package](/en/guide/site/theme-development/) for the definition, CSS, declarations, packaging, and verification workflow.

## Project CSS

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'

export default defineConfig({
  styles: ['./docs/brand.css']
})
```

Project CSS loads after selected theme styles. Prefer public semantic tokens and project-owned classes. Use a semantic attribute only when the public API documents it; do not depend on internal `.cf-*` classes or exact layout markup. See the [site configuration reference](/en/reference/configuration/base-config/#themes-branding-layout-and-search) for field defaults.
