---
title: 配置搜索
description: 使用内置搜索或 Pagefind 建立多语言索引
group: 指南
subgroup: 站点能力
order: 32
---

# 配置搜索

搜索默认启用，并使用内置 `compact` Provider。小型和中型站点无需额外配置。

## compact 的匹配规则

`compact` 会把拉丁字母和数字按连续单词转为小写 Token；中文按连续汉字生成单字 Token 和相邻二字 Token。例如“组件文档”会生成“组”“件”“文”“档”“组件”“件文”“文档”。查询使用同一规则。

索引会纳入标题、描述、标签、完整正文搜索文本和有限长度的代码示例。排序优先考虑标题中的完整短语和 Token，其次考虑描述、标签和路径；正文命中仍可找到页面，但不会压过更明确的标题命中。结果界面显示页面描述，不会从正文命中位置生成摘要；标题或描述中的完整查询及部分有效 Token 会高亮。这套规则体积小、浏览器端无需额外搜索库，但不提供模糊匹配或命中位置摘要。需要更成熟的分词与大站点分块索引时使用 Pagefind。

## 使用 Pagefind

内容较多时，可以改用 Pagefind。先安装官方插件包和 Pagefind：

:::code-group[包管理器]

```bash title="pnpm"
pnpm add -D @canofold/plugins pagefind
```

```bash title="npm"
npm install --save-dev @canofold/plugins pagefind
```

```bash title="yarn"
yarn add --dev @canofold/plugins pagefind
```

:::

然后配置搜索 Provider：

```ts title="canofold.config.ts"
import { pagefind } from '@canofold/plugins'
import { defineConfig } from 'canofold'

export default defineConfig({
  search: { provider: pagefind() }
})
```

Pagefind 会索引最终 HTML，并按当前语言和版本过滤结果。

## 排除内容

在页面 Frontmatter 中设置 `search: false`，可以排除单个页面：

```yaml
---
search: false
---
```

关闭全站搜索时使用 `search: { enabled: false }`。私有站点应让搜索索引与正文使用相同的访问控制。
