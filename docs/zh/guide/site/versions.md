---
title: 管理文档版本
description: 发布当前文档并保留历史内容快照
group: 指南
subgroup: 站点能力
order: 34
---

# 管理文档版本

从 Canofold 0.7.1 起，`versions` 直接使用数组，第一项为当前主版本。每个版本对应独立的文档目录和网址前缀；构建后同时发布，读者通过下拉菜单进入旧版页面，不需要切换 Git。

不配置 `versions` 或设为 `[]` 时，不显示版本入口，仍从顶层 `docsDir`（默认 `docs`）构建。一项只显示 `label`，多项提供切换。版本标签不会自动读取项目或 Canofold 包的版本。

## 准备历史快照

在当前文档仍对应即将归档的版本时运行：

```bash
pnpm exec canofold check
pnpm exec canofold snapshot v1
```

`snapshot` 将当前文档目录及其中的资源、MDX 组件和 Demo 源码复制到 `versions/v1/`。它保存执行时的内容，`v1` 只是快照名称，不会触发 Git 回溯。

命令不修改配置，也不覆盖已有目录。完成后，把历史项追加到 `versions` 数组中，保留当前主版本为第一项；执行 `check` 和 `build`，将快照与配置一起提交，再开始改写当前文档。

存在草稿、符号链接、目录外的 MDX/Demo 依赖，或带有 Demo 的文档使用全局 `demos.setup` 时，快照会失败。归档前将 Demo 及其项目内依赖放入文档目录，并使用相对 `src`，不要引用 `/src/...`。快照不冻结 npm 包、目录外公共资源、Vite 配置或全站 Provider；这些输入及锁文件需要单独维护。

## 配置版本目录与网址

下面的示例把中文作为默认语言，当前文档放在 `docs/`，旧版放在 `versions/v1/`：

:::file-tree
- canofold.config.ts
- docs/
  - index.md
  - en/
    - index.md
- versions/
  - v1/
    - index.md
    - en/
      - index.md
:::

当前中文首页映射到 `/`，当前英文首页映射到 `/en/`；v1 的两个首页分别映射到 `/v1/` 和 `/v1/en/`。

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'

export default defineConfig({
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en']
  },
  versions: [
    { id: 'v2', label: '2.x', docsDir: 'docs', base: '/' },
    {
      id: 'v1',
      label: '1.x',
      docsDir: 'versions/v1',
      base: '/v1/',
      status: 'archived'
    }
  ]
})
```

- `id` 是内部标识，供版本关联和搜索分区使用。
- `label` 是版本控件显示的名称，例如 `2.x`，不负责定位历史内容。
- `docsDir` 是相对于项目根目录的文档源目录；目录里必须有该版的真实内容。
- `base` 是该版的 URL 前缀，不是磁盘目录，也不是 Git 分支。当前主版本必须使用 `/`。

各项 `id` 和 `base` 必须唯一，内容目录应独立维护。配置非空 `versions` 时，不再同时设置顶层 `docsDir`。第一项必须使用 `base: '/'`，且不能设为 `archived`；不要仅为调整下拉顺序而改变主版本。

`basePath` 是整个站点的部署前缀：`basePath: '/manual/'` 与 `base: '/v1/'` 对应 `/manual/v1/`。历史版仍在维护时可省略 `status`；`status: 'archived'` 保留阅读和检索，但标明不再维护。

从旧配置迁移时，将原 `items` 数组直接赋给 `versions`，把原 `current` 指向的版本移到第一项，再删除这两个外层字段。

## 没有提前保存旧文档怎么办

版本配置不会生成历史内容。如果没有快照，但 Git 或备份保留了旧内容，可先恢复文档及其引用的资源和源码，核对后加入版本配置。Canofold 不会自动从 Git 恢复；没有历史来源就无法还原旧版。

## 页面切换

切换版本时，Canofold 先查找目标版本中相同相对路径的页面。如果不存在，切换菜单会标注“此页不存在，前往首页”，链接指向目标版本当前语言的首页。历史版本删除页面或调整目录后，可以通过 redirects 保留常用入口。

OpenAPI 等派生页面按来源类型、`id` 和 operation 键匹配，而不是按生成 URL 或原文件名猜测。历史来源需单独配置 `root`、`entry`、`version` 和 `locale`；所有引用都必须在该版 `docsDir` 内。快照不会自动添加这些绑定，详见 [OpenAPI 接口文档](/guide/writing/openapi/)。

## 搜索和 AI 输出

内置 Compact Search 为每个版本和语言写入独立 JSON 文件。Pagefind 使用一份索引，并通过 `version` 和 `locale` filter 限定结果。两种 provider 都不会把其他版本的结果混入当前页面的搜索结果。

AI 产物默认只包含数组第一项对应的当前主版本。需要把历史版本写入独立分区时，设置 `ai.versions: 'all'`：

```ts title="canofold.config.ts"
import { defineConfig } from 'canofold'

export default defineConfig({
  ai: {
    versions: 'all'
  }
})
```

## 何时保留快照

在配置、API 或使用流程发生不兼容变化，而用户仍需查询旧说明时保留快照，不必逐补丁复制。例如 `0.7.x` 共用一套文档，在改写为 `0.8` 文档前保存 `0.7`，发布后提供系列切换。只有一套内容时，维护它并记录发布对应的提交即可。历史勘误直接修改快照目录，重新检查、构建和发布。
