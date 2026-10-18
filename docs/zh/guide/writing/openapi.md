---
title: OpenAPI 接口文档
description: 把本地 OpenAPI 规范接入文档站，让接口参考、搜索和机器正文保持同源
group: 指南
subgroup: 内容创作
order: 27
---

# OpenAPI 接口文档

OpenAPI 是描述 HTTP 接口的标准文件：有哪些地址、接受什么参数、返回什么数据、需要什么认证。后端服务或 API 团队维护这份 JSON/YAML，Canofold 把它编译成文档站里的接口参考页。

例如，一个项目已经有“如何接入”的 Markdown 指南和后端导出的 `openapi.yaml`，就可以让指南继续讲业务流程，让规范生成参数、请求和响应说明。两种内容共同进入站点导航、搜索和 AI 输出，接口变化时不用再手工抄一遍参数表。

这个能力适合 API 使用指南、SDK 文档配套的接口参考，以及团队内部服务手册。只有普通文章或组件文档、没有接口规范时，不需要配置 `sources`。Canofold 读取规范，不扫描后端代码，也不根据一段描述猜测接口；页面不提供在线调用接口或生成 SDK 的功能。

## 接入一个来源

支持本地 OpenAPI 3.0.x、3.1.x 的 JSON/YAML。安装同版的 CLI 与官方适配器，保留普通 Markdown/MDX 首页：

```sh
pnpm add -D canofold@^0.8.0 @canofold/plugins@^0.8.0
```

准备以下文件；已有项目可以直接使用后端导出的规范：

```text
canofold.config.ts
docs/
  index.md
  api/
    openapi.yaml
```

`docs/index.md` 写入普通首页内容，例如 `# Pet API 使用指南`。`docs/api/openapi.yaml` 的最小示例：

```yaml
openapi: 3.1.0
info:
  title: Pet API
  version: '1.0'
paths:
  /pets:
    get:
      summary: 查询宠物列表
      responses:
        '200':
          description: 查询成功
```

在 `canofold.config.ts` 中接入这份文件：

```ts
import { defineConfig } from 'canofold'
import { openapi } from '@canofold/plugins/openapi'

export default defineConfig({
  sources: [openapi({
    id: 'pet-api',
    root: 'docs/api',
    entry: 'docs/api/openapi.yaml',
    version: 'current',
    locale: 'zh',
    base: '/api/'
  })]
})
```

`openapi()` 是构建期来源，不是 Markdown 插件，不能放入 `markdown.plugins`。只有显式配置的来源参与构建。

启动文档站：

```sh
pnpm exec canofold dev
```

以终端输出的本地地址为根地址，打开 `/api/` 可见 Pet API 概览，打开 `/api/get/2f70657473/` 可见 `GET /pets` 接口页。这里 `/pets` 是被描述的后端接口地址，`/api/` 是文档栏目地址，两者用途不同；`servers` 也只作为接口说明展示，不会被当成 Canofold 的开发服务地址。

未手动配置导航时，来源会进入自动生成的导航和侧栏。如果项目已有 `navigation`，在对应语言的数组中增加 `{ text: 'API 参考', link: '/api/' }`。修改规范或本地引用后，开发服务会更新页面；正式构建前执行：

```sh
pnpm exec canofold check
pnpm exec canofold build
```

生成内容位于配置的 `outputDir`（默认 `.canofold/dist`），不往 `docs` 写生成 Markdown。站点主题和搜索沿用项目配置，机器输出随对应的 `ai` 开关生成。

## 来源配置

| 字段 | 含义 |
| --- | --- |
| `id` | 版本/语言内稳定、唯一的小写 kebab-case 来源 ID |
| `root` | 项目相对的本地引用边界目录 |
| `entry` | 项目相对入口文件，必须在 root 内 |
| `version` | 已配置的文档版本 ID；没有 versions 时使用 current |
| `locale` | 已配置的语言；不执行自动翻译 |
| `base` | 语言内路由前缀，以 / 开始并结束，不含站点部署前缀和文档版本前缀 |
| `include.paths` | 可选，精确 API path 数组，不是生成页面地址或通配表达式 |
| `include.tags` | 可选，匹配任意标签；与 paths 同时存在时取交集 |

选择数组不能空、不能重复，没有匹配结果时报错。省略 include 时收录全部 paths operation。每个接口只生成一次，首个 tag 用于分组；无标签的接口也保留入口。

## 页面、身份与原文

接口页包含方法与 path、说明、继承/覆盖后的参数、请求与响应、认证、服务器、弃用状态、示例和引用 schema。复杂组合与递归结构保留原始声明，不伪装成展平后的简单类型，也不生成猜测的返回值。

网址由前缀、小写方法和原始 path 的 UTF-8 十六进制编码组成，每段最多 64 个字符。例如 `GET /pets` 在 `/api/` 下为 `/api/get/2f70657473/`。标题、tags 与 operationId 改名不改变网址。冲突明确失败，不附加扫描顺序后缀。

来源 ID 和接口 method/path 决定派生文档身份；入口文件改名、标题和部署地址不改变身份。文件路径、入口 JSON Pointer 与引用依赖单独记录，供读者追溯。源码面板与 Markdown Mirror 展示明确标记的生成 Markdown，而非原始 JSON/YAML。原始规范及其全部引用不会因此自动复制到公开目录。

## 版本、语言与更新

`info.version` 是被描述 API 的版本，不代替文档版本。需要多语言或历史版本时分别创建来源绑定，可以在不同版本/语言复用同一来源 ID。入口与引用变化会重新计算该来源的派生文档；移除接口或来源会清理其退出产物。

历史绑定的入口和全部本地引用必须位于对应版本 `docsDir` 内，不能借用当前版规范。`canofold snapshot` 可复制版本内输入，但不会猜测或修改来源配置；归档后显式配置历史 entry、root 和 version，再运行检查与构建。流程见[管理文档版本](/guide/site/versions/)。

规范或引用损坏时，构建失败并保留上一份完整输出；修复后恢复，不发布半个来源。初版采用来源级失效，不承诺每次修改只重算一个接口。

## 安全与支持边界

- 只读本地规范及 root 内的引用，拒绝越界、符号链接、缺失目标和带凭据/查询参数的引用，不获取远程规范。URI `$id` 可标识已载入的本地 schema，不授予联网权限。
- 描述、示例和扩展字段仅作为数据，不执行 HTML、MDX、富文本指令或 API 请求。配置与适配器本身仍是可信构建代码，不是任意代码沙箱。
- 支持保留 3.0 nullable、3.1 布尔 schema、组合、递归、锚点与静态引用闭包；不承诺完整 JSON Schema 实例验证或动态引用的运行时求值。自定义 dialect 的声明保留为数据，不推断额外语义。
- Callback/Webhook 声明可保留，但不生成独立接口页。首版不含 Swagger 2.0、OpenAPI 3.2、远程同步、Try-it-out、凭据管理和 SDK 生成。
- 输入上限为单文件 16 MiB、单来源 64 MiB/512 文件；JSON 数据 128 层/100 万节点，YAML 别名展开额度 50。输出最多 10,000 个接口加概览、正文与事实合计 64 MiB，每页引用 schema 表示 16 MiB，API path 最多 1,024 个 UTF-8 字节。超限明确失败，不静默截断。

解析与校验错误在可用时指向实际文件、JSON Pointer 和行列。生成表示的检查诊断不会把生成行号冒充原文件位置。机器表示与 schema 3 迁移见 [AI 友好输出](/reference/output/ai-output/)。
