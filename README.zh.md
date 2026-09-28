---
description: "在可复用的隔离环境中开发 DSH 插件，结合官方源码指导与安装产物验证。"
kind: "package-bundle"
---

# DSH Plugin Crafter（DSH 插件工匠）

[English](README.md) | 中文

## 摘要

开发 DSH 插件时，把开发实例、验收实例和日常实例分开。Plugin Crafter 指导 agent（智能体）查阅匹配版本的官方 API、实现插件并完成验证。共享环境登记让后续会话发现已有部署、复用兼容环境，或记录新增环境的原因。将 bundle 安装到 Web profile 后，选择 Plugin Crafter 即可使用。实际进程和构建由你管理，登记脚本负责记录。

## 目录

- [使用本包](#use-this-package)
- [使用多个环境开发](#multi-environment-development)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与待办工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

准备兼容的 DSH 安装、Node `^22.19` 或 `>=24`，以及登记脚本需要的 Python 3.9+。已验证的 DSH 目标是 `0.1.7-alpha.2`；安装到其他版本前先阅读[兼容性](docs/compatibility.zh.md)。

### 安装到隔离 profile

使用日常 DSH 存储之外的绝对 home 路径。在同一终端执行以下命令，确保安装和启动使用同一个 home：

```sh
export DSH_HOME=/absolute/path/to/crafter-development-home
dsh --profile crafter --from-default-profile web --dump-config
dsh plugin --profile crafter add dsh-plugin-crafter@0.1.0 --registry=https://registry.npmjs.org
dsh --profile crafter --port 3187 --no-open
```

私下打开完整启动 URL，在插件仓库中创建 Session，并选择 **Plugin Crafter**。要求它开发插件、识别目标版本并验证一项可观察的行为。需要检查源码时，提供匹配的官方 checkout。运行模型任务前，在该隔离环境中配置模型路由和所需凭据。

安装会增加 `plugin-crafter` preset、官方 Creator skills，以及三项 Crafter skills，不会自动启用示例。在同一个 home 中运行 `dsh plugin --profile crafter remove dsh-plugin-crafter` 可移除此层。

<a id="multi-environment-development"></a>
### 使用多个环境开发

一个环境记录自己的 home、profile、源码 checkout、插件安装、Host 身份和用途。每个环境可以保留多个用例工作区和 Session ID。登记数据库存放在临时 home 之外，其他对话也能发现这些记录。

为新用例复用已停止且兼容的环境。当验收 Host 必须保持可用、需要比较不兼容的构建，或需要并行运行 Host 时，保留独立环境。每个并行 Host 使用不同的 home 和端口。修改 DSH 所服务代码的构建需要独立 checkout；不同 profile 或端口无法分离共享文件。

按照[多隔离环境开发指南](docs/isolated-development.zh.md)查询、登记、启动、验证并保留两个环境。指南说明哪些内容被隔离、哪些仍会共享，以及如何处理过期记录。

### 选择示例

[示例](examples/README.zh.md)涵盖 Agent 工具、认证 Host 路由，以及带打包 skill 的纯配置 preset。复制适合的模式，再核对所选 DSH 版本的 API。[验证证据](docs/examples-verification.zh.md)区分模型辅助生成、确定性 Host 检查和发布包安装。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

[bundle patch](cordis.patch.yml)从选定源码 checkout 转换官方 Creator 组合，插入独立的 `plugin-crafter` preset。文件系统 skill 加载器从安装后的包中解析本包 skills。[manifest](package.json)声明 `dsh.bundle.patch`；主包没有运行时 JavaScript 或安装脚本。

[验证 skill](skills/dsh-plugin-verification/SKILL.md)选择适用的测试层。[登记参考](skills/dsh-plugin-verification/references/environment-registry.md)负责命令与存储语义。登记脚本记录部署和用例；smoke runner 只拥有自己启动的 Host。登记状态和配置转储都不能证明运行时行为。

preset 来自采用 MIT 许可证的 DeepSeek Harness Creator。登记脚本改编自作者的 `dsh-plugin-isolated-test` 工作流。本项目为独立项目；署名见 [LICENSE](LICENSE)。

[贡献者指南](docs/development.zh.md)负责本地检查和文档配对。除非任务明确涉及独立的 DSH 修改，否则选定的上游 checkout 保持只读。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

- [多隔离环境开发](docs/isolated-development.zh.md)：保留验收实例，同时开发另一份构建。
- [兼容性](docs/compatibility.zh.md)：选择 DSH 目标并重新验证升级。
- [示例](examples/README.zh.md)：可安装的扩展模式及其行为。
- [官方插件发布指南](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md)：当前上游的包规范。

-----

<a id="model-experience"></a>
## 模型体验

间接。bundle 为使用 Plugin Crafter 的 Session 提供官方 Creator skills 和三项 Crafter skills。这些 skills 指导实现、源码检查和验证。bundle 本身不产生工具结果；挂载的 DSH 插件负责模型可见行为。[开发试跑](docs/examples-verification.zh.md)记录了一次受指导的生成过程，不保证无人干预即可成功。

## 已知限制与待办工作

<a id="known-limitations-and-deferred-work"></a>

登记脚本不会配置机器、启动 Host、租用部署，也不会自动检查任务空闲或构建兼容性。两个 agent 修改同一部署前需要协调。独立 home 提供开发隔离，不是操作系统安全沙箱。当前 runner 需要已构建且匹配的 DSH checkout；Windows Host 身份检查尚未验证。模型凭据需要单独配置。测试使用的 DSH 源码含有已有的 LLM 和持久化修改；见[验证范围](docs/examples-verification.zh.md)。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

无。

</details>
