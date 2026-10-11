---
title: 升级 Canofold
description: 更新项目依赖，核对兼容变化并验证构建与部署
group: 指南
subgroup: 发布与运营
order: 45
---

# 升级 Canofold

升级前先查看 [Changelog](https://github.com/canofold/canofold/blob/main/CHANGELOG.md) 中当前版本的兼容变化和升级步骤。如果项目直接使用 `@canofold/markdown` 或 `@canofold/plugins`，也要一起核对它们的版本和公开入口。

将 CLI 更新为明确版本，提交锁文件，并让 `requiredVersion` 包含该版本：

```bash
pnpm add -D canofold@<version>
pnpm exec canofold check
pnpm exec canofold build --no-cache
pnpm exec canofold build
```

第一次构建绕过旧缓存，用来确认新版本可以从源文件生成完整产物；第二次构建用来验证持久缓存。

## 从 0.4.1 升级到 0.5.0

将项目直接使用的 `canofold`、`@canofold/markdown`、`@canofold/vite`、`@canofold/plugins` 一起升级到 0.5.0，并提交更新后的锁文件。

- 草稿现在参与本地预览和 `check`，但不会进入生产站点、搜索、Markdown 镜像或 AI 产物。若此前把 `status: draft` 用作长期隐藏内容，升级后请检查本地预览的可见范围。
- `check --json` 可供 CI 使用，`checks.rules` 可以按规则设置 `error`、`warning` 或 `off`。先查看新的诊断，再决定是否提高规则级别；不要把所有编辑建议都当成发布错误。
- 缺少可信 Git 提交信息且未声明 `updatedAt` 的页面不再显示由文件 mtime 推断的更新时间。需要固定日期时在 Frontmatter 写入 `updatedAt`；译文过期状态只有设置 `translation.sourceHash` 后才有依据，否则显示为未知。
- 历史版本仍可继续使用已有目录。需要创建新快照时先运行 `check`，再使用 `snapshot <版本号>`，然后手动把版本添加到 `versions.items`。当前版不能标为 `archived`；旧版 Demo、MDX 的本地代码依赖必须留在对应版本的文档目录内。详见[版本维护](/guide/site/versions/)。
- 搜索支持字段权重和命中高亮。升级后按上面的步骤重新构建，检查常用查询和语言、版本切换；无需手工转换搜索索引或构建缓存。

如果项目提供自定义 DemoEngine，历史版本的 Demo 必须在 manifest 中报告 `dependencyPaths`，并将项目内代码与资源保存在版本目录中。历史 Demo 不支持引用当前版源码或全局 `demos.setup`，迁移后请运行完整构建。

## 发布前核对

- 首页、深层路由、404 和静态资源可以从生产预览中打开。
- 搜索结果按当前语言和文档版本过滤。
- 重定向、canonical、`hreflang` 和 sitemap 与部署域名一致。
- 需要 AI 产物时，消费方能读取 `ai/manifest.json` 及其声明的分片。
- 亮色、暗色、键盘导航和移动端布局没有回归。

验证完成后再部署新产物。如果新版本需要迁移，以对应版本 Changelog 给出的步骤为准。
