# 示例验证记录

验证日期：2026-09-28。目标版本：DSH `0.1.7-alpha.2`。使用 Node `24.19.0`、源码 CLI 和独立 `DSH_HOME`，没有重建或修改 DSH checkout。

源码基线是官方仓库的 [00102833dfaee1da9f48a3a8eae9d34005a75218](https://github.com/deepseek-ai/deepseek-harness/tree/00102833dfaee1da9f48a3a8eae9d34005a75218)。测试 checkout 含有已有的 LLM 和持久化相关修改，不能把本记录等同于干净发布版的完整兼容矩阵；Creator preset、工具注册、Web server、Skill filesystem 和 preset 实现的相关文件未修改。升级 DSH 后需要重验。

## 真实开发试跑

在工作区明确绑定的 `plugin-crafter` Session 中，使用 `deepseek-v4.1-flash` 完成一次真实模型预检，再要求它开发 `greeting-tool`。持久化记录确认模型路由、工作区和 preset，并记录它加载三个 Crafter skills、读取官方规范及查询实际 API。

Agent 产出了 manifest、bundle patch、ESM 插件、纯逻辑模块、README 和八项测试；运行测试及打包后，通过 `plugin_manager install_bundle` 将 tarball 安装进隔离 profile，返回 `application: applied`。该试跑需要中途指导，减少过度调研并选择独立 preset 作为工具作用域。本项目据此更新了主 skill 的开发指导。

入库前修正了依赖版本声明、无关注释和 README 中对子 preset 配置覆盖方式的描述。实际工具调用由下面的独立验收完成。此记录证明受指导的开发、打包和安装链路可行，不声称任意需求都能无人干预完成，也没有把模型自述当作行为验收。

## 打包与真实 Host 验收

执行：

```sh
npm run check
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests
node scripts/sync-official-preset.mjs --check <target-dsh-checkout>
npm run smoke:examples -- --dsh-source <target-dsh-checkout> --environment <registered-test-environment>
```

本地 11 项 Node 检查和 7 项 Python 检查通过。主包 preset 与选定官方文件的转换结果一致。三个主 skills 和示例 Skill 的 frontmatter 通过校验。主包和三个示例分别打包，通过正式 CLI 安装 tarball 后，运行以下验收：

| 对象 | 独立观察 | 结果 |
| --- | --- | --- |
| Crafter 主包 | Host roster 中出现 `plugin-crafter`；新 Session 的 catalog 加载三个包内 skills | 通过 |
| greeting-tool | 在 `crafter-example-greeting` Session 的真实工具管线中调用 `crafter_greet`，canonical value 为 `Hello, Ada!` | 通过 |
| greeting-tool 负向检查 | 同一管线省略必填 `name`，返回工具错误 | 通过 |
| host-status | 认证后的 GET 返回插件标识及配置中的 label；未认证请求为 401；认证 POST 为 405 | 通过 |
| host-status 生命周期 | controlled HTTP 测试中，调用注册 disposer 后路由为 404；配置的 fixture 值准确返回 | 通过 |
| release-checklist | 独立 preset 能创建 Session，catalog 仅含 `release-checklist`，路径来自隔离 profile 中安装的包 | 通过 |
| 工作区与持久化 | Host 关闭并完成持久化后，三个 Session 的 header.cwd 都等于测试工作区 | 通过 |
| 隔离 | 复用登记的专用 home/profile；工作区位于 home 外；日常 home 的 Session 目录数量为 62 → 62 | 通过 |
| 收尾 | 只停止本次测试进程；移除临时适配器；保留 profile 和私有报告供复现 | 通过 |

首次测试发现纯 Skill preset 重复注册 `skills` 服务。修复为消费 Host 已提供的服务后，再次真实创建 Session 和读取 catalog 通过。持久化检查也放在 Host 关闭的完成屏障后，避免把尚未落盘的 header 当作不存在。

确定性 Host 测试不调用模型，使用临时适配器进入真实工具管线；适配器不进入 npm 包。自定义 greeting 前缀由独立逻辑测试覆盖，本轮没有测试配置热更新。三个示例均未贡献 Client UI，因此浏览器渲染测试不适用。GitHub CI 运行不需要模型密钥的包、示例和 registry 检查；源码 Host 测试需单独执行。
