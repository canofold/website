---
title: 迁入已有文档
description: 将普通 Markdown、VitePress 或 Docusaurus 文档迁入 Canofold
group: 指南
subgroup: 入门
order: 5
---

# 迁入已有文档

迁移应在新分支进行，并保留原站点直到 Canofold 的链接、资源和搜索检查通过。Canofold 不会解释其他框架的配置文件，也没有无损自动转换器；迁移的是内容，路由与导航需要按 Canofold 的规则重新确认。

## 普通 Markdown 仓库

选定文档根目录后，显式指定原文语言。`init` 会保留已有文件，不覆盖同名配置或页面：

```bash
pnpm add -D canofold
pnpm exec canofold init --locale zh --docs-dir docs
pnpm exec canofold check
pnpm exec canofold build --no-cache
```

至少放置 `docs/index.md`。`docs/guide/install.md` 对应 `/guide/install/`；页面相对图片保持在页面附近，全站固定地址的文件放到 `docs/public/`。为页面补 `title` 和 `description`，已公开 URL 若改变则配置 [重定向](/guide/site/redirects/)。`check --json` 可供 CI 读取具体行列与规则。

指向已收录文档的相对 `.md` / `.mdx` 链接会按源文件位置解析，并输出同一版本内的 HTML 页面地址，保留查询参数和锚点。例如 `docs/guide/start.md` 中的 `[下一步](./next.md#api)` 会跳到 `/guide/next/#api`，不依赖 Markdown 镜像开关。省略扩展名或链接目录时，与检查器一样依次查找目标文件、`.md`、`.mdx`、`index.md` 和 `index.mdx`；实际存在的资源文件优先于同名文档候选。跨语言链接同样按实际文件位置解析；站点绝对 URL、外链、资源链接不套用源文件转换。若要下载 Markdown 镜像，应显式链接其公开地址，并开启镜像输出。

文档引用了新文档根目录以外的文件时，将依赖文件一起迁入并调整相对路径，或将链接改为稳定的仓库 URL。

## VitePress

VitePress 的 [Markdown 扩展](https://vitepress.dev/guide/markdown) 与 [Vue 组件写法](https://vitepress.dev/guide/using-vue) 不能直接当成 Canofold 语法。建议复制内容到独立的 `docs/` 目录，暂时保留旧站点构建，不要把 `.vitepress/` 配置当成新站点配置。

| VitePress 内容 | Canofold 处理 |
|---|---|
| `.vitepress/config.ts` 中的 `nav`、`sidebar` | 在 `canofold.config.ts` 配置 `navigation`；目录与 `index.md` 生成侧栏 |
| `public/` | 移到 `{docsDir}/public/`，核对绝对资源路径 |
| 普通 `.md` 与相对链接 | 保留文件，运行 `check`，再核对公开 URL |
| Vue 组件、Vue 插值、VitePress 专有容器 | 逐页改写；React Demo 使用 `::demo`，其他内容使用 Canofold 支持的 Markdown 指令或可信 MDX |
| 旧版本目录 | 配置 `versions.items`，逐版检查路径和组件来源 |

例如旧站的 `docs/guide/install.md` 若链接为 `/guide/install`，Canofold 的页面地址为 `/guide/install/`。先验证新页面，再为已有外部入口增加重定向。不要机械替换所有链接：带查询参数、锚点和子路径部署需逐项检查。

## Docusaurus

Docusaurus 的 [MDX](https://docusaurus.io/docs/markdown-features/react)、[admonition](https://docusaurus.io/docs/markdown-features/admonitions) 和 [版本目录](https://docusaurus.io/docs/versioning) 各有自己的语义，不能靠复制目录保证渲染一致。

| Docusaurus 内容 | Canofold 处理 |
|---|---|
| `sidebars.js`、`_category_.json` | 用目录 `index.md` 命名分组；页面用 `order` 排序 |
| `id`、`slug`、`sidebar_position` | 改为文件路径生成路由，并用 `order` 排序；需要保留旧 URL 时配置 redirects |
| `static/` | 移到 `{docsDir}/public/` 并核对引用 |
| 版本化文档 | 每个版本放独立 `docsDir`，在 `versions.items` 指定 `base` |
| Docusaurus 主题组件、MDX 包导入 | 逐页替换；Canofold 的本地 MDX 组件仅支持可信项目内相对导入，交互组件示例用 Demo |

把 `:::note`、`:::tip` 等提示块、Tabs、图片和代码标题作为迁移抽样页，打开实际预览核对。不能自动对应的插件、React 组件或路由元数据应保留在迁移清单中，人工处理后再删除旧实现；不要让未知 Frontmatter 字段“看似存在但实际无效”。

## 完成核对

1. 运行 `canofold check` 和 `canofold build --no-cache`，修复所有错误。
2. 在 `canofold preview` 中打开首页、深层路由、资源、404 和至少一篇含代码或组件的页面。
3. 对照旧站检查导航、锚点、外部分享链接、搜索以及语言/版本切换；必要时增加 redirects。
4. 部署前检查生成的 sitemap、canonical 和 `hreflang`。旧站仍在线时，避免让两个站点同时声明同一个 canonical URL。

迁入后继续阅读[组织内容](/guide/writing/content-structure/)、[静态资源](/guide/writing/assets/)与[版本管理](/guide/site/versions/)。
