---
title: VS Code 扩展
seoTitle: Canofold VS Code 扩展｜Markdown 预览与项目文档检查
description: 在 VS Code 中预览 Markdown、数学公式与图表，用项目本地 Canofold CLI 检查文档，在 Problems 定位问题、修复并重新检查。
group: 编辑器扩展
order: 40
---

# VS Code 扩展

Canofold Markdown Preview 把 Canofold 的 Markdown 渲染能力带到编辑器：不必先创建文档站，即可在当前标签页阅读文档、查看图表，再切回源码继续修改。

在 Canofold 项目中，还可以直接运行文档检查，在 Problems 面板定位问题，修改后重新检查。预览负责阅读，项目 CLI 负责校验；两者使用各自的内容与配置边界。

## 安装与打开

需要 VS Code 1.100 或更新版本。在扩展面板搜索 **Canofold Markdown Preview**，确认发布者为 `canofold`；也可打开 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=canofold.canofold-vscode) 安装。

1. 打开已保存的 `.md` 文件。
2. 点击编辑器右上角的 Canofold 图标，或在命令面板运行 **Canofold: Toggle Canofold Preview**。
3. 再次运行同一命令，切回源码。也可以分别使用 **Canofold: Preview with Canofold** 和 **Canofold: Edit Markdown Source**。

扩展是可选编辑器，不替换 VS Code 默认的 Markdown 编辑器。切换到预览时会先保存尚未保存的源码；预览已经打开后，文档中的未保存修改也会实时更新。

## 可以预览什么

- Markdown 正文、代码、表格、图片与 Canofold 富文本指令。
- 数学公式，以及 Mermaid、PlantUML、Graphviz/DOT、D2 图表。
- 工作区内的相对图片、链接和静态 HTML iframe。

图表在本机渲染，不会把源码发送到公共图表服务。扩展采用浅色预览，不跟随编辑器主题。YAML frontmatter 不作为正文显示。

## 检查项目文档

从扩展 **0.2.0** 起，在项目文件中打开命令面板，运行 **Canofold: Check Project**：

1. 在 VS Code 中打开本地项目文件夹，并通过项目正常的依赖管理流程安装依赖。项目需在 `dependencies` 或 `devDependencies` 中声明 `canofold`。
2. 保存该项目的修改，运行检查。扩展从当前文件向上查找工作区内最近的 Canofold 项目，执行其已安装的 `canofold check --json`。
3. 在 **Problems** 面板查看错误与警告，点击带源码位置的问题跳转，修复并保存后重新运行检查。

检查需要受信任的工作区，因为项目 CLI 会执行配置和插件；扩展宿主的 Node.js 运行时需至少为 **22.12**，不满足时请更新 VS Code。独立 Markdown 预览不要求先安装项目 CLI，也不因无法运行检查而停用。

命令只检查磁盘文件，不自动保存，不联网安装工具，也不使用全局 CLI。检查规则和结果以项目安装的 CLI 为准，扩展不另做一套校验。未保存修改会阻止检查；编辑项目文件会清除过时结果，保存后需重检。

可以在进度通知中取消检查；连续执行会替换旧任务，不同项目各自保留诊断。没有文件上下文的多根工作区会提示选择文件夹。检查不是每次输入时自动触发的全站校验。

只有 CLI 提供源码行列时才据此定位；只有行号时会明确标注。项目级问题、缺少源文件或只有 OpenAPI pointer 的结果会说明没有精确源码位置，不将生成内容的位置当作源规范位置。检查通过不等于完成生产构建，发布前仍需[构建与预览](/guide/delivery/build-preview/)。

## 文件与安全边界

扩展以 `.md` 文件为输入。`SKILL.md` 等文件即使被 VS Code 识别为专用语言，仍然是 Markdown 文件；预览只展示文档，不执行 Skill 指令或 MDX 代码，也不会替 Agent 加载 Skill。

原始 HTML 会被清理。未知或无效的富文本指令会显示为不可执行的源码，保留周围可读内容；这不意味着所有插件错误都会被忽略。

本地 iframe 只展示静态内容，不允许脚本或同源访问；CSS、图片、字体等资源限制在工作区及其 public 目录内，不跟随符号链接。远程 iframe 必须使用 HTTPS，并受目标网站的嵌入策略限制。

编辑器预览不等同于完整站点构建：站点导航、语言与版本路由、搜索索引及构建扩展仍由项目中的 Canofold 配置和 CLI 负责。发布内容前仍需运行[内容检查与构建](/guide/delivery/)。

## 获取帮助与参与开发

扩展源码、开发命令、测试方法和详细资源限制见 [GitHub 仓库](https://github.com/canofold/vscode)。需要在应用中接入渲染能力时使用 [Markdown SDK](/markdown/usage/)；需要 Agent 协助维护内容时了解 [Skills](/skills/)。
