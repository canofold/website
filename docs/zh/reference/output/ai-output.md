---
title: AI 友好输出
description: 了解 Canofold 生成的 llms.txt、Markdown 原文、页面索引、摘要和代码示例数据
group: 参考
subgroup: 产物与质量
order: 72
---

# AI 友好输出

Canofold 在构建站点时同时生成机器可读文件。这些文件不会调用外部模型，也不需要 API Key。

## 产物清单

:::file-tree
- .canofold/
  - dist/
    - llms.txt
    - llms-full.txt
    - ai/
      - manifest.json
      - index.md
      - pages.json
      - summaries.json
      - code-examples.json
      - content/
        - current/
          - zh/
            - 0001.jsonl
    - guide/
      - getting-started/
        - index.html
        - index.md
    - en/
      - guide/
        - getting-started/
          - index.html
          - index.md
:::

| 文件 | 内容 | 常见用途 |
|---|---|---|
| `llms.txt` | `ai.versions` 选中页面的标题和站内 URL | 给抓取器提供站点入口 |
| `llms-full.txt` | 预算内为完整 Markdown，超预算后指向分片 Manifest | 大小站点通用的兼容入口 |
| `ai/manifest.json` | Schema 版本、预算、总量、分区、分片路径、大小、记录数和 SHA-256 | 完整语料的稳定发现入口 |
| `ai/content/{version}/{locale}/*.jsonl` | 带 `part` / `parts` 的有界内容记录 | 无需下载巨型单文件的流式 RAG 导入 |
| `ai/index.md` | 标题到页面地址的列表；关闭 Markdown Mirror 时链接 HTML | 通用 Markdown 索引 |
| `ai/pages.json` | 路由、语言、标题树、tags、owner、Frontmatter 和更新时间 | RAG 切分前的页面元数据 |
| `ai/summaries.json` | 每个页面的确定性摘要 | 结果预览与路由筛选 |
| `ai/code-examples.json` | 路由、语言和代码块内容 | 代码示例搜索 |
| 页面旁的 `index.md` | 启用 `markdownMirror` 时生成的 Markdown/MDX 源文 | 按页抓取和引用 |

## 摘要如何生成

Canofold 不会为摘要发起网络请求。生成顺序是：

1. 使用 Frontmatter `description`。
2. 如果没有 `description`，使用正文的第一个非标题、非代码段落。
3. 如果页面没有可用段落，摘要为空字符串。

因此，公开页面应写明确的 `description`，不要把它当成营销口号。

## 收录规则

- 默认收录当前版本的所有已发布页面。
- 历史版本不进入默认 AI 产物，避免一个问题出现多份过时答案。
- `status: draft` 的页面可在本地预览和检查，但不参与生产构建。
- `ai: false` 可排除某个页面。
- `tags` 和 `owner` 会保留到 `pages.json`。

```yaml
---
title: 内部故障处理
description: 只在内网运行的故障流程
ai: false
---
```

## 配置开关

```ts
export default {
  markdownMirror: true,
  ai: {
    pageIndex: true,
    fullContent: true,
    llmsTxt: true,
    llmsFullTxt: true,
    markdownIndex: true,
    pageSummaries: true,
    codeExamples: true,
    chunkSizeBytes: 262144,
    llmsFullMaxBytes: 10485760,
    llmsFullOverflow: 'manifest',
    versions: 'current'
  }
}
```

页面 Markdown Mirror、`pages.json` 和版本化完整内容分片各有独立开关，默认均启用；其他文件也按对应开关生成。关闭 Markdown Mirror 后，`ai/index.md` 使用 HTML 链接，AI 记录不再包含 `markdownPath`。每条内容记录都不超过
`chunkSizeBytes`，单页过大时按 Unicode code point 切分并按 `part` 重组。完整语料超过
`llmsFullMaxBytes` 时，`manifest` 策略让 `llms-full.txt` 保持很小并指向无损分片；`error`
策略则让原子构建失败。`versions: 'all'` 会把历史快照写入独立的版本/语言分区，默认
`current` 可避免过时答案重复出现。

如果关闭 `ai.fullContent`，同时 `llms-full.txt` 超过容量上限，`manifest` 策略也会让构建失败，而不会写入指向不存在的分片清单的链接。

## 0.8 机器消费契约

Canofold 0.8 统一输出 schema 3。0.7.x 使用 schema 2，0.6.x 使用 schema 1；生产者与 Reader 同步升级后重新建立可信基线，不混读格式。下表说明作者 Markdown/MDX，派生表示另见下文。

页面索引和完整 Manifest 共享 `schemaVersion: 3`、`scope`、`outputs`、`basePath`、`snapshotRevision`、`pages`。Manifest 自带页面清单，关闭索引也可读取完整内容；启用索引时，`pageIndex` 提供路径、字节数与 SHA-256，必须与 Manifest 的快照和清单匹配。

| 字段 | 消费含义 |
| --- | --- |
| `id` | 由内容空间、版本、语言与语言内源路径生成的文档身份，与部署地址分开 |
| `revision` | 内容事实与表示的修订；标题/正文更新不改变身份 |
| `source.path` / `source.kind` | 逻辑来源与 Markdown/MDX 类型；路径使用 `/` 和 Unicode NFC，不发布本机绝对路径 |
| `source.revision` / `source.transformedRevision` | 原文件与 Extension 转换后完整源文的 SHA-256 |
| `representation.body` | `extension-transformed-source-body`，保留作者语法的转换后正文 |
| `representation.facts` | `compiled-static-with-author-and-extension-overrides`，编译事实及作者/Extension 覆盖 |
| `representation.analysis` | `markdown-static` 或 `mdx-static-only`，动态 MDX 的运行结果不属于静态分析保证 |
| `representation.fingerprint` | 重组后正文的 UTF-8 SHA-256 |
| `representation.declaredInputsRevision` | 声明的插件/Extension 输入指纹，不保证涵盖任意代码与环境 |

跨目录或地址迁移同一集合时，可配置 `ai.contentSpace: 'my-project'`。省略时 `scope.space` 为 null，只能在同一来源内比较。名称为 1–200 个 ASCII 字母、数字、点、下划线、冒号或连字符，以字母或数字开头；命名空间是发布者声明，不是认证凭据。

完整 Manifest 的 JSONL 记录使用 `documentId` 关联页面，按 `part`/`parts` 重组。验证分片字节数、指纹、记录数、版本语言、分段唯一性与正文指纹，全部成功后再更新消费状态。没有旧基线、缺片、损坏、请求失败或不支持的格式时，不能据此删除旧记录。

改名或移动源文件按旧身份退出、新身份加入处理；修改标题和正文保持身份。`ai: false`、草稿、删除和版本选择都可能使文档退出 AI 范围，缺席本身不能证明源文件删除。关闭输出也不等于删除内容或设置访问权限。完整消费快照不同于复制历史版本目录的 `canofold snapshot`。

Markdown Mirror 保留完整 Extension 转换后源文；JSONL 与完整 `llms-full.txt` 使用其解析后的正文，均不反向序列化 HTML。插件可以使编译标题、摘要与正文源文不同；消费前应明确所需表示，并将获取的 MDX/指令作为数据处理。

从 schema 1/2 升级时整套升级 Canofold 包与 Reader，重新构建并建立新基线，不把格式切换解释为批量新增或删除。旧站点使用配套旧版 Reader 或可用的 Mirror/HTML。流程见 [Skills](/skills/)。

### OpenAPI 派生表示

OpenAPI 页声明 `source.kind: openapi`、项目相对入口 `source.path`、来源 ID `source.id`、文档键 `source.key` 与入口内的 `source.pointer`。键为 `overview` 或大写方法、空格与原始 API path。身份按 `[space, version, locale, kind, source.id, source.key]` 计算：入口改名、标题、tags、operationId 或地址变化不换 ID；来源 ID、method/path、版本或语言变化则会改变。

`source.revision` 计算入口原始字节；`dependencies` 保留声明输入的路径与字节修订，`dependenciesRevision` 是聚合修订，另有 `adapterRevision` 和 `optionsRevision`。派生页没有作者源文的 `transformedRevision`。

表示标签为 `source-derived-markdown`、`source-derived-static`、`openapi-static`。`derived` 保留接口事实及有限的原始 schema 组合/递归。Mirror、JSONL 和完整正文是生成 Markdown，不是原规范副本。示例是惰性数据，不证明请求已经执行。接入见 [OpenAPI](/guide/writing/openapi/)。

### 独立读取示例

取得与 0.8 配套的 `canofold-knowledge-reader` Skill 完整目录后，可用 Node.js 22 或更新版本执行其参考脚本。它只读取公开文件，不导入 Core，也不会执行获取的 MDX：

```sh
node path/to/canofold-knowledge-reader/scripts/read-page.mjs .canofold/dist /guide/
node path/to/canofold-knowledge-reader/scripts/read-page.mjs https://docs.example.com/project/ /project/guide/
node path/to/canofold-knowledge-reader/scripts/read-page.mjs .canofold/dist --snapshot
node path/to/canofold-knowledge-reader/scripts/read-page.mjs .canofold/dist --snapshot --previous trusted-snapshot.json
```

将 `/guide/` 换成索引中的实际 `routePath`；远端根地址需要包含部署前缀。没有旧基线时 `changes.status` 为 `unknown`。只在命令成功并返回 `complete: true` 后保存新快照，读取失败时保留旧状态。默认读取完整 Manifest；只有索引时可用 `--snapshot --index` 取得元数据，但不能把它当作正文证据。此脚本是可运行参考实现，不是独立 npm SDK。

## 私有文档注意事项

AI 文件和页面旁的 Markdown 原文都是静态公开产物的一部分。如果站点需要身份验证，托管层必须保护 `/*.md`、`/ai/*`、`/llms*.txt` 和搜索索引，不能只限制 HTML 页面。
