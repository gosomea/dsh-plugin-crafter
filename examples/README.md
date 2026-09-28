---
description: "Choose an Agent tool, Host route, or packaged-skill bundle and verify it in an isolated DSH profile."
kind: "package-group"
---

# Installable plugin examples

English | [中文](README.zh.md)

## Summary

Use these three examples as starting points for a DSH `0.1.7-alpha.2` plugin. Each directory is an independent installable bundle. The Crafter npm package includes their source without enabling them automatically. They are private example packages, not separately published npm projects.

## Table of Contents

- [Choose a pattern](#choose)
- [Run isolated acceptance](#run)
- [Dev Note](#dev-note)

-----

<a id="choose"></a>
## Choose a pattern

Choose the extension that matches the behavior you need to add.

| Example | Extension | Observable behavior |
| --- | --- | --- |
| [greeting-tool](greeting-tool/README.md) | Agent tool in a dedicated preset | `crafter_greet` returns `Hello, Ada!` |
| [host-status](host-status/README.md) | Authenticated Host HTTP route | GET returns configured status; unauthorized access is rejected |
| [release-checklist](release-checklist/README.md) | Configuration-only preset and skill | A new Session discovers its installed checklist |

See [verification evidence](../docs/examples-verification.md) for measured scope, including the guided greeting generation trial. Read each package README for its configuration and limitations.

<a id="run"></a>
## Run isolated acceptance

Install root test dependencies with `npm ci --ignore-scripts`. The runner requires Python 3.9+, Node `^22.19` or `>=24`, npm, pnpm, and a built matching DSH checkout. It reads that checkout without rebuilding it. From the repository root:

```sh
npm run smoke:examples -- --dsh-source /absolute/path/to/deepseek-harness
```

The runner queries the shared registry and reuses a compatible stopped deployment for this project. Without a candidate, it creates and registers an isolated home. With `--environment <id>`, it uses that exact record. Choose another port with `--port <port>`; the default is 3187. An active deployment or occupied port causes rejection.

The runner packs and installs the main and example bundles, starts its own Host, and verifies real tool, route, skill, and persisted cwd behavior. It stores `report.json`, tarballs, and a private `host.log` under `<home>/crafter-smoke/<timestamp>`. It stops its own Host and removes the temporary probe, retaining the home and cases. It does not call a model. The log may contain a startup token; never publish it.

The [multi-environment guide](../docs/isolated-development.md) explains concurrent development and acceptance deployments. This runner performs one deployment's acceptance per invocation; it does not coordinate multiple agents.

-----

<a id="dev-note"></a>
## Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
