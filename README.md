# DSH Plugin Workbench

A local DeepSeek Harness bundle that adds a **Plugin Workbench** agent preset. The preset follows the official Creator (`cordis`) composition for the selected DSH version and adds three focused Skills: plugin development workflow, current DSH source navigation, and isolated verification. It also keeps the official Creator Skills available.

This repository is in development. Its preset is based on the official `0.1.7-alpha.2` Web bundle; see [compatibility](docs/compatibility.md) for the exact commit and validation status.

## Install from this checkout

Use a DSH installation that matches the compatibility record and supports declarative `@deepseek-ai/dsh-agent-preset` rows. Create a separate profile from the shipped Web template, then install the bundle:

```sh
export DSH_HOME=/absolute/path/to/isolated-dsh-home
dsh --profile workbench --from-default-profile web --dump-config
dsh plugin --profile workbench add link:/absolute/path/to/dsh-plugin-workbench
dsh --profile workbench --dump-config
dsh --profile workbench --no-open
```

Create a new session and select **Plugin Workbench**. Ask it to create a tool, Host, or UI plugin; it should establish the target DSH version, inspect the matching APIs, implement the plugin, and use an isolated test profile for real behavior checks. Installing this bundle does not itself install a source checkout or create a model credential.

## Package contents

- `cordis.patch.yml` declares one new preset and loads both official Creator Skills and this package's Skills through `dsh-skill-filesystem`.
- `dsh-plugin-workbench` chooses the DSH extension form and development steps.
- `dsh-upstream-source` ties decisions to the target version's docs, types, and source.
- `dsh-plugin-verification` supplies a portable isolation workflow and an environment registry. It adapts the author's `dsh-plugin-isolated-test` workflow; the packaged instructions do not depend on this monorepo.

The bundle contains no Host JavaScript plugin and adds no network service. Its configuration patch is the installable DSH artifact. It does not overwrite the official `cordis` preset.

## Develop and check

Use Node `^22.19` or `>=24`, which the target DSH checkout supports. The project has no runtime dependencies or install scripts.

```sh
node scripts/sync-official-preset.mjs --check ../../deepseek-harness
node --test scripts/check-package.test.mjs
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest tests/test_environments.py
npm pack --dry-run --json
```

`--check` compares the committed patch to a transform of the selected official Creator preset. To intentionally target a new checkout, run `--write` with that checkout, review the diff, and revalidate on the new DSH Host. See [compatibility](docs/compatibility.md).

This is an independent local Git repository. No GitHub remote or npm package has been published yet.

## Attribution

The preset composition is derived from the MIT-licensed [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Creator preset. The environment registry script and its tests are adapted from the author's `dsh-plugin-isolated-test` Skill. This project is independent of DeepSeek AI.
