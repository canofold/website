---
title: Canofold Skills
seoTitle: Canofold Skills｜Agent 辅助 Markdown 创作与知识读取
description: 了解实验中的 Canofold Agent Skills：让 Agent 按项目语法写 Markdown、根据代码更新文档，并从指定版本的知识产物中查找和引用答案。
group: Skills
order: 50
---

# Canofold Skills

写一篇指南、同步一次 API 变化、从文档里找到有来源的答案：Canofold Skills 把这些任务的工作方法交给 Agent。它先看项目实际版本、配置与源文件，再创作、维护或使用知识。

Skills 已在 [Canofold Skills 仓库](https://github.com/canofold/skills)公开，仍处于实验阶段，可按任务单独安装。建议先用一篇真实文档试用，再决定是否放入日常工作流。

## 面向哪些任务

| Skill | 任务 | 需要核对的依据 |
|---|---|---|
| `canofold-markdown` | 写作或修订 Markdown、MDX 与富文本指令 | 项目实际安装版本、配置、现有内容和构建结果 |
| `canofold-docs-from-code` | 根据已核实的代码变化维护文档与示例 | 实际实现、公开接口、测试和变更范围 |
| `canofold-knowledge-reader` | 从 Canofold 静态知识输出回答问题并引用页面 | 站点输出、语言与版本范围、原文及来源链接 |

创作时复用项目语法，维护时对照真实代码，读取时保留页面来源。这三个入口围绕同一批知识文件协作。

## 如何接入

从仓库取得所需的 `skills/<name>/` 完整目录，按照[中文安装说明](https://github.com/canofold/skills/blob/main/README.zh-CN.md)放入 Agent 支持的 Skills 位置。目录包含 `SKILL.md` 和它引用的参考文件，需要一起保留。具体路径与加载方式遵循所用 Agent 的说明。

例如可以提出以下任务：

```text
使用 canofold-markdown，为这个项目写一篇包含 Tabs 的安装指南。
使用 canofold-docs-from-code，根据这次公开 API 变更同步文档和示例。
使用 canofold-knowledge-reader，仅依据本站当前中文文档回答，并引用页面来源。
```

安装路径、调用方式和自动选择由 Agent 宿主决定。CLI 负责内容编译，VS Code 扩展负责预览；Skills 由你使用的 Agent 加载。

## 使用边界

- 以目标项目的版本与配置为准，不把开发分支或其他版本的语法当成已支持能力。
- Agent 建议需要人工审阅；创作后仍需执行 `canofold check`、构建和实际预览。
- 没有原文、证据不足或来源相互冲突时，应明确说明，不能补造事实或引用。
- Skills 不内置 AI 模型、权限系统或长期记忆服务；模型、工具权限和数据传输由宿主及所用服务决定。

相关内容：[Canofold 的目标与现有能力](/guide/introduction/what-is-canofold/)、[AI 友好输出](/reference/output/ai-output/)、[VS Code 预览](/vscode/)。
