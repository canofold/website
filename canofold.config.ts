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
  description: '面向人与 AI 的现代 Markdown 知识编译器：静态文档站、搜索索引与 AI 可读内容，共用一份知识来源。',
  siteUrl: 'https://canofold.dev',
  github: 'https://github.com/canofold/canofold',
  editUrl: 'https://github.com/canofold/website/edit/main/docs',
  requiredVersion: '^0.7.1',
  versions: [{ id: 'current', label: 'v0.7.1', docsDir: 'docs', base: '/' }],
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
      { text: 'Markdown SDK', link: '/markdown/' },
      { text: '编辑器扩展', link: '/vscode/' },
      { text: 'Skills', link: '/skills/' }
    ],
    en: [
      { text: 'Guide', link: '/en/guide/' },
      { text: 'Reference', link: '/en/reference/' },
      { text: 'Markdown SDK', link: '/en/markdown/' },
      { text: 'Editor Extension', link: '/en/vscode/' },
      { text: 'Skills', link: '/en/skills/' }
    ]
  },
  i18n: {
    locales: ['zh', 'en'],
    messages: {
      en: {
        brandTagline: 'A modern Markdown knowledge compiler for people and AI: static documentation, search indexes, and AI-readable content from one source.'
      }
    }
  }
})
