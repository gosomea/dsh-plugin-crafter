---
description: "安装并验证 dsh-crafter-example-greeting DSH 示例 bundle。"
kind: "package-bundle"
---

# dsh-crafter-example-greeting

[English](README.md) | 中文

## 摘要

在使用 Greeting Example 的 Session 中调用 `crafter_greet`，得到问候字符串。工具要求字符串参数 `name`，默认前缀为 `Hello`。将 bundle 安装到隔离 Web profile。工具仅在自己的 preset 中生效，其他 preset 不会获得它。

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

目标为 DSH `0.1.7-alpha.2`。在指定 `DSH_HOME` 中使用已准备的隔离 Web profile。从本示例目录安装源码依赖后再链接：

```sh
npm install --ignore-scripts
npm test
dsh plugin --profile examples add link:/absolute/path/to/greeting-tool
```

为新 Session 选择 **Greeting Example**。使用 `{"name":"Ada"}` 调用 `crafter_greet`，canonical 字符串为 `Hello, Ada!`。省略 `name` 会返回工具错误。在同一个 home 中执行 `dsh plugin --profile examples remove dsh-crafter-example-greeting` 可移除此层。

| 配置 | 类型 | 默认值 | 行为 |
| --- | --- | --- | --- |
| `greeting` | string | `Hello` | 传给 greeting 工具的前缀 |

修改 `greeting` 时，在 profile patch 中覆盖完整的 `preset-crafter-example-greeting` 配置，保留 [cordis.patch.yml](cordis.patch.yml) 中的身份字段和 `plugins` 列表。设置 `greeting-tool` 子项的 `config.greeting`，再创建新 Session。loader 覆盖会替换整行配置；不完整的 preset 声明会丢失必需字段。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

patch 插入一项 `@deepseek-ai/dsh-agent-preset` 声明。其 Agent 插件列表挂载本包工具与官方 persona。[index.js](index.js) 使用指定版本的 `defineTool` API，通过 `tools` 注册；注册绑定到插件 fiber。[greeting.js](greeting.js) 负责纯问候逻辑。bundle 使用普通 ESM，不需要构建。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

[示例索引](../README.zh.md)说明打包验收，[多环境开发](../../docs/isolated-development.zh.md)说明环境选择。

-----

<a id="model-experience"></a>
## 模型体验

通过挂载的工具插件间接提供体验。工具接受必填字符串 `name`，返回 `Hello, Ada!` 等 canonical 字符串。输出 schema 和展示逻辑由 [greeting.js](greeting.js) 定义。

## 已知限制与待办工作

<a id="known-limitations-and-deferred-work"></a>

示例没有 Client UI。针对性测试覆盖配置前缀，实时配置重载未测试。独立 preset 提供该工具和 persona，不提供完整编程工具集。使用其他 DSH 版本前需要重新验证。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

无。

</details>
