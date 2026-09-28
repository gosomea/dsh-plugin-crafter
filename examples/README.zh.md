---
description: "选择 Agent 工具、Host 路由或打包 skill bundle，并在隔离 DSH profile 中验证。"
kind: "package-group"
---

# 可安装的插件示例

[English](README.md) | 中文

## 摘要

使用三个示例作为 DSH `0.1.7-alpha.2` 插件的起点。每个目录都是独立的可安装 bundle。Crafter npm 包包含它们的源码，不会自动启用。它们是私有示例包，不是单独发布的 npm 项目。

## 目录

- [选择模式](#choose)
- [执行隔离验收](#run)
- [开发备注](#dev-note)

-----

<a id="choose"></a>
## 选择模式

按照需要增加的行为选择扩展方式。

| 示例 | 扩展 | 可观察行为 |
| --- | --- | --- |
| [greeting-tool](greeting-tool/README.zh.md) | 独立 preset 中的 Agent 工具 | `crafter_greet` 返回 `Hello, Ada!` |
| [host-status](host-status/README.zh.md) | 认证 Host HTTP 路由 | GET 返回配置状态，未授权访问被拒绝 |
| [release-checklist](release-checklist/README.zh.md) | 纯配置 preset 与 skill | 新 Session 发现安装后的 checklist |

[验证证据](../docs/examples-verification.zh.md)记录测得范围，包括受指导的 greeting 生成试跑。各包 README 说明其配置与限制。

<a id="run"></a>
## 执行隔离验收

先用 `npm ci --ignore-scripts` 安装根目录测试依赖。runner 需要 Python 3.9+、Node `^22.19` 或 `>=24`、npm、pnpm，以及已构建且匹配的 DSH checkout。它读取 checkout，不重建它。从仓库根目录运行：

```sh
npm run smoke:examples -- --dsh-source /absolute/path/to/deepseek-harness
```

runner 查询共享登记库，复用本项目兼容且已停止的部署。没有候选时创建并登记隔离 home。使用 `--environment <id>` 时采用该条准确记录。通过 `--port <port>` 选择其他端口，默认值为 3187。活跃部署或被占用的端口会导致拒绝。

runner 打包并安装主包和示例，启动自己的 Host，验证真实工具、路由、skill 与持久化 cwd 行为。`report.json`、tarball 和私有 `host.log` 存放在 `<home>/crafter-smoke/<timestamp>`。它停止自己的 Host、移除临时 probe，并保留 home 与用例，不调用模型。日志可能含启动 token，不能发布。

[多环境指南](../docs/isolated-development.zh.md)说明并行的开发与验收部署。该 runner 每次调用验收一个部署，不协调多个 agent。

-----

<a id="dev-note"></a>
## 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

无。

</details>
