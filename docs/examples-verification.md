---
description: "Inspect the scope and limitations of model-assisted generation, Host checks, and published installation."
---

# Verification evidence

English | [中文](examples-verification.zh.md)

## Summary

The recorded checks validate three installable example bundles and the Crafter preset against DSH `0.1.7-alpha.2`. One guided model Session generated the greeting example. Deterministic Host tests independently checked its behavior and the other examples. Published npm installation was verified separately. The evidence below names the limits of those observations.

## Table of Contents

- [Scope](#scope)
- [Independent observations](#observations)
- [Reproduce the Host checks](#reproduce)
- [Dev Note](#dev-note)

-----

<a id="scope"></a>
## Scope

The [machine-readable record](verification.json) owns the date, baseline, package integrity, and measured outcomes. [Compatibility](compatibility.md) owns the current DSH target. The target checkout remains unmodified by this project but includes existing LLM and persistence edits. Relevant preset, tool, Web server, and skill-loading files match the recorded baseline.

A real Plugin Crafter Session used `deepseek-v4.1-flash`, loaded the three Crafter skills, inspected official APIs, and produced the greeting bundle with tests. Its `plugin_manager install_bundle` operation returned `application: applied`. The run required steering and code review. It demonstrates guided generation, packaging, and installation; it does not guarantee unattended completion or count model self-report as acceptance.

<a id="observations"></a>
## Independent observations

These observations come from independent package and Host checks on the recorded target.

| Subject | Observation |
| --- | --- |
| Crafter | Host lists `plugin-crafter`; a real Session loads all three packaged skills and official Creator skills |
| Greeting | Real tool pipeline returns `Hello, Ada!`; missing required `name` returns an error |
| Host status | Authenticated GET returns configured JSON; unauthenticated GET is 401; authenticated POST is 405 |
| Route lifecycle | The controlled HTTP test observes 404 after registration disposal |
| Checklist | The dedicated preset exposes only its installed `release-checklist` skill |
| Session storage | After Host shutdown, each persisted Session header records its separate case workspace |
| Published npm package | Official registry installation succeeds; integrity matches the tested Release artifact |

The runner uses a temporary authenticated adapter to call the real tool pipeline without a model key. The adapter is removed after verification and is not distributed. The runner stops only its own child Host and retains reports privately. The original smoke compared the daily Session directory count before and after; it remained 62. This is a measured observation, not a universal concurrency guarantee.

The two-environment documentation trial ran the guide’s setup and launch commands with one source-linked development Host and one tarball acceptance Host. Both ran concurrently with verified identities. Stopping development left acceptance responsive; both persisted their own Session and cwd without cross-home Session leakage. Both owned Hosts stopped afterward and their records were retained. This trial used the working-tree documentation artifact, not a new npm release.

<a id="reproduce"></a>
## Reproduce the Host checks

From this repository with dependencies installed and a built matching DSH checkout:

```sh
npm run smoke:examples -- --dsh-source /absolute/path/to/deepseek-harness
```

For an explicit registered deployment, add `--environment <id>` and its unused `--port <port>`. [The example index](../examples/README.md) owns runner prerequisites and outputs. [The multi-environment guide](isolated-development.md) owns environment selection and preservation.

The current examples contribute no Client UI, so browser rendering checks do not apply. Configured greeting prefixes have logic-test coverage; live config reload is untested. CI runs checks without model credentials; real model tasks and source Host tests remain separate. Revalidate after changing DSH, the preset, or the distributed artifact.

-----

<a id="dev-note"></a>
## Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>
