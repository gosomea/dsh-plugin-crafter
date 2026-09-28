---
description: "运行针对性检查，为外部 bundle 维护符合 DSH 风格的配对文档。"
---

# 贡献与文档规范

[English](development.md) | 中文

## 摘要

开发外部 bundle 时不修改选定的上游 checkout。分发前执行包、登记脚本和文档检查。英文与中文页同步维护。在真实隔离环境中验证命令，将每项事实保留在所属页面。

## 目录

- [执行针对性检查](#checks)
- [应用 DSH 文档规范](#standard)
- [维护配对页面](#pairing)
- [开发备注](#dev-note)

-----

<a id="checks"></a>
## 执行针对性检查

在仓库根目录使用 Node `^22.19` 或 `>=24`，以及 Python 3.9+：

```sh
npm ci --ignore-scripts
npm run check
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests
npm run check:docs
npm run doc-sync
npm run pack:check
git diff --check
```

`check:docs` 验证有效文档与被拒绝的无效 fixture（测试前置数据）；`doc-sync` 检查实际配对页面、元数据、段落换行、链接和确认记录。这些是外部仓库的针对性检查，不表示在此执行了上游完整的 `pnpm run test:docs`、`doc-sync` 或 lint 套件。CI 执行这些本地检查。[示例验收](../examples/README.zh.md)还需要已构建的 DSH checkout。

<a id="standard"></a>
## 应用 DSH 文档规范

遵循上游 [docs/AGENTS.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/AGENTS.md)。bundle README 使用 `description` 和 `kind: package-bundle`，包含面向能力的摘要、目录、用户说明、折叠的实现细节、进一步探索、模型体验、已知限制和折叠的开发备注。每段保持一个物理行。英文包摘要不超过 100 词。

根 README 负责能力与安装入口，多环境指南负责开发流程，登记参考负责脚本语义，示例 README 负责各自包行为，兼容性页负责目标版本；验证页与 JSON 负责测得证据。链接到所属页面，不重复其实现细节。

<a id="pairing"></a>
## 维护配对页面

每个用户文档都有同级的 `foo.md`、`foo.zh.md` 与 `foo.i18n.yaml`。两种语言具有同等效力。保持物理行数、标题层级、列表、表格、代码块和链接目标对应。两侧使用稳定的显式锚点。本地配对文档链接切换语言；代码和未配对源码链接保持一致。

审查两种语言含义后，只确认本次编辑的配对：

```sh
node scripts/check-docs.mjs --write README.md docs/isolated-development.md
npm run doc-sync
```

`--write` 将确认过的文本存为 Git blob 并记录 blob hash，不会翻译或认证含义。单侧变更后未重新确认会失败。检查器不能代替语义审查。skills 保留调用元数据，不翻译成可独立调用的重复副本。

-----

<a id="dev-note"></a>
## 开发备注

<details>
<summary>维护者工作上下文——点击展开</summary>

无。

</details>
