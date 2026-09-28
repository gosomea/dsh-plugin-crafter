# 可安装的 DSH 示例插件

这三个示例针对 DSH `0.1.7-alpha.2`。每个目录都是独立 bundle，包含自己的 `package.json` 和 `cordis.patch.yml`。它们随 Crafter 的 npm 包分发，但安装 Crafter 不会自动启用示例。示例设置了 `private: true`，用于学习、复制和本地安装，不作为单独的 npm 项目发布。

| 示例 | 扩展方式 | 验收行为 |
| --- | --- | --- |
| [greeting-tool](greeting-tool/README.md) | 独立 preset 中的 Agent 工具 | 调用 `crafter_greet` 返回 `Hello, Ada!`，缺少必填参数时拒绝调用 |
| [host-status](host-status/README.md) | Host HTTP 路由 | 已认证 GET 返回配置数据；未认证请求为 401；POST 为 405；注销后路由移除 |
| [release-checklist](release-checklist/README.md) | 纯配置 preset 与打包 Skill | 新 Session 能发现安装包内的 `release-checklist` |

`greeting-tool` 由真实 Plugin Crafter Session 根据需求生成，随后经过代码审查和独立 tarball 验收。另两个示例直接按同一版本的官方文档实现。开发试跑和最终行为验证的边界记录在 [验证记录](../docs/examples-verification.md)。

## 从源码运行

在仓库根目录安装测试依赖并执行 focused checks：

```sh
npm ci --ignore-scripts
npm run check
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests
```

普通安装使用绝对路径，避免相对路径解析到 profile 目录。先确认目标 DSH 版本，再创建独立 home 和 Web profile：

```sh
export DSH_HOME=/absolute/path/to/isolated-home
dsh --profile examples --from-default-profile web --dump-config
dsh plugin --profile examples add link:/absolute/path/to/dsh-plugin-crafter/examples/greeting-tool
dsh plugin --profile examples add link:/absolute/path/to/dsh-plugin-crafter/examples/host-status
dsh plugin --profile examples add link:/absolute/path/to/dsh-plugin-crafter/examples/release-checklist
dsh --profile examples --no-open
```

源码链接的运行依赖需要在示例目录执行 `npm install --ignore-scripts`；验收 tarball 时由 profile 安装器解析依赖。如果需要独立运行 Host 示例的测试，先在 `host-status` 目录执行 `npm ci --ignore-scripts`，再运行 `npm test`。

## 重复隔离验收

需要 Python 3、Node `^22.19` 或 `>=24`、npm，以及已完成构建、版本匹配的 DSH 源码 checkout。脚本只读取该 checkout，不重建其文件。

```sh
npm run smoke:examples -- --dsh-source /absolute/path/to/deepseek-harness
```

脚本先查询环境登记，复用本项目已停止的兼容部署；没有登记时创建临时 `DSH_HOME` 并登记。现有 Host 活跃或端口被占用时会拒绝运行。它为主包和三个示例打包，通过 `dsh plugin add` 安装 tarball，启动自己拥有的隔离 Host，创建工作区绑定的 Sessions，并验证上述行为。工具测试通过临时适配器调用真实工具管线，不消耗模型请求。

完成后停止本次启动的 Host、移除测试适配器，保留 profile、Sessions 和私有报告供复现。使用 `--environment <登记 id>` 可以指定已有部署，`--port <端口>` 可以更换监听端口。不会停止其他进程，也不会修改日常 home。Host 日志中的启动 token 不进入报告或 Git。
