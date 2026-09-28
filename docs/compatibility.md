---
description: "Choose a tested DSH version and revalidate preset composition before upgrading."
---

# Compatibility

English | [中文](compatibility.zh.md)

## Summary

Use this package with the recorded DSH target. The preset derives from that target’s official Creator composition. Verification covers installed skills and examples on a real Host. Revalidate a different DSH version before using the package there.

## Table of Contents

- [Tested target](#tested-target)
- [Validate another target](#upgrade)
- [Dev Note](#dev-note)

-----

<a id="tested-target"></a>
## Tested target

Choose the recorded runtime and source before comparing another version.

| Subject | Recorded target |
| --- | --- |
| DSH Web bundle | `0.1.7-alpha.2` |
| Creator composition owner | `packages/bundle/web-app/presets/cordis.patch.yml` in the matching official checkout |
| Crafter preset | `plugin-crafter`, displayed as Plugin Crafter |
| Initial published package | `dsh-plugin-crafter@0.1.0` |
| Runtime | Node `24.19.0`, source CLI, isolated Web profile |

The exact source baseline and artifact integrity are recorded in [verification.json](verification.json). The tested checkout has pre-existing LLM and persistence changes; the relevant Creator, tools, Web server, skill filesystem, and preset files were unchanged. This evidence does not establish a clean-release compatibility matrix.

<a id="upgrade"></a>
## Validate another target

Use a separate source checkout when the candidate build differs from a retained Host. Follow [multi-environment development](isolated-development.md) to preserve the existing deployment. From this repository, compare or intentionally regenerate the preset:

```sh
node scripts/sync-official-preset.mjs --check /absolute/path/to/target-dsh-checkout
node scripts/sync-official-preset.mjs --write /absolute/path/to/target-dsh-checkout
```

`--check` fails if the committed patch differs from the transform. `--write` replaces that patch; review the diff before installing it. Run package checks, packed installation, actual Host activation, and skill-catalog checks on the chosen target. Record the resulting version and evidence before declaring compatibility. A working config dump alone is insufficient.

-----

<a id="dev-note"></a>
## Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
