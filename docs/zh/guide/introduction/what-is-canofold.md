---
title: 什么是 Canofold
description: 一份 Markdown，编译为文档站、搜索索引与 AI 知识；了解 Canofold 的工作链路、生态与接入方式
group: 指南
subgroup: 入门
order: 1
---

# 什么是 Canofold

Canofold 是面向人与 AI 的现代 Markdown 知识编译器。你在仓库中维护 Markdown 和 MDX，它把这些源文件编译成可阅读、可搜索、可供机器使用的知识。

产品文档、组件示例、团队手册都可以从这里出发：发布为完整静态站点，在现有 React 应用中渲染，或直接在 VS Code 中预览。

## 同一份知识，不该维护多套副本

文档写在仓库里，读者去网站看，AI 又需要一份干净的上下文。如果每个入口各存一份内容，修订一次就要同步多处，最后很难判断哪份才是最新的。

Canofold 希望让源文件成为共同依据。面向人的页面、面向检索的索引、面向 AI 的语料，都跟随同一次内容修订与构建更新。我们的方向是让知识在创作、阅读和使用之间流动，同时保留它的来源。

## 从源文件到三类产物

```text
Markdown / MDX + 配置与资源
              │
        Canofold 内容编译
              │
     ┌────────┼─────────┐
     ↓        ↓         ↓
 HTML 页面  搜索索引   AI 可读内容
                    llms.txt / Markdown / JSONL
```

编译时，内容模型记录页面、标题、链接、语言和版本等信息；页面生成、检查与知识输出围绕这些信息展开。网站和下游工具因此能保留相同的页面身份与来源，不必各自从网页重新猜测文档结构。

HTML 页面带有导航、目录和 SEO 元数据，可以直接部署到静态托管。搜索按配置接入 Provider；开启 [AI 友好输出](/reference/output/ai-output/)后，还能得到 Markdown 镜像、`llms.txt`、页面索引和分片 JSONL，供 Agent、检索或 RAG 系统读取。

## 从你需要的入口开始

| 想做什么 | 从哪里开始 |
|---|---|
| 为项目搭建可搜索的多语言、多版本文档站 | [`canofold` CLI：快速开始](/guide/introduction/getting-started/) |
| 在已有 React 应用或 SSR 流程里显示 Markdown/MDX | [`@canofold/markdown`：独立渲染](/markdown/usage/) |
| 给 React 组件库编写可运行、可看源码的示例 | [`@canofold/vite`：组件 Demo](/guide/writing/component-demos/) |
| 在本地边写边看公式、图表和排版 | [VS Code 扩展](/vscode/) |
| 让 Agent 协助写内容、同步文档或引用站点知识 | [Canofold Skills](/skills/)（实验阶段） |

建站时，把内容与配置留在自己的项目里，使用 CLI 开发、检查和构建。只需要渲染器时，宿主应用继续决定布局、内容来源和路由。

## 内容、外观与扩展各自独立

Markdown 可以编写代码、表格、Tabs、步骤和文件树；数学与图表通过官方插件接入。React 组件示例直接引用 Demo 源文件，支持热更新、源码切换与可选 iframe 隔离。

14 个官方主题提供 15 种外观，覆盖 Canofold 浅色/深色、玻璃拟态、新拟物、极简扁平等风格。通过 `@canofold/themes` 的主题契约，可以定制变量或发布自己的主题包，内容继续复用。

Core 的五个 npm 包分别承担站点编译、Markdown 渲染、主题、Vite Demo 和官方插件。VS Code 扩展是单独安装的编辑器入口；Skills 则把创作、文档维护和知识读取流程交给 Agent。它们围绕源文件协作，不要求一次接入全部工具。

准备动手时，直接看[快速开始](/guide/introduction/getting-started/)；想先看效果，打开 [Markdown Playground](/markdown/playground/)。[为什么选择 Canofold](/guide/introduction/why-canofold/)解释这些设计适合什么样的团队。
