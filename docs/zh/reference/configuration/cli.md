---
title: CLI 命令参考
description: 查看 Canofold 各命令的输入、输出与失败条件
group: 参考
subgroup: 配置与命令
order: 53
---

# CLI 命令参考

本页用裸 `canofold` 表示命令签名。项目脚本可直接使用这个写法；临时执行本地依赖时在前面加 `pnpm exec`。安装方式见[安装](/guide/introduction/installation/)。

```bash
canofold --help
```

除 `init` 外，命令从当前工作目录加载配置；支持 `canofold.config.ts`、`.mts`、`.cts`、`.js`、`.mjs` 和 `.cjs`。`init` 在目标目录创建或读取配置，`--help` 不加载项目配置。

| 命令 | 用途 | 默认输出 |
|---|---|---|
| `canofold init [dir] [options]` | 创建文档或接入已有内容 | 内容目录、`canofold.config.ts` |
| `canofold dev [--port]` | 启动本地开发服务 | `http://127.0.0.1:3333/` |
| `canofold check` | 输出内容质量问题 | 终端报告 |
| `canofold build [--no-cache]` | 生成静态站点 | `.canofold/dist` |
| `canofold clean` | 删除生成产物和构建状态 | — |
| `canofold preview [--port]` | 预览已构建产物 | 本地 HTTP 服务 |
| `canofold snapshot <id>` | 复制当前文档供历史版本维护 | `versions/<id>/` |
| `canofold deploy` | 生成托管平台配置示例 | `.canofold/deploy` |

## `canofold init [dir] [options]`

```bash
canofold init
canofold init my-docs
canofold init --locale en
canofold init --locale zh --locales zh,en
canofold init --locale zh --docs-dir handbook
```

- 不传 `dir` 时，在当前目录创建文档文件。
- 传入 `dir` 时，在子目录中创建独立项目。
- 全新项目默认创建中文单语言内容，直接位于 `docs/`，不创建 `zh/` 或 `en/`。
- 已有 Markdown/MDX 时原地接入，只补充缺失的配置与 `canofold-env.d.ts`，不移动、覆盖或自动补写内容。
- 已有配置时以配置为准，只补齐缺少的初始化文件；没有文件需要补齐时不做修改。

| 选项 | 说明 |
|---|---|
| `--locale <locale>` | 设置默认语言；单语言项目只需要该选项 |
| `--locales <locale,...>` | 设置全部语言；未传 `--locale` 时第一项为默认语言 |
| `--docs-dir <path>` | 使用项目内的其他相对内容目录 |

单语言不使用 locale 目录。多语言时默认语言仍位于内容目录根部，只有非默认语言使用 `{docsDir}/{locale}/`。中文和英文 locale（包括 `zh-CN`、`en-US` 等区域变体）按基础语言复用本地化示例；其他语言生成语言中性的最小首页。

已有内容但没有配置或语言参数时，交互式终端会询问 locale。脚本和 CI 不会猜测语言，而是停止并要求传入 `--locale` 或 `--locales`。绝对 `docsDir`、项目外路径、重复 locale、无效 locale，以及与现有配置冲突的参数都会在写入前失败。

## `canofold dev [--port <number>]`

```bash
canofold dev
canofold dev --port 3334
```

`--port` 与 `preview` 使用同一校验规则，必须是 1–65535 之间的整数。开发服务默认从 3333 开始；占用时依次尝试后续端口，直到 65535，并打印包含 `basePath` 的实际地址；其他监听错误立即报错。不会停止原来占用端口的服务。

同一项目只运行一个 dev 会话。启动时在读取配置和首次构建前检查会话；项目目录的符号链接也按同一项目识别。重复启动会明确报错并退出，不构建、不另开端口。正常关闭会释放会话，进程异常退出后下一次启动可自动恢复；不同项目的端口占用仍按上述规则顺延。

启动时先构建一次，然后监听项目输入。监听范围覆盖配置的内容目录、本地样式、组件、Extension，以及六种受支持的配置文件；自动排除 `.git`、`node_modules`、`.canofold`、构建输出和临时交换目录。

单篇 Markdown/MDX 且导航元数据未改变时，开发服务可做单页重建；配置、新增文件或导航结构变化会回退到完整构建。

重建成功只打印简短状态；输入未变化的缓存构建不重复输出统计，也不刷新浏览器。缓存原因、体积和产物路径保存在 `.canofold/cache/build-report.json`。交互终端用颜色区分状态，重定向或设置 `NO_COLOR` 时保持纯文本；构建错误仍会明确显示，且保留上次成功产物。

## `canofold check`

```bash
canofold check
canofold check --json
```

`--json` 输出带规则 ID、位置和建议的 `diagnostics`，以及按版本/语言统计的 `translationCoverage` 和逐页 `translationStatus`。有可确认的错误时命令以非零状态退出，适合 CI 使用。

报告格式：

```txt
WARNING [frontmatter-description]: docs/guide/install.md Frontmatter description is missing
ERROR [broken-link]: docs/guide/install.md:12:1 Link target does not exist: /reference/missing/
```

检查内容包括：

- 代码块是否声明语言。
- `title` 和 `description` 是否缺失。
- 内部链接与相对图片是否存在。
- 同页标题是否重复。
- 各语言是否存在对应文件。

`check` 同时检查草稿，但发布构建不会收录草稿。JSON 报告包含 `schemaVersion: 1`、`diagnostics`、`translationCoverage` 和 `translationStatus`；每条诊断包含能够确定时的行列。配置错误、缺少已发布首页等导致内容图无法建立时，命令会报错退出，不会生成 JSON 报告。可用 `checks.rules` 对单条规则设置 `off`、`warning` 或 `error`；只要最终诊断有 `error`，命令就以非零状态退出。

内容分析会执行编译插件，但不渲染完整页面或运行浏览器脚本。MDX 组件执行、Demo 和扩展生成文件仍需通过生产构建验证；发布前应先运行 `check`，再运行 `build`。

## `canofold build [--no-cache]`

```bash
canofold build
canofold build --no-cache
```

下列问题会使命令失败：

- `canofold.config.ts` 无法加载或不符合配置 schema。
- `requiredVersion` 与当前 Canofold 版本不匹配。
- Markdown、MDX 或本地 React 组件编译失败。
- 路由、输出文件、顶部导航或分组元数据冲突。
- 版本、重定向或语言配置不成立。

Canofold 在 `.canofold/cache` 保存版本化 Manifest。缓存命中前会同时校验输入和生成文件；
安全时只重建失效页面，Manifest 损坏、版本不兼容或输出被修改时自动回退为完整构建。
所有构建都通过临时目录原子替换 `outputDir`，失败时保留上一次成功产物。

使用 `--no-cache` 可以强制完整构建，并写入新的 Manifest。

每次成功构建还会输出终端摘要，并在 `.canofold/cache/build-report.json` 写入机器可读的[构建报告](/reference/output/build-artifacts/)。报告位于部署目录之外，可用于核对实际生成、缺失和移除的文件。

## `canofold clean`

```bash
canofold clean
```

`clean` 删除配置的 `outputDir` 和持久构建 Manifest。它与 `build` 使用相同的路径安全校验和
构建锁，输入目录与输出目录重叠时会拒绝删除。

## `canofold preview [--port <number>]`

```bash
canofold preview
canofold preview --port 4174
```

`--port` 必须是 1–65535 之间的整数。默认从 4173 开始，端口占用时采用与 `dev` 相同的顺延规则，并打印实际地址。命令只服务 `outputDir`，不监听源文件。

## `canofold snapshot <id>`

```bash
canofold check
canofold snapshot v1
```

复制当前文档到 `versions/v1/`，不修改配置或覆盖目标。配置版本时，以数组第一项为当前文档；未配置时使用 `docsDir`。复制后将历史项追加到 `versions` 数组，保留主版本在第一项；详见[版本管理](/guide/site/versions/)。

`v1` 是快照名称，不会触发 Git 回溯，须在改写文档前执行。草稿、符号链接、版本目录外的 MDX/Demo 依赖等不安全情况会报错；快照不冻结整个项目的构建环境。

## `canofold deploy`

```bash
canofold build
canofold deploy
```

没有构建产物时 `deploy` 会失败。它生成 GitHub Pages、Cloudflare Pages、Vercel、Netlify 和 Nginx 的配置示例，但不执行登录、上传或发布。
