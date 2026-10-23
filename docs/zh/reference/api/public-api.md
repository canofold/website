---
title: 公共 API 与兼容策略
description: 了解哪些 Canofold 接口受兼容与弃用承诺保护
group: 参考
subgroup: API
order: 63
---

# 公共 API 与兼容策略

Canofold 有意保持较小的公共面。请只使用文档明确说明的 Package exports、CLI 命令、配置字段、语义 Markdown API、主题 Token 和扩展 API v1。不要深层导入生成 Chunk，也不要依赖构建缓存、序列化 AST/HAST、Pagefind 内部文件、`.cf-*` Shell 类名或精确布局结构。

语义 Markdown API 的作者语法以 [Markdown 语法参考](/markdown/syntax/) 为准；内部类名和编译后的节点结构不属于写作接口。

## Package 契约

Canofold 发布五个包。`canofold` 根入口公开 `canofoldVersion`、`defineConfig`、`CANOFOLD_EXTENSION_API_VERSION`、`defineExtension`、`defineSearchProvider` 以及文档化的配置、搜索和扩展类型。`@canofold/markdown` 只支持 package export map 中声明的 React、客户端增强、服务端渲染、分析和结构 CSS 入口。`@canofold/themes` 公开 `ThemeDefinition` 契约、官方主题定义、共享视觉 Token 和主题 CSS 入口。`@canofold/vite` 的根入口公开 `vite()` Demo 引擎及其配置类型，复用项目已有的 Vite 配置。`@canofold/plugins` 通过聚合根入口和按能力子路径公开官方 Markdown 插件与搜索 Provider 工厂；浏览器和 CSS 子路径由生成站点按需加载。

AI Manifest 与扩展描述符带有独立版本；消费者遇到不支持的版本应明确拒绝，不能猜测兼容。

构建期来源通过 `sources` 配置；`canofold` 公开 `ContentSource`、`ContentSourceContext`、`SourceDocument` 类型，统一交付页面、搜索和机器内容。官方 `openapi()` 仅由 `@canofold/plugins/openapi` 服务端子路径导出，不进入聚合根入口或浏览器包。接入与边界见 [OpenAPI 接口文档](/guide/writing/openapi/)。

来源上下文提供 `context.fail({ message, file?, pointer?, line?, column? })`，用于报告可修复的输入内容错误并终止该来源，不提交部分页面。`file` 省略时为入口；指定时可用绝对路径或相对于来源 `root` 的路径，且必须是通过 `context.read()` 读取的受限输入。位置从 1 开始，无准确位置时省略；设置 `column` 时也须提供 `line`。普通适配器异常仍按工具失败处理。该方法由宿主提供，适配器不导入 Core 私有错误类；官方 OpenAPI 适配器使用它交付结构化诊断。命令行为见 [CLI 参考](/reference/configuration/cli/)。

## 版本策略

在 `0.x` 阶段，Patch 版本保持向后兼容。Minor 版本只有在 Changelog 明确说明影响和升级路径时才允许做破坏性修正；可平滑迁移的非安全删除至少弃用一个 Minor 版本。

从 `1.0` 起，不兼容的公共变化必须提升 Major 版本。弃用项至少保留两个 Minor 版本或 90 天，以时间更长者为准；若保留旧行为会继续暴露安全漏洞，可缩短窗口。
