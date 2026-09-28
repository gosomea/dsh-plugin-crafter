---
description: "在可复用的开发与验收环境之间开发、验证同一个 DSH 插件。"
---

# 多隔离环境插件开发

[English](isolated-development.md) | 中文

## 摘要

保留一个开发实例用于修改，另一个验收实例固定到正在测试的安装包。将二者登记在同一个插件项目下，其他对话就能找到它们的 home、进程和用例。新用例优先复用兼容环境。修改文件或启动任务前，先分开不兼容的构建和并行 Host。

## 目录

- [决定隔离哪些内容](#choose-what-to-separate)
- [查找已有环境](#find-existing-environments)
- [准备两个环境](#prepare-two-environments)
- [运行并验证 Host](#run-and-verify-the-hosts)
- [保留与恢复](#retain-and-recover)
- [开发备注](#dev-note)

-----

<a id="choose-what-to-separate"></a>
## 决定隔离哪些内容

环境是已登记的部署，不只是一个端口。用例是该部署中的工作区及可选 Session。多个用例可以复用一个兼容 Host；并行部署需要独立的存储和监听端口。

| 项目 | 控制内容 | 分离规则 |
| --- | --- | --- |
| `DSH_HOME` | Profiles、安装包、凭据和 Session 存储 | 每个独立部署使用不同的绝对 home，不能使用日常 home |
| Profile | home 内的 bundle 依赖和配置 | 记录准确的 profile；同一 home 内换名称不能隔离整个存储 |
| DSH checkout | Host 服务的运行时代码和 Client 构建文件 | 只共享未修改的兼容构建；重建其他 Host 正在服务的代码前，使用另一份 checkout |
| 插件产物 | 链接的源码或安装的 tarball／registry 版本 | 开发使用源码链接，验收使用打包产物；链接到同一份源码仍会共享修改 |
| Host 进程和端口 | 运行中的部署和监听端口 | 并行 Host 使用不同端口；执行生命周期操作前记录 PID 和指纹 |
| 用例工作区和 Session | 任务文件和 Session 记录的 cwd | 工作区放在 home 外；先绑定真实 Session，再验证持久化 cwd |
| 登记数据库 | 跨对话发现与交接 | 共享一个本机登记库；它记录环境，不锁定或配置 Host |

该流程分离开发状态，不提供操作系统安全沙箱，也不阻止插件访问其他已获许可的路径。[登记参考](../skills/dsh-plugin-verification/references/environment-registry.md)负责平台检查、存储和命令语义。

<a id="find-existing-environments"></a>
## 查找已有环境

从本仓库开始，准备已构建且版本匹配的 DSH checkout。登记命令指向本包脚本；安装包用户可以使用安装目录中的同一脚本。示例使用默认持久化数据库，不把数据库放进临时环境。

```sh
CRAFTER_PROJECT=$(pwd -P)
CRAFTER_DSH_SOURCE=/absolute/path/to/deepseek-harness
CRAFTER_REGISTRY="$CRAFTER_PROJECT/skills/dsh-plugin-verification/scripts/environments.py"
python3 "$CRAFTER_REGISTRY" list --project "$CRAFTER_PROJECT"
```

对候选 ID 先执行 `show` 和 `check`，再修改部署。读取 JSON 中的结论：命令退出 0 仅表示检查完成。任务空闲、安装产物、模型路由和所服务构建需要另行确认。已停止的兼容 Host 可以在原 home 中重启；新用例不构成新增部署的理由。

下面的双环境教程有意分开源码开发与产物验收。其他用途应先检查记录，再提供实际的分离原因。

<a id="prepare-two-environments"></a>
## 准备两个环境

以下源码 CLI（命令行界面）读取选定的已构建 checkout，不重建它。在同一个终端执行准备步骤，并保留变量值供后续使用：

```sh
node --version
python3 --version
npm ci --ignore-scripts
CRAFTER_LAB=$(mktemp -d "${TMPDIR:-/tmp}/crafter-lab.XXXXXX")
CRAFTER_RUN=$(date +%s)
CRAFTER_DEV_ID="crafter-dev-$CRAFTER_RUN"
CRAFTER_ACCEPT_ID="crafter-accept-$CRAFTER_RUN"
mkdir -p "$CRAFTER_LAB/dev-home" "$CRAFTER_LAB/accept-home" "$CRAFTER_LAB/dev-case" "$CRAFTER_LAB/accept-case"
dsh() { (cd "$CRAFTER_DSH_SOURCE" && pnpm dsh "$@"); }
python3 "$CRAFTER_REGISTRY" register "$CRAFTER_DEV_ID"   --project "$CRAFTER_PROJECT" --source "$CRAFTER_DSH_SOURCE" --plugin "$CRAFTER_PROJECT"   --home "$CRAFTER_LAB/dev-home" --profile crafter-dev --purpose 'Linked-source development'   --reason 'Keep source development separate from retained artifact acceptance'
python3 "$CRAFTER_REGISTRY" register "$CRAFTER_ACCEPT_ID"   --project "$CRAFTER_PROJECT" --source "$CRAFTER_DSH_SOURCE" --plugin "$CRAFTER_PROJECT"   --home "$CRAFTER_LAB/accept-home" --profile crafter-accept --purpose 'Packed-artifact acceptance'   --reason 'Run acceptance independently while the development Host remains available'
DSH_HOME="$CRAFTER_LAB/dev-home" dsh --profile crafter-dev --from-default-profile web --dump-config
DSH_HOME="$CRAFTER_LAB/dev-home" dsh plugin --profile crafter-dev add "link:$CRAFTER_PROJECT"
npm pack --json --pack-destination "$CRAFTER_LAB" > "$CRAFTER_LAB/pack.json"
CRAFTER_TARBALL="$CRAFTER_LAB/$(node -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1]))[0].filename' "$CRAFTER_LAB/pack.json")"
DSH_HOME="$CRAFTER_LAB/accept-home" dsh --profile crafter-accept --from-default-profile web --dump-config
DSH_HOME="$CRAFTER_LAB/accept-home" dsh plugin --profile crafter-accept add "$CRAFTER_TARBALL"
```

检查每个 home/profile 的 manifest 和配置转储，确认包含 Crafter 依赖及 preset。这证明安装与组合，不证明激活。两个环境可以读取这份未修改的 DSH 构建。重建 DSH 或 Client 前，先使用独立 checkout 并更新该环境的 `--source`；修改其他链接环境使用的插件前，先使用另一份插件 checkout 或固定产物。

<a id="run-and-verify-the-hosts"></a>
## 运行并验证 Host

在两个终端中准备上述变量值和 `dsh` 函数。每个 Host 保持前台运行，stdin 必须保持打开。若 3187 或 3188 被占用，选择空闲端口，不替换占用端口的进程。

```sh
# Development terminal
DSH_HOME="$CRAFTER_LAB/dev-home" dsh --profile crafter-dev --port 3187 --no-open
```

```sh
# Acceptance terminal
DSH_HOME="$CRAFTER_LAB/accept-home" dsh --profile crafter-accept --port 3188 --no-open
```

在准备终端获取每个真实监听进程的 PID，并进行登记。只有每次查询恰好返回一个 PID 时才能继续。登记脚本比较进程身份、home、profile、源码 cwd 和端口；无法读取的字段保持 `unknown`。

```sh
CRAFTER_DEV_PID=$(lsof -nP -iTCP:3187 -sTCP:LISTEN -t)
CRAFTER_ACCEPT_PID=$(lsof -nP -iTCP:3188 -sTCP:LISTEN -t)
python3 "$CRAFTER_REGISTRY" update "$CRAFTER_DEV_ID" --pid "$CRAFTER_DEV_PID" --url http://127.0.0.1:3187
python3 "$CRAFTER_REGISTRY" update "$CRAFTER_ACCEPT_ID" --pid "$CRAFTER_ACCEPT_PID" --url http://127.0.0.1:3188
python3 "$CRAFTER_REGISTRY" check "$CRAFTER_DEV_ID"
python3 "$CRAFTER_REGISTRY" check "$CRAFTER_ACCEPT_ID"
```

私下打开每个完整启动 URL。在开发 Host 的 `dev-case` 中创建 Plugin Crafter Session，在验收 Host 的 `accept-case` 中再创建一个。使用 `bind --case <id> --workspace <absolute-path> --session <session-id> --purpose <purpose>` 记录返回的 Session ID；`bind` 只登记已有 Session，不创建它。运行模型任务前验证 Session cwd。将真实工具结果、路由响应或 skill catalog 与预期行为比较。

需要可重复的示例验收时，先停止选定的测试 Host，再针对其登记 ID 运行打包 runner。runner 会拒绝活跃部署或被占用的端口。它安装重新打包的主包与示例，因此验证的是当前源码产物，不会保留之前固定的验收版本。

```sh
npm run smoke:examples -- --dsh-source "$CRAFTER_DSH_SOURCE" --environment "$CRAFTER_ACCEPT_ID" --port 3188
```

<a id="retain-and-recover"></a>
## 保留与恢复

任务完成后，在教程 Host 所属终端按 Ctrl+C 停止它。确认只有该进程停止。需要用户验收时，保留 home、用例、Session ID 和私有报告。记录下一步和保留原因，不记录凭据或启动 token：

```sh
python3 "$CRAFTER_REGISTRY" update "$CRAFTER_DEV_ID" --state retained --note 'Development Host stopped; reuse for the next compatible case'
python3 "$CRAFTER_REGISTRY" update "$CRAFTER_ACCEPT_ID" --state retained --note 'Acceptance complete; retain the installed artifact and Sessions for review'
python3 "$CRAFTER_REGISTRY" list --project "$CRAFTER_PROJECT"
```

`active`、`retained` 和 `retired` 是登记状态，不是实时进程状态。临时目录消失时保留旧记录，确认无法继续使用后，将其标记为 `retired`，再登记替代环境。过期 PID、变化的指纹或未知身份不能作为停止进程的依据。并行 agent 修改同一部署前需要协调；SQLite 串行化的是记录操作，不是 Host 操作。

-----

<a id="dev-note"></a>
## 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

无。

</details>
