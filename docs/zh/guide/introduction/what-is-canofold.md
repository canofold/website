---
title: 什么是 Canofold
description: 了解 Canofold 的用途、主要能力和包选择
group: 指南
subgroup: 入门
order: 1
---

# 什么是 Canofold

Canofold 是以 Markdown 和 MDX 为内容源的静态知识文档平台。它构建文档站、搜索索引和 AI 可读内容，并提供可独立使用的 React Markdown 渲染器、Vite 组件示例、主题包与插件扩展。

它适合把知识内容与代码、配置或其他项目资产一起进行版本管理的团队。接入时不改业务源码，也不需要单独维护文档前端；开发、检查、构建和预览都由同一个 CLI 完成。

## 低侵入接入现有仓库

文档、配置和命令脚本都留在原仓库。`canofold init` 只补齐缺少的文件；已有 Markdown 和 MDX 会在原目录接入，不会被移动或覆盖。

构建结果是静态文件。部署后不需要运行 Canofold 服务、Node.js 服务器或数据库。

## 一份源，展开成多种产物

同一批 Markdown 和 MDX 可以按配置生成完整静态站点、本地搜索索引、Markdown 镜像、`llms.txt` 和分片语料。网站、搜索和 AI 工具使用同一批内容；这些文件不调用模型，也不包含托管检索或问答服务。

导航、侧栏、多语言和版本路由也从文档结构与配置生成，不需要另写一套页面数据。

多语言需要分别维护译文，多版本需要独立内容快照；Canofold 不会自动翻译，也不会根据包版本自动生成历史文档。

## 主要能力

| 任务 | Canofold 提供的能力 |
|---|---|
| 编写内容 | Markdown、MDX、本地 React 组件、代码、表格、文件树、媒体、数学和图表 |
| 组织站点 | 路由、导航、侧栏、页内目录、搜索、SEO、多语言和多版本 |
| 定制外观 | 14 个官方主题、明暗外观、品牌资源和第三方主题包 |
| 检查内容 | 配置、Frontmatter、链接、静态资源和翻译缺口 |
| 构建与发布 | 完整静态 HTML、重定向、搜索索引和可直接部署的产物 |
| 提供 AI 内容 | Markdown 镜像、`llms.txt`、页面索引和分片数据 |

具体写法见 [Markdown SDK](/markdown/)，建站流程见[快速开始](/guide/introduction/getting-started/)，配置字段见[参考](/reference/)。

## 五个包怎样选择

| 包 | 职责 |
|---|---|
| `canofold` | 构建完整文档站点 |
| `@canofold/markdown` | 在现有 React、SSR 或静态生成项目中渲染 Markdown 和 MDX |
| `@canofold/themes` | 提供主题契约和官方视觉主题 |
| `@canofold/vite` | 在 Vite 组件项目中运行实时示例、HMR 与生产 Demo 构建 |
| `@canofold/plugins` | 提供数学、图表、链接处理、阅读时长和 Pagefind 插件 |

普通文档站只需安装 `canofold`；配置文件直接导入主题定义时，再显式安装 `@canofold/themes`。其余包分别用于独立渲染 Markdown、接入 Vite 组件示例或按需加入插件。

## 适用范围

Canofold 适合产品文档、开发者文档、团队知识库、操作手册和开源项目，尤其适合需要多语言、版本管理或 AI-ready 知识输出的项目。

Canofold 不是在线 CMS，也不是托管服务。它不提供多人在线编辑、账户、权限、评论审批或动态内容接口；私有文档需要由托管平台保护整个静态输出目录。

MDX、本地组件和构建扩展会执行代码，只应处理可信内容。具体边界见[安全边界](/reference/output/security/)。

继续阅读[为什么选择 Canofold](/guide/introduction/why-canofold/)了解它的设计取舍。准备开始时，先[安装 Canofold](/guide/introduction/installation/)；想查看内容效果，可以打开 [Markdown Playground](/markdown/playground/)。
