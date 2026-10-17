---
title: 升级 Canofold
description: 更新项目依赖，核对兼容变化并验证构建与部署
group: 指南
subgroup: 发布与运营
order: 45
---

# 升级 Canofold

升级前先查看 [Changelog](https://github.com/canofold/canofold/blob/main/CHANGELOG.md) 中当前版本的兼容变化和升级步骤。项目直接使用的全部 Canofold 包必须整套升级，不能混用不同代的包。

将 CLI 更新为明确版本，提交锁文件，并让 `requiredVersion` 包含该版本：

```bash
pnpm add -D canofold@<version>
pnpm exec canofold check
pnpm exec canofold build --no-cache
pnpm exec canofold build
```

第一次构建绕过旧缓存，用来确认新版本可以从源文件生成完整产物；第二次构建用来验证持久缓存。

## 0.7.0 机器格式迁移

Canofold 0.7.0 引入 schema 2 机器产物。已有 0.6.x 站点在升级并重新构建前，仍使用原有格式。

将直接使用的五包整套升级到 0.7.0，更新 `requiredVersion` 与锁文件，执行内容检查、干净构建和第二次缓存构建。机器消费者须同时升级为支持 schema 2 的版本，重新建立可信消费基线；旧 schema 1 路由记录不能直接与新文档 ID 做删除比较。

已有 HTML/Markdown 路由和输出开关保持原意。需要跨地址搬迁同一集合时配置稳定的 `ai.contentSpace`；未设置时只在同一读取来源内比较。完整 Manifest 可在页面索引关闭时独立读取；关闭完整内容时改用明确的元数据入口，不把读取失败当作内容删除。格式、表示与完整性规则见 [AI 友好输出](/reference/output/ai-output/)。

## 0.6.x 补丁升级

升级到 0.6.8 时，已有 0.6.x 站点无需修改配置或主题定义。将项目直接使用的五包保持同版，并重新构建、部署完整输出目录。各补丁的修复明细见 Changelog；本文只说明需要项目调整的迁移事项。

### 单独升级 Mermaid

Mermaid 是可选 Peer，升级 Canofold 不会自动替换项目安装的 Mermaid。需要从 Mermaid 11 升级到 12 时，可使用 `pnpm add -D mermaid@^12.2.0`。Mermaid 12 要求 Node 22.12+、Safari 17.4+ 或具备同等 ES2024 支持的浏览器。

Canofold 默认使用 Dagre 布局和 Classic 外观；需要 ELK 时，在图表 Frontmatter 的 `config` 中指定 `layout: elk`，将旧的 `defaultRenderer` 配置迁移为 `layout`。部署时保留完整输出目录，包括按需加载的 ELK 资源分块。

## 从 0.5.0 升级到 0.6.x

将项目直接使用的 `canofold`、`@canofold/markdown`、`@canofold/themes`、`@canofold/vite`、`@canofold/plugins` 一起升级到 0.6.8，并提交更新后的锁文件。

- 把原来的 `theme` 对象拆到明确职责中：`themes` 放导入的 `ThemeDefinition`，`branding` 只放 Logo 与 favicon 路径，`layout` 放页头和侧栏几何尺寸。主题名称属于主题定义，不应放在 `i18n.messages`。省略 `themes` 时使用 Canofold 的浅色和深色外观。
- 独立 Markdown 消费方需要先引入 `@canofold/markdown/base.css`，再引入选中主题对应的 `@canofold/themes/<theme>.css`；原先由 Markdown 包拥有的主题入口已经删除。
- `kroki()` 和 `plantUml()` 在省略 `server` 时把源码留在本地。删除 `server: false`；远程渲染需要配置明确且可信的 HTTP(S) 基础地址，本地渲染使用 `renderer: 'client'` 并接入对应宿主 renderer。服务地址不能带查询参数或片段。
- 第三方主题包应把 `@canofold/themes` 声明为 peer dependency，分别导出 `ThemeDefinition` 与 CSS。主题 CSS 只负责视觉处理；布局、交互状态和无障碍继续由 Core 负责。
- 相关页面不在导航入口的目录路由下时，可以使用 `activePaths` 声明选中范围。

完成干净构建后，在生产预览中逐个检查已配置的主题和外观、语言切换、图表源码与预览、Vite Demo frame、键盘焦点、移动布局和 CSP。

## 从 0.4.1 升级到 0.5.0

将项目直接使用的 `canofold`、`@canofold/markdown`、`@canofold/vite`、`@canofold/plugins` 一起升级到 0.5.0，并提交更新后的锁文件。

- 草稿现在参与本地预览和 `check`，但不会进入生产站点、搜索、Markdown 镜像或 AI 产物。若此前把 `status: draft` 用作长期隐藏内容，升级后请检查本地预览的可见范围。
- `check --json` 可供 CI 使用，`checks.rules` 可以按规则设置 `error`、`warning` 或 `off`。先查看新的诊断，再决定是否提高规则级别；不要把所有编辑建议都当成发布错误。
- 缺少可信 Git 提交信息且未声明 `updatedAt` 的页面不再显示由文件 mtime 推断的更新时间。需要固定日期时在 Frontmatter 写入 `updatedAt`；译文过期状态只有设置 `translation.sourceHash` 后才有依据，否则显示为未知。
- 历史版本仍可继续使用已有目录。需要创建新快照时先运行 `check`，再使用 `snapshot <版本号>`，然后手动把版本添加到 `versions.items`。当前版不能标为 `archived`；旧版 Demo、MDX 的本地代码依赖必须留在对应版本的文档目录内。详见[版本维护](/guide/site/versions/)。
- 搜索索引与构建缓存由新版本重新生成，无需手工转换。

如果项目提供自定义 DemoEngine，历史版本的 Demo 必须在 manifest 中报告 `dependencyPaths`，并将项目内代码与资源保存在版本目录中。历史 Demo 不支持引用当前版源码或全局 `demos.setup`，迁移后请运行完整构建。

## 发布前核对

- 首页、深层路由、404 和静态资源可以从生产预览中打开。
- 搜索结果按当前语言和文档版本过滤。
- 重定向、canonical、`hreflang` 和 sitemap 与部署域名一致。
- 需要 AI 产物时，消费方能读取 `ai/manifest.json` 及其声明的分片。
- 亮色、暗色、键盘导航和移动端布局没有回归。

验证完成后再部署新产物。如果新版本需要迁移，以对应版本 Changelog 给出的步骤为准。
