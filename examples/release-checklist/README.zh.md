---
description: "安装并验证 dsh-crafter-example-release-checklist DSH 示例 bundle。"
kind: "package-bundle"
---

# dsh-crafter-example-release-checklist

[English](README.md) | 中文

## 摘要

使用 Release Checklist Example 创建 Session，读取打包的发布检查清单。独立 preset 从安装包加载 skill，并提供文件系统工具用于检查。将 bundle 安装到隔离 Web profile。它不执行或发布版本。

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

目标为 DSH `0.1.7-alpha.2`。在已准备的隔离 Web profile 中执行：

```sh
dsh plugin --profile examples add link:/absolute/path/to/release-checklist
```

使用 **Release Checklist Example** 创建 Session，要求它加载 `release-checklist` 并检查 Session 工作区中的包。catalog 仅包含本示例的 skill。在同一个 home 中执行 `dsh plugin --profile examples remove dsh-crafter-example-release-checklist` 可移除此层。

bundle 没有自定义配置字段或构建步骤。skill root 从安装包解析，因此安装 tarball 不需要本源码 checkout。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

[patch](cordis.patch.yml) 声明 preset，消费 Host 已有的 skill 服务，通过文件系统 provider 加载[清单](skills/release-checklist/SKILL.md)。它不贡献 Host JavaScript 或 Client UI，也不重复注册 skill 服务。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

[示例索引](../README.zh.md)说明打包验收，[多环境开发](../../docs/isolated-development.zh.md)说明环境选择。

-----

<a id="model-experience"></a>
## 模型体验

间接。挂载的 skill loader 提供 `release-checklist`；其[说明](skills/release-checklist/SKILL.md)定义模型可见的清单。bundle 本身不产生工具结果。

## 已知限制与待办工作

<a id="known-limitations-and-deferred-work"></a>

最小 preset 具备 skill 和文件系统工具，没有 shell 或发布工具。smoke 检查安装产物中的发现行为，不测试模型对发布的判断。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

无。

</details>
