---
title: 安全边界
description: 了解 Canofold 对 Markdown、MDX、外部服务、密钥和私有站点的安全假设
group: 参考
subgroup: 产物与质量
order: 74
---

# 安全边界

Canofold 在构建期执行仓库配置、扩展、MDX 和本地 TSX。构建必须只运行可信仓库内容。扩展路径和输出约束用于保护构建不变量，并不会隔离扩展代码或它导入的依赖。

## 内容信任级别

| 内容 | 建议 |
|---|---|
| 仓库内审核过的 Markdown | 保留默认 `sanitize`；确实需要原始 HTML 时再显式启用 `trusted` |
| 外部同步 Markdown | 保留 `sanitize`；不需要作者 HTML 时使用 `strip` |
| MDX 与本地 React 组件 | 仅可信内容；它们会执行代码 |
| 项目本地扩展 | 仅加载经过审核的模块并固定依赖；扩展拥有构建进程权限 |
| 外部 PR | 不在持有生产密钥的环境直接运行未审核构建 |

## 密钥

- 不要把密钥写入 Markdown、MDX、`canofold.config.ts` 浏览器字段或 `docs/public/`。

## 私有托管

Canofold 不提供 SSO/RBAC。身份层必须保护整个静态站点，包括 Markdown 原文、搜索、AI 文件、资源和重定向页面。

`seo.robots: 'disallow'` 只能请求遵守规范的爬虫不要抓取，不能阻止访问、下载或索引泄漏。它不能替代登录、网关策略或私有对象存储权限。

## HTML 与链接

`sanitize` 会删除脚本、事件属性和危险 URL，但不是 JavaScript 沙箱。外部链接、iframe、PlantUML 服务和 Mermaid 模块仍应通过 CSP、域名白名单和托管策略约束。

从 0.5.0 起，`mermaid()` 使用项目安装的 Mermaid 及其锁定依赖构建本地运行时，不发起远程模块请求。请审计站点自身的生产依赖，更新依赖后重新构建并部署，浏览器产物才会使用新版本。

`mermaid({ moduleUrl })` 可显式覆盖为自托管模块或 CDN；该模块会在读者的浏览器中执行，只应使用可信来源，并在 CSP 中放行所需域名。`kroki({ server })` 和 `plantUml({ server })` 会把图示源码发送到配置的服务；省略 `server` 时源码留在本地。只连接可信、受控的地址，避免发送敏感内容。宿主 renderer 使用可回收的 `blob:` 图片 URL，因此 CSP 需要在 `img-src` 中允许 `blob:`。
