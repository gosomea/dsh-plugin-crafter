---
description: "选择已验证的 DSH 版本，并在升级前重新验证 preset 组合。"
---

# 兼容性

[English](compatibility.md) | 中文

## 摘要

使用本包时选择记录中的 DSH 目标。preset 来自该目标的官方 Creator 组合。验证涵盖真实 Host 上的安装后 skills 与示例。使用其他 DSH 版本前需要重新验证。

## 目录

- [已验证目标](#tested-target)
- [验证其他目标](#upgrade)
- [开发备注](#dev-note)

-----

<a id="tested-target"></a>
## 已验证目标

比较其他版本前，先选择记录中的运行时与源码。

| 对象 | 记录的目标 |
| --- | --- |
| DSH Web bundle | `0.1.7-alpha.2` |
| Creator 组合所有者 | 匹配的官方 checkout 中的 `packages/bundle/web-app/presets/cordis.patch.yml` |
| Crafter preset | `plugin-crafter`，显示名为 Plugin Crafter |
| 首个发布包 | `dsh-plugin-crafter@0.1.0` |
| 运行时 | Node `24.19.0`、源码 CLI、隔离 Web profile |

准确源码基线和产物校验值记录在 [verification.json](verification.json)。测试 checkout 含有已有的 LLM 与持久化修改；相关 Creator、tools、Web server、skill filesystem 和 preset 文件未修改。这些证据不构成干净发布版的兼容矩阵。

<a id="upgrade"></a>
## 验证其他目标

候选构建与保留 Host 的构建不同时，使用独立源码 checkout。按照[多隔离环境开发](isolated-development.zh.md)保留原部署。从本仓库比较 preset，或明确重新生成它：

```sh
node scripts/sync-official-preset.mjs --check /absolute/path/to/target-dsh-checkout
node scripts/sync-official-preset.mjs --write /absolute/path/to/target-dsh-checkout
```

`--check` 在已提交 patch 与转换结果不同时失败。`--write` 替换 patch；安装前先审查差异。在选定目标上执行包检查、打包安装、真实 Host 激活和 skill catalog 检查。声明兼容性前记录所得版本和证据。仅配置转储成功不足以证明兼容。

-----

<a id="dev-note"></a>
## 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

无。

</details>
