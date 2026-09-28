# DSH Plugin Crafter（DSH 插件工匠）

A DeepSeek Harness bundle that adds a **Plugin Crafter** agent preset. The preset follows the official Creator (`cordis`) composition for the selected DSH version and adds three focused Skills: plugin development workflow, current DSH source navigation, and isolated verification. It also keeps the official Creator Skills available.

Its preset is based on the official `0.1.7-alpha.2` Web bundle; see [compatibility](docs/compatibility.md) for the exact commit and validation status. DSH is evolving: this package does not claim compatibility with every DSH version.

## 安装与使用

使用兼容的 DSH 版本，在独立 profile 中安装并选择 **Plugin Crafter**：

```sh
export DSH_HOME=/absolute/path/to/isolated-dsh-home
dsh --profile crafter --from-default-profile web --dump-config
dsh plugin --profile crafter add dsh-plugin-crafter
dsh --profile crafter --no-open
```

也可以从公开源码安装：`dsh plugin --profile crafter add github:gosomea/dsh-plugin-crafter`。主包是配置和 skills，不需要运行安装期构建脚本。选择 preset 后，直接描述想开发的插件。Agent 会确认版本、查阅匹配的官方 API、产出可安装的 bundle，并按需执行隔离验证。

例如：创建一个只在专用 preset 中出现的工具、给 Web Host 增加认证路由，或打包一组 skills。可运行代码见 [examples](examples/README.md)，实际测试边界见 [验证记录](docs/examples-verification.md)。

## Install from this checkout

Use a DSH installation that matches the compatibility record and supports declarative `@deepseek-ai/dsh-agent-preset` rows. Create a separate profile from the shipped Web template, then install the bundle:

```sh
export DSH_HOME=/absolute/path/to/isolated-dsh-home
dsh --profile crafter --from-default-profile web --dump-config
dsh plugin --profile crafter add link:/absolute/path/to/dsh-plugin-crafter
dsh --profile crafter --dump-config
dsh --profile crafter --no-open
```

Create a new session and select **Plugin Crafter**. Ask it to create a tool, Host, or UI plugin; it should establish the target DSH version, inspect the matching APIs, implement the plugin, and use an isolated test profile for real behavior checks. Installing this bundle does not itself install a source checkout or create a model credential.

## Package contents

- `cordis.patch.yml` declares one new preset and loads both official Creator Skills and this package's Skills through `dsh-skill-filesystem`.
- `dsh-plugin-crafter` chooses the DSH extension form and development steps.
- `dsh-upstream-source` ties decisions to the target version's docs, types, and source.
- `dsh-plugin-verification` supplies a portable isolation workflow and an environment registry. It adapts the author's `dsh-plugin-isolated-test` workflow; the packaged instructions do not depend on this monorepo.

The bundle contains no Host JavaScript plugin and adds no network service. Its configuration patch is the installable DSH artifact. It does not overwrite the official `cordis` preset.

## Develop and check

Use Node `^22.19` or `>=24`, which the target DSH checkout supports. The main bundle has no runtime dependencies or install scripts. Development checks use Schemastery for the Host example; example packages declare their own runtime dependencies.

```sh
node scripts/sync-official-preset.mjs --check ../../deepseek-harness
npm ci --ignore-scripts
npm run check
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests
npm pack --dry-run --json
```

`--check` compares the committed patch to a transform of the selected official Creator preset. To intentionally target a new checkout, run `--write` with that checkout, review the diff, and revalidate on the new DSH Host. See [compatibility](docs/compatibility.md).

GitHub CI runs package, example, and registry checks without model credentials. Real Host verification runs separately against the recorded DSH version with `npm run smoke:examples -- --dsh-source <checkout>`.

## Attribution

The preset composition is derived from the MIT-licensed [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Creator preset. The environment registry script and its tests are adapted from the author's `dsh-plugin-isolated-test` Skill. This project is independent of DeepSeek AI.
