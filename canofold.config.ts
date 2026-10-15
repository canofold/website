import { externalLinks, kroki, linkCard, math, mermaid, pagefind, plantUml } from '@canofold/plugins'
import {
  bauhaus,
  canofold,
  cyberChinese,
  dopamineDesign,
  glassmorphism,
  handDrawnDoodle,
  memphis,
  minimalistFlat,
  neoBrutalist,
  neumorphism,
  outrun,
  pixelAnime,
  sketchStyle,
  shoujoManga
} from '@canofold/themes'
import { vite } from '@canofold/vite'
import { defineConfig } from 'canofold'

export default defineConfig({
  title: 'Canofold',
  description: '以 Markdown 和 MDX 构建文档站、搜索与 AI 可读内容',
  siteUrl: 'https://canofold.dev',
  github: 'https://github.com/canofold/canofold',
  editUrl: 'https://github.com/canofold/website/edit/main/docs',
  requiredVersion: '^0.6.5',
  themes: [
    canofold,
    glassmorphism,
    sketchStyle,
    handDrawnDoodle,
    minimalistFlat,
    bauhaus,
    neoBrutalist,
    neumorphism,
    memphis,
    cyberChinese,
    pixelAnime,
    dopamineDesign,
    shoujoManga,
    outrun
  ],
  demos: {
    engine: vite()
  },
  branding: {
    logo: '/logo-light.webp',
    logoDark: '/logo-dark.webp',
    favicon: '/favicon.webp'
  },
  search: {
    provider: pagefind()
  },
  markdown: {
    code: {
      unknownLanguage: 'error'
    },
    plugins: [
      math(),
      mermaid(),
      plantUml({ server: 'https://www.plantuml.com/plantuml/svg' }),
      kroki({ server: 'https://kroki.io' }),
      externalLinks({ internalHosts: ['canofold.dev'] }),
      linkCard({ internalHosts: ['canofold.dev'] })
    ]
  },
  navigation: {
    zh: [
      { text: '指南', link: '/guide/' },
      { text: '参考', link: '/reference/' },
      { text: 'Markdown SDK', link: '/markdown/' }
    ],
    en: [
      { text: 'Guide', link: '/en/guide/' },
      { text: 'Reference', link: '/en/reference/' },
      { text: 'Markdown SDK', link: '/en/markdown/' }
    ]
  },
  i18n: {
    locales: ['zh', 'en'],
    messages: {
      en: {
        brandTagline: 'Documentation, search, and AI-readable content from Markdown and MDX'
      }
    }
  }
})
