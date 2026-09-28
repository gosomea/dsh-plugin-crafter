---
description: "安装并验证 dsh-crafter-example-host-status DSH 示例 bundle。"
kind: "package-bundle"
---

# dsh-crafter-example-host-status

[English](README.md) | 中文

## 摘要

从已认证的 DSH Web Host 读取简短状态响应。将 bundle 加入隔离 Web profile，并请求 `/crafter-example/status`。路由使用 Host 已有的认证策略，返回配置中的 label。它不创建额外服务器或凭据。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与待办工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

目标为 DSH `0.1.7-alpha.2`。在指定 `DSH_HOME` 中使用已准备的隔离 Web profile。从本示例目录执行：

```sh
npm install --ignore-scripts
npm test
dsh plugin --profile examples add link:/absolute/path/to/host-status
```

启动该 profile，私下打开完整启动 URL 完成认证。GET `/crafter-example/status` 返回 `{"plugin":"crafter-example-host-status","label":"Plugin Crafter example"}`。未认证 GET 为 401，认证 POST 为 405。在同一个 home 中执行 `dsh plugin --profile examples remove dsh-crafter-example-host-status` 可移除此层。

| 配置 | 类型 | 默认值 | 行为 |
| --- | --- | --- | --- |
| `label` | string | `Plugin Crafter example` | 路由返回的值 |

在 profile patch 中覆盖完整的 `crafter-example-host-status` 配置以修改 `label`。注册释放后路由移除。controlled HTTP 测试检查配置输出和释放；runner 单独检查真实 DSH 激活。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

[index.js](index.js) 注入 `webServer` 和 `connection`，通过 Cordis effect 返回路由注册的 disposer。处理器先检查 Host 请求拒绝结果，再提供 JSON。[patch](cordis.patch.yml) 插入 Host 行，服务器与凭据仍由 DSH 管理。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

[示例索引](../README.zh.md)说明打包验收，[多环境开发](../../docs/isolated-development.zh.md)说明环境选择。

-----

<a id="model-experience"></a>
## 模型体验

无。包增加 HTTP 路由，不增加模型工具或提示词。已认证的 HTTP 客户端可以读取路由响应。

## 已知限制与待办工作

<a id="known-limitations-and-deferred-work"></a>

这是 Web Host 示例，需要已有的 `webServer` 与 `connection` 服务。它不增加 Client UI，也不声明兼容 desktop 或 headless profile。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

无。

</details>
