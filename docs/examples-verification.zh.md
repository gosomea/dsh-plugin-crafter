---
description: "检查模型辅助生成、Host 验收与发布包安装的范围和限制。"
---

# 验证证据

[English](examples-verification.md) | 中文

## 摘要

记录中的检查针对 DSH `0.1.7-alpha.2`，验证三个可安装示例 bundle 与 Crafter preset。一次受指导的模型 Session 生成了 greeting 示例。确定性 Host 测试独立检查它和其他示例的行为。npm 发布包安装另行验证。以下证据明确这些观察的限制。

## 目录

- [范围](#scope)
- [独立观察](#observations)
- [复现 Host 检查](#reproduce)
- [开发备注](#dev-note)

-----

<a id="scope"></a>
## 范围

[机器可读记录](verification.json)负责日期、基线、包校验值和测得结果。[兼容性](compatibility.zh.md)负责当前 DSH 目标。本项目未修改目标 checkout，但其中含有已有的 LLM 与持久化编辑。相关 preset、tool、Web server 和 skill 加载文件与记录基线一致。

真实 Plugin Crafter Session 使用 `deepseek-v4.1-flash`，加载三项 Crafter skills、检查官方 API，并产出带测试的 greeting bundle。它的 `plugin_manager install_bundle` 操作返回 `application: applied`。试跑需要 steering（中途引导）和代码审查。它证明受指导的生成、打包与安装可行，不保证无人干预完成，也不把模型自述当作验收。

<a id="observations"></a>
## 独立观察

这些观察来自记录目标上的独立包检查与 Host 检查。

| 对象 | 观察 |
| --- | --- |
| Crafter | Host 列出 `plugin-crafter`；真实 Session 加载三项打包 skills 和官方 Creator skills |
| Greeting | 真实工具管线返回 `Hello, Ada!`；缺少必填 `name` 时返回错误 |
| Host status | 认证 GET 返回配置 JSON；未认证 GET 为 401；认证 POST 为 405 |
| 路由生命周期 | controlled HTTP 测试在注册释放后观察到 404 |
| Checklist | 独立 preset 仅提供安装后的 `release-checklist` skill |
| Session 存储 | Host 关闭后，每个持久化 Session header 都记录独立的用例工作区 |
| npm 发布包 | 官方 registry 安装成功；校验值与已测试 Release 产物一致 |

runner 使用临时认证适配器，无需模型密钥即可调用真实工具管线。验证后移除适配器，不随包分发。runner 只停止自己的子 Host，并私下保留报告。原始 smoke 比较了日常 Session 目录数量，前后均为 62。这是测得的观察，不是普遍的并发保证。

双环境文档试跑执行了指南的准备与启动命令，分别运行源码链接的开发 Host 和 tarball 验收 Host。二者同时运行且身份核验通过。停止开发实例后，验收实例仍能响应；各自持久化 Session 与 cwd，未出现跨 home 的 Session 泄漏。试跑后停止两个自有 Host 并保留记录。本次使用工作树中的文档产物，不是新的 npm 发布版。

<a id="reproduce"></a>
## 复现 Host 检查

从已安装依赖的本仓库开始，准备已构建且匹配的 DSH checkout：

```sh
npm run smoke:examples -- --dsh-source /absolute/path/to/deepseek-harness
```

指定登记部署时，增加 `--environment <id>` 及未被占用的 `--port <port>`。[示例索引](../examples/README.zh.md)负责 runner 前提与输出。[多环境指南](isolated-development.zh.md)负责环境选择与保留。

当前示例没有贡献 Client UI，因此不适用浏览器渲染检查。自定义 greeting 前缀有逻辑测试覆盖，实时配置重载未测试。CI 无需模型凭据；真实模型任务与源码 Host 测试独立执行。修改 DSH、preset 或分发产物后需要重新验证。

-----

<a id="dev-note"></a>
## 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

无。

</details>
